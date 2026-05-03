/**
 * Work Deck page logic.
 * Extracted from inline <script> block in workdeck.html (lines 908-3656).
 * Hamburger button has dual desktop/mobile behavior wired here:
 *   desktop -> toggleSidebar(); mobile -> window.tDrawer(true) (provided by drawer.js).
 */
// ════════════════════════════════════════════════════════════════════
// MOCK DATA & STATE
// ════════════════════════════════════════════════════════════════════
const USERS = [
    { id:'CEO_01', name:'세라',   role:'대표',   coverFor:[] },
    { id:'MGR_01', name:'태미',   role:'매니저', coverFor:['MGR_02'] },
    { id:'MGR_02', name:'에릭',   role:'매니저', coverFor:['MGR_01'] },
    { id:'STF_01', name:'지오',   role:'직원',   coverFor:[] },
    { id:'STF_02', name:'티파니', role:'직원',   coverFor:[] },
];
const TODAY = new Date().toISOString().slice(0,10);
const STORAGE_KEY = 'workdeck.v8';
const STATUSES = ['할일','진행중','완료'];
const STATUS_ICON = { '할일':'ph-circle', '진행중':'ph-spinner-gap', '완료':'ph-check-circle' };

const uid = () => 'id_'+Math.random().toString(36).slice(2,10);
const dateStr = (n=0) => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const getUser = id => USERS.find(u=>u.id===id) || {id,name:'?',role:'직원'};
const initial = n => (n||'?').slice(0,1);
function avatarSrc(uOrId) {
    const u = typeof uOrId === 'string' ? getUser(uOrId) : uOrId;
    if (!u) return '';
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(u.id)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

function seedData() {
    return {
        notices: [
            { id:uid(), title:'5월 1일 근로자의 날 휴무 안내', body:'5월 1일(금) 전 업무 휴무. 4월 30일(목) 마감 보고서는 미리 제출 바랍니다.', author:'CEO_01', severity:'info',    pinned:true,  createdAt:Date.now()-86400000 },
            { id:uid(), title:'카드 단말기 점검 (4/30)',         body:'4월 30일 09:00~10:00 결제 시스템 일시 중단 예정',                  author:'MGR_01', severity:'warning', pinned:true,  createdAt:Date.now()-43200000 },
            { id:uid(), title:'신규 등록 인원 누적 100명 돌파!', body:'4월 누적 신규 등록 100명 달성 — 모두 수고하셨습니다 🎉',          author:'CEO_01', severity:'success', pinned:false, createdAt:Date.now()-172800000 },
        ],
        tasks: [
            { id:uid(), title:'4월 결산 보고서 작성', body:'영어/일어 부문별 매출 정리, 매니저 회의 전 공유', from:'CEO_01', to:['MGR_01'], due:dateStr(1), priority:'high',   status:'진행중', comments:[{author:'MGR_01',time:Date.now()-3600000,text:'데이터 취합 중입니다.'}], createdAt:Date.now()-86400000 },
            { id:uid(), title:'신규 멤버 등록 정리',   body:'이번 주 신규 7명 시스템 등록 및 팀 배정',           from:'CEO_01', to:['MGR_02'], due:TODAY,    priority:'normal', status:'할일',   comments:[], createdAt:Date.now()-172800000 },
            { id:uid(), title:'리더 출석부 점검',       body:'월요일 오전 11시 출석 누락 확인',                from:'MGR_01', to:['STF_01'], due:TODAY,    priority:'high',   status:'할일',   comments:[], createdAt:Date.now()-43200000 },
            { id:uid(), title:'학부모 상담 일정 정리', body:'다음 주 상담 신청자 5명 일정 배정',              from:'MGR_01', to:['STF_02'], due:dateStr(2), priority:'normal', status:'진행중', comments:[{author:'STF_02',time:Date.now()-7200000,text:'2명 확정, 3명 회신 대기'}], createdAt:Date.now()-86400000 },
            { id:uid(), title:'멤버 출석 데이터 백업', body:'월말 기준 백업 파일 클라우드 업로드',            from:'MGR_02', to:['STF_01'], due:dateStr(3), priority:'low',    status:'완료',   comments:[], createdAt:Date.now()-259200000 },
            { id:uid(), title:'5월 행사 기획안 초안',   body:'학부모 오픈데이 컨셉 정리',                    from:'CEO_01', to:['MGR_01','MGR_02'], due:dateStr(5), priority:'normal', status:'할일', comments:[], createdAt:Date.now()-21600000 },
            { id:uid(), title:'신규 회신 7명 콜백',     body:'이번 주 안에 모두 1차 컨택',                  from:'MGR_02', to:['STF_02'], due:dateStr(1), priority:'high',   status:'진행중', comments:[{author:'STF_02',time:Date.now()-10800000,text:'1차 컨택 진행 중, 내일까지 마무리'}], createdAt:Date.now()-129600000 },
            { id:uid(), title:'교재 재고 점검',         body:'레벨 2~3 재고 카운팅 후 발주서 작성',          from:'MGR_01', to:['STF_01'], due:dateStr(4), priority:'normal', status:'할일',   comments:[], createdAt:Date.now()-3600000 },
            { id:uid(), title:'개인 — 5월 일정 정리',     body:'개인 캘린더 정리 및 외부 미팅 시간 블록',     from:'MGR_01', to:['MGR_01'], due:dateStr(2), priority:'low',    status:'진행중', comments:[], createdAt:Date.now()-7200000 },
            { id:uid(), title:'개인 — 회계 자료 검토',    body:'분기별 회계 자료 사전 검토 (대표 보고 전)',    from:'MGR_01', to:['MGR_01'], due:dateStr(0), priority:'high',   status:'할일',   comments:[], createdAt:Date.now()-1800000 },
            // 받은 업무 추가 (MGR_01 기준 — 할일 / 진행중 / 완료 각 다양한 업무 시드)
            { id:uid(), title:'주간 매니저 회의 자료 준비',  body:'팀별 KPI 요약 + 안건 정리',                  from:'CEO_01', to:['MGR_01'], due:dateStr(1), priority:'high',   status:'할일',   comments:[], createdAt:Date.now()-3600000 },
            { id:uid(), title:'신규 강사 면접 일정 잡기',     body:'영어 LV4+ 강사 후보 3명 일정 조율',           from:'CEO_01', to:['MGR_01'], due:dateStr(2), priority:'normal', status:'진행중', comments:[{author:'MGR_01',time:Date.now()-5400000,text:'2명 일정 확정, 1명 회신 대기'}], createdAt:Date.now()-172800000 },
            { id:uid(), title:'4월 출석률 보고',            body:'영어/일어 팀별 출석률 정리해 대표 보고',      from:'CEO_01', to:['MGR_01'], due:dateStr(-2), priority:'high',   status:'완료', comments:[{author:'MGR_01',time:Date.now()-86400000,text:'완료 보고 드렸습니다.'}], createdAt:Date.now()-432000000 },
            { id:uid(), title:'멤버 단체 문자 발송',        body:'4월 마지막 주 출석 안내 일괄 발송',           from:'CEO_01', to:['MGR_01'], due:dateStr(-3), priority:'normal', status:'완료', comments:[], createdAt:Date.now()-518400000 },
            { id:uid(), title:'리더 워크숍 후기 정리',      body:'2주 전 워크숍 피드백 + 개선 사항 정리',       from:'CEO_01', to:['MGR_01'], due:dateStr(-5), priority:'normal', status:'완료', comments:[{author:'MGR_01',time:Date.now()-345600000,text:'문서 공유 완료'}], createdAt:Date.now()-864000000 },

            // 할일 추가 (이번 주 마감)
            { id:uid(), title:'5월 시간표 초안',             body:'영어/일어 통합 시간표 1차 안 작성',           from:'CEO_01', to:['MGR_01'], due:dateStr(0), priority:'high',   status:'할일',   comments:[], createdAt:Date.now()-1800000 },
            { id:uid(), title:'외부 제휴 제안 검토',         body:'근처 카페 제휴 — 멤버 할인 쿠폰 협업 안',       from:'CEO_01', to:['MGR_01'], due:dateStr(1), priority:'normal', status:'할일',   comments:[], createdAt:Date.now()-7200000 },
            { id:uid(), title:'홈페이지 4월 후기 업데이트',  body:'학부모 후기 3건 정리 후 디자이너에게 전달',    from:'CEO_01', to:['MGR_01'], due:dateStr(1), priority:'low',    status:'할일',   comments:[], createdAt:Date.now()-10800000 },
            { id:uid(), title:'환불 사유 분석 정리',         body:'4월 환불 79건 사유별 분류 보고',                from:'CEO_01', to:['MGR_01'], due:dateStr(2), priority:'normal', status:'할일',   comments:[], createdAt:Date.now()-14400000 },

            // 진행중 추가 (이번 주 마감)
            { id:uid(), title:'리더 평가 시범 적용',         body:'영어 월수 11시 팀 대상 시범 평가',              from:'CEO_01', to:['MGR_01'], due:dateStr(0), priority:'high',   status:'진행중', comments:[{author:'MGR_01',time:Date.now()-7200000,text:'초기 데이터 수집 중'}], createdAt:Date.now()-216000000 },
            { id:uid(), title:'CRM 신규 회신 자동 알림 설정', body:'24시간 미응답 자동 슬랙 알림 연동',             from:'CEO_01', to:['MGR_01'], due:dateStr(2), priority:'normal', status:'진행중', comments:[{author:'MGR_01',time:Date.now()-3600000,text:'API 연동 50% 완료'}], createdAt:Date.now()-259200000 },
            { id:uid(), title:'학부모 오픈데이 안내장 디자인 검토', body:'시안 2종 픽 후 인쇄 발주 결정',          from:'MGR_01', to:['MGR_01'], due:dateStr(1), priority:'high',   status:'진행중', comments:[], createdAt:Date.now()-43200000 },
        ],
        projects: [
            { id:uid(), title:'봄 신규 등록 캠페인', type:'세일즈',  description:'4-5월 봄 학기 신규 회원 100명 모집 목표. 학부모 설명회 + 추천 프로그램 + SNS 광고 병행.', leader:'CEO_01', members:['CEO_01','MGR_01','MGR_02','STF_01','STF_02'], status:'진행중', progress:65,
              startDate:dateStr(-30), dueDate:dateStr(20),
              milestones:[ { id:uid(), title:'광고 송출 시작', done:true, dueDate:dateStr(-25) }, { id:uid(), title:'학부모 설명회 (4/15)', done:true, dueDate:dateStr(-14) }, { id:uid(), title:'신규 등록 100명 달성', done:false, dueDate:dateStr(20) } ],
              metrics:[ { label:'신규 등록', current:65, target:100, unit:'명' }, { label:'학부모 컨택', current:80, target:120, unit:'건' }, { label:'전환율', current:54, target:60, unit:'%' } ],
              createdAt:Date.now()-30*86400000 },
            { id:uid(), title:'5월 학부모 오픈데이', type:'이벤트', description:'5월 둘째 주 토요일 — 정원 50석. 영어/일어 레벨별 시연 + 상담 부스 운영.', leader:'MGR_01', members:['MGR_01','STF_01','STF_02'], status:'계획', progress:20,
              startDate:dateStr(-3), dueDate:dateStr(15),
              milestones:[ { id:uid(), title:'장소 예약', done:true, dueDate:dateStr(-2) }, { id:uid(), title:'안내장 발송', done:false, dueDate:dateStr(7) }, { id:uid(), title:'당일 운영', done:false, dueDate:dateStr(15) } ],
              metrics:[ { label:'예약 인원', current:18, target:50, unit:'명' }, { label:'안내장 발송', current:0, target:300, unit:'부' } ],
              createdAt:Date.now()-3*86400000 },
            { id:uid(), title:'리더 평가 시스템 도입', type:'운영', description:'리더의 출석률·멤버 참여율·상담 코멘트를 기반으로 분기별 평가 체계 수립.', leader:'MGR_02', members:['CEO_01','MGR_02'], status:'진행중', progress:40,
              startDate:dateStr(-14), dueDate:dateStr(45),
              milestones:[ { id:uid(), title:'기존 데이터 분석', done:true, dueDate:dateStr(-10) }, { id:uid(), title:'평가 지표 확정', done:false, dueDate:dateStr(10) }, { id:uid(), title:'시범 운영', done:false, dueDate:dateStr(45) } ],
              metrics:[ { label:'평가 지표 정의', current:6, target:10, unit:'개' } ],
              createdAt:Date.now()-14*86400000 },
            { id:uid(), title:'영어 레벨 5+ 신규반', type:'교육', description:'고급 레벨 학생 증가에 따라 5/6 신규반 개설. 강사 매칭 + 교재 발주 진행.', leader:'MGR_01', members:['MGR_01','STF_01'], status:'진행중', progress:80,
              startDate:dateStr(-21), dueDate:dateStr(7),
              milestones:[ { id:uid(), title:'강사 섭외', done:true, dueDate:dateStr(-15) }, { id:uid(), title:'교재 발주', done:true, dueDate:dateStr(-7) }, { id:uid(), title:'개강', done:false, dueDate:dateStr(7) } ],
              metrics:[ { label:'등록 인원', current:8, target:10, unit:'명' } ],
              createdAt:Date.now()-21*86400000 },
        ],
        memos: [
            { id:uid(), title:'주간 회의 어젠다',      body:'1) 출석률 보고\n2) 신규 등록 현황\n3) 5월 행사 일정', author:'CEO_01', visibility:'team',    pinned:true,  updatedAt:Date.now()-3600000 },
            { id:uid(), title:'결제 단말기 점검',       body:'카드 단말기 4월 30일 점검 예정',                    author:'MGR_01', visibility:'team',    pinned:false, updatedAt:Date.now()-86400000 },
            { id:uid(), title:'내일 미팅 메모',         body:'9시 학부모 / 11시 신규 등록 / 14시 정기 회의',    author:'MGR_01', visibility:'private', pinned:true,  updatedAt:Date.now()-7200000 },
            { id:uid(), title:'영어 교재 발주 리스트', body:'레벨 2~3 부족, 다음 분기 30권 발주 예정',          author:'CEO_01', visibility:'team',    pinned:true,  updatedAt:Date.now()-43200000 },
        ]
    };
}

let state = {
    tasks:[], memos:[], notices:[], projects:[], currentUserId:'MGR_01', onLeave:{},
    channel:'home',
    view:'kanban', scopes:['received','self'], priFilter:'all', memoTab:'team',
    projectFilter:'active', timeRange:'thisMonth',
    memoView:'gallery',
    homeWidgets: ['notices','today','projects','memos']
};

function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify({tasks:state.tasks,memos:state.memos,notices:state.notices,projects:state.projects,currentUserId:state.currentUserId,onLeave:state.onLeave,homeWidgets:state.homeWidgets})); }
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { const s=seedData(); state.tasks=s.tasks; state.memos=s.memos; state.notices=s.notices||[]; state.projects=s.projects||[]; saveState(); }
        else {
            const d = JSON.parse(raw);
            state.tasks = (d.tasks||[]).map(t => ({ ...t, status: t.status === '보류' ? '할일' : t.status }));
            state.memos = d.memos||[];
            state.notices = d.notices || seedData().notices;
            state.projects = d.projects || seedData().projects;
            state.currentUserId = d.currentUserId||'MGR_01';
            state.onLeave = d.onLeave||{};
            if (d.homeWidgets) state.homeWidgets = d.homeWidgets;
        }
    } catch(e){console.error(e);}
}
const me = () => getUser(state.currentUserId);

// ════════════════════════════════════════════════════════════════════
// FILTERED DATA
// ════════════════════════════════════════════════════════════════════
function tasksScoped() {
    const scopes = state.scopes && state.scopes.length ? state.scopes : ['received','self','sent'];
    const include = new Set(scopes);
    let out = state.tasks.filter(t => {
        const isReceived = t.to.includes(state.currentUserId) && t.from !== state.currentUserId;
        const isSelf     = t.from === state.currentUserId && t.to.length === 1 && t.to[0] === state.currentUserId;
        const isSent     = t.from === state.currentUserId && !(t.to.length === 1 && t.to[0] === state.currentUserId);
        return (include.has('received') && isReceived) ||
               (include.has('self')     && isSelf) ||
               (include.has('sent')     && isSent);
    });
    if (state.priFilter !== 'all') out = out.filter(t => t.priority === state.priFilter);
    // Time range — filter by due date, but always keep overdue active tasks
    if (state.timeRange && state.timeRange !== 'all') {
        const r = getTimeRange();
        out = out.filter(t => (t.due >= r.start && t.due <= r.end) || (t.due < TODAY && t.status !== '완료'));
    }
    return out;
}
function timeRangeSelectHtml() {
    const v = state.timeRange || 'thisMonth';
    const sd = state.timeRangeStart || '';
    const ed = state.timeRangeEnd || '';
    return `<div class="inline-flex items-center gap-1 flex-wrap">
        <select onchange="onTimeRangeChange(this.value)" class="text-[11px] font-bold rounded-lg border border-slate-200 bg-white px-2 py-1 cursor-pointer hover:border-slate-300 focus:outline-none focus:border-brand-500 shadow-sm" title="기간">
            <option value="thisWeek"  ${v==='thisWeek'?'selected':''}>📅 이번 주</option>
            <option value="thisMonth" ${v==='thisMonth'?'selected':''}>📅 이번 달</option>
            <option value="quarter"   ${v==='quarter'?'selected':''}>📅 분기</option>
            <option value="all"       ${v==='all'?'selected':''}>📅 전체</option>
            <option value="custom"    ${v==='custom'?'selected':''}>📅 직접 선택…</option>
        </select>
        <span class="${v==='custom'?'inline-flex':'hidden'} items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-0.5 shadow-sm">
            <input id="pj-tr-start" type="text" readonly placeholder="시작일" value="${sd}" onclick="openDatePicker(this, event)" oninput="onCustomRangeChange()" onchange="onCustomRangeChange()" class="dp-trigger w-[100px] px-2 py-1 text-[11px] font-bold text-slate-700 placeholder:text-slate-300 border border-transparent rounded cursor-pointer focus:outline-none focus:border-brand-300 bg-transparent">
            <span class="text-slate-300 text-[10px] px-0.5">→</span>
            <input id="pj-tr-end"   type="text" readonly placeholder="종료일" value="${ed}" onclick="openDatePicker(this, event)" oninput="onCustomRangeChange()" onchange="onCustomRangeChange()" class="dp-trigger w-[100px] px-2 py-1 text-[11px] font-bold text-slate-700 placeholder:text-slate-300 border border-transparent rounded cursor-pointer focus:outline-none focus:border-brand-300 bg-transparent">
            <button onclick="clearCustomRange()" class="text-slate-400 hover:text-slate-700 px-1" title="초기화"><i class="ph ph-x text-[10px]"></i></button>
        </span>
    </div>`;
}
function getTimeRange() {
    const now = new Date(TODAY);
    if (state.timeRange === 'thisWeek') {
        const d = now.getDay();
        const start = new Date(now); start.setDate(now.getDate() - d);
        const end = new Date(start); end.setDate(start.getDate() + 6);
        return { start: start.toISOString().slice(0,10), end: end.toISOString().slice(0,10) };
    }
    if (state.timeRange === 'thisMonth') {
        const start = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
        const last = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
        const end = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(last).padStart(2,'0')}`;
        return { start, end };
    }
    if (state.timeRange === 'quarter') {
        const m = now.getMonth();
        const qs = Math.floor(m/3)*3;
        const qe = qs + 2;
        const last = new Date(now.getFullYear(), qe+1, 0).getDate();
        return { start: `${now.getFullYear()}-${String(qs+1).padStart(2,'0')}-01`, end: `${now.getFullYear()}-${String(qe+1).padStart(2,'0')}-${String(last).padStart(2,'0')}` };
    }
    if (state.timeRange === 'custom') {
        return { start: state.timeRangeStart || '0000-00-00', end: state.timeRangeEnd || '9999-12-31' };
    }
    return { start:'0000-00-00', end:'9999-12-31' };
}
window.onTimeRangeChange = function(v) {
    state.timeRange = v;
    const wrap = document.getElementById('time-range-custom');
    if (v === 'custom') {
        if (wrap) { wrap.classList.remove('hidden'); wrap.classList.add('inline-flex'); }
        // default range: this month if not set
        if (!state.timeRangeStart || !state.timeRangeEnd) {
            const now = new Date(TODAY);
            state.timeRangeStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
            const last = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
            state.timeRangeEnd = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(last).padStart(2,'0')}`;
        }
        const trS = document.getElementById('tr-start'); if (trS) trS.value = state.timeRangeStart;
        const trE = document.getElementById('tr-end');   if (trE) trE.value = state.timeRangeEnd;
    } else {
        if (wrap) { wrap.classList.add('hidden'); wrap.classList.remove('inline-flex'); }
    }
    render();
    // Custom 선택 시: 인라인 입력칸이 렌더된 직후 캘린더 popover 자동 오픈
    if (v === 'custom') {
        setTimeout(() => {
            const startInput = document.getElementById('pj-tr-start') || document.getElementById('tr-start');
            if (startInput && typeof openDatePicker === 'function') openDatePicker(startInput);
        }, 30);
    }
};
window.onCustomRangeChange = function() {
    const sEl = document.getElementById('pj-tr-start') || document.getElementById('tr-start');
    const eEl = document.getElementById('pj-tr-end')   || document.getElementById('tr-end');
    const s = sEl ? sEl.value : '';
    const e = eEl ? eEl.value : '';
    if (s) state.timeRangeStart = s;
    if (e) state.timeRangeEnd = e;
    if (s && e && e < s) { showToast('종료일이 시작일보다 이전입니다'); return; }
    render();
};
window.clearCustomRange = function() {
    state.timeRangeStart = null; state.timeRangeEnd = null;
    state.timeRange = 'thisMonth';
    const sel = document.getElementById('time-range'); if (sel) sel.value = 'thisMonth';
    const wrap = document.getElementById('time-range-custom'); if (wrap) wrap.classList.add('hidden');
    render();
};

function toggleScope(scope) {
    const s = (state.scopes || []).slice();
    const idx = s.indexOf(scope);
    if (idx >= 0) s.splice(idx, 1);
    else s.push(scope);
    state.scopes = s;
    render();
}
function setAllScopes() { state.scopes = ['received','self','sent']; render(); }
function visibleMemos() {
    const me_id = state.currentUserId;
    return state.memos.filter(m => {
        if (m.author === me_id) return true;
        if (m.visibility === 'team') {
            const aud = m.audience || ['ALL'];
            if (aud.includes('ALL')) return true;
            return aud.includes(me_id);
        }
        if (m.visibility === 'private' && state.onLeave[m.author] && (me().coverFor||[]).includes(m.author)) return true;
        return false;
    });
}

