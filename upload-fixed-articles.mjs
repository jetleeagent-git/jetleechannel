#!/usr/bin/env node
/**
 * Upload all fixed project files + article copies + indexes to jetleechannel.sg FTP.
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const WORKSPACE = '/home/ubuntu/.openclaw/workspace';
const FTP_HOST = '191.101.228.66';
const FTP_USER = 'u851958941.jetleechannel.sg';
const FTP_PASS = 'Jetleechannel12345&';

const PROJECTS = {
  elta:               { file: 'site-elta.html' },
  dunearnhouse:       { file: 'site-dunearnhouse.html' },
  amberwood:          { file: 'site-amberwood.html' },
  arcady:             { file: 'site-arcady.html' },
  hudsonplace:        { file: 'site-hudsonplace.html' },
  hougangcentral:     { file: 'site-hougangcentral.html' },
  'lentor-gardens':   { file: 'site-lentorgardens.html' },
  lucernegrand:       { file: 'site-lucernegrand.html' },
  OneMarinaGardens:   { file: 'site-onemarinagarden.html' },
  unionsquare:        { file: 'site-unionsquare.html' },
  'generations-tannery': { file: 'site-generations-tannery.html' },
  TheSierra:          { file: 'thesierra/index.html' },
  TheOrie:            { file: 'theorie/index.html' },
  SophiaMeadow:       { file: 'sophiameadow/index.html' },
  bagnallhous:        { file: 'bagnallhous/index.html' },
  zyongrand:          { file: 'zyongrand/index.html' },
  promenadepeak:      { file: 'promenadepeak/index.html' },
  rivergreen:         { file: 'rivergreen/index.html' },
  newportresidences:  { file: 'newportresidences/index.html' },
  BelgraviaAce:       { file: 'BelgraviaAce/index.html' },
  thesen:             { file: 'thesen/index.html' },
};

function ftpUpload(localPath, remotePath) {
  const cmd = `curl -s -T "${localPath}" "ftp://${FTP_HOST}/${remotePath}" --user "${FTP_USER}:${FTP_PASS}" -o /dev/null -w "%{http_code}" --max-time 60 2>/dev/null`;
  try {
    return execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }).trim();
  } catch (e) { return 'ERR'; }
}

function mkdirRemote(path) {
  try {
    execSync(`curl -s --user "${FTP_USER}:${FTP_PASS}" "ftp://${FTP_HOST}/" -Q "MKD ${path}" 2>/dev/null || true`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 });
  } catch (e) {}
}

// 1. Upload homepages
console.log('=== UPLOAD HOMEPAGES ===');
for (const [slug, cfg] of Object.entries(PROJECTS)) {
  const f = join(WORKSPACE, cfg.file);
  if (!existsSync(f)) { console.log(`  ⚠ missing ${cfg.file}`); continue; }
  const code = ftpUpload(f, `${slug}/index.html`);
  console.log(`  ${slug}: ${code}`);
}

// 2. Upload article copies + indexes for all *_articles dirs
console.log('\n=== UPLOAD ARTICLES ===');
const articleDirs = Object.keys(PROJECTS);
for (const slug of articleDirs) {
  const dir = join(WORKSPACE, `${slug}_articles`);
  if (!existsSync(dir)) continue;
  // Ensure remote articles dir
  mkdirRemote(`${slug}/articles`);
  const files = execSync(`ls ${dir}/*.html 2>/dev/null`, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
  for (const f of files) {
    const name = f.split('/').pop();
    const code = ftpUpload(f, `${slug}/articles/${name}`);
    console.log(`  ${slug}/articles/${name}: ${code}`);
  }
}

console.log('\nAll uploads attempted.');
