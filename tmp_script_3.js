
        document.addEventListener('DOMContentLoaded', () => {
            // DRAWER Toggles
            const hBtn = document.getElementById('hamburger-btn');
            const cBtn = document.getElementById('close-drawer-btn');
            const dOverlay = document.getElementById('drawer-overlay');
            const nDrawer = document.getElementById('nav-drawer');

            function tDrawer(s) {
                if (s) {
                    dOverlay.classList.remove('hidden');
                    setTimeout(() => { dOverlay.classList.remove('opacity-0'); nDrawer.classList.remove('-translate-x-full'); }, 10);
                } else {
                    dOverlay.classList.add('opacity-0'); nDrawer.classList.add('-translate-x-full');
                    setTimeout(() => dOverlay.classList.add('hidden'), 300);
                }
            }
            if (hBtn) hBtn.addEventListener('click', () => tDrawer(true));
            if (cBtn) cBtn.addEventListener('click', () => tDrawer(false));
            if (dOverlay) dOverlay.addEventListener('click', () => tDrawer(false));

            // Bulk Checkboxes
            const chkAll = document.getElementById('check-all');
            const rcbs = document.querySelectorAll('.row-checkbox');
            const bBar = document.getElementById('bulk-action-bar');
            function uc() {
                const c = Array.from(rcbs).filter(i=>i.checked).length;
                if(c>0) {
                    bBar.classList.remove('hidden'); bBar.classList.add('flex');
                    document.getElementById('selected-count').innerText = c;
                } else {
                    bBar.classList.add('hidden'); bBar.classList.remove('flex');
                }
            }
            if(chkAll) chkAll.addEventListener('change', e=> { rcbs.forEach(i=>i.checked=e.target.checked); uc(); });
            // === Generate 60 Leaders ===
            const surnames = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','전','홍','고','문','양','손','배','백','허','유','남','심','노','하','곽','성','차','주','우','민','진'];
            const givenM = ['민수','영호','준혁','성민','재현','동욱','진우','태현','현우','승준','지훈','도현','건우','시우','예준','수호','하준','은호','윤서','정우'];
            const givenF = ['지현','수빈','다은','서연','민지','하은','예진','채원','소연','유진','지은','수아','나연','은서','하윤','미래','서윤','지우','윤아','채은'];
            const teamSlots = ['영 월 11시','영 월 8시','영 화 11시','영 화 8시','영 수 11시','영 수 8시','영 목 11시','영 목 8시','영 토 11시','영 일 11시','일 월 11시','일 월 8시','일 화 11시','일 화 8시','일 수 11시','일 수 8시','일 목 11시','일 목 8시','일 토 11시','일 일 11시'];
            const memos = ['우수회원 혜택 안내 완료.','담달 연임 예정.','신규 리더 교육 수료.','출석 우수. 모범 리더.','해외 출장 예정 (2주).','다음 달 홀딩 요청.','팀 변경 검토 중.','멤버십 갱신 완료.','상담 예정 (4/20).','대타 요청 빈번. 관리 필요.','리딩 스킬 향상 중.','신규 팀 배정 완료.','출석률 개선 필요.','휴직 복귀 예정.','우수 리더 후보.','','','','',''];
            const teamColors = {'영':'#9B59B6','일':'#007BFF'};
            const teamBgs = {'영':'#f5eafa','일':'#e6f0ff'};
            const blockStatuses = [
                {s:'출석 완료',bg:'bg-emerald-500',border:'border-emerald-600/30',color:'text-emerald-400'},
                {s:'불참',bg:'bg-red-400',border:'border-red-500/30',color:'text-red-400'},
                {s:'대타 출석 완료',bg:'bg-amber-400',border:'border-amber-500/30',color:'text-amber-400'},
                {s:'출석 예정',bg:'bg-slate-300',border:'border-slate-400/30',color:'text-slate-400'},
            ];
            const dates8 = [
                {d:'04.01',w:'월'},{d:'04.03',w:'수'},{d:'04.08',w:'월'},{d:'04.10',w:'수'},
                {d:'04.15',w:'월'},{d:'04.17',w:'수'},{d:'04.22',w:'월'},{d:'04.24',w:'수'}
            ];

            function rng(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
            function rPick(arr){return arr[rng(0,arr.length-1)];}
            function genPhone(){return `010-${rng(1000,9999)}-${rng(1000,9999)}`;}

            const leaders = [];
            const usedNames = new Set();
            for(let i=0;i<60;i++){
                let name;
                do {
                    const isFemale = Math.random()>0.5;
                    name = rPick(surnames)+(isFemale?rPick(givenF):rPick(givenM));
                } while(usedNames.has(name));
                usedNames.add(name);
                const phone = genPhone();
                const age = rng(20,42);
                const lv = rng(1,5);
                const numTeams = Math.random()>0.7?2:1;
                const myTeams = [];
                while(myTeams.length<numTeams){const t=rPick(teamSlots);if(!myTeams.includes(t))myTeams.push(t);}
                const readingLevels = {};
                myTeams.forEach(t => { readingLevels[t] = Math.random() > 0.3 ? lv : Math.max(1, Math.min(5, lv + rng(-2, 2))); });
                const att=rng(1,7), abs=rng(0,3), sub=rng(0,2);
                const done=att+abs+sub;
                const total=8;
                const rate=done>0?Math.round((att/done)*100):0;
                const rateColor=rate>=70?'text-emerald-600':rate>=40?'text-amber-600':'text-red-600';

                // Generate 8 attendance blocks
                const blocks=[];
                const memberPool=['김민수(010-1111-2222)','이지현(010-3333-4444)','최영호(010-5555-6666)','정다은(010-7777-8888)','강서연(010-9999-0000)','조하은(010-1234-5678)'];
                for(let b=0;b<8;b++){
                    let st;
                    if(b<att) st=Math.random()>0.85?blockStatuses[2]:blockStatuses[0];
                    else if(b<att+abs) st=blockStatuses[1];
                    else st=blockStatuses[3];
                    const mems=st.s==='불참'||st.s==='출석 예정'?'—':
                        Array.from({length:rng(2,4)},()=>rPick(memberPool)).join(', ');
                    const myPrimaryTeam = myTeams[0];
                    const myPrimaryRL = readingLevels[myPrimaryTeam] || lv;
                    blocks.push({...st,date:dates8[b],members:mems, teamName: myPrimaryTeam, teamLv: myPrimaryRL});
                }

                const todayChecked = Math.random()>0.4;
                const memo = rPick(memos);

                // Build schedule data for calendar modal
                const schedule = {'출석 완료':[],'불참':[],'대타 예정':[],'대타 출석 완료':[],'출석 예정':[]};
                blocks.forEach(b => {
                    const dateStr = `2026-${b.date.d.replace('.','-')}`;
                    const entry = {date:dateStr, day:b.date.w, time:'11:00 AM', team:myTeams[0]};
                    if (schedule[b.s]) schedule[b.s].push(entry);
                });

                leaders.push({name,phone,age,lv,teams:myTeams,readingLevels,att,abs,sub,total,done,rate,rateColor,blocks,todayChecked,memo,schedule});
            }

            function renderLeaders(){
                const tbody = document.getElementById('leader-tbody');

                tbody.innerHTML = leaders.map((l,i)=>{
                    const teamBadges = l.teams.map(t=>{
                        const lang=t.startsWith('영')?'영':'일';
                        const displayName=t.replace(/^[영일]\s*/,'');
                        return `<span class="px-1.5 py-0.5 text-[10px] rounded font-semibold border" style="color:${teamColors[lang]};background:${teamBgs[lang]};border-color:${teamColors[lang]}">${displayName}</span>`;
                    }).join('');
                    const blocksHtml = l.blocks.map(b=>
                        `<div class="attendance-block h-2.5 flex-1 rounded-sm ${b.bg} shadow-sm border ${b.border} cursor-pointer" data-date="${b.date.d} (${b.date.w})" data-status="${b.s}" data-color="${b.color}" data-members="${b.members}"></div>`
                    ).join('');
                    const todayBtn = l.todayChecked
                        ? `<button class="w-7 h-7 rounded border border-emerald-300 bg-emerald-50 text-emerald-600 flex items-center justify-center transition-all mx-auto font-bold shadow-inner"><i class="ph-bold ph-check text-xs"></i></button>`
                        : `<button class="w-7 h-7 rounded border border-slate-200 bg-white text-slate-300 flex items-center justify-center transition-all mx-auto hover:border-emerald-300 hover:text-emerald-500"><i class="ph ph-minus text-xs"></i></button>`;
                    const memoHtml = l.memo ? `${l.memo}<i class="ph ph-pencil-simple absolute right-2 bottom-1.5 bg-slate-50 opacity-0 group-hover:opacity-100 text-brand-600 p-0.5"></i>` : `<span class="text-slate-300 italic">메모 없음</span>`;
                    
                    return `<tr class="member-row" data-idx="${i}" data-teams="${l.teams.join(',')}" data-leader-lv="${l.lv}" data-reading-lvs="${Object.entries(l.readingLevels).map(([t,v])=>(t.startsWith('영')?'eng-':'jpn-')+v).join(',')}">
                        <td class="px-3 py-2"><div class="flex items-center justify-center gap-1 opacity-80 hover:opacity-100 transition-opacity"><span class="text-[10px] font-bold text-slate-400 w-3 text-right">${i+1}</span><i class="ph-bold ph-dots-six-vertical drag-handle text-slate-300 cursor-grab text-lg"></i><input type="checkbox" class="row-checkbox w-4 h-4 rounded border-slate-300 text-brand-600 cursor-pointer"></div></td>
                        <td class="px-3 py-2"><div class="flex items-center gap-2"><button class="font-extrabold text-brand-600 hover:text-brand-800 hover:underline text-left transition-colors flex items-center gap-1 text-[14px]" onclick="openProfileModal('${l.name}')">${l.name}</button></div><div class="font-mono text-[11px] text-slate-500 mt-0.5"><span class="cursor-pointer hover:text-brand-600 active:scale-95 transition-all" onclick="event.stopPropagation();copyPhone('${l.phone}')">${l.phone}</span> (${l.age}세)</div></td>
                        <td class="px-3 py-2"><div class="flex flex-wrap gap-1">${l.teams.map(t=>{const isEng=t.startsWith('영');const rl=l.readingLevels[t]||l.lv;const bg=isEng?'background:#f5eafa;color:#9B59B6;border-color:#9B59B6':'background:#e6f0ff;color:#007BFF;border-color:#007BFF';return `<span class="px-1.5 py-0.5 text-[10px] rounded font-bold border" style="${bg}"><i class="ph-fill ph-book-open mr-0.5 text-[8px]"></i>LV${rl}</span>`;}).join('')}</div></td>
                        <td class="px-3 py-2"><div class="flex flex-wrap gap-1">${teamBadges}</div></td>
                        <td class="px-3 py-2"><button onclick="openCalendarModal('${l.name}','출석 완료')" class="flex items-center justify-center gap-1.5 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors cursor-pointer w-full"><span class="flex items-center gap-0.5" title="출석 완료"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><span class="text-sm font-bold text-emerald-600">${l.att}</span></span><span class="flex items-center gap-0.5" title="불참"><span class="w-2 h-2 rounded-full bg-red-400"></span><span class="text-sm font-bold text-red-500">${l.abs}</span></span><span class="flex items-center gap-0.5" title="대타 예정"><span class="w-2 h-2 rounded-full bg-amber-400"></span><span class="text-sm font-bold text-amber-600">${l.sub}</span></span></button><div class="text-[9px] text-slate-400 font-medium text-center mt-0.5">총 ${l.total}회 중 ${l.done}회 진행</div></td>
                        <td class="px-3 py-2 group"><div class="editable-text p-1 text-slate-600 text-xs line-clamp-2 transition-colors relative border border-transparent bg-transparent rounded">${memoHtml}</div></td>
                        <td class="px-3 py-2 text-center">
                            <div class="tooltip-container">
                                <div class="flex items-center justify-center gap-[1px] w-[80px] mx-auto">${blocksHtml}</div>
                            </div>
                            <button onclick="openAttendanceHistory('${l.name}')" class="text-[9px] ${l.rateColor} font-bold mt-1 hover:underline hover:text-brand-600 transition-colors block w-full text-center">${l.rate}% (${l.att}/${l.done}회 진행)</button>
                        </td>
                        <td class="px-3 py-2 text-center">${todayBtn}</td>
                    </tr>`;
                }).join('');

                // Re-bind checkboxes
                const newRcbs = document.querySelectorAll('.row-checkbox');
                const chkAllEl = document.getElementById('check-all');
                newRcbs.forEach(i=>i.addEventListener('change', ()=>{
                    const c = Array.from(newRcbs).filter(x=>x.checked).length;
                    if(c>0){bBar.classList.remove('hidden');bBar.classList.add('flex');document.getElementById('selected-count').innerText=c;}
                    else{bBar.classList.add('hidden');bBar.classList.remove('flex');}
                }));
                if(chkAllEl) chkAllEl.addEventListener('change', e=>{newRcbs.forEach(i=>i.checked=e.target.checked);newRcbs[0]?.dispatchEvent(new Event('change'));});
                
                if (gridContainer) gridContainer.innerHTML = gridHtml;

            }
            renderLeaders();

            // === Daily Memo Storage ===
            const dailyMemos = {};
            window.saveDailyMemo = function(el) {
                const key = el.dataset.memoKey;
                const text = el.innerText.trim();
                if (text && text !== '당일 메모 없음') {
                    dailyMemos[key] = text;
                } else {
                    delete dailyMemos[key];
                    el.innerHTML = '<span class="text-slate-300 italic">당일 메모 없음</span>';
                }
            };

            // === Leader Status Boards (7-day swipe) ===
            function renderLeaderBoards() {
                let activeDay = 0;
                let filterLang = 'all';
                let filterTime = 'all';
                let filterStatus = new Set();
                const filterActiveCls = 'bg-slate-900 text-white shadow-sm';
                const filterInactiveCls = 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50';

                const dayNames = ['일','월','화','수','목','금','토'];
                const now = new Date();

                const boardStatusToday = ['출석 예정','출석 완료','대타 예정','대타 출석 완료','불참'];
                const boardWeightsToday = [0.25, 0.35, 0.10, 0.10, 0.20];
                const boardStatusFuture = ['출석 예정','대타 예정','불참'];
                const boardWeightsFuture = [0.55, 0.20, 0.25];
                function pickBoardStatus(isToday) {
                    const pool = isToday ? boardStatusToday : boardStatusFuture;
                    const weights = isToday ? boardWeightsToday : boardWeightsFuture;
                    const r = Math.random(); let cum = 0;
                    for (let i = 0; i < weights.length; i++) { cum += weights[i]; if (r <= cum) return pool[i]; }
                    return pool[0];
                }

                // 조교(TA) 리딩 데이터 생성
                const taLeadersRaw = [
                    { name: '김조교', phone: '010-8888-1234', lv: 5, teams: ['영 월 11시', '일 수 8시'], boardStatus: '출석 완료', isTA: true, rate: 100, blocks: [
                        { date: {d:'04.06', w:'월'}, s:'완료', bg:'bg-emerald-500', border:'border-emerald-600', color:'text-emerald-600', members: '김민준(010-1111-2222), 이서연(010-3333-4444), 박지훈(010-5555-6666)', teamName: '영 월 11시', teamLv: 3 }
                    ], members: '김민준(010-1111-2222), 이서연(010-3333-4444), 박지훈(010-5555-6666)' },
                    { name: '이지원', phone: '010-9999-5678', lv: 4, teams: ['영 화 8시'], boardStatus: '대타 예정', isTA: true, rate: 100, blocks: [
                        { date: {d:'04.06', w:'화'}, s:'완료', bg:'bg-emerald-500', border:'border-emerald-600', color:'text-emerald-600', members: '최유진(010-7777-8888), 장동건(010-9999-0000)', teamName: '영 화 8시', teamLv: 2 }
                    ], members: '최유진(010-7777-8888), 장동건(010-9999-0000)' },
                    { name: '박민우', phone: '010-2222-3333', lv: 5, teams: ['일 수 11시'], boardStatus: '출석 완료', isTA: true, rate: 100, blocks: [
                        { date: {d:'04.02', w:'목'}, s:'완료', bg:'bg-emerald-500', border:'border-emerald-600', color:'text-emerald-600', members: '정다은(010-7777-8888), 강서연(010-9999-0000)', teamName: '일 수 11시', teamLv: 4 }
                    ], members: '정다은(010-7777-8888), 강서연(010-9999-0000)' },
                    { name: '최현아', phone: '010-4444-5555', lv: 4, teams: ['영 금 8시'], boardStatus: '출석 완료', isTA: true, rate: 100, blocks: [
                        { date: {d:'04.03', w:'금'}, s:'완료', bg:'bg-emerald-500', border:'border-emerald-600', color:'text-emerald-600', members: '조하은(010-1234-5678), 김민수(010-1111-2222)', teamName: '영 금 8시', teamLv: 3 }
                    ], members: '조하은(010-1234-5678), 김민수(010-1111-2222)' },
                    { name: '정성훈', phone: '010-6666-7777', lv: 5, teams: ['일 토 11시'], boardStatus: '출석 완료', isTA: true, rate: 100, blocks: [
                        { date: {d:'04.04', w:'토'}, s:'완료', bg:'bg-emerald-500', border:'border-emerald-600', color:'text-emerald-600', members: '이지현(010-3333-4444), 정다은(010-7777-8888)', teamName: '일 토 11시', teamLv: 5 }
                    ], members: '이지현(010-3333-4444), 정다은(010-7777-8888)' }
                ];
                const memberPool = ['김민준', '이서연', '박지훈', '최유진', '성기훈', '장동건', '정수안', '강하늘', '황정음', '조인성'];

                // Build 7 days of data
                const days = [];
                for (let offset = 0; offset < 7; offset++) {
                    const d = new Date(now); d.setDate(d.getDate() + offset);
                    const dayName = dayNames[d.getDay()];
                    const label = `${d.getMonth()+1}/${d.getDate()}`;
                    const isToday = offset === 0;
                    const matched = [];
                    leaders.forEach(l => {
                        const teams = l.teams.filter(t => t.split(' ')[1] === dayName);
                        if (teams.length > 0) matched.push({ ...l, matchedTeams: teams, boardStatus: pickBoardStatus(isToday) });
                    });
                    
                    // Integrating TAs into 'Today' (offset 0)
                    if (isToday) {
                        taLeadersRaw.forEach(ta => {
                            const matchingTeams = ta.teams.filter(t => t.split(' ')[1] === dayName);
                            if (matchingTeams.length > 0) {
                                matched.push({ ...ta, matchedTeams: matchingTeams });
                            }
                        });
                    }
                    
                    days.push({ date: d, dayName, label, isToday, leaders: matched });
                }

                // Absent leaders
                const absentLeaders = [];
                leaders.forEach(l => {
                    const absentBlocks = l.blocks.filter(b => b.s === '불참');
                    if (absentBlocks.length > 0) absentLeaders.push({ ...l, absentBlocks });
                });

                const statusStyles = {
                    '출석 예정':     { bg:'bg-transparent', text:'text-emerald-600', border:'border-emerald-300', icon:'ph ph-clock' },
                    '출석 완료':     { bg:'bg-emerald-100', text:'text-emerald-700', border:'border-emerald-200', icon:'ph-bold ph-check-circle' },
                    '대타 예정':     { bg:'bg-transparent', text:'text-amber-600',   border:'border-amber-300',   icon:'ph ph-swap' },
                    '대타 출석 완료': { bg:'bg-amber-100',   text:'text-amber-700',   border:'border-amber-200',   icon:'ph-bold ph-swap' },
                    '불참':          { bg:'bg-red-100',     text:'text-red-700',     border:'border-red-200',     icon:'ph-bold ph-x-circle' },
                };

                // Attendance History Modal functions
                window.openUnifiedTAHistory = function() {
                    // Try to find any TA to trigger consolidated view
                    const anyTA = taLeadersRaw[0];
                    if (anyTA) openAttendanceHistory(anyTA.name);
                };

                window.openAttendanceHistory = function(name) {
                    const l = [...leaders, ...taLeadersRaw].find(x => x.name === name);
                    if (!l) return;
                    
                    const isTA = l.isTA || false;
                    const modalTitle = document.getElementById('ah-modal-name');
                    const modalTypeBadge = document.querySelector('#ah-modal p');
                    
                    let blocksToShow = [];
                    if (isTA) {
                        modalTitle.textContent = "조교(TA) 통합";
                        modalTypeBadge.textContent = "전체 조교 지원 현황";
                        // Collect all blocks from all TAs
                        taLeadersRaw.forEach(ta => {
                            ta.blocks.forEach(b => {
                                blocksToShow.push({ ...b, taName: ta.name, taPhone: ta.phone });
                            });
                        });
                        // Sort by date descending
                        blocksToShow.sort((a,b) => b.date.d.localeCompare(a.date.d));
                    } else {
                        modalTitle.textContent = l.name;
                        modalTypeBadge.textContent = "전체 출석 히스토리";
                        blocksToShow = l.blocks;
                    }
                    
                    // Filter out '예정' status
                    blocksToShow = blocksToShow.filter(b => !b.s.includes('예정'));

                    // --- Member Aggregation & Ranking ---
                    const memberCounts = {};
                    blocksToShow.forEach(b => {
                        if (b.members && b.members !== '—') {
                            const membersArr = b.members.split(', ');
                            membersArr.forEach(m => {
                                const match = m.match(/^(.+?)\((010-\d{4}-\d{4})\)$/);
                                const nm = match ? match[1] : m;
                                const fullPhone = match ? match[2] : '';
                                const key = nm + '|' + fullPhone;
                                memberCounts[key] = (memberCounts[key] || 0) + 1;
                            });
                        }
                    });
                    
                    const sortedMembers = Object.entries(memberCounts).map(([key, count]) => {
                        const [name, phone] = key.split('|');
                        return { name, phone, count };
                    }).sort((a, b) => b.count - a.count);

                    let summaryHtml = '';
                    if (sortedMembers.length > 0) {
                        const tags = sortedMembers.map((m, rank) => {
                            const rankBadge = rank < 3 ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-white text-slate-600 border-slate-300 shadow-sm';
                            const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '';
                            return `<div class="flex items-center gap-1 px-2 py-1 ${rankBadge} rounded-lg font-medium text-[11px] border">
                                <span>${medal} <span class="font-extrabold cursor-pointer hover:text-brand-600" onclick="event.stopPropagation();copyPhone('${m.phone}')" title="${m.phone}">${m.name}</span></span>
                                <span class="text-[10px] font-black opacity-80 border-l px-1 py-0.5 border-current bg-white/50 rounded-sm ml-0.5">${m.count}회</span>
                            </div>`;
                        }).join('');
                        
                        summaryHtml = `
                            <div class="bg-white p-4 rounded-xl border-2 border-brand-200 shadow-sm mb-4 relative overflow-hidden">
                                <div class="absolute -right-4 -top-4 text-brand-50 opacity-50 pointer-events-none">
                                    <i class="ph-fill ph-ranking text-8xl"></i>
                                </div>
                                <div class="text-[12px] font-black text-brand-800 mb-3 flex items-center justify-between border-b border-brand-100 pb-2 relative z-10">
                                    <span class="flex items-center gap-1.5"><i class="ph-fill ph-crown text-lg text-amber-500"></i>누적 참여 멤버 랭킹</span>
                                    <span class="px-2 py-0.5 bg-brand-50 rounded-full text-[10px] text-brand-600">총 ${sortedMembers.length}명</span>
                                </div>
                                <div class="flex flex-wrap gap-2 relative z-10">
                                    ${tags}
                                </div>
                            </div>
                            <div class="text-[11px] font-black text-slate-400 mb-2 px-1 flex items-center gap-1"><i class="ph-bold ph-calendar-blank"></i> 날짜별 상세 기록</div>
                        `;
                    }
                    
                    const listHtml = blocksToShow.map(b => {
                        const membersArr = b.members === '—' ? [] : b.members.split(', ');
                        const membersHtml = membersArr.map(m => {
                            const match = m.match(/^(.+?)\((010-\d{4}-\d{4})\)$/);
                            const nm = match ? match[1] : m;
                            const fullPhone = match ? match[2] : '';
                            const phTag = fullPhone ? `<span class="text-slate-400 font-normal ml-0.5 cursor-pointer hover:text-brand-600 active:scale-95 transition-all underline decoration-slate-200" onclick="event.stopPropagation();copyPhone('${fullPhone}')">${fullPhone}</span>` : '';
                            return `<span class="px-1.5 py-0.5 bg-white text-slate-600 text-[10px] rounded font-medium border border-slate-200 shadow-sm">${nm}${phTag}</span>`;
                        }).join(' ');

                        const taTag = b.taName ? `<span class="px-1 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-sm mr-2 leading-none shadow-sm capitalize">TA: ${b.taName} <span class="font-mono font-normal opacity-90 cursor-pointer hover:underline ml-1" onclick="event.stopPropagation();copyPhone('${b.taPhone}')">${b.taPhone}</span></span>` : '';
                        
                        const tInfo = b.teamName ? b.teamName.split(' ') : ['영', '?', '오전'];
                        const lang = tInfo[0];
                        const time = tInfo[2];
                        const color = lang === '영' ? '#9B59B6' : '#007BFF';
                        const bg = lang === '영' ? '#f5eafa' : '#e6f0ff';

                        return `
                            <div class="p-3 bg-white rounded-lg border border-slate-200 shadow-sm space-y-2 relative overflow-hidden group">
                                <div class="flex items-center justify-between relative z-10">
                                    <div class="flex items-center">
                                        ${taTag}
                                        <span class="text-xs font-bold text-slate-600">${b.date.d} <span class="font-medium text-slate-400">(${b.date.w})</span></span>
                                        <span class="mx-2 w-px h-2.5 bg-slate-200"></span>
                                        <div class="flex items-center gap-1.5">
                                            <span class="px-1.5 py-0.5 text-[9px] rounded font-bold border" style="color:${color};background:${bg};border-color:${color}">${lang} ${time}</span>
                                            <span class="px-1.5 py-[1px] bg-slate-100 text-slate-500 text-[9px] rounded font-bold border border-slate-200">LV ${b.teamLv || '?'}</span>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${b.bg} ${b.color.replace('text-', 'text-opacity-90 ')} shadow-inner">${b.s}</span>
                                </div>
                                <div class="flex flex-wrap gap-1 mt-2 p-1.5 bg-slate-50 rounded border border-slate-100 relative z-10">
                                    ${membersHtml || '<span class="text-[10px] text-slate-300 italic px-1 font-medium">참여 멤버 없음</span>'}
                                </div>
                            </div>
                        `;
                    }).reverse().join(''); // Show recent first
                    
                    document.getElementById('ah-modal-list').innerHTML = summaryHtml + (listHtml || '<div class="text-center py-6 text-slate-400 text-sm font-medium">참여 내역이 없습니다</div>');
                    
                    const modal = document.getElementById('ah-modal');
                    const overlay = document.getElementById('ah-modal-overlay');
                    overlay.classList.remove('hidden');
                    modal.classList.remove('hidden');
                    setTimeout(() => {
                        overlay.classList.remove('opacity-0');
                        modal.classList.remove('opacity-0', 'translate-y-4');
                    }, 10);
                };

                window.closeAttendanceHistory = function() {
                    const modal = document.getElementById('ah-modal');
                    const overlay = document.getElementById('ah-modal-overlay');
                    overlay.classList.add('opacity-0');
                    modal.classList.add('opacity-0', 'translate-y-4');
                    setTimeout(() => {
                        overlay.classList.add('hidden');
                        modal.classList.add('hidden');
                    }, 300);
                };

                function renderStatusRow(l) {
                    const isTA = l.isTA || false;
                    const taBadge = isTA ? `<span class="px-1 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-sm mr-1 leading-none shadow-sm">TA</span>` : '';
                    
                    const teamBadges = l.matchedTeams.map(t => {
                        const lang = t.startsWith('영') ? '영' : '일';
                        const displayName = t.replace(/^[영일]\s*/, '');
                        return `<span class="px-1.5 py-0.5 text-[10px] rounded font-semibold border whitespace-nowrap" style="color:${teamColors[lang]};background:${teamBgs[lang]};border-color:${teamColors[lang]}">${displayName}</span>`;
                    }).join(' ');
                    
                    const st = statusStyles[l.boardStatus] || statusStyles['출석 예정'];
                    const badge = `<span class="inline-flex items-center justify-center gap-1 w-full py-0.5 rounded text-[10px] font-bold ${st.bg} ${st.text} border ${st.border} whitespace-nowrap"><i class="${st.icon}"></i> ${l.boardStatus}</span>`;
                    const rateColor = l.rate >= 70 ? 'text-emerald-600' : l.rate >= 40 ? 'text-amber-600' : 'text-red-600';
                    const blocksHtml = l.blocks.map(b =>
                        `<div class="attendance-block h-2 flex-1 rounded-sm ${b.bg} border ${b.border} cursor-pointer" data-date="${b.date.d} (${b.date.w})" data-status="${b.s}" data-color="${b.color}" data-members="${b.members}"></div>`
                    ).join('');
                    
                    // Mock members if not present
                    const attendees = l.members || Array.from({length: 3}, () => `${rPick(memberPool)}`).join(', ');
                    const attendeeNames = attendeeNameFormatting(attendees);

                    const dayKey = days[activeDay]?.label || '';
                    const dailyMemoKey = `${l.name}_${dayKey}`;
                    const dailyMemo = dailyMemos[dailyMemoKey] || '';
                    const memoDisplay = dailyMemo ? dailyMemo : '<span class="text-slate-300 italic">당일 메모 없음</span>';
                    
                    return `<div class="p-3 transition-colors group grid items-center gap-2" style="grid-template-columns: 100px 80px 90px 32px 1fr minmax(80px,1fr) 56px 36px;">
                        <div class="truncate">${badge}</div>
                        <button onclick="openProfileModal('${l.name}')" class="text-sm font-extrabold text-slate-800 hover:text-brand-600 transition-colors truncate text-left flex items-center">${taBadge}${l.name}</button>
                        <span class="text-[11px] font-mono text-slate-500 truncate cursor-pointer hover:text-brand-600 active:scale-95 transition-all" onclick="event.stopPropagation();copyPhone('${l.phone}')">${l.phone}</span>
                        <span class="px-1 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded font-bold border border-purple-200 whitespace-nowrap text-center">LV ${l.lv}</span>
                        <div class="flex items-center gap-1 overflow-hidden">${teamBadges}</div>
                        <div class="editable-text px-2 py-1 text-xs text-slate-500 line-clamp-1 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors relative cursor-pointer min-w-0" contenteditable="true" spellcheck="false" data-memo-key="${dailyMemoKey}" onfocus="if(this.querySelector('span.italic'))this.innerHTML=''" onblur="saveDailyMemo(this)">${memoDisplay}<i class="ph ph-pencil-simple absolute right-1.5 top-1/2 -translate-y-1/2 text-brand-600 opacity-0 group-hover:opacity-100 text-[10px] pointer-events-none"></i></div>
                        <div class="flex items-center gap-[1px]">${blocksHtml}</div>
                        <button onclick="openAttendanceHistory('${l.name}')" class="text-[11px] font-bold ${rateColor} whitespace-nowrap text-right hover:underline hover:text-brand-600 transition-colors">${l.rate}%</button>
                    </div>`;
                }
                
                function attendeeNameFormatting(str) {
                    const arr = str.split(', ');
                    const count = arr.length;
                    const display = arr.slice(0, 4).map(name => `<span class="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] rounded font-medium border border-slate-200">${name}</span>`).join('');
                    const more = count > 4 ? `<span class="text-[9px] text-slate-400 font-bold ml-1">외 ${count-4}명</span>` : '';
                    return display + more;
                }

                function buildSummaryBar(list) {
                    const cnt = { '출석 예정':0, '출석 완료':0, '대타 예정':0, '대타 출석 완료':0, '불참':0 };
                    list.forEach(l => { if (cnt[l.boardStatus] !== undefined) cnt[l.boardStatus]++; });
                    const items = [
                        { key:'출석 예정',     label:'출석예정', color:'emerald-600', icon:'ph ph-clock' },
                        { key:'출석 완료',     label:'출석완료', color:'emerald-700', icon:'ph-bold ph-check-circle' },
                        { key:'대타 예정',     label:'대타예정', color:'amber-600',   icon:'ph ph-swap' },
                        { key:'대타 출석 완료', label:'대타완료', color:'amber-700',   icon:'ph-bold ph-swap' },
                        { key:'불참',          label:'불참',     color:'red-600',     icon:'ph-bold ph-x-circle' },
                    ];
                    return `<div class="px-4 py-2 bg-slate-100/60 flex items-center gap-1.5 flex-wrap text-[11px] font-semibold border-b border-slate-100">
                        ${items.map(it => {
                            const isActive = filterStatus.has(it.key);
                            const activeCls = isActive
                                ? `bg-slate-800 text-white shadow-sm`
                                : `text-${it.color} hover:bg-slate-200/60 bg-transparent`;
                            return `<button class="status-filter-btn inline-flex items-center gap-1 px-2 py-0.5 rounded-full transition-all cursor-pointer ${activeCls}" data-status="${it.key}">
                                <i class="${it.icon}"></i> ${it.label} <span class="font-black">${cnt[it.key]}</span>
                            </button>`;
                        }).join('')}
                    </div>`;
                }

                document.querySelectorAll('.board-filter-lang').forEach(btn => {
                    btn.addEventListener('click', () => {
                        filterLang = btn.dataset.lang;
                        document.querySelectorAll('.board-filter-lang').forEach(b => b.className = `board-filter-lang flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${filterInactiveCls}`);
                        btn.className = `board-filter-lang board-filter-active flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${filterActiveCls}`;
                        renderDayContent();
                    });
                });
                document.querySelectorAll('.board-filter-time').forEach(btn => {
                    btn.addEventListener('click', () => {
                        filterTime = btn.dataset.time;
                        document.querySelectorAll('.board-filter-time').forEach(b => b.className = `board-filter-time flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${filterInactiveCls}`);
                        btn.className = `board-filter-time board-filter-active flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${filterActiveCls}`;
                        renderDayContent();
                    });
                });

                // Status filter (delegated since buttons are dynamic, multi-select)
                document.addEventListener('click', e => {
                    const btn = e.target.closest('.status-filter-btn');
                    if (!btn) return;
                    const status = btn.dataset.status;
                    if (filterStatus.has(status)) {
                        filterStatus.delete(status);
                    } else {
                        filterStatus.add(status);
                    }
                    renderDayContent();
                });

                // Day navigation state
                const tabsEl = document.getElementById('day-tabs');
                const summaryEl = document.getElementById('day-summary');
                const listEl = document.getElementById('day-leader-list');
                const countEl = document.getElementById('day-leader-count');
                const prevBtn = document.getElementById('day-prev-btn');
                const nextBtn = document.getElementById('day-next-btn');

                function renderDayTabs() {
                    tabsEl.innerHTML = days.map((day, i) => {
                        const isActive = i === activeDay;
                        const todayDot = day.isToday ? `<span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-500"></span>` : '';
                        const activeCls = isActive
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300';
                        return `<button class="day-tab relative flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCls}" data-day-idx="${i}">
                            ${day.label} (${day.dayName})${todayDot}
                        </button>`;
                    }).join('');
                }

                function renderDayContent() {
                    const day = days[activeDay];
                    prevBtn.disabled = activeDay === 0;
                    nextBtn.disabled = activeDay === days.length - 1;
                    prevBtn.classList.toggle('opacity-30', activeDay === 0);
                    nextBtn.classList.toggle('opacity-30', activeDay === days.length - 1);

                    // Filter leaders by lang/time first (for summary bar)
                    const teamFiltered = day.leaders.filter(l => {
                        return l.matchedTeams.some(t => {
                            const parts = t.split(' ');
                            const langOk = filterLang === 'all' || parts[0] === filterLang;
                            const timeOk = filterTime === 'all' || parts[2] === filterTime;
                            return langOk && timeOk;
                        });
                    });
                    // Then apply status filter
                    const filtered = teamFiltered.filter(l => {
                        return filterStatus.size === 0 || filterStatus.has(l.boardStatus);
                    });
                    countEl.textContent = `${filtered.length}명`;

                    // Summary bar always based on team-filtered (not status-filtered)
                    if (teamFiltered.length === 0) {
                        summaryEl.innerHTML = '';
                        listEl.innerHTML = `<div class="p-6 text-center text-slate-400 text-sm"><i class="ph ph-calendar-blank text-2xl mb-2 block"></i>배정된 리더가 없습니다</div>`;
                    } else {
                        summaryEl.innerHTML = buildSummaryBar(teamFiltered);

                    if (filtered.length === 0) {
                        listEl.innerHTML = `<div class="p-6 text-center text-slate-400 text-sm"><i class="ph ph-funnel text-2xl mb-2 block"></i>해당 상태의 리더가 없습니다</div>`;
                    } else {

                        // Group by language + time (only matching filter)
                        const groups = {};
                        const groupOrder = [];
                        filtered.forEach(l => {
                            l.matchedTeams.forEach(t => {
                                const parts = t.split(' ');
                                const lang = parts[0];
                                const time = parts[2];
                                if (filterLang !== 'all' && lang !== filterLang) return;
                                if (filterTime !== 'all' && time !== filterTime) return;
                                const key = `${lang} ${time}`;
                                if (!groups[key]) { groups[key] = []; groupOrder.push(key); }
                                if (!groups[key].find(x => x.name === l.name)) groups[key].push(l);
                            });
                        });

                        // Sort: 영어 first, then 일어; within each 11시 first, then 8시
                        const langPriority = { '영': 0, '일': 1 };
                        const timePriority = { '11시': 0, '8시': 1 };
                        const sortedKeys = [...new Set(groupOrder)].sort((a, b) => {
                            const [lA, tA] = a.split(' ');
                            const [lB, tB] = b.split(' ');
                            return (timePriority[tA] ?? 9) - (timePriority[tB] ?? 9) || (langPriority[lA] ?? 9) - (langPriority[lB] ?? 9);
                        });

                        const langLabels = { '영': '영어', '일': '일어' };
                        let html = '';
                        sortedKeys.forEach(key => {
                            const [lang, time] = key.split(' ');
                            const members = groups[key].sort((a, b) => a.lv - b.lv);
                            const color = lang === '영' ? teamColors['영'] : teamColors['일'];
                            const bg = lang === '영' ? teamBgs['영'] : teamBgs['일'];
                            html += `<div class="border-b border-slate-100 last:border-b-0">
                                <div class="px-4 py-2 flex items-center gap-2" style="background:${bg}">
                                    <span class="w-2 h-2 rounded-full" style="background:${color}"></span>
                                    <span class="text-[11px] font-bold" style="color:${color}">${langLabels[lang] || lang} ${time}</span>
                                    <span class="text-[10px] text-slate-400 font-semibold">${members.length}명</span>
                                </div>
                                ${members.map(l => renderStatusRow(l)).join('')}
                            </div>`;
                        });
                        listEl.innerHTML = html;
                    }
                    }
                }

                function setActiveDay(idx) {
                    if (idx < 0 || idx >= days.length) return;
                    activeDay = idx;
                    renderDayTabs();
                    renderDayContent();
                }

                // Event listeners
                tabsEl.addEventListener('click', e => {
                    const tab = e.target.closest('.day-tab');
                    if (tab) setActiveDay(parseInt(tab.dataset.dayIdx));
                });
                prevBtn.addEventListener('click', () => setActiveDay(activeDay - 1));
                nextBtn.addEventListener('click', () => setActiveDay(activeDay + 1));

                // Touch swipe support
                let touchStartX = 0;
                listEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
                listEl.addEventListener('touchend', e => {
                    const diff = touchStartX - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 50) setActiveDay(activeDay + (diff > 0 ? 1 : -1));
                }, { passive: true });

                // Initial render
                setActiveDay(0);

                // Render absent board
                const absentEl = document.getElementById('absent-leader-list');
                document.getElementById('absent-leader-count').textContent = `${absentLeaders.length}명`;
                const resolvedAbsent = new Set();
                window.toggleAbsentResolve = function(key, el) {
                    resolvedAbsent.add(key);
                    const row = el.closest('.absent-date-item');
                    const badge = row.querySelector('.absent-date-badge');
                    const check = row.querySelector('.absent-check-icon');
                    badge.classList.add('line-through', 'opacity-50');
                    check.innerHTML = '<i class="ph-bold ph-check text-xs"></i>';
                    check.classList.remove('border-slate-200', 'bg-white', 'text-slate-300');
                    check.classList.add('border-emerald-300', 'bg-emerald-50', 'text-emerald-600');

                    // Check if all dates for this leader are resolved
                    const leaderRow = el.closest('.absent-leader-row');
                    if (!leaderRow) return;
                    const allItems = leaderRow.querySelectorAll('.absent-date-item');
                    const allKeys = Array.from(allItems).map(item => {
                        const btn = item.querySelector('.absent-check-icon');
                        return btn?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                    });
                    const allResolved = allKeys.every(k => resolvedAbsent.has(k));
                    if (allResolved) {
                        leaderRow.style.transition = 'opacity 0.4s, max-height 0.4s';
                        leaderRow.style.opacity = '0';
                        leaderRow.style.maxHeight = '0';
                        leaderRow.style.overflow = 'hidden';
                        leaderRow.style.padding = '0';
                        setTimeout(() => {
                            leaderRow.remove();
                            // Update count
                            const remaining = absentEl.querySelectorAll('.absent-leader-row').length;
                            document.getElementById('absent-leader-count').textContent = `${remaining}명`;
                            if (remaining === 0) {
                                absentEl.innerHTML = `<div class="p-4 text-center text-emerald-500 text-sm"><i class="ph-bold ph-check-circle text-lg mb-1 block"></i><p>모든 불참이 해결되었습니다</p></div>`;
                            }
                        }, 400);
                    }
                };

                // Sort by earliest absent date
                absentLeaders.sort((a, b) => {
                    const earliest = blocks => Math.min(...blocks.map(bl => parseFloat(bl.date.d.replace('.', ''))));
                    return earliest(a.absentBlocks) - earliest(b.absentBlocks);
                });

                if (absentLeaders.length === 0) {
                    absentEl.innerHTML = `<div class="p-4 text-center text-red-400 text-sm"><i class="ph ph-check-circle text-lg mb-1"></i><p>불참 예정 리더가 없습니다</p></div>`;
                } else {
                    absentEl.innerHTML = absentLeaders.map(l => {
                        const dates = l.absentBlocks.map((b, idx) => {
                            const key = `${l.name}_${b.date.d}`;
                            return `<div class="absent-date-item inline-flex items-center gap-1">
                                <button class="absent-check-icon w-4 h-4 rounded border border-slate-200 bg-white text-slate-300 flex items-center justify-center transition-all cursor-pointer hover:border-emerald-300 hover:text-emerald-500 shrink-0" onclick="toggleAbsentResolve('${key}', this)"></button>
                                <span class="absent-date-badge px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-semibold border border-red-200 transition-all">${b.date.d} (${b.date.w})</span>
                            </div>`;
                        }).join(' ');
                        return `<div class="absent-leader-row p-3 hover:bg-red-100/50 transition-colors group" style="max-height:300px;">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 whitespace-nowrap"><span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> ${l.absentBlocks.length}회</span>
                                <button onclick="openProfileModal('${l.name}')" class="text-sm font-bold text-slate-800 hover:text-brand-600 transition-colors truncate">${l.name}</button>
                                <span class="text-[11px] font-mono text-slate-500 hidden sm:block shrink-0 cursor-pointer hover:text-brand-600 active:scale-95 transition-all" onclick="event.stopPropagation();copyPhone('${l.phone}')">${l.phone}</span>
                                <span class="px-1 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded font-bold border border-purple-200 whitespace-nowrap">LV ${l.lv}</span>
                            </div>
                            <div class="flex items-center gap-1.5 flex-wrap ml-[2px]">${dates}</div>
                        </div>`;
                    }).join('');
                }
            }
            renderLeaderBoards();

            rcbs.forEach(i=>i.addEventListener('change', uc));

            // === Team Tab Filtering ===
            let activeTeams = new Set(['all']);
            const teamTabs = document.querySelectorAll('.team-tab');
            const allTab = document.querySelector('.team-tab[data-team="all"]');
            const tabActive = 'bg-slate-900 text-white shadow-sm';
            const tabInactive = 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300';

            function updateTabStyles() {
                teamTabs.forEach(t => {
                    const team = t.dataset.team;
                    const isActive = activeTeams.has(team);
                    const isEng = team.startsWith('영') || team.startsWith('eng');
                    const isJpn = team.startsWith('일') || team.startsWith('jpn');
                    
                    if (isActive) {
                        if (isEng) t.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-purple-600 text-white text-[13px] font-bold shadow-sm transition-all active:scale-95";
                        else if (isJpn) t.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-blue-600 text-white text-[13px] font-bold shadow-sm transition-all active:scale-95";
                        else t.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-slate-900 text-white text-[13px] font-bold shadow-sm transition-all active:scale-95";
                    } else {
                        if (isEng) t.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 text-[13px] font-medium transition-all active:scale-95";
                        else if (isJpn) t.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 text-[13px] font-medium transition-all active:scale-95";
                        else t.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 text-[13px] font-medium transition-all active:scale-95";
                    }
                });
            }

            teamTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const team = tab.dataset.team;
                    if (team === 'all') {
                        // "전체" 클릭 → 전체만 활성화
                        activeTeams.clear();
                        activeTeams.add('all');
                    } else {
                        // 개별 탭 토글
                        activeTeams.delete('all');
                        if (activeTeams.has(team)) {
                            activeTeams.delete(team);
                        } else {
                            activeTeams.add(team);
                        }
                        // 아무것도 선택 안 되면 전체로 복귀
                        if (activeTeams.size === 0) {
                            activeTeams.add('all');
                        }
                    }
                    updateTabStyles();
                    
                    // 제목 동적 변경
                    const titleEl = document.getElementById('main-dashboard-title');
                    titleEl.innerHTML = '';
                    titleEl.className = "flex flex-wrap items-center gap-1.5";
                    
                    const createBadge = (text, type) => {
                        const colors = {
                            'all': 'bg-slate-100 text-slate-700 border-slate-200',
                            'eng': 'bg-purple-100 text-purple-700 border-purple-200',
                            'jpn': 'bg-blue-100 text-blue-700 border-blue-200'
                        };
                        const c = colors[type] || colors.all;
                        return `<span class="inline-flex items-center px-2 py-0.5 rounded-lg text-sm font-black border shadow-sm transition-all hover:scale-105 ${c}">${text}</span>`;
                    };

                    let titlePrefix = `<span class="text-xl font-black text-slate-800 mr-1 italic">Leader</span>`;
                    let content = '';

                    if (activeTeams.has('all')) {
                        content = createBadge('TOTAL', 'all');
                    } else if (activeTeams.has('eng-all')) {
                        content = createBadge('ENGLISH TOTAL', 'eng');
                    } else if (activeTeams.has('jpn-all')) {
                        content = createBadge('JAPANESE TOTAL', 'jpn');
                    } else {
                        content = Array.from(activeTeams).map(t => {
                            const isEng = t.startsWith('영');
                            const isJpn = t.startsWith('일');
                            // 요일+시간만 남김 (월11시 -> 월11)
                            let name = t.replace(/^(영|일)\s/, '').replace(/\s(\d+)시$/, '$1');
                            return createBadge(name, isEng ? 'eng' : (isJpn ? 'jpn' : 'all'));
                        }).join('');
                    }
                    titleEl.innerHTML = titlePrefix + content;
                    
                    applyFilters();
                });
            });
            updateTabStyles(); // Initial call to color tabs on page load

            // === Search Filtering ===
            const searchInput = document.getElementById('search-input');
            const searchTarget = document.getElementById('search-target');
            const searchClear = document.getElementById('search-clear');
            const noResult = document.getElementById('no-result');

            const sortSelect = document.getElementById('sort-select');

            function applyFilters() {
                const q = searchInput.value.trim().toLowerCase();
                const target = searchTarget.value;
                const sortVal = sortSelect.value;
                const tbody = document.getElementById('leader-tbody');
                const rows = Array.from(tbody.querySelectorAll('.member-row'));

                // Sort
                if (sortVal !== 'default') {
                    rows.sort((a, b) => {
                        if (sortVal.startsWith('name')) {
                            const nA = a.querySelector('td:nth-child(2) button')?.textContent.trim() || '';
                            const nB = b.querySelector('td:nth-child(2) button')?.textContent.trim() || '';
                            return sortVal === 'name-asc' ? nA.localeCompare(nB, 'ko') : nB.localeCompare(nA, 'ko');
                        } else if (sortVal.startsWith('rate')) {
                            const rateText = el => el.querySelector('td:nth-child(6) .font-bold')?.textContent || '0%';
                            const rA = parseInt(rateText(a));
                            const rB = parseInt(rateText(b));
                            return sortVal === 'rate-asc' ? rA - rB : rB - rA;
                        } else if (sortVal.startsWith('level')) {
                            const getLv = el => parseInt(el.querySelector('td:nth-child(2) .bg-purple-50')?.textContent.replace(/\D/g,'') || '0');
                            return sortVal === 'level-asc' ? getLv(a) - getLv(b) : getLv(b) - getLv(a);
                        } else if (sortVal.startsWith('today')) {
                            const isChecked = el => el.querySelector('td:nth-child(7) .bg-emerald-50') ? 1 : 0;
                            return sortVal === 'today-first' ? isChecked(b) - isChecked(a) : isChecked(a) - isChecked(b);
                        }
                        return 0;
                    });
                    rows.forEach(r => tbody.appendChild(r));
                    
                    const gridContainer = document.getElementById('leader-grid-container');
                    if (gridContainer) {
                        const gridCards = Array.from(gridContainer.querySelectorAll('.grid-card'));
                        rows.forEach((r) => {
                            const gridCard = gridCards.find(c => c.dataset.idx === r.dataset.idx);
                            if (gridCard) gridContainer.appendChild(gridCard);
                        });
                    }
                }

                let visibleCount = 0;

                rows.forEach(row => {
                    // Team filter
                    let teamMatch = activeTeams.has('all');
                    if (!teamMatch) {
                        const rowTeams = (row.dataset.teams || '').split(',').map(t => t.trim());
                        teamMatch = rowTeams.some(t => activeTeams.has(t));
                        if (!teamMatch && activeTeams.has('eng-all')) teamMatch = rowTeams.some(t => t.startsWith('영'));
                        if (!teamMatch && activeTeams.has('jpn-all')) teamMatch = rowTeams.some(t => t.startsWith('일'));
                    }

                    // Search filter
                    let searchMatch = !q;
                    if (q) {
                        const infoCell = row.querySelector('td:nth-child(2)');
                        const name = infoCell?.querySelector('button')?.textContent.trim().toLowerCase() || '';
                        const phone = infoCell?.querySelector('.font-mono')?.textContent.trim() || '';
                        const phoneNorm = phone.replace(/-/g, '');
                        const qNorm = q.replace(/-/g, '');
                        if (target === 'name') searchMatch = name.includes(q);
                        else if (target === 'phone') searchMatch = phoneNorm.includes(qNorm);
                        else searchMatch = name.includes(q) || phoneNorm.includes(qNorm);
                    }

                    // Reading level filter
                    const readingLvFilter = document.getElementById('filter-reading-lv').value;
                    const rlvs = (row.dataset.readingLvs || '').split(',');
                    const readingLvMatch = readingLvFilter === 'all' || rlvs.some(v => v.endsWith('-' + readingLvFilter));

                    const visible = teamMatch && searchMatch && readingLvMatch;
                    row.style.display = visible ? '' : 'none';
                    
                    const gridCard = document.querySelector(`.grid-card[data-idx="${row.dataset.idx}"]`);
                    if (gridCard) {
                        gridCard.style.display = visible ? 'flex' : 'none';
                    }
                    
                    if (visible) {
                        visibleCount++;
                        const numEl = row.querySelector('.text-\\[10px\\].font-bold.text-slate-400');
                        if (numEl) numEl.textContent = visibleCount;
                    }
                });

                noResult.classList.toggle('hidden', visibleCount > 0 || (!q && activeTeams.has('all')));
                searchClear.classList.toggle('hidden', !q);
            }

            document.getElementById('filter-reading-lv').addEventListener('change', applyFilters);
            searchInput.addEventListener('input', applyFilters);
            searchTarget.addEventListener('change', applyFilters);
            sortSelect.addEventListener('change', applyFilters);
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                applyFilters();
                searchInput.focus();
            });

            // Profile Modal Dynamic Data
            const mockMembers = {
                '박선민': {
                    level: 'LV 4', phone: '010-3517-4446', membership: 'A+ 멤버십', mColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                    teams: ['영 월수 10AM(4)'], regDate: '26.01.10', startDate: '26.01.10',
                    remainSession: '60', totalSession: '104', mName: 'A+', expDate: '26.08.10', expNote: '주 2회 참석',
                    attRate: '50%', attCount: '4/8회', attColor: 'text-slate-500',
                    message: '우수회원(코어) 활동 중. 혜택 안내 완료. 담달 연임 의사 확인함.',
                    history: [
                        { date: '2026.04.01', tag: '잔여 62/104회 • 신청: 월수 (주 2회)', color: 'purple', title: '우수 리더 선정', desc: '4월 우수 리더로 선정됨. 추가 멤버십 혜택 제공.' },
                        { date: '2026.03.10', tag: '잔여 70/104회 • 신청: 월수 (주 2회)', color: 'orange', title: '홀딩 (멤버십 연기)', desc: '해외 출장으로 인한 2주 홀딩. 리더 권한으로 횟수 차감 없이 기간 2주 연장됨.' },
                        { date: '2026.01.10', tag: '잔여 104/104회 • 신청: 월수 (주 2회)', color: 'emerald', title: 'A+ 멤버십 등록 (104회)', desc: '기존 H+ 만료 후 A+ 멤버십으로 갱신.' }
                    ]
                }
            };

            const pModal = document.getElementById('profile-modal');
            const pOverlay = document.getElementById('profile-modal-overlay');

            window.openProfileModal = function(name) {
                const data = mockMembers[name] || mockMembers['박선민']; // fallback

                // Header
                document.getElementById('pm-name').innerText = name;
                document.getElementById('pm-initial').innerText = name.charAt(0);
                document.getElementById('pm-level-badge').innerText = data.level;
                
                const mBadge = document.getElementById('pm-membership-badge');
                mBadge.className = `px-2 py-0.5 rounded text-[10px] font-bold border ${data.mColor}`;
                mBadge.innerText = data.membership;
                
                document.getElementById('pm-phone').innerText = data.phone;
                
                const teamsHtml = data.teams.map(t => `<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white border border-white/20">${t}</span>`).join('');
                document.getElementById('pm-teams-container').innerHTML = teamsHtml;

                // Body stats
                document.getElementById('pm-reg-date').innerText = data.regDate;
                document.getElementById('pm-brand-name').innerText = data.mName;
                document.getElementById('pm-remain-session').innerText = `${data.remainSession}/${data.totalSession}회`;
                document.getElementById('pm-start-date').innerText = data.startDate;
                document.getElementById('pm-exp-date').innerText = data.expDate;
                document.getElementById('pm-exp-note').innerText = data.expNote;
                
                document.getElementById('pm-att-rate').innerText = data.attRate;
                document.getElementById('pm-att-rate').className = `${data.attColor} text-[13px]`;
                document.getElementById('pm-att-count').innerText = `(${data.attCount})`;

                document.getElementById('pm-message').innerText = data.message;

                // Timeline
                let tHtml = '';
                data.history.forEach((h, idx) => {
                    tHtml += `
                        <div class="relative">
                            <div class="absolute -left-[21px] top-1 w-3 h-3 bg-white border-2 ${idx===0 ? 'border-brand-500' : 'border-slate-300'} rounded-full"></div>
                            <div class="text-xs font-mono text-slate-400 mb-0.5 flex flex-wrap items-center gap-2">${h.date} <span class="bg-slate-100 text-slate-500 px-1 rounded text-[9px] font-bold">${h.tag}</span></div>
                            <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <div class="font-bold text-slate-800 text-sm mb-1 text-${h.color}-600">${h.title}</div>
                                <div class="text-xs text-slate-600">${h.desc}</div>
                            </div>
                        </div>
                    `;
                });
                document.getElementById('pm-timeline').innerHTML = tHtml;
                
                // Show modal
                pOverlay.classList.remove('hidden');
                pModal.classList.remove('hidden');
                setTimeout(() => {
                    pOverlay.classList.remove('opacity-0');
                    pModal.classList.remove('opacity-0', 'scale-95');
                }, 10);
            };

            window.closeProfileModal = function() {
                pOverlay.classList.add('opacity-0');
                pModal.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    pOverlay.classList.add('hidden');
                    pModal.classList.add('hidden');
                }, 300);
            };

            // Global Block Tooltip Logic
            const globalTooltip = document.getElementById('global-block-tooltip');
            const gbtDate = document.getElementById('gbt-date');
            const gbtStatus = document.getElementById('gbt-status');
            const gbtMembers = document.getElementById('gbt-members');

            document.addEventListener('mouseover', function(e) {
                if (e.target.classList.contains('attendance-block')) {
                    const rect = e.target.getBoundingClientRect();
                    const date = e.target.getAttribute('data-date') || '미정';
                    const status = e.target.getAttribute('data-status') || '미진행';
                    const members = e.target.getAttribute('data-members') || '—';
                    const colorClass = e.target.getAttribute('data-color') || 'text-slate-400';

                    gbtDate.textContent = date;
                    gbtStatus.textContent = status;
                    gbtStatus.className = `font-bold ${colorClass}`;
                    gbtMembers.innerHTML = members === '—' ? '—' : members.split(', ').map(m => {
                        const isSub = m.includes('(대타)');
                        const clean = m.replace('(대타)', '').trim();
                        const match = clean.match(/^(.+?)(\(\d{4}\))$/);
                        const name = match ? match[1] : clean;
                        const num = match ? `<span class="text-slate-400 font-normal">${match[2]}</span>` : '';
                        const sub = isSub ? `<span class="text-amber-300 text-[9px]"> 대타</span>` : '';
                        const cls = isSub ? 'text-amber-300' : 'text-white';
                        return `<div class="${cls} font-semibold">${name}${num}${sub}</div>`;
                    }).join('');

                    globalTooltip.style.left = `${rect.left + (rect.width / 2)}px`;
                    globalTooltip.style.top = `${rect.top - 8}px`;
                    globalTooltip.classList.remove('hidden');
                }
            });

            document.addEventListener('mouseout', function(e) {
                if (e.target.classList.contains('attendance-block')) {
                    globalTooltip.classList.add('hidden');
                }
            });

            // === Calendar Modal for 출석/불참/대타 ===
            const leaderSchedule = {};
            leaders.forEach(l => {
                leaderSchedule[l.name] = l.schedule;
            });

            const calOverlay = document.getElementById('cal-modal-overlay');
            const calModal = document.getElementById('cal-modal');
            let calCurrentName = '';
            let calDateStates = {}; // { '2026-04-01': '출석', ... }
            const calColors = { '출석 완료': 'emerald', '대타 출석 완료': 'amber', '출석 예정': 'emerald', '불참': 'red', '대타 예정': 'amber' };
            const calIcons = { '출석 완료': 'ph-check-circle', '대타 출석 완료': 'ph-swap', '출석 예정': 'ph-clock', '불참': 'ph-x-circle', '대타 예정': 'ph-swap' };
            const calCompleted = ['출석 완료', '대타 출석 완료', '불참']; // 완료된 상태 = 칸 전체 색상
            const dayLabels = ['일','월','화','수','목','금','토'];

            function renderCalGrid() {
                const year = 2026, month = 3;
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                let html = '';
                dayLabels.forEach(d => {
                    html += `<div class="text-center text-[10px] font-bold text-slate-400 py-1">${d}</div>`;
                });
                for (let i = 0; i < firstDay; i++) html += `<div></div>`;

                for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `2026-04-${String(d).padStart(2,'0')}`;
                    const stateObj = calDateStates[dateStr];
                    const state = stateObj ? stateObj.status : null;
                    const isActive = calSelectedDate === dateStr;
                    let bg = 'bg-white hover:bg-slate-100', dot = '', textCls = '';

                    if (state) {
                        const c = calColors[state] || 'slate';
                        const isDone = calCompleted.includes(state);
                        if (isDone) {
                            // 완료 상태: 칸 전체에 색상
                            bg = isActive ? `bg-${c}-300 ring-2 ring-${c}-500` : `bg-${c}-200 hover:bg-${c}-300`;
                            textCls = `text-${c}-800 font-bold`;
                            dot = (stateObj.lang && stateObj.time) ? `<span class="absolute right-1 top-1 text-[7px] font-black opacity-40">${stateObj.lang}${stateObj.time.includes('11') ? '11' : '8'}</span>` : '';
                        } else {
                            // 예정 상태: 점으로만 표시 + 언어/시간 힌트
                            bg = isActive ? `bg-white ring-2 ring-${c}-400` : `bg-white hover:bg-slate-50`;
                            const info = (stateObj.lang && stateObj.time) ? `${stateObj.lang}${stateObj.time.includes('11') ? '11' : '8'}` : (stateObj.lang || '');
                            const langHint = info ? `<span class="absolute right-1 top-1 text-[7px] font-black opacity-40 text-slate-400">${info}</span>` : '';
                            dot = `<span class="block w-1.5 h-1.5 rounded-full bg-${c}-500 mx-auto mt-0.5"></span>${langHint}`;
                        }
                    } else if (isActive) {
                        bg = 'bg-slate-100 ring-2 ring-brand-400';
                    }

                    const isToday = d === 5 ? 'font-black text-brand-600' : (textCls || 'text-slate-700');
                    html += `<div class="cal-date-cell relative text-center py-1.5 rounded-lg ${bg} cursor-pointer transition-all select-none" data-date="${dateStr}">
                        <span class="text-xs ${isToday} pointer-events-none">${d}</span>${dot}
                    </div>`;
                }
                document.getElementById('cal-modal-grid').innerHTML = html;
            }

            function renderCalList() {
                const grouped = { '출석 완료': [], '대타 출석 완료': [], '출석 예정': [], '불참': [], '대타 예정': [] };
                Object.entries(calDateStates).forEach(([date, obj]) => {
                    const type = typeof obj === 'string' ? obj : obj.status;
                    if (grouped[type]) grouped[type].push(date);
                });
                let listHtml = '';
                ['출석 완료','대타 출석 완료','출석 예정','불참','대타 예정'].forEach(type => {
                    const dates = grouped[type];
                    if (dates.length === 0) return;
                    const c = calColors[type];
                    listHtml += `<div class="mb-2 last:mb-0">
                        <div class="flex items-center gap-1.5 mb-1">
                            <span class="w-2 h-2 rounded-full bg-${c}-500"></span>
                            <span class="text-[11px] font-bold text-${c}-700">${type} (${dates.length}회)</span>
                        </div>
                        <div class="flex flex-wrap gap-1 ml-3.5">`;
                    dates.sort().forEach(date => {
                        const dt = new Date(date);
                        const dayName = dayLabels[dt.getDay()];
                        const short = `${dt.getMonth()+1}.${String(dt.getDate()).padStart(2,'0')}`;
                        const obj = calDateStates[date];
                        const langTime = (typeof obj === 'object') ? `<span class="opacity-60 ml-1 ml-1 text-[8px] border-l border-current pl-1">${obj.lang} ${obj.time.split(':')[0]}시</span>` : '';
                        listHtml += `<span class="px-1.5 py-0.5 bg-${c}-50 text-${c}-700 text-[10px] rounded font-semibold border border-${c}-200 flex items-center">${short} (${dayName})${langTime}</span>`;
                    });
                    listHtml += `</div></div>`;
                });
                if (!listHtml) listHtml = `<div class="text-center text-slate-400 text-sm py-4">일정이 없습니다.</div>`;
                document.getElementById('cal-modal-list').innerHTML = listHtml;
            }

            let calSelectedDate = null;

            function generatePopupHtml(dateStr) {
                const current = calDateStates[dateStr] || { status: null, lang: '영', time: '11:00 AM' };
                const dt = new Date(dateStr);
                const dayName = dayLabels[dt.getDay()];
                const short = `${dt.getMonth()+1}.${dt.getDate()}`;

                const optionsGroup1 = [
                    { key: '불참', icon: 'ph-x-circle', color: 'red' },
                    { key: '대타 예정', icon: 'ph-swap', color: 'amber' },
                ];
                const optionsGroup2 = [
                    { key: '출석 완료', icon: 'ph-check-circle', color: 'emerald' },
                    { key: '대타 출석 완료', icon: 'ph-swap', color: 'amber' },
                    { key: '출석 예정', icon: 'ph-clock', color: 'emerald' },
                ];

                let html = `<div class="text-[10px] font-bold text-slate-400 px-1.5 pb-1 mb-1 border-b border-slate-100 flex justify-between items-center">${short} (${dayName}) <button onclick="setDateState('${dateStr}', null)" class="text-[9px] hover:text-red-500">삭제</button></div>`;
                
                // Lang Selector
                html += `<div class="flex gap-1 p-1 mb-1 bg-slate-50 rounded">
                    <button onclick="setDateLang('${dateStr}', '영')" class="flex-1 py-1 rounded text-[10px] font-bold ${current.lang === '영' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:bg-slate-200'} transition-all">영어</button>
                    <button onclick="setDateLang('${dateStr}', '일')" class="flex-1 py-1 rounded text-[10px] font-bold ${current.lang === '일' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-200'} transition-all">일어</button>
                </div>`;
                // Time Selector
                html += `<div class="flex gap-1 p-1 mb-1 bg-slate-50 rounded">
                    <button onclick="setDateTime('${dateStr}', '11:00 AM')" class="flex-1 py-1 rounded text-[10px] font-bold ${current.time === '11:00 AM' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:bg-slate-200'} transition-all">11시(오전)</button>
                    <button onclick="setDateTime('${dateStr}', '8:00 PM')" class="flex-1 py-1 rounded text-[10px] font-bold ${current.time === '8:00 PM' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:bg-slate-200'} transition-all">8시(오후)</button>
                </div>`;

                html += `<div class="my-1 border-t border-slate-100"></div>`;

                optionsGroup1.forEach(o => {
                    const isActive = current.status === o.key;
                    const activeCls = isActive
                        ? `bg-${o.color}-100 text-${o.color}-800 font-bold ring-1 ring-${o.color}-300`
                        : `text-${o.color}-700 hover:bg-${o.color}-50`;
                    html += `<button onclick="setDateState('${dateStr}','${o.key}')" class="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-bold transition-all ${activeCls}">
                        <i class="ph-bold ${o.icon} text-sm"></i> ${o.key}
                    </button>`;
                });
                html += `<div class="my-1 border-t border-slate-200"></div>`;
                optionsGroup2.forEach(o => {
                    const isActive = current.status === o.key;
                    const activeCls = isActive
                        ? `bg-${o.color}-100 text-${o.color}-800 font-bold ring-1 ring-${o.color}-300`
                        : `text-${o.color}-700 hover:bg-${o.color}-50`;
                    html += `<button onclick="setDateState('${dateStr}','${o.key}')" class="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-bold transition-all ${activeCls}">
                        <i class="ph-bold ${o.icon} text-sm"></i> ${o.key}
                    </button>`;
                });

                html += `<div class="my-1 border-t border-slate-200"></div>`;
                html += `<button onclick="closeDateOptions()" class="w-full py-2 mt-1 bg-slate-800 text-white text-[11px] font-black rounded hover:bg-slate-900 transition-colors shadow-sm">확인 (닫기)</button>`;

                return html;
            }

            function showDateOptions(dateStr) {
                const alreadyOpen = (calSelectedDate === dateStr);
                calSelectedDate = dateStr;
                renderCalGrid(); 

                const grid = document.getElementById('cal-modal-grid');
                const cellEl = grid.querySelector(`.cal-date-cell[data-date="${dateStr}"]`);
                if (!cellEl) return;

                let popup = document.getElementById('cal-date-options');
                if (!popup) {
                    popup = document.createElement('div');
                    popup.id = 'cal-date-options';
                    popup.className = 'absolute z-[100] bg-white rounded-lg shadow-2xl border border-slate-200 p-1.5 transition-all w-[180px]';
                    popup.onclick = (e) => e.stopPropagation();
                    grid.parentElement.style.position = 'relative'; // p-5 container
                    grid.parentElement.appendChild(popup);
                }

                const gridRect = grid.getBoundingClientRect();
                const parentRect = grid.parentElement.getBoundingClientRect();
                const cellRect = cellEl.getBoundingClientRect();
                const popupW = 180;
                
                let left = cellRect.left - parentRect.left + cellRect.width / 2 - popupW / 2;
                if (left < 4) left = 4;
                if (left + popupW > parentRect.width) left = parentRect.width - popupW - 4;
                let top = cellRect.bottom - parentRect.top + 4;

                popup.style.left = left + 'px';
                popup.style.top = top + 'px';
                popup.innerHTML = generatePopupHtml(dateStr);
            }

            window.closeDateOptions = function() {
                calSelectedDate = null;
                const el = document.getElementById('cal-date-options');
                if (el) el.remove();
                renderCalGrid(); 
            }

            window.setDateState = function(dateStr, state) {
                if (state === null) {
                    delete calDateStates[dateStr];
                } else {
                    const cur = calDateStates[dateStr] || { status: null, lang: '영', time: '11:00 AM' };
                    calDateStates[dateStr] = { ...cur, status: state };
                }
                showDateOptions(dateStr); 
                renderCalList();
            };

            window.setDateLang = function(dateStr, lang) {
                const cur = calDateStates[dateStr] || { status: null, lang: '영', time: '11:00 AM' };
                calDateStates[dateStr] = { ...cur, lang: lang };
                showDateOptions(dateStr); 
                renderCalList();
            };

            window.setDateTime = function(dateStr, time) {
                const cur = calDateStates[dateStr] || { status: null, lang: '영', time: '11:00 AM' };
                calDateStates[dateStr] = { ...cur, time: time };
                showDateOptions(dateStr); 
                renderCalList();
            };

            // Click on calendar date → show options
            document.getElementById('cal-modal-grid').addEventListener('click', function(e) {
                if (e.target.closest('#cal-date-options')) return;
                const cell = e.target.closest('.cal-date-cell');
                if (!cell) return;
                const dateStr = cell.dataset.date;
                if (!dateStr) return;

                if (calSelectedDate === dateStr) {
                    closeDateOptions();
                    renderCalGrid();
                } else {
                    showDateOptions(dateStr);
                }
            });

            window.openCalendarModal = function(name, type) {
                const data = leaderSchedule[name];
                if (!data) return;
                calCurrentName = name;

                document.getElementById('cal-modal-title').textContent = `${name} — 일정 관리`;
                const typeBadge = document.getElementById('cal-modal-type-badge');
                const c = calColors[type];
                typeBadge.textContent = type;
                typeBadge.className = `px-2 py-0.5 rounded text-xs font-bold bg-${c}-100 text-${c}-700 border border-${c}-200`;

                calDateStates = {};
                ['출석 완료','결석','대타 예정','대타 출석 완료','출석 예정'].forEach(t => {
                    (data[t] || []).forEach(item => { 
                        const lang = item.team ? (item.team.startsWith('영') ? '영' : '일') : '영';
                        calDateStates[item.date] = { status: t, lang: lang, time: item.time || '11:00 AM' }; 
                    });
                });

                renderCalGrid();
                renderCalList();

                calOverlay.classList.remove('hidden');
                calModal.classList.remove('hidden');
                setTimeout(() => {
                    calOverlay.classList.remove('opacity-0');
                    calModal.classList.remove('opacity-0', 'scale-95');
                }, 10);
            };

            // 대타 잔여횟수 조정
            window.adjustSubCount = function(name, delta) {
                const el = document.getElementById(`sub-count-${name}`);
                if (!el) return;
                let val = parseInt(el.textContent) + delta;
                if (val < 0) val = 0;
                el.textContent = val;
            };

            window.saveCalendarChanges = function() {
                let att = 0, abs = 0;
                Object.values(calDateStates).forEach(obj => {
                    const s = obj.status;
                    if (s === '출석 완료' || s === '대타 출석 완료') att++;
                    else if (s === '불참') abs++;
                });
                const done = att + abs;
                const rate = done > 0 ? Math.round((att / done) * 100) : 0;

                const footer = document.querySelector('#cal-modal .flex-shrink-0');
                footer.style.position = 'relative';
                const msg = document.createElement('div');
                msg.className = 'absolute inset-0 flex items-center justify-center bg-white/95 rounded-b-2xl z-10';
                msg.innerHTML = `<div class="flex items-center gap-2 text-brand-700 font-bold text-sm"><i class="ph-fill ph-check-circle text-xl text-emerald-500"></i> 저장 완료 — 출석 ${att} / 불참 ${abs} (출석률 ${rate}%)</div>`;
                footer.appendChild(msg);
                setTimeout(() => { msg.remove(); closeCalendarModal(); }, 2000);
            };

            window.closeCalendarModal = function() {
                closeDateOptions();
                calOverlay.classList.add('opacity-0');
                calModal.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    calOverlay.classList.add('hidden');
                    calModal.classList.add('hidden');
                }, 300);
            };

            // View Toggles removed
        });
    