// ════════════════════════════════════════════════════════════════════
// HEADER / GREETING
// ════════════════════════════════════════════════════════════════════
function renderHeader() {
    const u = me();
    // CEO mode: tint the body and add a subtle theme override
    document.body.classList.toggle('ceo-mode', u.role === '대표');
    const qcLabel = document.getElementById('quick-create-label');
    if (qcLabel) qcLabel.textContent = u.role === '대표' ? '업무 지시' : u.role === '매니저' ? '새 업무' : '셀프 업무';
    const qcBtn = document.getElementById('quick-create');
    if (qcBtn) {
        qcBtn.className = u.role === '대표'
            ? 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white text-[12px] font-bold rounded-lg transition-all shadow-sm hover:shadow-md'
            : 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-bold rounded-lg transition-all shadow-sm hover:shadow-md';
    }
    const av = document.getElementById('user-av');
    av.className = `av av-${u.role} w-8 h-8 text-[12px] inline-flex items-center justify-center rounded-full text-white relative`;
    av.dataset.uid = u.id; av.dataset.avDone = '';
    av.style.setProperty('--av-img', `url("${avatarSrc(u)}")`);
    document.getElementById('user-init').textContent = initial(u.name);
    document.getElementById('user-leave-dot').classList.toggle('hidden', !state.onLeave[u.id]);
    document.getElementById('user-name').textContent = u.name;
    document.getElementById('user-role').textContent = `${u.role} · ${u.id}`;

    const hav = document.getElementById('hello-av');
    hav.className = `av av-${u.role} w-12 h-12 text-[16px] shadow-md inline-flex items-center justify-center rounded-full text-white font-extrabold`;
    hav.dataset.uid = u.id; hav.dataset.avDone = '';
    hav.style.setProperty('--av-img', `url("${avatarSrc(u)}")`);
    hav.textContent = initial(u.name);
    document.getElementById('hello-name').textContent = u.name;
    const hr = document.getElementById('hello-role-name');
    hr.textContent = u.role;
    hr.className = u.role === '대표' ? 'text-rose-600' : u.role === '매니저' ? 'text-brand-600' : 'text-emerald-600';

    const now = new Date();
    const wk = ['일','월','화','수','목','금','토'][now.getDay()];
    const period = now.getHours() < 6 ? '새벽' : now.getHours() < 12 ? '오전' : now.getHours() < 18 ? '오후' : '저녁';
    document.getElementById('hello-time').textContent = `${period} · ${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${wk}요일`;

    // Leave toggle
    const lt = document.getElementById('leave-toggle');
    if (u.role === '직원') lt.classList.add('hidden');
    else {
        lt.classList.remove('hidden');
        lt.classList.add('inline-flex');
        const onL = state.onLeave[u.id];
        if (onL) {
            lt.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border bg-amber-100 text-amber-800 border-amber-300';
            document.getElementById('leave-toggle-label').textContent = '휴가 중';
        } else {
            lt.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50';
            document.getElementById('leave-toggle-label').textContent = '휴가 모드';
        }
    }
    const banner = document.getElementById('leave-banner');
    const lv = state.onLeave[u.id];
    if (lv) {
        banner.classList.remove('hidden'); banner.classList.add('flex');
        document.getElementById('leave-banner-name').textContent = `${u.name} ${u.role} 휴가 중`;
        const periodEl = document.getElementById('leave-banner-period');
        if (typeof lv === 'object' && lv.startDate && lv.endDate) {
            const days = Math.round((new Date(lv.endDate) - new Date(lv.startDate)) / 86400000) + 1;
            const cover = (lv.cover||[]).map(id => getUser(id)?.name).filter(Boolean).join(', ');
            periodEl.innerHTML = `· ${lv.startDate} ~ ${lv.endDate} (${days}일)${cover?` · 백업: <span class="font-extrabold">${cover}</span>`:''}`;
        } else {
            periodEl.textContent = '';
        }
    } else { banner.classList.add('hidden'); banner.classList.remove('flex'); }

    // View tabs (in filter bar)
    document.querySelectorAll('.vbtn').forEach(b => {
        const active = b.dataset.view === state.view;
        b.className = `vbtn px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${active?'bg-brand-600 text-white shadow-sm':'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`;
    });

    // Scope chips (multi-select)
    const activeScopes = new Set(state.scopes || []);
    const scopeColors = {
        received: { active:'bg-brand-600 text-white border-brand-600 shadow-sm', inactive:'bg-white text-brand-700 border-brand-200 hover:bg-brand-50' },
        self:     { active:'bg-emerald-600 text-white border-emerald-600 shadow-sm', inactive:'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50' },
        sent:     { active:'bg-purple-600 text-white border-purple-600 shadow-sm', inactive:'bg-white text-purple-700 border-purple-200 hover:bg-purple-50' },
    };
    document.querySelectorAll('.scope-btn').forEach(b => {
        const c = scopeColors[b.dataset.scope] || scopeColors.received;
        const active = activeScopes.has(b.dataset.scope);
        b.className = `scope-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] font-bold border transition-all ${active?c.active:c.inactive}`;
    });

    // KPIs — CEO sees team-wide stats; manager/staff see personal
    let scope, scopeLabel;
    if (u.role === '대표') { scope = state.tasks; scopeLabel = '전체 업무'; }
    else { scope = state.tasks.filter(t => t.to.includes(state.currentUserId)); scopeLabel = '받은 업무'; }
    const inProgress = scope.filter(t => t.status === '진행중');
    const dueToday = scope.filter(t => t.status !== '완료' && (t.due === TODAY || t.due === dateStr(1)));
    const overdue = scope.filter(t => t.status !== '완료' && t.due < TODAY);
    const completed = scope.filter(t => t.status === '완료').length;
    const rate = scope.length ? Math.round(completed / scope.length * 100) : 0;
    document.getElementById('kpi-inbox').textContent = scope.length;
    document.getElementById('kpi-progress').textContent = inProgress.length;
    document.getElementById('kpi-due').textContent = dueToday.length;
    document.getElementById('kpi-rate').textContent = rate;
    document.getElementById('kpi-rate-bar').style.width = `${rate}%`;
    // Update KPI title
    const kpiInboxLabel = document.querySelector('#kpi-inbox')?.parentElement?.parentElement?.querySelector('.uppercase');
    if (kpiInboxLabel) kpiInboxLabel.textContent = scopeLabel;
    document.getElementById('kpi-inbox-sub').textContent = u.role === '대표' ? `${state.tasks.filter(t => t.from === u.id).length}건 직접 지시` : (scope.filter(t => t.status === '할일').length + ' 신규');
    document.getElementById('kpi-progress-sub').textContent = inProgress.length === 0 ? '활동 없음' : `${inProgress.length}건 활동중`;
    document.getElementById('kpi-due-sub').textContent = overdue.length ? `${overdue.length}건 지연` : '지연 없음';

    // Notif (use received tasks for personal notification, regardless of role's KPI scope)
    const myRecv = state.tasks.filter(t => t.to.includes(state.currentUserId));
    const newCount = myRecv.filter(t => t.status === '할일' && (Date.now() - t.createdAt) < 86400000*2).length;
    const nb = document.getElementById('notif-badge');
    if (newCount > 0) { nb.textContent = newCount; nb.classList.remove('hidden'); }
    else nb.classList.add('hidden');

    // Filter status
    const total = tasksScoped().length;
    document.getElementById('filter-status').textContent = `${total}건 표시 중`;
}

function renderUserMenu() {
    const list = USERS.map(u => {
        const isMe = u.id === state.currentUserId;
        const onL = state.onLeave[u.id];
        return `<button onclick="switchUser('${u.id}')" class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 ${isMe?'bg-brand-50/60':''}">
            <div class="av av-${u.role} w-8 h-8 text-[12px]">${initial(u.name)}</div>
            <div class="flex-1 text-left">
                <div class="text-[12px] font-bold text-slate-800 flex items-center gap-1">${u.name}${onL?' <i class="ph-fill ph-airplane-tilt text-amber-500 text-[11px]"></i>':''}</div>
                <div class="text-[10px] text-slate-500">${u.role} · ${u.id}</div>
            </div>
            ${isMe?'<i class="ph-fill ph-check-circle text-brand-500 text-[14px]"></i>':''}
        </button>`;
    }).join('');
    document.getElementById('user-menu').innerHTML =
        `<div class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">계정 전환</div>${list}`;
}
function switchUser(id) { state.currentUserId = id; document.getElementById('user-menu').classList.add('hidden'); saveState(); render(); }

function toggleSidebar() {
    document.body.classList.toggle('sb-collapsed');
    const collapsed = document.body.classList.contains('sb-collapsed');
    localStorage.setItem('admin.sbCollapsed', collapsed ? '1' : '0');
    const lbl = document.querySelector('#sb-toggle .sb-text');
    if (lbl) lbl.textContent = collapsed ? '펼치기' : '사이드바 접기';
    const btn = document.getElementById('sb-toggle');
    if (btn) btn.title = collapsed ? '사이드바 펼치기' : '사이드바 접기';
}
function applySidebarCollapse() {
    if (localStorage.getItem('admin.sbCollapsed') === '1') {
        document.body.classList.add('sb-collapsed');
        const lbl = document.querySelector('#sb-toggle .sb-text');
        if (lbl) lbl.textContent = '펼치기';
        const btn = document.getElementById('sb-toggle');
        if (btn) btn.title = '사이드바 펼치기';
    }
}
let _peekUid = null;
let _peekFilter = 'all';
function peekTeamMember(id, filter) {
    const u = getUser(id); if (!u) return;
    const f = filter || 'all';
    const peekEl = document.getElementById('peek-modal');
    const isOpen = peekEl && !peekEl.classList.contains('hidden');
    // Toggle off if same member + same filter
    if (isOpen && _peekUid === id && _peekFilter === f) { closePeek(); return; }
    _peekUid = id;
    _peekFilter = f;
    const onL = state.onLeave[u.id];
    const inProg = state.tasks.filter(t => t.to.includes(u.id) && t.status === '진행중').length;
    const todo   = state.tasks.filter(t => t.to.includes(u.id) && t.status === '할일').length;
    const open   = state.tasks.filter(t => t.to.includes(u.id) && t.status !== '완료').length;
    const done   = state.tasks.filter(t => t.to.includes(u.id) && t.status === '완료').length;
    const total = open + done;
    const rate = total ? Math.round(done/total*100) : 0;
    const peek = document.getElementById('peek-modal');
    const av = peek.querySelector('[data-peek="av"]');
    av.dataset.uid = u.id;
    av.className = `av av-${u.role} w-16 h-16 text-[20px] inline-flex items-center justify-center rounded-full text-white font-extrabold shadow-md`;
    av.textContent = initial(u.name);
    peek.querySelector('[data-peek="name"]').textContent = u.name;
    peek.querySelector('[data-peek="role"]').textContent = `${u.role} · ${u.id}`;
    peek.querySelector('[data-peek="leave"]').classList.toggle('hidden', !onL);
    peek.querySelector('[data-peek="inprog"]').textContent = inProg;
    peek.querySelector('[data-peek="open"]').textContent = todo;
    peek.querySelector('[data-peek="done"]').textContent = done;
    peek.querySelector('[data-peek="rate"]').textContent = rate + '%';
    peek.querySelector('[data-peek="rate-bar"]').style.width = rate + '%';
    document.getElementById('peek-modal-overlay').classList.remove('hidden');
    peek.classList.remove('hidden');
    renderPeekTaskList();
    applyAvatarPhotos();
}
function setPeekFilter(f) {
    // Toggle off if clicking the same filter again → fall back to all
    _peekFilter = (_peekFilter === f) ? 'all' : f;
    renderPeekTaskList();
}
function renderPeekTaskList() {
    if (!_peekUid) return;
    const u = getUser(_peekUid); if (!u) return;
    const all = state.tasks.filter(t => t.to.includes(u.id));
    const tasks = _peekFilter === 'all' ? all : all.filter(t => t.status === _peekFilter);
    tasks.sort((a,b) => {
        const so = {'진행중':0,'할일':1,'완료':2};
        if (so[a.status] !== so[b.status]) return so[a.status] - so[b.status];
        return a.due.localeCompare(b.due);
    });

    // Highlight active stat
    document.querySelectorAll('.pk-stat').forEach(b => {
        const active = b.dataset.pkFilter === _peekFilter;
        b.classList.toggle('!border-current', active);
        b.classList.toggle('shadow-md', active);
    });

    const titleEl = document.getElementById('pk-list-title');
    const iconEl = document.getElementById('pk-list-icon');
    const countEl = document.getElementById('pk-list-count');
    const cfg = {
        '진행중': { title:'진행 중인 업무', icon:'ph-spinner-gap', cls:'text-blue-700' },
        '할일':   { title:'할 일 (미완)', icon:'ph-circle-dashed', cls:'text-amber-700' },
        '완료':   { title:'완료된 업무', icon:'ph-check-circle', cls:'text-emerald-700' },
        'all':    { title:'전체 업무', icon:'ph-list-checks', cls:'text-slate-700' },
    };
    const c = cfg[_peekFilter] || cfg.all;
    titleEl.textContent = c.title;
    titleEl.className = `font-extrabold ${c.cls}`;
    iconEl.className = `ph-fill ${c.icon} ${c.cls}`;
    countEl.textContent = `${tasks.length}건`;

    const list = document.getElementById('pk-task-list');
    if (tasks.length === 0) {
        list.innerHTML = `<div class="text-center py-8 text-[12px] text-slate-400"><i class="ph ph-confetti text-3xl block mb-2 opacity-50"></i>해당 업무가 없습니다</div>`;
        return;
    }
    list.innerHTML = tasks.map(t => {
        const fromU = getUser(t.from);
        const due = formatDue(t.due);
        return `<button onclick="closePeek();openDetail('${t.id}')" class="w-full text-left bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm rounded-lg p-2.5 transition-all flex items-start gap-2.5">
            <span class="w-1.5 h-3.5 rounded mt-1 pr-bar-${t.priority} shrink-0"></span>
            <span class="w-2 h-2 rounded-full st-bg-${t.status} mt-1.5 shrink-0 ${t.status==='진행중'?'pulse-dot':''}"></span>
            <div class="flex-1 min-w-0">
                <div class="text-[12.5px] font-bold text-slate-900 truncate ${t.status==='완료'?'line-through text-slate-400':''}">${escapeHtml(t.title)}</div>
                <div class="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span><i class="ph ph-arrow-bend-down-right text-slate-300"></i> ${fromU.name} 지시</span>
                    <span class="text-slate-300">·</span>
                    <span class="inline-flex items-center gap-0.5 px-1 py-0.5 rounded ${due.cls} border text-[9px] font-bold"><i class="ph ${due.icon} text-[10px]"></i>${due.text}</span>
                    ${t.comments?.length?`<span class="text-slate-300">·</span><span class="text-slate-400"><i class="ph ph-chat-circle"></i>${t.comments.length}</span>`:''}
                </div>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold st-${t.status} shrink-0">${t.status}</span>
        </button>`;
    }).join('');
}
function closePeek() { document.getElementById('peek-modal-overlay').classList.add('hidden'); document.getElementById('peek-modal').classList.add('hidden'); _peekUid = null; }
function toggleLeave() {
    const u = me();
    if (state.onLeave[u.id]) {
        // Currently on leave → return to work
        delete state.onLeave[u.id];
        saveState(); render();
        showToast(`${u.name}님 복귀하셨습니다`);
    } else {
        openLeaveModal();
    }
}

const LEAVE_CHECKLIST = [
    { id:'tasks',   label:'진행 중인 업무를 인수인계했나요?',   icon:'ph-list-checks' },
    { id:'urgent',  label:'마감 임박 업무를 처리/위임했나요?', icon:'ph-warning-circle' },
    { id:'memos',   label:'팀에 공유할 메모/문서를 작성했나요?', icon:'ph-note' },
    { id:'cover',   label:'백업 담당자에게 미리 알렸나요?',     icon:'ph-user-circle' },
    { id:'auto',    label:'자동회신 등 외부 알림을 설정했나요?', icon:'ph-envelope' },
];

function openLeaveModal() {
    const u = me();
    document.getElementById('lv-start').value = TODAY;
    document.getElementById('lv-end').value = dateStr(3);
    // Cover candidates: same role first, then others (exclude self)
    const cands = USERS.filter(x => x.id !== u.id);
    document.getElementById('lv-cover').innerHTML = cands.map(c => {
        const onL = state.onLeave[c.id];
        return `<button data-cover="${c.id}" onclick="this.classList.toggle('!bg-amber-100');this.classList.toggle('!border-amber-500');this.classList.toggle('!text-amber-700');this.classList.toggle('!shadow-sm')" class="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 bg-white text-[11px] font-bold hover:bg-slate-50 transition-all ${onL?'opacity-50':''}" ${onL?'disabled':''}>
            <span class="av av-${c.role} w-5 h-5 text-[9px] inline-flex items-center justify-center rounded-full text-white" data-uid="${c.id}">${initial(c.name)}</span>${c.name}<span class="text-[9px] text-slate-400">${c.role}</span>${onL?'<span class="text-[9px] text-amber-600">휴가</span>':''}
        </button>`;
    }).join('');

    // Checklist
    document.getElementById('lv-checklist').innerHTML = LEAVE_CHECKLIST.map(c => `
        <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-white rounded cursor-pointer">
            <input type="checkbox" data-check="${c.id}" onchange="updateLeaveCheckCount()" class="accent-amber-500 w-4 h-4">
            <i class="ph ${c.icon} text-amber-600 text-[14px]"></i>
            <span class="text-[12px] text-slate-700 font-medium">${c.label}</span>
        </label>
    `).join('');
    updateLeaveCheckCount();
    updateLeavePreview();

    document.getElementById('leave-modal-overlay').classList.remove('hidden');
    document.getElementById('leave-modal').classList.remove('hidden');
    applyAvatarPhotos();
}
function closeLeaveModal() { document.getElementById('leave-modal-overlay').classList.add('hidden'); document.getElementById('leave-modal').classList.add('hidden'); }
function updateLeavePreview() {
    const s = document.getElementById('lv-start').value;
    const e = document.getElementById('lv-end').value;
    const el = document.getElementById('lv-preview');
    if (!s || !e) { el.textContent = '시작일과 종료일을 선택하세요'; return; }
    if (e < s) { el.innerHTML = '<i class="ph ph-warning"></i> 종료일이 시작일보다 이전입니다'; return; }
    const days = Math.round((new Date(e) - new Date(s)) / 86400000) + 1;
    const sf = formatDue(s), ef = formatDue(e);
    el.innerHTML = `<i class="ph-fill ph-airplane-tilt"></i> ${s} ~ ${e} <span class="opacity-70">·</span> 총 <span class="text-[13px]">${days}일</span>`;
}
function updateLeaveCheckCount() {
    const checks = document.querySelectorAll('#lv-checklist input[type="checkbox"]');
    const done = Array.from(checks).filter(c => c.checked).length;
    const total = checks.length;
    document.getElementById('lv-check-count').textContent = `${done} / ${total} 완료`;
    const btn = document.getElementById('lv-confirm');
    if (done < 2) {
        btn.classList.add('opacity-60');
        btn.title = '권장: 최소 2개 이상 체크 후 시작';
    } else {
        btn.classList.remove('opacity-60');
        btn.title = '';
    }
}
function confirmLeave() {
    const u = me();
    const start = document.getElementById('lv-start').value;
    const end = document.getElementById('lv-end').value;
    if (!start || !end) { showToast('휴가 기간을 선택하세요'); return; }
    if (end < start) { showToast('종료일이 잘못되었습니다'); return; }
    const cover = Array.from(document.querySelectorAll('#lv-cover button.\\!bg-amber-100')).map(b => b.dataset.cover);
    const checked = Array.from(document.querySelectorAll('#lv-checklist input:checked')).map(c => c.dataset.check);
    state.onLeave[u.id] = { startDate: start, endDate: end, cover, checked, startedAt: Date.now() };
    saveState(); closeLeaveModal(); render();
    showToast(`${u.name}님 ${start}~${end} 휴가 시작!`);
}
let _kpiPeekKind = null;
function filterKpi(kind) {
    // Toggle off if same KPI re-clicked
    if (_kpiPeekKind === kind && !document.getElementById('kpi-modal').classList.contains('hidden')) {
        closeKpiPeek();
        return;
    }
    _kpiPeekKind = kind;
    const u = me();
    let scope;
    if (u.role === '대표') scope = state.tasks;
    else scope = state.tasks.filter(t => t.to.includes(u.id));
    let tasks = [], cfg;
    if (kind === 'inbox') {
        cfg = { title: u.role === '대표' ? '전체 업무' : '받은 업무', sub: u.role === '대표' ? '팀 전체 업무 한눈에 보기' : '나에게 할당된 모든 업무', icon:'ph-tray', bg:'bg-brand-500' };
        tasks = scope.slice();
    } else if (kind === 'progress') {
        cfg = { title: '진행 중', sub: '지금 처리되고 있는 업무', icon:'ph-spinner-gap', bg:'bg-blue-500' };
        tasks = scope.filter(t => t.status === '진행중');
    } else if (kind === 'today') {
        cfg = { title: '마감 임박', sub: '오늘·내일 마감되는 업무', icon:'ph-clock-countdown', bg:'bg-amber-500' };
        tasks = scope.filter(t => t.status !== '완료' && (t.due === TODAY || t.due === dateStr(1)));
    } else if (kind === 'overdue') {
        cfg = { title: '완료', sub: '완료된 업무', icon:'ph-check-circle', bg:'bg-emerald-500' };
        tasks = scope.filter(t => t.status === '완료');
    }
    tasks.sort((a,b) => {
        const so = {'진행중':0,'할일':1,'완료':2};
        if (so[a.status] !== so[b.status]) return so[a.status] - so[b.status];
        return a.due.localeCompare(b.due);
    });
    document.getElementById('kpi-modal-icon').className = `ph-fill ${cfg.icon} text-base`;
    document.getElementById('kpi-modal-icon-wrap').className = `${cfg.bg} p-1.5 rounded-lg shadow-sm text-white`;
    document.getElementById('kpi-modal-title').innerHTML = `${cfg.title} <span class="text-[12px] font-bold text-slate-400 ml-1 tabular-nums">${tasks.length}건</span>`;
    document.getElementById('kpi-modal-sub').textContent = cfg.sub;
    const list = document.getElementById('kpi-modal-list');
    if (tasks.length === 0) {
        list.innerHTML = `<div class="text-center py-12 text-[12px] text-slate-400"><i class="ph ph-confetti text-4xl block mb-2 opacity-50"></i>해당 업무가 없습니다</div>`;
    } else {
        list.innerHTML = tasks.map(t => {
            const fromU = getUser(t.from);
            const toUsers = t.to.map(getUser);
            const due = formatDue(t.due);
            return `<button onclick="closeKpiPeek();openDetail('${t.id}')" class="w-full text-left bg-white border border-slate-200 hover:border-brand-400 hover:shadow-sm rounded-lg p-2.5 transition-all flex items-start gap-2.5">
                <span class="w-1.5 h-3.5 rounded mt-1 pr-bar-${t.priority} shrink-0"></span>
                <span class="w-2 h-2 rounded-full st-bg-${t.status} mt-1.5 shrink-0 ${t.status==='진행중'?'pulse-dot':''}"></span>
                <div class="flex-1 min-w-0">
                    <div class="text-[12.5px] font-bold text-slate-900 truncate ${t.status==='완료'?'line-through text-slate-400':''}">${escapeHtml(t.title)}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span><i class="ph ph-arrow-bend-down-right text-slate-300"></i> ${fromU.name} → ${toUsers.map(x=>x.name).join(', ')}</span>
                        <span class="text-slate-300">·</span>
                        <span class="inline-flex items-center gap-0.5 px-1 py-0.5 rounded ${due.cls} border text-[9px] font-bold"><i class="ph ${due.icon} text-[10px]"></i>${due.text}</span>
                        ${t.comments?.length?`<span class="text-slate-300">·</span><span class="text-slate-400"><i class="ph ph-chat-circle"></i>${t.comments.length}</span>`:''}
                    </div>
                </div>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold st-${t.status} shrink-0">${t.status}</span>
                <div class="flex items-center -space-x-1.5 shrink-0">
                    ${toUsers.slice(0,2).map(u => `<span class="av av-${u.role} w-5 h-5 text-[9px] inline-flex items-center justify-center rounded-full text-white border-[1.5px] border-white" data-uid="${u.id}">${initial(u.name)}</span>`).join('')}
                </div>
            </button>`;
        }).join('');
    }
    document.getElementById('kpi-modal-overlay').classList.remove('hidden');
    document.getElementById('kpi-modal').classList.remove('hidden');
    setTimeout(applyAvatarPhotos, 0);
}
function closeKpiPeek() {
    document.getElementById('kpi-modal-overlay').classList.add('hidden');
    document.getElementById('kpi-modal').classList.add('hidden');
    _kpiPeekKind = null;
}

