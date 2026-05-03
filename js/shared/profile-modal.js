/**
 * Shared profile-modal helpers.
 *
 * Each page owns its own openProfileModal because the timeline rendering
 * and DOM structure differ (home/leader use separate pm-start-date /
 * pm-exp-date elements; member uses a combined pm-start-exp-date and a
 * richer icon-based timeline). Forcing a single openProfileModal would
 * require many flags and risks regressions.
 *
 * This file extracts the parts that ARE byte-identical across home.html,
 * leader.html, member.html:
 *   window.closeProfileModal()  — fade-out + hide
 *   window.showProfileModal()   — fade-in + reveal
 *
 * Pages call these from their own openProfileModal() at the end of their
 * render block. Removed inline definitions in those 3 pages.
 */
(function () {
    function getRefs() {
        return {
            modal: document.getElementById('profile-modal'),
            overlay: document.getElementById('profile-modal-overlay'),
        };
    }

    function showProfileModal() {
        const { modal, overlay } = getRefs();
        if (!modal || !overlay) return;
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            modal.classList.remove('opacity-0', 'scale-95');
        }, 10);
    }

    function closeProfileModal() {
        const { modal, overlay } = getRefs();
        if (!modal || !overlay) return;
        overlay.classList.add('opacity-0');
        modal.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            overlay.classList.add('hidden');
            modal.classList.add('hidden');
        }, 300);
    }

    window.showProfileModal = showProfileModal;
    window.closeProfileModal = closeProfileModal;
})();
