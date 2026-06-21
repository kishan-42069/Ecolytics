// Ecolytics AI — Main Application Coordinator
document.addEventListener("DOMContentLoaded", () => {
  Storage.init();

  // ── Global App State ─────────────────────────────────────
  const State = {
    logs: Storage.getLogs(),
    stats: Storage.getStats(),
    streak: Storage.getStreak(),
    privacy: Storage.getPrivacy(),
    activeTab: "dashboard",
    selectedRegion: "US"
  };

  // ── DOM References ────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const DOM = {
    navItems: $$(".nav-item, .mobile-nav-item"),
    viewSections: $$(".view-section"),
    viewTitle: $("current-view-title"),
    viewSubtitle: $("current-view-subtitle"),

    // Profile Header
    lvlIndicator: $("user-lvl-indicator"),
    lvlLabel: $("level-display-label"),
    xpText: $("xp-text-label"),
    xpBar: $("xp-bar-fill"),
    streakCount: $("streak-count-val"),
    regionSelect: $("region-select"),

    // Settings
    settingsModal: $("settings-modal"),
    openSettingsBtn: $("open-settings-btn"),
    openSettingsBtn2: $("open-settings-btn2"),
    closeSettingsBtn: $("close-settings-btn"),
    settingsRegion: $("settings-region-select"),
    exportBtn: $("export-data-btn"),
    purgeBtn: $("purge-data-btn"),

    // Dashboard
    dashScore: $("dash-total-score"),
    dashRating: $("dash-climate-rating"),
    dialFill: $("score-dial-fill"),
    statVsAvg: $("stat-vs-avg"),
    statVsTarget: $("stat-vs-target"),
    statTopCat: $("stat-top-cat"),
    categoryListEl: $("category-list-el"),
    benchmarkListEl: $("benchmark-list-el"),
    recListEl: $("rec-list-el"),
    regionBadge: $("region-badge-display"),

    // Equivalents
    eqCarMiles: $("eq-car-miles"),
    eqPhones: $("eq-phones"),
    eqTreeMonths: $("eq-tree-months"),
    eqGasoline: $("eq-gasoline"),

    // Logger form
    logDriving: $("log-driving"),
    logTransit: $("log-transit"),
    logFlights: $("log-flights"),
    logElectricity: $("log-electricity"),
    logGreenEnergy: $("log-green-energy"),
    logMeatMeals: $("log-meat-meals"),
    logVegMeals: $("log-veg-meals"),
    logVeganMeals: $("log-vegan-meals"),
    logShopping: $("log-shopping"),
    logWater: $("log-water"),
    logWaste: $("log-waste"),
    logRecycled: $("log-recycled"),
    logComposted: $("log-composted"),
    saveLogsBtn: $("save-logs-btn"),
    applyDefaultsBtn: $("apply-defaults-btn"),
    quickTransit: $("quick-action-transit"),
    quickMeal: $("quick-action-meal"),
    quickCompost: $("quick-action-compost"),
    customActionInput: $("custom-action-input"),
    customActionAddBtn: $("custom-action-add-btn"),
    customActionsList: $("custom-actions-list"),

    // Simulator
    simDrivingSlider: $("sim-driving-slider"),
    simDrivingVal: $("sim-driving-val"),
    simEnergySlider: $("sim-energy-slider"),
    simEnergyVal: $("sim-energy-val"),
    simFoodSlider: $("sim-food-slider"),
    simFoodVal: $("sim-food-val"),
    simShoppingSlider: $("sim-shopping-slider"),
    simShoppingVal: $("sim-shopping-val"),
    simSavedCo2: $("sim-saved-co2"),
    simSavedPct: $("sim-saved-pct"),
    simBarBaseline: $("sim-bar-baseline"),
    simBarBaselineLbl: $("sim-bar-baseline-lbl"),
    simBarProjected: $("sim-bar-projected"),
    simBarProjectedLbl: $("sim-bar-projected-lbl"),
    simNarrativeText: $("sim-narrative-text"),
    simFullNarrative: $("sim-full-narrative"),

    // Coach
    coachForm: $("coach-chat-form"),
    coachInput: $("coach-user-msg-input"),
    coachLog: $("coach-messages-log"),
    coachChips: $("coach-chips"),

    // Rewards
    badgesGrid: $("badges-grid-el"),
    badgeCount: $("badge-count-tag"),
    challengesList: $("challenges-list-el"),
    offsetsList: $("offsets-list-el"),

    menuToggle: $("menu-toggle-btn"),
    sidebar: document.querySelector(".sidebar")
  };

  // ── View Tab Titles ───────────────────────────────────────
  const VIEW_META = {
    dashboard: { title: "My Impact", subtitle: "See how your daily habits affect the planet" },
    logger: { title: "Log My Activities", subtitle: "Tell us what you did this month and we'll calculate your impact" },
    simulator: { title: "What If?", subtitle: "See how small changes in your lifestyle could lower your carbon footprint" },
    coach: { title: "Ask Eco", subtitle: "Chat with your personal green guide — no jargon, just honest advice" },
    rewards: { title: "My Goals & Achievements", subtitle: "Earn badges, complete challenges, and support real climate projects" }
  };

  // ── Category Color Map ────────────────────────────────────
  const CAT_COLORS = {
    transportation: "#c2410c",
    energy: "#047857",
    food: "#059669",
    shopping: "#065f46",
    water: "#0284c7",
    waste: "#064e3b"
  };

  // ── Tab Router ────────────────────────────────────────────
  function initRouter() {
    DOM.navItems.forEach(item => {
      item.addEventListener("click", () => {
        const target = item.getAttribute("data-target");
        if (!target) return;

        DOM.navItems.forEach(el => el.classList.remove("active"));
        $$(`[data-target="${target}"]`).forEach(el => el.classList.add("active"));

        DOM.viewSections.forEach(s => s.classList.remove("active"));
        const section = $(`view-${target}`);
        if (section) section.classList.add("active");

        State.activeTab = target;
        const meta = VIEW_META[target] || {};
        DOM.viewTitle.textContent = meta.title || target;
        DOM.viewSubtitle.textContent = meta.subtitle || "";

        if (target === "dashboard") updateDashboard();
        if (target === "rewards") renderRewardsTab();
        if (target === "simulator") runSimulation();

        // Close mobile sidebar if open
        if (DOM.sidebar) DOM.sidebar.classList.remove("open");
      });
    });

    // Mobile menu toggle
    if (DOM.menuToggle) {
      DOM.menuToggle.addEventListener("click", () => {
        DOM.sidebar && DOM.sidebar.classList.toggle("open");
      });
    }
  }

  // ── Toast Notification ────────────────────────────────────
  function showToast(msg, type = "default") {
    const colors = {
      default: { bg: "#ffffff", border: "var(--border)", text: "var(--text-primary)" },
      success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
      info: { bg: "var(--bg-blue-wash)", border: "#bfdfef", text: "var(--blue)" },
      danger: { bg: "var(--danger-bg)", border: "#fecaca", text: "var(--danger)" }
    };
    const c = colors[type] || colors.default;

    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: ${c.bg}; border: 1px solid ${c.border};
      color: ${c.text}; padding: 12px 18px; border-radius: 10px;
      font-size: 13px; font-weight: 600; font-family: var(--font-sans);
      box-shadow: var(--shadow-lg); max-width: 340px; line-height: 1.4;
      animation: viewIn 0.25s var(--ease) forwards;
    `;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; toast.style.transition = "opacity 0.2s"; setTimeout(() => toast.remove(), 200); }, 3500);
  }

  // ── XP & Profile Refresh ──────────────────────────────────
  function refreshProfile() {
    const lvl = Gamification.getLevelInfo(State.stats.xp);
    DOM.lvlIndicator.textContent = `Level ${lvl.level}`;
    DOM.lvlLabel.textContent = `Level ${lvl.level}`;
    DOM.xpText.textContent = `${lvl.currentLevelXp} XP`;
    DOM.xpBar.style.width = `${lvl.pctProgress}%`;
    DOM.streakCount.textContent = State.streak.current;
  }

  function addXp(amount, msg = "") {
    State.stats.xp += amount;
    Storage.saveStats(State.stats);
    refreshProfile();
    if (msg) showToast(`+${amount} XP — ${msg}`, "success");
  }

  // ── Dashboard Rendering ───────────────────────────────────
  function updateDashboard() {
    const results = Calculator.calculate(State.logs, State.selectedRegion);
    const benchmark = ReferenceData.benchmarks[State.selectedRegion] || ReferenceData.benchmarks.US;

    // Score number
    DOM.dashScore.textContent = results.total.toLocaleString(undefined, { maximumFractionDigits: 0 });

    // Grade & dial fill
    const maxRef = benchmark.average * 1.4;
    const scorePct = Math.max(0.04, Math.min(1, 1 - (results.total / maxRef)));
    const circumference = 534; // 2π × 85
    DOM.dialFill.style.strokeDashoffset = Math.round(circumference * (1 - scorePct));

    let rating = "High Impact — Time to make some changes!";
    let ratingColor = "var(--danger)";
    if (results.total <= benchmark.target) {
      rating = "Excellent 🌟 — You're a climate leader!";
      ratingColor = "var(--success)";
    } else if (results.total <= benchmark.cohort) {
      rating = "Good 👍 — You're below the average!";
      ratingColor = "var(--text-teal)";
    } else if (results.total <= benchmark.average) {
      rating = "Doing OK 🙂 — Room to improve";
      ratingColor = "var(--warning)";
    }
    DOM.dashRating.textContent = rating;
    DOM.dashRating.style.color = ratingColor;

    // Stat strip
    const diffAvg = Math.round(benchmark.average - results.total);
    DOM.statVsAvg.textContent = diffAvg >= 0 ? `-${diffAvg} kg` : `+${Math.abs(diffAvg)} kg`;
    DOM.statVsAvg.style.color = diffAvg >= 0 ? "var(--success)" : "var(--danger)";
    const diffTarget = Math.round(results.total - benchmark.target);
    DOM.statVsTarget.textContent = diffTarget > 0 ? `+${diffTarget} kg above goal` : "On target ✅";
    DOM.statVsTarget.style.color = diffTarget > 0 ? "var(--danger)" : "var(--success)";

    // Top category
    let topCat = "—", topVal = 0;
    for (const [cat, val] of Object.entries(results.breakdown)) {
      if (val > topVal) { topVal = val; topCat = cat; }
    }
    DOM.statTopCat.textContent = topCat.charAt(0).toUpperCase() + topCat.slice(1);

    // Region badge
    const regionNames = { US: "US (EPA)", UK: "UK (DEFRA)", IPCC: "Global (IPCC)" };
    DOM.regionBadge.textContent = regionNames[State.selectedRegion] || State.selectedRegion;

    // Equivalents
    DOM.eqCarMiles.textContent = results.equivalents.carMiles.toLocaleString();
    DOM.eqPhones.textContent = results.equivalents.smartphoneCharges.toLocaleString();
    DOM.eqTreeMonths.textContent = results.equivalents.treeMonths.toLocaleString();
    const savedGallons = Math.max(0, Math.round((benchmark.average - results.total) / 8.887 * 10) / 10);
    DOM.eqGasoline.textContent = savedGallons.toLocaleString();

    renderCategoryList(results.breakdown, results.total);
    renderBenchmarks(results.total, benchmark);
    renderRecommendations(results);
  }

  function renderCategoryList(breakdown, total) {
    DOM.categoryListEl.innerHTML = "";
    const maxVal = Math.max(...Object.values(breakdown), 1);
    for (const [cat, val] of Object.entries(breakdown)) {
      const pct = Math.round((val / maxVal) * 100);
      const el = document.createElement("div");
      el.className = "category-row";
      el.innerHTML = `
        <span class="category-dot" style="background:${CAT_COLORS[cat] || "#999"};"></span>
        <div class="category-name-wrap">
          <span class="category-name-text">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
          <span class="category-value-text">${val} kg</span>
        </div>
        <div class="category-track">
          <div class="category-fill" style="background:${CAT_COLORS[cat] || "#999"}; width:${pct}%;"></div>
        </div>
      `;
      DOM.categoryListEl.appendChild(el);
    }
  }

  function renderBenchmarks(total, benchmark) {
    DOM.benchmarkListEl.innerHTML = "";
    const rows = [
      { label: "My footprint", val: total, color: "var(--orange)" },
      { label: "Average person", val: benchmark.cohort, color: "var(--green)" },
      { label: "Everyone in my region", val: benchmark.average, color: "var(--text-muted)" },
      { label: "My green goal", val: benchmark.target, color: "var(--green-dark)" }
    ];
    const maxVal = Math.max(...rows.map(r => r.val), 100);
    rows.forEach(r => {
      const pct = Math.round((r.val / maxVal) * 100);
      const el = document.createElement("div");
      el.className = "benchmark-row";
      el.innerHTML = `
        <span class="benchmark-label">${r.label}</span>
        <div class="benchmark-track">
          <div class="benchmark-fill" style="background:${r.color}; width:${pct}%;"></div>
        </div>
        <span class="benchmark-val">${Math.round(r.val)} kg</span>
      `;
      DOM.benchmarkListEl.appendChild(el);
    });
  }

  function renderRecommendations(results) {
    DOM.recListEl.innerHTML = "";
    const completed = State.stats.completedRecs || [];
    const scored = ReferenceData.recommendations
      .filter(r => !completed.includes(r.id))
      .map(r => ({ ...r, score: (r.impactScore * 1.5) + r.savingsScore - (r.frictionScore * 0.8) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    if (scored.length === 0) {
      DOM.recListEl.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><p>All recommendations completed. Excellent progress.</p></div>`;
      return;
    }

    scored.forEach(r => {
      const el = document.createElement("div");
      el.className = "rec-item";
      el.innerHTML = `
        <div class="rec-body">
          <span class="rec-title">${r.title}</span>
          <span class="rec-desc">${r.impactDescription}</span>
          <div class="rec-tags">
            <span class="tag tag-blue">Impact ${r.impactScore}/10</span>
            <span class="tag tag-teal">Saves money ${r.savingsScore}/10</span>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm rec-complete-btn" data-id="${r.id}">Done ✓</button>
      `;
      DOM.recListEl.appendChild(el);
    });

    $$(".rec-complete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (!State.stats.completedRecs) State.stats.completedRecs = [];
        State.stats.completedRecs.push(id);
        Storage.saveStats(State.stats);

        const rec = ReferenceData.recommendations.find(r => r.id === id);
        const xp = rec ? rec.impactScore * 15 : 100;

        if (id === "rec_green_electricity") { State.logs.greenEnergyPct = 100; }
        else if (id === "rec_commute_transit") { State.logs.drivingMiles = Math.max(0, (State.logs.drivingMiles || 0) - 80); State.logs.transitMiles = (State.logs.transitMiles || 0) + 80; }
        else if (id === "rec_meatless_monday") { State.logs.meatMeals = Math.max(0, (State.logs.meatMeals || 0) - 4); State.logs.vegMeals = (State.logs.vegMeals || 0) + 4; }
        Storage.saveLogs(State.logs);
        populateDiaryForm();

        addXp(xp, `Completed: ${rec ? rec.title : id}`);
        updateDashboard();
      });
    });
  }

  // ── Logger Form ───────────────────────────────────────────
  function populateDiaryForm() {
    const l = State.logs;
    const set = (el, val) => {
      if (el && val != null && !isNaN(val)) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    set(DOM.logDriving, l.drivingMiles);
    set(DOM.logTransit, l.transitMiles);
    set(DOM.logFlights, l.flightsMiles);
    set(DOM.logElectricity, l.electricityKwh);
    set(DOM.logGreenEnergy, l.greenEnergyPct);
    set(DOM.logMeatMeals, l.meatMeals);
    set(DOM.logVegMeals, l.vegMeals);
    set(DOM.logVeganMeals, l.veganMeals);
    set(DOM.logShopping, l.shoppingSpend);
    set(DOM.logWater, l.waterGallons);
    set(DOM.logWaste, l.wasteKg);
    set(DOM.logRecycled, l.recycledPct);
    set(DOM.logComposted, l.compostedPct);
  }

  window.removeCustomActionFromUI = function (id) {
    Storage.removeCustomAction(id);
    renderCustomActions();
  };

  function renderCustomActions() {
    if (!DOM.customActionsList) return;
    const actions = Storage.getCustomActions();
    DOM.customActionsList.innerHTML = actions.map(a => `
      <div class="tag tag-teal" style="display:flex; justify-content:space-between; align-items:center; padding: 6px 12px; border-radius: 6px;">
        <span>${a.text}</span>
        <button onclick="removeCustomActionFromUI(${a.id})" style="background:none; border:none; cursor:pointer; color:var(--text-teal); display:flex; padding:2px; opacity:0.7;">
          <svg style="width:14px;height:14px;" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `).join("");
  }

  function initLoggerForm() {
    populateDiaryForm();

    DOM.saveLogsBtn && DOM.saveLogsBtn.addEventListener("click", () => {
      const parse = el => { const v = parseFloat(el && el.value); return isNaN(v) ? undefined : v; };
      const updatedLogs = {
        drivingMiles: parse(DOM.logDriving),
        transitMiles: parse(DOM.logTransit),
        flightsMiles: parse(DOM.logFlights),
        electricityKwh: parse(DOM.logElectricity),
        greenEnergyPct: parse(DOM.logGreenEnergy),
        meatMeals: parse(DOM.logMeatMeals),
        vegMeals: parse(DOM.logVegMeals),
        veganMeals: parse(DOM.logVeganMeals),
        shoppingSpend: parse(DOM.logShopping),
        waterGallons: parse(DOM.logWater),
        wasteKg: parse(DOM.logWaste),
        recycledPct: parse(DOM.logRecycled),
        compostedPct: parse(DOM.logComposted)
      };

      // Remove undefined
      Object.keys(updatedLogs).forEach(k => updatedLogs[k] === undefined && delete updatedLogs[k]);
      Storage.saveLogs(updatedLogs);
      State.logs = { ...State.logs, ...updatedLogs };

      const today = new Date().toISOString().split("T")[0];
      State.streak = Gamification.updateStreak(State.streak, today);
      Storage.saveStreak(State.streak);

      addXp(50, "Activities saved! Your impact has been updated.");
      updateDashboard();
      refreshProfile();
      showToast("Done! Your footprint has been recalculated. ✅", "success");
    });

    DOM.applyDefaultsBtn && DOM.applyDefaultsBtn.addEventListener("click", () => {
      const d = ReferenceData.defaults;
      DOM.logDriving.value = d.drivingMiles;
      DOM.logTransit.value = d.transitMiles;
      DOM.logFlights.value = d.flightsMiles;
      DOM.logElectricity.value = d.electricityKwh;
      DOM.logGreenEnergy.value = d.greenEnergyPct;
      DOM.logMeatMeals.value = d.meatMeals;
      DOM.logVegMeals.value = d.vegMeals;
      DOM.logVeganMeals.value = d.veganMeals;
      DOM.logShopping.value = d.shoppingSpend;
      DOM.logWater.value = d.waterGallons;
      DOM.logWaste.value = d.wasteKg;
      DOM.logRecycled.value = d.recycledPct;
      DOM.logComposted.value = d.compostedPct;
      showToast("Typical values filled in — feel free to adjust them to match your habits!", "info");
    });

    DOM.quickTransit && DOM.quickTransit.addEventListener("click", () => {
      State.logs.transitMiles = (State.logs.transitMiles || 0) + 15;
      State.logs.drivingMiles = Math.max(0, (State.logs.drivingMiles || 0) - 15);
      Storage.saveLogs(State.logs); populateDiaryForm(); updateDashboard();
      addXp(20, "Great choice — used transit instead of driving");
    });

    DOM.quickMeal && DOM.quickMeal.addEventListener("click", () => {
      State.logs.meatMeals = Math.max(0, (State.logs.meatMeals || 0) - 1);
      State.logs.veganMeals = (State.logs.veganMeals || 0) + 1;
      Storage.saveLogs(State.logs); populateDiaryForm(); updateDashboard();
      addXp(20, "Awesome — plant-based meal logged!");
    });

    DOM.quickCompost && DOM.quickCompost.addEventListener("click", () => {
      State.logs.compostedPct = Math.min(100, (State.logs.compostedPct || 0) + 10);
      Storage.saveLogs(State.logs); populateDiaryForm(); updateDashboard();
      addXp(20, "Composting — great for the soil and planet!");
    });

    function handleCustomActionAdd() {
      const text = DOM.customActionInput.value.trim();
      if (!text) return;
      Storage.addCustomAction(text);
      DOM.customActionInput.value = "";
      renderCustomActions();
      addXp(20, `Awesome! You logged: "${text}"`);
    }

    if (DOM.customActionAddBtn) {
      DOM.customActionAddBtn.addEventListener("click", handleCustomActionAdd);
    }
    if (DOM.customActionInput) {
      DOM.customActionInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleCustomActionAdd();
      });
    }

    renderCustomActions();
  } // end initLogger

  // ── Simulator ─────────────────────────────────────────────

  function runSimulation() {
    const drivePct = parseFloat(DOM.simDrivingSlider.value);
    const energyPct = parseFloat(DOM.simEnergySlider.value);
    const foodPct = parseFloat(DOM.simFoodSlider.value);
    const shopPct = parseFloat(DOM.simShoppingSlider.value);

    DOM.simDrivingVal.textContent = `${drivePct}%`;
    DOM.simEnergyVal.textContent = `${energyPct}%`;
    DOM.simFoodVal.textContent = `${foodPct}%`;
    DOM.simShoppingVal.textContent = `${shopPct}%`;

    const sim = Simulator.simulate(State.logs, {
      drivingReductionPct: drivePct,
      transitIncreaseMiles: Math.round(drivePct * 0.4),
      greenEnergyPct: energyPct,
      meatMealReductionPct: foodPct,
      shoppingReductionPct: shopPct
    }, State.selectedRegion);

    DOM.simSavedCo2.textContent = sim.savedKg > 0 ? sim.savedKg.toLocaleString() : "0";
    DOM.simSavedPct.textContent = `${sim.savedPct}%`;

    const maxV = Math.max(sim.baselineTotal, sim.simulatedTotal, 10);
    const baseH = Math.round((sim.baselineTotal / maxV) * 75);
    const projH = Math.round((sim.simulatedTotal / maxV) * 75);

    DOM.simBarBaseline.style.height = `${baseH}%`;
    DOM.simBarBaselineLbl.textContent = `${Math.round(sim.baselineTotal)} kg`;
    DOM.simBarProjected.style.height = `${projH}%`;
    DOM.simBarProjectedLbl.textContent = `${Math.round(sim.simulatedTotal)} kg`;

    if (sim.savedKg > 0) {
      DOM.simNarrativeText.innerHTML = `Saves <strong>${sim.savedKg} kg of carbon per month</strong> — like planting ${sim.equivalents.treeMonths} trees for a month!`;
      DOM.simFullNarrative.innerHTML = `With these changes, your footprint drops to <strong>${Math.round(sim.simulatedTotal)} kg/month</strong>, which is <strong>${sim.savedPct}% less</strong> than your current ${Math.round(sim.baselineTotal)} kg. Over a year, that's <strong>${Math.round(sim.savedKg * 12)} kg of carbon avoided</strong> — like taking your car off the road for ${Math.round(sim.equivalents.carMiles / 1000)} months!`;
      if (!State.stats.simulationPerformed) {
        State.stats.simulationPerformed = true;
        Storage.saveStats(State.stats);
        addXp(100, "First simulation done — great exploring!");
      }
    } else {
      DOM.simNarrativeText.innerHTML = "Move the sliders above to see your potential savings.";
      DOM.simFullNarrative.innerHTML = "Try sliding 'Drive Less' or 'Eat Less Meat' to see how it changes things.";
    }
  }

  function initSimulator() {
    [DOM.simDrivingSlider, DOM.simEnergySlider, DOM.simFoodSlider, DOM.simShoppingSlider].forEach(s => {
      s && s.addEventListener("input", runSimulation);
    });
    if (DOM.simEnergySlider) DOM.simEnergySlider.value = State.logs.greenEnergyPct || 20;
  }

  // ── Coach Chat ────────────────────────────────────────────
  function appendMsg(role, html) {
    const div = document.createElement("div");
    div.className = `msg-bubble msg-${role}`;
    div.innerHTML = html;
    DOM.coachLog.appendChild(div);
    DOM.coachLog.scrollTop = DOM.coachLog.scrollHeight;
  }

  function handleCoachSubmit() {
    const query = DOM.coachInput.value.trim();
    if (!query) return;
    appendMsg("user", `<p>${query}</p>`);
    DOM.coachInput.value = "";

    const typingEl = document.createElement("div");
    typingEl.className = "typing-indicator";
    typingEl.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
    DOM.coachLog.appendChild(typingEl);
    DOM.coachLog.scrollTop = DOM.coachLog.scrollHeight;

    const results = Calculator.calculate(State.logs, State.selectedRegion);
    setTimeout(() => {
      typingEl.remove();
      appendMsg("coach", Coach.respond(query, results));
    }, 1100);
  }

  function initCoach() {
    DOM.coachForm && DOM.coachForm.addEventListener("submit", handleCoachSubmit);
    $$(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const p = chip.getAttribute("data-prompt");
        if (p) { DOM.coachInput.value = p; handleCoachSubmit(); }
      });
    });
  }

  // ── Rewards Tab ───────────────────────────────────────────
  // Badge icon map (SVG paths)
  const BADGE_ICONS = {
    transit_starter: `<path d="M8 6v6m0 0v6m0-6h6m-6 0H3"/>`,
    carbon_cutter: `<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>`,
    energy_saver: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`,
    green_eater: `<path d="M17 8C8 10 5.9 16.17 3.82 19.67a1 1 0 00.93 1.46h12.5a1 1 0 00.95-1.31C17.5 18.42 16 16 16 12c0 0 2-1 2-4"/>`,
    waste_warrior: `<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>`,
    simulation_genius: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`
  };

  function renderRewardsTab() {
    const results = Calculator.calculate(State.logs, State.selectedRegion);
    const unlocked = Gamification.checkBadges(State.logs, results, State.stats.simulationPerformed || false);
    const claimed = State.stats.claimedChallenges || [];

    // ── Badges
    DOM.badgesGrid.innerHTML = "";
    DOM.badgeCount.textContent = `${unlocked.length} / ${ReferenceData.badges.length} Earned`;
    ReferenceData.badges.forEach(b => {
      const isUnlocked = unlocked.includes(b.id);
      const el = document.createElement("div");
      el.className = `badge-card${isUnlocked ? "" : " locked"}`;
      el.innerHTML = `
        <div class="badge-icon">
          <svg viewBox="0 0 24 24">${BADGE_ICONS[b.id] || '<circle cx="12" cy="12" r="5"/>'}</svg>
        </div>
        <span class="badge-name">${b.title}</span>
        <span class="badge-desc">${b.desc}</span>
      `;
      DOM.badgesGrid.appendChild(el);
    });

    // ── Challenges
    DOM.challengesList.innerHTML = "";
    ReferenceData.challenges.forEach(c => {
      let current = 0;
      if (c.id === "chal_transit_warrior") current = State.logs.transitMiles || 0;
      if (c.id === "chal_meatless_march") current = (State.logs.vegMeals || 0) + (State.logs.veganMeals || 0);
      if (c.id === "chal_zero_waste") current = (State.logs.recycledPct || 0) + (State.logs.compostedPct || 0);

      const pct = Math.min(100, Math.round((current / c.target) * 100));
      const isComplete = current >= c.target;
      const isClaimed = claimed.includes(c.id);

      let action = `<span class="tag tag-blue" style="font-size:10px;">${pct}% Progress</span>`;
      if (isComplete && !isClaimed) {
        action = `<button class="btn btn-primary btn-sm claim-quest-btn" data-id="${c.id}">Claim ${c.xpReward} XP</button>`;
      } else if (isClaimed) {
        action = `<span class="tag tag-green">Claimed</span>`;
      }

      const el = document.createElement("div");
      el.className = "quest-item";
      el.innerHTML = `
        <div class="quest-row">
          <span class="quest-name">${c.title}</span>
          ${action}
        </div>
        <span class="quest-desc">${c.description} (${current}/${c.target} ${c.unit})</span>
        <div class="quest-track"><div class="quest-fill" style="width:${pct}%;"></div></div>
      `;
      DOM.challengesList.appendChild(el);
    });

    $$(".claim-quest-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (!State.stats.claimedChallenges) State.stats.claimedChallenges = [];
        State.stats.claimedChallenges.push(id);
        Storage.saveStats(State.stats);
        const quest = ReferenceData.challenges.find(c => c.id === id);
        addXp(quest ? quest.xpReward : 150, `Challenge completed: ${quest ? quest.title : id}`);
        renderRewardsTab();
      });
    });

    // ── Offsets
    DOM.offsetsList.innerHTML = "";
    const offsetIcons = {
      off_amazon_reforest: `<path d="M17 8C8 10 5.9 16.17 3.82 19.67a1 1 0 00.93 1.46h12.5a1 1 0 00.95-1.31C17.5 18.42 16 16 16 12c0 0 2-1 2-4"/><path d="M7 4c4 0 8 2 8 2"/>`,
      off_india_wind: `<path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1010 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>`,
      off_blue_carbon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`
    };
    ReferenceData.offsets.forEach(off => {
      const el = document.createElement("div");
      el.className = "offset-card";
      el.innerHTML = `
        <div class="offset-hero">
          <svg viewBox="0 0 24 24">${offsetIcons[off.id] || '<circle cx="12" cy="12" r="5"/>'}</svg>
          <span class="offset-standard-tag">${off.standard.split(" ")[0]}</span>
        </div>
        <div class="offset-body">
          <span class="offset-title">${off.title}</span>
          <span class="tag tag-teal" style="align-self:flex-start; font-size:10px;">${off.type}</span>
          <p class="offset-desc">${off.description}</p>
          <div class="offset-footer">
            <span class="offset-cost">$${off.costPerTon} <span>per metric ton CO₂</span></span>
            <button class="btn btn-primary btn-sm offset-buy-btn" data-id="${off.id}" data-cost="${off.costPerTon}">View Project ↗</button>
          </div>
        </div>
      `;
      DOM.offsetsList.appendChild(el);
    });

    $$(".offset-buy-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const off = ReferenceData.offsets.find(o => o.id === btn.getAttribute("data-id"));
        if (off && off.url) {
          window.open(off.url, '_blank');
        }
        addXp(200, `Supported: ${off ? off.title : "offset project"}`);
        showToast(`Thank you for checking out ${off ? off.title : "this project"}. Completing an offset there will help neutralise your footprint.`, "success");
      });
    });
  }

  // ── Settings Modal ────────────────────────────────────────
  function initSettings() {
    const openModal = () => { DOM.settingsModal.style.display = "flex"; };
    const closeModal = () => { DOM.settingsModal.style.display = "none"; };

    DOM.openSettingsBtn && DOM.openSettingsBtn.addEventListener("click", openModal);
    DOM.openSettingsBtn2 && DOM.openSettingsBtn2.addEventListener("click", openModal);
    DOM.closeSettingsBtn && DOM.closeSettingsBtn.addEventListener("click", closeModal);
    DOM.settingsModal && DOM.settingsModal.addEventListener("click", e => { if (e.target === DOM.settingsModal) closeModal(); });

    DOM.settingsRegion && DOM.settingsRegion.addEventListener("change", () => {
      State.selectedRegion = DOM.settingsRegion.value;
      if (DOM.regionSelect) DOM.regionSelect.value = State.selectedRegion;
      updateDashboard();
      showToast(`Switched to ${ReferenceData.regions[State.selectedRegion].name} emission factors.`, "info");
    });

    DOM.exportBtn && DOM.exportBtn.addEventListener("click", () => {
      Storage.exportUserData();
      showToast("Data exported as JSON.", "success");
    });

    DOM.purgeBtn && DOM.purgeBtn.addEventListener("click", () => {
      if (confirm("This will delete all your logged activities and progress. Are you sure? This can't be undone.")) {
        Storage.purgeUserData();
        State.logs = Storage.getLogs();
        State.stats = Storage.getStats();
        State.streak = Storage.getStreak();
        populateDiaryForm();
        updateDashboard();
        refreshProfile();
        closeModal();
        showToast("All data has been reset. Fresh start!", "info");
      }
    });
  }

  // Header region select
  function initRegionSelect() {
    DOM.regionSelect && DOM.regionSelect.addEventListener("change", () => {
      State.selectedRegion = DOM.regionSelect.value;
      if (DOM.settingsRegion) DOM.settingsRegion.value = State.selectedRegion;
      updateDashboard();
    });
  }

  // ── Accordion & Steppers ──────────────────────────────────
  window.stepValue = function(id, step) {
    const el = document.getElementById(id);
    if (!el) return;
    const current = parseFloat(el.value) || 0;
    const min = parseFloat(el.min) || 0;
    const max = parseFloat(el.max) || Infinity;
    let next = current + step;
    if (next < min) next = min;
    if (next > max) next = max;
    el.value = next;
  };

  function initAccordionsAndSliders() {
    // Accordion Toggle Logic
    const accItems = document.querySelectorAll(".accordion-item");
    accItems.forEach(item => {
      const header = item.querySelector(".accordion-header");
      if (header) {
        header.addEventListener("click", () => {
          // Close others
          accItems.forEach(other => {
            if (other !== item) other.classList.remove("active");
          });
          // Toggle this
          item.classList.toggle("active");
        });
      }
    });

    // Slider <-> Number Sync Logic
    const sliderGroups = document.querySelectorAll(".slider-input-group");
    sliderGroups.forEach(group => {
      const slider = group.querySelector('input[type="range"]');
      const numInput = group.querySelector('input[type="number"]');
      if (slider && numInput) {
        // Init
        slider.value = numInput.value || 0;
        
        slider.addEventListener("input", (e) => {
          numInput.value = e.target.value;
        });
        
        numInput.addEventListener("input", (e) => {
          let val = parseFloat(e.target.value) || 0;
          if (val > parseFloat(slider.max)) slider.max = val; // Auto-expand slider max if user types huge number
          slider.value = val;
        });
      }
    });
  }

  // ── Instagram Story Export ────────────────────────────────
  function initStoryExport() {
    const modal = document.getElementById("story-modal");
    const openBtn = document.getElementById("open-story-btn");
    const closeBtn = document.getElementById("close-story-btn");
    const downloadBtn = document.getElementById("download-story-btn");
    const monthSelect = document.getElementById("story-month-select");
    const monthDisplay = document.getElementById("story-month-display");
    const canvasEl = document.getElementById("story-canvas");

    if (!modal || !openBtn) return;

    // Set current month
    const currentMonthIndex = new Date().getMonth();
    if (monthSelect.options[currentMonthIndex]) {
      monthSelect.selectedIndex = currentMonthIndex;
    }

    const populateStory = () => {
      monthDisplay.textContent = `My ${monthSelect.value} Footprint`;

      const results = Calculator.calculate(State.logs, State.selectedRegion);
      document.getElementById("story-score-val").textContent = results.total.toLocaleString(undefined, { maximumFractionDigits: 0 });
      
      const benchmark = ReferenceData.benchmarks[State.selectedRegion] || ReferenceData.benchmarks.US;
      let rating = '"High impact. Time to reconstruct your habits."';
      if (results.total <= benchmark.target) rating = '"Excellent. Top 10% performance. Keep building the future."';
      else if (results.total <= benchmark.cohort) rating = '"Good. Below average impact. Solid foundations."';
      else if (results.total <= benchmark.average) rating = '"Average. Room to improve your environmental structure."';
      document.getElementById("story-grade-val").textContent = rating;

      const setBar = (id, val) => {
        const pct = Math.min(100, (val / Math.max(results.total, 1)) * 100);
        const el = document.getElementById(id);
        if (el) el.style.width = `${pct}%`;
      };
      
      setBar("story-bar-transport", results.breakdown.transport);
      setBar("story-bar-energy", results.breakdown.energy);
      setBar("story-bar-food", results.breakdown.food);
      setBar("story-bar-shopping", results.breakdown.shopping);
    };

    monthSelect.addEventListener("change", () => {
      monthDisplay.textContent = `My ${monthSelect.value} Footprint`;
    });

    openBtn.addEventListener("click", () => {
      populateStory();
      modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    downloadBtn.addEventListener("click", async () => {
      const originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = "Generating Image...";
      downloadBtn.disabled = true;

      try {
        const canvas = await window.html2canvas(canvasEl, {
          scale: 3, // High resolution
          useCORS: true,
          backgroundColor: null
        });
        
        const link = document.createElement("a");
        link.download = `Ecolytics-${monthSelect.value}-Story.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        showToast("Story image downloaded! Ready for Instagram.", "success");
      } catch (err) {
        console.error("Failed to generate image", err);
        showToast("Failed to generate image.", "danger");
      } finally {
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
      }
    });
  }

  // ── Bootstrap ─────────────────────────────────────────────
  function init() {
    initRouter();
    initLoggerForm();
    initAccordionsAndSliders();
    initSimulator();
    initCoach();
    initSettings();
    initRegionSelect();
    initStoryExport();
    refreshProfile();
    updateDashboard();
  }

  init();
});
