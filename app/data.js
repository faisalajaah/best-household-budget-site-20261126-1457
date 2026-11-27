// data.js — the household's money: categories, budgets, transactions, bills, goals.
// Everything is in Rupiah. Category totals are always computed from the
// transactions, so the dashboard, budget page and reports can never disagree.
// The store keeps edits in localStorage; the seed below is the starting point.

const MONTHS = ['2026-10', '2026-11'];
const MONTH_LABELS = { '2026-10': 'Oktober 2026', '2026-11': 'November 2026' };
const MONTH_SHORT = { '2026-10': 'Okt', '2026-11': 'Nov' };

const CATEGORIES = [
  { id: 'groceries', name: 'Belanja Harian', budget: 3000000, color: '#2f7d4f' },
  { id: 'dining', name: 'Makan di Luar', budget: 800000, color: '#c2703d' },
  { id: 'transport', name: 'Transport & Bensin', budget: 1200000, color: '#3d6f8e' },
  { id: 'bills', name: 'Tagihan & Utilitas', budget: 1500000, color: '#7a6aa8' },
  { id: 'home', name: 'Rumah Tangga', budget: 700000, color: '#a8863d' },
  { id: 'education', name: 'Pendidikan Anak', budget: 1000000, color: '#4f9d8f' },
  { id: 'health', name: 'Kesehatan', budget: 500000, color: '#c25b7a' },
  { id: 'fun', name: 'Hiburan & Rekreasi', budget: 600000, color: '#d97706' },
];
const TOTAL_BUDGET = CATEGORIES.reduce((s, c) => s + c.budget, 0); // 9.300.000

