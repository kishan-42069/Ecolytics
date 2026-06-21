// Gamification and Leveling Subsystem
const Gamification = {
  /**
   * Calculates the user's level and progression based on total XP.
   * @param {number} xp - User total XP.
   * @returns {Object} Level progress metrics.
   */
  getLevelInfo: function(xp) {
    const xpPerLevel = 500;
    const level = Math.floor(xp / xpPerLevel) + 1;
    const currentLevelXp = xp % xpPerLevel;
    const pct = Math.round((currentLevelXp / xpPerLevel) * 100);
    
    return {
      level,
      xp,
      currentLevelXp,
      xpNeeded: xpPerLevel,
      pctProgress: pct
    };
  },

  /**
   * Scans user stats to determine unlocked badges.
   * @param {Object} logs - User logging data.
   * @param {Object} results - Carbon footprint results (total, region).
   * @param {boolean} simulationPerformed - True if a simulator was run.
   * @returns {Array} List of badge IDs unlocked.
   */
  checkBadges: function(logs, results, simulationPerformed) {
    const unlocked = [];
    const defaults = ReferenceData.defaults;
    
    const resolve = (val, def) => (typeof val === 'number' && !isNaN(val)) ? val : def;

    const driving = resolve(logs.drivingMiles, defaults.drivingMiles);
    const transit = resolve(logs.transitMiles, defaults.transitMiles);
    const greenEnergy = resolve(logs.greenEnergyPct, defaults.greenEnergyPct);
    const meatMeals = resolve(logs.meatMeals, defaults.meatMeals);
    const vegMeals = resolve(logs.vegMeals, defaults.vegMeals);
    const veganMeals = resolve(logs.veganMeals, defaults.veganMeals);
    const recycled = resolve(logs.recycledPct, defaults.recycledPct);
    const composted = resolve(logs.compostedPct, defaults.compostedPct);

    // 1. Transit Starter
    if (transit > 0) {
      unlocked.push("transit_starter");
    }

    // 2. Carbon Cutter (20% lower than average benchmark)
    const benchmark = ReferenceData.benchmarks[results.region] || ReferenceData.benchmarks.US;
    if (results.total <= benchmark.average * 0.8) {
      unlocked.push("carbon_cutter");
    }

    // 3. Energy Saver
    if (greenEnergy >= 50) {
      unlocked.push("energy_saver");
    }

    // 4. Green Eater
    if ((vegMeals + veganMeals) >= 15) {
      unlocked.push("green_eater");
    }

    // 5. Waste Warrior
    if ((recycled + composted) >= 50) {
      unlocked.push("waste_warrior");
    }

    // 6. Simulation Genius
    if (simulationPerformed) {
      unlocked.push("simulation_genius");
    }

    return unlocked;
  },

  /**
   * Computes streak progress and states (including Streak Protection).
   * @param {Object} streakState - Saved streak state { current: number, lastLoggedDate: string, shields: number }.
   * @param {string} todayStr - YYYY-MM-DD representing today.
   * @returns {Object} Updated streak state.
   */
  updateStreak: function(streakState, todayStr) {
    let current = streakState.current || 0;
    let shields = streakState.shields !== undefined ? streakState.shields : 1;
    const lastDate = streakState.lastLoggedDate;

    if (!lastDate) {
      // First log ever
      current = 1;
    } else {
      const last = new Date(lastDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        current += 1;
      } else if (diffDays > 1) {
        // Streak broken
        if (shields > 0) {
          // Shield saves the streak!
          shields -= 1;
          // Maintain current streak, user was shielded!
        } else {
          // No shields left, reset streak
          current = 1;
        }
      }
      // If diffDays === 0, user already logged today, streak unchanged
    }

    return {
      current,
      lastLoggedDate: todayStr,
      shields
    };
  }
};

window.Gamification = Gamification;
