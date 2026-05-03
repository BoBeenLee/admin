/**
 * Shared utilities for admin pages.
 *
 * Provides:
 *   window.showToast(msg)   — bottom-center toast, 1.5s autodismiss
 *   window.copyPhone(phone) — strips non-digit chars, copies to clipboard,
 *                              shows toast "<digits> 복사됨"
 *
 * Source: byte-identical inline definitions previously in
 *   home.html (~line 2015), leader.html (~line 4925), member.html (~line 2993)
 *
 * Exposed via window.* to remain compatible with inline onclick handlers
 * like `onclick="copyPhone('010-...')"`.
 */
(function () {
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-[9999] transition-opacity duration-300';
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }

    function copyPhone(phone) {
        const clean = String(phone || '').replace(/[^0-9-]/g, '').trim();
        if (!clean) return;
        navigator.clipboard.writeText(clean).then(() => {
            showToast(clean + ' 복사됨');
        });
    }

    window.showToast = showToast;
    window.copyPhone = copyPhone;
})();