// One row: [day of month, description, category, amount]. kind is 'out' unless noted.
const SEED_TXNS = {
  '2026-11': [
    [1, 'Gaji Ayah — PT Maju Bersama', 'income', 9000000, 'in'],
    [1, 'Bensin Pertalite', 'transport', 150000],
    [1, 'Pasar Tradisional — sayur & lauk', 'groceries', 385000],
    [2, 'Warteg — makan siang keluarga', 'dining', 45000],
    [2, 'Buku & alat tulis anak', 'education', 185000],
    [3, 'Supermarket — belanja mingguan', 'groceries', 612500],
    [3, 'Sabun, deterjen & pembersih', 'home', 86000],
    [4, 'Tol & parkir', 'transport', 85000],
    [5, 'Gaji Ibu — toko online', 'income', 5500000, 'in'],
    [5, 'Listrik PLN', 'bills', 412500],
    [5, 'Bakso & es teh', 'dining', 78000],
    [6, 'Sayur & buah — tukang sayur', 'groceries', 128000],
    [6, 'Air PDAM', 'bills', 128000],
    [6, 'Apotek — vitamin & obat', 'health', 96000],
    [7, 'Bensin Pertalite', 'transport', 150000],
    [7, 'Internet & TV kabel', 'bills', 299000],
    [7, 'Bioskop keluarga', 'fun', 185000],
    [8, 'Restoran keluarga — makan malam', 'dining', 245000],
    [9, 'Supermarket — belanja mingguan', 'groceries', 547250],
    [9, 'Les matematika anak', 'education', 400000],
    [10, 'Ojek online', 'transport', 96000],
    [10, 'BPJS Kesehatan', 'bills', 210000],
    [11, 'Peralatan dapur — panci & wajan', 'home', 215000],
    [12, 'Pasar Tradisional — sayur & lauk', 'groceries', 246000],
    [12, 'SPP sekolah anak', 'bills', 450000],
    [13, 'Bensin Pertalite', 'transport', 150000],
    [13, 'Dokter gigi — kontrol anak', 'health', 150000],
    [14, 'Kopi & roti — sarapan akhir pekan', 'dining', 62500],
    [14, 'Langganan streaming', 'fun', 54000],
    [15, 'Supermarket — belanja mingguan', 'groceries', 592000],
    [15, 'Seragam & tas sekolah', 'education', 275000],
    [16, 'Servis motor — ganti oli', 'transport', 285000],
    [17, 'Tissue & pembersih rumah', 'home', 74500],
    [18, 'Toko kelontong — kebutuhan dapur', 'groceries', 96500],
    [19, 'Ayam geprek — makan siang', 'dining', 54000],
    [20, 'Bensin Pertalite', 'transport', 150000],
    [20, 'Obat flu & demam', 'health', 64500],
    [21, 'Supermarket — belanja mingguan', 'groceries', 384750],
    [21, 'Kursus bahasa Inggris anak', 'education', 150000],
    [21, 'Mainan edukasi anak', 'fun', 129000],
    [22, 'Lampu & perbaikan kecil rumah', 'home', 148000],
    [23, 'Restoran — makan malam keluarga', 'dining', 168000],
    [24, 'Pasar Tradisional — sayur & lauk', 'groceries', 178000],
    [25, 'Parkir & tol', 'transport', 62000],
    [25, 'Karaoke keluarga', 'fun', 98000],
    [26, 'Supermarket — belanja mingguan', 'groceries', 289000],
  ],
  '2026-10': [
    [1, 'Gaji Ayah — PT Maju Bersama', 'income', 9000000, 'in'],
    [1, 'Bensin Pertalite', 'transport', 150000],
    [2, 'Pasar Tradisional — sayur & lauk', 'groceries', 372000],
    [3, 'Warteg — makan siang keluarga', 'dining', 42000],
    [4, 'Supermarket — belanja mingguan', 'groceries', 598500],
    [5, 'Gaji Ibu — toko online', 'income', 5500000, 'in'],
    [5, 'Listrik PLN', 'bills', 398000],
    [6, 'Buku & alat tulis anak', 'education', 175000],
    [7, 'Air PDAM', 'bills', 121500],
    [8, 'Bakso & es teh', 'dining', 71000],
    [9, 'Sayur & buah — tukang sayur', 'groceries', 141000],
    [10, 'Internet & TV kabel', 'bills', 299000],
    [11, 'Bensin Pertalite', 'transport', 150000],
    [12, 'BPJS Kesehatan', 'bills', 210000],
    [13, 'Supermarket — belanja mingguan', 'groceries', 521750],
    [14, 'Bioskop keluarga', 'fun', 165000],
    [15, 'Les matematika anak', 'education', 400000],
    [16, 'Pasar Tradisional — sayur & lauk', 'groceries', 234000],
    [17, 'Ojek online', 'transport', 92000],
    [18, 'Restoran keluarga — makan malam', 'dining', 228000],
    [19, 'SPP sekolah anak', 'bills', 458500],
    [20, 'Bensin Pertalite', 'transport', 150000],
    [21, 'Peralatan dapur', 'home', 198000],
    [22, 'Supermarket — belanja mingguan', 'groceries', 589000],
    [23, 'Kopi & roti — sarapan akhir pekan', 'dining', 58500],
    [24, 'Seragam & tas sekolah', 'education', 250000],
    [25, 'Servis motor — ganti oli', 'transport', 275000],
    [26, 'Apotek — vitamin & obat', 'health', 88000],
    [27, 'Tissue & pembersih rumah', 'home', 81500],
    [28, 'Pasar Tradisional — sayur & lauk', 'groceries', 283750],
    [29, 'Bensin Pertalite', 'transport', 150000],
    [30, 'Kursus bahasa Inggris anak', 'education', 150000],
    [30, 'Dokter — kontrol kesehatan', 'health', 132500],
    [31, 'Ayam geprek — makan siang', 'dining', 142000],
    [31, 'Langganan streaming', 'fun', 54000],
    [31, 'Sabun, deterjen & pembersih', 'home', 92000],
    [31, 'Obat flu & demam', 'health', 64500],
    [31, 'Mainan edukasi anak', 'fun', 98000],
    [31, 'Lampu & perbaikan kecil rumah', 'home', 240500],
    [31, 'Karaoke keluarga', 'fun', 61000],
  ],
};

// Monthly totals for the months before October, for the 6-month trend.
const TREND_PAST = [
  { month: '2026-06', income: 14500000, spent: 8940000 },
  { month: '2026-07', income: 14500000, spent: 9210000 },
  { month: '2026-08', income: 14500000, spent: 8675000 },
  { month: '2026-09', income: 14500000, spent: 9050000 },
];

const SEED_GOALS = [
  { id: 'dana-darurat', name: 'Dana Darurat', target: 20000000, saved: 12450000, color: '#1f5c3d', note: 'Target 6 bulan pengeluaran pokok. Disimpan di rekening terpisah.' },
  { id: 'liburan', name: 'Liburan Keluarga', target: 8000000, saved: 5200000, color: '#c2703d', note: 'Liburan ke Yogyakarta, akhir tahun. Tiket & hotel sudah dicek.' },
  { id: 'dp-rumah', name: 'DP Rumah', target: 150000000, saved: 38750000, color: '#3d6f8e', note: 'Rumah tipe 45 di pinggiran kota. Target tercapai dalam 3 tahun.' },
];

