/**
 * 하남 지점 어드민 공통 유틸리티 함수
 */

/** 전화번호 클립보드 복사 + 토스트 알림 */
function copyPhone(phone) {
    const clean = phone.replace(/[^0-9-]/g, '').trim();
    navigator.clipboard.writeText(clean).then(() => {
        showToast(clean + ' 복사됨');
    });
}

/** 화면 하단 토스트 메시지 (1.5초) */
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-[9999] transition-opacity duration-300';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

/** SMS 모달 (미연동 — 인터페이스만 존재) */
function openSmsModal() {
    showToast('SMS 발송 기능은 추후 연동 예정입니다.');
}
