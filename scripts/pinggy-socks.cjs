const { Client } = require('ssh2');
const crypto = require('crypto');
const net = require('net');

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

const sshConn = new Client();

sshConn.on('ready', () => {
  console.log('✅ SSH Tunnel to a.pinggy.io:443 established!');

  // Start local SOCKS5 proxy server on 127.0.0.1:1080
  const socksServer = net.createServer((socket) => {
    socket.once('data', (chunk) => {
      if (chunk[0] !== 0x05) {
        socket.destroy();
        return;
      }
      socket.write(Buffer.from([0x05, 0x00]));

      socket.once('data', (req) => {
        if (req[0] !== 0x05 || req[1] !== 0x01) {
          socket.destroy();
          return;
        }

        let host = '';
        let port = 0;
        let offset = 4;

        const atyp = req[3];
        if (atyp === 0x01) {
          host = `${req[4]}.${req[5]}.${req[6]}.${req[7]}`;
          offset = 8;
        } else if (atyp === 0x03) {
          const len = req[4];
          host = req.toString('utf8', 5, 5 + len);
          offset = 5 + len;
        } else if (atyp === 0x04) {
          host = req.subarray(4, 20).toString('hex');
          offset = 20;
        }

        port = req.readUInt16BE(offset);

        sshConn.forwardOut('127.0.0.1', 1080, host, port, (err, stream) => {
          if (err) {
            console.error(`❌ SOCKS5 forwardOut error to ${host}:${port}:`, err.message);
            socket.write(Buffer.from([0x05, 0x01, 0x00, 0x01, 0, 0, 0, 0, 0, 0]));
            socket.destroy();
            return;
          }

          socket.write(Buffer.from([0x05, 0x00, 0x00, 0x01, 127, 0, 0, 1, 4, 57]));

          socket.pipe(stream);
          stream.pipe(socket);

          socket.on('error', () => stream.destroy());
          stream.on('error', () => socket.destroy());
        });
      });
    });
  });

  socksServer.listen(1080, '127.0.0.1', () => {
    console.log('🚀 Local SOCKS5 Proxy listening on 127.0.0.1:1080');
  });
});

sshConn.on('error', (err) => {
  console.error('❌ SSH Error:', err.message);
});

sshConn.connect({
  host: 'a.pinggy.io',
  port: 443,
  username: 'openclaw',
  privateKey,
  keepaliveInterval: 10000
});
