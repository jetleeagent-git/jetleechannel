import { createWorker } from 'tesseract.js';
const worker = await createWorker('eng', 1, { logger: m => {} });
for (const f of ['imgA-big.png', 'imgB-big.png']) {
  const { data } = await worker.recognize(f);
  const words = (data.words || []).filter(w => w.confidence > 45 && w.text.trim().length > 1).map(w => w.text.trim());
  console.log(`\n===== ${f} WORDS =====`);
  console.log([...new Set(words)].join(' | ').slice(0, 1500));
}
await worker.terminate();
