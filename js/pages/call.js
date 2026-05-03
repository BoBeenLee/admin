/**
 * Call (신규 회신) page logic.
 * Extracted from inline <script> block in call.html (lines 904-3008).
 */
const EMP_KEY = 'hanam_emp_names_v3';
const SOURCES = [
  {id:'kakao', label:'카카오', cls:'border-amber-100 bg-amber-50 text-amber-700', color:'#FBBF24'},
  {id:'naver', label:'네이버', cls:'border-emerald-100 bg-emerald-50 text-emerald-700', color:'#22C55E'},
  {id:'insta', label:'인스타', cls:'border-purple-100 bg-purple-50 text-purple-700', color:'#D946EF'},
  {id:'sns', label:'SNS광고', cls:'border-blue-100 bg-blue-50 text-blue-700', color:'#3B82F6'},
  {id:'referral', label:'지인소개', cls:'border-slate-200 bg-slate-50 text-slate-700', color:'#94A3B8'}
];

let employees = JSON.parse(localStorage.getItem(EMP_KEY)) || Array.from({length:16}, (_,i)=>({key:String.fromCharCode(65+i), name:`직원${i+1}`}));
let applicants = [];
let callLogs = {};
let visitData = {};
let currentPeriod = '1w';
let historyPeriod = '1w';
let historyCustomFrom = null;
let historyCustomTo = null;
let boardPeriod = '1w';
let boardCustomFrom = null;
let boardCustomTo = null;

const TIME_KEY = 'hanam_quick_times_v1';
let quickTimes = JSON.parse(localStorage.getItem(TIME_KEY)) || ['오전 11시', '오후 12시', '오후 1시', '오후 3시', '오후 5시', '오후 7시', '오후 8시 30분'];
function saveTimes() { localStorage.setItem(TIME_KEY, JSON.stringify(quickTimes)); }


function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2000); }
function fmtDT(d){ if(!d) return '-'; const date=new Date(d); return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`; }
function fmtMin(m){ if(m==='-'||m==null) return '-'; m=Math.round(m); if(m<60) return `${m}분`; const h=Math.floor(m/60); const r=m%60; return r>0?`${h}시간 ${r}분`:`${h}시간`; }
function maskPhone(p){ return p.replace(/(\d{3})-(\d{4})-(\d{4})/, "$1-****-$3"); }
function togglePanel(id, iconId){
  const p = document.getElementById(id);
  const ic = document.getElementById(iconId);
  const isOpen = p.classList.toggle('open');
  ic.style.transform = isOpen ? 'rotate(180deg)' : '';
  if(isOpen && id==='board-panel') renderBoard();
}

function renderList() {
  const container = document.getElementById('app-list');
  const empty = document.getElementById('empty-state');
  const fa = filtered();
  
  // Split: Active vs Archived
  const activeList = fa.filter(a => !visitData[a.id]?.scheduled && !a.comment?.includes('전화상 안함') && !a.comment?.includes('최후 통첩'));
  const archivedList = fa.filter(a => !visitData[a.id]?.scheduled && (a.comment?.includes('전화상 안함') || a.comment?.includes('최후 통첩')));

  if (activeList.length === 0) { 
    container.innerHTML = ''; 
    empty.classList.remove('hidden'); 
  } else {
    empty.classList.add('hidden');
    container.innerHTML = '';
    activeList.forEach((a) => {
      const logs = callLogs[a.id] || [];
      const vd = visitData[a.id];
      const hasVisit = vd?.scheduled;
      const tr = document.createElement('tr');
      
      // 회신 기록이 있을 경우 행 전체 배경을 초록색으로 변경 (채도 강화)
      if (logs.length > 0) {
        tr.classList.add('bg-emerald-100/70');
      }
      
      tr.innerHTML = `
        <td class="pl-6">
          <div class="id-text">#${a.id.slice(-7)}</div>
          ${getDupCount(a.phone) >= 2 ? `<span class="dup-badge mt-1" onclick="event.stopPropagation();openDupModal('${a.phone}')"><i class="ph-bold ph-copy text-[8px]"></i>중복 ${getDupCount(a.phone)}</span>` : ''}
        </td>
        <td><div class="flex items-center gap-1.5"><span class="name-text">${a.name}</span><button onclick="editName('${a.id}')" class="text-slate-300 hover:text-brand-500 transition-colors"><i class="ph ph-pencil-simple-line"></i></button></div></td>
        <td>
          <div class="mb-1 flex items-center gap-2">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Total Result</span>
            <span class="bg-brand-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                ${logs.length > 0 ? `${logs[logs.length-1].key}${logs.length}` : '0'}
            </span>
          </div>
          <div class="flex gap-1 mb-1"><input type="text" class="memo-input" placeholder="메모 입력" id="memo-${a.id}" value="${a.memo||''}"><button onclick="saveMemo('${a.id}')" class="btn-quick bg-slate-800 text-white border-slate-800 px-2 py-0.5">저장</button></div>
        </td>
        <td>
          <div class="font-bold text-[12px] text-slate-700 font-mono">${a.revealed ? a.phone : maskPhone(a.phone)}</div>
        </td>
        <td><div class="alpha-grid-compact">${employees.map(emp => { return `<div class="alpha-btn-compact active:bg-slate-300" onclick="toggleCall('${a.id}','${emp.key}')">${emp.key}</div>`; }).join('')}</div></td>
        <td>
          <div class="mb-1">
            <select class="memo-input text-[10px]" onchange="if(this.value) setResult('${a.id}', this.value); this.value='';">
              <option value="">[전화상 안함 결과]</option>
              <option value="없는 번호">없는 번호</option>
              <option value="타 지역 거주">타 지역 거주</option>
              <option value="잘못누름/관심없음/바로끊음">잘못/무관심/바로끊음</option>
              <option value="직접 컨택 희망 (고민)">직접 컨택 희망 (고민)</option>
              <option value="당분간 참여 어려움">당분간 참여 어려움</option>
              <option value="미성년자">미성년자</option>
              <option value="기존 멤버">기존 멤버</option>
              <option value="나이 (80대 이상)">나이 (80대 이상)</option>
              <option value="기타(사유입력)">기타 - 사유입력</option>
            </select>
          </div>

          <div class="flex gap-1">
            <button onclick="setResult('${a.id}', '최후 통첩')" class="btn-quick flex-1 text-red-600 border-red-200 bg-red-50/50 py-1 font-bold text-[8px]">최후 통첩</button>
          </div>
        </td>
        <td>
          <div onclick="openPicker('${a.id}')" class="cursor-pointer bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 mb-1.5 text-[11px] font-mono text-slate-700 flex items-center justify-between hover:border-brand-300 transition-colors">
            <span>${hasVisit ? vd.datetime.split('T')[0] : new Date().toISOString().split('T')[0]}</span>
            <i class="ph ph-calendar-blank text-slate-400"></i>
          </div>
          <div class="flex gap-1">
            <button onclick="openPicker('${a.id}')" class="btn-quick btn-primary flex-1 py-1 text-[8px]">달력</button>
            <button onclick="toast('문자 발송')" class="btn-quick flex-1 py-1 text-[8px]">문자</button>
            <button onclick="toast('달력/문자 통합 실행')" class="btn-quick flex-1 py-1 text-[8px] bg-brand-50 text-brand-700 border-brand-100">달력/문자</button>
          </div>
        </td>
        <td>
          <span class="time-box font-bold text-slate-600 text-[9px]">${fmtDT(a.time)}</span>
          <span class="time-box mt-0.5 text-[9px] text-brand-600 font-bold">${logs.length > 0 ? fmtDT(logs[logs.length-1].time) : '-'}</span>
        </td>
        <td class="pr-6">
          <div class="flex flex-col gap-1">
            <div class="pill-src border ${a.sourceCls} self-start" style="padding:0 4px; font-size:8px;">${a.sourceLabel}</div>
            <div class="text-[10px] text-slate-500 leading-tight line-clamp-2">${a.details}</div>
          </div>
        </td>`;
      container.appendChild(tr);
    });
  }
  
  renderHistoryFiltered();
  renderArchivedList(archivedList);
  updateTabBadges();
}

function renderHistoryFiltered() {
  const list = filteredHistory();
  const tbody = document.getElementById('history-tbody');
  const empty = document.getElementById('history-empty');
  const countEl = document.getElementById('history-result-count');
  tbody.innerHTML = '';

  const displayList = list;

  if (countEl) countEl.textContent = `${displayList.length}명`;

  if (displayList.length === 0) {
    empty.classList.remove('hidden');
    return;
  } else {
    empty.classList.add('hidden');
  }

  displayList.forEach(a => {
    const vd = visitData[a.id];
    const isScheduled = !!vd?.scheduled;
    const isNocall = a.comment?.includes('전화상 안함');
    const isUltimatum = a.comment?.includes('최후 통첩');
    const logs = callLogs[a.id] || [];
    // Result tag
    let resultTag = '';
    if (isScheduled) resultTag = '<span class="status-tag tag-emerald">예약확정</span>';
    else if (isUltimatum) resultTag = '<span class="status-tag" style="background:#fff7ed;border-color:#fed7aa;color:#c2410c;">최후 통첩</span>';
    else if (isNocall) resultTag = '<span class="status-tag" style="background:#f1f5f9;border-color:#e2e8f0;color:#64748b;">전화상 안함</span>';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition-colors';
    tr.innerHTML = `
      <td class="px-4 py-3">
        <div class="font-bold text-slate-800">${a.name}</div>
        <div class="text-[9px] text-slate-400 font-mono">#${a.id.slice(-7)}</div>
      </td>
      <td class="px-4 py-3">
        <div class="font-bold text-[12px] text-slate-700 font-mono">${a.phone}</div>
      </td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          ${resultTag}
          <span class="text-[9px] font-black text-slate-400">${logs.length > 0 ? `${logs[logs.length-1].key}${logs.length}` : ''}</span>
        </div>
      </td>
      <td class="px-4 py-3">
        <div class="text-[11px] text-slate-500 max-w-[200px] truncate" title="${a.memo||''}">${a.memo || '-'}</div>
      </td>
      <td class="px-4 py-3">
        <div class="flex flex-col gap-1">
          <span class="pill-src border ${a.sourceCls} self-start" style="padding:0 4px;font-size:9px;">${a.sourceLabel}</span>
          <div class="text-[9px] text-slate-400 leading-tight line-clamp-1">${a.details || ''}</div>
        </div>
      </td>
      <td class="px-4 py-3">
        <div class="text-[10px] font-bold text-brand-600">
          ${isScheduled ? `<i class="ph ph-calendar-check mr-1"></i>${vd.datetime.replace('T',' ')}` : '-'}
        </div>
        ${vd?.lang ? `<span class="text-[9px] font-bold mt-0.5 inline-block px-1.5 py-0.5 rounded ${vd.lang==='영어'?'bg-purple-50 text-purple-600 border border-purple-200':vd.lang==='일본어'?'bg-blue-50 text-blue-600 border border-blue-200':'bg-slate-100 text-slate-600 border border-slate-200'}">${vd.lang}</span>` : ''}
      </td>
      <td class="px-4 py-3 text-center">
        <button onclick="restoreApplicant('${a.id}')" class="p-1.5 text-slate-400 hover:text-brand-500 transition-colors" title="목록으로 복원">
          <i class="ph-bold ph-arrow-u-up-left text-base"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── 전화상 안함 / 최후 통첩 결과별 색상 설정 ──
const REASON_CONFIG = [
  { key: '없는 번호',                    color: '#64748b', bg: '#f1f5f9', text: '#475569' },
  { key: '타 지역 거주',                   color: '#0ea5e9', bg: '#e0f2fe', text: '#0369a1' },
  { key: '잘못누름/관심없음/바로끝음', color: '#a855f7', bg: '#f3e8ff', text: '#7e22ce' },
  { key: '직접 콜탁 희망 (\uace0\ubbfc)',   color: '#f59e0b', bg: '#fffbeb', text: '#b45309' },
  { key: '당분간 참여 어려움',         color: '#f97316', bg: '#fff7ed', text: '#c2410c' },
  { key: '미성년자',                    color: '#ec4899', bg: '#fdf2f8', text: '#be185d' },
  { key: '기존 멤버',                    color: '#10b981', bg: '#ecfdf5', text: '#065f46' },
  { key: '나이 (80\ub300 \uc774\uc0c1)',          color: '#6366f1', bg: '#eef2ff', text: '#4338ca' },
  { key: '기타',                           color: '#94a3b8', bg: '#f8fafc', text: '#64748b' },
  // 최후 통첩 전용
  { key: '최후 통첩',                    color: '#ef4444', bg: '#fef2f2', text: '#b91c1c' },
];

function getReasonConfig(key) {
  return REASON_CONFIG.find(r => r.key === key) || REASON_CONFIG[REASON_CONFIG.length - 3]; // 기타
}

function renderArchivedList(list) {
  const noCallList     = list.filter(a => a.comment?.includes('전화상 안함'));
  const ultimatumList  = list.filter(a => !a.comment?.includes('전화상 안함') && a.comment?.includes('최후 통첩'));
  const total = list.length;

  // ── 전화상 안함 Bar Chart ──
  const noCallCount = document.getElementById('nocall-count');
  const noCallChart = document.getElementById('nocall-chart');
  const noCallEmpty = document.getElementById('nocall-empty');
  noCallCount.textContent = `${noCallList.length}명`;
  noCallChart.innerHTML = '';

  if (noCallList.length === 0) {
    noCallEmpty.classList.remove('hidden');
  } else {
    noCallEmpty.classList.add('hidden');

    const NO_CALL_REASONS = ['없는 번호', '타 지역 거주', '잘못누름/관심없음/바로끝음', '직접 콜탁 희망 (고민)', '당분간 참여 어려움', '미성년자', '기존 멤버', '나이 (80대 이상)'];
    const groups = {};
    noCallList.forEach(a => {
      let reason = '기타';
      for (const lbl of NO_CALL_REASONS) { if (a.comment?.includes(lbl)) { reason = lbl; break; } }
      if (!groups[reason]) groups[reason] = [];
      groups[reason].push(a);
    });

    const maxCount = Math.max(...Object.values(groups).map(p => p.length), 1);
    Object.entries(groups).sort((a,b) => b[1].length - a[1].length).forEach(([reason, people]) => {
      const cfg = getReasonConfig(reason);
      const pct = Math.round(people.length / noCallList.length * 100);
      const rowId = 'nc_' + reason.replace(/[^a-z0-9]/gi,'_');
      const nameList = people.map(p => {
        const logs = callLogs[p.id] || [];
        return `
        <div class="px-3 py-1.5 hover:bg-white transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-20 flex-shrink-0">
              <div class="text-[10px] font-black text-slate-700 truncate">${p.name}</div>
              <div class="text-[9px] text-slate-400 font-mono tracking-tighter">${p.phone || '-'}</div>
            </div>
            <div class="w-32 flex-shrink-0 overflow-hidden">
              <div class="flex items-center gap-1.5">
                <span class="text-[8px] font-black border ${p.sourceCls||'border-slate-200 text-slate-400'} px-1.5 rounded-full scale-90 origin-left">${p.sourceLabel||'-'}</span>
                <span class="text-[8px] text-slate-400 whitespace-nowrap">${fmtDT(p.time).split(' ')[1]}</span>
              </div>
            </div>
            <div class="flex-1 min-w-0 text-[9px] text-slate-500 truncate italic">
              ${p.memo || ''}
            </div>
            <button onclick="restoreApplicant('${p.id}')" class="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-brand-500 transition-all scale-75" title="복원">
              <i class="ph-bold ph-arrow-u-up-left"></i>
            </button>
          </div>
        </div>`;
      }).join('');

      const div = document.createElement('div');
      div.innerHTML = `
        <div class="rounded-lg overflow-hidden mb-1" style="border:1px solid ${cfg.color}15">
          <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/80 transition-all border-b border-white/50" style="background:${cfg.bg}80">
            <span class="text-[10px] font-black min-w-[120px]" style="color:${cfg.text}">${reason}</span>
            <div class="flex-1 h-1.5 rounded-full bg-white/60 overflow-hidden shadow-inner">
              <div class="h-full rounded-full transition-all duration-700" style="width:${pct}%;background:${cfg.color}"></div>
            </div>
            <span class="text-[10px] font-black ml-2" style="color:${cfg.color}">${people.length}</span>
            <i class="ph ph-caret-down text-[10px] ml-1 opacity-40"></i>
          </button>
          <div class="hidden bg-slate-50/50 divide-y divide-slate-100/50">${nameList}</div>
        </div>`;
      noCallChart.appendChild(div);
    });
  }

  // ── 최후 통첩 Bar Chart ──
  const ultiCount = document.getElementById('ultimatum-count');
  const ultiChart = document.getElementById('ultimatum-chart');
  const ultiEmpty = document.getElementById('ultimatum-empty');
  ultiCount.textContent = `${ultimatumList.length}명`;
  ultiChart.innerHTML = '';

  if (ultimatumList.length === 0) {
    ultiEmpty.classList.remove('hidden');
  } else {
    ultiEmpty.classList.add('hidden');
    const ULTI_REASONS = ['최후 통첩'];
    const groups = {};
    ultimatumList.forEach(a => {
      const reason = '최후 통첩';
      if (!groups[reason]) groups[reason] = [];
      groups[reason].push(a);
    });

    Object.entries(groups).forEach(([reason, people]) => {
      const cfg = getReasonConfig(reason);
      const pct = Math.round(people.length / ultimatumList.length * 100);
      const nameList = people.map(p => {
        const logs = callLogs[p.id] || [];
        return `
        <div class="px-3 py-1.5 hover:bg-white transition-colors group">
          <div class="flex items-center gap-3">
            <div class="w-20 flex-shrink-0">
              <div class="text-[10px] font-black text-slate-700 truncate">${p.name}</div>
              <div class="text-[9px] text-slate-400 font-mono tracking-tighter">${p.phone || '-'}</div>
            </div>
            <div class="w-32 flex-shrink-0 overflow-hidden">
              <div class="flex items-center gap-1.5">
                <span class="text-[8px] font-black border ${p.sourceCls||'border-slate-200 text-slate-400'} px-1.5 rounded-full scale-90 origin-left">${p.sourceLabel||'-'}</span>
                <span class="text-[8px] text-slate-400 whitespace-nowrap">${fmtDT(p.time).split(' ')[1]}</span>
              </div>
            </div>
            <div class="flex-1 min-w-0 text-[9px] text-slate-500 truncate italic">
              ${p.memo || ''}
            </div>
            <button onclick="restoreApplicant('${p.id}')" class="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-brand-500 transition-all scale-75" title="복원">
              <i class="ph-bold ph-arrow-u-up-left"></i>
            </button>
          </div>
        </div>`;
      }).join('');

      const div = document.createElement('div');
      div.innerHTML = `
        <div class="rounded-lg overflow-hidden mb-1" style="border:1px solid ${cfg.color}15">
          <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/80 transition-all border-b border-white/50" style="background:${cfg.bg}80">
            <span class="text-[10px] font-black min-w-[120px]" style="color:${cfg.text}">${reason}</span>
            <div class="flex-1 h-1.5 rounded-full bg-white/60 overflow-hidden shadow-inner">
              <div class="h-full rounded-full transition-all duration-700" style="width:${pct}%;background:${cfg.color}"></div>
            </div>
            <span class="text-[10px] font-black ml-2" style="color:${cfg.color}">${people.length}</span>
            <i class="ph ph-caret-down text-[10px] ml-1 opacity-40"></i>
          </button>
          <div class="hidden bg-slate-50/50 divide-y divide-slate-100/50">${nameList}</div>
        </div>`;
      ultiChart.appendChild(div);
    });
  }
}

function restoreApplicant(id) {
  const a = applicants.find(x=>x.id===id);
  if(a) {
    delete visitData[id];
    // Remove History-triggering keywords
    a.comment = a.comment.replace(/전화상 안함|최후 통첩/g, '').replace(/ \| \s*$/, '').trim();
    if(a.comment.startsWith('|')) a.comment = a.comment.substring(1).trim();
    a.updatedAt = new Date();
    toast('✅ 지원자가 메인 목록으로 복원되었습니다');
    renderList();
    if(_activeMainTab==='board') renderBoard();
  }
}

function toggleHistory() {
  // Legacy — now handled by togglePanel('history-panel', 'history-icon')
  togglePanel('history-panel', 'history-icon');
}

function startEmpEdit(el) {
  el.contentEditable = true;
  el.focus();
  // Select all text
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  el.onblur = () => finishEmpEdit(el);
  el.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); el.blur(); } if (e.key === 'Escape') { el.blur(); } };
}

