// main.js — routing and wiring for Rumah Tangga.
// Hash routes: #/ (overview), #/transactions, #/budget, #/goals, #/bills, #/reports.
// All state lives in data.js; this file only renders and handles user actions.

const app = document.getElementById('app');
const monthLabel = document.getElementById('month-label');
const monthPrev = document.getElementById('month-prev');
const monthNext = document.getElementById('month-next');

let txnFilter = { cat: '', q: '' };
let editingTxnId = null;

function route() {
  const hash = location.hash || '#/';
  const name = hash.replace(/^#\/?/, '').split('/')[0];
  return ['transactions', 'budget', 'goals', 'bills', 'reports'].includes(name) ? name : '';
}

function render() {
  window.__shotReady = false;
  const month = state.month;
  const r = route();
  document.querySelectorAll('.mainnav a').forEach((a) => {
    a.classList.toggle('active', (a.getAttribute('data-route') || '') === r);
  });
  monthLabel.textContent = MONTH_LABELS[month];
  monthPrev.disabled = MONTHS.indexOf(month) === 0;
  monthNext.disabled = MONTHS.indexOf(month) === MONTHS.length - 1;
  let html = '';
  let title = 'Rumah Tangga';
  if (r === 'transactions') { html = viewTransactions(month, txnFilter, editingTxnId); title = 'Transaksi'; }
  else if (r === 'budget') { html = viewBudget(month); title = 'Anggaran'; }
  else if (r === 'goals') { html = viewGoals(); title = 'Tabungan'; }
  else if (r === 'bills') { html = viewBills(month); title = 'Tagihan'; }
  else if (r === 'reports') { html = viewReports(month); title = 'Laporan'; }
  else { html = viewOverview(month); title = 'Ringkasan'; }
  app.innerHTML = html;
  document.title = title + ' · Rumah Tangga — Anggaran Keluarga';
  window.__shotReady = true;
}

function toast(msg) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function stepMonth(dir) {
  const i = MONTHS.indexOf(state.month) + dir;
  if (i < 0 || i >= MONTHS.length) return;
  state.month = MONTHS[i];
  editingTxnId = null;
  saveState();
  render();
}

function addTransaction(form) {
  const data = new FormData(form);
  const amount = Math.round(Number(data.get('amount')));
  const desc = String(data.get('desc') || '').trim();
  const date = String(data.get('date') || '');
  if (!desc || !amount || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast('Isi tanggal, keterangan, dan jumlah yang benar.'); return; }
  const month = date.slice(0, 7);
  if (!state.txns[month]) state.txns[month] = [];
  state.txns[month].push({
    id: 'u' + (state.nextId++),
    date,
    desc,
    category: String(data.get('category')),
    amount,
    kind: String(data.get('kind') || 'out'),
  });
  state.month = month;
  saveState();
  form.reset();
  toast('Transaksi ditambahkan: ' + desc);
  render();
}

monthPrev.addEventListener('click', () => stepMonth(-1));
monthNext.addEventListener('click', () => stepMonth(1));
window.addEventListener('hashchange', () => { editingTxnId = null; render(); });

app.addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  if (action === 'delete-txn') {
    const txn = (state.txns[state.month] || []).find((t) => t.id === id);
    if (txn && confirm('Hapus transaksi "' + txn.desc + '" (' + fmt(txn.amount) + ')?')) {
      state.txns[state.month] = state.txns[state.month].filter((t) => t.id !== id);
      saveState(); toast('Transaksi dihapus.'); render();
    }
  } else if (action === 'edit-txn') {
    editingTxnId = id;
    render();
    const f = document.getElementById('edit-form');
    if (f) f.scrollIntoView({ block: 'start' });
  } else if (action === 'cancel-edit') {
    editingTxnId = null; render();
  } else if (action === 'clear-filter') {
    txnFilter = { cat: '', q: '' }; render();
  } else if (action === 'pay-bill') {
    const bill = billById(id);
    if (!bill) return;
    if (!state.paidBills[state.month]) state.paidBills[state.month] = [];
    if (isBillPaid(state.month, bill.id)) return;
    state.paidBills[state.month].push(bill.id);
    state.txns[state.month].push({
      id: 'u' + (state.nextId++),
      date: state.month + '-' + String(bill.dueDay).padStart(2, '0'),
      desc: bill.name,
      category: bill.category,
      amount: bill.amount,
      kind: 'out',
    });
    saveState();
    toast(bill.name + ' ditandai lunas — ' + fmt(bill.amount) + ' tercatat.');
    render();
  }
});

app.addEventListener('input', (ev) => {
  if (ev.target.id === 'f-q') { txnFilter.q = ev.target.value; render(); restoreFilterFocus('f-q'); }
  if (ev.target.id === 'f-cat') { txnFilter.cat = ev.target.value; render(); }
});

function restoreFilterFocus(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.focus();
  const v = el.value;
  el.setSelectionRange(v.length, v.length);
}

app.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const form = ev.target;
  const data = new FormData(form);
  if (form.id === 'add-form') { addTransaction(form); return; }
  if (form.id === 'edit-form') {
    const id = form.getAttribute('data-id');
    const txn = (state.txns[state.month] || []).find((t) => t.id === id);
    if (!txn) return;
    const amount = Math.round(Number(data.get('amount')));
    const desc = String(data.get('desc') || '').trim();
    const date = String(data.get('date') || '');
    if (!desc || !amount || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast('Isi tanggal, keterangan, dan jumlah yang benar.'); return; }
    txn.desc = desc; txn.date = date; txn.category = String(data.get('category')); txn.amount = amount; txn.kind = String(data.get('kind') || 'out');
    const month = date.slice(0, 7);
    if (month !== state.month && state.txns[month]) {
      state.txns[state.month] = state.txns[state.month].filter((t) => t.id !== id);
      state.txns[month].push(txn);
      state.month = month;
    }
    editingTxnId = null;
    saveState(); toast('Transaksi diperbarui.'); render();
    return;
  }
  if (form.id === 'new-goal-form') {
    const name = String(data.get('name') || '').trim();
    const target = Math.round(Number(data.get('target')));
    const saved = Math.round(Number(data.get('saved')) || 0);
    if (!name || !target || target <= 0) { toast('Isi nama tujuan dan target yang benar.'); return; }
    const colors = ['#1f5c3d', '#c2703d', '#3d6f8e', '#7a6aa8', '#a8863d'];
    state.goals.push({ id: 'g' + (state.nextId++), name, target, saved, color: colors[state.goals.length % colors.length], note: 'Tujuan baru — ditambahkan ' + MONTH_LABELS[state.month] + '.' });
    saveState(); toast('Tujuan "' + name + '" dibuat.'); render();
    return;
  }
  const budgetFor = form.getAttribute('data-budget-form');
  if (budgetFor) {
    const val = Math.round(Number(data.get('budget')));
    if (Number.isNaN(val) || val < 0) { toast('Anggaran harus angka 0 atau lebih.'); return; }
    state.budgets[budgetFor] = val;
    saveState(); toast('Anggaran ' + categoryOf(budgetFor).name + ' diubah menjadi ' + fmt(val) + '.'); render();
    return;
  }
  const goalFor = form.getAttribute('data-goal-form');
  if (goalFor) {
    const amount = Math.round(Number(data.get('amount')));
    const goal = goalById(goalFor);
    if (!goal || !amount || amount <= 0) { toast('Masukkan jumlah dana yang benar.'); return; }
    goal.saved += amount;
    saveState(); toast(fmt(amount) + ' ditambahkan ke ' + goal.name + '.'); render();
  }
});

render();