// ════════════════════════════════════════════════════════════════════
// MAIN VIEW DISPATCH
// ════════════════════════════════════════════════════════════════════
function render() {
    renderHeader();
    renderChannelSidebar();
    setTimeout(applyAvatarPhotos, 0);

    // Toggle major DOM blocks visibility based on channel
    const noticeBoard = document.getElementById('notice-board');
    const memoPanel = document.getElementById('view-memo');
    const filterBar = document.querySelector('main > div.flex.items-center.gap-2.flex-wrap');
    const kpiStrip = document.querySelector('main > div.grid.grid-cols-2.lg\\:grid-cols-4');

    // Show only what the current channel needs
    if (state.channel === 'home') {
        kpiStrip?.classList.remove('hidden');
        filterBar?.classList.add('hidden');
        noticeBoard.classList.add('hidden');
        memoPanel.classList.add('hidden');
        renderHome();
    } else if (state.channel === 'tasks') {
        kpiStrip?.classList.remove('hidden');
        filterBar?.classList.remove('hidden');
        noticeBoard.classList.add('hidden');
        memoPanel.classList.add('hidden');
        if (state.view === 'kanban') renderKanban();
        else if (state.view === 'duedate') renderDueDate();
        else renderList();
    } else if (state.channel === 'memos') {
        kpiStrip?.classList.add('hidden');
        filterBar?.classList.add('hidden');
        noticeBoard.classList.add('hidden');
        memoPanel.classList.remove('hidden');
        document.getElementById('view-main').innerHTML = '';
        renderMemoPanel();
    } else if (state.channel === 'team') {
        kpiStrip?.classList.add('hidden');
        filterBar?.classList.add('hidden');
        noticeBoard.classList.add('hidden');
        memoPanel.classList.add('hidden');
        renderTeamView();
    }
}

// ────────────────────────────────  HOME (customizable dashboard)  ────────────────────────────────
function renderHome() {
    const main = document.getElementById('view-main');
    const widgets = state.homeWidgets || ['notices','today','projects','memos'];

    main.innerHTML = `
        <div class="space-y-4">
            ${widgets.includes('notices') ? widgetHtml('notices') : ''}
            ${widgets.filter(w => w !== 'notices').length ? `<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                ${widgets.filter(w => w !== 'notices').map(w => widgetHtml(w)).join('')}
            </div>` : ''}
            <div class="text-center">
                <button onclick="openWidgetPicker()" class="text-[11px] font-bold text-slate-400 hover:text-brand-600 transition-colors px-3 py-1.5 hover:bg-brand-50 rounded-lg">
                    <i class="ph ph-sliders"></i> 홈 화면 위젯 설정 (현재 ${widgets.length}개)
                </button>
            </div>
        </div>`;
}

function widgetHtml(kind) {
    if (kind === 'notices') return widgetNoticesHtml();
    if (kind === 'today')    return widgetTodayHtml();
    if (kind === 'projects') return widgetProjectsHtml();
    if (kind === 'memos')    return widgetMemosHtml();
    if (kind === 'team')     return widgetTeamHtml();
    return '';
}

function isNoticeVisibleToMe(n) {
    const aud = n.audience || ['ALL'];
    if (aud.includes('ALL')) return true;
    if (aud.includes(state.currentUserId)) return true;
    return n.author === state.currentUserId;
}
function noticeIsRead(n) { return (n.readBy||[]).includes(state.currentUserId); }
function markNoticeRead(id) {
    const n = state.notices.find(x => x.id === id); if (!n) return;
    n.readBy = n.readBy || [];
    if (!n.readBy.includes(state.currentUserId)) n.readBy.push(state.currentUserId);
    saveState(); render();
}
function unmarkNoticeRead(id) {
    const n = state.notices.find(x => x.id === id); if (!n) return;
    n.readBy = (n.readBy||[]).filter(u => u !== state.currentUserId);
    saveState(); render();
}

function widgetNoticesHtml() {
    let visible = (state.notices||[]).filter(isNoticeVisibleToMe);
    // Apply time range filter to notices (by createdAt)
    if (state.timeRange && state.timeRange !== 'all') {
        const r = getTimeRange();
        const startMs = new Date(r.start).getTime();
        const endMs   = new Date(r.end).getTime() + 86400000 - 1;
        visible = visible.filter(n => n.createdAt >= startMs && n.createdAt <= endMs);
    }
    const unread = visible.filter(n => !noticeIsRead(n)).sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0) || b.createdAt - a.createdAt);
    const read   = visible.filter(n =>  noticeIsRead(n)).sort((a,b) => b.createdAt - a.createdAt);
    const isAdmin = me().role === '대표' || me().role === '매니저';
    if (visible.length === 0) {
        return `<section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-megaphone text-slate-700"></i>공지사항</h3>
                ${isAdmin?'<button onclick="openNoticeModal()" class="text-[11px] font-bold text-brand-600 hover:bg-brand-50 px-2 py-1 rounded">+ 공지 작성</button>':''}
            </header>
            <div class="px-4 py-8 text-center text-[12px] text-slate-400"><i class="ph ph-megaphone-simple text-3xl block mb-2 opacity-50"></i>등록된 공지가 없습니다</div>
        </section>`;
    }

    return `<section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <h3 class="text-[13px] font-extrabold text-slate-800 flex items-center gap-2"><i class="ph-fill ph-megaphone text-slate-700"></i>공지사항
                ${unread.length?`<span class="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-red-500 text-white">${unread.length} 미확인</span>`:''}
            </h3>
            <div class="flex items-center gap-2">
                ${timeRangeSelectHtml()}
                ${isAdmin?'<button onclick="openNoticeModal()" class="text-[11px] font-bold text-brand-600 hover:bg-brand-50 px-2 py-1 rounded"><i class="ph-bold ph-plus"></i> 공지 작성</button>':''}
            </div>
        </header>

        ${unread.length ? `<div>
            <div class="px-4 py-1.5 bg-red-50/50 border-b border-red-100 text-[10px] font-extrabold text-red-700 uppercase tracking-wider flex items-center gap-1.5"><i class="ph-fill ph-bell-ringing"></i>미확인 공지 ${unread.length}건</div>
            <div class="divide-y divide-slate-100">${unread.map(n => noticeRowHtml(n, false)).join('')}</div>
        </div>`:''}

        ${read.length ? `<details ${unread.length?'':'open'} class="border-t border-slate-100">
            <summary class="cursor-pointer px-4 py-2 hover:bg-slate-50 list-none flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <span class="flex items-center gap-1.5"><i class="ph-fill ph-check-circle text-emerald-500"></i>확인 완료 ${read.length}건</span>
                <i class="ph ph-caret-down"></i>
            </summary>
            <div class="divide-y divide-slate-100">${read.map(n => noticeRowHtml(n, true)).join('')}</div>
        </details>`:''}
    </section>`;
}

function noticeRowHtml(n, isRead) {
    const sevCfg = {
        info:    { bg:'from-brand-50 to-brand-100/40',     icon:'ph-info',           ic:'text-brand-600',   dot:'bg-brand-500' },
        warning: { bg:'from-amber-50 to-amber-100/40',     icon:'ph-warning',        ic:'text-amber-600',   dot:'bg-amber-500' },
        success: { bg:'from-emerald-50 to-emerald-100/40', icon:'ph-confetti',       ic:'text-emerald-600', dot:'bg-emerald-500' },
        danger:  { bg:'from-red-50 to-red-100/40',         icon:'ph-warning-octagon', ic:'text-red-600',     dot:'bg-red-500' },
    };
    const cfg = sevCfg[n.severity] || sevCfg.info;
    const author = getUser(n.author);
    const isMine = n.author === state.currentUserId;
    const myRole = (typeof me === 'function' ? (me().role || '') : '');
    const canManage = isMine || myRole === '대표';
    const aud = n.audience || ['ALL'];
    const audLabel = aud.includes('ALL') ? '전체' : `${aud.length}명`;
    const readCount = (n.readBy||[]).length;
    return `<div class="px-4 py-3 flex items-start gap-3 ${isRead?'bg-slate-50/40 opacity-75':'bg-gradient-to-r '+cfg.bg} relative group">
        ${n.pinned ? `<i class="ph-fill ph-push-pin absolute top-2 right-2 text-amber-500 text-[12px] rotate-45"></i>` : ''}
        <div class="shrink-0 mt-0.5"><i class="ph-fill ${cfg.icon} ${cfg.ic} text-lg ${isRead?'opacity-60':''}"></i></div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <h4 class="text-[12.5px] font-extrabold ${isRead?'text-slate-600':'text-slate-900'}">${escapeHtml(n.title)}</h4>
                ${!isRead?`<span class="w-1.5 h-1.5 rounded-full ${cfg.dot}"></span>`:''}
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${aud.includes('ALL')?'bg-slate-100 text-slate-600':'bg-purple-100 text-purple-700'}"><i class="ph ph-${aud.includes('ALL')?'globe':'users'} text-[9px]"></i> ${audLabel}</span>
            </div>
            <p class="text-[11.5px] ${isRead?'text-slate-500':'text-slate-700'} leading-snug whitespace-pre-line">${escapeHtml(n.body)}</p>
            <div class="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span class="av av-${author.role} w-3.5 h-3.5 text-[8px] inline-flex items-center justify-center rounded-full" data-uid="${author.id}">${initial(author.name)}</span>
                <span class="font-bold">${author.name}</span>
                <span class="text-slate-300">·</span>
                <span>${timeAgo(n.createdAt)}</span>
                ${readCount?`<span class="text-slate-300">·</span><span class="text-emerald-600 font-bold"><i class="ph ph-check"></i> ${readCount}명 확인</span>`:''}
            </div>
        </div>
        <div class="flex items-center gap-1 shrink-0 self-start mt-0.5 justify-end" style="min-width:140px;">
            <div style="width:68px;display:flex;justify-content:flex-end;">
                ${!isRead
                    ? `<button onclick="markNoticeRead('${n.id}')" class="px-2 py-1 text-[10px] font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 rounded-md shadow-sm transition-all whitespace-nowrap"><i class="ph-bold ph-check"></i> 확인</button>`
                    : `<button onclick="unmarkNoticeRead('${n.id}')" class="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-200 rounded-md transition-all whitespace-nowrap"><i class="ph ph-arrow-counter-clockwise"></i> 되돌리기</button>`}
            </div>
            <div class="flex items-center gap-0.5 transition-opacity ${canManage ? 'opacity-0 group-hover:opacity-100' : 'invisible'}" style="width:60px;justify-content:flex-end;">
                <button onclick="toggleNoticePin('${n.id}')" class="p-1 hover:bg-white/60 rounded text-slate-500"><i class="ph${n.pinned?'-fill':''} ph-push-pin text-[12px]"></i></button>
                <button onclick="deleteNotice('${n.id}')" class="p-1 hover:bg-red-100 hover:text-red-600 rounded text-slate-500"><i class="ph ph-trash text-[12px]"></i></button>
            </div>
        </div>
    </div>`;
}

function widgetTodayHtml() {
    const recv = state.tasks.filter(t => t.to.includes(state.currentUserId) && t.status !== '완료');
    const todays = recv.filter(t => t.due === TODAY).sort((a,b) => (b.priority==='high'?1:0) - (a.priority==='high'?1:0));
    const tomorrows = recv.filter(t => t.due === dateStr(1)).slice(0,3);
    const overdue = recv.filter(t => t.due < TODAY).slice(0,3);
    return `<section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/40 to-white">
            <h3 class="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-clock-clockwise text-amber-600"></i>오늘 할 일</h3>
            <button onclick="state.channel='tasks';state.view='duedate';render()" class="text-[10px] font-bold text-slate-400 hover:text-brand-600">전체보기 →</button>
        </header>
        <div class="divide-y divide-slate-100">
            ${overdue.length ? `<div class="px-3 py-1 text-[9px] font-bold text-red-600 uppercase bg-red-50/50">⚠ 지연 ${overdue.length}건</div>` + overdue.map(taskMiniHtml).join('') : ''}
            ${todays.length ? `<div class="px-3 py-1 text-[9px] font-bold text-amber-600 uppercase bg-amber-50/50">오늘 ${todays.length}건</div>` + todays.map(taskMiniHtml).join('') : ''}
            ${tomorrows.length ? `<div class="px-3 py-1 text-[9px] font-bold text-slate-500 uppercase bg-slate-50">내일 ${tomorrows.length}건</div>` + tomorrows.map(taskMiniHtml).join('') : ''}
            ${overdue.length + todays.length + tomorrows.length === 0 ? '<div class="px-4 py-8 text-center text-[12px] text-slate-400"><i class="ph ph-confetti text-3xl block mb-2 opacity-50"></i>오늘 할 일이 없습니다 ✨</div>' : ''}
        </div>
    </section>`;
}
function taskMiniHtml(t) {
    const fromU = getUser(t.from);
    return `<button onclick="openDetail('${t.id}')" class="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-left">
        <span class="w-1 h-3.5 rounded pr-bar-${t.priority} shrink-0"></span>
        <span class="w-2 h-2 rounded-full st-bg-${t.status} shrink-0"></span>
        <span class="flex-1 min-w-0 text-[12px] font-bold text-slate-800 truncate">${escapeHtml(t.title)}</span>
        <span class="text-[10px] text-slate-400">${fromU.name}</span>
    </button>`;
}

function widgetProjectsHtml() {
    const projects = (state.projects||[]).filter(p => p.status !== '완료').sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0,4);
    return `<section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50/40 to-white">
            <h3 class="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-rocket-launch text-rose-500"></i>진행 중 프로젝트</h3>
            <button onclick="state.channel='team';render()" class="text-[10px] font-bold text-slate-400 hover:text-brand-600">전체보기 →</button>
        </header>
        <div class="divide-y divide-slate-100">
            ${projects.length === 0 ? '<div class="px-4 py-8 text-center text-[12px] text-slate-400">진행 중인 프로젝트 없음</div>' :
                projects.map(p => {
                    const cfg = PROJECT_TYPE_CFG[p.type] || PROJECT_TYPE_CFG['기타'];
                    const members = p.members.slice(0,4).map(getUser);
                    const pc = p.progress >= 80 ? 'bg-emerald-500' : p.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500';
                    return `<button onclick="openProjectDetail('${p.id}')" class="w-full px-4 py-3 hover:bg-slate-50 text-left">
                        <div class="flex items-center gap-2 mb-1.5">
                            <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${cfg.badge}"><i class="ph-fill ${cfg.icon}"></i> ${p.type}</span>
                            <span class="flex-1 text-[12.5px] font-extrabold text-slate-900 truncate">${escapeHtml(p.title)}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="flex-1 load-track h-1.5"><div class="load-fill ${pc}" style="width:${p.progress}%"></div></div>
                            <span class="text-[10px] font-bold text-slate-700 tabular-nums">${p.progress}%</span>
                        </div>
                        <div class="mt-1.5 flex items-center justify-between">
                            <div class="flex items-center -space-x-1">${members.map(u => `<span class="av av-${u.role} w-4 h-4 text-[8px] border border-white">${initial(u.name)}</span>`).join('')}</div>
                            <span class="text-[10px] text-slate-400 font-bold">${p.dueDate}</span>
                        </div>
                    </button>`;
                }).join('')}
        </div>
    </section>`;
}

function widgetMemosHtml() {
    const memos = visibleMemos().filter(m => m.pinned).sort((a,b) => b.updatedAt - a.updatedAt).slice(0,4);
    const all = visibleMemos();
    return `<section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/40 to-white">
            <h3 class="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-push-pin text-amber-500 rotate-45"></i>핀 메모</h3>
            <button onclick="state.channel='memos';render()" class="text-[10px] font-bold text-slate-400 hover:text-brand-600">${all.length}건 전체 →</button>
        </header>
        <div class="divide-y divide-slate-100">
            ${memos.length === 0 ? '<div class="px-4 py-8 text-center text-[12px] text-slate-400"><i class="ph ph-note text-3xl block mb-2 opacity-50"></i>고정된 메모 없음</div>' :
                memos.map(m => {
                    const author = getUser(m.author);
                    return `<button onclick="state.channel='memos';render()" class="w-full px-4 py-2.5 hover:bg-slate-50 text-left">
                        <div class="flex items-center gap-1.5 mb-0.5">
                            ${m.visibility==='private'?'<i class="ph ph-lock-key text-slate-400 text-[11px]"></i>':'<i class="ph ph-users-three text-slate-400 text-[11px]"></i>'}
                            <span class="text-[12px] font-extrabold text-slate-900 truncate">${escapeHtml(m.title)}</span>
                        </div>
                        <p class="text-[10.5px] text-slate-500 line-clamp-2">${escapeHtml(m.body||'')}</p>
                        <div class="text-[9px] text-slate-400 mt-1">${author.name} · ${timeAgo(m.updatedAt)}</div>
                    </button>`;
                }).join('')}
        </div>
    </section>`;
}

function widgetTeamHtml() {
    const others = USERS.filter(u => u.id !== state.currentUserId);
    return `<section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-50/40 to-white">
            <h3 class="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-users-three text-brand-500"></i>팀 현황</h3>
            <button onclick="state.channel='team';render()" class="text-[10px] font-bold text-slate-400 hover:text-brand-600">팀 채널 →</button>
        </header>
        <div class="divide-y divide-slate-100">
            ${others.map(u => {
                const onL = state.onLeave[u.id];
                const load = state.tasks.filter(t => t.to.includes(u.id) && t.status !== '완료').length;
                return `<button onclick="peekTeamMember('${u.id}')" class="w-full px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-left">
                    <div class="av av-${u.role} w-7 h-7 text-[11px] relative">${initial(u.name)}${onL?'<span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border-[1.5px] border-white rounded-full"></span>':''}</div>
                    <div class="flex-1 min-w-0">
                        <div class="text-[12px] font-bold text-slate-800">${u.name}</div>
                        <div class="text-[10px] text-slate-500">${u.role}${onL?' · 휴가':''}</div>
                    </div>
                    ${load > 0 ? `<span class="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded tabular-nums">${load}</span>` : ''}
                </button>`;
            }).join('')}
        </div>
    </section>`;
}

function openWidgetPicker() {
    const all = ['notices','today','projects','memos','team'];
    const labels = { notices:'공지사항', today:'오늘 할 일', projects:'진행 중 프로젝트', memos:'핀 메모', team:'팀 현황' };
    const current = state.homeWidgets || all;
    const picks = all.map(w => ({ key:w, label:labels[w], on:current.includes(w) }));
    const result = prompt('홈 화면에 표시할 위젯 (쉼표로 구분):\n\n' + all.map(k => `- ${k}: ${labels[k]}`).join('\n') + '\n\n현재: ' + current.join(','), current.join(','));
    if (!result) return;
    const parts = result.split(',').map(s => s.trim()).filter(s => all.includes(s));
    if (parts.length === 0) { showToast('유효한 위젯이 없습니다'); return; }
    state.homeWidgets = parts;
    saveState(); render();
    showToast('위젯이 저장되었습니다');
}

function renderChannelSidebar() {
    // Counts
    const recv = state.tasks.filter(t => t.to.includes(state.currentUserId) && t.status !== '완료');
    const homeEl = document.getElementById('ch-count-home');
    if (homeEl) homeEl.textContent = (state.notices||[]).length || '';
    document.getElementById('ch-count-tasks').textContent = recv.length || '';
    document.getElementById('ch-count-memos').textContent = visibleMemos().length || '';
    const onLeaveCount = USERS.filter(u => state.onLeave[u.id]).length;
    document.getElementById('ch-count-team').textContent = onLeaveCount ? `${onLeaveCount}휴가` : '';

    // Active channel
    document.querySelectorAll('.ch-btn').forEach(b => {
        const active = b.dataset.channel === state.channel;
        b.className = `ch-btn w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-bold transition-all ${active?'bg-brand-600 text-white shadow-sm':'text-slate-700 hover:bg-slate-100'}`;
    });

    // Team presence
    const others = USERS.filter(u => u.id !== state.currentUserId);
    const lc = document.getElementById('sidebar-leave-count');
    const onLeaveOthers = others.filter(u => state.onLeave[u.id]).length;
    if (onLeaveOthers > 0) { lc.classList.remove('hidden'); lc.textContent = `${onLeaveOthers} 휴가`; }
    else lc.classList.add('hidden');

    document.getElementById('sidebar-team-list').innerHTML = others.map(u => {
        const onL = state.onLeave[u.id];
        const myTasks = state.tasks.filter(t => t.from === state.currentUserId && t.to.includes(u.id) && t.status !== '완료').length;
        return `<button onclick="peekTeamMember('${u.id}')" class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] hover:bg-slate-100 transition-colors">
            <div class="av av-${u.role} w-6 h-6 text-[10px] relative">${initial(u.name)}${onL?'<span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-amber-400 border border-white rounded-full"></span>':''}</div>
            <span class="flex-1 text-left text-slate-700 truncate">${u.name}</span>
            ${myTasks > 0 ? `<span class="text-[10px] font-bold text-slate-400 tabular-nums">${myTasks}</span>` : ''}
        </button>`;
    }).join('');
}

