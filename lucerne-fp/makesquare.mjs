import fs from 'fs';
import { execSync } from 'child_process';

// Theme dark-3 bg: #1E1A12
const BG = '0x1E1A12';
const jobs = [
  { src: 'lg-floorplan-4br-premium-entertainment.jpg', out: 'lg-floorplan-sq.jpg' },
  { src: 'lg-site-plan-blocks.jpg', out: 'lg-siteplan-blocks-sq.jpg' },
  { src: 'lg-site-plan-lakeside.jpg', out: 'lg-siteplan-lakeside-sq.jpg' },
];

for (const j of jobs) {
  const { src, out } = j;
  // canvas 1200x1200, overlay image scaled to fit 1100x1100 centered (preserve aspect)
  const cmd = `ffmpeg -y -f lavfi -i "color=c=${BG}:s=1200x1200:d=1" -i ${src} -filter_complex "[1:v]scale=1100:1100:force_original_aspect_ratio=decrease[img];[0:v][img]overlay=(W-w)/2:(H-h)/2" -q:v 2 ${out}`;
  console.log('== ' + out + ' ==');
  try {
    const r = execSync(cmd, { stdio: ['ignore','ignore','pipe'], maxBuffer: 10*1024*1024 }).toString();
  } catch(e) {
    console.log('ERR:', (e.stderr||e.message).toString().split('\n').slice(-3).join('\n'));
  }
}
// verify dimensions
for (const j of jobs) {
  const r = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${j.out}`).toString().trim();
  console.log(j.out, r, Math.round(fs.statSync(j.out).size/1024)+'KB');
}
