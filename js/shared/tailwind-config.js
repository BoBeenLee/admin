/**
 * Shared Tailwind config for all admin pages.
 * Loaded after https://cdn.tailwindcss.com so `tailwind` global exists.
 *
 * Brand palette (per CLAUDE.md):
 *   brand-50/100/500/600/900 = sky tones (#f0f9ff..#0c4a6e)
 *   200/700 added so workdeck.html keeps its prior styling.
 *
 * boxShadow extensions are used by workdeck.html only; harmless on other pages.
 *
 * Source files this replaces:
 *   branchstatus.html, call.html, home.html, leader.html,
 *   member.html, stats.html, workdeck.html
 */
tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    900: '#0c4a6e',
                }
            },
            fontFamily: {
                sans: ['Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'card-hover': '0 12px 24px -6px rgba(15, 23, 42, .12), 0 4px 8px -2px rgba(15, 23, 42, .06)',
                'kpi': '0 1px 3px 0 rgba(15, 23, 42, .04), 0 1px 2px 0 rgba(15, 23, 42, .03)',
                'inner-strong': 'inset 0 0 0 1px rgba(15, 23, 42, .04)'
            }
        }
    }
};
