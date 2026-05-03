/**
 * Branch Status page logic.
 * Extracted from inline <script> block in branchstatus.html (lines 676-2288).
 */
// ── Data ──
const STATUSES = [
  {id:'member', label:'멤버 가입', cls:'st-member', color:'#10b981'},
  {id:'unregistered', label:'미가입', cls:'st-unregistered', color:'#94a3b8'},
  {id:'deposit', label:'디파짓', cls:'st-deposit', color:'#f59e0b'},
  {id:'step', label:'스텝', cls:'st-step', color:'#8b5cf6'}
];
const MEMBERSHIPS = [
  {name:'VVIP+', total:1040, cls:'ms-vvip', price:2520000},
  {name:'VVIP',  total:520,  cls:'ms-vip',  price:1980000},
  {name:'A+',    total:104,  cls:'ms-aplus', price:1188000},
  {name:'H+',    total:52,   cls:'ms-hplus', price:780000},
  {name:'T',     total:24,   cls:'ms-t',     price:190000},
  {name:'LEADER', total:0,   cls:'ms-leader', price:0}
];
const SOURCES = ['카카오','네이버','인스타','지인소개','워크인','전화문의'];
const PAY_METHODS = ['카드','현금','계좌이체','토스'];
const NAMES = ['김서연','이민준','박채원','최하은','정유진','강민준','조서준','윤수빈','장하윤','임채원','정우진','한소희','서지민','송유찬','권하랑','오다은','배준서','나예림','문시우','황지호','김태현','이수아','박지훈','최예은','정하율','강서윤','조민서','윤도현','장수빈','임하은'];

let visitors = [];
let bsPeriod = 'month';
let bsCustomFrom = null;
let bsCustomTo = null;

function rng(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function rPick(arr){return arr[rng(0,arr.length-1)];}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function fmtMoney(n){return '₩'+n.toLocaleString('ko-KR');}

function genVisitors(){
  visitors = [];
  // 최소 분포 보장: 멤버 8, 미가입 4, 디파짓 4, 스텝 4
  const statusPool = [
    ...Array(8).fill(STATUSES[0]),
    ...Array(4).fill(STATUSES[1]),
    ...Array(4).fill(STATUSES[2]),
    ...Array(4).fill(STATUSES[3])
  ];
  for(let i=0;i<20;i++){
    const status = statusPool[i];
    const ms = status.id==='member' ? rPick(MEMBERSHIPS) : (status.id==='deposit' ? rPick(MEMBERSHIPS.slice(2)) : null);
    const src = rPick(SOURCES);
    const pay = status.id==='unregistered' ? null : rPick(PAY_METHODS);
    let amount = 0;
    if(status.id==='member' && ms) amount = ms.price;
    else if(status.id==='deposit' && ms) amount = Math.round(ms.price * (rng(20,50)/100) / 10000)*10000;
    else if(status.id==='step') amount = rng(1,3)*100000;

    const daysAgo = i < 15 ? rng(0,20) : rng(21,90); // 15명은 이번달 내
    const regDate = new Date(Date.now()-daysAgo*86400000);
    const fmtD = (d) => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
    const regStr = fmtD(regDate);

    // Language
    const lang = rPick(['영어','일본어','영어+일본어']);

    // Dates
    const docDate = new Date(regDate.getTime() - rng(0,3)*86400000); // 자료 등록일 (등록일 근처)
    const payDate = new Date(regDate.getTime() + rng(0,2)*86400000); // 결제일
    const startDate = (status.id==='member'||status.id==='step') ? new Date(regDate.getTime() + rng(1,7)*86400000) : null; // 스터디 시작일
    const endDate = startDate && ms ? new Date(startDate.getTime() + Math.round(ms.total/(status.id==='step'?2:4))*7*86400000) : null;

    // Study history
    const totalSessions = ms ? ms.total : 0;
    const attended = (status.id==='member'||status.id==='step') ? rng(Math.round(totalSessions*0.3), Math.round(totalSessions*0.9)) : 0;
    const passedSessions = (status.id==='member'||status.id==='step') ? Math.min(totalSessions, attended + rng(0, Math.round((totalSessions-attended)*0.4))) : 0;
    const absent = Math.max(0, passedSessions - attended);
    const remaining = Math.max(0, totalSessions - passedSessions);
    const attRate = totalSessions > 0 ? Math.round(attended/totalSessions*100) : 0;
    // 실제 참석률: 불참 차감 순참석률 (attRate보다 낮음)
    const realAttRate = totalSessions > 0 ? Math.max(0, Math.round((attended - absent) / totalSessions * 100)) : 0;
    const lastStudy = (status.id==='member'||status.id==='step') ? fmtD(new Date(Date.now() - rng(0,14)*86400000)) : '-';
    const level = (status.id==='member'||status.id==='step') ? rng(0,4) : null;

    // History timeline
    const history = [];
    history.push({date:fmtD(docDate), type:'자료등록', desc:'지점 방문 및 자료 등록', color:'slate'});
    if(status.id!=='unregistered'){
      history.push({date:fmtD(payDate), type:'결제', desc:`${pay} ${fmtMoney(amount)} (${ms?ms.name:'스텝'})`, color:'brand'});
      // 분할 결제
      if(status.id==='deposit' || (status.id==='member' && Math.random()>0.6)){
        const pay1 = Math.round(amount * 0.5 / 10000)*10000;
        const pay2Date = new Date(payDate.getTime() + rng(7,30)*86400000);
        history.push({date:fmtD(payDate), type:'1차 결제', desc:`${pay} ${fmtMoney(pay1)}`, color:'blue'});
        if(status.id==='member') history.push({date:fmtD(pay2Date), type:'2차 결제', desc:`${pay} ${fmtMoney(amount-pay1)}`, color:'blue'});
      }
    }
    if(startDate) history.push({date:fmtD(startDate), type:'스터디 시작', desc:`${lang} 스터디 개시`, color:'emerald'});
    // 멤버십 변경
    if(status.id==='member' && Math.random()>0.6){
      const prevMs = rPick(MEMBERSHIPS.filter(m=>m.name!==ms.name));
      const changeDate = new Date(regDate.getTime() + rng(30,60)*86400000);
      history.push({date:fmtD(changeDate), type:'멤버십 변경', desc:`${prevMs.name} → ${ms.name}`, color:'purple'});
    }
    // 레벨업
    if(level !== null && level > 0 && Math.random()>0.4){
      const lvUpDate = new Date(regDate.getTime() + rng(14,60)*86400000);
      history.push({date:fmtD(lvUpDate), type:'레벨업', desc:`LV${level-1} → LV${level}`, color:'amber'});
    }
    // 환불 (미가입자 제외)
    const extras = [];
    if(status.id!=='unregistered' && Math.random()>0.85){
      const refundDate = new Date(Date.now() - rng(1,10)*86400000);
      const isFullRefund = Math.random()>0.6;
      const refundAmt = isFullRefund ? amount : Math.round(amount * rng(20,60)/100 / 10000)*10000;
      const refundKind = isFullRefund ? '전체 취소' : '부분 취소';
      const refundMethod = rPick(PAY_METHODS);
      history.push({date:fmtD(refundDate), type:'환불', desc:`${refundKind} ${fmtMoney(refundAmt)} (${refundMethod})`, color:'red'});
      extras.push({type:'환불', amount:refundAmt, date:fmtD(refundDate), detail:`${refundKind} / ${refundMethod}`});
      amount -= refundAmt;
    }
    // 지점 이동
    if(Math.random()>0.8){
      const branches = ['강남점','분당점','일산점','수원점'];
      const moveDate = new Date(regDate.getTime() + rng(30,90)*86400000);
      history.push({date:fmtD(moveDate), type:'지점 이동', desc:`${rPick(branches)} → 하남점`, color:'indigo'});
    }
    // Sort history by date
    history.sort((a,b)=>a.date.localeCompare(b.date));

    visitors.push({
      id:'V_'+Math.random().toString(36).slice(2,8).toUpperCase(),
      name:rPick(NAMES),
      phone:`010-${rng(1000,9999)}-${rng(1000,9999)}`,
      status:status.id,
      statusLabel:status.label,
      statusCls:status.cls,
      statusColor:status.color,
      lang:lang,
      membership:ms?ms.name:'-',
      membershipCls:ms?ms.cls:'',
      source:src,
      payMethod:pay||'-',
      amount:amount,
      docDate:fmtD(docDate),
      payDate:status.id!=='unregistered'?fmtD(payDate):'-',
      startDate:startDate?fmtD(startDate):'-',
      endDate:endDate?fmtD(endDate):'-',
      regDate:regStr,
      regTime:regDate.getTime(),
      // 재무 필터용 타임스탬프 (결제일/스터디 시작일 기준 조회)
      payTime: status.id !== 'unregistered' ? payDate.getTime() : null,
      startTime: startDate ? startDate.getTime() : null,
      memo:'',
      extras,
      // Study & History
      totalSessions, attended, absent, remaining, attRate, realAttRate, lastStudy, level,
      history
    });
  }

  // ── 리더 등록자 (LEADER) — 비용 없이 등록되는 리더 직군 ──
  const leaderMs = MEMBERSHIPS.find(m => m.name === 'LEADER');
  for (let i = 0; i < 4; i++) {
    const daysAgo = rng(7, 120);
    const regDate = new Date(Date.now() - daysAgo * 86400000);
    const fmtD = (d) => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
    const regStr = fmtD(regDate);
    const lang = rPick(['영어', '일본어']);
    const docDate = new Date(regDate.getTime() - rng(0, 3) * 86400000);
    const startDate = new Date(regDate.getTime() + rng(1, 5) * 86400000);
    const totalSessions = rng(40, 100);
    const attended = rng(Math.round(totalSessions * 0.7), totalSessions);
    const absent = rng(0, Math.max(1, totalSessions - attended));
    const remaining = Math.max(0, totalSessions - attended - absent);
    const realAttRate = Math.max(0, Math.round((attended - absent) / totalSessions * 100));
    const lastStudy = fmtD(new Date(Date.now() - rng(0, 7) * 86400000));
    const level = rng(2, 4);
    const history = [
      { date: fmtD(docDate), type: '자료등록', desc: '리더 지원서 접수', color: 'slate' },
      { date: fmtD(regDate), type: '등록',     desc: `LEADER 등록 (${lang}) — 비용 없음`, color: 'amber' },
      { date: fmtD(startDate), type: '스터디 시작', desc: `${lang} 리딩 시작`, color: 'emerald' },
    ];
    if (level > 0) {
      const lvUpDate = new Date(regDate.getTime() + rng(14, 60) * 86400000);
      history.push({ date: fmtD(lvUpDate), type: '레벨업', desc: `LV${level-1} → LV${level}`, color: 'amber' });
    }
    history.sort((a,b)=>a.date.localeCompare(b.date));
    visitors.push({
      id: 'V_LDR_' + Math.random().toString(36).slice(2,7).toUpperCase(),
      name: rPick(NAMES),
      phone: `010-${rng(1000,9999)}-${rng(1000,9999)}`,
      status: 'step',
      statusLabel: '스텝 (리더)',
      statusCls: 'st-step',
      statusColor: '#8b5cf6',
      lang,
      membership: 'LEADER',
      membershipCls: 'ms-leader',
      source: rPick(SOURCES),
      payMethod: '-',
      amount: 0,
      docDate: fmtD(docDate),
      payDate: '-',
      startDate: fmtD(startDate),
      endDate: '-',
      regDate: regStr,
      regTime: regDate.getTime(),
      payTime: null,
      startTime: startDate.getTime(),
      memo: '리더 직군 — 결제 없이 운영 참여',
      extras: [],
      totalSessions, attended, absent, remaining,
      attRate: Math.round(attended / totalSessions * 100),
      realAttRate, lastStudy, level,
      isLeader: true,
      history,
    });
  }

  visitors.sort((a,b)=>b.regTime-a.regTime);
}

function periodDays(p){
  if(p==='1w')return 7;if(p==='2w')return 14;if(p==='1m')return 30;if(p==='3m')return 90;return 99999;
}

// 기준일(자료 등록일/결제일/스터디 시작일) — 재무 모드에선 결제일 또는 스터디 시작일 사용
let bsBasis = 'regDate';
function basisField(){
  if(bsBasis==='payDate') return 'payTime';
  if(bsBasis==='startDate') return 'startTime';
  return 'regTime';
}
function basisLabel(){
  if(bsBasis==='payDate') return '결제일';
  if(bsBasis==='startDate') return '스터디 시작일';
  return '자료 등록일';
}

function parseDateStr(s){
  if(!s||s==='-') return 0;
  const p=s.split('.');
  return new Date(+p[0],+p[1]-1,+p[2]).getTime();
}
function getPeriodRange(){
  if(bsPeriod==='custom'&&bsCustomFrom&&bsCustomTo)
    return [bsCustomFrom.getTime(), bsCustomTo.getTime()+86399999];
  if(bsPeriod==='month'){
    const n=new Date();
    return [new Date(n.getFullYear(),n.getMonth(),1).getTime(), Date.now()];
  }
  return [Date.now()-periodDays(bsPeriod)*86400000, Date.now()];
}
function filteredVisitors(){
  const field=basisField();
  const [from,to]=getPeriodRange();
  const byField=visitors.filter(v=>v[field]!=null&&v[field]>=from&&v[field]<=to);
  if(bsBasis==='payDate'){
    // 결제일 모드: 기간 내 환불·정산 트랜잭션이 있는 방문자도 포함
    const ids=new Set(byField.map(v=>v.id));
    const byExtra=visitors.filter(v=>
      !ids.has(v.id)&&
      v.extras.some(e=>{const t=parseDateStr(e.date);return t>=from&&t<=to;})
    );
    return [...byField,...byExtra];
  }
  return byField;
}

// ── Custom Range Picker ──
let _bsRangeOpen=false, _bsSelecting='start', _bsTempFrom=null, _bsTempTo=null;
let _bsCalYear=new Date().getFullYear(), _bsCalMonth=new Date().getMonth();

function toDS(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;}
function fmtR(d){return d?`${d.getMonth()+1}월 ${d.getDate()}일`:null;}

function toggleBsRangePicker(){
  const dd=document.getElementById('bs-range-dropdown');
  _bsRangeOpen=!_bsRangeOpen;
  if(_bsRangeOpen){
    dd.classList.remove('hidden');
    if(bsCustomFrom){_bsTempFrom=new Date(bsCustomFrom);_bsCalYear=_bsTempFrom.getFullYear();_bsCalMonth=_bsTempFrom.getMonth();}
    else{_bsTempFrom=null;_bsCalYear=new Date().getFullYear();_bsCalMonth=new Date().getMonth();}
    _bsTempTo=bsCustomTo?new Date(bsCustomTo):null;
    _bsSelecting='start';
    renderBsCals();
  }else{dd.classList.add('hidden');}
}
function closeBsRangePicker(){document.getElementById('bs-range-dropdown').classList.add('hidden');_bsRangeOpen=false;}

function confirmBsRange(){
  if(_bsTempFrom) bsCustomFrom=new Date(_bsTempFrom.setHours(0,0,0,0));
  if(_bsTempTo) bsCustomTo=new Date(_bsTempTo.setHours(23,59,59,999));
  else if(_bsTempFrom) bsCustomTo=new Date(new Date(_bsTempFrom).setHours(23,59,59,999));
  updateBsRangeLabel();
  closeBsRangePicker();
  renderAll();
}

function updateBsRangeLabel(){
  const f=document.getElementById('bs-range-from-label'),t=document.getElementById('bs-range-to-label');
  f.textContent=bsCustomFrom?fmtR(bsCustomFrom):'시작일';
  t.textContent=bsCustomTo?fmtR(bsCustomTo):'종료일';
  f.className=bsCustomFrom?'text-slate-800 font-black':'text-slate-400';
  t.className=bsCustomTo?'text-slate-800 font-black':'text-slate-400';
}

function setBsPreset(days){
  const now=new Date();
  _bsTempTo=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  _bsTempFrom=new Date(now.getFullYear(),now.getMonth(),now.getDate()-days);
  _bsCalYear=_bsTempFrom.getFullYear();_bsCalMonth=_bsTempFrom.getMonth();
  renderBsCals();
}

function moveBsCalMonth(dir){
  _bsCalMonth+=dir;
  if(_bsCalMonth>11){_bsCalMonth=0;_bsCalYear++;}
  if(_bsCalMonth<0){_bsCalMonth=11;_bsCalYear--;}
  renderBsCals();
}

function clickBsDay(ds){
  const clicked=new Date(ds+'T00:00:00');
  if(_bsSelecting==='start'){_bsTempFrom=clicked;_bsTempTo=null;_bsSelecting='end';}
  else{if(clicked<_bsTempFrom){_bsTempFrom=clicked;_bsSelecting='end';}else{_bsTempTo=clicked;_bsSelecting='start';}}
  renderBsCals();
}

function buildBsCal(y,m,containerId){
  const el=document.getElementById(containerId);
  const firstDay=new Date(y,m,1).getDay();
  const daysInMonth=new Date(y,m+1,0).getDate();
  const today=new Date();const todayStr=toDS(today.getFullYear(),today.getMonth(),today.getDate());
  const fromStr=_bsTempFrom?toDS(_bsTempFrom.getFullYear(),_bsTempFrom.getMonth(),_bsTempFrom.getDate()):null;
  const toStr=_bsTempTo?toDS(_bsTempTo.getFullYear(),_bsTempTo.getMonth(),_bsTempTo.getDate()):null;
  const mn=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  let h=`<div class="flex items-center justify-between mb-3">
    <button onclick="moveBsCalMonth(-1)" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><i class="ph-bold ph-caret-left text-xs"></i></button>
    <span class="text-[13px] font-black text-slate-700">${y}년 ${mn[m]}</span>
    <button onclick="moveBsCalMonth(1)" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><i class="ph-bold ph-caret-right text-xs"></i></button>
  </div>`;
  h+=`<div class="rcal-grid mb-1">${['일','월','화','수','목','금','토'].map((d,i)=>
    `<div class="text-[9px] font-black py-1.5 text-center ${i===0?'text-red-300':i===6?'text-blue-300':'text-slate-300'} uppercase tracking-widest">${d}</div>`
  ).join('')}</div><div class="rcal-grid">`;
  for(let i=0;i<firstDay;i++) h+='<div class="rcal-day empty"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const ds=toDS(y,m,d);const dow=(firstDay+d-1)%7;
    const isToday=ds===todayStr;const isStart=ds===fromStr;const isEnd=ds===toStr;
    const inRange=fromStr&&toStr&&ds>fromStr&&ds<toStr;
    let cls='rcal-day';
    if(isToday&&!isStart&&!isEnd) cls+=' today';
    if(isStart) cls+=' range-start';
    if(isEnd) cls+=' range-end';
    if(inRange) cls+=' in-range';
    h+=`<div class="${cls}" onclick="clickBsDay('${ds}')">${d}</div>`;
  }
  h+='</div>';el.innerHTML=h;
}

