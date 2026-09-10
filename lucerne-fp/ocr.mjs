import { createWorker } from 'tesseract.js';

const files = ['img1-floorplans.jpg', 'img2-siteplan.jpg'];

const worker = await createWorker('eng', 1, {
  logger: m => { if (m.status === 'recognizing text') process.stdout.write(`\r${m.progress*100|0}% `); }
});

for (const f of files) {
  console.log(`\n\n===== ${f} =====`);
  const { data } = await worker.recognize(f);
  console.log('TEXT:\n' + data.text.slice(0, 3000));
}

await worker.terminate();