function finishEmpEdit(el) {
  el.contentEditable = false;
  const key = el.dataset.empKey;
  const newName = el.textContent.trim();
  if (!newName) { el.textContent = employees.find(e => e.key === key)?.name || key; return; }
  const emp = employees.find(e => e.key === key);
  if (emp && emp.name !== newName) {
    emp.name = newName;
    localStorage.setItem(EMP_KEY, JSON.stringify(employees));
    toast(`${key} → ${newName} 저장`);
  }
}

function renderBoard(){
  const fa = filtered();
  const total = fa.length;
  const replied = fa.filter(a=>(callLogs[a.id]||[]).length>0).length;
  const visited = fa.filter(a=>visitData[a.id]?.scheduled).length;
  document.getElementById('b-total').textContent = total;
  document.getElementById('b-rate').textContent = (total>0?Math.round(replied/total*100):0) + '%';
  document.getElementById('b-success').textContent = (replied>0?Math.round(visited/replied*100):0) + '%';
  const hours = Array.from({length:14}, (_,i)=>i+9);
  const hourApp={}; const hourRep={}; const hourSuc={};
  hours.forEach(h=>{ hourApp[h]=0; hourRep[h]=0; hourSuc[h]=0; });
  
  let totalReplyTime = 0;
  let replyCount = 0;
  let successes = 0;

  fa.forEach(a=>{ 
    const h=new Date(a.time).getHours(); 
    if(hourApp[h]!==undefined) hourApp[h]++; 

    const logs = callLogs[a.id] || [];
    if(logs.length > 0) {
      if(hourRep[h]!==undefined) hourRep[h]++;
      const firstReply = new Date(logs[0].time);
      const applicationTime = new Date(a.time);
      const diffMin = Math.max(0, (firstReply - applicationTime) / (1000 * 60));
      totalReplyTime += diffMin;
      replyCount++;
    }

    if(visitData[a.id]?.scheduled) {
      successes++;
      if(hourSuc[h]!==undefined) hourSuc[h]++;
    }
  });

  const svg = document.getElementById('line-chart-svg');
  const W=480, H=100, pad=10;
  const max = Math.max(1, ...Object.values(hourApp));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  
  const getX = (i) => pad+i*((W-2*pad)/(hours.length-1));
  const getY = (v) => H-pad-(v/max)*(H-2*pad);
  const getPts = (data) => hours.map((h,i)=>`${getX(i)},${getY(data[h])}`).join(' ');

  // Lines
  let svgContent = `
    <polyline points="${getPts(hourApp)}" fill="none" stroke="#0ea5e9" stroke-width="2" />
    <polyline points="${getPts(hourRep)}" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2 2" />
    <polyline points="${getPts(hourSuc)}" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2 2" />
  `;
  // Data points + labels
  hours.forEach((h,i) => {
    const x = getX(i);
    if (hourApp[h] > 0) {
      svgContent += `<circle cx="${x}" cy="${getY(hourApp[h])}" r="3" fill="#0ea5e9"/>`;
      svgContent += `<text x="${x}" y="${getY(hourApp[h])-6}" text-anchor="middle" font-size="8" font-weight="800" fill="#0ea5e9">${hourApp[h]}</text>`;
    }
    if (hourRep[h] > 0) {
      svgContent += `<circle cx="${x}" cy="${getY(hourRep[h])}" r="2.5" fill="#10b981"/>`;
      svgContent += `<text x="${x+10}" y="${getY(hourRep[h])+3}" text-anchor="start" font-size="7" font-weight="800" fill="#10b981">${hourRep[h]}</text>`;
    }
    if (hourSuc[h] > 0) {
      svgContent += `<circle cx="${x}" cy="${getY(hourSuc[h])}" r="2.5" fill="#f59e0b"/>`;
      svgContent += `<text x="${x-10}" y="${getY(hourSuc[h])+3}" text-anchor="end" font-size="7" font-weight="800" fill="#f59e0b">${hourSuc[h]}</text>`;
    }
  });
  svg.innerHTML = svgContent;
  
  const labelWrap = document.getElementById('line-chart-labels');
  labelWrap.innerHTML = hours.filter((_,i)=>i%2===0).map(h=>`<span>${h}H</span>`).join('');

  // Peak Hour & Distribution
  let peakH = hours[0];
  let maxV = 0;
  hours.forEach(h => { if(hourApp[h] > maxV) { maxV = hourApp[h]; peakH = h; } });
  
  document.getElementById('insight-peak-hour').textContent = `${peakH}시`;
  document.getElementById('insight-peak-pct').textContent = `${total > 0 ? Math.round((maxV/total)*100) : 0}%`;
  
  // Reply Efficiency
  const avgReply = replyCount > 0 ? Math.round(totalReplyTime / replyCount) : '-';
  document.getElementById('insight-avg-reply').textContent = fmtMin(avgReply);
  document.getElementById('insight-success-rate').textContent = Math.round((successes / (total || 1)) * 100);

  // Store current chart metadata for detail filtering
  window._lastPeakHour = peakH;
  window._lastSuccesses = fa.filter(a => visitData[a.id]?.scheduled);
  window._lastReplied = fa.filter(a => (callLogs[a.id]||[]).length > 0);
  window._lastTotal = fa;

  // ── 유입 경로 분석: 두 패널 공통 데이터/정렬 ──
  // 정렬 기준은 select 값에 따라 결정 (지원자/성공률, 오름/내림). 두 패널이 동일 순서로 렌더링되어 비교 용이.
  const sortSel = document.getElementById('b-source-sort');
  const sortVal = (sortSel?.value) || 'count-desc';
  const sourceRows = SOURCES.map((s, idx) => {
    const apps = fa.filter(a => a.source === s.id);
    const cnt = apps.length;
    const rep = apps.filter(a => (callLogs[a.id] || []).length > 0).length;
    const rate = cnt > 0 ? Math.round((rep / cnt) * 100) : 0;
    const sharePct = total > 0 ? Math.round(cnt / total * 100) : 0;
    return { s, cnt, rep, rate, sharePct, defaultIdx: idx };
  }).filter(r => r.cnt > 0);

  switch (sortVal) {
    case 'count-asc':  sourceRows.sort((a,b) => a.cnt - b.cnt); break;
    case 'rate-desc':  sourceRows.sort((a,b) => b.rate - a.rate || b.cnt - a.cnt); break;
    case 'rate-asc':   sourceRows.sort((a,b) => a.rate - b.rate || a.cnt - b.cnt); break;
    case 'default':    sourceRows.sort((a,b) => a.defaultIdx - b.defaultIdx); break;
    case 'count-desc':
    default:           sourceRows.sort((a,b) => b.cnt - a.cnt); break;
  }

  const srcWrap = document.getElementById('b-source-wrap'); srcWrap.innerHTML = '';
  if (sourceRows.length === 0) {
    srcWrap.innerHTML = `<div class="text-[10px] text-slate-300 italic text-center py-3">데이터가 없습니다</div>`;
  } else {
    sourceRows.forEach(({ s, cnt, sharePct }) => {
      srcWrap.innerHTML += `<div class="flex items-center gap-2"><span class="pill-src border ${s.cls} min-w-[70px] text-center">${s.label}</span><div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-700" style="background:${s.color};width:${sharePct}%"></div></div><span class="text-[10px] font-black text-slate-500 w-5 text-right">${cnt}</span><span class="text-[9px] font-bold text-slate-400 w-8 text-right">${sharePct}%</span></div>`;
    });
  }

  // 유입 경로별 회신 성공률
  const succWrap = document.getElementById('b-source-success-wrap');
  if (succWrap) {
    succWrap.innerHTML = '';
    if (sourceRows.length === 0) {
      succWrap.innerHTML = `<div class="text-[10px] text-slate-300 italic text-center py-3">데이터가 없습니다</div>`;
    } else {
      sourceRows.forEach(({ s, cnt, rep, rate }) => {
        const rateColor = rate >= 70 ? 'text-emerald-600' : rate >= 40 ? 'text-amber-600' : 'text-red-500';
        succWrap.innerHTML += `<div class="flex items-center gap-2"><span class="pill-src border ${s.cls} min-w-[70px] text-center">${s.label}</span><div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-700" style="background:${s.color};width:${rate}%"></div></div><span class="text-[10px] font-black text-slate-500 w-12 text-right tabular-nums">${rep}/${cnt}</span><span class="text-[10px] font-black ${rateColor} w-9 text-right tabular-nums">${rate}%</span></div>`;
      });
    }
    const overallEl = document.getElementById('b-source-success-overall');
    if (overallEl) {
      const totalRate = total > 0 ? Math.round((replied / total) * 100) : 0;
      overallEl.textContent = `전체 ${totalRate}%`;
    }
  }

  // 유입 경로별 방문율
  const visitWrap = document.getElementById('b-source-visit-wrap');
  if (visitWrap) {
    visitWrap.innerHTML = '';
    const totalVisited = fa.filter(a => visitData[a.id]?.scheduled).length;
    const maxVisitRate = Math.max(...sourceRows.map(r => {
      const apps = fa.filter(a => a.source === r.s.id);
      return apps.length > 0 ? apps.filter(a => visitData[a.id]?.scheduled).length / apps.length * 100 : 0;
    }), 1);
    if (sourceRows.length === 0) {
      visitWrap.innerHTML = `<div class="text-[10px] text-slate-300 italic text-center py-3">데이터가 없습니다</div>`;
    } else {
      sourceRows.forEach(({ s, cnt }) => {
        const apps = fa.filter(a => a.source === s.id);
        const vis = apps.filter(a => visitData[a.id]?.scheduled).length;
        const vrate = cnt > 0 ? Math.round(vis / cnt * 100) : 0;
        const vrateColor = vrate >= 50 ? 'text-brand-600' : vrate >= 25 ? 'text-amber-600' : 'text-slate-400';
        visitWrap.innerHTML += `<div class="flex items-center gap-2"><span class="pill-src border ${s.cls} min-w-[70px] text-center">${s.label}</span><div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-700" style="background:${s.color};width:${vrate}%"></div></div><span class="text-[10px] font-black text-slate-500 w-10 text-right tabular-nums">${vis}/${cnt}</span><span class="text-[10px] font-black ${vrateColor} w-9 text-right tabular-nums">${vrate}%</span></div>`;
      });
    }
    const visitOverallEl = document.getElementById('b-source-visit-overall');
    if (visitOverallEl) {
      const overallVrate = total > 0 ? Math.round(totalVisited / total * 100) : 0;
      visitOverallEl.textContent = `전체 ${overallVrate}%`;
    }
  }

  // 유입 경로별 매출
  const revenueWrap = document.getElementById('b-source-revenue-wrap');
  if (revenueWrap) {
    revenueWrap.innerHTML = '';
    const fmtM = n => '₩' + n.toLocaleString('ko-KR');
    const srcRevRows = sourceRows.map(r => {
      const apps = fa.filter(a => a.source === r.s.id);
      const enrolled = apps.filter(a => (visitData[a.id]?.amount || 0) > 0);
      const rev = enrolled.reduce((s, a) => s + (visitData[a.id]?.amount || 0), 0);
      const avg = enrolled.length > 0 ? Math.round(rev / enrolled.length) : 0;
      return { ...r, rev, enrolled: enrolled.length, avg };
    }).sort((a, b) => b.rev - a.rev);
    const maxRev = Math.max(...srcRevRows.map(r => r.rev), 1);
    const totalRev = srcRevRows.reduce((s, r) => s + r.rev, 0);
    const totalEnrolled = srcRevRows.reduce((s, r) => s + r.enrolled, 0);
    const totalAvg = totalEnrolled > 0 ? Math.round(totalRev / totalEnrolled) : 0;
    if (srcRevRows.length === 0) {
      revenueWrap.innerHTML = `<div class="text-[10px] text-slate-300 italic text-center py-3">데이터가 없습니다</div>`;
    } else {
      srcRevRows.forEach(({ s, rev, enrolled, avg }, idx) => {
        const pct = Math.round(rev / maxRev * 100);
        const detailId = `rev-detail-${s.id}`;
        revenueWrap.innerHTML += `
          <div class="${enrolled > 0 ? 'cursor-pointer hover:bg-slate-50 rounded-lg px-1 -mx-1' : ''} transition-colors" onclick="${enrolled > 0 ? `(function(){const d=document.getElementById('${detailId}');const open=d.style.maxHeight==='32px';d.style.maxHeight=open?'0':'32px';d.style.opacity=open?'0':'1';})()` : ''}">
            <div class="flex items-center gap-2 py-0.5">
              <span class="pill-src border ${s.cls} min-w-[70px] text-center">${s.label}</span>
              <div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-700" style="background:${s.color};width:${pct}%"></div></div>
              <span class="text-[9px] text-slate-400 tabular-nums w-7 text-right">${enrolled}명</span>
              <span class="text-[10px] font-black text-amber-600 tabular-nums font-mono w-20 text-right">${rev > 0 ? fmtM(rev) : '—'}</span>
              ${enrolled > 0 ? `<i class="ph ph-caret-down text-[9px] text-slate-300"></i>` : `<span class="w-3"></span>`}
            </div>
            <div id="${detailId}" style="max-height:0;opacity:0;overflow:hidden;transition:max-height 0.2s ease,opacity 0.15s ease;">
              <div class="flex items-center gap-1 pb-1 pl-[76px]">
                <span class="text-[9px] text-slate-400">객단가</span>
                <span class="text-[10px] font-black text-slate-600 font-mono ml-1">${fmtM(avg)}</span>
              </div>
            </div>
          </div>`;
      });
    }
    const revOverallEl = document.getElementById('b-source-revenue-overall');
    if (revOverallEl) revOverallEl.textContent = `${fmtM(totalRev)} · 객단가 ${fmtM(totalAvg)}`;
  }
  const empGrid = document.getElementById('b-emp-grid'); empGrid.innerHTML = '';
  employees.forEach(emp => {
    const count = fa.filter(a=>(callLogs[a.id]||[]).some(l=>l.key===emp.key)).length;
    const card = document.createElement('div'); card.className = 'stats-key-card';
    card.innerHTML = `<div class="flex items-center gap-1 border-b border-slate-100 w-full px-1 pb-1 mb-1"><span class="stats-key-badge">${emp.key}</span><span class="emp-name-edit" data-emp-key="${emp.key}" ondblclick="startEmpEdit(this)" title="더블 클릭하여 수정">${emp.name}</span></div><div class="text-[10px] font-black text-brand-600">${total>0?Math.round(count/total*100):0}%</div><div class="text-[9px] text-slate-400 font-bold">${count}명</div>`;
    empGrid.appendChild(card);
  });
}

