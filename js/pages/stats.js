/**
 * Stats page — cohort tables, marketing channel sort, sales matrix, period filter.
 * Extracted from inline <script> block in stats.html.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Drawer is wired via js/shared/drawer.js (loadNav + tDrawer global)

    // === Cohort dimension data ===
    const fmtKRW = n => '₩ ' + n.toLocaleString('ko-KR');
    const fmtM = n => '₩ ' + (n / 1_000_000).toFixed(1) + 'M';
    const cohortData = {
        age: {
            rows: [
                { label: '20대 (M)', count: 186, ppu: 1420000, attend: 82.1, refund: 7.5 },
                { label: '20대 (F)', count: 214, ppu: 1580000, attend: 85.4, refund: 5.1 },
                { label: '30대 (M)', count: 142, ppu: 2210000, attend: 88.7, refund: 3.9 },
                { label: '30대 (F)', count: 168, ppu: 2640000, attend: 91.2, refund: 2.4, highlight: true },
                { label: '40대 (M)', count: 62,  ppu: 1890000, attend: 79.3, refund: 8.2 },
                { label: '40대 (F)', count: 81,  ppu: 1720000, attend: 84.6, refund: 4.8 },
                { label: '50대+',    count: 42,  ppu: 2180000, attend: 86.1, refund: 3.6 },
            ],
            insight: '<b>30대 여성</b>이 매출 기여 31% 이상으로 가장 높은 비중. 평균 객단가 ₩2.64M, 환불율 2.4%로 LTV 안정성 1위.'
        },
        gender: {
            rows: [
                { label: '남성', count: 432, ppu: 1840000, attend: 84.0, refund: 6.4 },
                { label: '여성', count: 463, ppu: 2010000, attend: 86.7, refund: 3.9, highlight: true },
            ],
            insight: '여성 고객이 전체의 51.7%이며 평균 객단가 +9%, 환불율 -2.5%p로 모든 지표에서 우위.'
        },
        level: {
            rows: [
                { label: 'LV0',  count: 142, ppu: 1280000, attend: 78.4, refund: 9.1 },
                { label: 'LV1',  count: 268, ppu: 1520000, attend: 83.1, refund: 7.4 },
                { label: 'LV2',  count: 214, ppu: 1840000, attend: 85.6, refund: 5.2 },
                { label: 'LV3',  count: 168, ppu: 2240000, attend: 89.4, refund: 2.8, highlight: true },
                { label: 'LV4',  count: 103, ppu: 2680000, attend: 92.1, refund: 1.6 },
            ],
            insight: 'LV3 이상은 환불율 평균 2.2%로 LV0~2 평균(7.4%)의 1/3 수준. 레벨 도달이 리텐션의 강력한 시그널.'
        },
        motive: {
            rows: [
                { label: '직장인 자기개발',     count: 320, ppu: 2180000, attend: 88.4, refund: 3.8, highlight: true },
                { label: '학생 (대입/취업)',   count: 246, ppu: 1240000, attend: 84.1, refund: 6.2 },
                { label: '시험 (TOEIC/JLPT)',  count: 158, ppu: 1680000, attend: 87.2, refund: 4.1 },
                { label: '해외 거주/유학 대비', count: 96,  ppu: 2480000, attend: 89.6, refund: 2.9 },
                { label: '취미 / 자기만족',    count: 75,  ppu: 1140000, attend: 76.4, refund: 8.4 },
            ],
            insight: '직장인 동기 그룹이 매출 비중 약 41%로 최상위. 해외 대비 그룹은 객단가 ₩2.48M로 인당 기여가 가장 높음.'
        },
        abroad: {
            rows: [
                { label: '해외 경험 있음', count: 312, ppu: 2360000, attend: 89.4, refund: 3.1, highlight: true },
                { label: '해외 경험 없음', count: 583, ppu: 1690000, attend: 83.7, refund: 6.0 },
            ],
            insight: '해외 경험자는 35%에 불과하나 매출 기여 약 47%. 객단가 +40%, 환불율 -2.9%p — 마케팅 타겟팅 우선순위 상위.'
        },
    };

    const cohortBody = document.getElementById('cohort-tbody');
    const cohortFoot = document.getElementById('cohort-tfoot');
    const cohortInsight = document.getElementById('cohort-insight');

    let _cohortCurrentDim = 'age';
    function renderCohort(dim) {
        _cohortCurrentDim = dim;
        const data = cohortData[dim];
        if (!data) return;
        const sortKey = document.getElementById('cohort-sort')?.value || 'revenue-desc';
        const sortedRows = [...data.rows].sort((a, b) => {
            const aRev = a.count * a.ppu, bRev = b.count * b.ppu;
            switch (sortKey) {
                case 'count-desc':   return b.count - a.count;
                case 'ppu-desc':     return b.ppu - a.ppu;
                case 'attend-desc':  return b.attend - a.attend;
                case 'refund-asc':   return a.refund - b.refund;
                default:             return bRev - aRev;
            }
        });
        const totalCount = sortedRows.reduce((s, r) => s + r.count, 0);
        const totalRev   = sortedRows.reduce((s, r) => s + r.count * r.ppu, 0);
        const avgAttend  = sortedRows.reduce((s, r) => s + r.attend * r.count, 0) / totalCount;
        const avgRefund  = sortedRows.reduce((s, r) => s + r.refund * r.count, 0) / totalCount;

        cohortBody.innerHTML = sortedRows.map(r => {
            const rev = r.count * r.ppu;
            const share = (rev / totalRev) * 100;
            const barColor = r.highlight ? 'bg-amber-500' : 'bg-brand-500';
            const rowBg = r.highlight ? ' style="background:#fefce8"' : '';
            return `<tr${rowBg}>
                <td><b>${r.label}${r.highlight ? ' <span class="text-[10px] text-amber-700 ml-1">★</span>' : ''}</b></td>
                <td class="num">${r.count.toLocaleString('ko-KR')}명</td>
                <td class="num">${fmtKRW(r.ppu)}</td>
                <td class="num font-bold">${fmtM(rev)}</td>
                <td class="num">${r.attend.toFixed(1)}%</td>
                <td class="num">${r.refund.toFixed(1)}%</td>
                <td><div class="flex items-center gap-2"><div class="bar-track flex-1"><div class="bar-fill ${barColor}" style="width:${share.toFixed(1)}%"></div></div><span class="text-[11px] font-bold stat-num w-12 text-right">${share.toFixed(1)}%</span></div></td>
            </tr>`;
        }).join('');

        cohortFoot.innerHTML = `<tr>
            <td>합계</td>
            <td class="num">${totalCount.toLocaleString('ko-KR')}명</td>
            <td class="num">평균 ${fmtKRW(Math.round(totalRev / totalCount))}</td>
            <td class="num">${fmtM(totalRev)}</td>
            <td class="num">${avgAttend.toFixed(1)}%</td>
            <td class="num">${avgRefund.toFixed(1)}%</td>
            <td>—</td>
        </tr>`;

        cohortInsight.innerHTML = '<i class="ph ph-info text-slate-400 mr-1"></i><b>해석</b>: ' + data.insight;
    }

    // === Cohort dimension toggle ===
    const dimBtns = document.querySelectorAll('.dim-btn');
    dimBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dimBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            renderCohort(btn.dataset.dim);
        });
    });
    renderCohort('age');

    // === Cohort sort ===
    document.getElementById('cohort-sort')?.addEventListener('change', () => renderCohort(_cohortCurrentDim));

    // === Marketing channels sort/render ===
    const mktData = [
        { name: '카카오 채널', icon: 'ph-fill ph-chat-circle', cls: 'ch-kakao', leads: 412, booking: 52.4, visit: 81.2, cac: 184000, ltv: 2160000, roi: 11.7, adSpend: 7580000, revenue: 38420000 },
        { name: '인스타그램', icon: 'ph-fill ph-instagram-logo', cls: 'ch-instagram', leads: 328, booking: 38.7, visit: 72.5, cac: 312000, ltv: 4080000, roi: 13.1, adSpend: 10240000, revenue: 41260000 },
        { name: '네이버 검색', icon: 'ph-fill ph-magnifying-glass', cls: 'ch-naver', leads: 256, booking: 45.3, visit: 76.8, cac: 268000, ltv: 3520000, roi: 13.1, adSpend: 6860000, revenue: 28940000 },
        { name: '지인 추천', icon: 'ph-fill ph-users-three', cls: 'ch-referral', leads: 94, booking: 68.1, visit: 92.4, cac: 0, ltv: 5420000, roi: Infinity, adSpend: 0, revenue: 14820000, highlight: true },
        { name: '직접 유입', icon: 'ph ph-globe', cls: 'ch-organic', leads: 158, booking: 31.2, visit: 68.7, cac: 0, ltv: 2840000, roi: Infinity, adSpend: 0, revenue: 12180000 },
    ];
    const fmtKR = n => '₩ ' + n.toLocaleString('ko-KR');
    const mktTbody = document.getElementById('mkt-tbody');
    const mktSort = document.getElementById('mkt-sort');
    function renderMkt() {
        const key = mktSort?.value || 'revenue-desc';
        const sorted = [...mktData].sort((a, b) => {
            switch (key) {
                case 'leads-desc': return b.leads - a.leads;
                case 'ltv-desc': return b.ltv - a.ltv;
                case 'cac-asc': return (a.cac || 0) - (b.cac || 0);
                case 'roi-desc': return b.roi - a.roi;
                case 'adSpend-asc': return a.adSpend - b.adSpend;
                case 'booking-desc': return b.booking - a.booking;
                case 'visit-desc': return b.visit - a.visit;
                default: return b.revenue - a.revenue;
            }
        });
        mktTbody.innerHTML = sorted.map(c => {
            const roi = c.roi === Infinity ? '∞' : '×' + c.roi.toFixed(1);
            const bg = c.highlight ? ' style="background:#f0fdf4"' : '';
            return `<tr${bg}>
                <td><span class="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md border ${c.cls}"><i class="${c.icon}"></i> ${c.name}</span></td>
                <td class="num text-right">${c.leads}건</td>
                <td>예약 ${c.booking.toFixed(1)}% / 방문 ${c.visit.toFixed(1)}%</td>
                <td class="num">${fmtKR(c.cac)}</td>
                <td class="num">${fmtKR(c.ltv)}</td>
                <td class="num text-emerald-700 font-bold">${roi}</td>
                <td class="num">${fmtKR(c.adSpend)}</td>
                <td class="num font-bold">${fmtKR(c.revenue)}</td>
            </tr>`;
        }).join('');
    }
    renderMkt();
    mktSort?.addEventListener('change', renderMkt);

    // === Sales matrix sort/render ===
    const motiveData = [
        { name: '직장인 자기개발', cells: [2,5,10,8,4,2,1], revenue: 38.4 },
        { name: '학생 (대입/취업)', cells: [0,1,6,10,5,2,2], revenue: 22.7 },
        { name: '시험 (TOEIC/JLPT)', cells: [1,2,4,5,3,1,0], revenue: 19.1 },
        { name: '해외 거주/유학 대비', cells: [1,2,2,1,1,1,0], revenue: 14.6 },
        { name: '취미 / 자기만족', cells: [0,0,0,2,1,0,1], revenue: 5.2 },
    ];
    const cellTone = [
        { bg: '#6b21a8', color: 'white' }, // VVIP+
        { bg: '#a78bfa', color: 'white' }, // VVIP
        { bg: '#ddd6fe', color: '' },      // A+
        { bg: '#ede9fe', color: '' },      // H+
        { bg: '#ddd6fe', color: '' },      // T
        { bg: '#ede9fe', color: '' },      // DEP
        { bg: '#ddd6fe', color: '' },      // LEADER
    ];
    function cellHtml(v, idx) {
        if (!v) return '<div class="cohort-cell empty">0</div>';
        const tone = cellTone[idx] || { bg: '#f1f5f9', color: '' };
        const colorAttr = tone.color ? `;color:${tone.color}` : '';
        return `<div class="cohort-cell" style="background:${tone.bg}${colorAttr}">${v}</div>`;
    }
    const matrixRowsEl = document.getElementById('sales-matrix-rows');
    const revenueCardsEl = document.getElementById('sales-revenue-cards');
    const salesSort = document.getElementById('sales-sort');
    function renderSalesMatrix() {
        const key = salesSort?.value || 'revenue-desc';
        const sorted = [...motiveData].sort((a, b) => {
            const aTotal = a.cells.reduce((s, n) => s + n, 0);
            const bTotal = b.cells.reduce((s, n) => s + n, 0);
            switch (key) {
                case 'total-desc': return bTotal - aTotal;
                case 'vvip-desc': return (b.cells[0] + b.cells[1]) - (a.cells[0] + a.cells[1]);
                case 'entry-desc': return (b.cells[3] + b.cells[4]) - (a.cells[3] + a.cells[4]);
                default: return b.revenue - a.revenue;
            }
        });
        matrixRowsEl.innerHTML = sorted.map(row => {
            const total = row.cells.reduce((s, n) => s + n, 0);
            return `<div class="text-[11px] font-bold text-slate-700 self-center">${row.name}</div>
                ${row.cells.map(cellHtml).join('')}
                <div class="cohort-cell" style="background:#0f172a;color:white">${total}</div>`;
        }).join('');
        revenueCardsEl.innerHTML = sorted.map(row => `<div class="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
            <p class="font-bold text-slate-500">${row.name}</p>
            <p class="text-base font-black text-slate-800 stat-num">${row.revenue.toFixed(1)}%</p>
            <p class="text-[10px] text-slate-400">매출 비중</p>
        </div>`).join('');
    }
    renderSalesMatrix();
    salesSort?.addEventListener('change', renderSalesMatrix);

    // === Period selector ===
    const periodBtns = document.querySelectorAll('.period-btn');
    const customRange = document.getElementById('stats-custom-range');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => {
                b.setAttribute('aria-pressed', 'false');
                b.classList.remove('bg-slate-900', 'text-white');
                b.classList.add('text-slate-500', 'hover:bg-slate-50');
            });
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.add('bg-slate-900', 'text-white');
            btn.classList.remove('text-slate-500', 'hover:bg-slate-50');
            if (btn.dataset.period === 'custom') {
                customRange.classList.remove('hidden');
                customRange.classList.add('flex');
            } else {
                customRange.classList.add('hidden');
                customRange.classList.remove('flex');
            }
        });
    });
});
