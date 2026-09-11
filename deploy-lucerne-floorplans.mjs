import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';

console.log('=== UPLOADING LUCERNE GRAND FLOORPLANS & HTML ===');

// 1. Upload HTML
console.log('Uploading site-lucernegrand.html...');
try {
  const code = execSync(`curl -s -T "${WORKSPACE}/site-lucernegrand.html" "ftp://${FTP_HOST}/lucernegrand/index.html" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 60`, {encoding: 'utf-8'});
  console.log('HTML upload result:', code);
} catch (e) {
  console.log('HTML upload error:', e.message);
}

// 2. Upload Images
const imgDir = join(WORKSPACE, 'lucernegrand-images');
if (existsSync(imgDir)) {
  const files = readdirSync(imgDir);
  console.log(`Uploading ${files.length} images...`);
  let success = 0;
  for (const f of files) {
    const localPath = join(imgDir, f);
    const remotePath = `lucernegrand/images/${f}`;
    try {
      const code = execSync(`curl -s -T "${localPath}" "ftp://${FTP_HOST}/${remotePath}" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30`, {encoding: 'utf-8'});
      if (code.trim() === '226') success++;
    } catch (e) {
      // ignore individual errors
    }
  }
  console.log(`Uploaded ${success}/${files.length} images successfully.`);
}