// ────────────────────────────────  공지사항  ────────────────────────────────
function renderNotices() {
    const board = document.getElementById('notice-board');
    if (!board) return;
    const items = (state.notices||[]).slice().sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0) || b.createdAt - a.createdAt);
    if (items.length === 0) { board.innerHTML = ''; return; }
    const sevCfg = {
        info:    { bg:'from-brand-50 to-brand-100/40', border:'border-brand-200', icon:'ph-info', iconColor:'text-brand-600', dot:'bg-brand-500' },
        warning: { bg:'from-amber-50 to-amber-100/40', border:'border-amber-200', icon:'ph-warning', iconColor:'text-amber-600', dot:'bg-amber-500' },
        success: { bg:'from-emerald-50 to-emerald-100/40', border:'border-emerald-200', icon:'ph-confetti', iconColor:'text-emerald-600', dot:'bg-emerald-500' },
        danger:  { bg:'from-red-50 to-red-100/40', border:'border-red-200', icon:'ph-warning-octagon', iconColor:'text-red-600', dot:'bg-red-500' },
    };
    const isAdmin = me().role === '대표' || me().role === '매니저';
    board.innerHTML = `
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <header class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <h3 class="text-[12px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-megaphone text-slate-700"></i>공지사항 <span class="text-[10px] font-bold text-slate-400">${items.length}</span></h3>
                ${isAdmin ? `<button onclick="openNoticeModal()" class="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-brand-600 hover:bg-brand-50 rounded transition-colors"><i class="ph-bold ph-plus"></i>공지 작성</button>` : ''}
            </header>
            <div class="divide-y divide-slate-100">
                ${items.map(n => {
                    const cfg = sevCfg[n.severity] || sevCfg.info;
                    const author = getUser(n.author);
                    const isMine = n.author === state.currentUserId;
                    return `<div class="px-4 py-2.5 flex items-start gap-3 bg-gradient-to-r ${cfg.bg} relative group">
                        ${n.pinned ? `<i class="ph-fill ph-push-pin absolute top-2 right-2 text-amber-500 text-[12px] rotate-45"></i>` : ''}
                        <div class="shrink-0 mt-0.5"><i class="ph-fill ${cfg.icon} ${cfg.iconColor} text-lg"></i></div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5 mb-0.5">
                                <h4 class="text-[12.5px] font-extrabold text-slate-900">${escapeHtml(n.title)}</h4>
                                <span class="w-1.5 h-1.5 rounded-full ${cfg.dot}"></span>
                            </div>
                            <p class="text-[11.5px] text-slate-700 leading-snug whitespace-pre-line">${escapeHtml(n.body)}</p>
                            <div class="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                                <span class="av av-${author.role} w-3.5 h-3.5 text-[8px]">${initial(author.name)}</span>
                                <span class="font-bold">${author.name}</span>
                                <span class="text-slate-300">·</span>
                                <span>${timeAgo(n.createdAt)}</span>
                            </div>
                        </div>
                        ${isMine || me().role === '대표' ? `<div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            <button onclick="toggleNoticePin('${n.id}')" class="p-1 hover:bg-white/60 rounded text-slate-500" title="고정"><i class="ph${n.pinned?'-fill':''} ph-push-pin text-[12px]"></i></button>
                            <button onclick="deleteNotice('${n.id}')" class="p-1 hover:bg-red-100 hover:text-red-600 rounded text-slate-500"><i class="ph ph-trash text-[12px]"></i></button>
                        </div>`:''}
                    </div>`;
                }).join('')}
            </div>
        </div>`;
}

function toggleNoticePin(id) { const n = state.notices.find(x => x.id === id); if (!n) return; n.pinned = !n.pinned; saveState(); render(); }
function deleteNotice(id) { if (!confirm('공지를 삭제하시겠습니까?')) return; state.notices = state.notices.filter(n => n.id !== id); saveState(); render(); }

// ────────────────────────────────  메모장 패널 (본문 하단)  ────────────────────────────────
function renderMemoPanel() {
    const panel = document.getElementById('view-memo');
    if (!panel) return;
    if (state.view === 'memo' || state.view === 'team') { panel.innerHTML = ''; return; }

    const tab = state.memoTab || 'team';
    let memos = visibleMemos().filter(m => m.visibility === tab);
    memos.sort((a,b) => {
        if ((a.pinned?1:0) !== (b.pinned?1:0)) return (b.pinned?1:0) - (a.pinned?1:0);
        return b.updatedAt - a.updatedAt;
    });
    const teamCount = visibleMemos().filter(m => m.visibility === 'team').length;
    const privCount = visibleMemos().filter(m => m.visibility === 'private').length;

    const mv = state.memoView || 'gallery';
    let body = '';
    if (memos.length === 0) {
        body = `<div class="text-center py-8 text-[12px] text-slate-400"><i class="ph ph-note-pencil text-3xl block mb-2 opacity-50"></i>${tab==='team'?'공유 메모가 없습니다':'개인 메모가 없습니다'}</div>`;
    } else if (mv === 'gallery') {
        body = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${memos.map(memoCardHtml).join('')}</div>`;
    } else if (mv === 'list') {
        body = `<div class="bg-white rounded-lg border border-slate-200 overflow-hidden">${memos.map(memoListRowHtml).join('')}</div>`;
    } else if (mv === 'compact') {
        body = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">${memos.map(memoCompactHtml).join('')}</div>`;
    } else if (mv === 'byAuthor') {
        const groups = {};
        memos.forEach(m => { (groups[m.author] = groups[m.author] || []).push(m); });
        const sortedAuthors = Object.keys(groups).sort((a,b) => groups[b].length - groups[a].length);
        body = sortedAuthors.map(aid => {
            const a = getUser(aid);
            return `<section class="mb-4 last:mb-0">
                <header class="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                    <span class="av av-${a.role} w-6 h-6 text-[10px] inline-flex items-center justify-center rounded-full text-white" data-uid="${a.id}">${initial(a.name)}</span>
                    <span class="text-[12px] font-extrabold text-slate-900">${a.name}</span>
                    <span class="text-[10px] text-slate-400">${a.role}</span>
                    <span class="ml-auto text-[10px] font-bold text-slate-400">${groups[aid].length}건</span>
                </header>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${groups[aid].map(memoCardHtml).join('')}</div>
            </section>`;
        }).join('');
    }

    panel.innerHTML = `
        <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap bg-gradient-to-r from-amber-50/40 to-white">
                <div class="flex items-center gap-3 flex-wrap">
                    <h3 class="text-[14px] font-extrabold text-slate-900 flex items-center gap-1.5"><i class="ph-fill ph-note text-amber-500"></i>메모장</h3>
                    <div class="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                        <button onclick="state.memoTab='team';renderMemoPanel()" class="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${tab==='team'?'bg-white text-amber-700 shadow-sm':'text-slate-500 hover:text-slate-700'}"><i class="ph ph-users-three mr-1"></i>공유 <span class="opacity-60 ml-0.5">${teamCount}</span></button>
                        <button onclick="state.memoTab='private';renderMemoPanel()" class="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${tab==='private'?'bg-white text-amber-700 shadow-sm':'text-slate-500 hover:text-slate-700'}"><i class="ph ph-lock-key mr-1"></i>개인 <span class="opacity-60 ml-0.5">${privCount}</span></button>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm" title="보기 모드">
                        <button onclick="state.memoView='gallery';renderMemoPanel()" class="px-2 py-1 rounded-md text-[11px] font-bold transition-all ${mv==='gallery'?'bg-amber-500 text-white shadow-sm':'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}" title="갤러리"><i class="ph ph-squares-four"></i></button>
                        <button onclick="state.memoView='compact';renderMemoPanel()" class="px-2 py-1 rounded-md text-[11px] font-bold transition-all ${mv==='compact'?'bg-amber-500 text-white shadow-sm':'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}" title="컴팩트"><i class="ph ph-grid-four"></i></button>
                        <button onclick="state.memoView='list';renderMemoPanel()"    class="px-2 py-1 rounded-md text-[11px] font-bold transition-all ${mv==='list'?'bg-amber-500 text-white shadow-sm':'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}" title="리스트"><i class="ph ph-rows"></i></button>
                        <button onclick="state.memoView='byAuthor';renderMemoPanel()"class="px-2 py-1 rounded-md text-[11px] font-bold transition-all ${mv==='byAuthor'?'bg-amber-500 text-white shadow-sm':'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}" title="작성자별"><i class="ph ph-user-list"></i></button>
                    </div>
                    <button onclick="openMemoModal()" class="px-3 py-1.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm"><i class="ph-bold ph-plus mr-1"></i>새 메모</button>
                </div>
            </header>
            <div class="p-4">${body}</div>
        </section>`;
    setTimeout(applyAvatarPhotos, 0);
}

function memoListRowHtml(m) {
    const author = getUser(m.author);
    const isMine = m.author === state.currentUserId;
    const aud = m.audience || ['ALL'];
    const canEdit = isMine || (m.visibility === 'team' && (aud.includes('ALL') || aud.includes(state.currentUserId)));
    const click = canEdit ? `onclick="editMemo('${m.id}')"` : '';
    return `<div ${click} class="px-4 py-2.5 ${canEdit?'cursor-pointer hover:bg-slate-50':'cursor-default'} flex items-center gap-3 border-b border-slate-100 last:border-0">
        ${m.pinned?'<i class="ph-fill ph-push-pin text-amber-500 text-[12px] rotate-45 shrink-0"></i>':'<span class="w-3 shrink-0"></span>'}
        <span class="av av-${author.role} w-6 h-6 text-[10px] inline-flex items-center justify-center rounded-full text-white shrink-0" data-uid="${author.id}">${initial(author.name)}</span>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
                <span class="text-[12.5px] font-extrabold text-slate-900 truncate">${escapeHtml(m.title)}</span>
                ${m.visibility==='private'?'<span class="px-1 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded inline-flex items-center gap-0.5"><i class="ph ph-lock-key"></i>개인</span>':'<span class="px-1 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-bold rounded inline-flex items-center gap-0.5"><i class="ph ph-users-three"></i>공유</span>'}
            </div>
            <div class="text-[11px] text-slate-500 truncate">${escapeHtml(m.body||'').replace(/\n/g,' · ')}</div>
        </div>
        <div class="text-[10px] text-slate-400 text-right shrink-0">
            <div class="font-bold text-slate-700">${author.name}</div>
            <div>${timeAgo(m.updatedAt)}</div>
        </div>
        ${canEdit?'<i class="ph ph-pencil-simple text-slate-300 hover:text-amber-500 shrink-0"></i>':''}
    </div>`;
}

function memoCompactHtml(m) {
    const author = getUser(m.author);
    const isMine = m.author === state.currentUserId;
    const aud = m.audience || ['ALL'];
    const canEdit = isMine || (m.visibility === 'team' && (aud.includes('ALL') || aud.includes(state.currentUserId)));
    const click = canEdit ? `onclick="editMemo('${m.id}')"` : '';
    const color = MEMO_COLORS[m.color] || MEMO_COLORS.default;
    const cardCls = m.pinned ? 'memo-pin' : `${color.bg} ${color.border}`;
    return `<div ${click} class="${cardCls} border rounded-lg p-2.5 ${canEdit?'cursor-pointer hover:shadow-card-hover':'cursor-default'} transition-shadow relative">
        ${m.pinned?'<i class="ph-fill ph-push-pin absolute top-1.5 right-1.5 text-amber-500 text-[10px] rotate-45"></i>':''}
        <div class="text-[12px] font-extrabold text-slate-900 truncate ${m.pinned?'pr-4':''}">${escapeHtml(m.title)}</div>
        <div class="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5">${escapeHtml(m.body||'')}</div>
        <div class="flex items-center gap-1.5 mt-1.5 text-[9px] text-slate-400">
            <span class="av av-${author.role} w-3.5 h-3.5 text-[8px] inline-flex items-center justify-center rounded-full text-white" data-uid="${author.id}">${initial(author.name)}</span>
            ${author.name} · ${timeAgo(m.updatedAt)}
        </div>
    </div>`;
}

// ────────────────────────────────  CEO TEAM PROGRESS PANEL  ────────────────────────────────
function ceoTeamProgressHtml() {
    if (me().role !== '대표') return '';
    const team = USERS.filter(u => u.id !== state.currentUserId);
    const cards = team.map(u => {
        const myTasks = state.tasks.filter(t => t.to.includes(u.id));
        const total = myTasks.length;
        const done = myTasks.filter(t => t.status === '완료').length;
        const inProg = myTasks.filter(t => t.status === '진행중').length;
        const todo = myTasks.filter(t => t.status === '할일').length;
        const overdue = myTasks.filter(t => t.status !== '완료' && t.due < TODAY).length;
        const rate = total ? Math.round(done/total*100) : 0;
        const onL = state.onLeave[u.id];
        const recentTask = myTasks.filter(t => t.status !== '완료').sort((a,b)=>a.due.localeCompare(b.due))[0];
        const rateColor = rate>=70?'text-emerald-600':rate>=40?'text-amber-600':rate>0?'text-slate-500':'text-slate-300';
        const barColor  = rate>=70?'bg-emerald-500':rate>=40?'bg-amber-500':'bg-slate-400';
        return `<div class="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-card-hover hover:border-rose-300 transition-all">
            <button onclick="peekTeamMember('${u.id}')" class="w-full flex items-center gap-2 mb-2 text-left">
                <div class="av av-${u.role} w-9 h-9 text-[12px] inline-flex items-center justify-center rounded-full text-white font-extrabold shadow-sm relative" data-uid="${u.id}">${initial(u.name)}${onL?'<span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 border-2 border-white rounded-full"></span>':''}</div>
                <div class="flex-1 min-w-0">
                    <div class="text-[12.5px] font-extrabold text-slate-900 truncate flex items-center gap-1">${u.name}${onL?'<span class="px-1 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded">휴가</span>':''}</div>
                    <div class="text-[10px] text-slate-500 font-medium">${u.role}</div>
                </div>
                <span class="text-[16px] font-black ${rateColor} tabular-nums">${rate}<span class="text-[10px] opacity-70">%</span></span>
            </button>
            <div class="flex items-center gap-1 text-[10px] mb-2 flex-wrap">
                <button onclick="peekTeamMember('${u.id}','진행중')"  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-blue-700 font-bold hover:bg-blue-50 transition-colors"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 ${inProg?'pulse-dot':''}"></span>진행 ${inProg}</button>
                <button onclick="peekTeamMember('${u.id}','할일')"    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-slate-700 font-bold hover:bg-slate-100 transition-colors"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>할일 ${todo}</button>
                <button onclick="peekTeamMember('${u.id}','완료')"    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-emerald-700 font-bold hover:bg-emerald-50 transition-colors"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>완료 ${done}</button>
                ${overdue?`<button onclick="peekTeamMember('${u.id}','할일')" class="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 font-extrabold border border-red-200 hover:bg-red-100"><i class="ph-fill ph-warning text-[10px]"></i>${overdue} 지연</button>`:''}
            </div>
            <button onclick="peekTeamMember('${u.id}')" class="w-full block text-left">
                <div class="load-track h-1.5 mb-2"><div class="load-fill ${barColor}" style="width:${Math.max(rate,2)}%"></div></div>
                ${recentTask ? `<div class="text-[10.5px] text-slate-600 truncate flex items-center gap-1.5 pt-1.5 border-t border-slate-100"><i class="ph ph-arrow-bend-down-right text-slate-300"></i><span class="font-bold">진행 중:</span> ${escapeHtml(recentTask.title)}</div>` : '<div class="text-[10px] text-slate-400 italic pt-1.5 border-t border-slate-100">진행 중 업무 없음</div>'}
            </button>
        </div>`;
    }).join('');

    return `<section class="mb-4">
        <div class="flex items-center justify-between mb-2">
            <h2 class="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-eye text-rose-500"></i>팀 진행 현황 <span class="text-[10px] font-bold text-slate-400">${team.length}명</span></h2>
            <span class="text-[10px] text-slate-400 font-medium">팀원 카드 클릭 → 상세 보기</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${Math.min(team.length, 4)} gap-3">${cards}</div>
    </section>`;
}

// ────────────────────────────────  KANBAN  ────────────────────────────────
function renderKanban() {
    const tasks = tasksScoped();
    const groups = { '할일':[], '진행중':[], '완료':[] };
    tasks.forEach(t => groups[t.status].push(t));
    Object.values(groups).forEach(arr => arr.sort((a,b) => a.due.localeCompare(b.due)));

    const main = document.getElementById('view-main');
    const colHeaderTint = { '할일':'bg-slate-50 border-slate-200', '진행중':'bg-blue-50/70 border-blue-100', '완료':'bg-emerald-50/70 border-emerald-100' };
    main.innerHTML = `${ceoTeamProgressHtml()}<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        ${STATUSES.map(st => `
            <div class="kb-col-drop min-w-0 bg-white border border-slate-200 rounded-xl min-h-[260px] flex flex-col overflow-hidden shadow-sm" data-status="${st}" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="handleDrop(event,'${st}')">
                <header class="h-[44px] flex items-center justify-between px-3 ${colHeaderTint[st]||'bg-slate-50'} border-b">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full st-bg-${st} ${st==='진행중'?'pulse-dot':''}"></span>
                        <span class="text-[12px] font-extrabold text-slate-800">${st}</span>
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600 tabular-nums shadow-sm">${groups[st].length}</span>
                    </div>
                    ${st==='할일' && me().role!=='직원' ? `<button onclick="openTaskModal()" class="p-1 text-slate-500 hover:text-brand-600 hover:bg-white rounded transition-colors"><i class="ph-bold ph-plus text-[12px]"></i></button>`:''}
                </header>
                <div class="flex-1 p-2.5 space-y-2 bg-slate-50/30">${groups[st].map(taskCardHtml).join('') || `<div class="text-center py-8 text-[11px] text-slate-400">없음</div>`}</div>
            </div>
        `).join('')}
    </div>`;
}

function taskCardHtml(t) {
    const fromU = getUser(t.from);
    const toUsers = t.to.map(getUser);
    const due = formatDue(t.due);
    const onLeaveTo = toUsers.some(u => state.onLeave[u.id]);

    return `<article class="kb-card relative bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm" draggable="true" ondragstart="handleDragStart(event,'${t.id}')" ondragend="handleDragEnd(event)" onclick="openDetail('${t.id}')" data-task-id="${t.id}">
        <span class="absolute left-0 top-2 bottom-2 w-1 rounded-r pr-bar-${t.priority}"></span>
        <div class="pl-1.5">
            <div class="flex items-start justify-between gap-1.5 mb-1.5">
                <h4 class="text-[12.5px] font-bold text-slate-900 leading-snug ${t.status==='완료'?'line-through text-slate-400':''}">${escapeHtml(t.title)}</h4>
                ${onLeaveTo?'<span class="inline-flex items-center gap-0.5 px-1 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded border border-amber-200 shrink-0"><i class="ph-fill ph-airplane-tilt"></i></span>':''}
            </div>
            ${t.body ? `<p class="text-[11px] text-slate-500 leading-snug line-clamp-2 mb-2">${escapeHtml(t.body)}</p>`:''}
            <div class="flex items-center gap-1.5 flex-wrap">
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border ${due.cls}" title="${due.fullText||due.text}">
                    <i class="ph-fill ${due.icon} text-[11px]"></i>${due.text}
                </span>
                ${t.comments?.length ? `<span class="inline-flex items-center gap-0.5 text-[10px] text-slate-400 font-bold"><i class="ph ph-chat-circle"></i>${t.comments.length}</span>`:''}
                <div class="ml-auto flex items-center -space-x-1.5">
                    ${toUsers.slice(0,2).map(u => `<span class="av av-${u.role} w-5 h-5 text-[9px] border-[1.5px] border-white">${initial(u.name)}</span>`).join('')}
                    ${toUsers.length > 2 ? `<span class="av w-5 h-5 text-[9px] bg-slate-200 text-slate-600 border-[1.5px] border-white">+${toUsers.length-2}</span>`:''}
                </div>
            </div>
        </div>
    </article>`;
}

// Drag-drop
let _dragId = null;
function handleDragStart(e, id) { _dragId = id; e.target.closest('.kb-card').classList.add('dragging'); }
function handleDragEnd(e) { e.target.closest('.kb-card')?.classList.remove('dragging'); document.querySelectorAll('.kb-col-drop').forEach(c => c.classList.remove('drag-over')); }
function handleDrop(e, status) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const t = state.tasks.find(x => x.id === _dragId);
    if (t && t.status !== status) {
        t.status = status; saveState(); render();
        showToast(`${t.title} → ${status}`);
    }
    _dragId = null;
}