const BILLS = [
  { id: 'listrik', name: 'Listrik PLN', amount: 412500, dueDay: 5, category: 'bills', detail: 'Token & tagihan bulanan, daya 1300 VA' },
  { id: 'air', name: 'Air PDAM', amount: 128000, dueDay: 6, category: 'bills', detail: 'Pemakaian air bersih bulanan' },
  { id: 'internet', name: 'Internet & TV Kabel', amount: 299000, dueDay: 7, category: 'bills', detail: 'Paket 50 Mbps + TV kabel' },
  { id: 'bpjs', name: 'BPJS Kesehatan', amount: 210000, dueDay: 10, category: 'bills', detail: 'Iuran 3 anggota keluarga, kelas 2' },
  { id: 'spp', name: 'SPP Sekolah Anak', amount: 450000, dueDay: 12, category: 'bills', detail: 'SPP bulanan, kelas 4 SD' },
  { id: 'cicilan-motor', name: 'Cicilan Motor', amount: 685000, dueDay: 28, category: 'bills', detail: 'Angsuran ke-14 dari 35, jatuh tempo 28 November' },
  { id: 'iuran-rt', name: 'Iuran RT & Keamanan', amount: 75000, dueDay: 30, category: 'bills', detail: 'Iuran lingkungan & satpam, dibayar ke bendahara RT' },
];

// How November's leftover is split into savings (shown on the dashboard).
const SAVINGS_PLAN = [
  { goalId: 'dana-darurat', amount: 2000000 },
  { goalId: 'liburan', amount: 1000000 },
  { goalId: 'dp-rumah', amount: 2400000 },
];

const STORE_KEY = 'rumahtangga-v1';

function seedState() {
  const txns = {};
  for (const m of MONTHS) {
    txns[m] = SEED_TXNS[m].map((row, i) => ({
      id: m + '-' + (i + 1),
      date: m + '-' + String(row[0]).padStart(2, '0'),
      desc: row[1],
      category: row[2],
      amount: row[3],
      kind: row[4] || 'out',
    }));
  }
  return {
    month: '2026-11',
    txns,
    budgets: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.budget])),
    goals: SEED_GOALS.map((g) => ({ ...g })),
    paidBills: { '2026-10': BILLS.map((b) => b.id), '2026-11': ['listrik', 'air', 'internet', 'bpjs', 'spp'] },
    nextId: 1000,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.txns && parsed.txns['2026-11']) return parsed;
    }
  } catch (e) { /* corrupted storage: fall back to the seed */ }
  return seedState();
}

let state = loadState();
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked: keep in-memory */ }
}
function resetState() { state = seedState(); saveState(); }

// ---- figures, always computed from the transactions ----
function monthTxns(month) { return (state.txns[month] || []).slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)); }
function monthIncome(month) { return (state.txns[month] || []).filter((t) => t.kind === 'in').reduce((s, t) => s + t.amount, 0); }
function monthSpent(month) { return (state.txns[month] || []).filter((t) => t.kind === 'out').reduce((s, t) => s + t.amount, 0); }
function categorySpent(month, catId) { return (state.txns[month] || []).filter((t) => t.kind === 'out' && t.category === catId).reduce((s, t) => s + t.amount, 0); }
function categoryOf(id) { return CATEGORIES.find((c) => c.id === id) || { id, name: id, budget: 0, color: '#888' }; }
function goalById(id) { return state.goals.find((g) => g.id === id); }
function billById(id) { return BILLS.find((b) => b.id === id); }
function isBillPaid(month, billId) { return (state.paidBills[month] || []).includes(billId); }
function trendMonths() {
  const out = TREND_PAST.map((t) => ({ ...t }));
  for (const m of MONTHS) out.push({ month: m, income: monthIncome(m), spent: monthSpent(m) });
  return out;
}

// ---- formatting ----
function fmt(n) { return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }
function fmtShort(n) {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt';
  if (n >= 1000) return 'Rp ' + Math.round(n / 1000).toLocaleString('id-ID') + ' rb';
  return fmt(n);
}
function pct(part, whole) { return whole > 0 ? Math.round((part / whole) * 100) : 0; }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';'); }
function dayLabel(dateStr) {
  const d = Number(dateStr.slice(8, 10));
  const m = dateStr.slice(0, 7);
  return d + ' ' + (MONTH_SHORT[m] || m);
}
