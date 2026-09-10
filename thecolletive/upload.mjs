#!/usr/bin/env node
/**
 * Upload The Collective at One Sophia site to jetleechannel.sg FTP.
 * Uploads: index.html, price/, articles/, images/, images/floorplans/, docs/
 */
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const ROOT = '/home/ubuntu/.openclaw/workspace/thecolletive';
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';
const REMOTE_BASE = '/theColletive';

// Files to upload: [localPath, remotePath]
const files = [];

function walk(dir, baseRemote) {
  for (const name of readdirSync(dir)) {
    const local = join(dir, name);
    const st = statSync(local);
    if (st.isDirectory()) {
      walk(local, `${baseRemote}/${name}`);
    } else {
      files.push([local, `${baseRemote}/${name}`]);
    }
  }
}

// Root HTML pages
for (const f of ['index.html', 'price/index.html', 'articles/index.html',
                 'articles/the-collective-one-sophia-buyers-guide.html',
                 'articles/sophia-road-district-9-next-hotspot.html']) {
  const local = join(ROOT, f);
  if (existsSync(local)) files.push([local, `${REMOTE_BASE}/${f}`]);
}

// Images, floorplans, docs
walk(join(ROOT, 'images'), `${REMOTE_BASE}/images`);
walk(join(ROOT, 'docs'), `${REMOTE_BASE}/docs`);

console.log(`Uploading ${files.length} files to ${FTP_HOST}${REMOTE_BASE}/ ...`);

let ok = 0, fail = 0;
for (const [local, remote] of files) {
  const cmd = `curl -s -T "${local}" "ftp://${FTP_HOST}${remote}" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 300`;
  try {
    const code = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
    if (code === '226') { ok++; }
    else { fail++; console.log(`❌ ${remote} → ${code}`); }
  } catch (e) {
    fail++;
    console.log(`❌ ${remote} → ${e.message.slice(0, 80)}`);
  }
}

console.log(`\n✅ ${ok} uploaded, ❌ ${fail} failed`);
process.exit(fail ? 1 : 0);
