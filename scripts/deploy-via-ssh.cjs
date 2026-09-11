const { Client } = require('ssh2');
const crypto = require('crypto');
const fs = require('fs');

const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

function createTunneledSocket(sshConn, targetHost, targetPort) {
  return new Promise((resolve, reject) => {
    sshConn.forwardOut('127.0.0.1', 12345, targetHost, targetPort, (err, stream) => {
      if (err) return reject(err);
      resolve(stream);
    });
  });
}

function uploadFileViaSsh(sshConn, localPath, remotePath) {
  return new Promise(async (resolve, reject) => {
    try {
      const content = fs.readFileSync(localPath);
      const ctrlSocket = await createTunneledSocket(sshConn, FTP_HOST, 21);
      // Send initial trigger to get FTP greeting
      setTimeout(() => ctrlSocket.write('NOOP\r\n'), 300);

      let step = 'WAIT_GREETING';
      let buffer = '';
      let dataSocket = null;

      ctrlSocket.on('error', err => reject(new Error(`Ctrl err: ${err.message}`)));

      ctrlSocket.on('data', async (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\r\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          console.log(`[CTRL line] ${line}`);

          if (step === 'WAIT_GREETING' && line.startsWith('220')) {
            step = 'WAIT_USER';
            ctrlSocket.write(`USER ${FTP_USER}\r\n`);
          } else if (step === 'WAIT_USER' && line.startsWith('331')) {
            step = 'WAIT_PASS';
            ctrlSocket.write(`PASS ${FTP_PASS}\r\n`);
          } else if (step === 'WAIT_PASS' && line.startsWith('230')) {
            step = 'WAIT_TYPE';
            ctrlSocket.write('TYPE I\r\n');
          } else if (step === 'WAIT_TYPE' && line.startsWith('200')) {
            step = 'WAIT_PASV';
            ctrlSocket.write('PASV\r\n');
          } else if (step === 'WAIT_PASV' && line.startsWith('227')) {
            const m = line.match(/\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
            if (!m) return reject(new Error(`Bad PASV: ${line}`));
            const dataIp = `${m[1]}.${m[2]}.${m[3]}.${m[4]}`;
            const dataPort = parseInt(m[5], 10) * 256 + parseInt(m[6], 10);
            console.log(`[PASV Parsed] IP: ${dataIp}, Port: ${dataPort}`);

            step = 'WAIT_STOR_RESP';
            try {
              dataSocket = await createTunneledSocket(sshConn, dataIp, dataPort);
              dataSocket.on('error', e => console.error(`Data socket err: ${e.message}`));
              console.log(`[DATA Socket Connected] Sending STOR ${remotePath}`);
              ctrlSocket.write(`STOR ${remotePath}\r\n`);
            } catch (err) {
              return reject(err);
            }
          } else if (step === 'WAIT_STOR_RESP' && (line.startsWith('150') || line.startsWith('125'))) {
            step = 'WAIT_226';
            console.log(`[STOR RESP 150/125] Writing ${content.length} bytes...`);
            dataSocket.write(content, () => {
              console.log('[DATA Write Complete] Closing data socket...');
              dataSocket.end();
            });
          } else if (step === 'WAIT_226' && line.startsWith('226')) {
            console.log('[226 Transfer Complete]');
            ctrlSocket.write('QUIT\r\n');
            ctrlSocket.end();
            return resolve(true);
          } else if (line.startsWith('4') || line.startsWith('5')) {
            return reject(new Error(`FTP Error [step=${step}]: ${line}`));
          }
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

const sshConn = new Client();

sshConn.on('ready', async () => {
  console.log('✅ SSH tunnel ready. Starting FTP uploads...');

  const files = [
    { local: '/home/ubuntu/.openclaw/workspace/articles/no-longer-a-rising-tide-upcoming-q4-launches-will-test-singa.html', remote: '/articles/no-longer-a-rising-tide-upcoming-q4-launches-will-test-singa.html' },
    { local: '/home/ubuntu/.openclaw/workspace/articles/index.html', remote: '/articles/index.html' }
  ];

  for (const f of files) {
    try {
      console.log(`Uploading ${f.local} -> ${f.remote}...`);
      await uploadFileViaSsh(sshConn, f.local, f.remote);
      console.log(`✅ SUCCESS: ${f.remote}`);
    } catch (err) {
      console.error(`❌ FAILED ${f.remote}:`, err.message);
    }
  }

  sshConn.end();
  process.exit(0);
});

sshConn.on('error', err => {
  console.error('SSH Error:', err.message);
  process.exit(1);
});

sshConn.connect({
  host: 'a.pinggy.io',
  port: 443,
  username: 'openclaw',
  privateKey
});
