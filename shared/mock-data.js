/**
 * 하남 지점 어드민 공통 Mock 데이터
 * 모든 페이지에서 공유하는 기초 데이터 풀
 */

const SURNAMES = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','전','홍','고','문','양','손','배','백','허','유','남','심','노','하','곽','성','차','주','우','민','진'];

const GIVEN_FEMALE = ['서연','지우','하은','서윤','민서','예린','수아','다은','채원','지민','소율','하윤','시은','유진','수빈','예서','윤아','채은','지현','서현','민지','예진','소연','지은','나연','은서','미래'];

const GIVEN_MALE = ['민준','서준','도윤','예준','시우','하준','지호','주원','지환','건우','현우','준서','태윤','승현','우진','재민','선우','민재','정우','유찬','민수','영호','준혁','성민','재현','동욱','진우','태현'];

const MEMOS = ['우수회원 혜택 안내 완료.','담달 연임 예정.','신규 리더 교육 수료.','출석 우수. 모범 리더.','해외 출장 예정 (2주).','다음 달 홀딩 요청.','팀 변경 검토 중.','멤버십 갱신 완료.','상담 예정 (4/20).','대타 요청 빈번. 관리 필요.','리딩 스킬 향상 중.','신규 팀 배정 완료.','출석률 개선 필요.','휴직 복귀 예정.','우수 리더 후보.','','','','',''];

const TEAM_SLOTS = [
    '영 월 11시','영 월 8시','영 화 11시','영 화 8시','영 수 11시','영 수 8시',
    '영 목 11시','영 목 8시','영 토 11시','영 토 8시','영 일 11시','영 일 8시',
    '일 월 11시','일 월 8시','일 화 11시','일 화 8시','일 수 11시','일 수 8시',
    '일 목 11시','일 목 8시','일 토 11시','일 토 8시','일 일 11시','일 일 8시'
];

const TEAM_COLORS = { '영': '#9B59B6', '일': '#007BFF' };
const TEAM_BGS = { '영': '#f5eafa', '일': '#e6f0ff' };

const BLOCK_STATUSES = [
    { s: '출석 완료', bg: 'bg-emerald-500', border: 'border-emerald-600/30', color: 'text-emerald-400' },
    { s: '불참', bg: 'bg-red-400', border: 'border-red-500/30', color: 'text-red-400' },
    { s: '대타 완료', bg: 'bg-amber-400', border: 'border-amber-500/30', color: 'text-amber-400' },
    { s: '출석 예정', bg: 'bg-slate-300', border: 'border-slate-400/30', color: 'text-slate-400' },
];

const DATES_8 = [
    { d: '04.01', w: '월' }, { d: '04.03', w: '수' }, { d: '04.08', w: '월' }, { d: '04.10', w: '수' },
    { d: '04.15', w: '월' }, { d: '04.17', w: '수' }, { d: '04.22', w: '월' }, { d: '04.24', w: '수' }
];

const MEMBER_POOL = ['김민수(010-1111-2222)','이지현(010-3333-4444)','최영호(010-5555-6666)','정다은(010-7777-8888)','강서연(010-9999-0000)','조하은(010-1234-5678)','박보검(010-2345-6789)','배수지(010-3456-7890)','이동욱(010-4567-8901)','차은우(010-5678-9012)','송혜교(010-6789-0123)','공지철(010-7890-1234)'];

const STATUS_STYLES = {
    '출석 예정': { bg: 'bg-transparent', text: 'text-emerald-600', border: 'border-emerald-300', icon: 'ph ph-clock' },
    '출석 완료': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'ph-bold ph-check-circle' },
    '대타 예정': { bg: 'bg-transparent', text: 'text-amber-600', border: 'border-amber-300', icon: 'ph ph-swap' },
    '대타 완료': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: 'ph-bold ph-swap' },
    '불참': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: 'ph-bold ph-x-circle' },
    '대타 필요': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-300', icon: 'ph-bold ph-warning-circle' },
};

const MEMBERSHIP_TYPES = [
    { name: 'VVIP', sessions: 1040, color: 'bg-purple-50', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { name: 'VIP', sessions: 520, color: 'bg-indigo-50', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { name: 'A+', sessions: 104, color: 'bg-emerald-50', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { name: 'H+', sessions: 52, color: 'bg-orange-50', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    { name: 'T', sessions: 24, color: 'bg-slate-50', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
];

const LV_COLORS = {
    0: { bg: 'bg-slate-500', text: 'text-slate-700', light: 'bg-slate-100', border: 'border-slate-300', hex: '#94a3b8', hexBg: '#f1f5f9' },
    1: { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-200', hex: '#22c55e', hexBg: '#dcfce7' },
    2: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200', hex: '#3b82f6', hexBg: '#dbeafe' },
    3: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', border: 'border-purple-200', hex: '#a855f7', hexBg: '#f3e8ff' },
    4: { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', border: 'border-amber-200', hex: '#f59e0b', hexBg: '#fef3c7' },
    5: { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200', hex: '#ef4444', hexBg: '#fee2e2' },
};

/** 유틸: 랜덤 정수 */
function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/** 유틸: 배열에서 랜덤 선택 */
function rPick(arr) { return arr[rng(0, arr.length - 1)]; }

/** 유틸: 랜덤 전화번호 생성 */
function genPhone() { return `010-${rng(1000, 9999)}-${rng(1000, 9999)}`; }

/** 유틸: 랜덤 이름 생성 (중복 검사용 Set 전달) */
function genName(usedNames) {
    let name;
    do {
        const isFemale = Math.random() > 0.5;
        name = rPick(SURNAMES) + (isFemale ? rPick(GIVEN_FEMALE) : rPick(GIVEN_MALE));
    } while (usedNames && usedNames.has(name));
    if (usedNames) usedNames.add(name);
    return name;
}

/** Seeded PRNG (Mulberry32) — member.html에서 동일 데이터 재생성용 */
function mulberry32(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/** 문자열 해시 (seeded PRNG 시드 생성용) */
function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = Math.imul(31, h) + s.charCodeAt(i) | 0; }
    return h;
}