// ────────────────────────────────  LIST VIEW  ────────────────────────────────
function renderList() {
    const tasks = tasksScoped();
    tasks.sort((a,b) => {
        const so = {'진행중':0,'할일':1,'완료':2};
        if (so[a.status] !== so[b.status]) return so[a.status] - so[b.status];
        return a.due.localeCompare(b.due);
    });

    const main = document.getElementById('view-main');
    if (tasks.length === 0) {
        main.innerHTML = ceoTeamProgressHtml() + emptyStateHtml('표시할 업무가 없습니다');
        return;
    }
    main.innerHTML = `${ceoTeamProgressHtml()}
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="hidden sm:grid grid-cols-[24px_minmax(0,1fr)_120px_120px_72px_24px] gap-3 px-4 py-2 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-slate-50">
                <span></span><span>제목</span><span>담당자</span><span>마감</span><span>우선순위</span><span></span>
            </div>
            ${tasks.map(taskListRowHtml).join('')}
        </div>`;
}
function taskListRowHtml(t) {
    const fromU = getUser(t.from);
    const toUsers = t.to.map(getUser);
    const overdue = t.status !== '완료' && t.due < TODAY;
    const dueText = t.due === TODAY ? '오늘' : t.due === dateStr(1) ? '내일' : t.due;
    const dueClass = overdue ? 'text-red-600 font-bold' : (t.due === TODAY ? 'text-amber-600 font-bold' : 'text-slate-500');
    return `<div class="list-row grid grid-cols-[24px_minmax(0,1fr)_24px] sm:grid-cols-[24px_minmax(0,1fr)_120px_120px_72px_24px] gap-3 px-4 py-2.5 cursor-pointer items-center text-[12.5px]" onclick="openDetail('${t.id}')">
        <button onclick="openStatusPicker('${t.id}', event)" title="상태 변경" class="w-4 h-4 rounded-full border-2 ${t.status==='완료'?'bg-emerald-500 border-emerald-500':t.status==='진행중'?'border-blue-500 bg-blue-50':'border-slate-300 hover:border-brand-500'} flex items-center justify-center">${t.status==='완료'?'<i class="ph-bold ph-check text-white text-[8px]"></i>':t.status==='진행중'?'<span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>':''}</button>
        <div class="min-w-0">
            <div class="flex items-center gap-1.5">
                <span class="w-1 h-3.5 rounded pr-bar-${t.priority}"></span>
                <span class="font-bold text-slate-900 truncate ${t.status==='완료'?'line-through text-slate-400':''}">${escapeHtml(t.title)}</span>
                ${t.comments?.length?`<span class="text-slate-400 text-[10px] inline-flex items-center gap-0.5"><i class="ph ph-chat-circle"></i>${t.comments.length}</span>`:''}
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5 sm:hidden">${fromU.name} → ${toUsers.map(u=>u.name).join(', ')} · <span class="${dueClass}">${dueText}</span></div>
        </div>
        <div class="hidden sm:flex items-center -space-x-1.5">
            ${toUsers.slice(0,3).map(u => `<span class="av av-${u.role} w-5 h-5 text-[9px] border-[1.5px] border-white">${initial(u.name)}</span>`).join('')}
            ${toUsers.length>3?`<span class="av bg-slate-200 text-slate-700 w-5 h-5 text-[9px] border-[1.5px] border-white">+${toUsers.length-3}</span>`:''}
        </div>
        <div class="hidden sm:block text-[11px] ${dueClass}">${dueText}</div>
        <div class="hidden sm:block"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold border pr-pill-${t.priority}">${t.priority==='high'?'높음':t.priority==='normal'?'보통':'낮음'}</span></div>
        <i class="ph ph-arrow-right text-slate-400"></i>
    </div>`;
}

// ────────────────────────────────  DUE DATE VIEW  ────────────────────────────────
function renderDueDate() {
    const tasks = tasksScoped().filter(t => t.status !== '완료');
    const completed = tasksScoped().filter(t => t.status === '완료');

    const buckets = {
        overdue:  { label:'지연',     icon:'ph-warning',         color:'text-red-700 bg-red-50 border-red-200',         items:[] },
        today:    { label:'오늘',     icon:'ph-clock-clockwise', color:'text-amber-700 bg-amber-50 border-amber-200',   items:[] },
        tomorrow: { label:'내일',     icon:'ph-clock',           color:'text-blue-700 bg-blue-50 border-blue-200',      items:[] },
        thisweek: { label:'이번 주',  icon:'ph-calendar-blank',  color:'text-slate-700 bg-slate-100 border-slate-200',  items:[] },
        nextweek: { label:'다음 주',  icon:'ph-calendar-blank',  color:'text-slate-700 bg-slate-100 border-slate-200',  items:[] },
        later:    { label:'이후',     icon:'ph-calendar-plus',   color:'text-slate-600 bg-slate-50 border-slate-200',   items:[] },
    };

    const todayD = new Date(TODAY);
    const tomorrow = dateStr(1);
    const dayOfWeek = todayD.getDay();
    const endOfWeek = new Date(todayD); endOfWeek.setDate(todayD.getDate() + (7 - dayOfWeek));
    const endOfNextWeek = new Date(endOfWeek); endOfNextWeek.setDate(endOfWeek.getDate() + 7);
    const eowStr = endOfWeek.toISOString().slice(0,10);
    const eonwStr = endOfNextWeek.toISOString().slice(0,10);

    tasks.forEach(t => {
        if (t.due < TODAY) buckets.overdue.items.push(t);
        else if (t.due === TODAY) buckets.today.items.push(t);
        else if (t.due === tomorrow) buckets.tomorrow.items.push(t);
        else if (t.due <= eowStr) buckets.thisweek.items.push(t);
        else if (t.due <= eonwStr) buckets.nextweek.items.push(t);
        else buckets.later.items.push(t);
    });

    Object.values(buckets).forEach(b => b.items.sort((a,b) => a.due.localeCompare(b.due) || (b.priority==='high'?1:0) - (a.priority==='high'?1:0)));

    const main = document.getElementById('view-main');
    main.innerHTML = `${ceoTeamProgressHtml()}<div class="space-y-3">
        ${Object.entries(buckets).map(([k, b]) => b.items.length === 0 ? '' : `
            <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <header class="px-4 py-2.5 flex items-center justify-between border-b border-slate-100 ${b.color.split(' ')[1]}">
                    <h3 class="text-[12.5px] font-extrabold flex items-center gap-2 ${b.color.split(' ')[0]}">
                        <i class="ph-fill ${b.icon}"></i>${b.label}
                        <span class="text-[10px] font-bold opacity-70 tabular-nums">${b.items.length}건</span>
                    </h3>
                    ${k === 'today' || k === 'overdue' ? `<span class="text-[10px] font-bold ${b.color.split(' ')[0]}">⚠ 우선 처리</span>` : ''}
                </header>
                <div class="divide-y divide-slate-100">
                    ${b.items.map(taskDateRowHtml).join('')}
                </div>
            </section>`).join('')}
        ${completed.length ? `
            <details class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <summary class="px-4 py-2.5 cursor-pointer flex items-center justify-between hover:bg-slate-50 list-none">
                    <h3 class="text-[12.5px] font-extrabold text-emerald-700 flex items-center gap-2">
                        <i class="ph-fill ph-check-circle"></i>완료
                        <span class="text-[10px] font-bold opacity-70 tabular-nums">${completed.length}건</span>
                    </h3>
                    <i class="ph ph-caret-down text-slate-400"></i>
                </summary>
                <div class="divide-y divide-slate-100">${completed.sort((a,b) => b.due.localeCompare(a.due)).map(taskDateRowHtml).join('')}</div>
            </details>` : ''}
        ${tasks.length === 0 && completed.length === 0 ? `<div class="bg-white rounded-xl border border-dashed border-slate-200 py-16 text-center"><i class="ph ph-confetti text-5xl text-slate-300 block mb-3"></i><div class="text-[13px] font-bold text-slate-600">표시할 업무가 없습니다</div></div>` : ''}
    </div>`;
}

function taskDateRowHtml(t) {
    const fromU = getUser(t.from);
    const toUsers = t.to.map(getUser);
    const overdue = t.status !== '완료' && t.due < TODAY;
    const dueText = t.due === TODAY ? '오늘' : t.due === dateStr(1) ? '내일' : t.due === dateStr(-1) ? '어제' : t.due;
    const wk = ['일','월','화','수','목','금','토'][new Date(t.due).getDay()];
    return `<div class="list-row px-4 py-2.5 cursor-pointer flex items-center gap-3 text-[12.5px]" onclick="openDetail('${t.id}')">
        <button onclick="openStatusPicker('${t.id}', event)" title="상태 변경" class="w-4 h-4 rounded-full border-2 ${t.status==='완료'?'bg-emerald-500 border-emerald-500':t.status==='진행중'?'border-blue-500 bg-blue-50':'border-slate-300 hover:border-brand-500'} flex items-center justify-center shrink-0">${t.status==='완료'?'<i class="ph-bold ph-check text-white text-[8px]"></i>':t.status==='진행중'?'<span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>':''}</button>
        <div class="hidden sm:flex flex-col items-center w-12 shrink-0 tabular-nums">
            <span class="text-[10px] font-bold ${overdue?'text-red-600':'text-slate-400'}">${dueText}</span>
            <span class="text-[9px] text-slate-400">${wk}요일</span>
        </div>
        <span class="w-1 h-3.5 rounded pr-bar-${t.priority} shrink-0"></span>
        <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 truncate ${t.status==='완료'?'line-through text-slate-400':''}">${escapeHtml(t.title)}</div>
            <div class="text-[10px] text-slate-500 mt-0.5">${fromU.name} → ${toUsers.map(u=>u.name).join(', ')}${t.comments?.length?` · 💬 ${t.comments.length}`:''}</div>
        </div>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold st-${t.status} hidden sm:inline-block">${t.status}</span>
        <div class="hidden sm:flex items-center -space-x-1.5">
            ${toUsers.slice(0,2).map(u => `<span class="av av-${u.role} w-5 h-5 text-[9px] border-[1.5px] border-white">${initial(u.name)}</span>`).join('')}
        </div>
    </div>`;
}

// ────────────────────────────────  MEMO VIEW  ────────────────────────────────
function renderMemoView() {
    const main = document.getElementById('view-main');
    let memos = visibleMemos();
    memos.sort((a,b) => {
        if ((a.pinned?1:0) !== (b.pinned?1:0)) return (b.pinned?1:0) - (a.pinned?1:0);
        return b.updatedAt - a.updatedAt;
    });
    main.innerHTML = `<div class="flex items-center justify-between mb-3">
        <h2 class="text-[16px] font-extrabold text-slate-900 flex items-center gap-2"><i class="ph-fill ph-note text-amber-500"></i>메모 <span class="text-[12px] font-bold text-slate-400">${memos.length}</span></h2>
        <button onclick="openMemoModal()" class="px-3 py-1.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm"><i class="ph-bold ph-plus mr-1"></i>새 메모</button>
    </div>
    ${memos.length === 0 ? emptyStateHtml('메모가 없습니다') :
        `<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">${memos.map(memoCardHtml).join('')}</div>`}`;
}
function memoCardHtml(m) {
    const author = getUser(m.author);
    const onL = state.onLeave[m.author];
    const isMine = m.author === state.currentUserId;
    const isShared = m.visibility === 'team';
    const aud = m.audience || ['ALL'];
    const canEdit = isMine || (isShared && (aud.includes('ALL') || aud.includes(state.currentUserId)));
    const click = canEdit ? `onclick="editMemo('${m.id}')"` : '';
    const cur = canEdit ? 'cursor-pointer' : 'cursor-default';
    const color = MEMO_COLORS[m.color] || MEMO_COLORS.default;
    const cardCls = m.pinned ? 'memo-pin' : `${color.bg} ${color.border}`;
    return `<div ${click} class="relative ${cardCls} ${cur} border rounded-xl p-4 hover:shadow-card-hover transition-shadow group">
        ${m.pinned?'<i class="ph-fill ph-push-pin absolute top-3 right-3 text-amber-500 text-base rotate-45"></i>':''}
        <h4 class="text-[14px] font-extrabold text-slate-900 leading-tight ${m.pinned?'pr-6':''}">${escapeHtml(m.title)}</h4>
        <p class="text-[12px] text-slate-700 leading-relaxed mt-2 whitespace-pre-line line-clamp-5">${escapeHtml(m.body||'')}</p>
        <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span class="flex items-center gap-1.5 text-slate-500">
                <span class="av av-${author.role} w-4 h-4 text-[8px] inline-flex items-center justify-center rounded-full" data-uid="${author.id}">${initial(author.name)}</span>
                ${author.name}${onL?' <i class="ph-fill ph-airplane-tilt text-amber-500"></i>':''}
                <span class="text-slate-300">·</span>
                ${timeAgo(m.updatedAt)}
                ${m.visibility==='private'?'<span class="ml-1 inline-flex items-center gap-0.5 px-1 py-0.5 bg-slate-100 text-slate-500 rounded font-bold"><i class="ph ph-lock-key"></i>개인</span>':'<span class="ml-1 inline-flex items-center gap-0.5 px-1 py-0.5 bg-purple-50 text-purple-600 rounded font-bold"><i class="ph ph-users-three"></i>공유</span>'}
            </span>
            ${canEdit?`<div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="event.stopPropagation();togglePin('${m.id}')" class="p-1 hover:bg-slate-100 rounded text-slate-500"><i class="ph${m.pinned?'-fill':''} ph-push-pin text-[12px]"></i></button>
                ${isMine?`<button onclick="event.stopPropagation();deleteMemo('${m.id}')" class="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-500"><i class="ph ph-trash text-[12px]"></i></button>`:'<span class="px-1.5 py-0.5 text-[9px] font-bold text-purple-700 bg-purple-50 rounded border border-purple-200" title="공유 메모 — 편집 가능"><i class="ph ph-pencil-simple"></i> 수정</span>'}
            </div>`:''}
        </div>
    </div>`;
}

// ────────────────────────────────  TEAM VIEW (members + projects)  ────────────────────────────────
const PROJECT_TYPE_CFG = {
    '세일즈': { bg:'bg-rose-50',    badge:'bg-rose-100 text-rose-700 border-rose-200',       icon:'ph-trending-up',   accent:'#e11d48' },
    '이벤트': { bg:'bg-violet-50',  badge:'bg-violet-100 text-violet-700 border-violet-200',  icon:'ph-confetti',      accent:'#8b5cf6' },
    '운영':   { bg:'bg-blue-50',    badge:'bg-blue-100 text-blue-700 border-blue-200',        icon:'ph-gear',          accent:'#2563eb' },
    '교육':   { bg:'bg-emerald-50', badge:'bg-emerald-100 text-emerald-700 border-emerald-200', icon:'ph-graduation-cap', accent:'#059669' },
    '기타':   { bg:'bg-slate-50',   badge:'bg-slate-100 text-slate-700 border-slate-200',     icon:'ph-folder',        accent:'#64748b' },
};
const PROJECT_STATUS_CFG = {
    '계획':   { dot:'bg-slate-400', pill:'bg-slate-100 text-slate-700' },
    '진행중': { dot:'bg-blue-500',  pill:'bg-blue-100 text-blue-700' },
    '완료':   { dot:'bg-emerald-500', pill:'bg-emerald-100 text-emerald-700' },
    '보류':   { dot:'bg-orange-400', pill:'bg-orange-100 text-orange-700' },
};

function renderTeamView() {
    const main = document.getElementById('view-main');
    let myProjects = (state.projects||[]).filter(p => state.projectFilter === 'all' ? true : state.projectFilter === 'mine' ? p.members.includes(state.currentUserId) : p.status !== '완료');
    // Apply time range — project's dueDate within range OR project still active overlapping range
    if (state.timeRange && state.timeRange !== 'all') {
        const r = getTimeRange();
        myProjects = myProjects.filter(p => {
            const start = p.startDate || '0000-00-00';
            const end = p.dueDate || '9999-12-31';
            // Show if project overlaps the range
            return !(end < r.start || start > r.end);
        });
    }
    myProjects.sort((a,b) => {
        const so = { '진행중':0, '계획':1, '보류':2, '완료':3 };
        if (so[a.status] !== so[b.status]) return so[a.status] - so[b.status];
        return a.dueDate.localeCompare(b.dueDate);
    });

    main.innerHTML = `
        <!-- Team members compact -->
        <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <header class="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-50/40 to-white">
                <h2 class="text-[14px] font-extrabold text-slate-900 flex items-center gap-2"><i class="ph-fill ph-users-three text-brand-500"></i>팀원 현황 <span class="text-[10px] font-bold text-slate-400">${USERS.length}명</span></h2>
            </header>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-slate-100">
                ${USERS.map(memberMiniHtml).join('')}
            </div>
        </section>

        <!-- Team projects -->
        <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
            <header class="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap bg-gradient-to-r from-rose-50/30 to-white">
                <h2 class="text-[14px] font-extrabold text-slate-900 flex items-center gap-2"><i class="ph-fill ph-rocket-launch text-rose-500"></i>팀 프로젝트 <span class="text-[10px] font-bold text-slate-400">${myProjects.length}건</span></h2>
                <div class="flex items-center gap-2 flex-wrap">
                    <div class="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                        <button onclick="state.projectFilter='active';render()" class="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${state.projectFilter==='active'?'bg-white text-rose-700 shadow-sm':'text-slate-500 hover:text-slate-700'}">진행 중</button>
                        <button onclick="state.projectFilter='mine';render()" class="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${state.projectFilter==='mine'?'bg-white text-rose-700 shadow-sm':'text-slate-500 hover:text-slate-700'}">내 참여</button>
                        <button onclick="state.projectFilter='all';render()" class="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${state.projectFilter==='all'?'bg-white text-rose-700 shadow-sm':'text-slate-500 hover:text-slate-700'}">전체</button>
                    </div>
                    ${timeRangeSelectHtml()}
                    ${me().role!=='직원' ? `<button onclick="openProjectModal()" class="px-3 py-1.5 text-[11px] font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm"><i class="ph-bold ph-plus mr-1"></i>새 프로젝트</button>` : ''}
                </div>
            </header>
            <div class="p-4">
                ${myProjects.length === 0 ? '<div class="text-center py-12 text-[12px] text-slate-400"><i class="ph ph-rocket-launch text-3xl block mb-2 opacity-50"></i>진행 중인 프로젝트가 없습니다</div>' :
                    `<div class="grid grid-cols-1 lg:grid-cols-2 gap-3">${myProjects.map(projectCardHtml).join('')}</div>`}
            </div>
        </section>`;
}

function memberMiniHtml(u) {
    const onL = state.onLeave[u.id];
    const inProg = state.tasks.filter(t => t.to.includes(u.id) && t.status === '진행중').length;
    const open   = state.tasks.filter(t => t.to.includes(u.id) && t.status !== '완료').length;
    const isMe = u.id === state.currentUserId;
    return `<button onclick="peekTeamMember('${u.id}')" class="px-4 py-3 hover:bg-slate-50 transition-colors text-left ${isMe?'bg-brand-50/40':''}">
        <div class="flex items-center gap-2">
            <div class="av av-${u.role} w-9 h-9 text-[13px] relative shadow-sm">${initial(u.name)}${onL?'<span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 border-2 border-white rounded-full"></span>':''}</div>
            <div class="flex-1 min-w-0">
                <div class="text-[12.5px] font-extrabold text-slate-900 truncate flex items-center gap-1">${u.name}${isMe?'<span class="text-[9px] font-bold text-brand-600 ml-0.5">나</span>':''}</div>
                <div class="text-[10px] text-slate-500 font-medium">${u.role}${onL?' · 휴가':''}</div>
            </div>
        </div>
        <div class="mt-2 flex items-center gap-1.5 text-[10px] font-bold">
            <span class="px-1.5 py-0.5 rounded ${inProg?'bg-blue-100 text-blue-700':'bg-slate-100 text-slate-500'}">진행 ${inProg}</span>
            <span class="px-1.5 py-0.5 rounded ${open?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-500'}">미완 ${open}</span>
        </div>
    </button>`;
}

function projectCardHtml(p) {
    const cfg = PROJECT_TYPE_CFG[p.type] || PROJECT_TYPE_CFG['기타'];
    const stCfg = PROJECT_STATUS_CFG[p.status] || PROJECT_STATUS_CFG['계획'];
    const leader = getUser(p.leader);
    const members = (p.members||[]).map(getUser);
    const overdue = p.status !== '완료' && p.dueDate < TODAY;
    const daysLeft = Math.round((new Date(p.dueDate) - new Date(TODAY)) / 86400000);
    const milestonesDone = (p.milestones||[]).filter(m => m.done).length;
    const milestonesTotal = (p.milestones||[]).length;
    const progressColor = p.progress >= 80 ? 'bg-emerald-500' : p.progress >= 50 ? 'bg-blue-500' : p.progress >= 30 ? 'bg-amber-500' : 'bg-slate-400';

    return `<article class="relative ${cfg.bg} border border-slate-200 rounded-xl p-4 hover:shadow-card-hover transition-all cursor-pointer group" onclick="openProjectDetail('${p.id}')" style="border-left:4px solid ${cfg.accent};">
        <header class="flex items-start justify-between gap-2 mb-2">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${cfg.badge}"><i class="ph-fill ${cfg.icon}"></i>${p.type}</span>
                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold ${stCfg.pill}"><span class="w-1 h-1 rounded-full ${stCfg.dot}"></span>${p.status}</span>
                    ${overdue?'<span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-100 text-red-700">지연</span>':''}
                </div>
                <h3 class="text-[14.5px] font-black text-slate-900 leading-tight">${escapeHtml(p.title)}</h3>
            </div>
        </header>
        <p class="text-[11.5px] text-slate-600 leading-snug line-clamp-2 mb-3">${escapeHtml(p.description||'')}</p>

        <!-- Progress -->
        <div class="mb-3">
            <div class="flex items-center justify-between text-[10px] font-bold mb-1">
                <span class="text-slate-500">진행률</span>
                <span class="text-slate-800 tabular-nums">${p.progress}%</span>
            </div>
            <div class="load-track"><div class="load-fill ${progressColor}" style="width:${p.progress}%"></div></div>
        </div>

        <!-- Metrics -->
        ${(p.metrics||[]).length ? `<div class="space-y-1.5 mb-3">
            ${p.metrics.slice(0,3).map(m => {
                const pct = Math.min(100, Math.round((m.current / Math.max(m.target,1)) * 100));
                const mc = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500';
                return `<div>
                    <div class="flex items-center justify-between text-[10px] mb-0.5">
                        <span class="text-slate-600 font-medium">${escapeHtml(m.label)}</span>
                        <span class="text-slate-800 font-bold tabular-nums">${m.current}<span class="text-slate-400 font-medium">/${m.target}${m.unit||''}</span></span>
                    </div>
                    <div class="load-track h-[3px]"><div class="load-fill ${mc}" style="width:${pct}%"></div></div>
                </div>`;
            }).join('')}
        </div>` : ''}

        <!-- Footer: members + due + milestones -->
        <footer class="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
            <div class="flex items-center -space-x-1.5">
                ${members.slice(0,5).map(u => `<span class="av av-${u.role} w-6 h-6 text-[10px] border-2 border-white" title="${u.name}">${initial(u.name)}</span>`).join('')}
                ${members.length > 5 ? `<span class="av w-6 h-6 text-[9px] bg-slate-200 text-slate-700 border-2 border-white">+${members.length-5}</span>` : ''}
            </div>
            <div class="flex items-center gap-2 text-[10px] font-bold">
                ${milestonesTotal ? `<span class="text-slate-500"><i class="ph ph-flag-checkered"></i> ${milestonesDone}/${milestonesTotal}</span>` : ''}
                <span class="${overdue?'text-red-600':daysLeft<=7?'text-amber-600':'text-slate-500'}">
                    <i class="ph ph-calendar-dots"></i>
                    ${overdue?`${Math.abs(daysLeft)}일 지연`:daysLeft===0?'오늘 마감':`D-${daysLeft}`}
                </span>
            </div>
        </footer>
    </article>`;
}

