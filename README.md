# 🏆 Monthly Fitness Challenge Hub

A modern, responsive, mobile-first fitness tracker and competitive monthly leaderboard designed for private groups (up to 5 participants).

![Theme](https://img.shields.io/badge/Theme-Dark%20Navy%20%26%20Sky%20Blue-07111e)
![Security](https://img.shields.io/badge/Security-Zero%20Billing%20Risk-emerald)
![Platform](https://img.shields.io/badge/Platform-Web%20%26%20Mobile-blue)

---

## 📱 Features

1. **🏠 Home Overview**:
   - Monthly days countdown.
   - Quick navigation tiles to log workouts, inspect leaderboards, or read rules.
   - Customizable instructions block.

2. **📝 Daily Logging (Strict 3-Day Rule)**:
   - Date selection strictly enforced to **Today, -1 day, -2 days, -3 days**.
   - **Habit Checklist (+1 point per checkbox / day)**:
     - 💧 *Drank 2L Water*
     - 🥤 *No Cooldrinks / Soda Today*
     - 📱 *Screentime Less Than 4 Hours*
   - **Exercise Activity Logger**:
     - Pre-selected chips (*Gym, Running, Walking, Cycling*) or custom exercise input.
     - Logs exact workout duration in minutes and hours.

3. **👑 Dual Dynamic Leaderboard**:
   - **Exercise Hours Podium**: Ranks users by cumulative workout time.
   - **Habit Points Standing**: Ranks users by checklist points.
   - **Overall Score**: Combined weighted performance score.

4. **🔐 Admin & Security Controls**:
   - **Member Authorization Whitelist**: New members require Admin approval before being allowed to log data.
   - **Admin PIN**: Default PIN is `1234` (hashed using SHA-256).
   - **Backdating Override**: Admin can unlock backdating beyond 3 days for special cases.
   - **Monthly Reset**: Instant cycle reset with archival.

---

## 🔒 Cybersecurity & Financial Safeguards

- **Zero API Key Leakage**: No hardcoded API keys or secret credentials.
- **Zero Financial Risk**: Runs 100% on client-side storage or strict Free-Tier sync.
- **Private Repository**: Maintained in your private GitHub workspace.

---

## 🚀 How to Run Locally

Open `index.html` in any web browser (Chrome, Safari, Edge, Firefox) or serve via any static HTTP server:
```bash
# Optional simple local server
npx serve .
# Or open index.html directly
```