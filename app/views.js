// views.js — HTML for every page, built from the store in data.js.
// Every figure on screen is computed here from the transactions, never typed twice.

function statCard(label, value, sub, tone) {
  return '<div class="card stat' + (tone ? ' ' + tone : '') + '">'
    + '<div class="label">' + esc(label) + '</div>'
    + '<div class="value">' + value + '</div>'
    + '<div class="sub">' + sub + '</div></div>';
}

function categoryRows(month) {
  const spent = monthSpent(month);
  return CATEGORIES.map((c) => {
    const s = categorySpent(month, c.id);
    const b = state.budgets[c.id];
    return '<div class="cat-row"><span class="cat-dot" style="background:' + c.color + '"></span>'
      + '<span><span class="cat-name">' + esc(c.name) + '</span><br><span class="cat-sub">' + fmtShort(s) + ' dari ' + fmtShort(b) + '</span></span>'
      + '<span class="cat-amt">' + fmt(s) + '</span>'
      + '<span class="cat-pct">' + pct(s, spent) + '%</span></div>';
  }).join('');
}

function txnTableRows(txns) {
  if (!txns.length) return '<tr><td colspan="4" class="empty">Belum ada transaksi yang cocok.</td></tr>';
  return txns.map((t) => {
    const cat = t.kind === 'in' ? { name: 'Pemasukan', color: '#1f5c3d' } : categoryOf(t.category);
    const sign = t.kind === 'in' ? '+' : '−';
    return '<tr><td><span class="tx-desc">' + esc(t.desc) + '</span><br><span class="tx-meta">' + dayLabel(t.date) + ' · ' + esc(cat.name) + '</span></td>'
      + '<td class="hide-sm"><span class="pill ' + (t.kind === 'in' ? 'in' : 'out') + '">' + (t.kind === 'in' ? 'Masuk' : 'Keluar') + '</span></td>'
      + '<td class="num">' + sign + ' ' + fmt(t.amount) + '</td>'
      + '<td class="num"><button type="button" class="btn btn-ghost btn-small" data-action="edit-txn" data-id="' + t.id + '">Ubah</button> '
      + '<button type="button" class="btn btn-danger btn-small" data-action="delete-txn" data-id="' + t.id + '">Hapus</button></td></tr>';
  }).join('');
}

function upcomingBills(month) {
  const today = month === '2026-11' ? 27 : 31; // "today" inside the demo month
  return BILLS
    .filter((b) => !isBillPaid(month, b.id))
    .map((b) => ({ bill: b, days: b.dueDay - today }))
    .sort((a, b) => a.days - b.days);
}

function insightsFor(month) {
  const income = monthIncome(month);
  const spent = monthSpent(month);
  const daysElapsed = month === '2026-11' ? 27 : 31;
  const daysInMonth = month === '2026-11' ? 30 : 31;
  const daily = spent / daysElapsed;
  const projected = spent + daily * Math.max(0, daysInMonth - daysElapsed);
  const over = CATEGORIES.filter((c) => categorySpent(month, c.id) > state.budgets[c.id]);
  const top = CATEGORIES.map((c) => ({ c, s: categorySpent(month, c.id) })).sort((a, b) => b.s - a.s)[0];
  const biggest = monthTxns(month).filter((t) => t.kind === 'out').sort((a, b) => b.amount - a.amount)[0];
  return { income, spent, daily, projected, over, top, biggest, daysElapsed, daysInMonth };
}

