const tls = require('tls');
const fs = require('fs');




const options = {

    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-cert.pem'),
    // This is necessary only if the client uses the self-signed certificate.
    ca: [fs.readFileSync('client-cert.pem')],

    // This is necessary only if using the client certificate authentication.
    requestCert: true,
    // Automatically reject clients with invalide certificates.
    rejectUnauthorized: false // Set false to see what happens.


};

const server = tls.createServer(options, (socket) => {
    console.log('server connected',
        socket.authorized ? 'authorized' : 'unauthorized');
    // console.log("Cipher: ", socket.getCipher());
    console.log("Address: ", socket.address());
    console.log("Remote address: ", socket.remoteAddress);
    // console.log("Remote port: ", socket.remotePort);
    socket.write('welcome!\n');
    socket.setEncoding('utf8');
    socket.pipe(socket);

    socket.on("data", function(data){
        console.log("received:",data)
    })

});




server.listen(3000, () => {
    console.log('server bound');
});