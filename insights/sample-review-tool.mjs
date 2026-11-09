export const checks = [
  ['playback', 'Device detection and playback', 'Record the receiver or cable and selected audio output.'],
  ['voice', 'Playback and microphone together', 'Check game audio and voice chat together on this device.'],
  ['reconnect', 'Reconnection and controls', 'Record pairing, mode switching, mute and volume behavior.'],
  ['fit', 'Wearing fit', 'Record wearing duration, cushion feel and pressure.'],
  ['charging', 'Battery and charging', 'Record volume, lights, mode and charger; review a dock separately if supplied.'],
  ['packing', 'Accessories and documents', 'Match actual contents and required documents to this sample version.']
];
export const statuses = ['Not tested', 'Meets agreed criteria', 'Issue to resolve', 'Not applicable'];
const clean = (value, max = 300) => typeof value === 'string'
  ? value.replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

const knownModels = new Set(['G926', 'G935', 'G936', 'G938', 'G940', 'G941', 'G946', 'G947']);
export function reviewInquiry(sample) {
  const model = clean(sample).match(/^(G926|G935|G936|G938|G940|G941|G946|G947)(?=$|[\s,/-])/i)?.[1].toUpperCase();
  const product = model ? model.toLowerCase() : 'wireless-gaming-headsets';
  return `/contact/?product=${product}&inquiry=quick-question&reference=sample-evaluation-guide#inquiry-form`;
}

export function buildReview(record = {}) {
  const lines = [
    'TALRIVO | BUYER SAMPLE REVIEW',
    'Source: https://talrivo.com/insights/evaluate-gaming-headset-sample-before-bulk-order/#review-worksheet',
    'Buyer-entered notes, not TALRIVO test results or automatic sample approval.',
    'Repeat this review for each required device and connection mode.', '',
    `Model / sample ID: ${clean(record.sample) || 'Not recorded'}`,
    `Device / OS / application: ${clean(record.device) || 'Not recorded'}`,
    `Connection / receiver / cable: ${clean(record.connection) || 'Not recorded'}`,
    `Agreed acceptance criteria: ${clean(record.criteria, 600) || 'Not recorded'}`, ''
  ];
  for (const [id, label] of checks) {
    const row = record.results?.[id] || {};
    const status = statuses.includes(row.status) ? row.status : 'Not tested';
    lines.push(label.toUpperCase(), `Status: ${status}`, `Observed result / evidence reference: ${clean(row.note) || 'Not recorded'}`, '');
  }
  lines.push('Open questions / retest needed:', clean(record.followup, 600) || 'Not recorded', '',
    'No sample is approved automatically by completing this sheet.',
    'If you need help, send the sample ID, device, mode and relevant result through the existing product inquiry form.',
    `Product inquiry: https://talrivo.com${reviewInquiry(record.sample)}`);
  return lines.join('\n');
}

export function setupReview(doc = document, win = window) {
  const form = doc.querySelector('#sample-review-form');
  if (!form) return;
  const output = doc.querySelector('#sample-review-output');
  const message = doc.querySelector('#sample-review-status');
  const details = doc.querySelector('#sample-review-editor');
  const sample = doc.querySelector('input[name="sample"]');
  const inquiry = doc.querySelector('#sample-review-inquiry');
  const model = (new URLSearchParams(win.location.search || '').get('model') || '').toUpperCase();
  if (knownModels.has(model) && !sample.value) sample.value = model;
  const updateInquiry = () => { inquiry.href = reviewInquiry(sample.value); };
  sample.addEventListener('input', updateInquiry);
  updateInquiry();
  const openFromLink = () => {
    if (win.location.hash === '#sample-review-tool') doc.querySelector('#sample-review-panel').open = true;
  };
  win.addEventListener('hashchange', openFromLink);
  openFromLink();
  const read = () => {
    const fields = new FormData(form);
    return {
      sample: fields.get('sample'), device: fields.get('device'), connection: fields.get('connection'),
      criteria: fields.get('criteria'), followup: fields.get('followup'),
      results: Object.fromEntries(checks.map(([id]) => [id, {status: fields.get(`${id}-status`), note: fields.get(`${id}-note`)}]))
    };
  };
  // This review has no submission endpoint, storage, or analytics payload.
  form.addEventListener('submit', event => event.preventDefault());
  doc.querySelector('#sample-review-preview').addEventListener('click', () => {
    output.textContent = buildReview(read());
    details.hidden = false;
    message.textContent = 'Review prepared below. Check unresolved items before sharing it.';
  });
  doc.querySelector('#sample-review-download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([buildReview(read())], {type: 'text/plain;charset=utf-8'}));
    const link = doc.createElement('a');
    link.href = url;
    link.download = 'gaming-headset-sample-review.txt';
    link.click();
    win.setTimeout(() => URL.revokeObjectURL(url), 1000);
    message.textContent = 'Review file prepared. Your entries have not been sent to TALRIVO.';
  });
  win.addEventListener('afterprint', () => doc.body.classList.remove('printing-sample-review'));
  doc.querySelector('#sample-review-print').addEventListener('click', () => {
    output.textContent = buildReview(read());
    details.hidden = false;
    doc.body.classList.add('printing-sample-review');
    try { win.print(); } catch (error) {
      doc.body.classList.remove('printing-sample-review');
      message.textContent = 'Print preview could not open. Download your review instead.';
    }
  });
  // Enable entry only after submission prevention and all actions are installed.
  doc.querySelector('#sample-review-controls').disabled = false;
}

if (typeof document !== 'undefined') setupReview();
