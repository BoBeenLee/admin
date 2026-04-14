
(function(){
    const btn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', function(){
        if(window.scrollY > 300){
            btn.style.opacity='1'; btn.style.pointerEvents='auto';
        } else {
            btn.style.opacity='0'; btn.style.pointerEvents='none';
        }
    });
})();

function copyPhone(phone) {
    const clean = phone.replace(/[^0-9-]/g, '').trim();
    navigator.clipboard.writeText(clean).then(() => {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-[9999] transition-opacity duration-300';
        toast.innerText = clean + ' 복사됨';
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 1500);
    });
}