function renderBsCals(){
  const rm=_bsCalMonth+1>11?0:_bsCalMonth+1;const ry=_bsCalMonth+1>11?_bsCalYear+1:_bsCalYear;
  buildBsCal(_bsCalYear,_bsCalMonth,'bs-cal-left');
  buildBsCal(ry,rm,'bs-cal-right');
  const lbl=document.getElementById('bs-range-label');
  if(_bsTempFrom&&_bsTempTo) lbl.innerHTML=`<span class="text-brand-600 font-black">${fmtR(_bsTempFrom)}</span> ~ <span class="text-brand-600 font-black">${fmtR(_bsTempTo)}</span>`;
  else if(_bsTempFrom) lbl.innerHTML=`<span class="text-brand-600 font-black">${fmtR(_bsTempFrom)}</span> ~ <span class="text-slate-300">종료일 선택</span>`;
  else lbl.textContent='시작일을 선택하세요';
}

function applyBsCustomRange(){
  if(bsCustomFrom&&bsCustomTo){updateBsRangeLabel();renderAll();}
}

function renderKPIs(){
  const fv=filteredVisitors();
  const total=fv.length;
  const members=fv.filter(v=>v.status==='member').length;
  const unreg=fv.filter(v=>v.status==='unregistered').length;
  const deposit=fv.filter(v=>v.status==='deposit').length;
  const step=fv.filter(v=>v.status==='step').length;
  const memberRev=fv.filter(v=>v.status==='member').reduce((s,v)=>s+v.amount,0);
  const depositRev=fv.filter(v=>v.status==='deposit').reduce((s,v)=>s+v.amount,0);
  const stepRev=fv.filter(v=>v.status==='step').reduce((s,v)=>s+v.amount,0);
  const refundTotal=fv.reduce((s,v)=>s+v.extras.filter(e=>e.type==='환불').reduce((r,e)=>r+e.amount,0),0);
  const revenue=memberRev; // 총 매출 = 멤버 결제만, 디파짓/스텝은 별도
  const memberPaying=fv.filter(v=>v.status==='member'&&v.amount>0).length;
  const paying=fv.filter(v=>v.amount>0).length;
  const avg=memberPaying>0?Math.round(memberRev/memberPaying):0;
  const rate=total>0?Math.round(members/total*100):0;

  document.getElementById('kpi-total').textContent=total;
  document.getElementById('kpi-member-count').textContent=members;
  document.getElementById('kpi-unreg-count').textContent=unreg;
  document.getElementById('kpi-deposit-count').textContent=deposit;
  document.getElementById('kpi-step-count').textContent=step;
  document.getElementById('kpi-rate').textContent=rate+'%';
  document.getElementById('kpi-rate-bar').style.width=rate+'%';
  document.getElementById('kpi-revenue').textContent=fmtMoney(revenue);
  document.getElementById('kpi-revenue-detail').innerHTML=
    `<span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-0.5 align-middle"></span>디파짓 ${fmtMoney(depositRev)}`+
    `&ensp;<span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mr-0.5 align-middle"></span>스텝 ${fmtMoney(stepRev)}`+
    (refundTotal>0?`&ensp;<span class="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-0.5 align-middle"></span>환불 −${fmtMoney(refundTotal)}`:'');
  document.getElementById('kpi-avg').textContent=fmtMoney(avg);
  document.getElementById('kpi-avg-detail').textContent=`결제자 ${paying}명 기준`;
}

