const BASE_URL = '/api';

export async function fetchResults({ needsHuman = '', category = 'all', priority = 'all', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (needsHuman !== '') params.append('needsHuman', needsHuman);
  if (category && category !== 'all') params.append('category', category);
  if (priority && priority !== 'all') params.append('priority', priority);
  params.append('page', page);
  params.append('limit', limit);

  const res = await fetch(`${BASE_URL}/results?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch triage results');
  return res.json();
}

export async function fetchResultDetail(id) {
  const res = await fetch(`${BASE_URL}/results/${id}`);
  if (!res.ok) throw new Error('Failed to fetch result detail');
  return res.json();
}

export async function triggerBatchRun() {
  const res = await fetch(`${BASE_URL}/triage/batch`, { method: 'POST' });
  if (!res.ok) throw new Error('Batch execution failed');
  return res.json();
}

export async function triageSingleMessage(rawText, externalId = '') {
  const res = await fetch(`${BASE_URL}/triage/single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, externalId }),
  });
  if (!res.ok) throw new Error('Single triage failed');
  return res.json();
}

export async function runEvaluation() {
  const res = await fetch(`${BASE_URL}/eval/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Evaluation run failed');
  return res.json();
}

export async function fetchLatestEval() {
  const res = await fetch(`${BASE_URL}/eval/latest`);
  if (!res.ok) return null;
  return res.json();
}
