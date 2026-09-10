import { createWorker } from 'tesseract.js';
const worker = await createWorker('eng', 1, { logger: m => {} });
for (const f of ['imgA-big.png', 'imgB-big.png']) {
  const { data } = await worker.recognize(f);
  // print words with confidence > 40 sorted, plus all lines
  const lines = data.lines.filter(l => l.text.trim().length > 2).map(l => l.text.trim());
  console.log(`\n===== ${f} LINES =====`);
  console.log(lines.slice(0, 40).join('\n'));
}
await worker.terminate();