function renderCharts(){
  const fv=filteredVisitors();
  const total=fv.length;
  const totalRevenue=fv.reduce((s,v)=>s+v.amount,0);

  // Payment method chart
  const payWrap=document.getElementById('pay-method-chart');
  payWrap.innerHTML='';
  const payColors={'카드':'#3b82f6','현금':'#10b981','계좌이체':'#f59e0b','토스':'#3182f6'};
  PAY_METHODS.forEach(pm=>{
    const items=fv.filter(v=>v.payMethod===pm);
    const rev=items.reduce((s,v)=>s+v.amount,0);
    const pct=totalRevenue>0?Math.round(rev/totalRevenue*100):0;
    payWrap.innerHTML+=`<div class="flex items-center gap-2">
      <span class="text-[10px] font-bold text-slate-600 w-16">${pm}</span>
      <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"><div class="h-full rounded-full" style="background:${payColors[pm]};width:${pct}%"></div></div>
      <span class="text-[10px] font-black text-slate-500 w-20 text-right">${fmtMoney(rev)}</span>
      <span class="text-[9px] font-bold text-slate-400 w-8 text-right">${pct}%</span>
    </div>`;
  });

  // Membership revenue chart
  const msWrap=document.getElementById('membership-revenue-chart');
  msWrap.innerHTML='';
  MEMBERSHIPS.forEach(ms=>{
    const items=fv.filter(v=>v.membership===ms.name);
    const rev=items.reduce((s,v)=>s+v.amount,0);
    const pct=totalRevenue>0?Math.round(rev/totalRevenue*100):0;
    msWrap.innerHTML+=`<div class="flex items-center gap-2">
      <span class="text-[10px] font-bold border px-1.5 py-0.5 rounded ${ms.cls} w-12 text-center">${ms.name}</span>
      <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"><div class="h-full rounded-full bg-brand-500" style="width:${pct}%"></div></div>
      <span class="text-[10px] font-black text-slate-500 w-20 text-right">${fmtMoney(rev)}</span>
      <span class="text-[9px] font-bold text-slate-400 w-8 text-right">${pct}%</span>
    </div>`;
  });

  // Status breakdown
  const sbWrap=document.getElementById('status-breakdown');
  sbWrap.innerHTML='';
  STATUSES.forEach(st=>{
    const items=fv.filter(v=>v.status===st.id);
    const rev=items.reduce((s,v)=>s+v.amount,0);
    const pct=total>0?Math.round(items.length/total*100):0;
    sbWrap.innerHTML+=`<div class="bg-white rounded-xl p-4 border border-slate-100 text-center cursor-pointer hover:border-slate-200 hover:shadow-md transition-all" onclick="openStatsDetail('status','${st.id}')">
      <div class="status-pill ${st.cls} justify-center mb-2">${st.label}</div>
      <div class="text-2xl font-black text-slate-800">${items.length}<span class="text-sm text-slate-400 font-bold ml-1">(${pct}%)</span></div>
      <div class="text-[10px] font-bold text-slate-400 mt-1">${fmtMoney(rev)}</div>
      <div class="text-[9px] text-slate-300 mt-1.5 flex items-center justify-center gap-0.5"><i class="ph ph-arrow-square-out"></i>상세보기</div>
    </div>`;
  });

  // Source count chart
  const srcWrap=document.getElementById('source-count-chart');
  srcWrap.innerHTML='';
  const srcColors={'카카오':'#FBBF24','네이버':'#22C55E','인스타':'#D946EF','지인소개':'#94A3B8','워크인':'#F97316','전화문의':'#6366F1'};
  SOURCES.forEach(src=>{
    const count=fv.filter(v=>v.source===src).length;
    const pct=total>0?Math.round(count/total*100):0;
    srcWrap.innerHTML+=`<div class="flex items-center gap-2">
      <span class="text-[10px] font-bold text-slate-600 w-16">${src}</span>
      <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"><div class="h-full rounded-full" style="background:${srcColors[src]||'#94a3b8'};width:${pct}%"></div></div>
      <span class="text-[10px] font-black text-slate-500 w-5 text-right">${count}</span>
      <span class="text-[9px] font-bold text-slate-400 w-8 text-right">${pct}%</span>
    </div>`;
  });

  // Source conversion chart
  const convWrap=document.getElementById('source-conv-chart');
  convWrap.innerHTML='';
  SOURCES.forEach(src=>{
    const all=fv.filter(v=>v.source===src);
    const converted=all.filter(v=>v.status==='member');
    const rate=all.length>0?Math.round(converted.length/all.length*100):0;
    convWrap.innerHTML+=`<div class="flex items-center gap-2">
      <span class="text-[10px] font-bold text-slate-600 w-16">${src}</span>
      <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"><div class="h-full rounded-full bg-emerald-500" style="width:${rate}%"></div></div>
      <span class="text-[10px] font-black text-emerald-600 w-12 text-right">${converted.length}/${all.length}</span>
      <span class="text-[9px] font-bold text-slate-400 w-8 text-right">${rate}%</span>
    </div>`;
  });
}

