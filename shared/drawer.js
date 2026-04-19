/**
 * 하남 지점 어드민 공통 사이드 네비게이션 드로어
 * 사용법: <div id="app-drawer"></div> 위치에 드로어가 삽입됨
 * 현재 페이지 자동 감지하여 active 상태 표시
 */
(function () {
    const pages = [
        { href: 'home.html', icon: 'ph-calendar-blank', label: '대시보드 캘린더 (홈)' },
        { href: 'member.html', icon: 'ph-users-three', label: '멤버 팀' },
        { href: 'leader.html', icon: 'ph-crown', label: '리더 팀' },
        { href: 'stats.html', icon: 'ph-chart-bar', label: '통계 및 리포트' },
        { href: 'call.html', icon: 'ph-phone-call', label: '신규 회신' },
    ];

    const currentPage = location.pathname.split('/').pop() || 'home.html';

    const navItems = pages.map(p => {
        const isActive = currentPage === p.href;
        const cls = isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
        return `<a href="${p.href}" class="nav-item w-full flex items-center gap-3 px-3 py-3 ${cls} rounded-lg font-medium transition-colors">
            <i class="ph ${p.icon} text-lg"></i> ${p.label}
        </a>`;
    }).join('\n            ');

    const html = `
    <div id="drawer-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] hidden opacity-0 transition-opacity cursor-pointer"></div>
    <div id="nav-drawer" class="fixed top-0 left-0 h-full w-full sm:w-72 bg-white shadow-2xl z-[70] transform -translate-x-full transition-transform duration-300 flex flex-col">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 class="text-lg font-bold flex items-center gap-2 text-slate-800">
                <i class="ph-fill ph-squares-four text-brand-500 text-xl"></i> 메인 메뉴
            </h2>
            <button id="close-drawer-btn" class="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer transition">
                <i class="ph ph-x"></i>
            </button>
        </div>
        <nav class="p-4 space-y-1">
            ${navItems}
        </nav>
    </div>`;

    const target = document.getElementById('app-drawer');
    if (target) {
        target.outerHTML = html;
    }

    // 이벤트 바인딩은 DOMContentLoaded 후
    function initDrawer() {
        const hBtn = document.getElementById('hamburger-btn');
        const cBtn = document.getElementById('close-drawer-btn');
        const dOverlay = document.getElementById('drawer-overlay');
        const nDrawer = document.getElementById('nav-drawer');

        function tDrawer(show) {
            if (show) {
                dOverlay.classList.remove('hidden');
                setTimeout(() => {
                    dOverlay.classList.remove('opacity-0');
                    nDrawer.classList.remove('-translate-x-full');
                }, 10);
            } else {
                dOverlay.classList.add('opacity-0');
                nDrawer.classList.add('-translate-x-full');
                setTimeout(() => dOverlay.classList.add('hidden'), 300);
            }
        }

        if (hBtn) hBtn.addEventListener('click', () => tDrawer(true));
        if (cBtn) cBtn.addEventListener('click', () => tDrawer(false));
        if (dOverlay) dOverlay.addEventListener('click', () => tDrawer(false));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDrawer);
    } else {
        initDrawer();
    }
})();
