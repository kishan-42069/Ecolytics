// Local Storage Database Interface
const Storage = {
  KEYS: {
    LOGS: "ecolytics_user_logs",
    STATS: "ecolytics_user_stats",
    STREAK: "ecolytics_streak_state",
    PRIVACY: "ecolytics_privacy_consent",
    CUSTOM_ACTIONS: "ecolytics_custom_actions"
  },

  /**
   * Initializes database with mock or empty values if not exists.
   */
  init: function() {
    if (!localStorage.getItem(this.KEYS.LOGS)) {
      // Set initial defaults
      const initialLogs = {
        drivingMiles: 320,
        transitMiles: 80,
        flightsMiles: 0,
        electricityKwh: 260,
        greenEnergyPct: 20,
        meatMeals: 14,
        vegMeals: 10,
        veganMeals: 6,
        shoppingSpend: 180,
        waterGallons: 950,
        wasteKg: 18,
        recycledPct: 40,
        compostedPct: 10
      };
      this.saveLogs(initialLogs);
    }

    if (!localStorage.getItem(this.KEYS.STATS)) {
      const initialStats = {
        xp: 180,
        simulationPerformed: false,
        claimedChallenges: [],
        completedRecs: []
      };
      this.saveStats(initialStats);
    }

    if (!localStorage.getItem(this.KEYS.STREAK)) {
      // Yesterdays date in standard local format
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const initialStreak = {
        current: 4, // start with 4-day streak for visual excitement
        lastLoggedDate: yesterdayStr,
        shields: 1 // 1 streak shield active
      };
      this.saveStreak(initialStreak);
    }

    if (!localStorage.getItem(this.KEYS.PRIVACY)) {
      const initialPrivacy = {
        analytics: true,
        localOnly: true,
        gdprAccepted: true
      };
      localStorage.setItem(this.KEYS.PRIVACY, JSON.stringify(initialPrivacy));
    }
  },

  getLogs: function() {
    return JSON.parse(localStorage.getItem(this.KEYS.LOGS)) || {};
  },

  saveLogs: function(logs) {
    localStorage.setItem(this.KEYS.LOGS, JSON.stringify(logs));
  },

  getStats: function() {
    return JSON.parse(localStorage.getItem(this.KEYS.STATS)) || {};
  },

  saveStats: function(stats) {
    localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
  },

  getStreak: function() {
    return JSON.parse(localStorage.getItem(this.KEYS.STREAK)) || {};
  },

  saveStreak: function(streak) {
    localStorage.setItem(this.KEYS.STREAK, JSON.stringify(streak));
  },

  getPrivacy: function() {
    return JSON.parse(localStorage.getItem(this.KEYS.PRIVACY)) || {};
  },

  savePrivacy: function(privacy) {
    localStorage.setItem(this.KEYS.PRIVACY, JSON.stringify(privacy));
  },

  // GDPR - User Data Rights: Export
  exportUserData: function() {
    const data = {
      logs: this.getLogs(),
      stats: this.getStats(),
      streak: this.getStreak(),
      privacy: this.getPrivacy(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecolytics_data_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // GDPR - User Data Rights: Purge
  purgeUserData: function() {
    localStorage.removeItem(this.KEYS.LOGS);
    localStorage.removeItem(this.KEYS.STATS);
    localStorage.removeItem(this.KEYS.STREAK);
    localStorage.removeItem(this.KEYS.PRIVACY);
    localStorage.removeItem(this.KEYS.CUSTOM_ACTIONS);
    this.init(); // reset to factory mock data
  },

  getCustomActions: function() {
    return JSON.parse(localStorage.getItem(this.KEYS.CUSTOM_ACTIONS)) || [];
  },

  saveCustomActions: function(actions) {
    localStorage.setItem(this.KEYS.CUSTOM_ACTIONS, JSON.stringify(actions));
  },

  addCustomAction: function(text) {
    const actions = this.getCustomActions();
    const entry = { id: Date.now(), text: text.trim(), addedAt: new Date().toISOString() };
    actions.unshift(entry); // newest first
    this.saveCustomActions(actions);
    return entry;
  },

  removeCustomAction: function(id) {
    const actions = this.getCustomActions().filter(a => a.id !== id);
    this.saveCustomActions(actions);
  }
};

window.Storage = Storage;
