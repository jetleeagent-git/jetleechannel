import { Client } from 'ssh2';
import crypto from 'crypto';
import net from 'net';

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

const sshConn = new Client();

sshConn.on('ready', () => {
  console.log('✅ SSH Tunnel to a.pinggy.io:443 established!');

  // Start a local SOCKS5 proxy server on 127.0.0.1:1080
  const socksServer = net.createServer((socket) => {
    socket.once('data', (chunk) => {
      // SOCKS5 handshake step 1: greeting [0x05, NMETHODS, METHODS...]
      if (chunk[0] !== 0x05) {
        socket.destroy();
        return;
      }
      // Respond no auth required [0x05, 0x00]
      socket.write(Buffer.from([0x05, 0x00]));

      socket.once('data', (req) => {
        // SOCKS5 connect request: [VER(1), CMD(1), RSV(1), ATYP(1), DST.ADDR, DST.PORT(2)]
        if (req[0] !== 0x05 || req[1] !== 0x01) { // 0x01 = CONNECT
          socket.destroy();
          return;
        }

        let host = '';
        let port = 0;
        let offset = 4;

        const atyp = req[3];
        if (atyp === 0x01) { // IPv4
          host = `${req[4]}.${req[5]}.${req[6]}.${req[7]}`;
          offset = 8;
        } else if (atyp === 0x03) { // Domain
          const len = req[4];
          host = req.toString('utf8', 5, 5 + len);
          offset = 5 + len;
        } else if (atyp === 0x04) { // IPv6
          host = req.subarray(4, 20).toString('hex');
          offset = 20;
        }

        port = req.readUInt16BE(offset);

        // Tunnel connection via SSH
        sshConn.forwardOut('127.0.0.1', 1080, host, port, (err, stream) => {
          if (err) {
            console.error(`❌ SOCKS5 forwardOut error to ${host}:${port}:`, err.message);
            // SOCKS5 reply: general failure
            socket.write(Buffer.from([0x05, 0x01, 0x00, 0x01, 0, 0, 0, 0, 0, 0]));
            socket.destroy();
            return;
          }

          // SOCKS5 reply: success [0x05, 0x00, 0x00, 0x01, BND.ADDR(4), BND.PORT(2)]
          socket.write(Buffer.from([0x05, 0x00, 0x00, 0x01, 127, 0, 0, 1, 4, 57])); // 1081

          // Pipe bidirectional data
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