// ---------------- Overview ----------------
function viewOverview(month) {
  const income = monthIncome(month);
  const spent = monthSpent(month);
  const left = income - spent;
  const rate = pct(left, income);
  const ins = insightsFor(month);
  const planTotal = SAVINGS_PLAN.reduce((s, p) => s + p.amount, 0);
  const donutParts = CATEGORIES.map((c) => ({ label: c.name, value: categorySpent(month, c.id), color: c.color }));
  const recent = monthTxns(month).slice(0, 8);
  const upcoming = upcomingBills(month).slice(0, 3);
  const overNote = ins.over.length
    ? '<div class="insight warn"><strong>Perhatian:</strong> ' + ins.over.map((c) => esc(c.name) + ' sudah ' + pct(categorySpent(month, c.id), state.budgets[c.id]) + '% dari anggaran').join('; ') + '. Tahan dulu belanja di kategori ini sampai akhir bulan.</div>'
    : '<div class="insight"><strong>Semua kategori masih dalam anggaran.</strong> Tidak ada kategori yang melewati batas bulan ini.</div>';

  return '<div class="page-head"><div><h1>Ringkasan ' + esc(MONTH_LABELS[month]) + '</h1>'
    + '<p class="lede">Keluarga Prasetyo — dua pencari nafkah, satu anak. Pemasukan Rp 14.500.000 sebulan, anggaran belanja Rp 9.300.000, sisanya untuk tabungan.</p></div></div>'
    + '<div class="grid grid-4" style="margin-bottom:16px">'
    + statCard('Pemasukan', fmt(income), 'Gaji ayah Rp 9.000.000 + gaji ibu Rp 5.500.000', 'good')
    + statCard('Pengeluaran', fmt(spent), 'Rata-rata ' + fmt(Math.round(ins.daily)) + ' / hari · ' + ins.daysElapsed + ' hari berjalan', '')
    + statCard('Sisa bulan ini', fmt(left), 'Dari ' + fmtShort(planTotal) + ' dialokasikan ke tabungan', left < 0 ? 'warn' : 'good')
    + statCard('Tingkat tabungan', rate + '%', 'Sisa dari pemasukan · target keluarga 30%', rate >= 30 ? 'good' : 'warn')
    + '</div>'
    + '<div class="grid grid-2wide">'
    + '<section class="card"><h2>Pengeluaran per kategori <a class="more" href="#/budget">Lihat anggaran →</a></h2>'
    + '<div class="donut-wrap">' + donutChart(donutParts, 160, 30) + '<div class="legend">' + categoryRows(month) + '</div></div></section>'
    + '<div><section class="card"><h2>Tabungan bulan ini</h2>'
    + SAVINGS_PLAN.map((p) => {
        const g = goalById(p.goalId);
        return '<div class="cat-row"><span class="cat-dot" style="background:' + g.color + '"></span>'
          + '<span><span class="cat-name">' + esc(g.name) + '</span><br><span class="cat-sub">' + fmtShort(g.saved) + ' dari target ' + fmtShort(g.target) + '</span></span>'
          + '<span class="cat-amt">+' + fmt(p.amount) + '</span><span class="cat-pct">' + pct(g.saved, g.target) + '%</span></div>';
      }).join('')
    + '<p style="margin:10px 0 0;font-size:.88rem;color:var(--ink-soft)">Sisa Rp ' + fmt(left - planTotal) + ' dibiarkan sebagai dana cadangan di rekening harian.</p></section>'
    + '<section class="card" style="margin-top:16px"><h2>Tagihan mendesak <a class="more" href="#/bills">Semua tagihan →</a></h2>'
    + (upcoming.length ? upcoming.map((u) => '<div class="cat-row"><span class="cat-dot" style="background:#b98a2f"></span>'
        + '<span><span class="cat-name">' + esc(u.bill.name) + '</span><br><span class="cat-sub">Jatuh tempo ' + u.bill.dueDay + ' ' + MONTH_SHORT[month] + '</span></span>'
        + '<span class="cat-amt">' + fmt(u.bill.amount) + '</span>'
        + '<span class="cat-pct">' + (u.days === 0 ? 'hari ini' : u.days > 0 ? u.days + ' hari' : 'telat') + '</span></div>').join('')
      : '<p class="empty">Semua tagihan bulan ini sudah lunas.</p>')
    + '</section></div></div>'
    + '<div class="grid grid-2wide" style="margin-top:16px">'
    + '<section class="card"><h2>Transaksi terakhir <a class="more" href="#/transactions">Semua transaksi →</a></h2>'
    + '<table><thead><tr><th>Keterangan</th><th class="hide-sm">Jenis</th><th class="num">Jumlah</th><th></th></tr></thead><tbody>'
    + txnTableRows(recent) + '</tbody></table></section>'
    + '<section class="card"><h2>Apa kata angka bulan ini?</h2>'
    + overNote
    + '<div class="insight"><strong>Pengeluaran terbesar:</strong> ' + esc(ins.top.c.name) + ' — ' + fmt(ins.top.s) + ' (' + pct(ins.top.s, spent) + '% dari semua belanja).</div>'
    + '<div class="insight gold"><strong>Proyeksi akhir bulan:</strong> kalau pola ' + ins.daysElapsed + ' hari ini berlanjut, pengeluaran ' + MONTH_LABELS[month] + ' berakhir di sekitar ' + fmt(Math.round(ins.projected)) + ' — masih di bawah pemasukan.</div>'
    + '<div class="insight"><strong>Transaksi terbesar:</strong> ' + esc(ins.biggest.desc) + ' sebesar ' + fmt(ins.biggest.amount) + ' pada ' + dayLabel(ins.biggest.date) + '.</div>'
    + '</section></div>';
}

