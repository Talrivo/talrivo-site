export function modelMatches(label, query) {
  const tokens = String(query).slice(0, 40).toLowerCase().match(/[a-z]+|\d+/g) || [];
  const normalized = label.toLowerCase().replace(/[^a-z0-9]/g, '');
  return tokens.every(token => normalized.includes(token));
}

export function setupModelFinder(doc) {
  const form = doc.querySelector('#model-finder');
  if (!form) return;
  const input = form.querySelector('input');
  const clear = form.querySelector('button[type="button"]');
  const status = form.querySelector('[role="status"]');
  const empty = form.querySelector('#model-finder-empty');
  const groups = [
    ['#wireless-models', 'tbody tr', false],
    ['#wired-models', 'tbody tr', false],
    ['#pending-models', 'nav a', true]
  ].map(([id, selector, pending]) => {
    const section = doc.querySelector(id);
    return { section, pending, selector };
  });
  if (!input || !clear || !status || !empty || groups.some(group => !group.section)) return;
  for (const group of groups) {
    group.summary = group.section.querySelector('[data-model-finder-summary]');
    group.entries = [...group.section.querySelectorAll(group.selector)].map(node => ({
      node, link: group.pending ? node : node.querySelector('td a')
    }));
  }
  if (groups.some(group => !group.summary || group.entries.some(entry => !entry.link))) return;

  const versionChecks = doc.querySelector('#version-checks');
  let firstMatch;
  const apply = () => {
    let listed = 0;
    let pending = 0;
    firstMatch = null;
    const filtering = input.value.trim().length > 0;
    if (versionChecks) versionChecks.hidden = filtering;
    for (const group of groups) {
      let count = 0;
      for (const entry of group.entries) {
        const matches = modelMatches(entry.link.textContent, input.value);
        entry.node.hidden = !matches;
        if (matches) { count++; firstMatch ||= entry.link; }
      }
      group.section.hidden = count === 0;
      group.summary.hidden = !filtering;
      group.summary.textContent = `Showing ${count} of ${group.entries.length} ${group.pending ? 'references awaiting specifications' : 'listed product versions'}.`;
      if (group.pending) pending += count;
      else listed += count;
    }
    empty.hidden = listed + pending > 0;
    status.textContent = `${listed} listed product ${listed === 1 ? 'version' : 'versions'} and ${pending} ${pending === 1 ? 'reference' : 'references'} awaiting specifications ${filtering ? 'match' : 'shown'}.`;
    clear.disabled = !input.value;
  };
  input.addEventListener('input', apply);
  form.addEventListener('submit', event => {
    event.preventDefault();
    apply();
    firstMatch?.focus();
  });
  clear.addEventListener('click', () => {
    input.value = '';
    apply();
    input.focus();
  });
  // Section shortcuts must never land inside a group hidden by an earlier search.
  for (const link of doc.querySelectorAll('a[href="#wireless-models"], a[href="#wired-models"], a[href="#pending-models"]')) {
    link.addEventListener('click', () => { input.value = ''; apply(); });
  }
  apply();
  form.hidden = false;
}

if (typeof document !== 'undefined') setupModelFinder(document);
