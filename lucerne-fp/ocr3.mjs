import { createWorker } from 'tesseract.js';
const worker = await createWorker('eng', 1, { logger: m => {} });
for (const f of ['imgA-big.png', 'imgB-big.png']) {
  const { data } = await worker.recognize(f);
  console.log(`\n===== ${f} =====\n${data.text.slice(0, 2500)}`);
}
await worker.terminate();
