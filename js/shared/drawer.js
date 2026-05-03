/**
 * Side navigation drawer loader + handlers.
 *
 * Pages must include <div id="nav-slot"></div> in body and a hamburger button
 * with id "hamburger-btn" in their header.
 *
 * Replaces inline tDrawer() definitions in home.html, leader.html, member.html
 * and inline onclick patterns in branchstatus.html, call.html.
 *
 * Note: fetch() requires HTTP(S). Serve via `python3 -m http.server` for local dev.
 */
(function () {
    const NAV_PARTIAL_URL = 'partials/nav.html';

    function activeNavKey() {
        const path = window.location.pathname.split('/').pop() || 'home.html';
        return path.replace(/\.html$/, '');
    }

    function applyActiveLink(root) {
        const key = activeNavKey();
        const link = root.querySelector(`a[data-nav="${key}"]`);
        if (!link) return;
        link.classList.remove('text-slate-600', 'hover:bg-slate-50', 'hover:text-slate-900');
        link.classList.add('bg-brand-50', 'text-brand-700');
    }

    function bindHandlers(root, slot) {
        const hBtn = document.getElementById('hamburger-btn');
        const cBtn = root.querySelector('#close-drawer-btn');
        const overlay = root.querySelector('#drawer-overlay');
        const drawer = root.querySelector('#nav-drawer');
        if (!drawer || !overlay) return;

        function toggle(show) {
            if (show) {
                overlay.classList.remove('hidden');
                setTimeout(() => {
                    overlay.classList.remove('opacity-0');
                    drawer.classList.remove('-translate-x-full');
                }, 10);
            } else {
                overlay.classList.add('opacity-0');
                drawer.classList.add('-translate-x-full');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            }
        }

        // Pages that need custom hamburger logic (e.g. workdeck dual desktop/mobile)
        // can opt out by setting data-skip-hamburger on the slot div.
        const skipHamburger = slot && slot.dataset && slot.dataset.skipHamburger === 'true';
        if (hBtn && !skipHamburger) hBtn.addEventListener('click', () => toggle(true));
        if (cBtn) cBtn.addEventListener('click', () => toggle(false));
        if (overlay) overlay.addEventListener('click', () => toggle(false));

        window.tDrawer = toggle;
    }

    async function loadNav(slotSelector = '#nav-slot') {
        const slot = document.querySelector(slotSelector);
        if (!slot) {
            console.warn('[drawer] slot not found:', slotSelector);
            return;
        }
        try {
            const res = await fetch(NAV_PARTIAL_URL);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            slot.innerHTML = await res.text();
            applyActiveLink(slot);
            bindHandlers(slot, slot);
        } catch (err) {
            console.error('[drawer] failed to load nav:', err);
            console.error('[drawer] tip: serve via http (e.g. python3 -m http.server) — file:// blocks fetch');
        }
    }

    window.loadNav = loadNav;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loadNav());
    } else {
        loadNav();
    }
})();
