// charts.js — hand-drawn SVG charts. No library, no network: every chart is
// built from the numbers passed in, so it can never disagree with the tables.

function donutChart(parts, size, thickness) {
  // parts: [{label, value, color}]. Returns an SVG string with a centre total.
  const total = parts.reduce((s, p) => s + p.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = parts.filter((p) => p.value > 0).map((p) => {
    const frac = p.value / total;
    const dash = frac * c;
    const gap = c - dash;
    const svg = '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + p.color + '" stroke-width="' + thickness + '" stroke-dasharray="' + dash.toFixed(2) + ' ' + gap.toFixed(2) + '" stroke-dashoffset="' + (-offset).toFixed(2) + '" />';
    offset += dash;
    return svg;
  }).join('');
  const totalLabel = typeof fmtShort === 'function' ? fmtShort(total) : String(total);
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Diagram pengeluaran per kategori, total ' + totalLabel + '">'
    + '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#ece5d2" stroke-width="' + thickness + '" />'
    + arcs
    + '<text x="50%" y="47%" text-anchor="middle" class="donut-center">Total belanja</text>'
    + '<text x="50%" y="58%" text-anchor="middle" class="donut-total">' + totalLabel + '</text>'
    + '</svg>';
}

function trendChart(months, width, height) {
  // Grouped bars: income (green) vs spending (terracotta) per month.
  const max = Math.max.apply(null, months.map((m) => Math.max(m.income, m.spent))) * 1.08;
  const padL = 8, padB = 26, padT = 12;
  const plotH = height - padB - padT;
  const slot = (width - padL * 2) / months.length;
  const bw = Math.min(30, slot * 0.28);
  let bars = '';
  months.forEach((m, i) => {
    const x0 = padL + i * slot + slot / 2;
    const hIn = (m.income / max) * plotH;
    const hOut = (m.spent / max) * plotH;
    const yBase = padT + plotH;
    bars += '<rect x="' + (x0 - bw - 3).toFixed(1) + '" y="' + (yBase - hIn).toFixed(1) + '" width="' + bw + '" height="' + hIn.toFixed(1) + '" rx="3" fill="#1f5c3d" />'
      + '<rect x="' + (x0 + 3).toFixed(1) + '" y="' + (yBase - hOut).toFixed(1) + '" width="' + bw + '" height="' + hOut.toFixed(1) + '" rx="3" fill="#c05a2e" />'
      + '<text x="' + x0.toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="12" fill="#4c584a">' + monthShortLabel(m.month) + '</text>';
  });
  return '<svg width="100%" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Grafik pemasukan dan pengeluaran 6 bulan terakhir">'
    + '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (width - padL) + '" y2="' + (padT + plotH) + '" stroke="#e3dcc9" stroke-width="1" />'
    + bars + '</svg>'
    + '<p style="font-size:.85rem;color:#7d7668;margin:6px 0 0"><span style="color:#1f5c3d">■</span> Pemasukan &nbsp; <span style="color:#c05a2e">■</span> Pengeluaran</p>';
}

function monthShortLabel(month) {
  const names = { '2026-06': 'Jun', '2026-07': 'Jul', '2026-08': 'Agu', '2026-09': 'Sep', '2026-10': 'Okt', '2026-11': 'Nov' };
  return names[month] || month;
}

function progressBar(percent, tone) {
  const p = Math.max(0, Math.min(100, percent));
  const cls = tone === 'over' ? 'bar over' : tone === 'hot' ? 'bar hot' : tone === 'gold' ? 'bar gold' : 'bar';
  return '<div class="' + cls + '" role="progressbar" aria-valuenow="' + Math.round(p) + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + p + '%"></i></div>';
}