function openProjectDetail(id) {
    const p = (state.projects||[]).find(x => x.id === id);
    if (!p) return;
    const cfg = PROJECT_TYPE_CFG[p.type] || PROJECT_TYPE_CFG['기타'];
    const stCfg = PROJECT_STATUS_CFG[p.status] || PROJECT_STATUS_CFG['계획'];
    const leader = getUser(p.leader);
    const members = (p.members||[]).map(getUser);
    const isOwner = p.leader === state.currentUserId || me().role === '대표';

    document.getElementById('detail-bc').innerHTML = `<i class="ph ${cfg.icon}"></i><span class="font-bold text-slate-700">팀 프로젝트</span>`;
    document.getElementById('detail-delete').onclick = () => { if (!isOwner) return showToast('권한 없음'); if (confirm('프로젝트를 삭제하시겠습니까?')) { state.projects = state.projects.filter(x => x.id !== p.id); saveState(); closeDetail(); render(); } };

    const body = document.getElementById('detail-body');
    body.innerHTML = `
        <div>
            <div class="flex items-center gap-1.5 mb-2 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold border ${cfg.badge}"><i class="ph-fill ${cfg.icon}"></i>${p.type}</span>
                <button onclick="cycleProjectStatus('${p.id}');openProjectDetail('${p.id}')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold ${stCfg.pill} hover:brightness-95"><span class="w-1 h-1 rounded-full ${stCfg.dot}"></span>${p.status}</button>
            </div>
            <h2 class="text-[22px] font-black text-slate-900 leading-tight">${escapeHtml(p.title)}</h2>
            <p class="text-[12px] text-slate-600 leading-relaxed mt-2 whitespace-pre-line">${escapeHtml(p.description||'')}</p>
        </div>

        <!-- Progress -->
        <div class="bg-slate-50 rounded-lg p-3">
            <div class="flex items-center justify-between text-[11px] font-bold mb-1.5">
                <span class="text-slate-500">전체 진행률</span>
                <span class="text-slate-900 text-[16px] tabular-nums">${p.progress}%</span>
            </div>
            <div class="load-track h-2"><div class="load-fill bg-gradient-to-r from-brand-500 to-rose-400" style="width:${p.progress}%"></div></div>
            ${isOwner?`<input type="range" min="0" max="100" value="${p.progress}" oninput="updateProjectProgress('${p.id}',this.value)" class="w-full mt-2 accent-rose-500">`:''}
        </div>

        <!-- Members -->
        <div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="ph ph-users"></i>팀 ${members.length}명 <span class="text-slate-400">· 리더 ${leader.name}</span></div>
            <div class="flex flex-wrap gap-1.5">${members.map(u => `<span class="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md"><span class="av av-${u.role} w-4 h-4 text-[8px]">${initial(u.name)}</span><span class="text-[11px] font-bold text-slate-900">${u.name}</span>${u.id===p.leader?'<i class="ph-fill ph-crown text-amber-500 text-[10px]"></i>':''}${state.onLeave[u.id]?'<i class="ph-fill ph-airplane-tilt text-amber-500 text-[10px]"></i>':''}</span>`).join('')}</div>
        </div>

        <!-- Metrics -->
        ${(p.metrics||[]).length ? `<div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="ph ph-chart-line-up"></i>핵심 지표</div>
            <div class="space-y-2.5">${p.metrics.map(m => {
                const pct = Math.min(100, Math.round((m.current / Math.max(m.target,1)) * 100));
                const mc = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500';
                return `<div class="bg-white border border-slate-100 rounded-lg p-2.5">
                    <div class="flex items-center justify-between text-[11px] mb-1">
                        <span class="text-slate-700 font-bold">${escapeHtml(m.label)}</span>
                        <span class="text-slate-900 font-extrabold tabular-nums">${m.current}<span class="text-slate-400 font-medium">/${m.target}${m.unit||''}</span><span class="ml-1 text-[10px] ${pct>=80?'text-emerald-600':pct>=50?'text-blue-600':'text-amber-600'}">(${pct}%)</span></span>
                    </div>
                    <div class="load-track h-1.5"><div class="load-fill ${mc}" style="width:${pct}%"></div></div>
                </div>`;
            }).join('')}</div>
        </div>` : ''}

        <!-- Milestones -->
        <div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center justify-between">
                <span class="flex items-center gap-1.5"><i class="ph ph-flag-checkered"></i>마일스톤 <span class="text-slate-400">${(p.milestones||[]).filter(m=>m.done).length}/${(p.milestones||[]).length}</span></span>
                ${isOwner?`<button onclick="addMilestone('${p.id}')" class="normal-case tracking-normal text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded transition-colors"><i class="ph-bold ph-plus"></i> 추가</button>`:''}
            </div>
            ${(p.milestones||[]).length ? `<div class="space-y-1.5">${p.milestones.map(m => {
                const cmtCount = (m.comments||[]).length;
                return `<div class="group flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-md">
                    <button onclick="toggleMilestone('${p.id}','${m.id}')" class="w-4 h-4 rounded-full border-2 ${m.done?'bg-emerald-500 border-emerald-500':'border-slate-300 hover:border-emerald-400'} flex items-center justify-center shrink-0 transition-colors">${m.done?'<i class="ph-bold ph-check text-white text-[9px]"></i>':''}</button>
                    <button onclick="editMilestone('${p.id}','${m.id}')" class="flex-1 text-left text-[12px] ${m.done?'line-through text-slate-400':'text-slate-700 font-medium'} hover:text-emerald-700">${escapeHtml(m.title)}</button>
                    ${cmtCount ? `<button onclick="editMilestone('${p.id}','${m.id}')" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors"><i class="ph ph-chat-circle"></i>${cmtCount}</button>` : ''}
                    <span class="text-[10px] ${m.dueDate<TODAY&&!m.done?'text-red-600 font-bold':'text-slate-400'}">${m.dueDate}</span>
                    ${isOwner?`<div class="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        <button onclick="editMilestone('${p.id}','${m.id}')" class="p-0.5 hover:bg-slate-200 rounded text-slate-500" title="편집·코멘트"><i class="ph ph-pencil-simple text-[11px]"></i></button>
                        <button onclick="deleteMilestone('${p.id}','${m.id}')" class="p-0.5 hover:bg-red-50 hover:text-red-600 rounded text-slate-500" title="삭제"><i class="ph ph-trash text-[11px]"></i></button>
                    </div>`:''}
                </div>`;
            }).join('')}</div>` : `<div class="text-center py-4 text-[11px] text-slate-400 italic">${isOwner?'마일스톤을 추가하세요':'마일스톤이 없습니다'}</div>`}
        </div>

        <!-- Dates -->
        <dl class="space-y-1 text-[11.5px] border-t border-slate-100 pt-3">
            <div class="flex gap-3"><dt class="w-16 text-slate-500 font-bold">시작일</dt><dd class="text-slate-700">${p.startDate}</dd></div>
            <div class="flex gap-3"><dt class="w-16 text-slate-500 font-bold">마감일</dt><dd class="text-slate-700">${p.dueDate}</dd></div>
        </dl>

        <!-- Comments -->
        <div class="border-t border-slate-100 pt-4">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="ph ph-chat-circle"></i>코멘트 <span class="text-slate-400">${(p.comments||[]).length}</span></div>
            <div class="space-y-3">${(p.comments||[]).length === 0 ? '<div class="text-[11px] text-slate-400 italic py-2">코멘트가 없습니다.</div>' : (p.comments||[]).slice().reverse().map(c => {
                const a = getUser(c.author);
                return `<div class="flex gap-2.5">
                    <div class="av av-${a.role} w-7 h-7 text-[11px] inline-flex items-center justify-center rounded-full text-white font-bold" data-uid="${a.id}">${initial(a.name)}</div>
                    <div class="flex-1">
                        <div class="text-[11px]"><span class="font-bold text-slate-900">${a.name}</span> <span class="text-slate-400 ml-1">${timeAgo(c.time)}</span></div>
                        <div class="text-[12px] text-slate-700 mt-0.5 whitespace-pre-line">${escapeHtml(c.text)}</div>
                    </div>
                </div>`;
            }).join('')}</div>
        </div>`;

    document.getElementById('detail-overlay').classList.remove('hidden');
    const dr = document.getElementById('detail-drawer');
    dr.classList.remove('hidden');
    setTimeout(() => { dr.classList.remove('translate-x-full'); applyAvatarPhotos(); }, 10);

    // Wire project comment input
    const ci = document.getElementById('detail-comment');
    ci.value = '';
    ci.placeholder = '프로젝트 코멘트 추가… (Enter)';
    const sendProjComment = () => {
        const v = ci.value.trim(); if (!v) return;
        p.comments = p.comments || [];
        p.comments.push({ author: state.currentUserId, time: Date.now(), text: v });
        saveState(); ci.value = '';
        openProjectDetail(p.id);
    };
    document.getElementById('detail-comment-send').onclick = sendProjComment;
    ci.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendProjComment(); } };
}

function cycleProjectStatus(id) {
    const p = state.projects.find(x => x.id === id); if (!p) return;
    const flow = ['계획','진행중','완료','보류'];
    p.status = flow[(flow.indexOf(p.status) + 1) % flow.length];
    saveState(); render();
}
function updateProjectProgress(id, val) {
    const p = state.projects.find(x => x.id === id); if (!p) return;
    p.progress = parseInt(val);
    saveState();
    const pctSpan = document.querySelector('#detail-body .text-[16px].tabular-nums');
    if (pctSpan) pctSpan.textContent = p.progress + '%';
    const bar = document.querySelector('#detail-body .load-fill.bg-gradient-to-r');
    if (bar) bar.style.width = p.progress + '%';
}
function toggleMilestone(pid, mid) {
    const p = state.projects.find(x => x.id === pid); if (!p) return;
    const m = (p.milestones||[]).find(x => x.id === mid); if (!m) return;
    m.done = !m.done;
    const total = p.milestones.length;
    const done = p.milestones.filter(x => x.done).length;
    if (total > 0) p.progress = Math.round(done / total * 100);
    saveState(); openProjectDetail(pid); render();
}
let _msEdit = { pid:null, mid:null };
function addMilestone(pid) {
    _msEdit = { pid, mid:null };
    document.getElementById('ms-modal-title').textContent = '마일스톤 추가';
    document.getElementById('ms-save-label').textContent = '추가';
    document.getElementById('ms-add-mode').classList.remove('hidden');
    document.getElementById('ms-edit-mode').classList.add('hidden');
    document.getElementById('ms-rows').innerHTML = '';
    addMilestoneRow();
    addMilestoneRow();
    document.getElementById('ms-modal-overlay').classList.remove('hidden');
    document.getElementById('ms-modal').classList.remove('hidden');
    setTimeout(() => document.querySelector('#ms-rows input.ms-row-title')?.focus(), 50);
}
function addMilestoneRow(prefilledTitle, prefilledDue) {
    const wrap = document.getElementById('ms-rows');
    const idx = wrap.children.length;
    const div = document.createElement('div');
    div.className = 'ms-row flex items-center gap-2 group';
    const defaultDue = prefilledDue || dateStr(7 + idx*7);
    div.innerHTML = `
        <span class="text-[10px] font-bold text-slate-400 w-5 text-right tabular-nums">${idx+1}.</span>
        <input class="ms-row-title flex-1 px-2.5 py-1.5 text-[12.5px] font-bold text-slate-900 placeholder-slate-300 focus:outline-none bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg transition-all" placeholder="마일스톤 제목" value="${prefilledTitle?escapeHtml(prefilledTitle):''}" onkeydown="msRowKeyDown(event, this)">
        <input class="ms-row-due dp-trigger w-[120px] px-2 py-1.5 text-[11px] font-bold border border-slate-200 rounded-lg cursor-pointer focus:outline-none focus:border-emerald-500 bg-white" type="text" readonly value="${defaultDue}" onclick="openDatePicker(this, event)">
        <button onclick="this.parentElement.remove();renumberRows()" class="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-50 group-hover:opacity-100 transition-opacity"><i class="ph ph-minus-circle"></i></button>
    `;
    wrap.appendChild(div);
    setTimeout(() => div.querySelector('.ms-row-title').focus(), 30);
}
function renumberRows() {
    document.querySelectorAll('#ms-rows .ms-row').forEach((row, i) => {
        const num = row.querySelector('span'); if (num) num.textContent = (i+1)+'.';
    });
}
function msRowKeyDown(e, input) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const rows = Array.from(document.querySelectorAll('#ms-rows .ms-row'));
        const i = rows.findIndex(r => r.contains(input));
        if (i === rows.length - 1) addMilestoneRow();
        else rows[i+1].querySelector('.ms-row-title').focus();
    }
}

function editMilestone(pid, mid) {
    const p = state.projects.find(x => x.id === pid); if (!p) return;
    const m = (p.milestones||[]).find(x => x.id === mid); if (!m) return;
    _msEdit = { pid, mid };
    document.getElementById('ms-modal-title').textContent = '마일스톤 편집';
    document.getElementById('ms-save-label').textContent = '저장';
    document.getElementById('ms-add-mode').classList.add('hidden');
    document.getElementById('ms-edit-mode').classList.remove('hidden');
    document.getElementById('ms-title').value = m.title;
    document.getElementById('ms-due').value = m.dueDate;
    document.getElementById('ms-done').checked = !!m.done;
    renderMilestoneComments();
    document.getElementById('ms-modal-overlay').classList.remove('hidden');
    document.getElementById('ms-modal').classList.remove('hidden');
    document.getElementById('ms-comment-input').value = '';
    document.getElementById('ms-comment-input').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addMilestoneComment(); } };
    setTimeout(() => document.getElementById('ms-title').focus(), 50);
    applyAvatarPhotos();
}
function renderMilestoneComments() {
    const { pid, mid } = _msEdit;
    if (!pid || !mid) return;
    const p = state.projects.find(x => x.id === pid); if (!p) return;
    const m = (p.milestones||[]).find(x => x.id === mid); if (!m) return;
    const comments = (m.comments || []).slice().sort((a,b) => b.time - a.time);
    document.getElementById('ms-comment-count').textContent = comments.length;
    const list = document.getElementById('ms-comments');
    if (comments.length === 0) {
        list.innerHTML = '<div class="text-[11px] text-slate-400 italic py-1">아직 코멘트가 없습니다</div>';
    } else {
        list.innerHTML = comments.map(c => {
            const a = getUser(c.author);
            return `<div class="flex gap-2">
                <span class="av av-${a.role} w-6 h-6 text-[10px] inline-flex items-center justify-center rounded-full text-white shrink-0" data-uid="${a.id}">${initial(a.name)}</span>
                <div class="flex-1 min-w-0 bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div class="text-[10px] flex items-center gap-1.5">
                        <span class="font-bold text-slate-800">${a.name}</span>
                        <span class="text-slate-400">${timeAgo(c.time)}</span>
                        ${c.author === state.currentUserId ? `<button onclick="deleteMilestoneComment(${c.time})" class="ml-auto text-slate-300 hover:text-red-500"><i class="ph ph-trash text-[10px]"></i></button>` : ''}
                    </div>
                    <div class="text-[12px] text-slate-700 mt-0.5 whitespace-pre-line">${escapeHtml(c.text)}</div>
                </div>
            </div>`;
        }).join('');
    }
    setTimeout(applyAvatarPhotos, 0);
}
function addMilestoneComment() {
    const { pid, mid } = _msEdit;
    if (!pid || !mid) return;
    const inp = document.getElementById('ms-comment-input');
    const v = inp.value.trim(); if (!v) return;
    const p = state.projects.find(x => x.id === pid);
    const m = (p?.milestones||[]).find(x => x.id === mid);
    if (!m) return;
    m.comments = m.comments || [];
    m.comments.push({ author: state.currentUserId, time: Date.now(), text: v });
    saveState();
    inp.value = '';
    renderMilestoneComments();
    openProjectDetail(pid);
    showToast('코멘트 추가됨');
}
function deleteMilestoneComment(time) {
    const { pid, mid } = _msEdit;
    if (!pid || !mid) return;
    const p = state.projects.find(x => x.id === pid);
    const m = (p?.milestones||[]).find(x => x.id === mid);
    if (!m) return;
    m.comments = (m.comments||[]).filter(c => !(c.time === time && c.author === state.currentUserId));
    saveState();
    renderMilestoneComments();
    openProjectDetail(pid);
}
function closeMilestoneModal() {
    document.getElementById('ms-modal-overlay').classList.add('hidden');
    document.getElementById('ms-modal').classList.add('hidden');
    _msEdit = { pid:null, mid:null };
}
function saveMilestone() {
    const { pid, mid } = _msEdit;
    if (!pid) return;
    const p = state.projects.find(x => x.id === pid); if (!p) return;

    if (mid) {
        // EDIT mode
        const title = document.getElementById('ms-title').value.trim();
        const due = document.getElementById('ms-due').value;
        const done = document.getElementById('ms-done').checked;
        if (!title) { showToast('제목을 입력하세요'); return; }
        if (!due)   { showToast('목표일을 선택하세요'); return; }
        const m = (p.milestones||[]).find(x => x.id === mid);
        if (m) { m.title = title; m.dueDate = due; m.done = done; }
        showToast('마일스톤 수정됨');
    } else {
        // ADD mode (batch)
        const rows = Array.from(document.querySelectorAll('#ms-rows .ms-row'));
        const items = rows.map(r => ({
            title: r.querySelector('.ms-row-title').value.trim(),
            due: r.querySelector('.ms-row-due').value
        })).filter(x => x.title && x.due);
        if (items.length === 0) { showToast('1개 이상의 마일스톤을 입력하세요'); return; }
        p.milestones = p.milestones || [];
        items.forEach(it => p.milestones.push({ id: uid(), title: it.title, dueDate: it.due, done: false, comments: [] }));
        showToast(`${items.length}개 마일스톤 추가됨`);
    }
    // Auto-update progress
    const total = (p.milestones||[]).length;
    const doneN = (p.milestones||[]).filter(x => x.done).length;
    if (total > 0) p.progress = Math.round(doneN / total * 100);
    saveState();
    closeMilestoneModal();
    openProjectDetail(pid);
    render();
}
function deleteMilestone(pid, mid) {
    if (!confirm('마일스톤을 삭제하시겠습니까?')) return;
    const p = state.projects.find(x => x.id === pid); if (!p) return;
    p.milestones = (p.milestones||[]).filter(m => m.id !== mid);
    const total = p.milestones.length;
    const done = p.milestones.filter(x => x.done).length;
    if (total > 0) p.progress = Math.round(done / total * 100);
    saveState(); openProjectDetail(pid); render();
}

// Project create / edit modal
let _pjEdit = { id:null, type:'세일즈', members:new Set() };
function openProjectModal(editId) {
    if (editId) {
        const p = state.projects.find(x => x.id === editId); if (!p) return;
        _pjEdit = { id:editId, type:p.type || '기타', members: new Set(p.members||[]) };
        document.getElementById('proj-modal-title').textContent = '프로젝트 편집';
        document.getElementById('pj-save-label').textContent = '저장';
        document.getElementById('pj-title').value = p.title;
        document.getElementById('pj-body').value = p.description || '';
        document.getElementById('pj-start').value = p.startDate || TODAY;
        document.getElementById('pj-due').value = p.dueDate || dateStr(30);
    } else {
        _pjEdit = { id:null, type:'세일즈', members: new Set([state.currentUserId]) };
        document.getElementById('proj-modal-title').textContent = '새 팀 프로젝트';
        document.getElementById('pj-save-label').textContent = '프로젝트 생성';
        document.getElementById('pj-title').value = '';
        document.getElementById('pj-body').value = '';
        document.getElementById('pj-start').value = TODAY;
        document.getElementById('pj-due').value = dateStr(30);
    }
    setProjectType(_pjEdit.type);
    renderProjectMemberPicker();
    refreshProjectLeaderSelect();
    document.getElementById('proj-modal-overlay').classList.remove('hidden');
    document.getElementById('proj-modal').classList.remove('hidden');
    applyAvatarPhotos();
    setTimeout(() => document.getElementById('pj-title').focus(), 50);
}
function closeProjectModal() {
    document.getElementById('proj-modal-overlay').classList.add('hidden');
    document.getElementById('proj-modal').classList.add('hidden');
}
function setProjectType(t) {
    _pjEdit.type = t;
    const cfg = PROJECT_TYPE_CFG[t] || PROJECT_TYPE_CFG['기타'];
    document.querySelectorAll('.pjtb').forEach(b => {
        const active = b.dataset.pjt === t;
        if (active) {
            const c = PROJECT_TYPE_CFG[t] || PROJECT_TYPE_CFG['기타'];
            b.className = `pjtb px-3 py-1.5 rounded-lg text-[11.5px] font-bold border-2 transition-all ${c.badge.replace(/border-\S+/,'border-current')}`;
        } else {
            b.className = 'pjtb px-3 py-1.5 rounded-lg text-[11.5px] font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all';
        }
    });
}
function renderProjectMemberPicker() {
    const wrap = document.getElementById('pj-members');
    wrap.innerHTML = USERS.map(u => {
        const sel = _pjEdit.members.has(u.id);
        return `<button data-pj-mid="${u.id}" onclick="toggleProjectMember('${u.id}')" class="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-[11px] font-bold transition-all ${sel?'bg-rose-100 border-rose-500 text-rose-700 shadow-sm':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}">
            <span class="av av-${u.role} w-5 h-5 text-[9px] inline-flex items-center justify-center rounded-full text-white" data-uid="${u.id}">${initial(u.name)}</span>${u.name}<span class="text-[9px] opacity-60">${u.role}</span>
        </button>`;
    }).join('');
    document.getElementById('pj-member-count').textContent = _pjEdit.members.size ? `✓ ${_pjEdit.members.size}명` : '최소 1명 선택';
    setTimeout(applyAvatarPhotos, 0);
}
function toggleProjectMember(uid) {
    if (_pjEdit.members.has(uid)) _pjEdit.members.delete(uid);
    else _pjEdit.members.add(uid);
    renderProjectMemberPicker();
    refreshProjectLeaderSelect();
}
function refreshProjectLeaderSelect() {
    const sel = document.getElementById('pj-leader');
    const ids = Array.from(_pjEdit.members);
    if (ids.length === 0) { sel.innerHTML = '<option value="">멤버를 먼저 선택하세요</option>'; return; }
    const cur = (state.projects.find(p => p.id === _pjEdit.id)?.leader) || state.currentUserId;
    const lid = ids.includes(cur) ? cur : ids[0];
    sel.innerHTML = ids.map(id => { const u = getUser(id); return `<option value="${id}" ${id===lid?'selected':''}>${u?.name} (${u?.role})</option>`; }).join('');
}
function saveProject() {
    const title = document.getElementById('pj-title').value.trim();
    if (!title) { showToast('제목을 입력하세요'); return; }
    const description = document.getElementById('pj-body').value.trim();
    const startDate = document.getElementById('pj-start').value || TODAY;
    const dueDate = document.getElementById('pj-due').value || dateStr(30);
    const members = Array.from(_pjEdit.members);
    if (members.length === 0) { showToast('참여 멤버를 선택하세요'); return; }
    if (dueDate < startDate) { showToast('마감일이 시작일보다 이전입니다'); return; }
    const leader = document.getElementById('pj-leader').value || members[0];
    if (_pjEdit.id) {
        const p = state.projects.find(x => x.id === _pjEdit.id);
        if (p) { p.title = title; p.description = description; p.type = _pjEdit.type; p.startDate = startDate; p.dueDate = dueDate; p.members = members; p.leader = leader; }
        showToast('프로젝트 수정됨');
    } else {
        state.projects = state.projects || [];
        state.projects.unshift({
            id:uid(), title, type:_pjEdit.type, description, leader, members,
            status:'계획', progress:0, startDate, dueDate,
            milestones:[], metrics:[], comments:[], createdAt:Date.now()
        });
        showToast('프로젝트가 생성되었습니다');
    }
    saveState(); closeProjectModal(); render();
}

// ────────────────────────────────  RIGHT RAIL  ────────────────────────────────
function renderRail() {
    const rail = document.getElementById('view-rail');
    if (state.view === 'memo' || state.view === 'team') { rail.innerHTML = ''; rail.classList.add('hidden'); return; }
    rail.classList.remove('hidden');

    const recv = state.tasks.filter(t => t.to.includes(state.currentUserId) && t.status !== '완료');
    const todayTasks = recv.filter(t => t.due === TODAY).sort((a,b) => (b.priority==='high'?1:0) - (a.priority==='high'?1:0));
    const upcoming = recv.filter(t => t.due > TODAY).sort((a,b) => a.due.localeCompare(b.due)).slice(0,3);

    const team = USERS.filter(u => u.id !== state.currentUserId);
    const onLeaveTeam = team.filter(u => state.onLeave[u.id]);

    const pinnedMemos = visibleMemos().filter(m => m.pinned).slice(0,3);

    rail.innerHTML = `
        <!-- TODAY -->
        <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-[12px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-clock text-brand-500"></i>오늘 일정</h3>
                <span class="text-[10px] text-slate-400 font-bold tabular-nums">${todayTasks.length}건</span>
            </header>
            <div class="divide-y divide-slate-100">
                ${todayTasks.length === 0 ? '<div class="px-4 py-5 text-center text-[11px] text-slate-400">오늘 마감 없음 ✨</div>' :
                    todayTasks.map(t => `<button onclick="openDetail('${t.id}')" class="rail-row w-full px-4 py-2.5 flex items-center gap-2 text-left">
                        <span class="w-1.5 h-1.5 rounded-full pr-bar-${t.priority} shrink-0"></span>
                        <div class="flex-1 min-w-0">
                            <div class="text-[11.5px] font-bold text-slate-800 truncate">${escapeHtml(t.title)}</div>
                            <div class="text-[10px] text-slate-500">${getUser(t.from).name} 지시</div>
                        </div>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold st-${t.status}">${t.status}</span>
                    </button>`).join('')}
                ${upcoming.length ? `<div class="px-4 py-1.5 text-[9px] font-bold text-slate-400 uppercase bg-slate-50">예정</div>` + upcoming.map(t => `<button onclick="openDetail('${t.id}')" class="rail-row w-full px-4 py-2 flex items-center gap-2 text-left">
                    <span class="text-[10px] font-bold text-slate-400 tabular-nums w-10">${t.due.slice(5)}</span>
                    <span class="text-[11px] text-slate-700 truncate flex-1">${escapeHtml(t.title)}</span>
                </button>`).join('') : ''}
            </div>
        </section>

        <!-- TEAM STATUS -->
        <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-[12px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-users-three text-brand-500"></i>팀 현황</h3>
                ${onLeaveTeam.length ? `<span class="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded">${onLeaveTeam.length} 휴가</span>` : ''}
            </header>
            <div class="divide-y divide-slate-100">
                ${team.slice(0,5).map(u => {
                    const onL = state.onLeave[u.id];
                    const load = state.tasks.filter(t => t.to.includes(u.id) && t.status !== '완료').length;
                    return `<button onclick="peekTeamMember('${u.id}')" class="rail-row w-full px-4 py-2.5 flex items-center gap-2 text-left">
                        <div class="av av-${u.role} w-7 h-7 text-[10px] relative">${initial(u.name)}${onL?'<span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border-[1.5px] border-white rounded-full"></span>':''}</div>
                        <div class="flex-1 min-w-0">
                            <div class="text-[11.5px] font-bold text-slate-800">${u.name}</div>
                            <div class="text-[10px] text-slate-500">${u.role} ${onL?' · 휴가 중':''}</div>
                        </div>
                        ${load > 0 ? `<span class="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded tabular-nums">${load}</span>`:''}
                    </button>`;
                }).join('')}
            </div>
        </section>

        <!-- PINNED MEMOS -->
        <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <header class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-[12px] font-extrabold text-slate-800 flex items-center gap-1.5"><i class="ph-fill ph-push-pin text-amber-500"></i>고정 메모</h3>
                <button onclick="state.view='memo';render()" class="text-[10px] font-bold text-slate-400 hover:text-brand-600">전체보기</button>
            </header>
            <div class="divide-y divide-slate-100">
                ${pinnedMemos.length === 0 ? '<div class="px-4 py-5 text-center text-[11px] text-slate-400">고정된 메모 없음</div>' :
                    pinnedMemos.map(m => `<button onclick="state.view='memo';render()" class="rail-row w-full px-4 py-2.5 text-left">
                        <div class="text-[11.5px] font-bold text-slate-800 truncate">${escapeHtml(m.title)}</div>
                        <div class="text-[10px] text-slate-500 line-clamp-1 mt-0.5">${escapeHtml(m.body||'')}</div>
                        <div class="text-[9px] text-slate-400 mt-1">${getUser(m.author).name} · ${timeAgo(m.updatedAt)}</div>
                    </button>`).join('')}
            </div>
        </section>`;
}

function emptyStateHtml(msg) {
    return `<div class="bg-white rounded-xl border border-dashed border-slate-200 py-16 text-center">
        <i class="ph ph-confetti text-5xl text-slate-300 block mb-3"></i>
        <div class="text-[13px] font-bold text-slate-600">${msg}</div>
        <div class="text-[11px] text-slate-400 mt-1">필터를 조정하거나 새 업무를 추가하세요.</div>
    </div>`;
}

// ════════════════════════════════════════════════════════════════════
// DETAIL DRAWER
// ════════════════════════════════════════════════════════════════════
function openDetail(id) {
    const t = state.tasks.find(x => x.id === id); if (!t) return;
    _detailTaskId = id;
    const fromU = getUser(t.from);
    const toUsers = t.to.map(getUser);
    const canEditMeta = t.from === state.currentUserId; // only creator edits title/body/due
    const canDelete = t.from === state.currentUserId || me().role === '대표';

    document.getElementById('detail-bc').innerHTML = `<span class="font-bold text-slate-700">${fromU.name}</span> → ${toUsers.map(u=>u.name).join(', ')}`;
    const delBtn = document.getElementById('detail-delete');
    delBtn.style.display = canDelete ? '' : 'none';
    delBtn.onclick = () => { if (!canDelete) return; if (confirm('삭제?')) { deleteTask(t.id); closeDetail(); }};

    const body = document.getElementById('detail-body');
    body.innerHTML = `
        <div>
            <div class="flex items-center gap-2 mb-2 flex-wrap">
                <button onclick="openStatusPicker('${t.id}', event)" class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold st-${t.status} hover:brightness-95">
                    <span class="w-1.5 h-1.5 rounded-full st-bg-${t.status}"></span>${t.status}
                </button>
                <span class="px-2 py-1 rounded text-[11px] font-bold border pr-pill-${t.priority}">${t.priority==='high'?'🔴 높음':t.priority==='normal'?'🔵 보통':'⚪ 낮음'}</span>
            </div>
            <h2 contenteditable="${canEditMeta}" id="detail-title" class="text-[22px] font-extrabold text-slate-900 leading-tight focus:outline-none ${canEditMeta?'focus:bg-slate-50 hover:bg-slate-50/50 cursor-text':''} -mx-1 px-1 rounded">${escapeHtml(t.title)}</h2>
        </div>
        <dl class="space-y-2 text-[12.5px]">
            <div class="flex items-start gap-3">
                <dt class="w-16 text-slate-500 font-bold flex items-center gap-1.5 pt-0.5"><i class="ph ph-user"></i>지시</dt>
                <dd class="flex items-center gap-1.5"><span class="av av-${fromU.role} w-5 h-5 text-[10px]">${initial(fromU.name)}</span><span class="font-bold text-slate-900">${fromU.name}</span><span class="text-[10px] text-slate-400">${fromU.role}</span></dd>
            </div>
            <div class="flex items-start gap-3">
                <dt class="w-16 text-slate-500 font-bold flex items-center gap-1.5 pt-0.5"><i class="ph ph-users"></i>담당</dt>
                <dd class="flex flex-wrap items-center gap-1.5">${toUsers.map(u => `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded"><span class="av av-${u.role} w-4 h-4 text-[8px]">${initial(u.name)}</span><span class="text-[11px] font-bold text-slate-900">${u.name}</span>${state.onLeave[u.id]?'<i class="ph-fill ph-airplane-tilt text-amber-500 text-[10px]"></i>':''}</span>`).join('')}</dd>
            </div>
            <div class="flex items-start gap-3">
                <dt class="w-16 text-slate-500 font-bold flex items-center gap-1.5 pt-0.5"><i class="ph ph-calendar"></i>마감</dt>
                <dd>${canEditMeta
                    ? `<input type="text" readonly value="${t.due}" onclick="openDatePicker(this, event)" onchange="updateField('${t.id}','due',this.value)" class="dp-trigger px-2.5 py-1 border border-slate-200 rounded text-[11px] font-bold cursor-pointer focus:outline-none focus:border-brand-500 bg-white">`
                    : `<span class="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 font-mono inline-flex items-center gap-1.5">${t.due}<i class="ph ph-lock-simple text-slate-400" title="지시자만 수정 가능"></i></span>`
                }</dd>
            </div>
            <div class="flex items-start gap-3">
                <dt class="w-16 text-slate-500 font-bold flex items-center gap-1.5 pt-0.5"><i class="ph ph-clock"></i>생성</dt>
                <dd class="text-[11px] text-slate-500">${timeAgo(t.createdAt)}</dd>
            </div>
        </dl>
        <div class="border-t border-slate-100 pt-4">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">설명</div>
            <div contenteditable="${canEditMeta}" id="detail-body-text" class="text-[12.5px] text-slate-700 leading-relaxed whitespace-pre-line min-h-[60px] focus:outline-none ${canEditMeta?'focus:bg-slate-50 hover:bg-slate-50/50 cursor-text':''} -mx-1 px-1 rounded">${escapeHtml(t.body||'설명이 없습니다.')}</div>
        </div>
        <div class="border-t border-slate-100 pt-4">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="ph ph-chat-circle"></i>코멘트 <span class="text-slate-400">${(t.comments||[]).length}</span></div>
            <div class="space-y-3">${(t.comments||[]).length === 0 ? '<div class="text-[11px] text-slate-400 italic py-2">코멘트가 없습니다.</div>' : (t.comments||[]).slice().reverse().map(c => {
                const a = getUser(c.author);
                return `<div class="flex gap-2.5">
                    <div class="av av-${a.role} w-7 h-7 text-[11px]">${initial(a.name)}</div>
                    <div class="flex-1">
                        <div class="text-[11px]"><span class="font-bold text-slate-900">${a.name}</span> <span class="text-slate-400 ml-1">${timeAgo(c.time)}</span></div>
                        <div class="text-[12px] text-slate-700 mt-0.5 whitespace-pre-line">${escapeHtml(c.text)}</div>
                    </div>
                </div>`;
            }).join('')}</div>
        </div>`;

    if (canEditMeta) document.getElementById('detail-title').addEventListener('blur', e => updateField(t.id, 'title', e.target.textContent.trim() || t.title));
    if (canEditMeta) document.getElementById('detail-body-text').addEventListener('blur', e => {
        const v = e.target.textContent.trim();
        if (v && v !== '설명이 없습니다.') updateField(t.id, 'body', v);
    });

    document.getElementById('detail-overlay').classList.remove('hidden');
    const dr = document.getElementById('detail-drawer');
    dr.classList.remove('hidden');
    setTimeout(() => dr.classList.remove('translate-x-full'), 10);

    const ci = document.getElementById('detail-comment');
    ci.value = '';
    const send = () => { const v = ci.value.trim(); if (!v) return; addCommentTo(t.id, v); ci.value=''; openDetail(t.id); };
    document.getElementById('detail-comment-send').onclick = send;
    ci.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }};
}
function closeDetail() {
    _detailTaskId = null;
    document.getElementById('detail-overlay').classList.add('hidden');
    const dr = document.getElementById('detail-drawer');
    dr.classList.add('translate-x-full');
    setTimeout(() => dr.classList.add('hidden'), 200);
}
function updateField(id, field, value) { const t = state.tasks.find(x => x.id === id); if (!t) return; t[field] = value; saveState(); render(); }
function addCommentTo(id, text) { const t = state.tasks.find(x => x.id === id); if (!t) return; t.comments = t.comments || []; t.comments.push({author:state.currentUserId, time:Date.now(), text}); saveState(); }
function cycleStatus(id) { const t = state.tasks.find(x => x.id === id); if (!t) return; const f = ['할일','진행중','완료']; t.status = f[(f.indexOf(t.status)+1)%f.length]; saveState(); render(); }

let _statusPickerTaskId = null;
let _detailTaskId = null;

// ════════════════════════════════════════════════════════════════════
// DATE PICKER (custom calendar popover)
// ════════════════════════════════════════════════════════════════════
let _dpInput = null;
let _dpYear, _dpMonth; // currently displayed month
let _dpAllowClear = true;
window.openDatePicker = function (input, ev) {
    if (ev) ev.stopPropagation();
    if (typeof input === 'string') input = document.getElementById(input);
    if (!input) return;
    _dpInput = input;
    _dpAllowClear = input.dataset.required !== 'true';
    const v = input.value || input.dataset.value || '';
    let init;
    if (v) { const d = new Date(v); _dpYear = d.getFullYear(); _dpMonth = d.getMonth(); init = v; }
    else { const d = new Date(); _dpYear = d.getFullYear(); _dpMonth = d.getMonth(); init = ''; }
    const picker = document.getElementById('date-picker');
    const rect = input.getBoundingClientRect();
    const w = 300, h = 360;
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
    if (top + h > window.innerHeight - 8) top = Math.max(8, rect.top - h - 6);
    picker.style.top = top + 'px';
    picker.style.left = left + 'px';
    document.getElementById('dp-clear-btn').style.display = _dpAllowClear ? '' : 'none';
    renderDpCalendar();
    picker.classList.remove('hidden');
};
window.closeDatePicker = function () {
    document.getElementById('date-picker').classList.add('hidden');
    _dpInput = null;
};
window.dpNav = function (delta) {
    _dpMonth += delta;
    if (_dpMonth < 0) { _dpMonth = 11; _dpYear--; }
    if (_dpMonth > 11) { _dpMonth = 0; _dpYear++; }
    renderDpCalendar();
};
window.dpThisMonth = function () {
    const d = new Date(); _dpYear = d.getFullYear(); _dpMonth = d.getMonth();
    renderDpCalendar();
};
window.dpPickToday = function () { dpPickDate(TODAY); };
window.dpClear = function () { if (!_dpInput) return; _dpInput.value = ''; _dpInput.dispatchEvent(new Event('input',{bubbles:true})); _dpInput.dispatchEvent(new Event('change',{bubbles:true})); refreshDpTrigger(_dpInput); closeDatePicker(); };
function dpPickDate(s) {
    if (!_dpInput) return;
    _dpInput.value = s;
    _dpInput.dataset.value = s;
    _dpInput.dispatchEvent(new Event('input', { bubbles:true }));
    _dpInput.dispatchEvent(new Event('change', { bubbles:true }));
    refreshDpTrigger(_dpInput);
    closeDatePicker();
}
function pad(n) { return String(n).padStart(2,'0'); }
function renderDpCalendar() {
    const lbl = document.getElementById('dp-month-label');
    lbl.textContent = `${_dpYear}년 ${_dpMonth+1}월`;
    const grid = document.getElementById('dp-grid');
    const firstDay = new Date(_dpYear, _dpMonth, 1).getDay();
    const lastDate = new Date(_dpYear, _dpMonth+1, 0).getDate();
    const prevLastDate = new Date(_dpYear, _dpMonth, 0).getDate();
    const selVal = _dpInput?.value;
    const today = TODAY;
    const cells = [];
    // Leading days from prev month
    for (let i = firstDay - 1; i >= 0; i--) {
        const d = prevLastDate - i;
        const ym = _dpMonth === 0 ? `${_dpYear-1}-12` : `${_dpYear}-${pad(_dpMonth)}`;
        const ds = `${ym}-${pad(d)}`;
        cells.push(dpCellHtml(d, ds, true, _dpMonth === 0 ? new Date(_dpYear-1, 11, d).getDay() : new Date(_dpYear, _dpMonth-1, d).getDay()));
    }
    for (let d = 1; d <= lastDate; d++) {
        const ds = `${_dpYear}-${pad(_dpMonth+1)}-${pad(d)}`;
        cells.push(dpCellHtml(d, ds, false, new Date(_dpYear, _dpMonth, d).getDay()));
    }
    // Trailing days to fill 6 rows
    let trailing = 0;
    while (cells.length < 42) {
        trailing++;
        const ds = _dpMonth === 11 ? `${_dpYear+1}-01-${pad(trailing)}` : `${_dpYear}-${pad(_dpMonth+2)}-${pad(trailing)}`;
        cells.push(dpCellHtml(trailing, ds, true, _dpMonth === 11 ? new Date(_dpYear+1, 0, trailing).getDay() : new Date(_dpYear, _dpMonth+1, trailing).getDay()));
    }
    grid.innerHTML = cells.join('');
}
function dpCellHtml(d, ds, otherMonth, dow) {
    const isToday = ds === TODAY;
    const isSelected = ds === _dpInput?.value;
    const cls = ['dp-day'];
    if (otherMonth) cls.push('dp-other-month');
    if (isToday) cls.push('dp-today');
    if (isSelected) cls.push('dp-selected');
    if (dow === 0) cls.push('dp-weekend');
    if (dow === 6) cls.push('dp-weekend','dp-saturday');
    return `<button type="button" class="${cls.join(' ')}" onclick="dpPickDate('${ds}')">${d}</button>`;
}

function refreshDpTrigger(input) {
    // If input has a sibling .dp-display, update it
    const trigger = input.closest('.dp-trigger') || document.querySelector(`[data-dp-target="${input.id}"]`);
    if (trigger) {
        const display = trigger.querySelector('.dp-display');
        if (display) display.textContent = formatDpValue(input.value);
    }
}
function formatDpValue(v) {
    if (!v) return '날짜 선택';
    const d = new Date(v);
    const wk = ['일','월','화','수','목','금','토'][d.getDay()];
    return `${v} (${wk})`;
}
window.openStatusPicker = function(taskId, ev) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    const t = state.tasks.find(x => x.id === taskId);
    if (!t) return;
    _statusPickerTaskId = taskId;
    const picker = document.getElementById('status-picker');
    const target = (ev && (ev.currentTarget || ev.target)) || null;
    const rect = target?.getBoundingClientRect?.() || { bottom:200, left:200, top:200 };
    const w = 180, h = 180;
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
    if (top + h > window.innerHeight - 8) top = Math.max(8, rect.top - h - 6);
    picker.style.top = top + 'px';
    picker.style.left = left + 'px';
    picker.querySelectorAll('.sp-opt').forEach(b => {
        const isCurrent = b.dataset.status === t.status;
        const check = b.querySelector('.sp-check');
        if (check) check.classList.toggle('hidden', !isCurrent);
        b.classList.toggle('bg-slate-50', isCurrent);
    });
    picker.classList.remove('hidden');
};
window.setTaskStatus = function(s) {
    const t = state.tasks.find(x => x.id === _statusPickerTaskId);
    if (!t) return;
    const id = t.id;
    t.status = s;
    saveState();
    closeStatusPicker();
    render();
    if (_detailTaskId === id) openDetail(id);
};
window.closeStatusPicker = function() {
    document.getElementById('status-picker').classList.add('hidden');
    _statusPickerTaskId = null;
};
function deleteTask(id) { state.tasks = state.tasks.filter(t => t.id !== id); saveState(); render(); }

// ════════════════════════════════════════════════════════════════════
// TASK MODAL
// ════════════════════════════════════════════════════════════════════
let _editPri = 'normal';
function openTaskModal() {
    const u = me();
    const titleEl = document.querySelector('#task-modal h3');
    const subEl = document.querySelector('#task-modal header p');
    if (u.role === '대표') {
        if (titleEl) titleEl.textContent = '업무 지시';
        if (subEl) subEl.textContent = '매니저·직원에게 새 지시를 내립니다';
    } else if (u.role === '매니저') {
        if (titleEl) titleEl.textContent = '새 업무 만들기';
        if (subEl) subEl.textContent = '담당자에게 지시하거나 본인 할일로 추가하세요';
    } else {
        if (titleEl) titleEl.textContent = '셀프 업무 추가';
        if (subEl) subEl.textContent = '본인 할일로 추가합니다';
    }
    document.getElementById('t-title').value = '';
    document.getElementById('t-body').value = '';
    document.getElementById('t-due').value = TODAY;
    setPri('normal');
    setQuickDate(0);

    const wrap = document.getElementById('t-assignees');
    // 본인 포함 — 본인 할일로 직접 부여 가능
    let cands = [];
    if (u.role === '대표') cands = USERS.slice();
    else if (u.role === '매니저') cands = USERS.filter(x => x.role !== '대표');
    else cands = [u]; // 직원: 본인만
    // 본인이 누락됐다면 항상 추가
    if (!cands.find(c => c.id === u.id)) cands.unshift(u);
    // 본인을 맨 앞으로
    cands = [u, ...cands.filter(c => c.id !== u.id)];
    wrap.innerHTML = cands.map(c => {
        const onL = state.onLeave[c.id];
        const isSelf = c.id === u.id;
        return `<button data-aid="${c.id}" onclick="this.classList.toggle('!bg-brand-100');this.classList.toggle('!border-brand-500');this.classList.toggle('!text-brand-700');this.classList.toggle('!shadow-sm');updateAssigneeCount()" class="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border ${isSelf?'border-brand-300 bg-brand-50/40':'border-slate-200 bg-white'} text-[11px] font-bold hover:bg-slate-50 transition-all ${onL?'opacity-70':''}">
            <span class="av av-${c.role} inline-flex items-center justify-center rounded-full w-5 h-5 text-[9px] text-white" data-uid="${c.id}">${initial(c.name)}</span>${c.name}${isSelf?'<span class="text-[9px] font-extrabold text-brand-600 ml-0.5">나</span>':''}<span class="text-[9px] text-slate-400">${c.role}</span>${onL?'<i class="ph-fill ph-airplane-tilt text-amber-500 text-[10px]"></i>':''}
        </button>`;
    }).join('');
    updateAssigneeCount();
    showModal('task-modal');
    applyAvatarPhotos();
    setTimeout(() => document.getElementById('t-title').focus(), 50);
}
function updateAssigneeCount() {
    const n = document.querySelectorAll('#t-assignees button.\\!bg-brand-100').length;
    const el = document.getElementById('t-assignee-count');
    if (el) el.textContent = n ? `✓ ${n}명 선택` : '담당자를 1명 이상 선택하세요';
}
function setQuickDate(daysFromToday) {
    const d = dateStr(daysFromToday);
    document.getElementById('t-due').value = d;
    document.querySelectorAll('.qd-btn').forEach(b => {
        const active = parseInt(b.dataset.quick) === daysFromToday;
        b.className = `qd-btn px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${active?'bg-brand-600 text-white border-brand-600 shadow-sm':'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`;
    });
    updateDuePreview();
}
function updateDuePreview() {
    const v = document.getElementById('t-due').value;
    const el = document.getElementById('t-due-preview');
    if (!el || !v) return;
    const f = formatDue(v);
    el.innerHTML = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${f.cls} border">${f.fullText || f.text}</span>`;
    // Sync quick chip highlight
    const todayD = new Date(TODAY);
    const dueD = new Date(v);
    const diff = Math.round((dueD - todayD) / 86400000);
    document.querySelectorAll('.qd-btn').forEach(b => {
        const active = parseInt(b.dataset.quick) === diff;
        b.className = `qd-btn px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${active?'bg-brand-600 text-white border-brand-600 shadow-sm':'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`;
    });
}
function setPri(p) {
    _editPri = p;
    const colors = {
        high:   { active:'bg-red-50 text-red-700 border-red-300',     inactive:'border-slate-200 text-slate-700 hover:bg-slate-50' },
        normal: { active:'bg-blue-50 text-blue-700 border-blue-300',  inactive:'border-slate-200 text-slate-700 hover:bg-slate-50' },
        low:    { active:'bg-slate-100 text-slate-700 border-slate-400', inactive:'border-slate-200 text-slate-700 hover:bg-slate-50' },
    };
    document.querySelectorAll('.prib').forEach(b => {
        const c = colors[b.dataset.pri] || colors.normal;
        const active = b.dataset.pri === p;
        b.className = `prib flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-extrabold border-2 transition-all ${active?c.active:c.inactive}`;
    });
}
window.applyAvatarPhotos = function() {
    document.querySelectorAll('.av').forEach(el => {
        if (el.dataset.avDone === '1') return;
        let u = null;
        if (el.dataset.uid) u = getUser(el.dataset.uid);
        if (!u) {
            // Heuristic: first text char of element matches user initial
            const txt = (el.textContent || '').trim().replace(/[^가-힣A-Za-z]/g, '').slice(0, 1);
            if (txt) u = USERS.find(usr => initial(usr.name) === txt);
        }
        if (u) {
            el.style.setProperty('--av-img', `url("${avatarSrc(u)}")`);
            el.dataset.avDone = '1';
            el.dataset.uid = u.id;
        }
    });
};
function closeTaskModal() { hideModal('task-modal'); }
function saveTask() {
    const title = document.getElementById('t-title').value.trim();
    if (!title) { showToast('제목을 입력하세요'); return; }
    const body = document.getElementById('t-body').value.trim();
    const due = document.getElementById('t-due').value || TODAY;
    const checked = Array.from(document.querySelectorAll('#t-assignees button.\\!bg-brand-100')).map(b => b.dataset.aid);
    if (checked.length === 0) { showToast('담당자를 선택하세요'); return; }
    const exp = new Set(checked);
    checked.forEach(id => { if (state.onLeave[id]) USERS.filter(usr => (usr.coverFor||[]).includes(id)).forEach(c => exp.add(c.id)); });
    state.tasks.push({ id:uid(), title, body, from:state.currentUserId, to:Array.from(exp), due, priority:_editPri, status:'할일', comments:[], createdAt:Date.now() });
    saveState(); closeTaskModal(); render(); showToast('업무가 생성되었습니다');
}

// ════════════════════════════════════════════════════════════════════
// MEMO MODAL
// ════════════════════════════════════════════════════════════════════
let _memoVis = 'team';
let _editMemoId = null;
let _memoColor = 'default';

const MEMO_COLORS = {
    default: { bg:'bg-white',     border:'border-slate-200',  swatch:'bg-white border border-slate-300', label:'기본' },
    yellow:  { bg:'bg-yellow-50', border:'border-yellow-300', swatch:'bg-yellow-200',                    label:'노랑' },
    orange:  { bg:'bg-orange-50', border:'border-orange-300', swatch:'bg-orange-200',                    label:'주황' },
    pink:    { bg:'bg-pink-50',   border:'border-pink-300',   swatch:'bg-pink-200',                      label:'분홍' },
    purple:  { bg:'bg-purple-50', border:'border-purple-300', swatch:'bg-purple-200',                    label:'보라' },
    blue:    { bg:'bg-blue-50',   border:'border-blue-300',   swatch:'bg-blue-200',                      label:'파랑' },
    teal:    { bg:'bg-teal-50',   border:'border-teal-300',   swatch:'bg-teal-200',                      label:'청록' },
    green:   { bg:'bg-emerald-50',border:'border-emerald-300',swatch:'bg-emerald-200',                   label:'초록' },
    gray:    { bg:'bg-slate-100', border:'border-slate-300',  swatch:'bg-slate-300',                     label:'회색' },
};
function renderMemoColorPicker() {
    const wrap = document.getElementById('m-color'); if (!wrap) return;
    wrap.innerHTML = Object.keys(MEMO_COLORS).map(k => {
        const c = MEMO_COLORS[k];
        const active = k === _memoColor;
        return `<button type="button" data-color="${k}" onclick="setMemoColor('${k}')" title="${c.label}" class="w-7 h-7 rounded-full ${c.swatch} flex items-center justify-center transition-all ${active?'ring-2 ring-offset-2 ring-amber-500 scale-110':'hover:scale-110'}">${active?'<i class="ph-bold ph-check text-slate-700 text-[11px]"></i>':''}</button>`;
    }).join('');
}
function setMemoColor(c) { _memoColor = c; renderMemoColorPicker(); }
function openMemoModal() {
    _editMemoId = null;
    document.getElementById('m-title').value = '';
    document.getElementById('m-body').value = '';
    document.getElementById('m-pin').checked = false;
    _editAudience.m = ['ALL'];
    _memoColor = 'default';
    renderMemoColorPicker();
    setMemoVis('team');
    showModal('memo-modal');
    applyAvatarPhotos();
    setTimeout(() => document.getElementById('m-title').focus(), 50);
}
function editMemo(id) {
    const m = state.memos.find(x => x.id === id); if (!m) return;
    _editMemoId = id;
    document.getElementById('m-title').value = m.title;
    document.getElementById('m-body').value = m.body || '';
    document.getElementById('m-pin').checked = !!m.pinned;
    _editAudience.m = (m.audience && m.audience.length) ? m.audience.slice() : ['ALL'];
    _memoColor = m.color || 'default';
    renderMemoColorPicker();
    setMemoVis(m.visibility);
    showModal('memo-modal');
    applyAvatarPhotos();
    setTimeout(() => document.getElementById('m-title').focus(), 50);
}
function setMemoVis(v) {
    _memoVis = v;
    const colors = { private:'bg-slate-700 text-white border-slate-700', team:'bg-amber-500 text-white border-amber-500' };
    document.querySelectorAll('.visb').forEach(b => {
        const active = b.dataset.vis === v;
        b.className = `visb px-2.5 py-1 rounded-md font-bold border transition-all ${active?colors[v]:'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`;
    });
    const wrap = document.getElementById('m-audience-wrap');
    if (wrap) {
        if (v === 'team') {
            wrap.classList.remove('hidden');
            renderAudiencePicker('m');
        } else {
            wrap.classList.add('hidden');
        }
    }
}
function closeMemoModal() { hideModal('memo-modal'); }
function saveMemo() {
    const title = document.getElementById('m-title').value.trim() || '제목 없음';
    const body = document.getElementById('m-body').value.trim();
    const pinned = document.getElementById('m-pin').checked;
    const aud = _memoVis === 'team' ? _editAudience.m.slice() : null;
    const color = _memoColor || 'default';
    if (_editMemoId) {
        const m = state.memos.find(x => x.id === _editMemoId);
        if (m) { m.title = title; m.body = body; m.visibility = _memoVis; m.pinned = pinned; m.audience = aud; m.color = color; m.updatedAt = Date.now(); }
        showToast('메모 수정됨');
    } else {
        state.memos.push({ id:uid(), title, body, author:state.currentUserId, visibility:_memoVis, pinned, audience:aud, color, updatedAt:Date.now() });
        showToast('메모 저장됨');
    }
    saveState(); closeMemoModal(); render();
}
function togglePin(id) { const m = state.memos.find(x => x.id === id); if (!m) return; m.pinned = !m.pinned; m.updatedAt = Date.now(); saveState(); render(); }
function deleteMemo(id) { if (!confirm('삭제?')) return; state.memos = state.memos.filter(m => m.id !== id); saveState(); render(); }

// ════════════════════════════════════════════════════════════════════
// NOTICE MODAL
// ════════════════════════════════════════════════════════════════════
let _editSev = 'info';
let _editAudience = { n: ['ALL'], m: ['ALL'], p: ['ALL'] }; // notice / memo / project
function openNoticeModal() {
    document.getElementById('n-title').value = '';
    document.getElementById('n-body').value = '';
    document.getElementById('n-pin').checked = false;
    setSev('info');
    _editAudience.n = ['ALL'];
    renderAudiencePicker('n');
    showModal('notice-modal');
    applyAvatarPhotos();
    setTimeout(() => document.getElementById('n-title').focus(), 50);
}
function setSev(s) {
    _editSev = s;
    const colors = { info:'border-brand-500 bg-brand-50 text-brand-700', warning:'border-amber-500 bg-amber-50 text-amber-700', success:'border-emerald-500 bg-emerald-50 text-emerald-700', danger:'border-red-500 bg-red-50 text-red-700' };
    document.querySelectorAll('.sevb').forEach(b => {
        const active = b.dataset.sev === s;
        b.className = `sevb px-2.5 py-1 rounded-md font-bold border transition-all ${active?colors[s]:'border-slate-200 text-slate-700 hover:bg-slate-50'}`;
    });
}
function renderAudiencePicker(prefix) {
    const wrap = document.getElementById(`${prefix}-audience`); if (!wrap) return;
    const aud = _editAudience[prefix] || ['ALL'];
    const isAll = aud.includes('ALL');
    wrap.innerHTML = USERS.filter(u => u.id !== state.currentUserId).map(u => {
        const sel = isAll || aud.includes(u.id);
        return `<button data-aud-id="${u.id}" onclick="toggleAudience('${prefix}','${u.id}')" class="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-[11px] font-bold transition-all ${sel?'bg-brand-100 border-brand-500 text-brand-700 shadow-sm':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}">
            <span class="av av-${u.role} w-5 h-5 text-[9px] inline-flex items-center justify-center rounded-full text-white" data-uid="${u.id}">${initial(u.name)}</span>${u.name}<span class="text-[9px] opacity-60">${u.role}</span>
        </button>`;
    }).join('');
    // Update ALL btn
    const allBtn = document.getElementById(`${prefix}-aud-all-btn`);
    if (allBtn) {
        allBtn.className = `px-2 py-0.5 text-[10px] font-bold rounded-md ${isAll?'bg-slate-900 text-white':'bg-slate-100 text-slate-500 hover:bg-slate-200'}`;
        allBtn.textContent = isAll ? '✓ ALL — 전체' : 'ALL — 전체로 전환';
    }
    setTimeout(applyAvatarPhotos, 0);
}
function toggleAudience(prefix, id) {
    let aud = _editAudience[prefix].slice();
    if (aud.includes('ALL')) aud = []; // clear ALL
    const idx = aud.indexOf(id);
    if (idx >= 0) aud.splice(idx, 1);
    else aud.push(id);
    if (aud.length === 0) aud = ['ALL'];
    _editAudience[prefix] = aud;
    renderAudiencePicker(prefix);
}
function toggleAudienceAll(prefix) {
    const aud = _editAudience[prefix];
    _editAudience[prefix] = aud.includes('ALL') ? [] : ['ALL'];
    renderAudiencePicker(prefix);
}
function closeNoticeModal() { hideModal('notice-modal'); }
function saveNotice() {
    const title = document.getElementById('n-title').value.trim();
    if (!title) { showToast('제목을 입력하세요'); return; }
    const body = document.getElementById('n-body').value.trim();
    const pinned = document.getElementById('n-pin').checked;
    state.notices = state.notices || [];
    state.notices.unshift({ id:uid(), title, body, author:state.currentUserId, severity:_editSev, pinned, audience:_editAudience.n.slice(), readBy:[], createdAt:Date.now() });
    saveState(); closeNoticeModal(); render(); showToast('공지가 발행되었습니다');
}

// ════════════════════════════════════════════════════════════════════
// COMMAND PALETTE
// ════════════════════════════════════════════════════════════════════
function openCmdSearch() { document.getElementById('cmd-overlay').classList.remove('hidden'); document.getElementById('cmd-palette').classList.remove('hidden'); const i = document.getElementById('cmd-input'); i.value=''; renderCmd(''); setTimeout(()=>i.focus(),50); }
function closeCmdSearch() { document.getElementById('cmd-overlay').classList.add('hidden'); document.getElementById('cmd-palette').classList.add('hidden'); }
function renderCmd(q) {
    q = q.toLowerCase();
    const tasks = state.tasks.filter(t => !q || t.title.toLowerCase().includes(q)).slice(0,5);
    const memos = visibleMemos().filter(m => !q || m.title.toLowerCase().includes(q)).slice(0,3);
    const people = USERS.filter(u => !q || u.name.toLowerCase().includes(q));
    const c = document.getElementById('cmd-results');
    if (!tasks.length && !memos.length && !(q && people.length)) { c.innerHTML = '<div class="px-4 py-6 text-center text-[12px] text-slate-400">검색 결과 없음</div>'; return; }
    let h = '';
    if (tasks.length) h += '<div class="px-4 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">업무</div>'+tasks.map(t => `<button onclick="closeCmdSearch();openDetail('${t.id}')" class="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-left"><span class="w-1.5 h-1.5 rounded-full st-bg-${t.status}"></span><span class="flex-1 truncate text-[13px]">${escapeHtml(t.title)}</span><span class="text-[10px] text-slate-400">${getUser(t.from).name}</span></button>`).join('');
    if (memos.length) h += '<div class="px-4 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">메모</div>'+memos.map(m => `<button onclick="closeCmdSearch();state.view='memo';render()" class="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-left"><i class="ph${m.pinned?'-fill':''} ph-${m.pinned?'push-pin text-amber-500':'note text-slate-400'}"></i><span class="flex-1 truncate text-[13px]">${escapeHtml(m.title)}</span></button>`).join('');
    if (q && people.length) h += '<div class="px-4 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">사람</div>'+people.map(p => `<button onclick="closeCmdSearch();switchUser('${p.id}')" class="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-left"><span class="av av-${p.role} w-5 h-5 text-[9px]">${initial(p.name)}</span><span class="flex-1 text-[13px]">${p.name}</span><span class="text-[10px] text-slate-400">${p.role}</span></button>`).join('');
    c.innerHTML = h;
}

// ════════════════════════════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════════════════════════════
function showModal(id) { document.getElementById(id+'-overlay').classList.remove('hidden'); document.getElementById(id).classList.remove('hidden'); }
function hideModal(id) { document.getElementById(id+'-overlay').classList.add('hidden'); document.getElementById(id).classList.add('hidden'); }
function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function timeAgo(ts) { const d = Date.now()-ts; if (d<60000) return '방금'; if (d<3600000) return Math.floor(d/60000)+'분 전'; if (d<86400000) return Math.floor(d/3600000)+'시간 전'; if (d<604800000) return Math.floor(d/86400000)+'일 전'; return new Date(ts).toLocaleDateString('ko-KR',{month:'short',day:'numeric'}); }
function formatDateAbs(ts) { const d = new Date(ts); const wk = ['일','월','화','수','목','금','토'][d.getDay()]; return `${d.getMonth()+1}월 ${d.getDate()}일 (${wk}) ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function formatDue(dueStr) {
    if (!dueStr) return { text:'미정', short:'미정', cls:'bg-slate-50 text-slate-400 border-slate-200', icon:'ph-calendar-x', urgent:false };
    const today = new Date(TODAY);
    const due = new Date(dueStr);
    const diff = Math.round((due - today) / 86400000);
    const wk = ['일','월','화','수','목','금','토'][due.getDay()];
    const md = `${due.getMonth()+1}.${String(due.getDate()).padStart(2,'0')}`;
    const dCode = diff < 0 ? `D+${Math.abs(diff)}` : `D-${diff}`;
    if (diff < 0)  return { text:`${dCode} 지연`,         short:dCode,    fullText:`${md} (${wk}) · ${dCode} 지연`,    cls:'bg-red-50 text-red-700 border-red-200',    icon:'ph-warning-circle', urgent:true,  diff };
    if (diff === 0) return { text:`오늘 D-0`,             short:'오늘',   fullText:`오늘 (${wk}) · D-0`,                cls:'bg-amber-50 text-amber-700 border-amber-200', icon:'ph-clock-clockwise', urgent:true, diff };
    if (diff === 1) return { text:`내일 D-1`,             short:'내일',   fullText:`내일 (${wk}) · D-1 · ${md}`,         cls:'bg-blue-50 text-blue-700 border-blue-200', icon:'ph-clock',          urgent:false, diff };
    if (diff <= 7)  return { text:`${wk}요일 ${dCode}`,    short:dCode,    fullText:`${md} ${wk}요일 · ${dCode}`,         cls:'bg-slate-100 text-slate-700 border-slate-200', icon:'ph-calendar',   urgent:false, diff };
    if (diff <= 30) return { text:dCode,                  short:dCode,    fullText:`${md} (${wk}) · ${dCode}`,           cls:'bg-slate-50 text-slate-600 border-slate-200',  icon:'ph-calendar-dots', urgent:false, diff };
    return                { text:dCode,                   short:dCode,    fullText:`${due.getFullYear()}.${md} (${wk}) · ${dCode}`, cls:'bg-slate-50 text-slate-500 border-slate-200', icon:'ph-calendar-blank', urgent:false, diff };
}
let _ttim;
function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.remove('hidden'); t.classList.add('toast-in'); clearTimeout(_ttim); _ttim = setTimeout(()=>{t.classList.add('hidden');t.classList.remove('toast-in');},1800); }

// ════════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    loadState(); render(); renderUserMenu(); applySidebarCollapse();

    // Channel buttons
    document.querySelectorAll('.ch-btn').forEach(b => b.addEventListener('click', () => { state.channel = b.dataset.channel; render(); }));
    // View tabs
    document.querySelectorAll('.vbtn').forEach(b => b.addEventListener('click', () => { state.view = b.dataset.view; render(); }));
    // Pri filter
    document.getElementById('pri-filter').addEventListener('change', e => { state.priFilter = e.target.value; render(); });
    // Modal pri buttons
    document.querySelectorAll('.prib').forEach(b => b.addEventListener('click', () => setPri(b.dataset.pri)));
    document.querySelectorAll('.visb').forEach(b => b.addEventListener('click', () => setMemoVis(b.dataset.vis)));
    document.querySelectorAll('.sevb').forEach(b => b.addEventListener('click', () => setSev(b.dataset.sev)));
    document.querySelectorAll('.pjtb').forEach(b => b.addEventListener('click', () => setProjectType(b.dataset.pjt)));

    // Drawer wiring: shared drawer.js handles overlay/close + provides window.tDrawer.
    // Workdeck still binds the hamburger itself for dual desktop/mobile behavior.
    const hBtn = document.getElementById('hamburger-btn');
    if (hBtn) {
        hBtn.addEventListener('click', () => {
            if (window.matchMedia('(min-width: 1024px)').matches) toggleSidebar();
            else if (typeof window.tDrawer === 'function') window.tDrawer(true);
        });
    }

    // User menu
    document.getElementById('user-btn').addEventListener('click', e => { e.stopPropagation(); renderUserMenu(); document.getElementById('user-menu').classList.toggle('hidden'); });
    document.addEventListener('click', e => {
        document.getElementById('user-menu').classList.add('hidden');
        const picker = document.getElementById('status-picker');
        if (picker && !picker.classList.contains('hidden') && !picker.contains(e.target)) closeStatusPicker();
        const dp = document.getElementById('date-picker');
        if (dp && !dp.classList.contains('hidden') && !dp.contains(e.target) && !e.target.classList?.contains('dp-trigger')) closeDatePicker();
    });

    // Leave toggle
    document.getElementById('leave-toggle').addEventListener('click', toggleLeave);

    // Modal/drawer overlays close
    document.getElementById('task-modal-overlay').addEventListener('click', closeTaskModal);
    document.getElementById('memo-modal-overlay').addEventListener('click', closeMemoModal);
    document.getElementById('notice-modal-overlay').addEventListener('click', closeNoticeModal);
    document.getElementById('detail-overlay').addEventListener('click', closeDetail);
    document.getElementById('cmd-overlay').addEventListener('click', closeCmdSearch);

    // Cmd palette input
    document.getElementById('cmd-input').addEventListener('input', e => renderCmd(e.target.value));

    // Keyboard
    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCmdSearch(); }
        else if (e.key === 'Escape') { closeCmdSearch(); closeTaskModal(); closeMemoModal(); closeNoticeModal(); closeDetail(); closeStatusPicker(); closeDatePicker(); closeProjectModal(); closeMilestoneModal(); closeLeaveModal(); closeKpiPeek(); closePeek(); }
        else if (e.key === 'n' && !e.target.closest('input,textarea,[contenteditable]') && !e.metaKey && !e.ctrlKey) {
            if (me().role !== '직원') { e.preventDefault(); openTaskModal(); }
        }
    });
});