function periodDays(p) {
  if (p === '1w') return 7;
  if (p === '2w') return 14;
  if (p === '3w') return 21;
  if (p === '1m') return 30;
  return 99999; // 'all'
}

function filterByPeriod(list, period) {
  if (period === 'all') return list;
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - periodDays(period));
  return list.filter(a => new Date(a.time) >= cutoff);
}

function filtered(){
  if (boardPeriod === 'custom' && boardCustomFrom && boardCustomTo) {
    return applicants.filter(a => {
      const d = new Date(a.time);
      return d >= boardCustomFrom && d <= boardCustomTo;
    });
  }
  return filterByPeriod(applicants, boardPeriod);
}

// ── Custom Range Picker ──
let _rangePickerOpen = false;
let _rangeSelecting = 'start'; // 'start' or 'end'
let _rangeTempFrom = null;
let _rangeTempTo = null;
let _rangeLeftMonth = new Date().getMonth();
let _rangeLeftYear = new Date().getFullYear();

function toDateStr(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function fmtRange(d) {
  if (!d) return null;
  return `${d.getMonth()+1}월 ${d.getDate()}일`;
}

function toggleRangePicker() {
  const dd = document.getElementById('range-picker-dropdown');
  _rangePickerOpen = !_rangePickerOpen;
  if (_rangePickerOpen) {
    dd.classList.remove('hidden');
    // Init to current selection or this month
    if (historyCustomFrom) {
      _rangeTempFrom = new Date(historyCustomFrom);
      _rangeLeftYear = _rangeTempFrom.getFullYear();
      _rangeLeftMonth = _rangeTempFrom.getMonth();
    } else {
      _rangeTempFrom = null;
      _rangeLeftYear = new Date().getFullYear();
      _rangeLeftMonth = new Date().getMonth();
    }
    _rangeTempTo = historyCustomTo ? new Date(historyCustomTo) : null;
    _rangeSelecting = 'start';
    renderRangeCals();
  } else {
    dd.classList.add('hidden');
  }
}

function closeRangePicker() {
  document.getElementById('range-picker-dropdown').classList.add('hidden');
  _rangePickerOpen = false;
}

function confirmRangePicker() {
  if (_rangeTempFrom) historyCustomFrom = new Date(_rangeTempFrom.setHours(0,0,0,0));
  if (_rangeTempTo) historyCustomTo = new Date(_rangeTempTo.setHours(23,59,59,999));
  else if (_rangeTempFrom) historyCustomTo = new Date(_rangeTempFrom.setHours(23,59,59,999));
  updateRangeDisplay();
  closeRangePicker();
  renderHistoryFiltered();
}

function updateRangeDisplay() {
  const fromEl = document.getElementById('range-display-from');
  const toEl = document.getElementById('range-display-to');
  fromEl.textContent = historyCustomFrom ? fmtRange(historyCustomFrom) : '시작일';
  toEl.textContent = historyCustomTo ? fmtRange(historyCustomTo) : '종료일';
  fromEl.className = historyCustomFrom ? 'text-slate-800 font-black' : 'text-slate-400';
  toEl.className = historyCustomTo ? 'text-slate-800 font-black' : 'text-slate-400';
}

function setRangePreset(days) {
  const now = new Date();
  _rangeTempTo = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  _rangeTempFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  _rangeLeftYear = _rangeTempFrom.getFullYear();
  _rangeLeftMonth = _rangeTempFrom.getMonth();
  renderRangeCals();
}

function moveRangeMonth(dir) {
  _rangeLeftMonth += dir;
  if (_rangeLeftMonth > 11) { _rangeLeftMonth = 0; _rangeLeftYear++; }
  if (_rangeLeftMonth < 0) { _rangeLeftMonth = 11; _rangeLeftYear--; }
  renderRangeCals();
}

function clickRangeDay(dateStr) {
  const clicked = new Date(dateStr + 'T00:00:00');
  if (_rangeSelecting === 'start') {
    _rangeTempFrom = clicked;
    _rangeTempTo = null;
    _rangeSelecting = 'end';
  } else {
    if (clicked < _rangeTempFrom) {
      _rangeTempFrom = clicked;
      _rangeSelecting = 'end';
    } else {
      _rangeTempTo = clicked;
      _rangeSelecting = 'start';
    }
  }
  renderRangeCals();
}

function buildRangeCalMonth(y, m, containerId) {
  const container = document.getElementById(containerId);
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const fromStr = _rangeTempFrom ? toDateStr(_rangeTempFrom.getFullYear(), _rangeTempFrom.getMonth(), _rangeTempFrom.getDate()) : null;
  const toStr = _rangeTempTo ? toDateStr(_rangeTempTo.getFullYear(), _rangeTempTo.getMonth(), _rangeTempTo.getDate()) : null;

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  let html = `<div class="flex items-center justify-between mb-3">
    <button onclick="moveRangeMonth(-1)" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><i class="ph-bold ph-caret-left text-xs"></i></button>
    <span class="text-[13px] font-black text-slate-700">${y}년 ${monthNames[m]}</span>
    <button onclick="moveRangeMonth(1)" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><i class="ph-bold ph-caret-right text-xs"></i></button>
  </div>`;
  html += `<div class="rcal-grid mb-1">${['일','월','화','수','목','금','토'].map((d,i) =>
    `<div class="text-[9px] font-black py-1.5 text-center ${i===0?'text-red-300':i===6?'text-blue-300':'text-slate-300'} uppercase tracking-widest">${d}</div>`
  ).join('')}</div><div class="rcal-grid">`;

  for (let i = 0; i < firstDay; i++) html += '<div class="rcal-day empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = toDateStr(y, m, d);
    const dow = (firstDay + d - 1) % 7;
    const isToday = ds === todayStr;
    const isStart = ds === fromStr;
    const isEnd = ds === toStr;
    const inRange = fromStr && toStr && ds > fromStr && ds < toStr;
    let cls = 'rcal-day';
    if (isToday) cls += ' today';
    if (isStart) cls += ' range-start';
    if (isEnd) cls += ' range-end';
    if (inRange) cls += ' in-range';
    if (inRange && dow === 0) cls += ' row-start';
    if (inRange && dow === 6) cls += ' row-end';
    html += `<div class="${cls}" onclick="clickRangeDay('${ds}')">${d}</div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

function renderRangeCals() {
  const rightMonth = _rangeLeftMonth + 1 > 11 ? 0 : _rangeLeftMonth + 1;
  const rightYear = _rangeLeftMonth + 1 > 11 ? _rangeLeftYear + 1 : _rangeLeftYear;
  buildRangeCalMonth(_rangeLeftYear, _rangeLeftMonth, 'range-cal-left');
  buildRangeCalMonth(rightYear, rightMonth, 'range-cal-right');

  // Update label
  const label = document.getElementById('range-selected-label');
  if (_rangeTempFrom && _rangeTempTo) {
    label.innerHTML = `<span class="text-brand-600 font-black">${fmtRange(_rangeTempFrom)}</span> ~ <span class="text-brand-600 font-black">${fmtRange(_rangeTempTo)}</span>`;
  } else if (_rangeTempFrom) {
    label.innerHTML = `<span class="text-brand-600 font-black">${fmtRange(_rangeTempFrom)}</span> ~ <span class="text-slate-300">종료일 선택</span>`;
  } else {
    label.textContent = '시작일을 선택하세요';
  }

  // Highlight active preset
  document.querySelectorAll('.range-preset-btn').forEach(b => b.classList.remove('active'));
}

function applyHistoryCustomRange() {
  if (historyCustomFrom && historyCustomTo) {
    updateRangeDisplay();
    renderHistoryFiltered();
  }
}

// ── Board Custom Range Picker ──
let _boardRangeOpen = false;
let _boardRangeSelecting = 'start';
let _boardRangeTempFrom = null;
let _boardRangeTempTo = null;
let _boardRangeLeftMonth = new Date().getMonth();
let _boardRangeLeftYear = new Date().getFullYear();

function toggleBoardRangePicker() {
  const dd = document.getElementById('board-range-picker-dropdown');
  _boardRangeOpen = !_boardRangeOpen;
  if (_boardRangeOpen) {
    dd.classList.remove('hidden');
    if (boardCustomFrom) {
      _boardRangeTempFrom = new Date(boardCustomFrom);
      _boardRangeLeftYear = _boardRangeTempFrom.getFullYear();
      _boardRangeLeftMonth = _boardRangeTempFrom.getMonth();
    } else {
      _boardRangeTempFrom = null;
      _boardRangeLeftYear = new Date().getFullYear();
      _boardRangeLeftMonth = new Date().getMonth();
    }
    _boardRangeTempTo = boardCustomTo ? new Date(boardCustomTo) : null;
    _boardRangeSelecting = 'start';
    renderBoardRangeCals();
  } else {
    dd.classList.add('hidden');
  }
}

function closeBoardRangePicker() {
  document.getElementById('board-range-picker-dropdown').classList.add('hidden');
  _boardRangeOpen = false;
}

function confirmBoardRangePicker() {
  if (_boardRangeTempFrom) boardCustomFrom = new Date(_boardRangeTempFrom.setHours(0,0,0,0));
  if (_boardRangeTempTo) boardCustomTo = new Date(_boardRangeTempTo.setHours(23,59,59,999));
  else if (_boardRangeTempFrom) boardCustomTo = new Date(new Date(_boardRangeTempFrom).setHours(23,59,59,999));
  updateBoardRangeDisplay();
  closeBoardRangePicker();
  renderList();
  if(_activeMainTab==='board') renderBoard();
}

function updateBoardRangeDisplay() {
  const fromEl = document.getElementById('board-range-display-from');
  const toEl = document.getElementById('board-range-display-to');
  fromEl.textContent = boardCustomFrom ? fmtRange(boardCustomFrom) : '시작일';
  toEl.textContent = boardCustomTo ? fmtRange(boardCustomTo) : '종료일';
  fromEl.className = boardCustomFrom ? 'text-slate-800 font-black' : 'text-slate-400';
  toEl.className = boardCustomTo ? 'text-slate-800 font-black' : 'text-slate-400';
}

function setBoardRangePreset(days) {
  const now = new Date();
  _boardRangeTempTo = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  _boardRangeTempFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  _boardRangeLeftYear = _boardRangeTempFrom.getFullYear();
  _boardRangeLeftMonth = _boardRangeTempFrom.getMonth();
  renderBoardRangeCals();
}

function moveBoardRangeMonth(dir) {
  _boardRangeLeftMonth += dir;
  if (_boardRangeLeftMonth > 11) { _boardRangeLeftMonth = 0; _boardRangeLeftYear++; }
  if (_boardRangeLeftMonth < 0) { _boardRangeLeftMonth = 11; _boardRangeLeftYear--; }
  renderBoardRangeCals();
}

function clickBoardRangeDay(dateStr) {
  const clicked = new Date(dateStr + 'T00:00:00');
  if (_boardRangeSelecting === 'start') {
    _boardRangeTempFrom = clicked;
    _boardRangeTempTo = null;
    _boardRangeSelecting = 'end';
  } else {
    if (clicked < _boardRangeTempFrom) {
      _boardRangeTempFrom = clicked;
      _boardRangeSelecting = 'end';
    } else {
      _boardRangeTempTo = clicked;
      _boardRangeSelecting = 'start';
    }
  }
  renderBoardRangeCals();
}

function buildBoardCalMonth(y, m, containerId) {
  const container = document.getElementById(containerId);
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const fromStr = _boardRangeTempFrom ? toDateStr(_boardRangeTempFrom.getFullYear(), _boardRangeTempFrom.getMonth(), _boardRangeTempFrom.getDate()) : null;
  const toStr = _boardRangeTempTo ? toDateStr(_boardRangeTempTo.getFullYear(), _boardRangeTempTo.getMonth(), _boardRangeTempTo.getDate()) : null;
  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  let html = `<div class="flex items-center justify-between mb-3">
    <button onclick="moveBoardRangeMonth(-1)" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><i class="ph-bold ph-caret-left text-xs"></i></button>
    <span class="text-[13px] font-black text-slate-700">${y}년 ${monthNames[m]}</span>
    <button onclick="moveBoardRangeMonth(1)" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><i class="ph-bold ph-caret-right text-xs"></i></button>
  </div>`;
  html += `<div class="rcal-grid mb-1">${['일','월','화','수','목','금','토'].map((d,i) =>
    `<div class="text-[9px] font-black py-1.5 text-center ${i===0?'text-red-300':i===6?'text-blue-300':'text-slate-300'} uppercase tracking-widest">${d}</div>`
  ).join('')}</div><div class="rcal-grid">`;
  for (let i = 0; i < firstDay; i++) html += '<div class="rcal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = toDateStr(y, m, d);
    const dow = (firstDay + d - 1) % 7;
    const isToday = ds === todayStr;
    const isStart = ds === fromStr;
    const isEnd = ds === toStr;
    const inRange = fromStr && toStr && ds > fromStr && ds < toStr;
    let cls = 'rcal-day';
    if (isToday) cls += ' today';
    if (isStart) cls += ' range-start';
    if (isEnd) cls += ' range-end';
    if (inRange) cls += ' in-range';
    if (inRange && dow === 0) cls += ' row-start';
    if (inRange && dow === 6) cls += ' row-end';
    html += `<div class="${cls}" onclick="clickBoardRangeDay('${ds}')">${d}</div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

function renderBoardRangeCals() {
  const rightMonth = _boardRangeLeftMonth + 1 > 11 ? 0 : _boardRangeLeftMonth + 1;
  const rightYear = _boardRangeLeftMonth + 1 > 11 ? _boardRangeLeftYear + 1 : _boardRangeLeftYear;
  buildBoardCalMonth(_boardRangeLeftYear, _boardRangeLeftMonth, 'board-range-cal-left');
  buildBoardCalMonth(rightYear, rightMonth, 'board-range-cal-right');
  const label = document.getElementById('board-range-selected-label');
  if (_boardRangeTempFrom && _boardRangeTempTo) {
    label.innerHTML = `<span class="text-brand-600 font-black">${fmtRange(_boardRangeTempFrom)}</span> ~ <span class="text-brand-600 font-black">${fmtRange(_boardRangeTempTo)}</span>`;
  } else if (_boardRangeTempFrom) {
    label.innerHTML = `<span class="text-brand-600 font-black">${fmtRange(_boardRangeTempFrom)}</span> ~ <span class="text-slate-300">종료일 선택</span>`;
  } else {
    label.textContent = '시작일을 선택하세요';
  }
  document.querySelectorAll('.board-range-preset').forEach(b => b.classList.remove('active'));
}

function filteredHistory() {
  let list;
  if (historyPeriod === 'custom' && historyCustomFrom && historyCustomTo) {
    list = applicants.filter(a => {
      const d = new Date(a.time);
      return d >= historyCustomFrom && d <= historyCustomTo;
    });
  } else {
    list = filterByPeriod(applicants, historyPeriod);
  }
  // Only history items (scheduled OR nocall OR ultimatum)
  list = list.filter(a => visitData[a.id]?.scheduled || a.comment?.includes('전화상 안함') || a.comment?.includes('최후 통첩'));

  // Result filter
  const resultFilter = document.getElementById('history-filter-result')?.value || 'all';
  if (resultFilter === 'scheduled') list = list.filter(a => visitData[a.id]?.scheduled);
  else if (resultFilter === 'scheduled-eng') list = list.filter(a => visitData[a.id]?.scheduled && visitData[a.id]?.lang === '영어');
  else if (resultFilter === 'scheduled-jpn') list = list.filter(a => visitData[a.id]?.scheduled && visitData[a.id]?.lang === '일본어');
  else if (resultFilter === 'scheduled-nolang') list = list.filter(a => visitData[a.id]?.scheduled && !visitData[a.id]?.lang);
  else if (resultFilter === 'nocall') list = list.filter(a => a.comment?.includes('전화상 안함'));
  else if (resultFilter === 'ultimatum') list = list.filter(a => a.comment?.includes('최후 통첩'));

  // Source filter
  const sourceFilter = document.getElementById('history-filter-source')?.value || 'all';
  if (sourceFilter !== 'all') list = list.filter(a => a.source === sourceFilter);

  // Name search
  const search = (document.getElementById('history-filter-search')?.value || '').trim();
  if (search) list = list.filter(a => a.name.includes(search));

  return list;
}

function toggleCall(id, key){
  if(!callLogs[id]) callLogs[id]=[];
  const a = applicants.find(x=>x.id===id);

  // 다른 지원자 번호 가리기
  applicants.forEach(x => { if(x.id !== id) x.revealed = false; });

  callLogs[id].push({key, time:new Date()});
  a.revealed = true;
  a.updatedAt = new Date();

  renderList();
  if(_activeMainTab==='board') renderBoard();
}

let _inputModalCallback = null;

function openInputModal({ title, desc, icon, iconBg, placeholder, value, onConfirm }) {
  const modal = document.getElementById('input-modal');
  document.getElementById('input-modal-title').textContent = title;
  document.getElementById('input-modal-desc').textContent = desc || '';
  document.getElementById('input-modal-icon').className = `w-10 h-10 rounded-xl ${iconBg || 'bg-brand-50 border border-brand-100'} flex items-center justify-center ${icon?.includes('text-') ? '' : 'text-brand-500'}`;
  document.getElementById('input-modal-icon').innerHTML = icon || '<i class="ph-bold ph-pencil-simple text-lg"></i>';
  const field = document.getElementById('input-modal-field');
  field.placeholder = placeholder || '';
  field.value = value || '';
  _inputModalCallback = onConfirm;
  modal.classList.add('show');
  setTimeout(() => field.focus(), 150);
  field.onkeydown = (e) => { if (e.key === 'Enter') confirmInputModal(); if (e.key === 'Escape') closeInputModal(); };
}

function closeInputModal() {
  document.getElementById('input-modal').classList.remove('show');
  _inputModalCallback = null;
}

function confirmInputModal() {
  const val = document.getElementById('input-modal-field').value.trim();
  if (val && _inputModalCallback) _inputModalCallback(val);
  closeInputModal();
}

function editName(id) {
  const a = applicants.find(x=>x.id===id);
  if(!a) return;
  openInputModal({
    title: '성함 수정',
    desc: `현재: ${a.name}`,
    icon: '<i class="ph-bold ph-user text-lg text-brand-500"></i>',
    iconBg: 'bg-brand-50 border border-brand-100',
    placeholder: '수정할 성함을 입력하세요',
    value: a.name,
    onConfirm: (val) => {
      a.name = val;
      a.updatedAt = new Date();
      toast('성함이 수정되었습니다');
      renderList();
    }
  });
}

function setResult(id, label) {
  const a = applicants.find(x=>x.id===id);
  if(!a) return;

  if (label === '기타(사유입력)') {
    openInputModal({
      title: '기타 사유 입력',
      desc: `${a.name} — 전화상 안함 사유`,
      icon: '<i class="ph-bold ph-note-pencil text-lg text-amber-500"></i>',
      iconBg: 'bg-amber-50 border border-amber-100',
      placeholder: '사유를 입력해주세요',
      value: '',
      onConfirm: (val) => _applyResult(id, `기타: ${val}`, label)
    });
    return;
  }
  _applyResult(id, label, label);
}

function _applyResult(id, finalResult, label) {
  const a = applicants.find(x=>x.id===id);
  if(!a) return;
  a.comment = (a.comment ? a.comment + ' | ' : '') + finalResult;
  a.updatedAt = new Date();
  
  // 전화상 안함 or 최후 통첩 → 데이터 보드 자동 열기
  const isArchive = finalResult.includes('전화상 안함') || label === '없는 번호' || label === '타 지역 거주' || 
    label === '잘못누름/관심없음/바로끊음' || label === '직접 컨택 희망 (고민)' || 
    label === '당분간 참여 어려움' || label === '미성년자' || label === '기존 멤버' || 
    label === '나이 (80대 이상)' || label.startsWith('기타') ||
    finalResult.includes('최후 통첩');
  
  // '전화상 안함' 결과 선택시 comment에 '전화상 안함' 태그 추가
  const noCallLabels = ['없는 번호','타 지역 거주','잘못누름/관심없음/바로끊음','직접 컨택 희망 (고민)','당분간 참여 어려움','미성년자','기존 멤버','나이 (80대 이상)'];
  if(noCallLabels.includes(label) || label.startsWith('기타')) {
    // tag as 전화상 안함 so filtering works
    if(!a.comment.includes('전화상 안함')) a.comment += ' | 전화상 안함';
  }
  
  toast(`✔️ 결과 반영: ${finalResult}`);
  renderList();
  if(_activeMainTab==='board') renderBoard();
}


function revealPhone(id) {
  const a = applicants.find(x=>x.id===id);
  if(a) { a.revealed = true; renderList(); }
}

function saveMemo(id){
  const v = document.getElementById(`memo-${id}`).value;
  const a = applicants.find(x=>x.id===id);
  if(a){ a.memo = v; a.updatedAt = new Date(); toast('메모 저장 완료'); renderList(); }
}

// ── 중복 지원자 관리 ──
function getDupMap() {
  const map = {};
  applicants.forEach(a => {
    if (!map[a.phone]) map[a.phone] = [];
    map[a.phone].push(a);
  });
  return map;
}

function getDupCount(phone) {
  return applicants.filter(a => a.phone === phone).length;
}

let _dupCurrentPhone = null;

function openDupModal(phone) {
  const dupes = applicants.filter(a => a.phone === phone);
  if (dupes.length === 0) { closeDupModal(); return; }
  _dupCurrentPhone = phone;

  document.getElementById('dup-modal-phone').textContent = phone;
  document.getElementById('dup-modal-count').textContent = `동일 번호 ${dupes.length}건`;
  document.getElementById('dup-select-all').checked = false;
  updateDupDeleteBtn();

  const list = document.getElementById('dup-modal-list');
  list.innerHTML = dupes.map((a, idx) => {
    const logs = callLogs[a.id] || [];
    const vd = visitData[a.id];
    const isScheduled = !!vd?.scheduled;
    const isNocall = a.comment?.includes('전화상 안함');
    const isUlti = a.comment?.includes('최후 통첩');

    let statusTag = '';
    if (isScheduled) statusTag = '<span class="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">예약확정</span>';
    else if (isUlti) statusTag = '<span class="text-[9px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200">최후 통첩</span>';
    else if (isNocall) statusTag = '<span class="text-[9px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">전화상 안함</span>';
    else if (logs.length > 0) statusTag = '<span class="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">회신완료</span>';
    else statusTag = '<span class="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full border border-slate-200">대기중</span>';

    return `<div class="px-5 py-3 hover:bg-slate-50 transition-colors dup-row" data-dup-id="${a.id}">
      <div class="flex items-start gap-3">
        <input type="checkbox" class="dup-check w-4 h-4 rounded accent-red-500 cursor-pointer mt-1 flex-shrink-0" data-dup-id="${a.id}" onchange="updateDupDeleteBtn()">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[13px] font-black text-slate-800">${a.name}</span>
            ${statusTag}
            <span class="text-[8px] text-slate-300 font-mono">#${a.id.slice(-7)}</span>
          </div>
          <div class="flex items-center gap-3 text-[10px] text-slate-400 mb-1">
            <span><i class="ph ph-clock text-[9px]"></i> ${fmtDT(a.time)}</span>
            <span class="pill-src border ${a.sourceCls}" style="padding:0 4px;font-size:8px;">${a.sourceLabel}</span>
            ${logs.length > 0 ? `<span class="font-bold">회신 ${logs.length}회</span>` : ''}
          </div>
          ${a.memo ? `<div class="text-[10px] text-slate-500 italic truncate">${a.memo}</div>` : ''}
          ${isScheduled ? `<div class="text-[10px] font-bold text-brand-600 mt-0.5"><i class="ph ph-calendar-check"></i> ${vd.datetime.replace('T',' ')}</div>` : ''}
        </div>
        <button onclick="deleteSingleDup('${a.id}')" class="flex-shrink-0 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="삭제">
          <i class="ph-bold ph-trash text-sm"></i>
        </button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('dup-modal').classList.add('show');
}

function closeDupModal() {
  document.getElementById('dup-modal').classList.remove('show');
  _dupCurrentPhone = null;
}

function toggleDupSelectAll() {
  const allChecked = document.getElementById('dup-select-all').checked;
  document.querySelectorAll('.dup-check').forEach(cb => cb.checked = allChecked);
  updateDupDeleteBtn();
}

function updateDupDeleteBtn() {
  const checked = document.querySelectorAll('.dup-check:checked');
  const btn = document.getElementById('dup-delete-selected-btn');
  const countEl = document.getElementById('dup-delete-count');
  if (checked.length > 0) {
    btn.classList.remove('hidden');
    btn.classList.add('flex');
    countEl.textContent = checked.length;
  } else {
    btn.classList.add('hidden');
    btn.classList.remove('flex');
  }
  // 전체선택 체크박스 동기화
  const total = document.querySelectorAll('.dup-check').length;
  document.getElementById('dup-select-all').checked = checked.length === total && total > 0;
}

function deleteSingleDup(id) {
  if (!_dupCurrentPhone) return;
  const total = applicants.filter(x => x.phone === _dupCurrentPhone).length;
  if (total <= 1) { toast('마지막 1건은 삭제할 수 없습니다'); return; }
  const a = applicants.find(x => x.id === id);
  applicants = applicants.filter(x => x.id !== id);
  delete callLogs[id];
  delete visitData[id];
  toast(`${a?.name || ''} 삭제 완료`);
  openDupModal(_dupCurrentPhone);
  renderList();
  if(_activeMainTab==='board') renderBoard();
}

function deleteSelectedDups() {
  if (!_dupCurrentPhone) return;
  const checkedIds = [...document.querySelectorAll('.dup-check:checked')].map(cb => cb.dataset.dupId);
  const total = applicants.filter(x => x.phone === _dupCurrentPhone).length;

  if (checkedIds.length >= total) {
    toast('최소 1건은 남겨야 합니다');
    return;
  }

  checkedIds.forEach(id => {
    applicants = applicants.filter(x => x.id !== id);
    delete callLogs[id];
    delete visitData[id];
  });

  toast(`${checkedIds.length}건 삭제 완료`);

  openDupModal(_dupCurrentPhone);
  renderList();
  if(_activeMainTab==='board') renderBoard();
}

function scheduleVisit(id){
  openPicker(id);
}

let currentSelectingId = null;
let pickerDate = new Date();
let selectedPickerDate = null;
let selectedPickerTime = "12:00";
let selectedPickerLang = null;

function selectPickerLang(lang) {
  selectedPickerLang = (selectedPickerLang === lang) ? null : lang;
  document.querySelectorAll('.picker-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === selectedPickerLang);
  });
}

function openPicker(id) {
  currentSelectingId = id;
  const a = applicants.find(x=>x.id===id);
  const existing = visitData[id];
  selectedPickerDate = existing ? new Date(existing.datetime) : new Date();
  pickerDate = new Date(selectedPickerDate);
  selectedPickerTime = existing ? existing.datetime.split('T')[1].substring(0,5) : "12:00";
  
  document.getElementById('picker-applicant-name').textContent = a ? `${a.name} 님 예약 일정` : '';
  // 기존 언어 선택 복원
  selectedPickerLang = existing?.lang || null;
  document.querySelectorAll('.picker-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === selectedPickerLang);
  });
  const modal = document.getElementById('picker-modal');
  modal.classList.add('show');
  setTimeout(()=>document.getElementById('picker-content').classList.remove('scale-95'), 10);
  
  renderPicker();
}

function closePicker() {
  document.getElementById('picker-content').classList.add('scale-95');
  const modal = document.getElementById('picker-modal');
  setTimeout(()=> { modal.classList.remove('show'); currentSelectingId = null; }, 200);
}

function changePickerMonth(v) {
  pickerDate.setMonth(pickerDate.getMonth() + v);
  renderPicker();
}

function renderPicker() {
  const monthLabel = document.getElementById('picker-month-year');
  monthLabel.textContent = `${pickerDate.getFullYear()}.${String(pickerDate.getMonth()+1).padStart(2,'0')}`;
  
  const grid = document.getElementById('mini-cal-grid');
  grid.innerHTML = '';
  
  const first = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0).getDate();
  const today = new Date();

  for(let i=0; i<first; i++) {
    const empty = document.createElement('div'); empty.className = 'mini-cal-day empty';
    grid.appendChild(empty);
  }

  for(let d=1; d<=daysInMonth; d++) {
    const day = document.createElement('div');
    day.className = 'mini-cal-day';
    day.textContent = d;
    
    const dStr = `${pickerDate.getFullYear()}-${String(pickerDate.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const selStr = selectedPickerDate ? `${selectedPickerDate.getFullYear()}-${String(selectedPickerDate.getMonth()+1).padStart(2,'0')}-${String(selectedPickerDate.getDate()).padStart(2,'0')}` : '';
    
    if(dStr === selStr) day.classList.add('selected');
    if(dStr === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`) day.classList.add('today');
    
    day.onclick = () => {
      selectedPickerDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), d);
      renderPicker();
    };
    grid.appendChild(day);
  }

  // Time list
  const timeScroller = document.getElementById('time-list-scroller');
  timeScroller.innerHTML = '';
  for(let i=9; i<=22; i++) {
    ["00", "30"].forEach(m => {
      if(i===22 && m==="30") return;
      const t = `${String(i).padStart(2,'0')}:${m}`;
      const item = document.createElement('div');
      item.className = 'time-list-item' + (selectedPickerTime === t ? ' selected' : '');
      item.textContent = t;
      item.onclick = () => {
        selectedPickerTime = t;
        renderPicker();
      };
      timeScroller.appendChild(item);
      if(selectedPickerTime === t && timeScroller.dataset.init !== 'done') {
        setTimeout(()=>item.scrollIntoView({block:'center'}), 10);
      }
    });
  }
}

function confirmPicker() {
  if(!selectedPickerDate) { toast('❗ 날짜를 선택하세요'); return; }
  const dateStr = `${selectedPickerDate.getFullYear()}-${String(selectedPickerDate.getMonth()+1).padStart(2,'0')}-${String(selectedPickerDate.getDate()).padStart(2,'0')}`;
  const finalDT = `${dateStr}T${selectedPickerTime}`;
  
  visitData[currentSelectingId] = {datetime: finalDT, scheduled: true, lang: selectedPickerLang};
  const a = applicants.find(x=>x.id===currentSelectingId); a.updatedAt = new Date();
  
  toast(`📅 ${dateStr} ${selectedPickerTime} 예약 완료`);
  renderList();
  if(_activeMainTab==='board') renderBoard();
  closePicker();
}

function parseTimeStr(s) {
  let [ampm, time] = s.split(' ');
  let [h, m] = time.replace('시', ':').replace('분', '').split(':');
  let hour = parseInt(h);
  if (ampm === '오후' && hour < 12) hour += 12;
  if (ampm === '오전' && hour === 12) hour = 0;
  return `${String(hour).padStart(2,'0')}:${(m||'00').padStart(2,'0')}`;
}

function setQuickTime(id, timeStr) {
  const a = applicants.find(x=>x.id===id);
  const existing = visitData[id];
  const date = existing ? existing.datetime.split('T')[0] : new Date().toISOString().split('T')[0];
  const time = parseTimeStr(timeStr);
  visitData[id] = {datetime: `${date}T${time}`, scheduled: true, label: timeStr};
  a.updatedAt = new Date();
  toast(`📅 ${timeStr} 예약 완료`);
  renderList();
  if(_activeMainTab==='board') renderBoard();
}

let _activeStatType = null;

function showStatDetail(type) {
  const isSummary = ['total', 'replied', 'success'].includes(type);
  const slotIdx = isSummary ? 1 : 2;
  const otherIdx = isSummary ? 2 : 1;

  const panel = document.getElementById(`stat-detail-slot-${slotIdx}`);

  // Toggle logic
  if (_activeStatType === type && !panel.classList.contains('hidden')) {
    closeStatDetail(slotIdx);
    _activeStatType = null;
    return;
  }

  closeStatDetail(otherIdx);

  const title = document.getElementById(`stat-detail-title-${slotIdx}`);
  const list = document.getElementById(`stat-detail-list-${slotIdx}`);

  _activeStatType = type;

  // ── TYPE: 총 지원자 — 유입 경로별 분류 + 전체 목록 ──
  if (type === 'total') {
    const all = window._lastTotal || [];
    const srcCounts = {};
    SOURCES.forEach(s => { srcCounts[s.id] = { label: s.label, cls: s.cls, count: 0 }; });
    all.forEach(a => { if(srcCounts[a.source]) srcCounts[a.source].count++; });
    const replied = all.filter(a => (callLogs[a.id]||[]).length > 0).length;
    const noReply = all.length - replied;

    let html = `<div class="px-4 py-3 bg-slate-50 border-b border-slate-100">
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div class="text-center"><div class="text-lg font-black text-slate-800">${all.length}</div><div class="text-[9px] text-slate-400 font-bold">전체</div></div>
        <div class="text-center"><div class="text-lg font-black text-emerald-600">${replied}</div><div class="text-[9px] text-slate-400 font-bold">회신 완료</div></div>
        <div class="text-center"><div class="text-lg font-black text-red-400">${noReply}</div><div class="text-[9px] text-slate-400 font-bold">미회신</div></div>
      </div>
      <div class="flex flex-wrap gap-2">${SOURCES.map(s => {
        const c = srcCounts[s.id]?.count || 0;
        return c > 0 ? `<span class="text-[9px] font-black border ${s.cls} px-2 py-0.5 rounded-full">${s.label} ${c}명</span>` : '';
      }).join('')}</div>
    </div>`;
    html += all.map(p => {
      const logs = callLogs[p.id] || [];
      const hasReply = logs.length > 0;
      const hasVisit = visitData[p.id]?.scheduled;
      return `<div class="px-3 py-1.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
        <div class="flex items-center gap-3">
          <div class="w-16 flex-shrink-0">
            <div class="text-[10px] font-black text-slate-700 truncate">${p.name}</div>
            <div class="text-[8px] text-slate-400 font-mono">${fmtDT(p.time).split(' ')[1]}</div>
          </div>
          <span class="text-[8px] font-black border ${p.sourceCls||'border-slate-200 text-slate-400'} px-1.5 rounded-full">${p.sourceLabel||'-'}</span>
          <div class="flex-1"></div>
          ${hasVisit ? '<span class="text-[8px] font-black text-white bg-brand-500 px-1.5 py-0.5 rounded-full">예약확정</span>' : hasReply ? '<span class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">회신완료</span>' : '<span class="text-[8px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200">미회신</span>'}
        </div>
      </div>`;
    }).join('');
    list.innerHTML = all.length === 0 ? `<div class="p-8 text-center text-slate-300 text-[11px] italic">해당되는 내역이 없습니다.</div>` : html;
    title.textContent = `총 지원자 현황 (${all.length}명)`;

  // ── TYPE: 총 회신율 — 회신자별 회신 횟수, 담당자, 소요시간 ──
  } else if (type === 'replied') {
    const replied = window._lastReplied || [];
    const all = window._lastTotal || [];
    const noReply = (all || []).filter(a => (callLogs[a.id]||[]).length === 0);

    let html = `<div class="px-4 py-3 bg-emerald-50/50 border-b border-emerald-100">
      <div class="grid grid-cols-3 gap-3">
        <div class="text-center"><div class="text-lg font-black text-emerald-600">${replied.length}</div><div class="text-[9px] text-slate-400 font-bold">회신 완료</div></div>
        <div class="text-center"><div class="text-lg font-black text-red-400">${noReply.length}</div><div class="text-[9px] text-slate-400 font-bold">미회신</div></div>
        <div class="text-center"><div class="text-lg font-black text-slate-800">${all.length > 0 ? Math.round(replied.length / all.length * 100) : 0}%</div><div class="text-[9px] text-slate-400 font-bold">회신율</div></div>
      </div>
    </div>`;
    // 회신 완료 목록
    if (replied.length > 0) {
      html += `<div class="px-3 py-1.5 bg-slate-50 border-b border-slate-100"><span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">회신 완료</span></div>`;
      html += replied.map(p => {
        const logs = callLogs[p.id] || [];
        const empKeys = [...new Set(logs.map(l => l.key))];
        const empNames = empKeys.map(k => { const e = employees.find(e => e.key === k); return e ? e.name : k; });
        const firstReply = new Date(logs[0].time);
        const diffMin = Math.max(0, Math.round((firstReply - new Date(p.time)) / (1000 * 60)));
        return `<div class="px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-16 flex-shrink-0">
              <div class="text-[10px] font-black text-slate-700 truncate">${p.name}</div>
            </div>
            <div class="flex items-center gap-1">${empKeys.map((k,i) => `<span class="text-[8px] font-black bg-slate-800 text-white px-1 rounded">${k}</span><span class="text-[8px] text-slate-500">${empNames[i]}</span>`).join(' ')}</div>
            <div class="flex-1"></div>
            <span class="text-[8px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full">${logs.length}회 회신</span>
            <span class="text-[8px] font-bold text-slate-400">${fmtMin(diffMin)} 소요</span>
          </div>
        </div>`;
      }).join('');
    }
    // 미회신 목록
    if (noReply.length > 0) {
      html += `<div class="px-3 py-1.5 bg-red-50/50 border-b border-slate-100"><span class="text-[9px] font-black text-red-400 uppercase tracking-widest">미회신 (${noReply.length}명)</span></div>`;
      html += noReply.map(p => `<div class="px-3 py-1.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
        <div class="flex items-center gap-3">
          <div class="text-[10px] font-black text-slate-400 truncate">${p.name}</div>
          <span class="text-[8px] font-black border ${p.sourceCls||'border-slate-200 text-slate-400'} px-1.5 rounded-full">${p.sourceLabel||'-'}</span>
          <div class="flex-1"></div>
          <span class="text-[8px] text-slate-300">${fmtDT(p.time)}</span>
        </div>
      </div>`).join('');
    }
    list.innerHTML = (all.length === 0) ? `<div class="p-8 text-center text-slate-300 text-[11px] italic">해당되는 내역이 없습니다.</div>` : html;
    title.textContent = `회신 현황 분석 (${replied.length}/${all.length})`;

  // ── TYPE: 예약 성공률 — 예약 확정자 + 일정 정보 ──
  } else if (type === 'success') {
    const successes = window._lastSuccesses || [];
    const replied = window._lastReplied || [];
    const rate = replied.length > 0 ? Math.round(successes.length / replied.length * 100) : 0;

    let html = `<div class="px-4 py-3 bg-brand-50/50 border-b border-brand-100">
      <div class="grid grid-cols-3 gap-3">
        <div class="text-center"><div class="text-lg font-black text-brand-600">${successes.length}</div><div class="text-[9px] text-slate-400 font-bold">예약 확정</div></div>
        <div class="text-center"><div class="text-lg font-black text-emerald-600">${replied.length}</div><div class="text-[9px] text-slate-400 font-bold">총 회신</div></div>
        <div class="text-center"><div class="text-lg font-black text-brand-600">${rate}%</div><div class="text-[9px] text-slate-400 font-bold">전환율</div></div>
      </div>
    </div>`;
    if (successes.length > 0) {
      html += successes.map(p => {
        const vd = visitData[p.id];
        const logs = callLogs[p.id] || [];
        const empKeys = [...new Set(logs.map(l => l.key))];
        const schedDate = vd?.datetime ? vd.datetime.split('T')[0] : '-';
        const schedTime = vd?.datetime ? vd.datetime.split('T')[1]?.slice(0,5) : '';
        return `<div class="px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-16 flex-shrink-0">
              <div class="text-[10px] font-black text-slate-700 truncate">${p.name}</div>
              <div class="text-[8px] text-slate-400 font-mono">${p.phone.slice(-4)}</div>
            </div>
            <div class="flex items-center gap-1">${empKeys.map(k => `<span class="text-[8px] font-black bg-slate-800 text-white px-1 rounded">${k}</span>`).join(' ')}</div>
            <div class="flex-1"></div>
            <div class="text-right">
              <div class="text-[10px] font-black text-brand-600"><i class="ph ph-calendar-check text-xs"></i> ${schedDate}</div>
              ${schedTime ? `<div class="text-[9px] font-bold text-slate-400">${schedTime}</div>` : ''}
            </div>
          </div>
        </div>`;
      }).join('');
    }
    list.innerHTML = successes.length === 0 ? `<div class="p-8 text-center text-slate-300 text-[11px] italic">예약 확정된 건이 없습니다.</div>` : html;
    title.textContent = `예약 성공 현황 (${successes.length}명)`;

  // ── TYPE: 지원 집중 시간대 — 시간대별 분포표 + 해당 시간 지원자 ──
  } else if (type === 'peak') {
    const all = window._lastTotal || [];
    const peakH = window._lastPeakHour;
    const hours = Array.from({length:14}, (_,i)=>i+9);
    const hourCounts = {};
    hours.forEach(h => hourCounts[h] = 0);
    all.forEach(a => { const h = new Date(a.time).getHours(); if(hourCounts[h] !== undefined) hourCounts[h]++; });
    const maxCount = Math.max(1, ...Object.values(hourCounts));
    const peakApplicants = all.filter(a => new Date(a.time).getHours() === peakH);

    let html = `<div class="px-4 py-3 bg-amber-50/50 border-b border-amber-100">
      <div class="text-[10px] font-black text-amber-700 mb-2 uppercase tracking-widest"><i class="ph-fill ph-fire"></i> 시간대별 지원 분포</div>
      <div class="space-y-1">${hours.filter(h => hourCounts[h] > 0).map(h => {
        const pct = Math.round(hourCounts[h] / (all.length || 1) * 100);
        const isPeak = h === peakH;
        return `<div class="flex items-center gap-2">
          <span class="text-[9px] font-mono font-bold w-8 text-right ${isPeak ? 'text-amber-700' : 'text-slate-400'}">${h}시</span>
          <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all" style="width:${Math.round(hourCounts[h]/maxCount*100)}%;background:${isPeak ? '#F59E0B' : '#CBD5E1'}"></div>
          </div>
          <span class="text-[9px] font-black w-12 text-right ${isPeak ? 'text-amber-700' : 'text-slate-500'}">${hourCounts[h]}명 (${pct}%)</span>
        </div>`;
      }).join('')}</div>
    </div>`;
    if (peakApplicants.length > 0) {
      html += `<div class="px-3 py-1.5 bg-amber-50/30 border-b border-slate-100"><span class="text-[9px] font-black text-amber-600 uppercase tracking-widest"><i class="ph-fill ph-fire"></i> ${peakH}시 지원자 (${peakApplicants.length}명)</span></div>`;
      html += peakApplicants.map(p => {
        const logs = callLogs[p.id] || [];
        const hasReply = logs.length > 0;
        return `<div class="px-3 py-1.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-16 flex-shrink-0"><div class="text-[10px] font-black text-slate-700 truncate">${p.name}</div></div>
            <span class="text-[8px] font-black border ${p.sourceCls||'border-slate-200 text-slate-400'} px-1.5 rounded-full">${p.sourceLabel||'-'}</span>
            <span class="text-[8px] text-slate-400 font-mono">${fmtDT(p.time).split(' ')[1]}</span>
            <div class="flex-1"></div>
            ${hasReply ? '<span class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">회신완료</span>' : '<span class="text-[8px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200">미회신</span>'}
          </div>
        </div>`;
      }).join('');
    }
    list.innerHTML = all.length === 0 ? `<div class="p-8 text-center text-slate-300 text-[11px] italic">해당되는 내역이 없습니다.</div>` : html;
    title.textContent = `지원 집중 시간대 분석 (피크: ${peakH}시)`;

  // ── TYPE: 회신 효율 분석 — 응답 소요시간 순 정렬 + 담당자별 평균 ──
  } else if (type === 'efficiency') {
    const replied = (window._lastReplied || []).map(p => {
      const logs = callLogs[p.id] || [];
      const firstReply = new Date(logs[0].time);
      const diffMin = Math.max(0, Math.round((firstReply - new Date(p.time)) / (1000 * 60)));
      const empKeys = [...new Set(logs.map(l => l.key))];
      return { ...p, diffMin, empKeys, logCount: logs.length };
    }).sort((a, b) => a.diffMin - b.diffMin);

    // 담당자별 평균 응답시간
    const empStats = {};
    replied.forEach(p => {
      p.empKeys.forEach(k => {
        if (!empStats[k]) empStats[k] = { total: 0, count: 0 };
        empStats[k].total += p.diffMin;
        empStats[k].count++;
      });
    });
    const avgAll = replied.length > 0 ? Math.round(replied.reduce((s, p) => s + p.diffMin, 0) / replied.length) : 0;
    const fastCount = replied.filter(p => p.diffMin <= 30).length;
    const slowCount = replied.filter(p => p.diffMin > 60).length;

    let html = `<div class="px-4 py-3 bg-blue-50/50 border-b border-blue-100">
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div class="text-center"><div class="text-lg font-black text-blue-600">${fmtMin(avgAll)}</div><div class="text-[9px] text-slate-400 font-bold">평균 소요</div></div>
        <div class="text-center"><div class="text-lg font-black text-emerald-600">${fastCount}</div><div class="text-[9px] text-slate-400 font-bold">30분 이내</div></div>
        <div class="text-center"><div class="text-lg font-black text-red-400">${slowCount}</div><div class="text-[9px] text-slate-400 font-bold">60분 초과</div></div>
      </div>
      ${Object.keys(empStats).length > 0 ? `<div class="text-[9px] font-black text-blue-600 mb-1 uppercase tracking-widest">담당자별 평균</div>
      <div class="flex flex-wrap gap-2">${Object.entries(empStats).map(([k, v]) => {
        const avg = Math.round(v.total / v.count);
        const emp = employees.find(e => e.key === k);
        return `<span class="text-[9px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-full"><span class="font-black bg-slate-800 text-white px-1 rounded text-[8px]">${k}</span> ${emp ? emp.name : k} ${fmtMin(avg)} (${v.count}건)</span>`;
      }).join('')}</div>` : ''}
    </div>`;
    if (replied.length > 0) {
      html += `<div class="px-3 py-1.5 bg-slate-50 border-b border-slate-100"><span class="text-[9px] font-black text-blue-600 uppercase tracking-widest">응답 소요시간 순</span></div>`;
      html += replied.map((p, idx) => {
        const speedColor = p.diffMin <= 30 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : p.diffMin <= 60 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-red-500 bg-red-50 border-red-200';
        return `<div class="px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
          <div class="flex items-center gap-3">
            <span class="text-[9px] font-black text-slate-300 w-4">${idx + 1}</span>
            <div class="w-16 flex-shrink-0"><div class="text-[10px] font-black text-slate-700 truncate">${p.name}</div></div>
            <div class="flex items-center gap-1">${p.empKeys.map(k => `<span class="text-[8px] font-black bg-slate-800 text-white px-1 rounded">${k}</span>`).join(' ')}</div>
            <div class="flex-1"></div>
            <span class="text-[9px] font-bold text-slate-400">${p.logCount}회</span>
            <span class="text-[9px] font-black ${speedColor} px-1.5 py-0.5 rounded-full border">${fmtMin(p.diffMin)}</span>
          </div>
        </div>`;
      }).join('');
    }
    list.innerHTML = replied.length === 0 ? `<div class="p-8 text-center text-slate-300 text-[11px] italic">회신 기록이 없습니다.</div>` : html;
    title.textContent = `회신 효율 분석 (평균 ${fmtMin(avgAll)})`;
  }

  panel.classList.remove('hidden');
}

function closeStatDetail(idx) {
  const panel = document.getElementById(`stat-detail-slot-${idx || 1}`);
  if(panel) {
    panel.classList.add('hidden');
    if (idx === 1 && _activeStatType && ['total', 'replied', 'success'].includes(_activeStatType)) _activeStatType = null;
    if (idx === 2 && _activeStatType && ['peak', 'efficiency'].includes(_activeStatType)) _activeStatType = null;
  }
}

// ── New Applicant Modal ──
const NEW_APP_SOURCES = {
  phone:    { id:'phone',    label:'전화문의',  cls:'border-slate-200 bg-slate-50 text-slate-700' },
  walkin:   { id:'walkin',   label:'워크인',    cls:'border-emerald-100 bg-emerald-50 text-emerald-700' },
  naver:    { id:'naver',    label:'네이버',    cls:'border-emerald-100 bg-emerald-50 text-emerald-700' },
  kakao:    { id:'kakao',    label:'카카오',    cls:'border-amber-100 bg-amber-50 text-amber-700' },
  insta:    { id:'insta',    label:'인스타',    cls:'border-purple-100 bg-purple-50 text-purple-700' },
  referral: { id:'referral', label:'지인소개',  cls:'border-slate-200 bg-slate-50 text-slate-700' },
  sns:      { id:'sns',      label:'SNS광고',   cls:'border-blue-100 bg-blue-50 text-blue-700' },
  blog:     { id:'blog',     label:'블로그',    cls:'border-orange-100 bg-orange-50 text-orange-700' },
  other:    { id:'other',    label:'기타',      cls:'border-slate-200 bg-slate-50 text-slate-700' }
};

let _newAppSource = null;
let _newAppSchedule = 'pending';
let _newAppLang = null;

function formatPhoneInput(el) {
  const nums = el.value.replace(/[^0-9]/g, '').slice(0, 11);
  if (nums.length <= 3) el.value = nums;
  else if (nums.length <= 7) el.value = nums.slice(0,3) + '-' + nums.slice(3);
  else el.value = nums.slice(0,3) + '-' + nums.slice(3,7) + '-' + nums.slice(7);
}

function openNewAppModal() {
  const modal = document.getElementById('new-app-modal');
  const box = document.getElementById('new-app-box');
  // Reset
  document.getElementById('new-app-name').value = '';
  document.getElementById('new-app-phone').value = '';
  _newAppSource = null;
  _newAppSchedule = 'pending';
  _newAppLang = null;
  document.querySelectorAll('.new-app-src-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.new-app-sched-btn').forEach(b => b.classList.toggle('active', b.dataset.sched === 'pending'));
  document.getElementById('new-app-schedule-form').classList.add('hidden');
  document.getElementById('new-app-other-reason').classList.add('hidden');
  document.getElementById('new-app-other-text').value = '';
  document.getElementById('new-app-date').value = new Date().toISOString().split('T')[0];
  // Lang reset
  document.querySelectorAll('#new-app-schedule-form .picker-lang-btn').forEach(b => b.classList.remove('active'));

  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
  setTimeout(() => { box.style.transform = 'scale(1) translateY(0)'; }, 10);
  setTimeout(() => document.getElementById('new-app-name').focus(), 150);
}

function closeNewAppModal() {
  const modal = document.getElementById('new-app-modal');
  const box = document.getElementById('new-app-box');
  box.style.transform = 'scale(0.95) translateY(8px)';
  modal.style.opacity = '0';
  setTimeout(() => {
    modal.style.visibility = 'hidden';
    modal.style.pointerEvents = 'none';
  }, 150);
}

function selectNewAppSource(btn, srcKey) {
  if (_newAppSource === srcKey) {
    _newAppSource = null;
    btn.classList.remove('active');
  } else {
    _newAppSource = srcKey;
    document.querySelectorAll('.new-app-src-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const otherEl = document.getElementById('new-app-other-reason');
  if (_newAppSource === 'other') {
    otherEl.classList.remove('hidden');
    setTimeout(() => document.getElementById('new-app-other-text').focus(), 100);
  } else {
    otherEl.classList.add('hidden');
  }
}

let _naCalYear, _naCalMonth, _naCalSelectedDate, _naCalSelectedTime;

function setNewAppSchedule(type) {
  _newAppSchedule = type;
  document.querySelectorAll('.new-app-sched-btn').forEach(b => b.classList.toggle('active', b.dataset.sched === type));
  const form = document.getElementById('new-app-schedule-form');
  form.classList.toggle('hidden', type !== 'scheduled');
  if (type === 'scheduled') {
    const now = new Date();
    _naCalYear = now.getFullYear();
    _naCalMonth = now.getMonth();
    _naCalSelectedDate = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
    _naCalSelectedTime = quickTimes[0] || '오후 3시';
    document.getElementById('new-app-date').value = _naCalSelectedDate;
    renderNewAppCal();
    renderNewAppTimeGrid();
  }
}

function moveNewAppCalMonth(dir) {
  _naCalMonth += dir;
  if (_naCalMonth > 11) { _naCalMonth = 0; _naCalYear++; }
  if (_naCalMonth < 0) { _naCalMonth = 11; _naCalYear--; }
  renderNewAppCal();
}

function selectNewAppDate(dateStr) {
  _naCalSelectedDate = dateStr;
  document.getElementById('new-app-date').value = dateStr;
  renderNewAppCal();
}

function selectNewAppTime(time) {
  _naCalSelectedTime = time;
  renderNewAppTimeGrid();
}

function renderNewAppCal() {
  const grid = document.getElementById('new-app-cal-grid');
  const title = document.getElementById('new-app-cal-title');
  const y = _naCalYear, m = _naCalMonth;
  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  title.textContent = `${y}년 ${monthNames[m]}`;

  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="nacal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = toDateStr(y, m, d);
    const dow = (firstDay + d - 1) % 7;
    const isPast = ds < todayStr;
    const isToday = ds === todayStr;
    const isSel = ds === _naCalSelectedDate;
    let cls = 'nacal-day';
    if (isPast) cls += ' past';
    if (isToday && !isSel) cls += ' today';
    if (isSel) cls += ' selected';
    if (dow === 0) cls += ' sun';
    if (dow === 6) cls += ' sat';
    html += `<div class="${cls}" ${isPast ? '' : `onclick="selectNewAppDate('${ds}')"`}>${d}</div>`;
  }
  grid.innerHTML = html;
}

function renderNewAppTimeGrid() {
  const wrap = document.getElementById('new-app-time-scroller');
  wrap.innerHTML = quickTimes.map(t =>
    `<div class="time-list-item ${t === _naCalSelectedTime ? 'selected' : ''}" onclick="selectNewAppTime('${t}')">${t}</div>`
  ).join('');
}

function selectNewAppLang(lang) {
  _newAppLang = (_newAppLang === lang) ? null : lang;
  document.querySelectorAll('#new-app-schedule-form .picker-lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === _newAppLang);
  });
}

function submitNewApp() {
  const name = document.getElementById('new-app-name').value.trim();
  const phone = document.getElementById('new-app-phone').value.trim();
  if (!name) { toast('성함을 입력하세요'); document.getElementById('new-app-name').focus(); return; }
  if (!phone) { toast('연락처를 입력하세요'); document.getElementById('new-app-phone').focus(); return; }

  const srcInfo = NEW_APP_SOURCES[_newAppSource] || NEW_APP_SOURCES.other;
  const otherText = document.getElementById('new-app-other-text')?.value.trim();
  const srcLabel = (_newAppSource === 'other' && otherText) ? otherText : srcInfo.label;
  const id = 'APP_' + Math.random().toString(36).slice(2,8).toUpperCase();

  const app = {
    id, name, phone,
    team: '', slot: '',
    source: srcInfo.id,
    sourceLabel: srcLabel,
    sourceCls: srcInfo.cls,
    time: new Date(),
    updatedAt: new Date(),
    details: `[하남점] ${srcLabel} 직접 등록`,
    comment: '',
    memo: ''
  };
  applicants.unshift(app);

  // 상담 일정이 있으면 바로 예약
  if (_newAppSchedule === 'scheduled') {
    const dateVal = _naCalSelectedDate;
    const timeStr = _naCalSelectedTime;
    if (dateVal && timeStr) {
      const parsedTime = parseTimeStr(timeStr);
      visitData[id] = { datetime: `${dateVal}T${parsedTime}`, scheduled: true, lang: _newAppLang };
    }
  }

  closeNewAppModal();
  toast(`${name} 님 추가 완료`);
  renderList();
  if(_activeMainTab==='board') renderBoard();
}

// ── Main Tabs ──
let _activeMainTab = 'calendar';

let _tabCardCollapsed = false;

function toggleTabCard() {
  _tabCardCollapsed = !_tabCardCollapsed;
  const wrap = document.getElementById('tab-content-wrap');
  const icon = document.getElementById('tab-collapse-icon');
  if (_tabCardCollapsed) {
    wrap.style.maxHeight = '0';
    wrap.style.overflow = 'hidden';
    icon.style.transform = 'rotate(180deg)';
  } else {
    wrap.style.maxHeight = '';
    wrap.style.overflow = '';
    icon.style.transform = '';
    if (_activeMainTab === 'board') renderBoard();
    if (_activeMainTab === 'history') renderHistoryFiltered();
  }
}

function switchMainTab(tab) {
  if (_tabCardCollapsed) { _tabCardCollapsed = false; document.getElementById('tab-content-wrap').style.maxHeight = ''; document.getElementById('tab-content-wrap').style.overflow = ''; document.getElementById('tab-collapse-icon').style.transform = ''; }
  _activeMainTab = tab;
  document.querySelectorAll('.main-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.main-tab-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`tab-panel-${tab}`).classList.remove('hidden');

  // Trigger renders for the active tab
  if (tab === 'history') renderHistoryFiltered();
  if (tab === 'board') renderBoard();
}

function updateTabBadges() {
  const fa = applicants;
  // Calendar: today's scheduled count
  const today = new Date().toISOString().split('T')[0];
  const calCount = Object.values(visitData).filter(v => v.scheduled && v.datetime?.startsWith(today)).length;
  const calBadge = document.getElementById('tab-badge-cal');
  if (calBadge) { calBadge.textContent = calCount; calBadge.classList.toggle('hidden', calCount === 0); }

  // History: total processed
  const histCount = fa.filter(a => visitData[a.id]?.scheduled || a.comment?.includes('전화상 안함') || a.comment?.includes('최후 통첩')).length;
  const histBadge = document.getElementById('tab-badge-history');
  if (histBadge) { histBadge.textContent = histCount; histBadge.classList.toggle('hidden', histCount === 0); }

  // Board: total applicants
  const boardBadge = document.getElementById('tab-badge-board');
  if (boardBadge) { boardBadge.textContent = fa.length; boardBadge.classList.toggle('hidden', fa.length === 0); }
}

// ── Global Search ──
function onGlobalSearch() {
  const val = (document.getElementById('global-search')?.value || '').trim();
  const clearBtn = document.getElementById('global-search-clear');
  const panel = document.getElementById('global-search-panel');
  if (clearBtn) clearBtn.classList.toggle('hidden', !val);

  if (!val) {
    panel.classList.add('hidden');
    return;
  }

  const q = val.replace(/-/g, '');
  const results = applicants.filter(a => a.name.includes(val) || a.phone.replace(/-/g, '').includes(q));

  document.getElementById('global-search-total').textContent = results.length;

  const wrap = document.getElementById('global-search-results');
  if (results.length === 0) {
    wrap.innerHTML = '<div class="p-8 text-center text-slate-300 text-[11px] italic">검색 결과가 없습니다.</div>';
  } else {
    wrap.innerHTML = results.map(a => {
      const logs = callLogs[a.id] || [];
      const vd = visitData[a.id];
      const isScheduled = !!vd?.scheduled;
      const isNocall = a.comment?.includes('전화상 안함');
      const isUlti = a.comment?.includes('최후 통첩');

      let statusTag = '';
      if (isScheduled) statusTag = '<span class="text-[9px] font-black text-white bg-emerald-500 px-1.5 py-0.5 rounded-full">예약확정</span>';
      else if (isUlti) statusTag = '<span class="text-[9px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200">최후 통첩</span>';
      else if (isNocall) statusTag = '<span class="text-[9px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">전화상 안함</span>';
      else if (logs.length > 0) statusTag = '<span class="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">회신완료</span>';
      else statusTag = '<span class="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">대기중</span>';

      const langTag = vd?.lang ? `<span class="text-[8px] font-bold ${vd.lang==='영어'?'text-purple-600 bg-purple-50 border-purple-200':vd.lang==='일본어'?'text-blue-600 bg-blue-50 border-blue-200':'text-slate-600 bg-slate-50 border-slate-200'} px-1 py-0.5 rounded border">${vd.lang}</span>` : '';

      // Highlight matched text
      const highlightName = val ? a.name.replace(new RegExp(`(${val.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'g'), '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5 font-black">$1</mark>') : a.name;
      const highlightPhone = val ? a.phone.replace(new RegExp(`(${val.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'g'), '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5 font-black">$1</mark>') : a.phone;

      return `<div class="px-5 py-3 hover:bg-slate-50 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-20 flex-shrink-0">
            <div class="text-[13px] font-black text-slate-800 flex items-center gap-1">${highlightName}<button onclick="event.stopPropagation();editName('${a.id}');setTimeout(onGlobalSearch,300)" class="text-slate-300 hover:text-brand-500 transition-colors"><i class="ph ph-pencil-simple-line text-[10px]"></i></button></div>
            <div class="text-[11px] text-slate-500 font-mono">${highlightPhone}</div>
          </div>
          <div class="flex items-center gap-1.5">
            ${statusTag}
            ${langTag}
          </div>
          <span class="text-[8px] font-black border ${a.sourceCls||'border-slate-200 text-slate-400'} px-1.5 rounded-full">${a.sourceLabel||'-'}</span>
          <div class="flex-1 min-w-0 text-[10px] text-slate-400 truncate">${a.memo || ''}</div>
          <div class="flex-shrink-0 text-right">
            <div class="text-[9px] text-slate-400 font-mono">${fmtDT(a.time)}</div>
            ${isScheduled ? `<div class="text-[9px] font-bold text-brand-600"><i class="ph ph-calendar-check"></i> ${vd.datetime.replace('T',' ')}</div>` : ''}
          </div>
          ${logs.length > 0 ? `<span class="text-[9px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full border border-brand-100">${logs.length}회</span>` : ''}
          ${!isScheduled ? `<button onclick="clearGlobalSearch();openPicker('${a.id}')" class="flex-shrink-0 px-2.5 py-1.5 text-[10px] font-black bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm shadow-brand-500/20 flex items-center gap-1"><i class="ph-bold ph-calendar-plus text-xs"></i>예약</button>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  panel.classList.remove('hidden');
}

function clearGlobalSearch() {
  document.getElementById('global-search').value = '';
  document.getElementById('global-search-panel').classList.add('hidden');
  document.getElementById('global-search-clear').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  // Drawer is wired via js/shared/drawer.js (loadNav + tDrawer global)
  // History period buttons
  document.querySelectorAll('.history-period-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.history-period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      historyPeriod = btn.dataset.hperiod;
      const customEl = document.getElementById('history-custom-range');
      if (historyPeriod === 'custom') {
        customEl.classList.remove('hidden');
        if (!_rangePickerOpen) toggleRangePicker();
      } else {
        customEl.classList.add('hidden');
        closeRangePicker();
        historyCustomFrom = null;
        historyCustomTo = null;
        renderHistoryFiltered();
      }
    };
  });
  // Board period buttons
  document.querySelectorAll('.board-period-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.board-period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      boardPeriod = btn.dataset.bperiod;
      const customEl = document.getElementById('board-custom-range');
      if (boardPeriod === 'custom') {
        customEl.classList.remove('hidden');
        if (!_boardRangeOpen) toggleBoardRangePicker();
      } else {
        customEl.classList.add('hidden');
        closeBoardRangePicker();
        boardCustomFrom = null;
        boardCustomTo = null;
        renderList();
        if(_activeMainTab==='board') renderBoard();
      }
    };
  });
  // History filters
  ['history-filter-result','history-filter-source','history-filter-search'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(id.includes('search') ? 'input' : 'change', () => renderHistoryFiltered());
  });
  // 유입 경로 분석 정렬 (지원자/성공률 × 오름/내림 등)
  const sortSel = document.getElementById('b-source-sort');
  if (sortSel) sortSel.addEventListener('change', () => { if (_activeMainTab === 'board') renderBoard(); });
  
  // Initial Data: Pre-populate with 15 varied samples
  const populateInitial = () => {
    const NAMES = ['김서연','이민준','박채원','최하은','정유진','강민준','조서준','윤수빈','장하윤','임채원','정우진','한소희','서지민','송유찬','권하랑','오다은','배준서','나예림','문시우','황지호'];
    const DETAILS = ['[하남점] 영어 무료 레벨테스트 신청','[하남점] 인스타 프로모션 유입건','[하남점] 일어 기초반 문의','[하남점] 네이버 블로그 유입건','[하남점] 지인 소개 문의'];
    const STAFF = ['A','B','C','D','E','F'];

    for(let i=0; i<20; i++){
      const src = SOURCES[Math.floor(Math.random()*SOURCES.length)];
      const id = 'APP_'+Math.random().toString(36).slice(2,8).toUpperCase();
      const isToday = i < 10;

      const app = {
        id: id,
        name: NAMES[i % NAMES.length],
        team: Math.random() > 0.5 ? 'ig' : 'fb',
        slot: ['11시','2시','3시','7시','8시'][Math.floor(Math.random()*5)],
        phone: `010-${Math.floor(Math.random()*9000+1000)}-${Math.floor(Math.random()*9000+1000)}`,
        source: src.id,
        sourceLabel: src.label,
        sourceCls: src.cls,
        time: isToday ? new Date(Date.now() - Math.random()*3600000*8) : new Date(Date.now() - (i * 86400000 * 0.5 + Math.random()*86400000)),
        updatedAt: new Date(),
        details: DETAILS[i % DETAILS.length],
        comment: '',
        memo: ''
      };

      // 예시 데이터 분배 로직 (전화상 안함 / 최후 통첩 등) — 5명만 비활성
      if (i === 15) {
        app.comment = '없는 번호 | 전화상 안함';
      } else if (i === 16) {
        app.comment = '미성년자 | 전화상 안함';
      } else if (i === 17) {
        app.comment = '잘못누름/관심없음/바로끊음 | 전화상 안함';
      } else if (i === 18) {
        app.comment = '최후 통첩';
      } else if (i === 19) {
        app.comment = '최후 통첩';
      }

      // Add fake logs for some
      if (i % 2 === 0) {
        callLogs[id] = [{key: STAFF[i % STAFF.length], time: new Date()}];
      }
      // Add fake visits (약 35% 방문 확정, 방문자 중 일부 등록 매출)
      const MS_PRICES = [2520000, 1980000, 1188000, 780000, 190000];
      if (i < 15 && i % 3 === 0 && !app.comment.includes('전화상 안함') && !app.comment.includes('최후 통첩')) {
        const visitDateStr = new Date().toISOString().split('T')[0];
        const enrolled = Math.random() > 0.4;
        const amount = enrolled ? MS_PRICES[Math.floor(Math.random() * MS_PRICES.length)] : 0;
        visitData[id] = {datetime: `${visitDateStr}T19:00`, scheduled: true, enrolled, amount};
      }

      applicants.push(app);
    }
    // 중복 지원 샘플: 기존 지원자 번호로 재지원
    const dupPhone = applicants[0].phone;
    const dupSrc = SOURCES[2];
    applicants.push({
      id: 'APP_'+Math.random().toString(36).slice(2,8).toUpperCase(),
      name: applicants[0].name,
      team: 'ig', slot: '3시',
      phone: dupPhone,
      source: dupSrc.id, sourceLabel: dupSrc.label, sourceCls: dupSrc.cls,
      time: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(),
      details: '[하남점] 재문의 - 이전 지원 이력 있음',
      comment: ''
    });

    applicants.sort((a,b) => b.time - a.time);
  };


  populateInitial();
  renderList();
  updateTabBadges();
  
  // Also hook up the manual sample button for more
  document.getElementById('add-sample-btn').onclick = () => openNewAppModal();
});
