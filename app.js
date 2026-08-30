const DEFAULT_DATA = {
  users: [
    { id: 'u1', name: 'Ammaar', role: 'admin', authorized: true, avatar: '👑' },
    { id: 'u2', name: 'Zaid', role: 'member', authorized: true, avatar: '⚡' },
    { id: 'u3', name: 'Farhan', role: 'member', authorized: true, avatar: '🔥' },
    { id: 'u4', name: 'Tariq', role: 'member', authorized: false, avatar: '🌟' }
  ],
  activeUserId: 'u1',
  adminUnlocked: false,
  adminPinHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  adminBackdateOverride: false,
  currentMonth: '2026-08',
  logs: {
    'u1': {
      '2026-08-30': { habits: { water: true, soda: true, screen: true }, exercises: [{ id: 'e1', name: 'Gym', minutes: 60 }] },
      '2026-08-29': { habits: { water: true, soda: false, screen: true }, exercises: [{ id: 'e2', name: 'Running', minutes: 45 }] },
      '2026-08-28': { habits: { water: true, soda: true, screen: false }, exercises: [{ id: 'e3', name: 'Gym', minutes: 75 }] }
    },
    'u2': {
      '2026-08-30': { habits: { water: true, soda: true, screen: false }, exercises: [{ id: 'e4', name: 'Running', minutes: 50 }] },
      '2026-08-29': { habits: { water: true, soda: true, screen: true }, exercises: [{ id: 'e5', name: 'Gym', minutes: 60 }] }
    },
    'u3': {
      '2026-08-30': { habits: { water: false, soda: true, screen: true }, exercises: [{ id: 'e6', name: 'Walking', minutes: 40 }] },
      '2026-08-28': { habits: { water: true, soda: false, screen: false }, exercises: [{ id: 'e7', name: 'Swimming', minutes: 30 }] }
    }
  }
};

class FitnessApp {
  constructor() {
    this.data = this.loadStorage();
    this.selectedDate = this.getTodayDateString();
    this.currentTab = 'home';
    this.leaderboardType = 'hours';
  }

  loadStorage() {
    try {
      const stored = localStorage.getItem('fitness_challenge_hub_data');
      return stored ? JSON.parse(stored) : DEFAULT_DATA;
    } catch (e) {
      return DEFAULT_DATA;
    }
  }

  saveStorage() {
    try {
      localStorage.setItem('fitness_challenge_hub_data', JSON.stringify(this.data));
    } catch (e) {
      console.error("Storage save error:", e);
    }
  }

  getActiveUser() {
    return this.data.users.find(u => u.id === this.data.activeUserId) || this.data.users[0];
  }

  getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  init() {
    this.renderHeader();
    this.renderDateSelector();
    this.renderDailyLog();
    this.renderLeaderboard();
    this.renderHomeStats();
    if (window.lucide) lucide.createIcons();
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const activeTabEl = document.getElementById('tab-' + tabId);
    if (activeTabEl) activeTabEl.classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('text-sky-400', 'font-semibold');
      btn.classList.add('text-slate-400', 'font-medium');
    });
    const activeNav = document.getElementById('nav-' + tabId);
    if (activeNav) {
      activeNav.classList.remove('text-slate-400', 'font-medium');
      activeNav.classList.add('text-sky-400', 'font-semibold');
    }

    if (tabId === 'leaderboard') this.renderLeaderboard();
    if (tabId === 'home') this.renderHomeStats();
    if (tabId === 'log') this.renderDailyLog();

    if (window.lucide) lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderHeader() {
    const user = this.getActiveUser();
    document.getElementById('activeUserNameDisplay').innerText = `${user.name} (${user.role === 'admin' ? 'Admin' : 'Member'})`;
    const dot = document.getElementById('userStatusDot');
    const alertBox = document.getElementById('unauthAlert');

    if (user.authorized) {
      dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400";
      alertBox.classList.add('hidden');
    } else {
      dot.className = "w-2.5 h-2.5 rounded-full bg-amber-400";
      alertBox.classList.remove('hidden');
    }

    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = lastDay - now.getDate();
    document.getElementById('daysLeftCount').innerText = `${daysLeft} Days`;
  }

  renderDateSelector() {
    const container = document.getElementById('quickDateSelector');
    const today = new Date();
    let html = '';

    for (let i = 0; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isSelected = dateStr === this.selectedDate;

      const labels = ['Today', 'Yesterday', '2 Days Ago', '3 Days Ago'];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();

      html += `
        <button onclick="app.selectDate('${dateStr}')" class="p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${isSelected ? 'bg-blue-600 border-sky-400 text-white shadow-md' : 'bg-[#0b1d33]/60 border-white/5 text-slate-300 hover:bg-[#0f294a]'}">
          <span class="text-[10px] uppercase font-bold text-slate-300">${labels[i]}</span>
          <span class="text-sm font-extrabold">${dayName} ${dayNum}</span>
        </button>
      `;
    }
    container.innerHTML = html;
    document.getElementById('selectedDateFormatted').innerText = `Selected Date: ${this.selectedDate}`;
  }

  selectDate(dateStr) {
    const today = new Date(this.getTodayDateString());
    const target = new Date(dateStr);
    const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

    if (diffDays > 3 && !this.data.adminBackdateOverride) {
      alert("Backdating is limited to 3 days! Only Admin can authorize backdating beyond this window.");
      return;
    }

    this.selectedDate = dateStr;
    this.renderDateSelector();
    this.renderDailyLog();
  }

  showCustomDatePrompt() {
    const input = prompt("Enter custom date (YYYY-MM-DD):", this.selectedDate);
    if (input) this.selectDate(input);
  }

  getOrCreateDayLog(userId, dateStr) {
    if (!this.data.logs[userId]) this.data.logs[userId] = {};
    if (!this.data.logs[userId][dateStr]) {
      this.data.logs[userId][dateStr] = {
        habits: { water: false, soda: false, screen: false },
        exercises: []
      };
    }
    return this.data.logs[userId][dateStr];
  }

  toggleHabit(habitKey) {
    const user = this.getActiveUser();
    if (!user.authorized) {
      alert("Your account is pending authorization by Admin before you can log habits.");
      this.renderDailyLog();
      return;
    }

    const dayLog = this.getOrCreateDayLog(user.id, this.selectedDate);
    dayLog.habits[habitKey] = !dayLog.habits[habitKey];
    this.saveStorage();
    this.renderDailyLog();
  }

  setExerciseType(name) {
    document.getElementById('exerciseInput').value = name;
    document.getElementById('durationMinutesInput').focus();
  }

  addExerciseEntry(e) {
    e.preventDefault();
    const user = this.getActiveUser();
    if (!user.authorized) {
      alert("Your account is pending authorization by Admin before you can record workouts.");
      return;
    }

    const name = document.getElementById('exerciseInput').value.trim();
    const minutes = parseInt(document.getElementById('durationMinutesInput').value, 10);

    if (!name || isNaN(minutes) || minutes <= 0) return;

    const dayLog = this.getOrCreateDayLog(user.id, this.selectedDate);
    dayLog.exercises.push({
      id: 'ex_' + Date.now(),
      name: name,
      minutes: minutes
    });

    document.getElementById('exerciseInput').value = '';
    document.getElementById('durationMinutesInput').value = '';

    this.saveStorage();
    this.renderDailyLog();
  }

  deleteExercise(id) {
    const user = this.getActiveUser();
    const dayLog = this.getOrCreateDayLog(user.id, this.selectedDate);
    dayLog.exercises = dayLog.exercises.filter(ex => ex.id !== id);
    this.saveStorage();
    this.renderDailyLog();
  }

  renderDailyLog() {
    const user = this.getActiveUser();
    const dayLog = this.getOrCreateDayLog(user.id, this.selectedDate);

    document.getElementById('habit_water').checked = !!dayLog.habits.water;
    document.getElementById('habit_soda').checked = !!dayLog.habits.soda;
    document.getElementById('habit_screen').checked = !!dayLog.habits.screen;

    let pts = 0;
    if (dayLog.habits.water) pts++;
    if (dayLog.habits.soda) pts++;
    if (dayLog.habits.screen) pts++;
    document.getElementById('dayHabitScoreBadge').innerText = `${pts} / 3 Pts`;

    let totalMins = 0;
    const listEl = document.getElementById('dayExercisesList');
    if (dayLog.exercises.length === 0) {
      listEl.innerHTML = `<div class="p-3 rounded-xl bg-[#07111e]/40 border border-dashed border-white/10 text-xs text-slate-400 text-center">No workouts recorded for this date yet.</div>`;
    } else {
      listEl.innerHTML = dayLog.exercises.map(ex => {
        totalMins += ex.minutes;
        return `
          <div class="flex items-center justify-between p-3 rounded-xl bg-[#0b1d33]/60 border border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-blue-500/20 text-sky-400 flex items-center justify-center text-xs">
                <i data-lucide="dumbbell" class="w-3.5 h-3.5"></i>
              </div>
              <div>
                <span class="text-sm font-semibold text-white">${ex.name}</span>
                <span class="text-xs text-sky-400 ml-2">${ex.minutes} mins (${(ex.minutes / 60).toFixed(1)} hrs)</span>
              </div>
            </div>
            <button onclick="app.deleteExercise('${ex.id}')" class="text-slate-500 hover:text-red-400 p-1">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `;
      }).join('');
    }
    document.getElementById('dayWorkoutTotalBadge').innerText = `${totalMins} mins (${(totalMins / 60).toFixed(1)} hrs)`;
    if (window.lucide) lucide.createIcons();
  }

  getUserMonthlyStats(userId) {
    const userLogs = this.data.logs[userId] || {};
    let totalPoints = 0;
    let totalMinutes = 0;

    for (const date in userLogs) {
      const log = userLogs[date];
      if (log.habits) {
        if (log.habits.water) totalPoints++;
        if (log.habits.soda) totalPoints++;
        if (log.habits.screen) totalPoints++;
      }
      if (log.exercises && Array.isArray(log.exercises)) {
        log.exercises.forEach(ex => {
          totalMinutes += (ex.minutes || 0);
        });
      }
    }

    const totalHours = (totalMinutes / 60).toFixed(1);
    const combinedScore = (parseFloat(totalHours) * 2) + totalPoints;

    return {
      totalPoints,
      totalMinutes,
      totalHours: parseFloat(totalHours),
      combinedScore: Math.round(combinedScore)
    };
  }

  switchLeaderboardType(type) {
    this.leaderboardType = type;
    const btnHours = document.getElementById('btn-lb-hours');
    const btnPoints = document.getElementById('btn-lb-points');
    const btnCombined = document.getElementById('btn-lb-combined');
    
    [btnHours, btnPoints, btnCombined].forEach(b => {
      b.className = "flex-1 py-2 rounded-lg text-xs font-bold transition text-slate-400 hover:text-white flex items-center justify-center gap-1.5";
    });

    if (type === 'hours') {
      btnHours.className = "flex-1 py-2 rounded-lg text-xs font-bold transition bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5";
      document.getElementById('leaderboardSubtitle').innerText = "Ranked by total accumulated workout hours";
    } else if (type === 'points') {
      btnPoints.className = "flex-1 py-2 rounded-lg text-xs font-bold transition bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5";
      document.getElementById('leaderboardSubtitle').innerText = "Ranked by daily habit checklist compliance points";
    } else {
      btnCombined.className = "flex-1 py-2 rounded-lg text-xs font-bold transition bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5";
      document.getElementById('leaderboardSubtitle').innerText = "Ranked by overall combined points (Workout Hours + Habits)";
    }

    this.renderLeaderboard();
  }

  renderLeaderboard() {
    const statsList = this.data.users.map(u => {
      const stats = this.getUserMonthlyStats(u.id);
      return { ...u, ...stats };
    });

    if (this.leaderboardType === 'hours') {
      statsList.sort((a, b) => b.totalHours - a.totalHours || b.totalPoints - a.totalPoints);
    } else if (this.leaderboardType === 'points') {
      statsList.sort((a, b) => b.totalPoints - a.totalPoints || b.totalHours - a.totalHours);
    } else {
      statsList.sort((a, b) => b.combinedScore - a.combinedScore);
    }

    document.getElementById('totalMembersCount').innerText = `${statsList.length} Participants`;

    const podiumEl = document.getElementById('podiumContainer');
    const top1 = statsList[0];
    const top2 = statsList[1];
    const top3 = statsList[2];

    const getScoreLabel = (item) => {
      if (!item) return '';
      if (this.leaderboardType === 'hours') return `${item.totalHours} hrs`;
      if (this.leaderboardType === 'points') return `${item.totalPoints} pts`;
      return `${item.combinedScore} score`;
    };

    podiumEl.innerHTML = `
      ${top2 ? `
      <div class="flex flex-col items-center flex-1 max-w-[100px]">
        <div class="text-xl">${top2.avatar}</div>
        <div class="text-xs font-bold text-slate-300 truncate w-full text-center">${top2.name}</div>
        <div class="text-[11px] text-sky-400 font-semibold">${getScoreLabel(top2)}</div>
        <div class="w-full h-20 rounded-t-xl bg-slate-700/60 border border-slate-500/30 flex items-center justify-center text-slate-300 font-extrabold text-sm mt-2">
          #2
        </div>
      </div>
      ` : ''}

      ${top1 ? `
      <div class="flex flex-col items-center flex-1 max-w-[120px]">
        <div class="text-2xl">${top1.avatar}</div>
        <div class="text-xs font-bold text-amber-400 truncate w-full text-center">${top1.name}</div>
        <div class="text-[11px] text-amber-300 font-extrabold">${getScoreLabel(top1)}</div>
        <div class="w-full h-28 rounded-t-xl bg-gradient-to-t from-amber-600/60 to-amber-500/80 border border-amber-400/40 flex flex-col items-center justify-center text-white font-extrabold text-base mt-2 shadow-lg shadow-amber-500/20">
          <i data-lucide="crown" class="w-5 h-5 text-amber-200 mb-1"></i>
          #1
        </div>
      </div>
      ` : ''}

      ${top3 ? `
      <div class="flex flex-col items-center flex-1 max-w-[100px]">
        <div class="text-xl">${top3.avatar}</div>
        <div class="text-xs font-bold text-slate-300 truncate w-full text-center">${top3.name}</div>
        <div class="text-[11px] text-sky-400 font-semibold">${getScoreLabel(top3)}</div>
        <div class="w-full h-14 rounded-t-xl bg-amber-900/40 border border-amber-800/30 flex items-center justify-center text-amber-600 font-extrabold text-sm mt-2">
          #3
        </div>
      </div>
      ` : ''}
    `;

    const listEl = document.getElementById('leaderboardList');
    listEl.innerHTML = statsList.map((item, idx) => {
      const isCurrentUser = item.id === this.data.activeUserId;
      return `
        <div class="flex items-center justify-between p-3.5 rounded-xl ${isCurrentUser ? 'bg-blue-900/40 border border-sky-400/40 ring-1 ring-sky-400/20' : 'bg-[#0b1d33]/40 border border-white/5'}">
          <div class="flex items-center gap-3">
            <span class="w-6 font-bold text-sm ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'}">
              #${idx + 1}
            </span>
            <span class="text-lg">${item.avatar}</span>
            <div>
              <div class="text-sm font-bold text-white flex items-center gap-1.5">
                ${item.name}
                ${item.role === 'admin' ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/30 text-sky-400 font-semibold">Admin</span>' : ''}
                ${!item.authorized ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">Pending</span>' : ''}
              </div>
              <div class="text-[11px] text-slate-400 flex items-center gap-2">
                <span>${item.totalHours} hrs</span> • <span>${item.totalPoints} pts</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-extrabold text-sky-400">${getScoreLabel(item)}</div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }

  renderHomeStats() {
    const user = this.getActiveUser();
    const stats = this.getUserMonthlyStats(user.id);
    document.getElementById('userMyScore').innerText = `${stats.totalPoints} pts`;
    document.getElementById('userMyHours').innerText = `${stats.totalHours} hrs`;

    const allStats = this.data.users.map(u => ({ id: u.id, ...this.getUserMonthlyStats(u.id) }));
    allStats.sort((a, b) => b.totalHours - a.totalHours);
    const rank = allStats.findIndex(u => u.id === user.id) + 1;
    document.getElementById('userMyRank').innerText = `#${rank}`;
  }

  openUserModal() {
    const listEl = document.getElementById('userSelectList');
    listEl.innerHTML = this.data.users.map(u => {
      const isActive = u.id === this.data.activeUserId;
      return `
        <button onclick="app.switchActiveUser('${u.id}')" class="w-full p-3 rounded-xl border flex items-center justify-between transition ${isActive ? 'bg-blue-600/20 border-sky-400 text-white' : 'bg-[#0b1d33]/40 border-white/5 text-slate-300 hover:bg-[#0f294a]'}">
          <div class="flex items-center gap-2.5">
            <span class="text-lg">${u.avatar}</span>
            <div class="text-left">
              <div class="text-xs font-bold">${u.name}</div>
              <div class="text-[10px] text-slate-400">${u.role.toUpperCase()} • ${u.authorized ? 'Authorized' : 'Pending'}</div>
            </div>
          </div>
          ${isActive ? '<i data-lucide="check" class="w-4 h-4 text-sky-400"></i>' : ''}
        </button>
      `;
    }).join('');

    document.getElementById('userModal').classList.remove('hidden');
    document.getElementById('userModal').classList.add('flex');
    if (window.lucide) lucide.createIcons();
  }

  closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
    document.getElementById('userModal').classList.remove('flex');
  }

  switchActiveUser(userId) {
    this.data.activeUserId = userId;
    this.saveStorage();
    this.closeUserModal();
    this.init();
  }

  registerUser(e) {
    e.preventDefault();
    if (this.data.users.length >= 5) {
      alert("Maximum 5 users reached for this private group!");
      return;
    }

    const name = document.getElementById('newUserNameInput').value.trim();
    if (!name) return;

    const newUser = {
      id: 'u_' + Date.now(),
      name: name,
      role: 'member',
      authorized: false,
      avatar: ['🚀', '⚡', '🏆', '🔥', '💪'][this.data.users.length % 5]
    };

    this.data.users.push(newUser);
    this.data.activeUserId = newUser.id;
    this.saveStorage();
    document.getElementById('newUserNameInput').value = '';
    this.closeUserModal();
    this.init();
  }

  openAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
    document.getElementById('adminModal').classList.add('flex');
    if (this.data.adminUnlocked) {
      document.getElementById('adminAuthSection').classList.add('hidden');
      document.getElementById('adminPanelUnlocked').classList.remove('hidden');
      this.renderAdminPanel();
    } else {
      document.getElementById('adminAuthSection').classList.remove('hidden');
      document.getElementById('adminPanelUnlocked').classList.add('hidden');
    }
  }

  closeAdminModal() {
    document.getElementById('adminModal').classList.add('hidden');
    document.getElementById('adminModal').classList.remove('flex');
  }

  async unlockAdmin() {
    const pin = document.getElementById('adminPinInput').value;
    const msgBuffer = new TextEncoder().encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === this.data.adminPinHash) {
      this.data.adminUnlocked = true;
      document.getElementById('adminPinInput').value = '';
      this.openAdminModal();
    } else {
      alert("Incorrect Admin PIN! Default is 1234");
    }
  }

  renderAdminPanel() {
    const listEl = document.getElementById('adminUserAuthList');
    listEl.innerHTML = this.data.users.map(u => {
      return `
        <div class="flex items-center justify-between p-3 rounded-xl bg-[#0b1d33]/60 border border-white/5">
          <div class="flex items-center gap-2">
            <span class="text-base">${u.avatar}</span>
            <div>
              <div class="text-xs font-bold text-white">${u.name}</div>
              <div class="text-[10px] ${u.authorized ? 'text-emerald-400' : 'text-amber-400'}">${u.authorized ? 'Authorized' : 'Pending Admin Approval'}</div>
            </div>
          </div>
          <button onclick="app.toggleUserAuth('${u.id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${u.authorized ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'}">
            ${u.authorized ? 'Revoke' : 'Approve'}
          </button>
        </div>
      `;
    }).join('');

    const overrideBtn = document.getElementById('adminOverrideBtn');
    if (this.data.adminBackdateOverride) {
      overrideBtn.innerText = "Disable Backdating Override (Lock to 3 Days)";
      overrideBtn.className = "w-full py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs";
    } else {
      overrideBtn.innerText = "Unlock & Allow Backdating for All Dates";
      overrideBtn.className = "w-full py-2 rounded-xl bg-[#0b1d33] border border-amber-500/30 text-amber-300 font-bold text-xs";
    }
  }

  toggleUserAuth(userId) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.authorized = !user.authorized;
      this.saveStorage();
      this.renderAdminPanel();
      this.renderHeader();
    }
  }

  toggleAdminBackdateOverride() {
    this.data.adminBackdateOverride = !this.data.adminBackdateOverride;
    this.saveStorage();
    this.renderAdminPanel();
    alert(this.data.adminBackdateOverride ? "Backdating restriction lifted!" : "Backdating restored to 3-day window.");
  }

  resetMonthData() {
    if (confirm("Are you sure you want to reset and start a new month? All existing data will be archived.")) {
      this.data.logs = {};
      this.saveStorage();
      this.init();
      this.closeAdminModal();
      alert("Monthly leaderboard has been reset successfully!");
    }
  }
}

const app = new FitnessApp();
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});