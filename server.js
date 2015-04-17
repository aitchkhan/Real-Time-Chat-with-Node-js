/**
 * Created by aitchkhan on 4/14/2015.
 */
var mongo = require('mongodb').MongoClient,
    client = require('socket.io').listen(8080).sockets;


mongo.connect('mongodb://127.0.0.1/chat', function (err, db) {
    if(err) throw err;

    console.log('server listening on port 80');

    client.on('connection', function (socket) {

        var col = db.collection('messages');

        sendStatus = function (string) {
            socket.emit('status', string);
        };
        // Emit all messages
        col.find().limit(100).sort({_id: 1}).toArray(function (err, data) {
            if(err) throw err;
            socket.emit('output', data);
        });

        socket.on('input', function (data) {

           var name = data.name,
               message= data.message,
               whiteSpacePattern =  new RegExp("^\s*$") ;

            if(whiteSpacePattern.test(name) || whiteSpacePattern.test(message))
            {
                sendStatus({
                    message: "Name And Message Field can't be Empty",
                    clear: true
                });
                //console.log("Invalid");
            }
            else {
                col.insert({name: name, message: message}, function () {
                        //Emit latest message to all clients

                        client.emit('output' , [data]);

                        sendStatus({
                            message: "Message Sent",
                            clear: true
                        });
                    }
                );
            }
        });
       // console.log(socket);

    });
});

