/**
 * Member page logic.
 * Extracted from two inline <script> blocks in member.html:
 *   Block 1 (lines 851-2907): main page logic (data, render, modals)
 *   Block 2 (lines 2914-2958): scroll-top button + dynamic sticky positions
 * Mulberry32 seed PRNG is preserved here so member listings stay deterministic.
 */
        document.addEventListener('DOMContentLoaded', () => {
            // Drawer is wired via js/shared/drawer.js (loadNav + tDrawer global)

            // ─── DATA GENERATION ───
            const surnames = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','전','홍','고','문','양','손','배','백','허','유','남','심','노','하','곽','성','차','주','우','구','민','나','진','지','엄','채','원','천','방','공','현'];
            const femaleNames = ['지윤','서연','하은','수빈','민서','예은','지아','하윤','소율','채원','유나','시은','다은','예린','수아','지은','서윤','민지','하영','은서','채연','보라','소영','미래','소희','다현','예지','은비','수연','현주','유진','미영','정은','혜원','수정','지혜','민아','서영','하연','보영','소연','경희','미선','은주','정민','혜진','수민','지현','서희','민영','하정','경미','소정','혜선','은정','수현','민정','지영','서정','하림','경은'];
            const maleNames = ['민준','서준','도윤','예준','시우','하준','주원','지호','지훈','준서','건우','현우','선우','서진','유준','연우','은우','정우','승현','동현','태민','성민','준혁','재민','지환','우진','승우','민혁','준영','현민','재현','도현','태현','은호','성준','승민','정호','재윤','지원','세준','민규','한결','정현','승준','원준','민찬','시현','지성','준호','동윤','태우','성현','재호','민수','건호','지완','도영','현서','승호','정윤'];
            const memos = [
                '다음 주 레벨테스트 예정','출석률 관리 필요','연장 등록 상담 완료','해외 출장 2주 홀딩 중','프로모션 안내 완료',
                '스터디 그룹 리더','첫 주 보충 수업 안내 요망','전화 상담 후 재등록 의사 확인','주말반 이동 희망','레벨업 테스트 준비 중',
                '다음 달 멤버십 만료 예정','VIP 프로모션 대상자','화상수업 병행 중','그룹 스터디 참여 활발','개인 사정으로 잠시 휴식 예정',
                '출석 우수 회원 - 칭찬 메모','영어/일어 병행 수강 중','수업 시간 변경 요청','보충 수업 2회 예정','학습 목표 재설정 필요',
                '원어민 수업 추가 희망','교재 추가 구매 안내','장기 회원 감사 이벤트 대상','이번 달 출석률 80% 달성','다음 분기 커리큘럼 안내 완료',
                '개별 피드백 전달 완료','시험 준비 집중 코스 상담','친구 소개 이벤트 참여','홀딩 해제 후 복귀 예정','수강료 결제 확인 필요',
                '그룹 변경 요청 (시간대)','특별 할인 적용 완료','학습 진도 점검 필요','다음 주 보강 수업 안내','온라인 수업 전환 요청',
                '멤버십 갱신 안내 발송','출석 패턴 불규칙 - 확인 필요','우수 학생 포상 대상','커리큘럼 만족도 조사 완료','보강 일정 조율 중',
                '수업 피드백 긍정적','장기 플랜 상담 예정','이벤트 참여 확인 완료','수업 자료 추가 요청','학습 목표 달성률 높음',
                '시간표 조정 요청 접수','워크숍 참여 안내','스피킹 테스트 일정 확인','문법 보강 필요','리스닝 강화 프로그램 안내',
                '다음 학기 등록 상담 완료','교재 변경 안내','소그룹 스터디 배정 완료','발음 교정 수업 추천'
            ];
            const leaders = [
                { name: '박선민', ext: '1001' }, { name: '제인', ext: '1002' }, { name: '유미', ext: '1003' },
                { name: '사라', ext: '1004' }, { name: '켄', ext: '1005' }, { name: '마이크', ext: '1006' },
                { name: '하나', ext: '1007' }, { name: '리사', ext: '1008' }, { name: '톰', ext: '1009' }, { name: '에밀리', ext: '1010' }
            ];
            const alertTypes = [
                { badge: '<span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>첫 스터디 미체크', cls: 'bg-red-100 text-red-700 border-red-200' },
                { badge: '<i class="ph-fill ph-clock-countdown mr-1.5"></i>만료 D-7', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
                { badge: '<i class="ph-fill ph-check-circle mr-1.5"></i>첫 스터디 체크', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                { badge: '<i class="ph-fill ph-credit-card mr-1.5"></i>결제 확인', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                { badge: '<i class="ph-fill ph-arrow-u-up-left mr-1.5"></i>홀딩 복귀', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
            ];

            const teamDefs = [
                { key: '영_월수_11', lang: '영', schedule: '월수', time: '11', label: '영어 월수 11시', isJapanese: false },
                { key: '영_월수_8', lang: '영', schedule: '월수', time: '8', label: '영어 월수 8시', isJapanese: false },
                { key: '영_화목_11', lang: '영', schedule: '화목', time: '11', label: '영어 화목 11시', isJapanese: false },
                { key: '영_화목_8', lang: '영', schedule: '화목', time: '8', label: '영어 화목 8시', isJapanese: false },
                { key: '영_토일_11', lang: '영', schedule: '토일', time: '11', label: '영어 토일 11시', isJapanese: false },
                { key: '일_월수_11', lang: '일', schedule: '월수', time: '11', label: '일어 월수 11시', isJapanese: true },
                { key: '일_월수_8', lang: '일', schedule: '월수', time: '8', label: '일어 월수 8시', isJapanese: true },
                { key: '일_화목_11', lang: '일', schedule: '화목', time: '11', label: '일어 화목 11시', isJapanese: true },
                { key: '일_화목_8', lang: '일', schedule: '화목', time: '8', label: '일어 화목 8시', isJapanese: true },
                { key: '일_토일_11', lang: '일', schedule: '토일', time: '11', label: '일어 토일 11시', isJapanese: true },
            ];

            const membershipTypes = [
                { name: 'VVIP', total: 1040, colorRow: 'bg-purple-50 text-purple-600 border-purple-200', colorModal: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                { name: 'VIP', total: 520, colorRow: 'bg-indigo-50 text-indigo-600 border-indigo-200', colorModal: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
                { name: 'A+', total: 104, colorRow: 'bg-emerald-50 text-emerald-600 border-emerald-200', colorModal: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                { name: 'H+', total: 52, colorRow: 'bg-orange-50 text-orange-600 border-orange-200', colorModal: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
                { name: 'T', total: 24, colorRow: 'bg-slate-50 text-slate-600 border-slate-200', colorModal: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
            ];

            const lvColors = {
                0: { bg: 'bg-slate-500', text: 'text-slate-700', light: 'bg-slate-100', border: 'border-slate-300' },
                1: { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-200' },
                2: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
                3: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', border: 'border-purple-200' },
                4: { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', border: 'border-amber-200' },
            };

            // Seeded PRNG
            function mulberry32(a) {
                return function() {
                    a |= 0; a = a + 0x6D2B79F5 | 0;
                    var t = Math.imul(a ^ a >>> 15, 1 | a);
                    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                    return ((t ^ t >>> 14) >>> 0) / 4294967296;
                }
            }
            function hashStr(s) {
                let h = 0;
                for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
                return Math.abs(h);
            }

            const usedPhones = new Set();
            function genPhone(rng) {
                let phone;
                do {
                    const mid = String(Math.floor(rng() * 9000 + 1000));
                    const end = String(Math.floor(rng() * 9000 + 1000));
                    phone = `010-${mid}-${end}`;
                } while (usedPhones.has(phone));
                usedPhones.add(phone);
                return phone;
            }

            const usedNames = new Set();
            function genName(rng) {
                let name, attempts = 0;
                do {
                    const sn = surnames[Math.floor(rng() * surnames.length)];
                    const isMale = rng() > 0.5;
                    const pool = isMale ? maleNames : femaleNames;
                    const gn = pool[Math.floor(rng() * pool.length)];
                    name = sn + gn;
                    attempts++;
                    if (attempts > 200) {
                        const sn2 = surnames[Math.floor(rng() * surnames.length)];
                        const pool2 = isMale ? femaleNames : maleNames;
                        name = sn2 + pool2[Math.floor(rng() * pool2.length)];
                    }
                } while (usedNames.has(name));
                usedNames.add(name);
                return name;
            }

            // ─── BUILD ALL MEMBERS ───
            const allMembers = {};
            const memberDataMap = {};

            teamDefs.forEach((td) => {
                const levels = [0,1,2,3,4];
                allMembers[td.key] = {};
                levels.forEach((lv) => {
                    const seed = hashStr(td.key + '_' + lv);
                    const rng = mulberry32(seed);
                    const members = [];
                    // Variable count per (team, level): 16~34 deterministic from seed
                    const memberCount = 16 + Math.floor(rng() * 19);
                    for (let i = 0; i < memberCount; i++) {
                        const name = genName(rng);
                        const phone = genPhone(rng);
                        const age = Math.floor(rng() * 36) + 20;
                        const msIdx = Math.floor(rng() * membershipTypes.length);
                        const ms = membershipTypes[msIdx];
                        const remaining = Math.floor(rng() * (ms.total * 0.9)) + Math.floor(ms.total * 0.05);
                        const perWeek = rng() > 0.5 ? 4 : 2;
                        const startMonth = Math.floor(rng() * 12) + 1;
                        const startDay = Math.floor(rng() * 28) + 1;
                        const startYr = rng() > 0.5 ? 25 : 26;
                        const startDate = `${startYr}.${String(startMonth).padStart(2,'0')}.${String(startDay).padStart(2,'0')}`;
                        const expMonth = Math.floor(rng() * 6) + 4;
                        const expDay = Math.floor(rng() * 28) + 1;
                        const expDate = `26.${String(expMonth).padStart(2,'0')}.${String(expDay).padStart(2,'0')}`;
                        const memo = memos[Math.floor(rng() * memos.length)];
                        const timeLabel = td.time === '11' ? '11AM' : '8PM';
                        const mainBadge = `${td.schedule} ${timeLabel}(${lv})`;
                        const teamBadges = [{ label: mainBadge, isJapanese: td.isJapanese }];
                        if (rng() > 0.75) {
                            const otherTd = teamDefs[Math.floor(rng() * teamDefs.length)];
                            if (otherTd.key !== td.key) {
                                const otherTime = otherTd.time === '11' ? '11AM' : '8PM';
                                const otherLv = otherTd.isJapanese ? Math.floor(rng()*5) : Math.floor(rng()*4)+1;
                                teamBadges.push({ label: `${otherTd.schedule} ${otherTime}(${otherLv})`, isJapanese: otherTd.isJapanese });
                            }
                        }
                        const blockCount = perWeek === 4 ? 16 : 8;
                        const attended = Math.floor(rng() * (blockCount + 1));
                        const attRate = blockCount > 0 ? Math.round((attended / blockCount) * 100) : 0;
                        const blocks = [];
                        const days = ['월','화','수','목','금','토','일'];
                        for (let b = 0; b < blockCount; b++) {
                            const dayNum = Math.floor(b / (perWeek === 4 ? 4 : 2)) * 7 + (b % (perWeek === 4 ? 4 : 2)) * 2 + 1;
                            const dayOfWeek = days[dayNum % 7];
                            const dateStr = `04.${String(Math.min(dayNum, 28)).padStart(2,'0')} (${dayOfWeek})`;
                            const leaderObj = leaders[Math.floor(rng() * leaders.length)];
                            const leader = `${leaderObj.name} (${leaderObj.ext})`;
                            if (b < attended) blocks.push({ date: dateStr, status: '출석', color: 'text-emerald-400', bg: 'bg-emerald-500 shadow-sm border border-emerald-600/30', leader });
                            else if (b === attended && rng() > 0.7) blocks.push({ date: dateStr, status: '불참', color: 'text-red-400', bg: 'bg-red-300 border border-red-400/30', leader });
                            else blocks.push({ date: dateStr, status: '미진행', color: 'text-slate-400', bg: 'bg-slate-200 border border-slate-300/30', leader });
                        }
                        const todayState = rng() > 0.6 ? 'checked' : 'unchecked';
                        // Alert flag: low attendance, expiring soon, first visit
                        let alertType = null;
                        if (attRate <= 20 && rng() > 0.5) alertType = 2; // 첫 스터디 체크
                        else if (remaining <= 5 && rng() > 0.4) alertType = 1; // 만료 임박
                        else if (i < 3 && rng() > 0.6) alertType = 0; // 첫 스터디 미체크
                        else if (rng() > 0.85) alertType = 3; // 결제 확인
                        else if (rng() > 0.92) alertType = 4; // 홀딩 복귀
                        else if (rng() > 0.98) alertType = Math.floor(rng() * alertTypes.length);

                        const member = {
                            id: `m_${td.key}_${lv}_${i}`,
                            name, phone, age, level: lv, membership: ms, remaining, perWeek,
                            startDate, expDate, regDate: startDate, memo, teamBadges, blocks, attRate, todayState,
                            teamKey: td.key, teamLabel: td.label, alertType, attended, blockCount
                        };
                        members.push(member);

                        memberDataMap[name] = {
                            level: `LV ${lv}`, phone, membership: `${ms.name} 멤버십`, mColor: ms.colorModal,
                            teams: teamBadges.map(tb => tb.label), regDate: startDate, startDate,
                            remainSession: String(remaining), totalSession: String(ms.total),
                            mName: ms.name, expDate, expNote: `주 ${perWeek}회 참석`,
                            attRate: attRate + '%', attCount: `${attended}/${blockCount}회`,
                            totalAtt: attended, totalCount: blockCount, blocks: blocks,
                            attColor: attRate >= 80 ? 'text-emerald-600' : attRate >= 50 ? 'text-slate-500' : 'text-purple-600',
                            message: memo + '. 관리자 상담 기록: 정기 점검 예정.',
                            history: [
                                { date: '2026.04.01', tag: `잔여 ${remaining}/${ms.total}회 • 주 ${perWeek}회`, color: 'indigo', title: '정기 점검', desc: '출석 현황 및 학습 진행 상태 확인 완료.' },
                                { date: '2026.03.01', tag: `잔여 ${Math.min(remaining+10, ms.total)}/${ms.total}회`, color: 'purple', title: '상담 기록', desc: '학습 목표 재설정 및 스케줄 확인.' },
                                { date: startDate.replace(/^(\d+)/, '20$1'), tag: `잔여 ${ms.total}/${ms.total}회 • 신규`, color: 'emerald', title: `${ms.name} 멤버십 등록 (${ms.total}회)`, desc: '최초 등록 완료. 오리엔테이션 및 레벨 테스트 진행.' }
                            ]
                        };
                    }
                    allMembers[td.key][lv] = members;
                });
            });

            // ─── STATE ───
            let currentTeamIdx = 0;
            let currentSort = 'att-desc';
            let currentViewMode = 'table';
            let currentAlertViewMode = 'list';

            let _checkCollapsed = false;
            window.toggleCheckSection = function() {
                _checkCollapsed = !_checkCollapsed;
                const wrap = document.getElementById('check-content-wrap');
                const icon = document.getElementById('check-collapse-icon');
                if (_checkCollapsed) {
                    wrap.style.maxHeight = '0';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    wrap.style.maxHeight = '2000px';
                    icon.style.transform = '';
                }
            };

            window.setAlertViewMode = function(mode) {
                currentAlertViewMode = mode;
                const vList = document.getElementById('alert-list-container');
                const vCard = document.getElementById('alert-card-container');
                const btnList = document.getElementById('alert-view-btn-list');
                const btnCard = document.getElementById('alert-view-btn-card');

                if (mode === 'list') {
                    vList.classList.remove('hidden');
                    vCard.classList.add('hidden');
                    btnList.classList.add('bg-white', 'shadow-sm', 'text-amber-600');
                    btnList.classList.remove('text-amber-400');
                    btnCard.classList.remove('bg-white', 'shadow-sm', 'text-amber-600');
                    btnCard.classList.add('text-amber-400');
                } else {
                    vList.classList.add('hidden');
                    vCard.classList.remove('hidden');
                    btnCard.classList.add('bg-white', 'shadow-sm', 'text-amber-600');
                    btnCard.classList.remove('text-amber-400');
                    btnList.classList.remove('bg-white', 'shadow-sm', 'text-amber-600');
                    btnList.classList.add('text-amber-400');
                }
                renderTeam(currentTeamIdx);
            };

            window.setViewMode = function(mode) {
                currentViewMode = mode;
                const vList = document.getElementById('view-list-section');
                const vCard = document.getElementById('view-card-section');
                const vBuilder = document.getElementById('view-builder-section');
                const btnTable = document.getElementById('view-btn-table');
                const btnCard = document.getElementById('view-btn-card');
                const btnBuilder = document.getElementById('view-btn-builder');

                // Reset toggle group buttons (table/card)
                [btnTable, btnCard].filter(Boolean).forEach(b => {
                    b.classList.remove('bg-white', 'shadow-sm', 'text-brand-700');
                    b.classList.add('text-slate-500');
                });
                // Reset standalone TEAM MAP button
                if (btnBuilder) {
                    btnBuilder.classList.remove('bg-brand-500', 'text-white', 'border-brand-500');
                    btnBuilder.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
                }
                vList.classList.add('hidden');
                vCard.classList.add('hidden');
                if (vBuilder) vBuilder.classList.add('hidden');

                if (mode === 'card') {
                    vCard.classList.remove('hidden');
                    btnCard.classList.add('bg-white', 'shadow-sm', 'text-brand-700');
                    btnCard.classList.remove('text-slate-500');
                    renderTeam(currentTeamIdx);
                } else if (mode === 'builder') {
                    if (vBuilder) vBuilder.classList.remove('hidden');
                    if (btnBuilder) {
                        btnBuilder.classList.add('bg-brand-500', 'text-white', 'border-brand-500');
                        btnBuilder.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
                    }
                    if (typeof renderBuilderView === 'function') renderBuilderView();
                } else {
                    vList.classList.remove('hidden');
                    btnTable.classList.add('bg-white', 'shadow-sm', 'text-brand-700');
                    btnTable.classList.remove('text-slate-500');
                    renderTeam(currentTeamIdx);
                }

                // Recalc sticky because layout changed
                if (window._recalcSticky) setTimeout(window._recalcSticky, 10);
            };

            // ============================================================
            // Builder View (manual table layout — disconnected from attendance data)
            // ============================================================
            const BLD_KEY = 'admin.memberBuilderTables.v8';
            const BLD_ALERTS = {
                first_day: { label: '첫날', cls: 'bg-red-100 text-red-700 border-red-200' },
                first_check: { label: '첫체크', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                expiring: { label: '만기', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
                payment: { label: '결제', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                returning: { label: '복귀', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
            };
            const BLD_LEVELS = [
                { key: 'LV0', label: 'LV 0', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', accent: '#475569' },
                { key: 'LV1', label: 'LV 1', color: '#059669', bg: '#d1fae5', border: '#6ee7b7', accent: '#10b981' },
                { key: 'LV2', label: 'LV 2', color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', accent: '#3b82f6' },
                { key: 'LV3', label: 'LV 3', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', accent: '#8b5cf6' },
                { key: 'LV4', label: 'LV 4', color: '#d97706', bg: '#fef3c7', border: '#fcd34d', accent: '#f59e0b' },
            ];
            const BLD_MEMBERSHIPS_MEMBER = ['VVIP+', 'VVIP', 'A+', 'H+', 'T'];
            const BLD_MEMBERSHIPS_LEADER = ['SL'];
            // idx 0=전체, 1=영어 전체, 2~6=영어 5팀, 7=일본어 전체, 8~12=일어 5팀
            const BLD_TEAM_LABELS = ['', '', '영 월수 11', '영 월수 8', '영 화목 11', '영 화목 8', '영 토일 11', '', '일 월수 11', '일 월수 8', '일 화목 11', '일 화목 8', '일 토일 11'];

            const bldMemberPool = (function () {
                // Celebrity-inspired Korean names (배우/가수/스포츠/방송인 — 가상 데이터)
                const names = [
                    '이지은','박보검','송강호','김혜수','전지현','이병헌','손예진','현빈','공유','송중기',
                    '박서준','김태리','배수지','박신혜','이종석','김수현','임시완','이민호','정해인','박은빈',
                    '김고은','정유미','한소희','이성경','차은우','황정민','류준열','김지원','박해진','강하늘',
                    '임윤아','최우식','안효섭','박형식','조정석','손나은','김연아','손흥민','유재석','강호동',
                    '전현무','박나래','김종국','이광수','송지효','지석진','유아인','정려원','한지민','신민아',
                    '김희선','고소영','송혜교','이영애','한가인','박민영','윤은혜','정우성','한효주','조여정',
                    '오연수','김명민','조진웅','이정재','정우','황보라','한예슬','김유정','김새론','남주혁',
                    '서강준','지창욱','이준기','옥택연','정일우','이준호','윤시윤','송강','이도현','김동희',
                ];
                const memOpts = ['VVIP+','VVIP','A+','H+','T'];
                const levels = ['1','1+','2','2+','3','3+','4'];
                const pool = [];
                let seed = 12345;
                const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xFFFFFFFF; };
                names.forEach((name) => {
                    const phone = '010' + String(Math.floor(rng() * 100000000)).padStart(8, '0');
                    pool.push({
                        name, phone,
                        level: levels[Math.floor(rng() * levels.length)],
                        membership: memOpts[Math.floor(rng() * memOpts.length)],
                    });
                });
                return pool;
            })();

            function bldGetState() {
                try { return JSON.parse(localStorage.getItem(BLD_KEY) || '{}'); } catch (e) { return {}; }
            }
            function bldSetState(s) {
                try { localStorage.setItem(BLD_KEY, JSON.stringify(s)); } catch (e) { }
            }
            function bldGetActiveTeam() {
                const label = BLD_TEAM_LABELS[currentTeamIdx];
                return label && label.length ? label : null;
            }
            function bldEsc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

            function bldNewMemberRow() {
                return { name: '', level: '', comment: '', createdAt: '', phone: '', startDate: '', endDate: '', count: '', membership: '', attendance: '' };
            }

            function bldSeedExamples(teamKey) {
                const sampleComments = ['주 4회 월수화목11시', '자유참여', '월수화목 11시', '월화수목11', '주 2회', '재등록', '자기개발', 'TOEIC 대비', '해외 유학 준비', '재수강'];
                const today = new Date();
                const fmt = d => d.toISOString().slice(0, 10);
                let poolIdx = (teamKey.charCodeAt(0) || 0) % bldMemberPool.length;
                const pickMember = () => {
                    const m = bldMemberPool[poolIdx % bldMemberPool.length];
                    poolIdx++;
                    return m;
                };
                const buildRow = (rowSeed, levelKey) => {
                    const m = pickMember();
                    const start = new Date(today.getFullYear() - (rowSeed % 2 ? 1 : 0), (rowSeed * 3) % 12, ((rowSeed * 5) % 27) + 1);
                    const end = new Date(start); end.setMonth(end.getMonth() + 6 + (rowSeed % 6));
                    const did = (rowSeed * 17) % 220;
                    const left = 1040 - did;
                    const attChoices = ['o', 'o', 'o', 'late', 'x', ''];
                    const histStates = ['o', 'o', 'o', 'o', 'late', 'o', 'o', 'x', 'o', 'late'];
                    const histLen = 4 + (rowSeed % 6);
                    const attHistory = [];
                    for (let h = 0; h < histLen; h++) {
                        const d = new Date(today); d.setDate(today.getDate() - (histLen - h) * 2);
                        attHistory.push({ at: fmt(d), s: histStates[(rowSeed + h) % histStates.length] });
                    }
                    // Sparse alerts: ~1 in 4 rows gets one
                    const alertChoices = [null, null, null, 'first_day', null, 'expiring', null, 'payment', null, 'returning', null, null, 'first_check'];
                    const alert = alertChoices[rowSeed % alertChoices.length];
                    return {
                        name: m.name, phone: m.phone, level: levelKey.replace('LV', ''),
                        comment: sampleComments[rowSeed % sampleComments.length],
                        createdAt: fmt(start), startDate: fmt(start),
                        endDate: fmt(end), count: did + ' / ' + (did + left),
                        membership: m.membership,
                        attendance: attChoices[rowSeed % attChoices.length],
                        attHistory,
                        alert,
                    };
                };
                // Seed: distribute tables across LV1, LV2, LV3 by default
                const seedPlan = [
                    { level: 'LV1', tables: 1 },
                    { level: 'LV2', tables: 2 },
                    { level: 'LV3', tables: 1 },
                ];
                const tables = [];
                let tIdx = 0;
                seedPlan.forEach(plan => {
                    for (let t = 0; t < plan.tables; t++) {
                        const memberCount = 9;
                        const ldrSrc = bldMemberPool[(poolIdx + 50) % bldMemberPool.length];
                        poolIdx++;
                        const leader = {
                            name: ldrSrc.name, phone: ldrSrc.phone, level: plan.level.replace('LV', '') + '+', membership: 'SL',
                            comment: tIdx === 0 ? '주 4회 진행' : (tIdx === 1 ? '주 2회 진행' : '신규 개설'),
                            createdAt: fmt(new Date(today.getFullYear(), today.getMonth() - tIdx, 1)),
                            startDate: fmt(new Date(today.getFullYear(), today.getMonth() - tIdx, 5)),
                            endDate: fmt(new Date(today.getFullYear() + 1, today.getMonth(), 1)),
                            count: (16 + tIdx * 3) + ' / ' + (16 + tIdx * 3),
                            attendance: 'o',
                        };
                        const members = [];
                        for (let i = 0; i < memberCount; i++) members.push(buildRow(tIdx * 10 + i + 1, plan.level));
                        tables.push({
                            id: 't' + Date.now() + '_' + tIdx + '_' + Math.random().toString(36).slice(2, 6),
                            name: '테이블 ' + (tIdx + 1),
                            level: plan.level,
                            leader, members,
                        });
                        tIdx++;
                    }
                });
                return tables;
            }

            function bldNewTable(teamKey, levelKey, idx) {
                const ldrSrc = bldMemberPool[(idx * 7) % bldMemberPool.length];
                const lvNum = levelKey.replace('LV', '');
                return {
                    id: 't' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                    name: '테이블 ' + idx,
                    level: levelKey,
                    leader: { name: ldrSrc.name, phone: ldrSrc.phone, level: lvNum + '+', membership: 'SL', comment: '', createdAt: '', startDate: '', endDate: '', count: '', attendance: '' },
                    members: Array.from({ length: 9 }, () => bldNewMemberRow()),
                };
            }

            function bldRowHtml(tableId, row, rowIdx, isLeader) {
                const teamCell = isLeader
                    ? '<td class="text-center"><span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">STAFF</span></td>'
                    : `<td class="text-center"><span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black">${rowIdx}</span></td>`;
                const delBtn = isLeader ? '' : `<button class="bld-row-del p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors" data-table="${tableId}" data-row="${rowIdx - 1}" title="행 삭제"><i class="ph ph-trash text-xs"></i></button>`;
                const membershipOpts = isLeader ? BLD_MEMBERSHIPS_LEADER : BLD_MEMBERSHIPS_MEMBER;
                const membershipOptions = membershipOpts.map(m => `<option value="${m}" ${row.membership === m ? 'selected' : ''}>${m}</option>`).join('');
                const rowKind = isLeader ? 'leader' : 'member';
                const trClass = isLeader ? 'bld-leader-row' : '';
                // Attendance: single ✓ toggle. Today's record state.
                const todayStr = new Date().toISOString().slice(0, 10);
                const attHistory = Array.isArray(row.attHistory) ? row.attHistory : [];
                const checkedToday = attHistory.length > 0 && attHistory[attHistory.length - 1].at === todayStr;
                const recent = attHistory.slice(-6);
                const datesHtml = recent.length
                    ? recent.map(h => `<span class="bld-att-date" title="${h.at}">${h.at.slice(5).replace('-', '/')}</span>`).join('')
                    : '<span class="text-[10px] text-slate-300 italic">기록 없음</span>';
                const totalCount = attHistory.length;
                const countClass = totalCount > 0 ? 'bld-att-count' : 'bld-att-count empty';
                const countHtml = `<span class="${countClass}"><i class="ph-fill ph-check-square"></i> ${totalCount}회</span>`;
                return `<tr class="${trClass}" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}">
                    ${teamCell}
                    <td><button class="bld-name-btn w-full text-left px-2 py-1 rounded hover:bg-white border border-transparent hover:border-slate-200 transition-colors text-[12.5px] font-bold ${row.name ? 'text-slate-800' : 'text-slate-300'}" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}">${row.name ? bldEsc(row.name) : '+ 멤버 검색'}</button></td>
                    <td><input class="bld-input w-full font-mono text-slate-600" type="text" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}" data-field="phone" value="${bldEsc(row.phone)}" placeholder="010-0000-0000"></td>
                    <td><input class="bld-input w-full text-center font-bold" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}" data-field="level" value="${bldEsc(row.level)}" placeholder="—"></td>
                    <td><input class="bld-input w-full" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}" data-field="comment" value="${bldEsc(row.comment)}" placeholder="코멘트"></td>
                    <td><input class="bld-input w-full text-slate-500" type="text" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}" data-field="startDate" value="${bldEsc(row.startDate)}" placeholder="0000-00-00"></td>
                    <td><input class="bld-input w-full text-slate-500" type="text" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}" data-field="endDate" value="${bldEsc(row.endDate)}" placeholder="0000-00-00"></td>
                    <td><input class="bld-input w-full font-mono text-[11px]" type="text" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}" data-field="count" value="${bldEsc(row.count)}" placeholder="0 / 0"></td>
                    <td class="bld-membership-cell"><select class="bld-input w-full" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}" data-field="membership"><option value="">—</option>${membershipOptions}</select></td>
                    <td>
                        <div class="bld-att-cell">
                            <button class="bld-att-btn" data-active="${checkedToday}" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}" title="오늘 출석 체크">✓</button>
                            <div class="bld-att-history" data-table="${tableId}" data-row-kind="${rowKind}" data-row-idx="${rowIdx - 1}">
                                ${countHtml}
                                <div class="bld-att-dates">${datesHtml}</div>
                            </div>
                        </div>
                    </td>
                    <td class="text-center">${delBtn}</td>
                </tr>`;
            }

            function bldTableHtml(table, idx, lv) {
                const rows = [bldRowHtml(table.id, table.leader, 0, true)]
                    .concat(table.members.map((m, i) => bldRowHtml(table.id, m, i + 1, false)))
                    .join('');
                return `<div class="bld-table-card rounded-xl border bg-white overflow-hidden" data-table="${table.id}" style="border-color:${lv.border}">
                    <div class="px-3 py-2 border-b flex items-center justify-between" style="background:linear-gradient(180deg, ${lv.bg} 0%, #fff 100%);border-color:${lv.border}">
                        <div class="flex items-center gap-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-white text-[10px] font-black" style="background:${lv.color}">${lv.label}</span>
                            <span class="inline-flex items-center px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-black">팀${idx}</span>
                            <input class="bld-table-name bg-transparent text-sm font-bold text-slate-800 outline-none focus:bg-white focus:px-1.5 focus:rounded transition-all" data-table="${table.id}" value="${bldEsc(table.name)}">
                        </div>
                        <div class="flex items-center gap-1.5">
                            <button class="bld-add-row px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-700 rounded hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors flex items-center gap-1" data-table="${table.id}"><i class="ph-bold ph-plus text-[10px]"></i>행 추가</button>
                            <button class="bld-del-table px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 text-red-600 rounded hover:bg-red-50 hover:border-red-200 transition-colors flex items-center gap-1" data-table="${table.id}"><i class="ph ph-trash text-[10px]"></i>테이블 삭제</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full min-w-[1320px]">
                            <thead>
                                <tr>
                                    <th class="text-center w-16">팀${idx}</th>
                                    <th class="text-left min-w-[110px]">이름</th>
                                    <th class="text-left w-36">연락처</th>
                                    <th class="text-center w-16">레벨</th>
                                    <th class="text-left min-w-[160px]">코멘트</th>
                                    <th class="text-left w-28">시작일</th>
                                    <th class="text-left w-28">종료일</th>
                                    <th class="text-left w-32 whitespace-nowrap">횟수</th>
                                    <th class="text-center w-24">멤버쉽</th>
                                    <th class="text-left min-w-[260px]">출석체크 · 기록</th>
                                    <th class="w-8"></th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>`;
            }

            // Aggregate scope from current DOM tab
            function bldAggregateScope() {
                if (currentTeamIdx === 0) return { label: '전체 팀', teams: BLD_TEAM_LABELS.filter(l => l) };
                if (currentTeamIdx === 1) return { label: '영어 전체', teams: BLD_TEAM_LABELS.filter(l => l && l.startsWith('영')) };
                if (currentTeamIdx === 7) return { label: '일본어 전체', teams: BLD_TEAM_LABELS.filter(l => l && l.startsWith('일')) };
                return null;
            }

            // Compact rendering for aggregate selection (전체/영어 전체/일본어 전체)
            function bldRenderCompactAggregate(scope) {
                const labelEl = document.getElementById('builder-team-label');
                const wrap = document.getElementById('builder-levels');
                if (labelEl) labelEl.textContent = scope.label + ' · 한눈에 보기';

                const state = bldGetState();
                // Auto-seed missing teams so the overview is populated
                let mutated = false;
                scope.teams.forEach(tk => {
                    if (!state[tk] || !Array.isArray(state[tk].tables) || state[tk].tables.length === 0) {
                        state[tk] = { tables: bldSeedExamples(tk) };
                        mutated = true;
                    }
                    state[tk].tables.forEach(t => { if (!t.level) { t.level = 'LV1'; mutated = true; } });
                });
                if (mutated) bldSetState(state);

                const todayStr = new Date().toISOString().slice(0, 10);
                const lvByKey = Object.fromEntries(BLD_LEVELS.map(l => [l.key, l]));

                let html = '';
                BLD_LEVELS.forEach(lv => {
                    // Collect all tables at this level across in-scope teams
                    const allAtLevel = [];
                    scope.teams.forEach(tk => {
                        (state[tk]?.tables || []).filter(t => t.level === lv.key).forEach(t => allAtLevel.push({ team: tk, table: t }));
                    });
                    if (!allAtLevel.length) return;

                    const cards = allAtLevel.map(({ team, table }) => {
                        const totalRows = table.members.length;
                        let attendedToday = 0;
                        const rowItems = [];
                        // Leader (row 0)
                        const leaderToday = Array.isArray(table.leader.attHistory) && table.leader.attHistory.length && table.leader.attHistory[table.leader.attHistory.length - 1].at === todayStr;
                        if (leaderToday) attendedToday++;
                        const leaderFilled = !!(table.leader.name || table.leader.phone);
                        rowItems.push(`<li class="bld-cmp-row relative ${leaderToday ? 'is-att-today' : ''} bld-cmp-leader" title="${bldEsc(table.leader.name) || '리더'}">
                            <button class="bld-cmp-slot-btn ${leaderFilled ? '' : 'empty'}" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}" data-row-kind="leader" title="${leaderFilled ? '리더 변경/비우기' : '리더 추가'}">
                                <span class="bld-cmp-no">L.</span>
                                <span class="bld-cmp-name">${leaderFilled ? bldEsc(table.leader.name || '—') : ''}</span>
                                <span class="bld-cmp-phone">${bldEsc(table.leader.phone) || ''}</span>
                            </button>
                            <button class="bld-cmp-att-toggle ${leaderToday ? 'is-hidden' : ''}" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}" data-row-kind="leader" title="${leaderFilled ? '오늘 출석 체크' : '먼저 리더를 추가하세요'}" ${!leaderFilled ? 'disabled' : ''}></button>
                            <div class="bld-row-actions hidden absolute top-[100%] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-[60] overflow-hidden flex-col p-1.5 gap-0.5">
                                <button class="w-full text-left px-3 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2" id="bld-act-delete" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}" data-row-kind="leader"><i class="ph-bold ph-trash"></i> 삭제</button>
                            </div>
                        </li>`);
                        // Members
                        table.members.forEach((m, mi) => {
                            const isToday = Array.isArray(m.attHistory) && m.attHistory.length && m.attHistory[m.attHistory.length - 1].at === todayStr;
                            if (isToday) attendedToday++;
                            const totalAtt = Array.isArray(m.attHistory) ? m.attHistory.length : 0;
                            const isFilled = !!(m.name || m.phone);
                            const slotClass = isFilled ? '' : 'empty';
                            const nameDisp = isFilled ? bldEsc(m.name || '—') : '';
                            rowItems.push(`<li class="bld-cmp-row relative ${isToday ? 'is-att-today' : ''}" title="${bldEsc(m.name) || '빈 슬롯'} · 누적 출석 ${totalAtt}회">
                                <button class="bld-cmp-slot-btn ${slotClass}" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}" data-row-idx="${mi}" title="${isFilled ? '클릭해서 변경/비우기' : '클릭해서 멤버 추가'}">
                                    <span class="bld-cmp-no">${mi + 1}.</span>
                                    <span class="bld-cmp-name">${nameDisp}</span>
                                    <span class="bld-cmp-phone">${bldEsc(m.phone) || ''}</span>
                                </button>
                                <button class="bld-cmp-att-toggle ${isToday ? 'is-hidden' : ''}" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}" data-row-idx="${mi}" title="${isFilled ? '오늘 출석 체크' : '먼저 멤버를 추가하세요'}" ${!isFilled ? 'disabled' : ''}></button>
                                <div class="bld-row-actions hidden absolute top-[100%] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-[60] overflow-hidden flex-col p-1.5 gap-0.5">
                                    <button class="w-full text-left px-3 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2" id="bld-act-delete" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}" data-row-idx="${mi}"><i class="ph-bold ph-trash"></i> 삭제</button>
                                    <button class="w-full text-left px-3 py-2 text-[12px] font-bold text-brand-600 hover:bg-brand-50 transition-colors flex items-center gap-2" id="bld-act-insert" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}" data-row-idx="${mi}"><i class="ph-bold ph-user-plus"></i> 멤버 추가</button>
                                </div>
                            </li>`);
                        });

                        return `<article class="bld-cmp-card" style="border-color:${lv.border}" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}">
                            <header class="bld-cmp-head" style="background:${lv.bg};border-color:${lv.border}">
                                <span class="bld-cmp-lv" style="color:${lv.color}">${lv.label.replace(' ', '')}</span>
                                <span class="bld-cmp-team">${bldEsc(team)}</span>
                                <span class="bld-cmp-att-pill" title="오늘 출석 ${attendedToday}/${totalRows + 1}명">${attendedToday}</span>
                            </header>
                            <div class="bld-cmp-quickcheck">
                                <input type="text" class="bld-cmp-quickcheck-input" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}" placeholder="출석 번호 (예: 1, 2, 5)" title="번호를 쉼표/공백으로 입력 후 Enter">
                                <button class="bld-cmp-quickcheck-btn" data-team="${bldEsc(team)}" data-table-id="${bldEsc(table.id)}" title="출석체크 적용"><i class="ph-bold ph-check-fat"></i></button>
                            </div>
                            <ol class="bld-cmp-list">${rowItems.join('')}</ol>
                            <footer class="bld-cmp-foot">
                                <span>출석 <b>${attendedToday}</b> / ${totalRows}</span>
                            </footer>
                        </article>`;
                    }).join('');

                    html += `<section class="scroll-mt-[160px]" data-bld-level="${lv.key}">
                        <header class="flex items-center gap-2 mb-2 pb-1 border-b" style="border-color:${lv.border}">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black border" style="background:${lv.bg};color:${lv.color};border-color:${lv.border}">${lv.label}</span>
                            <span class="text-[11px] font-bold text-slate-400">${allAtLevel.length}개 테이블</span>
                        </header>
                        <div class="bld-cmp-grid">${cards}</div>
                    </section>`;
                });

                if (!html) {
                    html = `<div class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/40 p-10 text-center text-slate-400"><i class="ph ph-table text-4xl mb-2"></i><p class="text-sm font-bold">아직 테이블이 없습니다.</p><p class="text-[11px] mt-1">단일 팀에서 먼저 테이블을 추가하세요.</p></div>`;
                }
                wrap.innerHTML = html;

                // Header attendance summary (includes leader)
                let totalFilled = 0, totalChecked = 0;
                const tally = (row) => {
                    if (row && (row.name || row.phone)) {
                        totalFilled++;
                        if (Array.isArray(row.attHistory) && row.attHistory.length && row.attHistory[row.attHistory.length - 1].at === todayStr) totalChecked++;
                    }
                };
                scope.teams.forEach(tk => {
                    (state[tk]?.tables || []).forEach(t => {
                        tally(t.leader);
                        t.members.forEach(tally);
                    });
                });
                const statsEl = document.querySelector('#builder-att-stats span[data-att-stats]');
                if (statsEl) statsEl.textContent = totalChecked + ' / ' + totalFilled;
            }

            window.renderBuilderView = function () {
                const teamKey = bldGetActiveTeam();
                const labelEl = document.getElementById('builder-team-label');
                const wrap = document.getElementById('builder-levels');
                if (!wrap) return;
                if (!teamKey) {
                    const scope = bldAggregateScope();
                    if (scope) { bldRenderCompactAggregate(scope); return; }
                    if (labelEl) labelEl.textContent = '단일 팀 선택 필요';
                    wrap.innerHTML = `<div class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/40 p-10 text-center text-slate-400"><i class="ph ph-table text-4xl mb-2"></i><p class="text-sm font-bold">단일 팀 (예: 영어 월수11)을 선택하세요.</p></div>`;
                    return;
                }
                labelEl.textContent = teamKey;
                const state = bldGetState();
                if (!state[teamKey] || !Array.isArray(state[teamKey].tables) || state[teamKey].tables.length === 0) {
                    state[teamKey] = { tables: bldSeedExamples(teamKey) };
                    bldSetState(state);
                }
                // Migrate older tables without level → default LV1
                state[teamKey].tables.forEach(t => { if (!t.level) t.level = 'LV1'; });
                bldSetState(state);

                const allTables = state[teamKey].tables;
                let html = '';
                BLD_LEVELS.forEach(lv => {
                    const tablesAtLevel = allTables.filter(t => t.level === lv.key);
                    const tablesHtml = tablesAtLevel.length
                        ? tablesAtLevel.map((t, i) => bldTableHtml(t, allTables.indexOf(t) + 1, lv)).join('')
                        : `<div class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-[12px] text-slate-400">아직 테이블이 없습니다 — 우측 <b>+ 테이블 추가</b> 클릭</div>`;
                    html += `<section class="bld-level-section scroll-mt-[160px]" data-level="${lv.key}" data-bld-level="${lv.key}">
                        <header class="flex items-center justify-between mb-3 pb-2 border-b" style="border-color:${lv.border}">
                            <div class="flex items-center gap-2">
                                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-black border" style="background:${lv.bg};color:${lv.color};border-color:${lv.border}">${lv.label}</span>
                                <span class="text-[11px] font-bold text-slate-400">${tablesAtLevel.length}개 테이블</span>
                            </div>
                            <button class="bld-add-table-lv px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-colors flex items-center gap-1.5" data-level="${lv.key}" style="background:${lv.bg};color:${lv.color};border-color:${lv.border}">
                                <i class="ph-bold ph-plus text-sm"></i> 테이블 추가
                            </button>
                        </header>
                        <div class="space-y-3">${tablesHtml}</div>
                    </section>`;
                });
                wrap.innerHTML = html;
            };

            // Builder double click event delegation
            document.addEventListener('dblclick', (e) => {
                const builderSec = document.getElementById('view-builder-section');
                if (!builderSec || builderSec.classList.contains('hidden')) return;

                const slotBtn = e.target.closest('.bld-cmp-slot-btn');
                if (slotBtn && !slotBtn.classList.contains('empty')) {
                    // Hide any other open actions
                    document.querySelectorAll('.bld-row-actions').forEach(el => el.classList.add('hidden'));
                    
                    const row = slotBtn.closest('.bld-cmp-row');
                    if (row) {
                        const actions = row.querySelector('.bld-row-actions');
                        if (actions) {
                            actions.classList.remove('hidden');
                            actions.classList.add('flex');
                        }
                    }
                    return;
                }
            });

            // Builder event delegation
            document.addEventListener('click', (e) => {
                const builderSec = document.getElementById('view-builder-section');
                if (!builderSec || builderSec.classList.contains('hidden')) return;

                const actDel = e.target.closest('#bld-act-delete');
                const actIns = e.target.closest('#bld-act-insert');
                if (actDel || actIns) {
                    const btn = actDel || actIns;
                    const state = bldGetState();
                    const team = btn.dataset.team;
                    const tableId = btn.dataset.tableId;
                    const t = state[team]?.tables.find(x => x.id === tableId);
                    if (t) {
                        if (btn.dataset.rowKind === 'leader') {
                            if (actDel) {
                                t.leader.name = ''; t.leader.phone = ''; t.leader.level = ''; t.leader.comment = '';
                                t.leader.startDate = ''; t.leader.endDate = ''; t.leader.count = '';
                                t.leader.attendance = ''; t.leader.attHistory = [];
                            }
                        } else {
                            const rowIdx = parseInt(btn.dataset.rowIdx, 10);
                            if (!isNaN(rowIdx)) {
                                if (actDel) {
                                    t.members.splice(rowIdx, 1);
                                    t.members.push(bldNewMemberRow());
                                } else if (actIns) {
                                    t.members.splice(rowIdx, 0, bldNewMemberRow());
                                    t.members.pop();
                                }
                            }
                        }
                        bldSetState(state);
                        renderBuilderView();
                        
                        if (actIns && btn.dataset.rowKind !== 'leader') {
                            const newBtn = document.querySelector(`.bld-cmp-slot-btn[data-team="${team}"][data-table-id="${tableId}"][data-row-idx="${btn.dataset.rowIdx}"]`);
                            if (newBtn) {
                                setTimeout(() => {
                                    if (typeof bldOpenSearchPopover === 'function') bldOpenSearchPopover(newBtn);
                                }, 10);
                            }
                        }
                    }
                    return;
                }

                // Close inline action dropdowns if clicked outside
                if (!e.target.closest('.bld-row-actions') && !e.target.closest('.bld-cmp-slot-btn')) {
                    document.querySelectorAll('.bld-row-actions').forEach(el => {
                        el.classList.add('hidden');
                        el.classList.remove('flex');
                    });
                }

                const addTableLvBtn = e.target.closest('.bld-add-table-lv');
                if (addTableLvBtn) {
                    const teamKey = bldGetActiveTeam();
                    const levelKey = addTableLvBtn.dataset.level;
                    if (!teamKey || !levelKey) return;
                    const state = bldGetState();
                    if (!state[teamKey]) state[teamKey] = { tables: [] };
                    state[teamKey].tables.push(bldNewTable(teamKey, levelKey, state[teamKey].tables.length + 1));
                    bldSetState(state);
                    renderBuilderView();
                    return;
                }
                const delTableBtn = e.target.closest('.bld-del-table');
                if (delTableBtn) {
                    const teamKey = bldGetActiveTeam();
                    const tableId = delTableBtn.dataset.table;
                    if (!teamKey || !tableId) return;
                    if (!confirm('이 테이블을 삭제할까요?')) return;
                    const state = bldGetState();
                    if (state[teamKey]) {
                        state[teamKey].tables = state[teamKey].tables.filter(t => t.id !== tableId);
                        bldSetState(state);
                        renderBuilderView();
                    }
                    return;
                }
                const addRowBtn = e.target.closest('.bld-add-row');
                if (addRowBtn) {
                    const teamKey = bldGetActiveTeam();
                    const tableId = addRowBtn.dataset.table;
                    if (!teamKey || !tableId) return;
                    const state = bldGetState();
                    const t = state[teamKey] && state[teamKey].tables.find(x => x.id === tableId);
                    if (t) { t.members.push(bldNewMemberRow()); bldSetState(state); renderBuilderView(); }
                    return;
                }
                const delRowBtn = e.target.closest('.bld-row-del');
                if (delRowBtn) {
                    const teamKey = bldGetActiveTeam();
                    const tableId = delRowBtn.dataset.table;
                    const rowIdx = parseInt(delRowBtn.dataset.row, 10);
                    if (!teamKey || !tableId || isNaN(rowIdx)) return;
                    const state = bldGetState();
                    const t = state[teamKey] && state[teamKey].tables.find(x => x.id === tableId);
                    if (t) { t.members.splice(rowIdx, 1); bldSetState(state); renderBuilderView(); }
                    return;
                }
                const nameBtn = e.target.closest('.bld-name-btn');
                if (nameBtn) { bldOpenSearchPopover(nameBtn); return; }

                // Compact view: clicking slot button → open popover (fill/clear)
                const slotBtn = e.target.closest('.bld-cmp-slot-btn');
                if (slotBtn) {
                    bldOpenSearchPopover(slotBtn);
                    return;
                }

                // Compact view: attendance toggle per row (transparent → green) — supports leader & member
                const attTog = e.target.closest('.bld-cmp-att-toggle');
                if (attTog && !attTog.disabled) {
                    const team = attTog.dataset.team;
                    const tableId = attTog.dataset.tableId;
                    const kind = attTog.dataset.rowKind || 'member';
                    if (!team || !tableId) return;
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const state = bldGetState();
                    const t = state[team] && state[team].tables.find(x => x.id === tableId);
                    if (!t) return;
                    let target;
                    if (kind === 'leader') {
                        target = t.leader;
                    } else {
                        const ri = parseInt(attTog.dataset.rowIdx, 10);
                        if (isNaN(ri)) return;
                        target = t.members[ri];
                    }
                    if (!target) return;
                    if (!Array.isArray(target.attHistory)) target.attHistory = [];
                    const lastIsToday = target.attHistory.length && target.attHistory[target.attHistory.length - 1].at === todayStr;
                    if (lastIsToday) target.attHistory.pop();
                    else target.attHistory.push({ at: todayStr, s: 'o' });
                    bldSetState(state);
                    renderBuilderView();
                    return;
                }

                // Per-card quick attendance check by slot numbers
                const quickBtn = e.target.closest('.bld-cmp-quickcheck-btn');
                if (quickBtn) {
                    const card = quickBtn.closest('.bld-cmp-card');
                    const input = card?.querySelector('.bld-cmp-quickcheck-input');
                    if (input) bldApplyQuickCheck(quickBtn.dataset.team, quickBtn.dataset.tableId, input);
                    return;
                }

                // Popover: clear slot
                const clearSlot = e.target.closest('.bld-pop-clear');
                if (clearSlot && bldSearchCtx && bldSearchCtx.mode === 'slot') {
                    const state = bldGetState();
                    const t = state[bldSearchCtx.team]?.tables.find(x => x.id === bldSearchCtx.tableId);
                    if (t) {
                        if (bldSearchCtx.rowKind === 'leader') {
                            const target = t.leader;
                            if (target) {
                                target.name = ''; target.phone = ''; target.level = ''; target.comment = '';
                                target.startDate = ''; target.endDate = ''; target.count = '';
                                target.attendance = ''; target.attHistory = [];
                            }
                        } else {
                            const rowIdx = parseInt(bldSearchCtx.rowIdx, 10);
                            if (!isNaN(rowIdx)) {
                                t.members.splice(rowIdx, 1);
                                t.members.push(bldNewMemberRow());
                            }
                        }
                        bldSetState(state);
                        renderBuilderView();
                    }
                    bldCloseSearchPopover();
                    return;
                }

                const attBtn = e.target.closest('.bld-att-btn');
                if (attBtn) {
                    const teamKey = bldGetActiveTeam();
                    const tableId = attBtn.dataset.table;
                    const kind = attBtn.dataset.rowKind;
                    const ri = parseInt(attBtn.dataset.rowIdx, 10);
                    if (!teamKey || !tableId) return;
                    const state = bldGetState();
                    const t = state[teamKey] && state[teamKey].tables.find(x => x.id === tableId);
                    if (!t) return;
                    const target = kind === 'leader' ? t.leader : t.members[ri];
                    if (!target) return;
                    if (!Array.isArray(target.attHistory)) target.attHistory = [];
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const lastIsToday = target.attHistory.length && target.attHistory[target.attHistory.length - 1].at === todayStr;
                    if (lastIsToday) {
                        target.attHistory.pop();
                    } else {
                        target.attHistory.push({ at: todayStr, s: 'o' });
                    }
                    bldSetState(state);
                    // In-place update of this row only
                    const row = attBtn.closest('tr');
                    if (row) {
                        const stillToday = target.attHistory.length && target.attHistory[target.attHistory.length - 1].at === todayStr;
                        attBtn.dataset.active = stillToday ? 'true' : 'false';
                        const histEl = row.querySelector('.bld-att-history');
                        if (histEl) {
                            const recent = target.attHistory.slice(-6);
                            const total = target.attHistory.length;
                            const datesHtml = recent.length
                                ? recent.map(h => `<span class="bld-att-date" title="${h.at}">${h.at.slice(5).replace('-', '/')}</span>`).join('')
                                : '<span class="text-[10px] text-slate-300 italic">기록 없음</span>';
                            const countCls = total > 0 ? 'bld-att-count' : 'bld-att-count empty';
                            histEl.innerHTML = `<span class="${countCls}"><i class="ph-fill ph-check-square"></i> ${total}회</span><div class="bld-att-dates">${datesHtml}</div>`;
                        }
                    }
                    return;
                }
            });

            document.addEventListener('input', (e) => {
                const inp = e.target.closest('.bld-input, .bld-table-name');
                if (!inp) return;
                const teamKey = bldGetActiveTeam();
                if (!teamKey) return;
                const state = bldGetState();
                const tEntry = state[teamKey];
                if (!tEntry) return;
                if (inp.classList.contains('bld-table-name')) {
                    const t = tEntry.tables.find(x => x.id === inp.dataset.table);
                    if (t) { t.name = inp.value; bldSetState(state); }
                    return;
                }
                const t = tEntry.tables.find(x => x.id === inp.dataset.table);
                if (!t) return;
                const kind = inp.dataset.rowKind;
                const field = inp.dataset.field;
                const ri = parseInt(inp.dataset.rowIdx, 10);
                const target = kind === 'leader' ? t.leader : t.members[ri];
                if (target && field) { target[field] = inp.value; bldSetState(state); }
            });
            document.addEventListener('change', (e) => {
                const sel = e.target.closest('select.bld-input');
                if (sel) sel.dispatchEvent(new Event('input', { bubbles: true }));
            });

            // ── Per-card quick attendance check by slot numbers ──
            // Input: "1, 2, 5" → mark today's attendance for member rows at index 0, 1, 4 (slot # is 1-based)
            function bldApplyQuickCheck(team, tableId, inputEl) {
                const raw = inputEl.value.trim();
                if (!raw) return;
                const nums = Array.from(new Set(
                    raw.split(/[\s,;.\/|]+/).map(s => parseInt(s, 10)).filter(n => Number.isFinite(n) && n >= 0)
                ));
                if (!nums.length) return;
                const todayStr = new Date().toISOString().slice(0, 10);
                const state = bldGetState();
                const t = state[team]?.tables.find(x => x.id === tableId);
                if (!t) return;
                let marked = 0;
                nums.forEach(slot => {
                    // slot 0 = leader, 1~N = members[slot-1]
                    const target = slot === 0 ? t.leader : t.members[slot - 1];
                    if (!target) return;
                    if (!(target.name || target.phone)) return;
                    if (!Array.isArray(target.attHistory)) target.attHistory = [];
                    const lastIsToday = target.attHistory.length && target.attHistory[target.attHistory.length - 1].at === todayStr;
                    if (!lastIsToday) { target.attHistory.push({ at: todayStr, s: 'o' }); marked++; }
                });
                bldSetState(state);
                inputEl.value = '';
                renderBuilderView();
            }
            // Submit on Enter inside quickcheck input
            document.addEventListener('keydown', (e) => {
                if (e.target.classList && e.target.classList.contains('bld-cmp-quickcheck-input') && e.key === 'Enter') {
                    e.preventDefault();
                    bldApplyQuickCheck(e.target.dataset.team, e.target.dataset.tableId, e.target);
                }
            });

            // Member search popover
            let bldSearchCtx = null;
            function bldOpenSearchPopover(anchorBtn) {
                const pop = document.getElementById('bld-search-popover');
                const input = document.getElementById('bld-search-input');
                const isSlot = anchorBtn.classList.contains('bld-cmp-slot-btn');
                if (isSlot) {
                    bldSearchCtx = {
                        mode: 'slot',
                        team: anchorBtn.dataset.team,
                        tableId: anchorBtn.dataset.tableId,
                        rowKind: anchorBtn.dataset.rowKind || 'member',
                        rowIdx: parseInt(anchorBtn.dataset.rowIdx, 10),
                        isFilled: !anchorBtn.classList.contains('empty'),
                    };
                } else {
                    bldSearchCtx = {
                        mode: 'replace',
                        tableId: anchorBtn.dataset.table,
                        rowKind: anchorBtn.dataset.rowKind,
                        rowIdx: parseInt(anchorBtn.dataset.rowIdx, 10),
                    };
                }
                const r = anchorBtn.getBoundingClientRect();
                pop.style.left = Math.min(r.left, window.innerWidth - 340) + 'px';
                pop.style.top = (r.bottom + 4) + 'px';
                pop.classList.remove('hidden');
                input.value = '';
                bldRenderSearchResults('');
                setTimeout(() => input.focus(), 10);
            }
            function bldCloseSearchPopover() {
                document.getElementById('bld-search-popover').classList.add('hidden');
                bldSearchCtx = null;
            }
            function bldRenderSearchResults(q) {
                const list = document.getElementById('bld-search-results');
                const clear = document.getElementById('bld-search-clear');
                clear.classList.toggle('hidden', !q);
                const norm = q.trim().toLowerCase();
                const filtered = norm
                    ? bldMemberPool.filter(m => m.name.toLowerCase().includes(norm) || m.phone.includes(norm)).slice(0, 30)
                    : bldMemberPool.slice(0, 30);
                const clearOpt = (bldSearchCtx && bldSearchCtx.mode === 'slot' && bldSearchCtx.isFilled)
                    ? `<button class="bld-pop-clear"><i class="ph ph-eraser"></i> 이 슬롯 비우기 (멤버 제거)</button>`
                    : '';
                const isPhoneLike = /^[0-9\-]+$/.test(norm);
                const addNewOpt = q.trim() ? `<button class="bld-pick w-full px-3 py-2 text-left border-t border-slate-100 hover:bg-slate-50 text-brand-600 text-[12px] font-bold flex items-center gap-2" data-name="${isPhoneLike ? '' : bldEsc(q)}" data-phone="${isPhoneLike ? bldEsc(q) : ''}" data-level="1" data-membership="VIP"><i class="ph-bold ph-plus"></i> "${bldEsc(q)}" (으)로 직접 추가</button>` : '';

                if (!filtered.length) {
                    list.innerHTML = clearOpt + `<div class="px-3 py-6 text-center text-[11px] text-slate-400">검색 결과 없음</div>` + addNewOpt;
                    return;
                }
                list.innerHTML = clearOpt + filtered.map(m => `<button class="bld-pick w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center justify-between gap-2" data-name="${bldEsc(m.name)}" data-phone="${bldEsc(m.phone)}" data-level="${bldEsc(m.level)}" data-membership="${bldEsc(m.membership)}">
                    <div><div class="text-[12px] font-bold text-slate-800">${bldEsc(m.name)}</div><div class="text-[10px] text-slate-400 font-mono">${bldEsc(m.phone)}</div></div>
                    <div class="flex items-center gap-1"><span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">LV ${bldEsc(m.level)}</span><span class="text-[10px] font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">${bldEsc(m.membership)}</span></div>
                </button>`).join('') + addNewOpt;
            }
            document.addEventListener('input', (e) => {
                if (e.target.id === 'bld-search-input') bldRenderSearchResults(e.target.value);
            });
            document.addEventListener('click', (e) => {
                const pick = e.target.closest('.bld-pick');
                if (pick && bldSearchCtx) {
                    const state = bldGetState();
                    if (bldSearchCtx.mode === 'slot') {
                        const t = state[bldSearchCtx.team]?.tables.find(x => x.id === bldSearchCtx.tableId);
                        if (t) {
                            const target = bldSearchCtx.rowKind === 'leader' ? t.leader : t.members[bldSearchCtx.rowIdx];
                            if (target) {
                                target.name = pick.dataset.name;
                                target.phone = pick.dataset.phone;
                                target.level = pick.dataset.level;
                                if (bldSearchCtx.rowKind !== 'leader') target.membership = pick.dataset.membership;
                                if (!Array.isArray(target.attHistory)) target.attHistory = [];
                                bldSetState(state);
                                renderBuilderView();
                            }
                        }
                        bldCloseSearchPopover();
                        return;
                    } else if (bldSearchCtx.mode === 'append') {
                        const team = bldSearchCtx.team;
                        const t = state[team] && state[team].tables.find(x => x.id === bldSearchCtx.tableId);
                        if (t) {
                            t.members.push({
                                name: pick.dataset.name,
                                phone: pick.dataset.phone,
                                level: pick.dataset.level,
                                membership: pick.dataset.membership,
                                comment: '', createdAt: '', startDate: '', endDate: '', count: '', attendance: '', attHistory: [],
                            });
                            bldSetState(state);
                            renderBuilderView();
                        }
                    } else {
                        const teamKey = bldGetActiveTeam();
                        if (teamKey) {
                            const t = state[teamKey] && state[teamKey].tables.find(x => x.id === bldSearchCtx.tableId);
                            if (t) {
                                const target = bldSearchCtx.rowKind === 'leader' ? t.leader : t.members[bldSearchCtx.rowIdx];
                                if (target) {
                                    target.name = pick.dataset.name;
                                    target.phone = pick.dataset.phone;
                                    target.level = pick.dataset.level;
                                    target.membership = pick.dataset.membership;
                                    bldSetState(state);
                                    renderBuilderView();
                                }
                            }
                        }
                    }
                    bldCloseSearchPopover();
                    return;
                }
                if (e.target.id === 'bld-search-clear') {
                    document.getElementById('bld-search-input').value = '';
                    bldRenderSearchResults('');
                    return;
                }
                const pop = document.getElementById('bld-search-popover');
                if (!pop.classList.contains('hidden') && !pop.contains(e.target) && !e.target.closest('.bld-name-btn')) {
                    bldCloseSearchPopover();
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !document.getElementById('bld-search-popover').classList.contains('hidden')) {
                    bldCloseSearchPopover();
                }
            });

            // Re-render builder when team tab changes
            document.addEventListener('click', (e) => {
                const tab = e.target.closest('.team-tab');
                if (!tab) return;
                setTimeout(() => {
                    const builderSec = document.getElementById('view-builder-section');
                    if (builderSec && !builderSec.classList.contains('hidden')) renderBuilderView();
                }, 50);
            });

            function getLevelsForTeam(idx) {
                return [0,1,2,3,4];
            }

            // ─── SORT FUNCTION ───
            function sortMembers(members, sortKey) {
                const sorted = [...members];
                switch (sortKey) {
                    case 'first-day':
                        sorted.sort((a,b) => {
                            const aIsFirst = (a.alertType === 0 || a.alertType === 2) ? 1 : 0;
                            const bIsFirst = (b.alertType === 0 || b.alertType === 2) ? 1 : 0;
                            return bIsFirst - aIsFirst;
                        });
                        break;
                    case 'att-desc': sorted.sort((a,b) => b.attRate - a.attRate); break;
                    case 'att-asc': sorted.sort((a,b) => a.attRate - b.attRate); break;
                    case 'alert-first':
                        sorted.sort((a,b) => {
                            const aHas = (a.alertType !== null && a.alertType !== undefined) ? 1 : 0;
                            const bHas = (b.alertType !== null && b.alertType !== undefined) ? 1 : 0;
                            if (aHas !== bHas) return bHas - aHas;
                            return b.attRate - a.attRate; // secondary sort by rate
                        });
                        break;
                    case 'name-asc': sorted.sort((a,b) => a.name.localeCompare(b.name, 'ko')); break;
                    case 'name-desc': sorted.sort((a,b) => b.name.localeCompare(a.name, 'ko')); break;
                    case 'age-asc': sorted.sort((a,b) => a.age - b.age); break;
                    case 'age-desc': sorted.sort((a,b) => b.age - a.age); break;
                    case 'remain-asc': sorted.sort((a,b) => a.remaining - b.remaining); break;
                    case 'remain-desc': sorted.sort((a,b) => b.remaining - a.remaining); break;
                    case 'exp-asc': sorted.sort((a,b) => a.expDate.localeCompare(b.expDate)); break;
                    case 'today-first': sorted.sort((a,b) => (b.todayState === 'checked' ? 1 : 0) - (a.todayState === 'checked' ? 1 : 0)); break;
                    case 'today-last': sorted.sort((a,b) => (a.todayState === 'checked' ? 1 : 0) - (b.todayState === 'checked' ? 1 : 0)); break;
                }
                return sorted;
            }

            // ─── TEAM TAB BUTTONS ───
            const teamButtons = document.querySelectorAll('.team-tab');

            // ─── LEVEL NAV BAR (scroll jump) ───
            const levelNav = document.getElementById('level-nav');
            const levelNavContainer = levelNav.querySelector('.flex');

            function renderLevelNav(teamIdx) {
                const levels = getLevelsForTeam(teamIdx);
                levelNavContainer.querySelectorAll('button').forEach(b => b.remove());
                // "전체" total count
                const totalCount = levels.reduce((sum, lv) => sum + (allMembers[teamDefs[teamIdx].key][lv] || []).length, 0);
                levels.forEach((lv) => {
                    const c = lvColors[lv];
                    const count = (allMembers[teamDefs[teamIdx].key][lv] || []).length;
                    const btn = document.createElement('button');
                    btn.className = `flex-shrink-0 px-3 py-1 rounded-full bg-white text-slate-600 border border-slate-200 hover:border-slate-400 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm hover:shadow`;
                    btn.innerHTML = `<span class="w-2 h-2 rounded-full ${c.bg}"></span>LV ${lv} <span class="text-[9px] text-slate-400 font-normal">(${count})</span>`;
                    btn.addEventListener('click', () => {
                        let target;
                        if (currentViewMode === 'builder') {
                            target = document.querySelector(`[data-bld-level="LV${lv}"]`);
                        } else {
                            const targetId = currentViewMode === 'table' ? `level-section-${lv}` : `level-section-card-${lv}`;
                            target = document.getElementById(targetId);
                        }
                        if (target) {
                            const headerOffset = 150;
                            const elementPosition = target.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        }
                    });
                    levelNavContainer.appendChild(btn);
                });
            }

            // ─── BUILD MEMBER ROW HTML ───
            function buildRowHtml(m, rowNum) {
                const levelTeamHtml = m.teamBadges.map(tb => {
                    const isJp = tb.isJapanese;
                    const dotColor = isJp ? '#007BFF' : '#9B59B6';
                    const bgColor = isJp ? '#e6f0ff' : '#f5eafa';
                    const txtColor = isJp ? '#007BFF' : '#9B59B6';
                    const borderColor = isJp ? '#007BFF' : '#9B59B6';
                    const match = tb.label.match(/(.*)\((.*)\)/);
                    const lvl = match ? match[2] : '';
                    const tm = match ? match[1] : tb.label;
                    return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer hover:shadow-sm transition-all" style="background:${bgColor};color:${txtColor};border-left:3px solid ${dotColor};" onclick="navigateToTeam('${tm}')" title="${tm} 탭으로 이동"><span style="font-weight:900;">LV${lvl}</span><span style="color:${txtColor};opacity:0.4;">·</span><span>${tm}</span></span>`;
                }).join('');
                const ms = m.membership;
                const blocksHtml = m.blocks.map(b =>
                    `<div class="attendance-block h-2.5 flex-1 rounded-sm ${b.bg} cursor-pointer" data-date="${b.date}" data-status="${b.status}" data-color="${b.color}" data-leader="${b.leader}"></div>`
                ).join('');
                let attRateColor = 'text-slate-500';
                if (m.attRate >= 80) attRateColor = 'text-emerald-600';
                else if (m.attRate < 50) attRateColor = 'text-purple-600';
                const todayBtnCls = m.todayState === 'checked'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600 font-bold shadow-inner'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-100 bg-slate-50 text-slate-400';

                let alertBadgeHtml = '';
                if (m.alertType !== null && m.alertType !== undefined) {
                    const alertInfo = alertTypes[m.alertType];
                    alertBadgeHtml = `<div class="alert-badge-container flex items-center gap-1"><span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold ${alertInfo.cls} shadow-sm whitespace-nowrap">${alertInfo.badge}</span><button onclick="resolveAlert('alert-${m.id}', 'member-row-${m.id}')" class="shrink-0 p-0.5 px-1.5 rounded text-amber-700 bg-white border border-amber-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-all text-[9px] font-bold shadow-sm flex items-center gap-0.5"><i class="ph-bold ph-check"></i> 해결</button></div>`;
                }

                return `<tr class="member-row bg-white" id="member-row-${m.id}">
                    <td class="px-2 py-1.5">
                        <div class="flex items-center justify-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                            <span class="text-[10px] font-bold text-slate-400 w-3 text-right">${rowNum}</span>
                            <i class="ph-bold ph-dots-six-vertical drag-handle text-slate-300 cursor-grab text-lg"></i>
                            <input type="checkbox" class="row-checkbox w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer">
                        </div>
                    </td>
                    <td class="px-2 py-1.5">
                        <div class="flex flex-wrap items-center gap-2">
                            <button class="font-extrabold text-brand-600 hover:text-brand-800 hover:underline text-left transition-colors text-[14px]" onclick="openProfileModal('${m.name}')">${m.name}</button>
                            ${alertBadgeHtml}
                        </div>
                        <div class="font-mono text-[11px] text-slate-500 mt-1"><span class="cursor-pointer hover:text-brand-600 active:scale-95 transition-all" onclick="event.stopPropagation();copyPhone('${m.phone}')">${m.phone}</span> (${m.age}세)</div>
                    </td>
                    <td class="px-2 py-1.5">
                        <div class="flex flex-wrap gap-1.5">${levelTeamHtml}</div>
                    </td>
                    <td class="px-2 py-1.5">
                        <div class="flex flex-col gap-0.5">
                            <div class="flex items-center gap-1.5">
                                <span class="px-1.5 py-0.5 ${ms.colorRow} text-[10px] font-bold rounded border">${ms.name}</span>
                                <span class="text-xs font-bold text-slate-700">${m.remaining} <span class="text-[10px] text-slate-400 font-normal">/ ${ms.total}회</span></span>
                            </div>
                        </div>
                    </td>
                    <td class="px-2 py-1.5 group">
                        <div class="editable-text p-1 text-slate-600 text-xs line-clamp-2 max-w-xs transition-colors relative border border-transparent group-hover:border-slate-200 bg-transparent group-hover:bg-slate-50 rounded">
                            ${m.memo}
                            <i class="ph ph-pencil-simple absolute right-2 bottom-1.5 bg-slate-50 opacity-0 group-hover:opacity-100 text-brand-600 p-0.5"></i>
                        </div>
                    </td>
                    <td class="px-2 py-1.5 text-center">
                        <div class="tooltip-container">
                            <div class="flex items-center justify-center gap-[1px] w-[120px] mx-auto">${blocksHtml}</div>
                        </div>
                        <div class="text-[9px] ${attRateColor} font-bold mt-1 cursor-pointer hover:underline hover:text-brand-600 transition-colors" onclick="openMemberAttendanceHistory('${m.name}')">${m.attRate}% (주 ${m.perWeek}회)</div>
                    </td>
                    <td class="px-2 py-1.5 text-center">
                        <button class="w-7 h-7 rounded border ${todayBtnCls} flex items-center justify-center transition-all mx-auto shadow-sm"><i class="ph-bold ph-check text-xs"></i></button>
                    </td>
                </tr>`;
            }

            // ─── BUILD MEMBER CARD HTML ───
            function buildCardHtml(m) {
                const ms = m.membership;
                const blocksHtml = m.blocks.map(b =>
                    `<div class="attendance-block h-2 flex-1 rounded-sm ${b.bg} cursor-pointer" data-date="${b.date}" data-status="${b.status}" data-color="${b.color}" data-leader="${b.leader}"></div>`
                ).join('');
                
                const levelCls = lvColors[m.level] || lvColors[0];
                
                return `
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-2.5 transition-all hover:shadow-md hover:border-brand-200 group relative">
                    <div class="flex items-center justify-between mb-1.5 gap-2">
                        <div class="flex items-center gap-2 overflow-hidden flex-1">
                            <button class="font-bold text-slate-800 hover:text-brand-600 text-[14px] truncate" onclick="openProfileModal('${m.name}')">${m.name}</button>
                            <span class="hidden xl:inline text-[9px] font-mono text-slate-400 cursor-pointer hover:text-brand-600 truncate" onclick="copyPhone('${m.phone}')">${m.phone}</span>
                            <span class="px-1 py-0.5 ${ms.colorRow} text-[8.5px] font-bold rounded border whitespace-nowrap">${ms.name}</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-1 mb-1.5">${m.teamBadges.map(tb => {
                        const isJp = tb.isJapanese;
                        const dotColor = isJp ? '#007BFF' : '#9B59B6';
                        const bgColor = isJp ? '#e6f0ff' : '#f5eafa';
                        const txtColor = isJp ? '#007BFF' : '#9B59B6';
                        const match = tb.label.match(/(.*)\((.*)\)/);
                        const lvl = match ? match[2] : '';
                        const tm = match ? match[1] : tb.label;
                        return `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8.5px] font-bold whitespace-nowrap" style="background:${bgColor};color:${txtColor};border-left:2px solid ${dotColor};"><span style="font-weight:900;">LV${lvl}</span><span style="opacity:0.4;">·</span>${tm}</span>`;
                    }).join('')}</div>

                    <div class="flex items-center justify-between mb-1.5">
                        <div class="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                            <span class="font-bold text-slate-700 text-[10px]">${m.remaining}</span>
                            <span class="text-slate-400">/ ${ms.total}회</span>
                        </div>
                        <span class="text-[10px] font-black ${m.attRate >= 80 ? 'text-emerald-600' : m.attRate < 50 ? 'text-purple-600' : 'text-slate-600'} cursor-pointer hover:underline" onclick="openMemberAttendanceHistory('${m.name}')">${m.attRate}%</span>
                    </div>

                    <div class="mb-1.5">
                        <input type="text" value="${m.memo || ''}" placeholder="메모 입력..." 
                            class="w-full bg-slate-50 border-none text-[10px] py-1 px-2 rounded focus:ring-1 focus:ring-brand-400 outline-none text-slate-500 placeholder:text-slate-300 transition-all border-transparent hover:border-slate-200">
                    </div>

                    <div class="flex items-center gap-[1px] w-full tooltip-container">
                        ${blocksHtml}
                    </div>
                </div>`;
            }

            // ─── BUILD ALERT CARD HTML ───
            function buildAlertCardHtml(m, a) {
                const badgeCls = a.alertInfo.cls;
                const badgeContent = a.alertInfo.badge;

                return `
                <div class="bg-white rounded-xl p-3 border border-amber-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between h-full min-h-[165px]" id="alert-card-${m.id}">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                             <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${badgeCls} shadow-sm whitespace-nowrap">${badgeContent}</span>
                             <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200 uppercase tracking-tighter">LV ${a.level}</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5 mb-2">
                            <button onclick="scrollToMember('${a.rowId}')" class="text-[15px] font-black text-slate-800 hover:text-brand-600 transition-colors flex items-center gap-1">
                                ${m.name}
                            </button>
                            <div class="flex flex-wrap gap-1">
                                ${m.teamBadges.slice(0, 2).map(tb => {
                    const cls = tb.isJapanese ? 'color:#007BFF;background:#e6f0ff;border-color:#007BFF' : 'color:#9B59B6;background:#f5eafa;border-color:#9B59B6';
                    const label = tb.label.split('(')[0];
                    return `<span class="px-1 py-0.5 text-[8px] rounded font-bold border truncate max-w-[60px]" style="${cls}" title="${tb.label}">${label}</span>`;
                }).join('')}
                            </div>
                            <i class="ph-bold ph-arrow-right text-[10px] text-slate-300 ml-auto group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all"></i>
                        </div>
                        <div class="text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 mb-3 line-clamp-2 min-h-[42px] leading-relaxed">
                            <i class="ph ph-chat-centered-text text-amber-400 mr-1"></i> ${m.memo || '코멘트가 없습니다.'}
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-2 pt-1">
                        <span class="text-[10px] font-mono text-slate-400 cursor-pointer hover:text-brand-600 active:scale-95 transition-all truncate" onclick="event.stopPropagation();copyPhone('${m.phone}')" title="${m.phone}">${m.phone}</span>
                        <button onclick="resolveAlert('alert-${m.id}', 'member-row-${m.id}')" class="shrink-0 p-1 px-3 rounded-lg text-amber-700 bg-white border border-amber-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-all text-xs font-bold shadow-sm flex items-center justify-center gap-1">
                            <i class="ph-bold ph-check"></i> 해결
                        </button>
                    </div>
                </div>`;
            }

            // ─── RENDER FULL TEAM (all levels) ───
            function renderTeam(teamIdx) {
                const levels = getLevelsForTeam(teamIdx);
                
                // Update title badges
                const titleEl = document.getElementById('team-title');
                
                const td = teamDefs[teamIdx];
                const langLabel = td.lang === '영' ? '영어' : '일어';
                const type = td.lang === '영' ? 'eng' : 'jpn';
                const badgeText = `${langLabel} ${td.schedule}${td.time}`;
                
                const createBadge = (text, type) => {
                    const colors = {
                        'eng': 'bg-purple-100 text-purple-700 border-purple-200',
                        'jpn': 'bg-blue-100 text-blue-700 border-blue-200'
                    };
                    const c = colors[type] || 'bg-slate-100 text-slate-700 border-slate-200';
                    return `<span class="inline-flex items-center px-2 py-0.5 rounded-lg text-sm font-black border shadow-sm transition-all hover:scale-105 ${c}">${text}</span>`;
                };

                titleEl.innerHTML = `<span class="text-xl font-black text-slate-800 mr-1 italic">Member</span>` + createBadge(badgeText, type);

                const innerFilterVal = document.getElementById('inner-alert-filter')?.value || 'all';

                // Build alerts ensuring diverse levels
                let displayAlerts = [];
                levels.forEach(lv => {
                    const membersInLv = allMembers[td.key][lv] || [];
                    const foundIdx = membersInLv.findIndex(m => {
                        if (m.alertType === null || m.alertType === undefined) return false;
                        if (innerFilterVal !== 'all' && String(m.alertType) !== innerFilterVal) return false;
                        return true;
                    });
                    if (foundIdx !== -1) {
                        displayAlerts.push({ member: membersInLv[foundIdx], level: lv, alertInfo: alertTypes[membersInLv[foundIdx].alertType], rowId: `member-row-${membersInLv[foundIdx].id}` });
                    }
                });
                
                // Shuffle displayAlerts
                displayAlerts.sort(() => Math.random() - 0.5);
                
                if (displayAlerts.length > 5) {
                    displayAlerts = displayAlerts.slice(0, 5);
                } else {
                    let attempts = 0;
                    while (displayAlerts.length < 5 && attempts < 40) {
                        const randomLv = levels[Math.floor(Math.random() * levels.length)];
                        const membersInLv = allMembers[td.key][randomLv] || [];
                        const validMembers = membersInLv.filter(m => {
                            if (m.alertType === null || m.alertType === undefined) return false;
                            if (innerFilterVal !== 'all' && String(m.alertType) !== innerFilterVal) return false;
                            return true;
                        });
                        if (validMembers.length > 0) {
                            const m = validMembers[Math.floor(Math.random() * validMembers.length)];
                            displayAlerts.push({ member: m, level: randomLv, alertInfo: alertTypes[m.alertType], rowId: `member-row-${m.id}` });
                        }
                        attempts++;
                    }
                }
                displayAlerts = displayAlerts.slice(0, 5);

                // Render check-section
                const checkSection = document.getElementById('check-section');
                const checkCount = document.getElementById('check-count');
                const alertListContainer = document.getElementById('alert-list-container');
                const alertCardContainer = document.getElementById('alert-card-container');

                if (displayAlerts.length > 0) {
                    checkSection.style.display = '';
                    checkSection.style.opacity = '1';
                    checkCount.textContent = displayAlerts.length + '명';
                    
                    // Populate List View
                    alertListContainer.innerHTML = displayAlerts.map((a, i) => {
                        const m = a.member;
                        const badgeCls = a.alertInfo.cls;
                        const badgeContent = a.alertInfo.badge;
                        
                        // Generate exact real team badges instead of fake ones
                        const badgesHtml = m.teamBadges.map(tb => {
                            const cls = tb.isJapanese
                                ? 'color:#007BFF;background:#e6f0ff;border-color:#007BFF'
                                : 'color:#9B59B6;background:#f5eafa;border-color:#9B59B6';
                            const match = tb.label.match(/(.*)\((.*)\)/);
                            const tm = match ? match[1] : tb.label;
                            return `<span class="inline-block w-[88px] text-center px-1 py-0.5 text-[9px] rounded font-semibold border truncate whitespace-nowrap" style="${cls}">${tm}</span>`;
                        }).join('');

                        return `<div class="p-3 hover:bg-amber-100/50 transition-colors group flex items-center justify-between gap-2 border-b border-amber-100/50" id="alert-${m.id}">
                            <div class="grid grid-cols-[104px_72px_44px_90px_1fr] items-center gap-3 flex-1 min-w-0">
                                <span class="inline-flex items-center justify-center w-full px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeCls} shadow-sm whitespace-nowrap">${badgeContent}</span>
                                <button onclick="scrollToMember('${a.rowId}')" class="text-sm font-bold text-slate-800 hover:text-brand-600 transition-colors flex items-center justify-between gap-1 w-full text-left">
                                    ${m.name} <i class="ph-bold ph-arrow-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"></i>
                                </button>
                                <span class="inline-block w-full text-center px-1 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">LV ${a.level}</span>
                                <span class="text-[11px] font-mono text-slate-600 text-center w-full cursor-pointer hover:text-brand-600 active:scale-95 transition-all" onclick="event.stopPropagation();copyPhone('${m.phone}')">${m.phone}</span>
                                <div class="hidden sm:flex items-center gap-1 overflow-hidden">
                                    ${badgesHtml}
                                </div>
                            </div>
                            <button onclick="resolveAlert('alert-${m.id}', 'member-row-${m.id}')" class="shrink-0 p-1 px-2.5 rounded-lg text-amber-700 bg-white border border-amber-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-all text-xs font-bold shadow-sm flex items-center gap-1">
                                <i class="ph-bold ph-check"></i> 해결
                            </button>
                        </div>`;
                    }).join('');

                    // Populate Card View
                    alertCardContainer.innerHTML = displayAlerts.map(a => buildAlertCardHtml(a.member, a)).join('');

                } else {
                    checkSection.style.display = '';
                    checkCount.textContent = '0명';
                    alertListContainer.innerHTML = `<div class="p-6 text-center text-amber-700/60 text-xs font-bold">선택하신 유형의 알림 대상자가 없습니다.</div>`;
                    alertCardContainer.innerHTML = `<div class="p-6 text-center text-amber-700/60 text-xs font-bold w-full col-span-full">선택하신 유형의 알림 대상자가 없습니다.</div>`;
                }

                // Render level sections
                const container = document.getElementById('levels-container');
                const cardContainer = document.getElementById('levels-card-container');
                container.innerHTML = '';
                cardContainer.innerHTML = '';
                let globalIdx = 0;
                let totalVisible = 0;

                const lvFilter = document.getElementById('level-filter')?.value || 'all';
                let filteredLevels = levels;
                if (lvFilter !== 'all') {
                    filteredLevels = levels.filter(l => String(l) === lvFilter);
                }

                const searchQ = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
                const searchTarget = document.getElementById('search-target')?.value || 'all';
                const msFilter = document.getElementById('membership-filter')?.value || 'all';

                filteredLevels.forEach(lv => {
                    const members = sortMembers(allMembers[td.key][lv] || [], currentSort);
                    const c = lvColors[lv];

                    if (currentViewMode === 'table') {
                        // Level section wrapper
                        const section = document.createElement('div');
                        section.id = `level-section-${lv}`;
                        section.className = 'scroll-mt-[160px]'; // offset for sticky headers

                        // Level header (sticky)
                        section.innerHTML = `
                            <div class="level-sticky-header flex items-center gap-3 px-3 py-2 mb-0 mt-0" style="position:sticky;top:var(--level-header-top);z-index:20;background:rgba(255,255,255,0.98);backdrop-filter:blur(6px);border-bottom:1px solid #e2e8f0;">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full ${c.bg}"></span>
                                    <h3 class="text-base font-bold ${c.text}">Level ${lv}</h3>
                                    <span class="px-2 py-0.5 rounded-full ${c.light} ${c.text} ${c.border} border text-xs font-bold">${members.length}명</span>
                                </div>
                                <div class="flex-1 h-px bg-slate-200"></div>
                            </div>
                        `;

                        // Table
                        const tableWrap = document.createElement('div');
                        tableWrap.className = 'bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4';
                        tableWrap.innerHTML = `
                            <div class="overflow-x-auto w-full">
                                <table class="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                            <th class="px-2 py-1 font-medium w-16 text-center">
                                                <div class="flex items-center justify-center gap-1">
                                                    <span class="text-[10px] text-slate-400 w-3 text-right">No.</span>
                                                    <input type="checkbox" class="check-all-lv w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer" data-level="${lv}">
                                                </div>
                                            </th>
                                            <th class="px-2 py-1 font-medium min-w-[140px]">회원 정보</th>
                                            <th class="px-2 py-1 font-medium min-w-[200px]">레벨 / 팀 <span class="inline-flex items-center gap-1.5 ml-1 text-[9px] font-semibold normal-case tracking-normal text-slate-400"><span class="inline-flex items-center gap-0.5"><span class="w-2 h-2 rounded-full" style="background:#9B59B6"></span>영어</span><span class="inline-flex items-center gap-0.5"><span class="w-2 h-2 rounded-full" style="background:#007BFF"></span>일어</span></span></th>
                                            <th class="px-2 py-1 font-medium min-w-[160px]">멤버십 현황</th>
                                            <th class="px-2 py-1 font-medium min-w-[180px]">메모 (Click-to-Edit)</th>
                                            <th class="px-2 py-1 font-medium text-center w-40">최근 출석률</th>
                                            <th class="px-2 py-1 font-medium text-center w-24">금일 출석</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 text-sm text-slate-700 align-top" id="tbody-lv-${lv}"></tbody>
                                </table>
                            </div>
                        `;
                        section.appendChild(tableWrap);
                        container.appendChild(section);

                        // Fill tbody (with search filter)
                        const tbody = document.getElementById(`tbody-lv-${lv}`);
                        let visibleIdx = 0;
                        members.forEach((m) => {
                            let match = !searchQ;
                            if (searchQ) {
                                const name = (m.name || '').toLowerCase();
                                const phone = (m.phone || '').replace(/-/g, '');
                                const qNorm = searchQ.replace(/-/g, '');
                                if (searchTarget === 'name') match = name.includes(searchQ);
                                else if (searchTarget === 'phone') match = phone.includes(qNorm);
                                else match = name.includes(searchQ) || phone.includes(qNorm);
                            }
                            if (match && msFilter !== 'all') {
                                match = m.membership && m.membership.name === msFilter;
                            }
                            if (match) {
                                visibleIdx++;
                                tbody.innerHTML += buildRowHtml(m, visibleIdx);
                                totalVisible++;
                            }
                            globalIdx++;
                        });
                    } else {
                        // Card section wrapper
                        const section = document.createElement('div');
                        section.id = `level-section-card-${lv}`;
                        section.className = 'scroll-mt-[160px]';

                        // Card header (sticky)
                        section.innerHTML = `
                            <div class="level-sticky-header flex items-center gap-3 px-3 py-2 mb-3 mt-0" style="position:sticky;top:var(--level-header-top);z-index:20;background:rgba(255,255,255,0.98);backdrop-filter:blur(6px);border-bottom:1px solid #e2e8f0;">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full ${c.bg}"></span>
                                    <h3 class="text-base font-bold ${c.text}">Level ${lv}</h3>
                                    <span class="px-2 py-0.5 rounded-full ${c.light} ${c.text} ${c.border} border text-xs font-bold">${members.length}명</span>
                                </div>
                                <div class="flex-1 h-px bg-slate-200"></div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1" id="card-grid-lv-${lv}"></div>
                        `;
                        cardContainer.appendChild(section);

                        const grid = document.getElementById(`card-grid-lv-${lv}`);
                        let visibleIdx = 0;
                        members.forEach((m) => {
                            let match = !searchQ;
                            if (searchQ) {
                                const name = (m.name || '').toLowerCase();
                                const phone = (m.phone || '').replace(/-/g, '');
                                const qNorm = searchQ.replace(/-/g, '');
                                if (searchTarget === 'name') match = name.includes(searchQ);
                                else if (searchTarget === 'phone') match = phone.includes(qNorm);
                                else match = name.includes(searchQ) || phone.includes(qNorm);
                            }
                            if (match && msFilter !== 'all') {
                                match = m.membership && m.membership.name === msFilter;
                            }
                            if (match) {
                                visibleIdx++;
                                grid.innerHTML += buildCardHtml(m);
                                totalVisible++;
                            }
                        });
                    }
                });

                // Show/hide no-result message
                const noResult = document.getElementById('no-result');
                noResult.classList.toggle('hidden', totalVisible > 0 || !searchQ);

                // Bind checkboxes & level nav
                bindCheckboxes();
                renderLevelNav(teamIdx);
            }

            // ─── BULK CHECKBOXES ───
            function bindCheckboxes() {
                const bBar = document.getElementById('bulk-action-bar');
                // Per-level check-all
                document.querySelectorAll('.check-all-lv').forEach(chk => {
                    chk.checked = false;
                    chk.onchange = function(e) {
                        const lv = e.target.dataset.level;
                        const tbody = document.getElementById(`tbody-lv-${lv}`);
                        if (tbody) tbody.querySelectorAll('.row-checkbox').forEach(i => i.checked = e.target.checked);
                        updateBulk();
                    };
                });
                document.querySelectorAll('.row-checkbox').forEach(i => { i.onchange = updateBulk; });
                function updateBulk() {
                    const c = Array.from(document.querySelectorAll('.row-checkbox')).filter(i => i.checked).length;
                    if (c > 0) { bBar.classList.remove('hidden'); bBar.classList.add('flex'); document.getElementById('selected-count').innerText = c; }
                    else { bBar.classList.add('hidden'); bBar.classList.remove('flex'); }
                }
            }

            // ─── SORT SELECT ───
            const sortSelect = document.getElementById('sort-select');
            sortSelect.addEventListener('change', () => {
                currentSort = sortSelect.value;
                renderTeam(currentTeamIdx);
            });

            // ─── FILTERS ───
            const membershipFilter = document.getElementById('membership-filter');
            membershipFilter.addEventListener('change', () => {
                renderTeam(currentTeamIdx);
            });
            const levelFilter = document.getElementById('level-filter');
            if(levelFilter) levelFilter.addEventListener('change', () => renderTeam(currentTeamIdx));
            const innerAlertFilter = document.getElementById('inner-alert-filter');
            if(innerAlertFilter) innerAlertFilter.addEventListener('change', () => renderTeam(currentTeamIdx));

            // ─── SEARCH FILTERING ───
            const searchInput = document.getElementById('search-input');
            const searchTarget = document.getElementById('search-target');
            const searchClear = document.getElementById('search-clear');

            searchInput.addEventListener('input', () => {
                searchClear.classList.toggle('hidden', !searchInput.value.trim());
                renderTeam(currentTeamIdx);
            });
            searchTarget.addEventListener('change', () => renderTeam(currentTeamIdx));
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.classList.add('hidden');
                renderTeam(currentTeamIdx);
                searchInput.focus();
            });

            // ─── TEAM TAB CLICK HANDLERS ───

            // DOM idx → teamDefs idx (aggregates fall back to first underlying team)
            // 0=전체, 1=영어 전체, 2~6=영어 5팀, 7=일본어 전체, 8~12=일어 5팀
            const TEAM_DOM_TO_DEF = [0, 0, 0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
            const TEAM_DOM_KIND = ['neutral', 'eng', 'eng', 'eng', 'eng', 'eng', 'eng', 'jpn', 'jpn', 'jpn', 'jpn', 'jpn', 'jpn'];

            function updateMemberTabStyles() {
                teamButtons.forEach((b, idx) => {
                    const isActive = (idx === currentTeamIdx);
                    const kind = TEAM_DOM_KIND[idx] || 'neutral';

                    if (isActive) {
                        if (kind === 'eng') b.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-purple-600 text-white text-[13px] font-bold shadow-sm transition-all active:scale-95";
                        else if (kind === 'jpn') b.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-blue-600 text-white text-[13px] font-bold shadow-sm transition-all active:scale-95";
                        else b.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-slate-900 text-white text-[13px] font-bold shadow-sm transition-all active:scale-95";
                    } else {
                        if (kind === 'eng') b.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 text-[13px] font-medium transition-all active:scale-95";
                        else if (kind === 'jpn') b.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 text-[13px] font-medium transition-all active:scale-95";
                        else b.className = "team-tab flex-shrink-0 px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-[13px] font-bold transition-all active:scale-95";
                    }
                });
            }

            teamButtons.forEach((btn, idx) => {
                btn.addEventListener('click', () => {
                    currentTeamIdx = idx;
                    updateMemberTabStyles();
                    const defIdx = TEAM_DOM_TO_DEF[idx] ?? 0;
                    renderTeam(defIdx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });
            updateMemberTabStyles(); // initial call

            // ─── NAVIGATE TO TEAM FROM BADGE ───
            window.navigateToTeam = function(badgeLabel) {
                // Parse badge label like "영 월수 11AM(2)" → lang="영", schedule="월수", time="11"
                const match = badgeLabel.match(/^(영|일)\s*(월수|화목|토일)\s*(11|8)/);
                if (!match) return;
                const [, lang, schedule, time] = match;
                const targetIdx = teamDefs.findIndex(td => td.lang === lang && td.schedule === schedule && td.time === time);
                if (targetIdx < 0) return;
                // Trigger the team tab click
                teamButtons[targetIdx]?.click();
            };

            // ─── PROFILE MODAL ───
            const pModal = document.getElementById('profile-modal');
            const pOverlay = document.getElementById('profile-modal-overlay');

            // ── BranchStatus iframe 오버레이 — 클릭한 멤버 데이터를 sessionStorage 로 전달 ──
            window.openBsIframe = function(name) {
                const overlay = document.getElementById('bs-iframe-overlay');
                const iframe = document.getElementById('bs-iframe');
                if (!overlay || !iframe) return false;

                // 멤버 데이터를 branchstatus 모달이 쓰는 visitor 형태로 변환해 sessionStorage 에 적재
                try {
                    const data = (typeof memberDataMap !== 'undefined') ? memberDataMap[name] : null;
                    if (data) {
                        const lang = (data.teams && data.teams[0]) ? (String(data.teams[0]).startsWith('영') ? '영어' : '일본어') : '영어';
                        const lvNum = parseInt(String(data.level || '0').replace(/[^0-9]/g, ''), 10) || 0;
                        const attRateNum = parseFloat(String(data.attRate || '0').replace(/[^0-9.]/g, '')) || 0;
                        const attCountNum = parseInt(String(data.attCount || '0').replace(/[^0-9]/g, ''), 10) || 0;
                        const totalNum = parseInt(String(data.totalSession || '0').replace(/[^0-9]/g, ''), 10) || 0;
                        const remainNum = parseInt(String(data.remainSession || '0').replace(/[^0-9]/g, ''), 10) || 0;
                        // branchstatus 의 MEMBERSHIPS 가격표와 동일하게 매핑
                        const memberAmt = ({'VVIP+':2520000,'VVIP':1980000,'A+':1188000,'H+':780000,'T':190000,'LEADER':0,'SL':0})[data.membership] || 0;
                        const visitor = {
                            id: 'injected-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
                            name: data.name || name,
                            phone: data.phone || '',
                            lang,
                            level: lvNum,
                            membership: data.membership || '-',
                            payMethod: '카드',
                            amount: memberAmt,
                            extras: [],
                            status: 'member',
                            statusCls: 'st-member',
                            statusLabel: '멤버',
                            attended: attCountNum,
                            absent: Math.max(0, totalNum - remainNum - attCountNum),
                            totalSessions: totalNum,
                            realAttRate: attRateNum,
                            remaining: remainNum,
                            startDate: data.startDate || '-',
                            lastStudy: data.startDate || '-',
                            endDate: data.expDate || '-',
                            docDate: data.regDate || '-',
                            payDate: data.regDate || '-',
                            memo: data.message || '',
                            history: (data.history || []).map(h => ({
                                date: h.date || '-',
                                type: h.tag || h.title || '기록',
                                desc: h.desc || h.title || '',
                                color: h.color || 'slate',
                            })),
                            teams: Array.isArray(data.teams) ? data.teams.slice() : [],
                        };
                        sessionStorage.setItem('bs-injected-member', JSON.stringify(visitor));
                    } else {
                        sessionStorage.removeItem('bs-injected-member');
                    }
                } catch (e) { try { sessionStorage.removeItem('bs-injected-member'); } catch(_){} }

                iframe.src = `branchstatus.html?modalOnly=${encodeURIComponent(name)}&t=${Date.now()}`;
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                return true;
            };
            window.closeBsIframe = function(ev) {
                if (ev && ev.target && ev.target.id !== 'bs-iframe-overlay') return;
                const overlay = document.getElementById('bs-iframe-overlay');
                const iframe = document.getElementById('bs-iframe');
                if (overlay) overlay.classList.add('hidden');
                if (iframe) iframe.src = 'about:blank';
                document.body.style.overflow = '';
            };
            window.addEventListener('message', (e) => {
                if (e.data && e.data.type === 'bs-detail-close') closeBsIframe();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !document.getElementById('bs-iframe-overlay').classList.contains('hidden')) closeBsIframe();
            });

            window.openProfileModal = function(name) {
                if (name && openBsIframe(name)) return; // iframe 모드 우선
                const data = memberDataMap[name];
                if (!data) return;
                document.getElementById('pm-name').innerText = name;
                document.getElementById('pm-initial').innerText = name.charAt(0);
                document.getElementById('pm-level-badge').innerText = data.level;
                const mBadge = document.getElementById('pm-membership-badge');
                mBadge.className = `px-2 py-0.5 rounded text-[10px] font-bold border ${data.mColor}`;
                mBadge.innerText = data.membership;
                document.getElementById('pm-phone').innerText = data.phone;
                document.getElementById('pm-teams-container').innerHTML = data.teams.map(t => `<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white border border-white/20">${t}</span>`).join('');
                document.getElementById('pm-reg-date').innerText = data.regDate;
                document.getElementById('pm-brand-name').innerText = data.mName;
                document.getElementById('pm-remain-session').innerText = `${data.remainSession} / ${data.totalSession}회`;
                document.getElementById('pm-start-exp-date').innerHTML = `${data.startDate} <span class="text-slate-400 font-medium text-[11px] mx-0.5">~</span> ${data.expDate}`;
                document.getElementById('pm-exp-note').innerText = data.expNote;
                const attRateEl = document.getElementById('pm-att-rate');
                attRateEl.innerText = data.attRate;
                attRateEl.className = `font-bold text-[14px] leading-none ${data.attColor}`;
                document.getElementById('pm-att-count').innerText = `${data.attCount} 참석`;
                document.getElementById('pm-message').innerText = data.message;
                // ── branchstatus 와 동일한 스타일의 전체 히스토리 타임라인 ──
                const typeIcons = {
                    '자료등록':'ph-file-text','결제':'ph-credit-card','1차 결제':'ph-credit-card','2차 결제':'ph-credit-card',
                    '스터디 시작':'ph-play-circle','멤버십 변경':'ph-arrows-clockwise','레벨업':'ph-trend-up',
                    '환불':'ph-arrow-counter-clockwise','지점 이동':'ph-map-pin','등록':'ph-check-circle','추가납부':'ph-plus-circle',
                    '출석':'ph-check-circle','상담':'ph-chat-circle-text','결석':'ph-x-circle','홀딩':'ph-pause-circle','복귀':'ph-arrow-u-up-left'
                };
                const colorMap = {slate:'#94a3b8',brand:'#0ea5e9',emerald:'#10b981',red:'#ef4444',purple:'#a855f7',amber:'#f59e0b',blue:'#3b82f6',indigo:'#6366f1'};
                const sorted = [...data.history].sort((a,b) => String(a.date).localeCompare(String(b.date)));
                const histHtml = `<div class="relative pl-6">
                    <div class="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200"></div>
                    ${sorted.map(h => {
                        const type = h.tag || h.title || '기록';
                        const icon = typeIcons[type] || 'ph-circle';
                        const c = colorMap[h.color] || '#94a3b8';
                        const isRefund = type === '환불' || type === '환불 이체';
                        return `<div class="relative flex items-start gap-3 mb-2.5 last:mb-0 ${isRefund?'bg-red-50 border border-red-200 rounded-lg px-2 py-2 -mx-1':''}">
                            <div class="absolute left-[-20px] w-[17px] h-[17px] rounded-full border-2 bg-white flex items-center justify-center flex-shrink-0" style="border-color:${c};top:${isRefund?'10px':'2px'};">
                                <i class="ph-bold ${icon}" style="font-size:8px;color:${c};"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black" style="background:${c}22;color:${c};border:1px solid ${c}40;">
                                        <i class="ph-bold ${icon}" style="font-size:8px;"></i>${type}
                                    </span>
                                    <span class="text-[10px] text-slate-400 font-mono ml-auto">${h.date || ''}</span>
                                </div>
                                ${h.title && h.title !== type ? `<div class="text-[12px] font-bold text-slate-800 mt-1">${h.title}</div>` : ''}
                                <div class="text-[11px] text-slate-600 mt-0.5 font-medium">${h.desc || ''}</div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>`;
                document.getElementById('pm-timeline').innerHTML = histHtml;
                window.showProfileModal();
            };
            // closeProfileModal is provided by js/shared/profile-modal.js

            window.scrollToMember = function(id) {
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('bg-brand-100', 'transition-colors', 'duration-500');
                    setTimeout(() => { el.classList.remove('bg-brand-100'); }, 1500);
                }
            };

            window.openMemberAttendanceHistory = function(name) {
                const data = memberDataMap[name];
                if (!data) return;

                document.getElementById('ah-modal-name').innerText = name;
                document.getElementById('ah-modal-total-rate').innerText = data.attRate;
                document.getElementById('ah-modal-total-count').innerText = data.attCount;
                
                const listContainer = document.getElementById('ah-modal-list');
                listContainer.innerHTML = '';

                // Reverse to show recent first
                const historyBlocks = [...data.blocks].reverse().filter(b => b.status !== '미진행');
                
                if (historyBlocks.length === 0) {
                    listContainer.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs italic">최근 출석 기록이 없습니다.</div>`;
                } else {
                    historyBlocks.forEach(b => {
                        const statusColor = b.status === '출석' ? 'text-emerald-600' : 'text-red-500';
                        const statusBg = b.status === '출석' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200';
                        
                        listContainer.innerHTML += `
                            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:border-brand-200">
                                <div class="flex items-center justify-between mb-2.5">
                                    <div class="flex items-center gap-2">
                                        <i class="ph-bold ph-calendar text-slate-400"></i>
                                        <span class="text-sm font-bold text-slate-700">${b.date}</span>
                                    </div>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black border ${statusBg} ${statusColor}">${b.status}</span>
                                </div>
                                <div class="flex items-center gap-3 pt-2.5 border-t border-slate-100">
                                    <div class="flex items-center gap-1.5">
                                        <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-200">
                                            <i class="ph ph-user"></i>
                                        </div>
                                        <span class="text-xs font-semibold text-slate-600">리더: ${b.leader}</span>
                                    </div>
                                    <div class="flex-1 text-right text-[10px] text-slate-400 italic">
                                        기본 세션
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }

                const modal = document.getElementById('ah-modal');
                const overlay = document.getElementById('ah-modal-overlay');
                overlay.classList.remove('hidden');
                modal.classList.remove('hidden');
                setTimeout(() => {
                    overlay.classList.remove('opacity-0');
                    modal.classList.remove('opacity-0', 'translate-y-4');
                }, 10);
            };

            window.closeMemberAttendanceHistory = function() {
                const modal = document.getElementById('ah-modal');
                const overlay = document.getElementById('ah-modal-overlay');
                overlay.classList.add('opacity-0');
                modal.classList.add('opacity-0', 'translate-y-4');
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    modal.classList.add('hidden');
                }, 300);
            };

            window.resolveAlert = function(alertId, memberRowId) {
                const baseId = alertId.replace('alert-card-', '').replace('alert-', '');
                const listEl = document.getElementById('alert-' + baseId);
                const cardEl = document.getElementById('alert-card-' + baseId);
                
                const removeWithAnim = (el) => {
                    if (!el) return;
                    el.style.opacity = '0'; 
                    el.style.transform = 'translateY(10px)'; 
                    el.style.transition = 'all 0.3s ease';
                    setTimeout(() => el.remove(), 300);
                };

                removeWithAnim(listEl);
                removeWithAnim(cardEl);

                setTimeout(() => {
                    const checkSection = document.getElementById('check-section');
                    const countSpan = document.getElementById('check-count');
                    const listContainer = document.getElementById('alert-list-container');
                    const cardContainer = document.getElementById('alert-card-container');
                    
                    if (countSpan) {
                        let current = parseInt(countSpan.innerText);
                        if (!isNaN(current) && current > 0) {
                            current--; 
                            countSpan.innerText = current + '명';
                            if (current === 0) {
                                const emptyMsg = `<div class="p-6 text-center text-amber-700/60 text-xs font-bold w-full col-span-full">선택하신 유형의 알림 대상자가 없습니다.</div>`;
                                if (listContainer) listContainer.innerHTML = emptyMsg;
                                if (cardContainer) cardContainer.innerHTML = emptyMsg;
                            }
                        }
                    }
                }, 300);
                
                if (memberRowId) {
                    const row = document.getElementById(memberRowId);
                    if (row) {
                        const badgeContainer = row.querySelector('.alert-badge-container');
                        if (badgeContainer) badgeContainer.remove();
                    }
                }
            };

            // ─── GLOBAL BLOCK TOOLTIP ───
            const globalTooltip = document.getElementById('global-block-tooltip');
            const gbtDate = document.getElementById('gbt-date');
            const gbtStatus = document.getElementById('gbt-status');
            const gbtLeader = document.getElementById('gbt-leader');
            document.addEventListener('mouseover', function(e) {
                if (e.target.classList.contains('attendance-block')) {
                    const rect = e.target.getBoundingClientRect();
                    gbtDate.textContent = e.target.getAttribute('data-date') || '미정';
                    gbtStatus.textContent = e.target.getAttribute('data-status') || '미진행';
                    gbtStatus.className = `font-bold ${e.target.getAttribute('data-color') || 'text-slate-400'}`;
                    gbtLeader.textContent = e.target.getAttribute('data-leader') || '-';
                    globalTooltip.style.left = `${rect.left + (rect.width / 2)}px`;
                    globalTooltip.style.top = `${rect.top - 8}px`;
                    globalTooltip.classList.remove('hidden');
                }
            });
            document.addEventListener('mouseout', function(e) {
                if (e.target.classList.contains('attendance-block')) globalTooltip.classList.add('hidden');
            });

            window.openSmsModal = window.openSmsModal || function() { alert('일괄 문자 기능 (준비 중)'); };

            // Auto-fill empty members for testing (slots 1, 2, 3 and leader)
            const state = bldGetState();
            let mutated = false;
            Object.keys(state).forEach(teamKey => {
                state[teamKey].tables.forEach((t, tidx) => {
                    let poolIdx = (teamKey.charCodeAt(0) + tidx * 10) % bldMemberPool.length;
                    if (!t.leader.name && !t.leader.phone) {
                        const m = bldMemberPool[poolIdx % bldMemberPool.length]; poolIdx++;
                        t.leader.name = m.name; t.leader.phone = m.phone; t.leader.level = t.level ? t.level.replace('LV', '') + '+' : '1+'; t.leader.membership = 'SL';
                        mutated = true;
                    }
                    t.members.forEach((m, i) => {
                        if (i < 3 && !m.name && !m.phone) {
                            const rm = bldMemberPool[poolIdx % bldMemberPool.length]; poolIdx++;
                            m.name = rm.name; m.phone = rm.phone; m.level = t.level ? t.level.replace('LV', '') : '1'; m.membership = rm.membership;
                            mutated = true;
                        }
                    });
                });
            });
            if (mutated) {
                bldSetState(state);
                if (typeof renderBuilderView === 'function') renderBuilderView();
            }

            // ─── INITIAL RENDER ───
            renderTeam(0);
        });

// ─── Block 2: scroll-top + sticky positions ───
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

/* ── DYNAMIC STICKY POSITIONS ── */
(function fixStickyPositions(){
    function calc() {
        const header = document.querySelector('header');
        const tabsNav = document.getElementById('team-tabs-nav');
        const levelNav = document.getElementById('level-nav');
        if (!header || !tabsNav) return;

        const headerH = header.getBoundingClientRect().height;
        const tabsH   = tabsNav.getBoundingClientRect().height;
        const levelNavH = (levelNav && !levelNav.classList.contains('hidden'))
                          ? levelNav.getBoundingClientRect().height : 0;

        // Force a 1px overlap to eliminate sub-pixel gaps caused by borders/anti-aliasing
        const tabsTop      = headerH - 1; 
        const levelNavTop  = headerH + tabsH - 2; 
        const levelHeaderTop = headerH + tabsH + levelNavH - 3; 

        const root = document.documentElement;
        root.style.setProperty('--tabs-top',      tabsTop + 'px');
        root.style.setProperty('--level-nav-top', levelNavTop + 'px');
        root.style.setProperty('--level-header-top', levelHeaderTop + 'px');
    }

    // Run multiple times to catch layout settled state
    calc();
    window.addEventListener('scroll', calc, { passive: true });
    window.addEventListener('resize', calc);
    document.addEventListener('DOMContentLoaded', calc);
    window.addEventListener('load', calc);
    window._recalcSticky = calc;
})();
