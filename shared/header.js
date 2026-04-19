/**
 * 하남 지점 어드민 공통 헤더 삽입
 * 사용법: <div id="app-header"></div> 위치에 헤더가 삽입됨
 * 옵션: window.HEADER_OPTIONS = { showBell: true } (기본값: true)
 */
(function () {
    const opts = window.HEADER_OPTIONS || {};
    const showBell = opts.showBell !== false;

    const bellHtml = showBell ? `
        <button class="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full flex items-center gap-2">
            <div class="relative">
                <i class="ph ph-bell text-xl"></i>
                <span class="absolute -top-1 -right-1 flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                </span>
            </div>
        </button>
        <div class="h-6 w-px bg-slate-200"></div>` : '';

    const html = `
    <header class="glass-panel sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
            <button id="hamburger-btn" class="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                <i class="ph ph-list text-2xl"></i>
            </button>
            <div class="bg-brand-500 text-white p-1.5 rounded-lg">
                <i class="ph-bold ph-buildings text-xl"></i>
            </div>
            <h1 class="text-lg font-bold text-slate-800 tracking-tight">하남 지점 어드민</h1>
        </div>
        <div class="flex items-center gap-4">
            ${bellHtml}
            <div class="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg border border-transparent transition-colors">
                <img src="https://ui-avatars.com/api/?name=매니저&background=0284c7&color=fff" alt="User" class="w-8 h-8 rounded-full">
                <span class="text-sm font-medium hidden sm:block">지점장 옵션 <i class="ph ph-caret-down text-xs ml-1 font-bold"></i></span>
            </div>
        </div>
    </header>`;

    const target = document.getElementById('app-header');
    if (target) {
        target.outerHTML = html;
    }
})();