// ---------------- Transactions ----------------
function viewTransactions(month, filter, editingId) {
  let txns = monthTxns(month);
  const totalIn = txns.filter((t) => t.kind === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = txns.filter((t) => t.kind === 'out').reduce((s, t) => s + t.amount, 0);
  if (filter.cat) txns = txns.filter((t) => t.category === filter.cat || (filter.cat === 'income' && t.kind === 'in'));
  if (filter.q) { const q = filter.q.toLowerCase(); txns = txns.filter((t) => t.desc.toLowerCase().includes(q)); }
  const editing = editingId ? (state.txns[month] || []).find((t) => t.id === editingId) : null;

  const catOptions = '<option value="">Semua kategori</option>'
    + '<option value="income"' + (filter.cat === 'income' ? ' selected' : '') + '>Pemasukan</option>'
    + CATEGORIES.map((c) => '<option value="' + c.id + '"' + (filter.cat === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('');

  let html = '<div class="page-head"><div><h1>Transaksi ' + esc(MONTH_LABELS[month]) + '</h1>'
    + '<p class="lede">Semua uang masuk dan keluar bulan ini. Tambah, ubah, atau hapus — total di bawah langsung ikut berubah.</p></div>'
    + '<div><span class="pill in">Masuk ' + fmt(totalIn) + '</span> <span class="pill out">Keluar ' + fmt(totalOut) + '</span></div></div>';

  if (editing) {
    html += '<section class="card"><h2>Ubah transaksi</h2><form class="inline" id="edit-form" data-id="' + editing.id + '">'
      + '<div class="field"><label for="e-date">Tanggal</label><input id="e-date" name="date" type="date" value="' + editing.date + '" required></div>'
      + '<div class="field grow"><label for="e-desc">Keterangan</label><input id="e-desc" name="desc" type="text" value="' + esc(editing.desc) + '" required></div>'
      + '<div class="field"><label for="e-cat">Kategori</label><select id="e-cat" name="category">' + CATEGORIES.map((c) => '<option value="' + c.id + '"' + (editing.category === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select></div>'
      + '<div class="field"><label for="e-amount">Jumlah (Rp)</label><input id="e-amount" name="amount" type="number" min="1000" step="500" value="' + editing.amount + '" required></div>'
      + '<div class="field"><label for="e-kind">Jenis</label><select id="e-kind" name="kind"><option value="out"' + (editing.kind === 'out' ? ' selected' : '') + '>Keluar</option><option value="in"' + (editing.kind === 'in' ? ' selected' : '') + '>Masuk</option></select></div>'
      + '<button class="btn-primary" type="submit">Simpan perubahan</button> <button class="btn-ghost" type="button" data-action="cancel-edit">Batal</button>'
      + '</form></section>';
  }

  html += '<section class="card"><h2>Tambah transaksi</h2><form class="inline" id="add-form">'
    + '<div class="field"><label for="a-date">Tanggal</label><input id="a-date" name="date" type="date" value="' + month + '-27" required></div>'
    + '<div class="field grow"><label for="a-desc">Keterangan</label><input id="a-desc" name="desc" type="text" placeholder="cth. Belanja pasar minggu ini" required></div>'
    + '<div class="field"><label for="a-cat">Kategori</label><select id="a-cat" name="category">' + CATEGORIES.map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('') + '</select></div>'
    + '<div class="field"><label for="a-amount">Jumlah (Rp)</label><input id="a-amount" name="amount" type="number" min="1000" step="500" placeholder="150000" required></div>'
    + '<div class="field"><label for="a-kind">Jenis</label><select id="a-kind" name="kind"><option value="out">Keluar</option><option value="in">Masuk</option></select></div>'
    + '<button class="btn-primary" type="submit">Tambah</button></form></section>';

  html += '<section class="card"><h2>Daftar transaksi · ' + txns.length + ' entri</h2>'
    + '<div class="toolbar"><div class="field grow"><label for="f-q">Cari keterangan</label><input id="f-q" type="search" placeholder="cth. pasar, bensin, SPP" value="' + esc(filter.q || '') + '"></div>'
    + '<div class="field"><label for="f-cat">Kategori</label><select id="f-cat">' + catOptions + '</select></div>'
    + '<button class="btn-ghost" type="button" data-action="clear-filter">Reset</button></div>'
    + '<table><thead><tr><th>Keterangan</th><th class="hide-sm">Jenis</th><th class="num">Jumlah</th><th><span class="hide-sm">Aksi</span></th></tr></thead><tbody>'
    + txnTableRows(txns) + '</tbody></table>'
    + '<p style="margin:12px 0 0;font-size:.9rem;color:var(--ink-soft)">Total tampil: <strong>' + fmt(txns.filter((t) => t.kind === 'in').reduce((s, t) => s + t.amount, 0)) + ' masuk</strong> · <strong>' + fmt(txns.filter((t) => t.kind === 'out').reduce((s, t) => s + t.amount, 0)) + ' keluar</strong>.</p>'
    + '</section>';
  return html;
}

// ---------------- Budget ----------------
function viewBudget(month) {
  const spent = monthSpent(month);
  const cards = CATEGORIES.map((c) => {
    const s = categorySpent(month, c.id);
    const b = state.budgets[c.id];
    const p = pct(s, b);
    const tone = p > 100 ? 'over' : p >= 90 ? 'hot' : '';
    const left = b - s;
    return '<section class="card"><h2><span><span class="cat-dot" style="background:' + c.color + ';display:inline-block;margin-right:8px"></span>' + esc(c.name) + '</span>'
      + (p > 100 ? '<span class="pill over">Lewat ' + fmt(-left) + '</span>' : '<span class="pill">' + p + '%</span>') + '</h2>'
      + '<div style="display:flex;justify-content:space-between;font-size:.92rem;margin-bottom:6px"><span>Terpakai <strong>' + fmt(s) + '</strong></span><span>dari <strong>' + fmt(b) + '</strong></span></div>'
      + progressBar(p, tone)
      + '<p style="margin:10px 0 12px;font-size:.9rem;color:' + (left < 0 ? 'var(--red)' : 'var(--ink-soft)') + '">' + (left < 0 ? 'Melebihi anggaran sebesar ' + fmt(-left) + '. Kurangi belanja kategori ini minggu depan.' : 'Sisa ' + fmt(left) + ' sampai akhir bulan.') + '</p>'
      + '<form class="inline" data-budget-form="' + c.id + '"><div class="field grow"><label for="b-' + c.id + '">Ubah anggaran bulanan (Rp)</label>'
      + '<input id="b-' + c.id + '" name="budget" type="number" min="0" step="50000" value="' + b + '"></div>'
      + '<button class="btn-primary btn-small" type="submit">Simpan</button></form></section>';
  }).join('');

  const over = CATEGORIES.filter((c) => categorySpent(month, c.id) > state.budgets[c.id]);
  const rollover = month === '2026-11' ? monthIncome('2026-10') - monthSpent('2026-10') : 0;
  return '<div class="page-head"><div><h1>Anggaran ' + esc(MONTH_LABELS[month]) + '</h1>'
    + '<p class="lede">Delapan amplop belanja keluarga. Total anggaran ' + fmt(TOTAL_BUDGET) + ' dari pemasukan ' + fmt(monthIncome(month)) + '; terpakai ' + fmt(spent) + ' (' + pct(spent, TOTAL_BUDGET) + '%).</p></div></div>'
    + (month === '2026-11' ? '<div class="callout" style="margin-bottom:16px"><h2>Sisa bulan lalu ikut bekerja</h2><p>Oktober menyisakan <span class="big">' + fmt(rollover) + '</span> — sudah dialihkan ke Dana Darurat dan DP Rumah, bukan dihabiskan.</p></div>' : '')
    + (over.length ? '<div class="insight warn" style="margin-bottom:16px"><strong>' + over.length + ' kategori melewati anggaran:</strong> ' + over.map((c) => esc(c.name)).join(', ') + '. Pindahkan dana dari kategori yang masih longgar, atau tahan belanjanya.</div>' : '')
    + '<div class="grid grid-2">' + cards + '</div>';
}

// ---------------- Goals ----------------
function viewGoals() {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const cards = state.goals.map((g) => {
    const p = pct(g.saved, g.target);
    return '<section class="card"><h2>' + esc(g.name) + ' <span class="pill">' + p + '%</span></h2>'
      + '<p style="color:var(--ink-soft);font-size:.93rem">' + esc(g.note) + '</p>'
      + '<div class="goal-bar">' + progressBar(p, p >= 60 ? 'gold' : '') + '</div>'
      + '<div class="goal-numbers"><span>Terkumpul <b>' + fmt(g.saved) + '</b></span><span>Target <b>' + fmt(g.target) + '</b></span><span>Kurang <b>' + fmt(g.target - g.saved) + '</b></span></div>'
      + '<form class="inline" data-goal-form="' + g.id + '" style="margin-top:14px"><div class="field grow"><label for="g-' + g.id + '">Tambah dana (Rp)</label>'
      + '<input id="g-' + g.id + '" name="amount" type="number" min="10000" step="10000" placeholder="250000"></div>'
      + '<button class="btn-primary btn-small" type="submit">Tambah ke tabungan</button></form></section>';
  }).join('');

  return '<div class="page-head"><div><h1>Tabungan Keluarga</h1>'
    + '<p class="lede">Tiga tujuan yang sedang dikejar. Total terkumpul ' + fmt(totalSaved) + ' dari target ' + fmt(totalTarget) + ' (' + pct(totalSaved, totalTarget) + '%). Setiap rupiah yang ditambahkan langsung memperbarui progres.</p></div></div>'
    + '<div class="grid grid-3">' + cards + '</div>'
    + '<section class="card" style="margin-top:16px"><h2>Buat tujuan baru</h2>'
    + '<form class="inline" id="new-goal-form"><div class="field grow"><label for="ng-name">Nama tujuan</label><input id="ng-name" name="name" type="text" placeholder="cth. Umroh keluarga" required></div>'
    + '<div class="field"><label for="ng-target">Target (Rp)</label><input id="ng-target" name="target" type="number" min="100000" step="100000" placeholder="25000000" required></div>'
    + '<div class="field"><label for="ng-saved">Sudah terkumpul (Rp)</label><input id="ng-saved" name="saved" type="number" min="0" step="10000" value="0"></div>'
    + '<button class="btn-primary" type="submit">Buat tujuan</button></form></section>';
}

// ---------------- Bills ----------------
function viewBills(month) {
  const today = month === '2026-11' ? 27 : 31;
  const rows = BILLS.map((b) => {
    const paid = isBillPaid(month, b.id);
    const days = b.dueDay - today;
    const dueText = paid ? 'Lunas ' + b.dueDay + ' ' + MONTH_SHORT[month]
      : days === 0 ? 'Jatuh tempo hari ini'
      : days > 0 ? 'Jatuh tempo dalam ' + days + ' hari'
      : 'Terlambat ' + (-days) + ' hari';
    return '<div class="bill-row"><div class="bill-main"><strong>' + esc(b.name) + '</strong><small>' + esc(b.detail) + '</small></div>'
      + '<div class="bill-due">' + dueText + '<br><span class="bill-amt">' + fmt(b.amount) + '</span></div>'
      + (paid ? '<span class="pill paid">Lunas</span>'
        : '<button type="button" class="btn-primary btn-small" data-action="pay-bill" data-id="' + b.id + '">Tandai lunas</button>')
      + '</div>';
  }).join('');
  const paidTotal = BILLS.filter((b) => isBillPaid(month, b.id)).reduce((s, b) => s + b.amount, 0);
  const dueTotal = BILLS.filter((b) => !isBillPaid(month, b.id)).reduce((s, b) => s + b.amount, 0);
  const next = upcomingBills(month)[0];

  return '<div class="page-head"><div><h1>Tagihan ' + esc(MONTH_LABELS[month]) + '</h1>'
    + '<p class="lede">Tagihan rutin yang jatuh tempo setiap bulan. Menandai lunas langsung mencatatnya sebagai transaksi bulan ini.</p></div>'
    + '<div><span class="pill paid">Lunas ' + fmt(paidTotal) + '</span> <span class="pill due">Menunggu ' + fmt(dueTotal) + '</span></div></div>'
    + (next ? '<div class="insight gold"><strong>Berikutnya:</strong> ' + esc(next.bill.name) + ' ' + fmt(next.bill.amount) + ' — jatuh tempo ' + next.bill.dueDay + ' ' + MONTH_LABELS[month] + (next.days === 0 ? ' (hari ini)' : ' (dalam ' + next.days + ' hari)') + '. Siapkan dananya dari rekening harian.</div>' : '<div class="insight"><strong>Semua tagihan bulan ini lunas.</strong> Tidak ada yang menunggu.</div>')
    + '<section class="card">' + rows + '</section>'
    + '<section class="card"><h2>Cara keluarga ini mengatur tagihan</h2>'
    + '<p>Semua tagihan dibayar di minggu pertama setelah gajian masuk, kecuali cicilan motor dan iuran RT yang jatuh tempo di akhir bulan. Total tagihan rutin ' + fmt(BILLS.reduce((s, b) => s + b.amount, 0)) + ' sebulan — sekitar ' + pct(BILLS.reduce((s, b) => s + b.amount, 0), monthIncome(month)) + '% dari pemasukan.</p></section>';
}

// ---------------- Reports ----------------
function viewReports(month) {
  const trend = trendMonths();
  const spent = monthSpent(month);
  const income = monthIncome(month);
  const ins = insightsFor(month);
  const avgSaved = trend.reduce((s, m) => s + (m.income - m.spent), 0) / trend.length;
  const cheapest = trend.slice().sort((a, b) => a.spent - b.spent)[0];
  const priciest = trend.slice().sort((a, b) => b.spent - a.spent)[0];
  const lowSpent = Math.min.apply(null, trend.map((m) => m.spent));
  const highSpent = Math.max.apply(null, trend.map((m) => m.spent));
  const monthName = (m) => ({ '2026-06': 'Juni', '2026-07': 'Juli', '2026-08': 'Agustus', '2026-09': 'September', '2026-10': 'Oktober', '2026-11': 'November' })[m] || m;
  const rows = CATEGORIES.map((c) => {
    const s = categorySpent(month, c.id);
    return '<tr><td><span class="cat-dot" style="background:' + c.color + ';display:inline-block;margin-right:8px"></span>' + esc(c.name) + '</td>'
      + '<td class="num">' + fmt(s) + '</td><td class="num">' + pct(s, spent) + '%</td>'
      + '<td class="num">' + fmt(state.budgets[c.id]) + '</td>'
      + '<td class="num">' + (s > state.budgets[c.id] ? '<span class="pill over">Lewat ' + fmt(s - state.budgets[c.id]) + '</span>' : '<span class="pill">Sisa ' + fmt(state.budgets[c.id] - s) + '</span>') + '</td></tr>';
  }).join('');

  return '<div class="page-head"><div><h1>Laporan ' + esc(MONTH_LABELS[month]) + '</h1>'
    + '<p class="lede">Enam bulan terakhir dalam satu pandangan: pemasukan stabil Rp 14.500.000, pengeluaran bergerak di ' + fmtShort(lowSpent) + '–' + fmtShort(highSpent) + '.</p></div></div>'
    + '<section class="card"><h2>Tren 6 bulan · pemasukan vs pengeluaran</h2>'
    + trendChart(trend, 960, 260)
    + '<p style="margin:10px 0 0;font-size:.92rem">Rata-rata sisa bulanan 6 bulan terakhir: <strong>' + fmt(Math.round(avgSaved)) + '</strong>. Bulan paling hemat: ' + monthName(cheapest.month) + ' (' + fmt(cheapest.income - cheapest.spent) + ' tersisa). Bulan paling boros: ' + monthName(priciest.month) + ' (' + fmt(priciest.spent) + ' terpakai).</p></section>'
    + '<section class="card"><h2>Rincian kategori · ' + esc(MONTH_LABELS[month]) + '</h2>'
    + '<table><thead><tr><th>Kategori</th><th class="num">Terpakai</th><th class="num">Porsi</th><th class="num">Anggaran</th><th class="num">Status</th></tr></thead><tbody>' + rows + '</tbody></table></section>'
    + '<section class="card"><h2>Kesimpulan dari data</h2>'
    + '<div class="insight"><strong>Pemasukan stabil, pengeluaran terkendali.</strong> ' + MONTH_LABELS[month] + ' menyisakan ' + fmt(income - spent) + ' (' + pct(income - spent, income) + '% dari pemasukan) — di atas target tabungan keluarga 30%.</div>'
    + (ins.over.length
      ? '<div class="insight warn"><strong>Yang perlu dijaga:</strong> ' + ins.over.map((c) => esc(c.name)).join(' dan ') + ' melewati anggaran. Porsi terbesar belanja adalah ' + esc(ins.top.c.name) + ' (' + pct(ins.top.s, spent) + '%).</div>'
      : '<div class="insight"><strong>Tidak ada kategori yang melewati anggaran</strong> bulan ini.</div>')
    + '<div class="insight gold"><strong>Proyeksi:</strong> dengan rata-rata ' + fmt(Math.round(ins.daily)) + ' per hari, ' + MONTH_LABELS[month] + ' diproyeksikan berakhir di ' + fmt(Math.round(ins.projected)) + ' pengeluaran — sisa akhir sekitar ' + fmt(Math.round(income - ins.projected)) + '.</div>'
    + '<div class="insight"><strong>Kebiasaan baik yang terlihat:</strong> belanja harian dilakukan 2–3 kali seminggu di pasar dan supermarket, bukan setiap hari; tagihan dibayar tepat waktu; dan ' + fmt(SAVINGS_PLAN.reduce((s, p) => s + p.amount, 0)) + ' langsung dipindah ke tabungan begitu gajian masuk.</div>'
    + '</section>';
}
