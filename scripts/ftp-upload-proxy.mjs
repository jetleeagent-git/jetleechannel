import http from 'http';
import fs from 'fs';
import path from 'path';

const PROXY = { host: '47.91.121.127', port: 8443 };
const FTP = { host: '191.101.228.66', port: 21, user: 'u851958941.jetleechannel.sg', pass: 'Jetleechannel12345&' };

function createConnectSocket(targetHost, targetPort) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: PROXY.host,
      port: PROXY.port,
      method: 'CONNECT',
      path: `${targetHost}:${targetPort}`
    });

    req.on('connect', (res, socket) => {
      if (res.statusCode === 200) {
        resolve(socket);
      } else {
        reject(new Error(`Proxy CONNECT failed with status ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('Proxy connect timeout'));
    });
    req.end();
  });
}

export function uploadFile(localPath, remotePath) {
  return new Promise(async (resolve, reject) => {
    try {
      const content = fs.readFileSync(localPath);
      const ctrlSocket = await createConnectSocket(FTP.host, FTP.port);

      let step = 'WAIT_GREETING';
      let dataSocket = null;
      let buffer = '';

      ctrlSocket.on('error', err => {
        reject(new Error(`Control socket error: ${err.message}`));
      });

      ctrlSocket.on('data', async (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\r\n');
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          console.log(`[FTP CTRL] ${line}`);

          if (step === 'WAIT_GREETING' && line.startsWith('220')) {
            step = 'WAIT_USER';
            ctrlSocket.write(`USER ${FTP.user}\r\n`);
          } else if (step === 'WAIT_USER' && line.startsWith('331')) {
            step = 'WAIT_PASS';
            ctrlSocket.write(`PASS ${FTP.pass}\r\n`);
          } else if (step === 'WAIT_PASS' && line.startsWith('230')) {
            step = 'WAIT_TYPE';
            ctrlSocket.write('TYPE I\r\n');
          } else if (step === 'WAIT_TYPE' && line.startsWith('200')) {
            step = 'WAIT_PASV';
            ctrlSocket.write('PASV\r\n');
          } else if (step === 'WAIT_PASV' && line.startsWith('227')) {
            const m = line.match(/\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
            if (!m) {
              reject(new Error(`Failed to parse PASV response: ${line}`));
              return;
            }
            let dataIp = `${m[1]}.${m[2]}.${m[3]}.${m[4]}`;
            if (dataIp === '0.0.0.0') dataIp = FTP.host;
            const dataPort = parseInt(m[5], 10) * 256 + parseInt(m[6], 10);
            console.log(`[FTP DATA] Connecting to ${dataIp}:${dataPort} via proxy...`);

            step = 'WAIT_STOR_RESP';
            try {
              dataSocket = await createConnectSocket(dataIp, dataPort);
              console.log(`[FTP DATA] Connected! Sending STOR ${remotePath}`);

              dataSocket.on('error', err => console.log(`[FTP DATA ERR] ${err.message}`));

              ctrlSocket.write(`STOR ${remotePath}\r\n`);

              // Wait briefly for 150 response then stream file content
            } catch (err) {
              reject(new Error(`Failed to establish PASV data socket: ${err.message}`));
            }
          } else if (step === 'WAIT_STOR_RESP' && (line.startsWith('150') || line.startsWith('125'))) {
            step = 'WAIT_TRANSFER_COMPLETE';
            console.log(`[FTP DATA] Streaming ${content.length} bytes...`);
            dataSocket.write(content, () => {
              console.log('[FTP DATA] File bytes written, closing data socket...');
              dataSocket.end();
            });
          } else if (step === 'WAIT_TRANSFER_COMPLETE' && line.startsWith('226')) {
            console.log(`[FTP SUCCESS] File ${remotePath} uploaded successfully!`);
            ctrlSocket.write('QUIT\r\n');
            ctrlSocket.end();
            resolve(true);
          } else if (line.startsWith('4') || line.startsWith('5')) {
            reject(new Error(`FTP Error [step=${step}]: ${line}`));
            ctrlSocket.end();
          }
        }
      });

      // Trigger greeting if server waits
      setTimeout(() => {
        if (step === 'WAIT_GREETING') ctrlSocket.write('NOOP\r\n');
      }, 1000);

    } catch (err) {
      reject(err);
    }
  });
}

// Quick CLI runner
if (process.argv[2] && process.argv[3]) {
  const local = process.argv[2];
  const remote = process.argv[3];
  console.log(`Uploading ${local} to ${remote}...`);
  uploadFile(local, remote)
    .then(() => {
      console.log('Upload complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Upload failed:', err.message);
      process.exit(1);
    });
}