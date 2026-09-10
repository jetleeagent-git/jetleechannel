import { createWorker } from 'tesseract.js';
const worker = await createWorker('eng', 1, { logger: m => {} });
for (const f of ['imgA.jpg', 'imgB.jpg']) {
  const { data } = await worker.recognize(f);
  console.log(`\n===== ${f} =====\n${data.text.slice(0, 2000)}`);
}
await worker.terminate();