function renderTable(){
  const fv=filteredVisitors();
  const q=(document.getElementById('bs-search')?.value||'').trim();
  const msFilter=document.getElementById('bs-filter-membership')?.value||'all';
  const srcFilter=document.getElementById('bs-filter-source')?.value||'all';
  const payFilter=document.getElementById('bs-filter-pay')?.value||'all';

  let list=fv;
  if(!_activeStatuses.has('all')){
    list=list.filter(v=>{
      if(_activeStatuses.has(v.status)) return true;
      if(_activeStatuses.has('refund') && v.history.some(h=>h.type==='환불')) return true;
      return false;
    });
  }
  if(msFilter!=='all') list=list.filter(v=>v.membership===msFilter);
  if(srcFilter!=='all') list=list.filter(v=>v.source===srcFilter);
  if(payFilter!=='all') list=list.filter(v=>v.payMethod===payFilter);
  if(q){
    const qn=q.replace(/-/g,'');
    list=list.filter(v=>v.name.includes(q)||v.phone.replace(/-/g,'').includes(qn)||v.id.toLowerCase().includes(q.toLowerCase()));
  }

  document.getElementById('bs-table-count').textContent=`${list.length}명`;
  const totalEl=document.getElementById('bs-table-total');
  const listTotal=list.reduce((s,v)=>s+v.amount,0);
  if(listTotal>0){totalEl.textContent='합계 '+fmtMoney(listTotal);totalEl.classList.remove('hidden');}
  else{totalEl.classList.add('hidden');}
  const tbody=document.getElementById('bs-tbody');
  const empty=document.getElementById('bs-empty');

  if(list.length===0){
    tbody.innerHTML='';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const langCls = (l) => l==='영어'?'text-purple-600 bg-purple-50 border-purple-200':l==='일본어'?'text-blue-600 bg-blue-50 border-blue-200':'text-slate-600 bg-slate-50 border-slate-200';
  tbody.innerHTML=list.map(v=>{
    const extrasHtml = v.extras.length > 0 ? v.extras.map(e => {
      const c = e.type==='등록'?{bg:'bg-emerald-50',border:'border-emerald-200',text:'text-emerald-700',icon:'ph-check-circle'}:
                e.type==='추가납부'?{bg:'bg-blue-50',border:'border-blue-200',text:'text-blue-700',icon:'ph-plus-circle'}:
                e.type==='정산비용'?{bg:'bg-amber-50',border:'border-amber-200',text:'text-amber-700',icon:'ph-bank'}:
                {bg:'bg-red-50',border:'border-red-200',text:'text-red-600',icon:'ph-arrow-counter-clockwise'};
      return `<div class="flex items-center gap-1.5 mt-1 px-1.5 py-1 rounded-md ${c.bg} ${c.border} border">
        <i class="ph-bold ${c.icon} text-[8px] ${c.text}"></i>
        <span class="text-[9px] font-black ${c.text}">${e.type}</span>
        <span class="text-[9px] font-black text-slate-700">${fmtMoney(e.amount)}</span>
        <span class="text-[8px] text-slate-400 font-mono ml-auto">${e.date}</span>
      </div>`;
    }).join('') : '';
    const hasRefund = v.history.some(h=>h.type==='환불');
    const refundSum = v.extras.filter(e=>e.type==='환불').reduce((s,e)=>s+e.amount, 0);
    const origTableAmt = v.amount + refundSum;
    return `<tr class="${hasRefund?'bg-red-50':''}">
    <td>
      <div class="flex items-center gap-1.5">
        <button class="text-[13px] font-black ${hasRefund?'text-red-500 hover:text-red-700':'text-brand-600 hover:text-brand-800'} hover:underline transition-colors" onclick="openBsDetail('${v.id}')">${v.name}</button>
      </div>
      <div class="text-[9px] font-mono text-slate-400 mt-0.5">${v.id}</div>
    </td>
    <td><span class="text-[12px] font-mono text-slate-600 cursor-pointer hover:text-brand-600" onclick="navigator.clipboard.writeText('${v.phone}');toast('복사됨')">${v.phone}</span></td>
    <td>
      <span class="status-pill ${v.statusCls} ${hasRefund?'opacity-50':''}">${v.statusLabel}</span>
      ${v.history.some(h=>h.type==='멤버십 변경')?'<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-100 text-purple-600 border border-purple-200 ml-1"><i class="ph-bold ph-arrows-clockwise text-[7px]"></i>변경</span>':''}
    </td>
    <td><span class="text-[10px] font-bold border px-1.5 py-0.5 rounded ${langCls(v.lang)}">${v.lang}</span></td>
    <td>${v.membership!=='-'?`<span class="text-[10px] font-bold border px-1.5 py-0.5 rounded ${v.membershipCls}">${v.membership}</span>`:'<span class="text-slate-300">-</span>'}</td>
    <td><span class="text-[11px] font-bold text-slate-500">${v.source}</span></td>
    <td><span class="text-[11px] font-bold text-slate-500">${v.payMethod}</span></td>
    <td>
      ${refundSum>0
        ? `<div class="flex items-baseline gap-1.5 flex-wrap">
            <span class="text-[12px] font-black text-slate-800">${fmtMoney(v.amount)}</span>
            <span class="text-[9px] text-slate-400 line-through font-mono">${fmtMoney(origTableAmt)}</span>
           </div>`
        : `<span class="text-[12px] font-black ${v.amount>0?'text-slate-800':'text-slate-300'}">${v.amount>0?fmtMoney(v.amount):'-'}</span>`}
      ${extrasHtml}
    </td>
    <td><span class="text-[10px] text-slate-400 font-mono">${v.docDate}</span></td>
    <td><span class="text-[10px] text-slate-400 font-mono">${v.payDate}</span></td>
    <td><span class="text-[10px] text-slate-400 font-mono">${v.startDate}</span></td>
    <td><span class="text-[10px] text-slate-400 font-mono">${v.endDate}</span></td>
    <td><input type="text" value="${v.memo}" placeholder="메모" class="text-[11px] border border-transparent hover:border-slate-200 focus:border-brand-500 rounded px-2 py-1 w-24 outline-none bg-transparent focus:bg-white transition-all" onblur="saveBsMemo('${v.id}',this.value)"></td>
    <td class="text-center">
      <div class="relative inline-block">
        <button onclick="toggleExtraMenu('${v.id}')" class="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all border border-slate-200"><i class="ph ph-plus-circle mr-0.5"></i>추가</button>
        <div id="extra-menu-${v.id}" class="hidden absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 w-28">
          <button onclick="addExtra('${v.id}','등록')" class="w-full text-left px-3 py-2 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"><i class="ph ph-check-circle"></i>등록</button>
          <button onclick="addExtra('${v.id}','추가납부')" class="w-full text-left px-3 py-2 text-[11px] font-bold text-brand-600 hover:bg-brand-50 transition-colors flex items-center gap-1.5"><i class="ph ph-plus"></i>추가납부</button>
          <button onclick="addExtra('${v.id}','환불')" class="w-full text-left px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5"><i class="ph ph-arrow-counter-clockwise"></i>환불</button>
        </div>
      </div>
    </td>
  </tr>`;}).join('');
}

let _activeStatuses = new Set(['all']);

function toggleStatusChip(btn){
  const st = btn.dataset.st;
  if(st === 'all'){
    _activeStatuses.clear();
    _activeStatuses.add('all');
  } else {
    _activeStatuses.delete('all');
    if(_activeStatuses.has(st)){
      _activeStatuses.delete(st);
    } else {
      _activeStatuses.add(st);
    }
    if(_activeStatuses.size === 0) _activeStatuses.add('all');
  }
  document.querySelectorAll('.bs-status-chip').forEach(c => c.classList.toggle('active', _activeStatuses.has(c.dataset.st)));
  renderTable();
}

function saveBsMemo(id,val){
  const v=visitors.find(x=>x.id===id);
  if(v){v.memo=val;toast('메모 저장');}
}

let _openExtraMenu = null;
function toggleExtraMenu(id){
  // Close any open menu
  if(_openExtraMenu && _openExtraMenu !== id){
    const prev = document.getElementById('extra-menu-'+_openExtraMenu);
    if(prev) prev.classList.add('hidden');
  }
  const menu = document.getElementById('extra-menu-'+id);
  menu.classList.toggle('hidden');
  _openExtraMenu = menu.classList.contains('hidden') ? null : id;
}

function addExtra(id, type){
  const v = visitors.find(x=>x.id===id);
  if(!v) return;
  const menu = document.getElementById('extra-menu-'+id);
  if(menu) menu.classList.add('hidden');
  _openExtraMenu = null;

  if(type === '환불'){
    openRefundModal(id);
    return;
  }
  if(type === '추가납부'){
    openAddPayModal(id);
    return;
  }
}

// ── Refund Modal ──
let _refundTargetId = null;
let _refundType = 'full';
let _refundMethod = '카드 취소';

function openRefundModal(id){
  const v = visitors.find(x=>x.id===id);
  if(!v) return;
  _refundTargetId = id;
  _refundType = 'full';
  _refundMethod = '카드 취소';

  document.getElementById('refund-member-name').textContent = `${v.name} (${v.id})`;
  document.getElementById('refund-pay-method').textContent = v.payMethod;
  document.getElementById('refund-pay-amount').textContent = v.amount>0?fmtMoney(v.amount):'-';
  document.getElementById('refund-pay-date').textContent = v.payDate;

  // Default: full amount
  document.getElementById('refund-amount').value = v.amount>0?v.amount.toLocaleString('ko-KR'):'';
  document.getElementById('refund-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('refund-reason').value = '';

  // Reset selections
  document.querySelectorAll('.refund-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.type==='full'));
  document.querySelectorAll('.refund-method-btn').forEach(b=>b.classList.toggle('active',b.dataset.method==='카드 취소'));
  document.querySelectorAll('.refund-reason-chip').forEach(b=>b.classList.remove('active'));

  selectRefundType('full');

  const modal = document.getElementById('refund-modal');
  const box = document.getElementById('refund-box');
  modal.style.visibility='visible';modal.style.opacity='1';modal.style.pointerEvents='auto';
  setTimeout(()=>{box.style.transform='scale(1) translateY(0)';},10);
}

function closeRefundModal(){
  const modal=document.getElementById('refund-modal');
  const box=document.getElementById('refund-box');
  box.style.transform='scale(0.95) translateY(8px)';
  modal.style.opacity='0';
  setTimeout(()=>{modal.style.visibility='hidden';modal.style.pointerEvents='none';},150);
  _refundTargetId=null;
}

// ── Add Payment Modal ──
let _addPayTargetId = null;
let _addPayMethod = '카드';

function openAddPayModal(id){
  const v = visitors.find(x=>x.id===id);
  if(!v) return;
  _addPayTargetId = id;
  _addPayMethod = '카드';

  document.getElementById('addpay-member-name').textContent = `${v.name} (${v.id})`;
  document.getElementById('addpay-pay-method').textContent = v.payMethod;
  document.getElementById('addpay-pay-amount').textContent = v.amount>0?fmtMoney(v.amount):'-';
  document.getElementById('addpay-pay-date').textContent = v.payDate;

  document.getElementById('addpay-amount').value = '';
  document.getElementById('addpay-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('addpay-memo').value = '';
  document.querySelectorAll('.addpay-method-btn').forEach(b=>b.classList.toggle('active',b.dataset.m==='카드'));

  const modal=document.getElementById('addpay-modal');
  const box=document.getElementById('addpay-box');
  modal.style.visibility='visible';modal.style.opacity='1';modal.style.pointerEvents='auto';
  setTimeout(()=>{box.style.transform='scale(1) translateY(0)';},10);
  setTimeout(()=>document.getElementById('addpay-amount').focus(),80);
}

function closeAddPayModal(){
  const modal=document.getElementById('addpay-modal');
  const box=document.getElementById('addpay-box');
  box.style.transform='scale(0.95) translateY(8px)';
  modal.style.opacity='0';
  setTimeout(()=>{modal.style.visibility='hidden';modal.style.pointerEvents='none';},150);
  _addPayTargetId=null;
}

function selectAddPayMethod(btn,method){
  _addPayMethod=method;
  document.querySelectorAll('.addpay-method-btn').forEach(b=>b.classList.toggle('active',b.dataset.m===method));
}

function formatAddPayAmount(el){
  const nums=el.value.replace(/[^0-9]/g,'');
  el.value=nums?parseInt(nums).toLocaleString('ko-KR'):'';
}

function submitAddPay(){
  const v=visitors.find(x=>x.id===_addPayTargetId);
  if(!v){toast('대상을 찾을 수 없습니다');return;}

  const amtStr=document.getElementById('addpay-amount').value.replace(/[^0-9]/g,'');
  const amount=parseInt(amtStr)||0;
  if(amount<=0){toast('금액을 입력하세요');document.getElementById('addpay-amount').focus();return;}

  const dateRaw=document.getElementById('addpay-date').value;
  const dateStr=dateRaw?dateRaw.replace(/-/g,'.'):(()=>{const t=new Date();return `${t.getFullYear()}.${String(t.getMonth()+1).padStart(2,'0')}.${String(t.getDate()).padStart(2,'0')}`;})();
  const memo=document.getElementById('addpay-memo').value.trim();

  v.extras.push({type:'추가납부', amount, date:dateStr, detail:`${_addPayMethod}${memo?` — ${memo}`:''}`});
  v.amount += amount;
  v.history.push({date:dateStr, type:'추가납부', desc:`${fmtMoney(amount)} (${_addPayMethod})${memo?` — ${memo}`:''}`, color:'blue'});
  v.history.sort((a,b)=>a.date.localeCompare(b.date));

  closeAddPayModal();
  toast(`추가 납부 ${fmtMoney(amount)} 처리 완료`);
  renderAll();
}

function selectRefundType(type){
  _refundType=type;
  document.querySelectorAll('.refund-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.type===type));
  const v=visitors.find(x=>x.id===_refundTargetId);
  if(!v) return;

  const isDeposit = type==='deposit';
  document.getElementById('refund-deposit-section').classList.toggle('hidden',!isDeposit);
  document.getElementById('refund-amount-section').classList.toggle('hidden',isDeposit);
  document.getElementById('refund-method-section').classList.toggle('hidden',isDeposit);
  document.getElementById('refund-date-section').classList.toggle('hidden',isDeposit);

  if(!isDeposit){
    const amtEl=document.getElementById('refund-amount');
    if(type==='full') amtEl.value=v.amount>0?v.amount.toLocaleString('ko-KR'):'';
    else amtEl.value='';
    amtEl.readOnly = type==='full';
    amtEl.classList.toggle('opacity-60',type==='full');
  } else {
    // Default deposit fields
    document.getElementById('refund-settle-amount').value='';
    document.getElementById('refund-settle-date').value=new Date().toISOString().split('T')[0];
    document.getElementById('refund-transfer-amount').value=v.amount>0?v.amount.toLocaleString('ko-KR'):'';
    document.getElementById('refund-transfer-date').value='';
    document.querySelectorAll('.settle-method-btn').forEach(b=>b.classList.toggle('active',b.dataset.sm==='카드'));
    _settleMethod='카드';
  }
}

let _settleMethod='카드';
function selectSettleMethod(btn,method){
  _settleMethod=method;
  document.querySelectorAll('.settle-method-btn').forEach(b=>b.classList.toggle('active',b.dataset.sm===method));
}

function selectRefundMethod(btn,method){
  _refundMethod=method;
  document.querySelectorAll('.refund-method-btn').forEach(b=>b.classList.toggle('active',b.dataset.method===method));
}

function setRefundReason(btn){
  const text=btn.textContent.trim();
  document.querySelectorAll('.refund-reason-chip').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const textarea=document.getElementById('refund-reason');
  if(text==='직접 입력'){textarea.value='';textarea.focus();}
  else{textarea.value=text;}
}

function formatRefundAmount(el){
  const nums=el.value.replace(/[^0-9]/g,'');
  el.value=nums?parseInt(nums).toLocaleString('ko-KR'):'';
}

function submitRefund(){
  const v=visitors.find(x=>x.id===_refundTargetId);
  if(!v){toast('대상을 찾을 수 없습니다');return;}

  const reason=document.getElementById('refund-reason').value.trim();
  if(!reason){toast('환불 사유를 입력하세요');document.getElementById('refund-reason').focus();return;}

  const todayFmt = () => { const t=new Date(); return `${t.getFullYear()}.${String(t.getMonth()+1).padStart(2,'0')}.${String(t.getDate()).padStart(2,'0')}`; };
  const typeLabels={'full':'전체 취소','partial':'부분 취소','deposit':'환불 정산 입금'};
  const typeLabel=typeLabels[_refundType]||'환불';

  if(_refundType==='deposit'){
    // 정산 입금 처리
    const settleStr=document.getElementById('refund-settle-amount').value.replace(/[^0-9]/g,'');
    const settleAmt=parseInt(settleStr)||0;
    const settleDate=(document.getElementById('refund-settle-date').value||'').replace(/-/g,'.')||todayFmt();
    const transferStr=document.getElementById('refund-transfer-amount').value.replace(/[^0-9]/g,'');
    const transferAmt=parseInt(transferStr)||0;
    const transferDate=(document.getElementById('refund-transfer-date').value||'').replace(/-/g,'.')||'-';

    if(settleAmt<=0&&transferAmt<=0){toast('정산 비용 또는 환불 금액을 입력하세요');return;}

    // 정산 비용 입금 기록
    if(settleAmt>0){
      v.extras.push({type:'정산비용', amount:settleAmt, date:settleDate, detail:`${_settleMethod} 결제`});
      v.history.push({date:settleDate, type:'정산비용 입금', desc:`${fmtMoney(settleAmt)} (${_settleMethod}) — ${reason}`, color:'amber'});
    }
    // 환불 이체 기록
    if(transferAmt>0){
      v.extras.push({type:'환불', amount:transferAmt, date:transferDate!=='-'?transferDate:todayFmt(), detail:`환불 정산 입금 / 이체 / ${reason}`});
      v.amount -= transferAmt;
      v.history.push({date:transferDate!=='-'?transferDate:todayFmt(), type:'환불 이체', desc:`${fmtMoney(transferAmt)} 이체 완료 — ${reason}`, color:'red'});
    }
    v.history.sort((a,b)=>a.date.localeCompare(b.date));
    closeRefundModal();
    toast(`환불 정산 처리 완료`);
  } else {
    // 전체/부분 취소
    const amtStr=document.getElementById('refund-amount').value.replace(/[^0-9]/g,'');
    const amount=parseInt(amtStr);
    if(isNaN(amount)||amount<=0){toast('환불 금액을 입력하세요');return;}

    const dateVal=document.getElementById('refund-date').value;
    const dateStr=dateVal?dateVal.replace(/-/g,'.'):todayFmt();

    v.extras.push({type:'환불', amount, date:dateStr, detail:`${typeLabel} / ${_refundMethod} / ${reason}`});
    v.amount -= amount;
    v.history.push({date:dateStr, type:'환불', desc:`${typeLabel} ${fmtMoney(amount)} (${_refundMethod}) — ${reason}`, color:'red'});
    v.history.sort((a,b)=>a.date.localeCompare(b.date));
    closeRefundModal();
    toast(`환불 ${fmtMoney(amount)} 처리 완료`);
  }
  renderAll();
}

// Close extra menu on outside click
document.addEventListener('click', (e) => {
  if(_openExtraMenu && !e.target.closest('[id^="extra-menu-"]') && !e.target.closest('[onclick*="toggleExtraMenu"]')){
    const menu = document.getElementById('extra-menu-'+_openExtraMenu);
    if(menu) menu.classList.add('hidden');
    _openExtraMenu = null;
  }
});

function openBsDetail(id){
  const v = visitors.find(x=>x.id===id);
  if(!v) return;
  const modal = document.getElementById('bs-detail-modal');
  const box = document.getElementById('bs-detail-box');
  const hasRefundInModal = v.history.some(h=>h.type==='환불');
  const nameEl = document.getElementById('bs-detail-name');
  nameEl.innerHTML = hasRefundInModal
    ? `${v.name} <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600 border border-red-300 align-middle"><i class="ph-bold ph-arrow-counter-clockwise text-[9px]"></i>환불</span>`
    : v.name;
  document.getElementById('bs-detail-phone').textContent = v.phone;
  const avatarEl = document.getElementById('bs-detail-avatar');
  const avatarIconEl = document.getElementById('bs-detail-avatar-icon');
  if(hasRefundInModal){
    avatarEl.className = 'w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center';
    avatarIconEl.className = 'ph-bold ph-user text-lg text-red-400';
  } else {
    avatarEl.className = 'w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center';
    avatarIconEl.className = 'ph-bold ph-user text-lg text-brand-500';
  }

  const langCls = (l) => l==='영어'?'text-purple-600 bg-purple-50 border-purple-200':l==='일본어'?'text-blue-600 bg-blue-50 border-blue-200':'text-slate-600 bg-slate-50 border-slate-200';
  const attColor = v.realAttRate>=80?'emerald':v.realAttRate>=50?'amber':'red';

  let html = '';

  // ── 기본 정보 ──
  html += `<div class="grid grid-cols-3 gap-3">
    <div class="${hasRefundInModal?'bg-red-50 border-red-200':'bg-slate-50 border-slate-100'} rounded-xl p-3 border">
      <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">상태</div>
      <span class="status-pill ${v.statusCls} ${hasRefundInModal?'opacity-50':''}">${v.statusLabel}</span>
      ${hasRefundInModal?'<div class="mt-1.5"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-600 border border-red-300"><i class="ph-bold ph-arrow-counter-clockwise text-[9px]"></i>환불</span></div>':''}
    </div>
    <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">언어</div>
      <span class="text-[11px] font-bold border px-2 py-0.5 rounded ${langCls(v.lang)}">${v.lang}</span>
    </div>
    <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">레벨</div>
      ${v.level!==null?(()=>{const c=['slate','emerald','blue','purple','amber'][v.level];return `<span class="text-[14px] font-black text-${c}-600">LV${v.level}</span>`;})():'<span class="text-[12px] font-bold text-slate-400">-</span>'}
    </div>
  </div>`;

  // ── 결제 정보 ──
  const modalRefundExtras = v.extras.filter(e=>e.type==='환불');
  const modalSettleExtras = v.extras.filter(e=>e.type==='정산비용');
  const modalRefundSum = modalRefundExtras.reduce((s,e)=>s+e.amount, 0);
  const modalOrigAmt = v.amount + modalRefundSum;
  html += `<div class="grid grid-cols-3 gap-3">
    <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">결제 방식</div>
      <span class="text-[12px] font-bold text-slate-600">${v.payMethod}</span>
    </div>
    <div class="${hasRefundInModal?'bg-red-50 border-red-200':'bg-slate-50 border-slate-100'} rounded-xl p-3 border">
      <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">${hasRefundInModal?'잔여 금액':'결제 금액'}</div>
      <span class="text-[14px] font-black ${hasRefundInModal?(v.amount>0?'text-slate-800':'text-red-600'):(v.amount>0?'text-slate-800':'text-slate-300')}">${hasRefundInModal?fmtMoney(v.amount):(v.amount>0?fmtMoney(v.amount):'-')}</span>
      ${hasRefundInModal?`<div class="text-[9px] text-slate-400 mt-0.5 font-mono">최초 <span class="line-through">${fmtMoney(modalOrigAmt)}</span></div>`:''}
    </div>
    <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">멤버십</div>
      <span class="text-[12px] font-black text-slate-800">${v.membership!=='-'?v.membership:'없음'}</span>
    </div>
  </div>`;
  // ── 환불 정산 내역 ──
  if(hasRefundInModal){
    const breakdownRows = [];
    breakdownRows.push(`<div class="flex items-center justify-between py-2 border-b border-red-100">
      <span class="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><i class="ph ph-credit-card text-slate-400"></i>최초 결제</span>
      <span class="text-[13px] font-black text-slate-700 font-mono">${fmtMoney(modalOrigAmt)}</span>
    </div>`);
    modalSettleExtras.forEach(e=>{
      breakdownRows.push(`<div class="flex items-center justify-between py-2 border-b border-red-100">
        <span class="text-[11px] font-bold text-amber-600 flex items-center gap-1.5"><i class="ph ph-bank text-amber-400"></i>정산비용 납부<span class="text-[9px] text-slate-400 font-mono ml-1">${e.date}</span></span>
        <span class="text-[12px] font-bold text-amber-600 font-mono">+${fmtMoney(e.amount)}</span>
      </div>`);
    });
    modalRefundExtras.forEach(e=>{
      breakdownRows.push(`<div class="flex items-center justify-between py-2 border-b border-red-100">
        <span class="text-[11px] font-bold text-red-500 flex items-center gap-1.5"><i class="ph ph-arrow-counter-clockwise text-red-400"></i>${e.detail||'환불'}<span class="text-[9px] text-slate-400 font-mono ml-1">${e.date}</span></span>
        <span class="text-[12px] font-bold text-red-500 font-mono">−${fmtMoney(e.amount)}</span>
      </div>`);
    });
    breakdownRows.push(`<div class="flex items-center justify-between pt-2.5">
      <span class="text-[12px] font-black text-slate-700">잔여 금액</span>
      <span class="text-[20px] font-black ${v.amount>0?'text-slate-800':'text-red-600'}">${fmtMoney(v.amount)}</span>
    </div>`);
    html += `<div class="bg-red-50 rounded-xl p-4 border border-red-200">
      <div class="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-arrow-counter-clockwise"></i>환불 정산 내역</div>
      ${breakdownRows.join('')}
    </div>`;
  }

  // ── 스터디 현황 ──
  if(v.status==='member'||v.status==='step'){
    // 참여율 클릭 시 펼쳐 보일 상세 (팀 + 최근 2주 세션 도트)
    const teamsArr = Array.isArray(v.teams) ? v.teams : [];
    // 팀명에서 요일 추출 (월수/화목/토일 + 단일 요일 모두 지원)
    const dowMap = { '일':0,'월':1,'화':2,'수':3,'목':4,'금':5,'토':6 };
    const teamSchedule = teamsArr.map(t => {
      const days = new Set();
      if (/월수/.test(t)) { days.add(1); days.add(3); }
      else if (/화목/.test(t)) { days.add(2); days.add(4); }
      else if (/토일/.test(t)) { days.add(6); days.add(0); }
      else if (/월화수목금/.test(t)) [1,2,3,4,5].forEach(d=>days.add(d));
      else if (/월화수목/.test(t))   [1,2,3,4].forEach(d=>days.add(d));
      else {
        ['일','월','화','수','목','금','토'].forEach((k) => { if (t.includes(k)) days.add(dowMap[k]); });
      }
      return { team: t, days: [...days] };
    }).filter(ts => ts.days.length > 0);

    // 최근 참여일(lastStudy) 기준 2주치
    const parseBsDate = (s) => { if (!s || s === '-') return null; const p = String(s).split('.'); if (p.length !== 3) return null; return new Date(+p[0], +p[1]-1, +p[2]); };
    const endDate = parseBsDate(v.lastStudy) || parseBsDate(v.startDate) || new Date();
    const startWin = new Date(endDate); startWin.setDate(endDate.getDate() - 13);

    let dotsHtml = '';
    if (teamSchedule.length > 0) {
      const fmtD = (d) => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
      const dowK = ['일','월','화','수','목','금','토'];
      const sessions = [];
      const cur = new Date(startWin);
      while (cur <= endDate) {
        teamSchedule.forEach(ts => {
          if (ts.days.includes(cur.getDay())) {
            sessions.push({ date: new Date(cur), team: ts.team });
          }
        });
        cur.setDate(cur.getDate() + 1);
      }
      // 시드 기반 출석/불참 결정 (이름+날짜 기반 — 이름 동일하면 동일하게 재현)
      const rate = Math.min(1, Math.max(0, (v.realAttRate || 70) / 100));
      const lastEpoch = endDate.getTime();
      const dots = sessions.map(s => {
        const isFuture = s.date.getTime() > lastEpoch;
        let cls, label;
        if (isFuture) { cls = 'bs-att-r'; label = '예정'; }
        else {
          const seed = (v.name || 'x').charCodeAt(0) + s.date.getDate() + s.date.getMonth();
          const r = ((seed * 9301 + 49297) % 233280) / 233280;
          if (r < rate) { cls = 'bs-att-o'; label = '출석'; } else { cls = 'bs-att-x'; label = '불참'; }
        }
        const tipText = `${fmtD(s.date)} (${dowK[s.date.getDay()]})\n${s.team}\n${label}`;
        return `<span class="bs-att-dot ${cls}" data-tip-date="${fmtD(s.date)} (${dowK[s.date.getDay()]})" data-tip-team="${s.team}" data-tip-status="${label}" title="${tipText}"></span>`;
      });
      dotsHtml = dots.length ? dots.join('') : '<span class="text-[10px] text-slate-400">최근 2주 세션 없음</span>';
    } else {
      // 팀 정보가 없을 때는 기존 카운트 기반 표현
      const totalSlots = v.totalSessions || 0;
      const dots = [];
      const att = Math.max(0, Math.min(totalSlots, v.attended || 0));
      const abs = Math.max(0, Math.min(totalSlots - att, v.absent || 0));
      const sample = Math.min(14, totalSlots);
      const ratio = totalSlots ? sample / totalSlots : 0;
      const sAtt = Math.round(att * ratio), sAbs = Math.round(abs * ratio), sRem = sample - sAtt - sAbs;
      for (let i = 0; i < sAtt; i++) dots.push('<span class="bs-att-dot bs-att-o" title="출석"></span>');
      for (let i = 0; i < sAbs; i++) dots.push('<span class="bs-att-dot bs-att-x" title="불참"></span>');
      for (let i = 0; i < Math.max(0, sRem); i++) dots.push('<span class="bs-att-dot bs-att-r" title="잔여"></span>');
      dotsHtml = dots.length ? dots.join('') : '<span class="text-[10px] text-slate-400">세션 정보 없음</span>';
    }
    const teamsHtml = teamsArr.length
      ? teamsArr.map(t => {
          const isEng = String(t).startsWith('영');
          const dot = isEng ? '#9B59B6' : '#007BFF';
          const bg  = isEng ? '#f5eafa' : '#e6f0ff';
          const txt = isEng ? '#9B59B6' : '#007BFF';
          return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap" style="background:${bg};color:${txt};border-left:3px solid ${dot};">${t}</span>`;
        }).join('')
      : '<span class="text-[10px] text-slate-400 italic">참여 팀 정보 없음</span>';
    const attDetailHtml = `<div id="bs-att-detail" class="hidden mt-3 pt-3 border-t border-slate-200 space-y-3">
      <div>
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><i class="ph-fill ph-users-three text-brand-500"></i>참여 팀</div>
        <div class="flex flex-wrap gap-1.5">${teamsHtml}</div>
      </div>
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><i class="ph-fill ph-calendar-check text-brand-500"></i>최근 2주 세션 <span class="ml-1 text-[9px] font-semibold text-slate-400 normal-case tracking-normal">(마지막 참여일 ${v.lastStudy||'-'} 기준)</span></div>
          <div class="flex items-center gap-2 text-[9px] font-bold text-slate-500">
            <span class="inline-flex items-center gap-1"><span class="bs-att-dot bs-att-o"></span>출석</span>
            <span class="inline-flex items-center gap-1"><span class="bs-att-dot bs-att-x"></span>불참</span>
            <span class="inline-flex items-center gap-1"><span class="bs-att-dot bs-att-r"></span>예정</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-[3px]">${dotsHtml}</div>
        <p class="text-[9.5px] text-slate-400 mt-1.5"><i class="ph ph-info"></i> 도트에 마우스를 올리면 날짜 · 참여 팀 · 출석 상태가 표시됩니다.</p>
      </div>
    </div>`;

    html += `<div class="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200">
      <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-book-open text-brand-500"></i>스터디 현황 <span class="ml-1 text-[9px] font-semibold text-slate-400 normal-case tracking-normal">참여율 클릭 시 상세 보기</span></div>
      <div class="grid grid-cols-3 gap-3 mb-2">
        <button type="button" onclick="document.getElementById('bs-att-detail').classList.toggle('hidden')" class="text-center hover:bg-white rounded-lg transition-colors py-1 cursor-pointer group">
          <div class="text-[9px] text-slate-400 font-bold mb-0.5 group-hover:text-brand-600">실제 참석률 <i class="ph ph-caret-down text-[8px] ml-0.5"></i></div>
          <div class="text-xl font-black text-${attColor}-600 group-hover:underline">${v.realAttRate}%</div>
          <div class="text-[10px] font-black text-${attColor}-400">${v.attended - v.absent}회</div>
          <div class="text-[9px] text-slate-400 leading-none">불참 ${v.absent}회</div>
        </button>
        <div class="text-center">
          <div class="text-[9px] text-slate-400 font-bold mb-0.5">참석/전체</div>
          <div class="text-xl font-black text-slate-800">${v.attended}<span class="text-sm text-slate-400">/${v.totalSessions}</span></div>
        </div>
        <div class="text-center">
          <div class="text-[9px] text-slate-400 font-bold mb-0.5">잔여 횟수</div>
          <div class="text-xl font-black text-brand-600">${v.remaining}</div>
        </div>
      </div>
      <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div class="h-full bg-${attColor}-500 rounded-full transition-all" style="width:${v.realAttRate}%"></div>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div class="text-center">
          <div class="text-[11px] font-black text-slate-700">${v.startDate}</div>
          <div class="text-[9px] text-slate-400 font-bold">시작일</div>
        </div>
        <div class="text-center">
          <div class="text-[11px] font-black text-slate-700">${v.lastStudy}</div>
          <div class="text-[9px] text-slate-400 font-bold">마지막 참여</div>
        </div>
        <div class="text-center">
          <div class="text-[11px] font-black text-${v.endDate!=='-'&&v.endDate<'2026-04-28'?'red':'slate'}-700">${v.endDate}</div>
          <div class="text-[9px] text-slate-400 font-bold">종료일</div>
        </div>
      </div>
      ${attDetailHtml}
    </div>`;
  }

  // ── 일정 타임라인 ──
  html += `<div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
    <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">일정</div>
    <div class="grid grid-cols-2 gap-2 text-[11px]">
      <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span><span class="text-slate-500 w-16">자료 등록</span><span class="font-mono text-slate-700">${v.docDate}</span></div>
      <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span><span class="text-slate-500 w-16">결제일</span><span class="font-mono text-slate-700">${v.payDate}</span></div>
      <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span class="text-slate-500 w-16">스터디 시작</span><span class="font-mono text-slate-700">${v.startDate}</span></div>
      <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span><span class="text-slate-500 w-16">종료</span><span class="font-mono text-slate-700">${v.endDate}</span></div>
    </div>
  </div>`;

  // ── 전체 히스토리 타임라인 ──
  const allHistory = [...v.history];
  // 환불/정산비용은 history에 이미 존재 — 등록/추가납부만 extras에서 추가
  v.extras.filter(e=>e.type==='등록'||e.type==='추가납부').forEach(e => {
    allHistory.push({date:e.date, type:e.type, desc:`${fmtMoney(e.amount)}`, color:e.type==='등록'?'emerald':'brand'});
  });
  allHistory.sort((a,b)=>a.date.localeCompare(b.date));

  const typeIcons = {
    '자료등록':'ph-file-text','결제':'ph-credit-card','1차 결제':'ph-credit-card','2차 결제':'ph-credit-card',
    '스터디 시작':'ph-play-circle','멤버십 변경':'ph-arrows-clockwise','레벨업':'ph-trend-up',
    '환불':'ph-arrow-counter-clockwise','지점 이동':'ph-map-pin','등록':'ph-check-circle','추가납부':'ph-plus-circle'
  };
  const colorMap = {slate:'#94a3b8',brand:'#0ea5e9',emerald:'#10b981',red:'#ef4444',purple:'#a855f7',amber:'#f59e0b',blue:'#3b82f6',indigo:'#6366f1'};

  html += `<div class="bg-white rounded-xl p-4 border border-slate-200">
    <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><i class="ph-fill ph-clock-counter-clockwise text-brand-500"></i>전체 히스토리</div>
    <div class="relative pl-6">
      <div class="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200"></div>
      ${allHistory.map(h => {
        const icon = typeIcons[h.type] || 'ph-circle';
        const c = colorMap[h.color] || '#94a3b8';
        const isRefund = h.type==='환불'||h.type==='환불 이체';
        return `<div class="relative flex items-start gap-3 mb-2.5 last:mb-0 ${isRefund?'bg-red-50 border border-red-200 rounded-lg px-2 py-2 -mx-1':''}">
          <div class="absolute left-[-20px] w-[17px] h-[17px] rounded-full border-2 bg-white flex items-center justify-center flex-shrink-0" style="border-color:${c};top:${isRefund?'10px':'2px'};">
            <i class="ph-bold ${icon}" style="font-size:8px;color:${c};"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black" style="background:${c}22;color:${c};border:1px solid ${c}40;">
                <i class="ph-bold ${icon}" style="font-size:8px;"></i>${h.type}
              </span>
              <span class="text-[10px] text-slate-400 font-mono ml-auto">${h.date}</span>
            </div>
            <div class="text-[11px] text-slate-600 mt-1 font-medium">${h.desc}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // ── 메모 ──
  html += `<div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
    <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">메모</div>
    <div class="text-[12px] text-slate-600">${v.memo || '<span class="text-slate-300 italic">메모 없음</span>'}</div>
  </div>`;

  document.getElementById('bs-detail-body').innerHTML = html;
  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
  setTimeout(() => { box.style.transform = 'scale(1) translateY(0)'; }, 10);
}

// ── 세션 도트 hover 툴팁 ──
(function(){
  const tip = () => document.getElementById('bs-att-tip');
  document.addEventListener('mouseover', (e) => {
    const dot = e.target.closest && e.target.closest('.bs-att-dot');
    if (!dot || !dot.dataset.tipDate) return;
    const t = tip(); if (!t) return;
    const status = dot.dataset.tipStatus || '';
    const sCls = status === '출석' ? 'tip-o' : status === '불참' ? 'tip-x' : 'tip-r';
    t.innerHTML = `<div class="tip-date">${dot.dataset.tipDate}</div>
      <div class="tip-team">${dot.dataset.tipTeam}</div>
      <span class="tip-status ${sCls}">${status}</span>`;
    t.classList.add('is-visible');
    positionTip(e, t);
  });
  document.addEventListener('mousemove', (e) => {
    const dot = e.target.closest && e.target.closest('.bs-att-dot');
    if (!dot) return;
    const t = tip(); if (!t || !t.classList.contains('is-visible')) return;
    positionTip(e, t);
  });
  document.addEventListener('mouseout', (e) => {
    const dot = e.target.closest && e.target.closest('.bs-att-dot');
    if (!dot) return;
    const t = tip(); if (!t) return;
    t.classList.remove('is-visible');
  });
  function positionTip(e, t) {
    const off = 14;
    const r = t.getBoundingClientRect();
    let x = e.clientX + off;
    let y = e.clientY - r.height - off;
    if (x + r.width > window.innerWidth - 8) x = e.clientX - r.width - off;
    if (y < 8) y = e.clientY + off;
    t.style.left = x + 'px';
    t.style.top  = y + 'px';
  }
})();

function closeBsDetail(){
  const modal = document.getElementById('bs-detail-modal');
  const box = document.getElementById('bs-detail-box');
  box.style.transform = 'scale(0.95) translateY(8px)';
  modal.style.opacity = '0';
  setTimeout(() => { modal.style.visibility = 'hidden'; modal.style.pointerEvents = 'none'; }, 150);
  // iframe 임베드 모드에서는 부모에게 닫기 알림
  try {
    if (window.parent !== window && window.parent.postMessage) {
      window.parent.postMessage({ type: 'bs-detail-close' }, '*');
    }
  } catch(e) {}
}

function updateBasisUI(){
  // 헤더 옆 컨텍스트 배지 — 재무 모드(결제일/시작일)일 때만 노출
  const badge = document.getElementById('bs-basis-badge');
  const txt   = document.getElementById('bs-basis-badge-text');
  if(badge && txt){
    if(bsBasis === 'regDate'){
      badge.classList.add('hidden'); badge.classList.remove('inline-flex');
    } else {
      badge.classList.remove('hidden'); badge.classList.add('inline-flex');
      txt.textContent = `${basisLabel()} 기준 · 결제자만`;
    }
  }
  // 테이블 헤더/바디 컬럼 강조 — 활성 기준일 컬럼만 하이라이트
  const ths = document.querySelectorAll('.bs-table th[data-basis]');
  let activeColIdx = -1;
  ths.forEach((th, idx) => {
    const isActive = th.dataset.basis === bsBasis && bsBasis !== 'regDate';
    th.classList.toggle('bs-basis-active', isActive);
    if(isActive){
      // 헤더 인덱스(전체 th 중 위치)를 찾아 td에도 적용
      const allThs = Array.from(th.parentNode.children);
      activeColIdx = allThs.indexOf(th);
    }
  });
  // td 강조 (활성 컬럼만)
  document.querySelectorAll('.bs-table tbody tr').forEach(tr => {
    Array.from(tr.children).forEach((td, i) => {
      td.classList.toggle('bs-basis-active', i === activeColIdx);
    });
  });
}

function renderAll(){
  renderKPIs();
  renderCharts();
  renderTable();
  updateBasisUI();
}

function switchBsTab(tab){
  document.querySelectorAll('.bs-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  document.querySelectorAll('.bs-tab-panel').forEach(p=>p.classList.add('hidden'));
  document.getElementById(`bs-tab-${tab}`).classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded',()=>{
  // Drawer is wired via js/shared/drawer.js (loadNav + tDrawer global)

  // 기준일 셀렉트 (재무 모드 토글) — 결제일/스터디시작일 모드 선택 시 결제자만 자동 노출
  const basisSel = document.getElementById('bs-basis');
  if(basisSel){
    basisSel.addEventListener('change', e => {
      bsBasis = e.target.value;
      renderAll();
    });
  }

  // Period buttons
  document.querySelectorAll('.bs-period').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.bs-period').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      bsPeriod=btn.dataset.period;
      const customEl=document.getElementById('bs-custom-range');
      if(bsPeriod==='custom'){
        customEl.classList.remove('hidden');
        if(!_bsRangeOpen) toggleBsRangePicker();
      } else {
        customEl.classList.add('hidden');
        closeBsRangePicker();
        bsCustomFrom=null;
        bsCustomTo=null;
        renderAll();
      }
    };
  });

  genVisitors();
  renderAll();
  applyBsStatsState(false);

  // ── URL ?member=이름 또는 ?modalOnly=이름 처리 ──
  try {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get('modalOnly') || params.get('member');
    const modalOnly = !!params.get('modalOnly');
    if (modalOnly) {
      // hide-CSS는 <head> 인라인 스타일로 이미 적용됨 (깜빡임 방지)
      // 외부 페이지에서 sessionStorage 로 멤버 데이터를 주입했다면, 그걸 우선 사용
      try {
        const raw = sessionStorage.getItem('bs-injected-member');
        if (raw) {
          const injected = JSON.parse(raw);
          if (injected && injected.id) {
            visitors.unshift(injected);
            sessionStorage.removeItem('bs-injected-member');
            setTimeout(() => openBsDetail(injected.id), 200);
            return; // wanted 검색 단계 건너뜀
          }
        }
      } catch(e) {}
    }
    if (wanted) {
      const tryOpen = () => {
        const target = visitors.find(v => v.name === wanted)
                    || visitors.find(v => v.name.includes(wanted))
                    || (visitors.length ? visitors[0] : null);
        if (target) openBsDetail(target.id);
      };
      setTimeout(tryOpen, 200);
    }
  } catch(e) {}
});

// ── Stats Detail Modal ──
function openStatsDetail(type, subId){
  const fv = filteredVisitors();
  const modal = document.getElementById('bs-stats-detail-modal');
  const box = document.getElementById('bs-stats-detail-box');
  const titleEl = document.getElementById('bs-stats-detail-title');
  const body = document.getElementById('bs-stats-detail-body');
  const totalVisitors = fv.length;

  function barRow(label, cls, value, maxVal, rightA, rightB){
    const pct = maxVal>0?Math.round(value/maxVal*100):0;
    return `<div class="flex items-center gap-2.5 py-1">
      <span class="text-[10px] font-bold text-slate-600 w-20 shrink-0">${label}</span>
      <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div class="h-full ${cls} rounded-full" style="width:${pct}%"></div></div>
      <span class="text-[10px] font-black text-slate-700 font-mono w-10 text-right shrink-0">${rightA}</span>
      ${rightB!==undefined?`<span class="text-[9px] text-slate-400 font-mono w-24 text-right shrink-0">${rightB}</span>`:''}
    </div>`;
  }

  let titleHtml='', html='';

  if(type==='revenue'){
    titleHtml='<i class="ph-fill ph-chart-line text-brand-500 mr-1"></i>매출 상세 분석';
    const grossRev=fv.reduce((s,v)=>s+v.amount+v.extras.filter(e=>e.type==='환불').reduce((r,e)=>r+e.amount,0),0);
    const refundAmt=fv.reduce((s,v)=>s+v.extras.filter(e=>e.type==='환불').reduce((r,e)=>r+e.amount,0),0);
    const netRev=fv.reduce((s,v)=>s+v.amount,0);
    const settleAmt=fv.reduce((s,v)=>s+v.extras.filter(e=>e.type==='정산비용').reduce((r,e)=>r+e.amount,0),0);
    const refundList=fv.filter(v=>v.extras.some(e=>e.type==='환불'));
    const refundRate=grossRev>0?(refundAmt/grossRev*100).toFixed(1):'0.0';
    const paying=fv.filter(v=>v.amount>0||v.extras.some(e=>e.type==='환불')).length;
    const avgNet=paying>0?Math.round(netRev/paying):0;

    const payBreak={};
    fv.forEach(v=>{if(v.payMethod!=='-'){if(!payBreak[v.payMethod])payBreak[v.payMethod]={c:0,r:0};payBreak[v.payMethod].c++;payBreak[v.payMethod].r+=v.amount;}});
    const maxPay=Math.max(...Object.values(payBreak).map(d=>d.r),1);

    const msBreak=MEMBERSHIPS.map(ms=>{const it=fv.filter(v=>v.membership===ms.name);return{name:ms.name,cls:ms.cls,c:it.length,r:it.reduce((s,v)=>s+v.amount,0)};}).filter(d=>d.c>0);
    const maxMs=Math.max(...msBreak.map(d=>d.r),1);

    html=`
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">총 결제 금액</div>
        <div class="text-[17px] font-black text-slate-700">${fmtMoney(grossRev)}</div>
        <div class="text-[9px] text-slate-400 mt-0.5">환불 전 기준</div>
      </div>
      <div class="bg-red-50 rounded-xl p-4 border border-red-200">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">환불 금액</div>
        <div class="text-[17px] font-black text-red-600">−${fmtMoney(refundAmt)}</div>
        <div class="text-[9px] text-slate-400 mt-0.5">${refundList.length}건 · ${refundRate}%</div>
      </div>
      <div class="bg-brand-50 rounded-xl p-4 border border-brand-100">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">순 매출</div>
        <div class="text-[17px] font-black text-brand-600">${fmtMoney(netRev)}</div>
        <div class="text-[9px] text-slate-400 mt-0.5">평균 객단가 ${fmtMoney(avgNet)}</div>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-xl p-3 border border-slate-200 text-center">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">환불률</div>
        <div class="text-2xl font-black text-red-500">${refundRate}%</div>
        <div class="text-[9px] text-slate-400">금액 기준</div>
      </div>
      <div class="bg-white rounded-xl p-3 border border-slate-200 text-center">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">환불 건수</div>
        <div class="text-2xl font-black text-slate-700">${refundList.length}<span class="text-sm font-bold text-slate-400 ml-0.5">건</span></div>
        <div class="text-[9px] text-slate-400">전체 ${fv.length}명 중</div>
      </div>
      <div class="bg-white rounded-xl p-3 border border-slate-200 text-center">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">정산 수입</div>
        <div class="text-2xl font-black text-amber-600">${fmtMoney(settleAmt)}</div>
        <div class="text-[9px] text-slate-400">환불 정산 비용</div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-4 border border-slate-200">
      <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-credit-card text-slate-400"></i>결제 방식별</div>
      <div class="space-y-1">${Object.entries(payBreak).sort((a,b)=>b[1].r-a[1].r).map(([m,d])=>barRow(m,'bg-brand-400',d.r,maxPay,d.c+'건',fmtMoney(d.r))).join('')}</div>
    </div>
    <div class="bg-white rounded-xl p-4 border border-slate-200">
      <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-medal text-slate-400"></i>멤버십별 매출</div>
      <div class="space-y-1">${msBreak.map(d=>`<div class="flex items-center gap-2.5 py-1"><span class="text-[10px] font-bold border px-1.5 py-0.5 rounded ${d.cls} w-14 text-center shrink-0">${d.name}</span><div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-brand-400 rounded-full" style="width:${Math.round(d.r/maxMs*100)}%"></div></div><span class="text-[9px] text-slate-400 w-6 text-right shrink-0">${d.c}명</span><span class="text-[10px] font-black text-slate-700 font-mono w-28 text-right shrink-0">${fmtMoney(d.r)}</span></div>`).join('')}</div>
    </div>
    ${refundList.length>0?`<div class="bg-red-50 rounded-xl p-4 border border-red-200">
      <div class="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-arrow-counter-clockwise"></i>환불 내역 (${refundList.length}건)</div>
      <div class="divide-y divide-red-100">${refundList.map(v=>{const ra=v.extras.filter(e=>e.type==='환불').reduce((s,e)=>s+e.amount,0);const rd=v.extras.find(e=>e.type==='환불');return`<div class="flex items-center gap-2 py-1.5"><button class="text-[12px] font-black text-red-500 hover:underline" onclick="closeStatsDetail();openBsDetail('${v.id}')">${v.name}</button><span class="text-[9px] text-slate-400 font-mono">${rd?rd.detail:''}</span><span class="text-[10px] text-slate-400 font-mono ml-auto">${rd?rd.date:''}</span><span class="text-[11px] font-bold text-red-500 font-mono">−${fmtMoney(ra)}</span></div>`;}).join('')}</div>
    </div>`:''}`;

  } else if(type==='status'){
    const st=STATUSES.find(s=>s.id===subId);
    titleHtml=`<span class="status-pill ${st.cls}">${st.label}</span><span class="ml-2 font-black text-slate-700">상세</span>`;
    const items=fv.filter(v=>v.status===subId);
    const stRev=items.reduce((s,v)=>s+v.amount,0);
    const refItems=items.filter(v=>v.extras.some(e=>e.type==='환불'));
    const refAmt=items.reduce((s,v)=>s+v.extras.filter(e=>e.type==='환불').reduce((r,e)=>r+e.amount,0),0);
    const grossRev=stRev+refAmt;
    const refRate=grossRev>0?(refAmt/grossRev*100).toFixed(1):'0.0';
    const stPct=totalVisitors>0?Math.round(items.length/totalVisitors*100):0;
    const avgAmt=items.filter(v=>v.amount>0).length>0?Math.round(stRev/items.filter(v=>v.amount>0).length):0;

    const msBreak=MEMBERSHIPS.map(ms=>{const it=items.filter(v=>v.membership===ms.name);return{name:ms.name,cls:ms.cls,c:it.length,r:it.reduce((s,v)=>s+v.amount,0)};}).filter(d=>d.c>0);
    const maxMs=Math.max(...msBreak.map(d=>d.c),1);
    const langMap={'영어':'bg-purple-400','일본어':'bg-blue-400','영어+일본어':'bg-slate-400'};
    const langBreak=['영어','일본어','영어+일본어'].map(l=>({l,c:items.filter(v=>v.lang===l).length})).filter(d=>d.c>0);
    const maxLang=Math.max(...langBreak.map(d=>d.c),1);
    const srcBreak=SOURCES.map(s=>({s,c:items.filter(v=>v.source===s).length})).filter(d=>d.c>0).sort((a,b)=>b.c-a.c);
    const maxSrc=Math.max(...srcBreak.map(d=>d.c),1);

    html=`
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">인원</div>
        <div class="text-2xl font-black text-slate-800">${items.length}<span class="text-sm font-bold text-slate-400 ml-1">명</span></div>
        <div class="text-[9px] text-slate-400 mt-0.5">전체의 ${stPct}%</div>
      </div>
      <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">순 매출</div>
        <div class="text-[16px] font-black text-brand-600">${fmtMoney(stRev)}</div>
        <div class="text-[9px] text-slate-400 mt-0.5">평균 ${fmtMoney(avgAmt)}</div>
      </div>
      <div class="bg-${refItems.length>0?'red-50 border-red-200':'slate-50 border-slate-100'} rounded-xl p-4 border text-center">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">환불률</div>
        <div class="text-2xl font-black text-${refItems.length>0?'red-500':'slate-300'}">${refRate}%</div>
        <div class="text-[9px] text-slate-400 mt-0.5">${refItems.length}건 · −${fmtMoney(refAmt)}</div>
      </div>
    </div>
    ${msBreak.length>0?`<div class="bg-white rounded-xl p-4 border border-slate-200">
      <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-medal text-slate-400"></i>멤버십 구성</div>
      <div class="space-y-1">${msBreak.map(d=>`<div class="flex items-center gap-2.5 py-1"><span class="text-[10px] font-bold border px-1.5 py-0.5 rounded ${d.cls} w-14 text-center shrink-0">${d.name}</span><div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-brand-400 rounded-full" style="width:${Math.round(d.c/maxMs*100)}%"></div></div><span class="text-[9px] text-slate-400 w-6 text-right shrink-0">${d.c}명</span><span class="text-[10px] font-black text-slate-700 font-mono w-28 text-right shrink-0">${fmtMoney(d.r)}</span></div>`).join('')}</div>
    </div>`:''}
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white rounded-xl p-4 border border-slate-200">
        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-translate text-slate-400"></i>언어</div>
        <div class="space-y-1">${langBreak.map(d=>barRow(d.l,langMap[d.l]||'bg-slate-400',d.c,maxLang,d.c+'명',undefined)).join('')}</div>
      </div>
      <div class="bg-white rounded-xl p-4 border border-slate-200">
        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-funnel text-slate-400"></i>유입 경로</div>
        <div class="space-y-1">${srcBreak.map(d=>barRow(d.s,'bg-brand-400',d.c,maxSrc,d.c+'명',undefined)).join('')}</div>
      </div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><i class="ph-fill ph-users text-slate-400"></i>멤버 목록</div>
        <span class="text-[9px] font-bold text-slate-400">${items.length}명</span>
      </div>
      <div class="divide-y divide-slate-50 max-h-48 overflow-y-auto">${items.map(v=>{const hasRef=v.extras.some(e=>e.type==='환불');return`<div class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 ${hasRef?'bg-red-50/50':''}"><button class="text-[12px] font-black text-brand-600 hover:underline shrink-0" onclick="closeStatsDetail();openBsDetail('${v.id}')">${v.name}</button>${hasRef?'<span class="text-[8px] font-black bg-red-100 text-red-500 px-1 py-0.5 rounded">환불</span>':''}<span class="text-[10px] text-slate-400 font-mono ml-auto">${v.membership!=='-'?v.membership:''}</span><span class="text-[11px] font-bold text-slate-600 font-mono w-24 text-right">${v.amount>0?fmtMoney(v.amount):'-'}</span></div>`;}).join('')}</div>
    </div>`;

  } else if(type==='visitors'){
    titleHtml='<i class="ph-fill ph-users text-slate-600 mr-1"></i>방문자 상세';
    const srcBreak=SOURCES.map(s=>({s,c:fv.filter(v=>v.source===s).length})).filter(d=>d.c>0).sort((a,b)=>b.c-a.c);
    const maxSrc=Math.max(...srcBreak.map(d=>d.c),1);
    const langBreak=['영어','일본어','영어+일본어'].map(l=>({l,c:fv.filter(v=>v.lang===l).length})).filter(d=>d.c>0);
    const maxLang=Math.max(...langBreak.map(d=>d.c),1);
    const langMap={'영어':'bg-purple-400','일본어':'bg-blue-400','영어+일본어':'bg-slate-400'};

    html=`
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white rounded-xl p-4 border border-slate-200">
        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-chart-pie text-slate-400"></i>상태별 분포</div>
        <div class="space-y-1">${STATUSES.map(st=>{const c=fv.filter(v=>v.status===st.id).length;return barRow(st.label,'bg-brand-400',c,totalVisitors,c+'명',undefined);}).join('')}</div>
      </div>
      <div class="bg-white rounded-xl p-4 border border-slate-200">
        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-translate text-slate-400"></i>언어별 분포</div>
        <div class="space-y-1">${langBreak.map(d=>barRow(d.l,langMap[d.l]||'bg-slate-400',d.c,maxLang,d.c+'명',undefined)).join('')}</div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-4 border border-slate-200">
      <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-funnel text-slate-400"></i>유입 경로별</div>
      <div class="space-y-1">${srcBreak.map(d=>barRow(d.s,'bg-brand-400',d.c,maxSrc,d.c+'명',undefined)).join('')}</div>
    </div>
    <div class="grid grid-cols-4 gap-3">${STATUSES.map(st=>{const it=fv.filter(v=>v.status===st.id);const pct=totalVisitors>0?Math.round(it.length/totalVisitors*100):0;return`<div class="bg-white rounded-xl p-4 border border-slate-100 text-center cursor-pointer hover:shadow-md transition-all" onclick="closeStatsDetail();openStatsDetail('status','${st.id}')"><div class="status-pill ${st.cls} justify-center mb-2">${st.label}</div><div class="text-2xl font-black text-slate-800">${it.length}</div><div class="text-[9px] text-slate-400 mt-0.5">${pct}%</div></div>`;}).join('')}</div>`;

  } else if(type==='avg'){
    titleHtml='<i class="ph-fill ph-coins text-slate-600 mr-1"></i>평균 객단가 분석';

    const memberItems=fv.filter(v=>v.status==='member'&&v.amount>0);
    const depositItems=fv.filter(v=>v.status==='deposit'&&v.amount>0);
    const stepItems=fv.filter(v=>v.status==='step'&&v.amount>0);
    const avgMember=memberItems.length?Math.round(memberItems.reduce((s,v)=>s+v.amount,0)/memberItems.length):0;
    const avgDeposit=depositItems.length?Math.round(depositItems.reduce((s,v)=>s+v.amount,0)/depositItems.length):0;
    const avgStep=stepItems.length?Math.round(stepItems.reduce((s,v)=>s+v.amount,0)/stepItems.length):0;

    // 멤버십 등급별 평균
    const msAvg=MEMBERSHIPS.map(ms=>{
      const it=memberItems.filter(v=>v.membership===ms.name);
      return{name:ms.name,cls:ms.cls,count:it.length,avg:it.length?Math.round(it.reduce((s,v)=>s+v.amount,0)/it.length):0};
    }).filter(d=>d.count>0);
    const maxMsAvg=Math.max(...msAvg.map(d=>d.avg),1);

    // 언어별 평균
    const langAvg=['영어','일본어','영어+일본어'].map(l=>{
      const it=memberItems.filter(v=>v.lang===l);
      return{l,count:it.length,avg:it.length?Math.round(it.reduce((s,v)=>s+v.amount,0)/it.length):0};
    }).filter(d=>d.count>0);
    const maxLangAvg=Math.max(...langAvg.map(d=>d.avg),1);
    const langCls={'영어':'bg-purple-400','일본어':'bg-blue-400','영어+일본어':'bg-slate-400'};

    // 유입 경로별 평균
    const srcAvg=SOURCES.map(s=>{
      const it=memberItems.filter(v=>v.source===s);
      return{s,count:it.length,avg:it.length?Math.round(it.reduce((s2,v)=>s2+v.amount,0)/it.length):0};
    }).filter(d=>d.count>0).sort((a,b)=>b.avg-a.avg);
    const maxSrcAvg=Math.max(...srcAvg.map(d=>d.avg),1);

    // 최고/최저
    const sorted=[...memberItems].sort((a,b)=>b.amount-a.amount);
    const topItems=sorted.slice(0,3);
    const botItems=sorted.slice(-3).reverse();

    html=`
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">멤버 평균</div>
        <div class="text-[17px] font-black text-emerald-700">${fmtMoney(avgMember)}</div>
        <div class="text-[9px] text-slate-400 mt-0.5">${memberItems.length}명 기준</div>
      </div>
      <div class="bg-amber-50 rounded-xl p-4 border border-amber-200 text-center">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">디파짓 평균</div>
        <div class="text-[17px] font-black text-amber-700">${fmtMoney(avgDeposit)}</div>
        <div class="text-[9px] text-slate-400 mt-0.5">${depositItems.length}명 기준</div>
      </div>
      <div class="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">스텝 평균</div>
        <div class="text-[17px] font-black text-purple-700">${fmtMoney(avgStep)}</div>
        <div class="text-[9px] text-slate-400 mt-0.5">${stepItems.length}명 기준</div>
      </div>
    </div>
    <div class="bg-white rounded-xl p-4 border border-slate-200">
      <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-medal text-slate-400"></i>멤버십 등급별 평균 객단가</div>
      <div class="space-y-1.5">${msAvg.map(d=>`<div class="flex items-center gap-2.5"><span class="text-[10px] font-bold border px-1.5 py-0.5 rounded ${d.cls} w-14 text-center shrink-0">${d.name}</span><div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-brand-400 rounded-full" style="width:${Math.round(d.avg/maxMsAvg*100)}%"></div></div><span class="text-[9px] text-slate-400 w-6 text-right shrink-0">${d.count}명</span><span class="text-[11px] font-black text-slate-700 font-mono w-28 text-right shrink-0">${fmtMoney(d.avg)}</span></div>`).join('')}</div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white rounded-xl p-4 border border-slate-200">
        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-translate text-slate-400"></i>언어별 평균</div>
        <div class="space-y-1.5">${langAvg.map(d=>`<div class="flex items-center gap-2"><span class="text-[10px] font-bold text-slate-600 w-20 shrink-0">${d.l}</span><div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div class="h-full ${langCls[d.l]||'bg-slate-400'} rounded-full" style="width:${Math.round(d.avg/maxLangAvg*100)}%"></div></div><span class="text-[10px] font-black text-slate-700 font-mono w-28 text-right shrink-0">${fmtMoney(d.avg)}</span></div>`).join('')}</div>
      </div>
      <div class="bg-white rounded-xl p-4 border border-slate-200">
        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="ph-fill ph-funnel text-slate-400"></i>유입 경로별 평균</div>
        <div class="space-y-1.5">${srcAvg.map(d=>`<div class="flex items-center gap-2"><span class="text-[10px] font-bold text-slate-600 w-16 shrink-0">${d.s}</span><div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-brand-400 rounded-full" style="width:${Math.round(d.avg/maxSrcAvg*100)}%"></div></div><span class="text-[10px] font-black text-slate-700 font-mono w-28 text-right shrink-0">${fmtMoney(d.avg)}</span></div>`).join('')}</div>
      </div>
    </div>
    ${topItems.length>0?`<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><i class="ph-fill ph-trend-up text-emerald-400"></i>최고 객단가</div>
      <div class="divide-y divide-slate-50">${topItems.map((v,i)=>`<div class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"><span class="text-[10px] font-black text-slate-300 w-4">${i+1}</span><button class="text-[12px] font-black text-brand-600 hover:underline" onclick="closeStatsDetail();openBsDetail('${v.id}')">${v.name}</button><span class="text-[10px] border px-1.5 py-0.5 rounded ${v.membershipCls} ml-1">${v.membership}</span><span class="text-[11px] font-black text-emerald-600 font-mono ml-auto">${fmtMoney(v.amount)}</span></div>`).join('')}</div>
    </div>`:''}
    ${botItems.length>0?`<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><i class="ph-fill ph-trend-down text-red-400"></i>최저 객단가</div>
      <div class="divide-y divide-slate-50">${botItems.map((v,i)=>`<div class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"><span class="text-[10px] font-black text-slate-300 w-4">${i+1}</span><button class="text-[12px] font-black text-brand-600 hover:underline" onclick="closeStatsDetail();openBsDetail('${v.id}')">${v.name}</button><span class="text-[10px] border px-1.5 py-0.5 rounded ${v.membershipCls} ml-1">${v.membership}</span><span class="text-[11px] font-black text-red-400 font-mono ml-auto">${fmtMoney(v.amount)}</span></div>`).join('')}</div>
    </div>`:''}`;

  }

  titleEl.innerHTML=titleHtml;
  body.innerHTML=html;
  modal.style.visibility='visible';modal.style.opacity='1';modal.style.pointerEvents='auto';
  setTimeout(()=>{box.style.transform='scale(1) translateY(0)';},10);
}
function closeStatsDetail(){
  const modal=document.getElementById('bs-stats-detail-modal');
  const box=document.getElementById('bs-stats-detail-box');
  box.style.transform='scale(0.95) translateY(8px)';
  modal.style.opacity='0';
  setTimeout(()=>{modal.style.visibility='hidden';modal.style.pointerEvents='none';},150);
}

let _statsCollapsed = localStorage.getItem('bs-stats-collapsed')==='1';
function applyBsStatsState(animate=true){
  const panel=document.getElementById('bs-stats-panel');
  const chevron=document.getElementById('bs-stats-chevron');
  const label=document.getElementById('bs-stats-label');
  if(!panel) return;
  if(!animate) panel.style.transition='none';
  if(_statsCollapsed){
    panel.style.maxHeight='0';panel.style.overflow='hidden';panel.style.opacity='0';
    if(chevron) chevron.style.transform='rotate(180deg)';
    if(label) label.textContent='통계 펼치기';
  } else {
    panel.style.maxHeight='2000px';panel.style.overflow='';panel.style.opacity='1';
    if(chevron) chevron.style.transform='';
    if(label) label.textContent='통계 접기';
  }
  if(!animate) requestAnimationFrame(()=>{ panel.style.transition=''; });
}
function toggleBsStats(){
  _statsCollapsed=!_statsCollapsed;
  localStorage.setItem('bs-stats-collapsed',_statsCollapsed?'1':'0');
  const panel=document.getElementById('bs-stats-panel');
  if(panel) panel.style.transition='max-height 0.3s ease,opacity 0.2s';
  applyBsStatsState(true);
}
