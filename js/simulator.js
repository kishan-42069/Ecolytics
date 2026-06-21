// What-If Simulation Engine Subsystem
const Simulator = {
  /**
   * Forecasts the carbon footprint impact based on slider scenario values.
   * @param {Object} baselineLogs - The user's actual log baseline.
   * @param {Object} adjustments - The adjusted scenario logs.
   * @param {string} regionCode - Region code.
   * @returns {Object} Comparison between baseline and simulated values.
   */
  simulate: function(baselineLogs, adjustments, regionCode = 'US') {
    const baselineResults = Calculator.calculate(baselineLogs, regionCode);
    
    // Adjust base log data based on scenario sliders
    const simulatedLogs = { ...baselineLogs };
    
    if (adjustments.drivingReductionPct !== undefined) {
      const origDriving = baselineLogs.drivingMiles || ReferenceData.defaults.drivingMiles;
      simulatedLogs.drivingMiles = Math.max(0, origDriving * (1 - adjustments.drivingReductionPct / 100));
    }
    if (adjustments.transitIncreaseMiles !== undefined) {
      const origTransit = baselineLogs.transitMiles || ReferenceData.defaults.transitMiles;
      simulatedLogs.transitMiles = origTransit + adjustments.transitIncreaseMiles;
    }
    if (adjustments.greenEnergyPct !== undefined) {
      simulatedLogs.greenEnergyPct = adjustments.greenEnergyPct;
    }
    if (adjustments.meatMealReductionPct !== undefined) {
      const origMeat = baselineLogs.meatMeals || ReferenceData.defaults.meatMeals;
      const reduction = Math.round(origMeat * (adjustments.meatMealReductionPct / 100));
      simulatedLogs.meatMeals = Math.max(0, origMeat - reduction);
      simulatedLogs.vegMeals = (baselineLogs.vegMeals || ReferenceData.defaults.vegMeals) + Math.round(reduction * 0.6);
      simulatedLogs.veganMeals = (baselineLogs.veganMeals || ReferenceData.defaults.veganMeals) + Math.round(reduction * 0.4);
    }
    if (adjustments.shoppingReductionPct !== undefined) {
      const origShopping = baselineLogs.shoppingSpend || ReferenceData.defaults.shoppingSpend;
      simulatedLogs.shoppingSpend = Math.max(0, origShopping * (1 - adjustments.shoppingReductionPct / 100));
    }

    const simulatedResults = Calculator.calculate(simulatedLogs, regionCode);
    const co2Saved = Math.round((baselineResults.total - simulatedResults.total) * 10) / 10;
    const pctSaved = baselineResults.total > 0 ? Math.round((co2Saved / baselineResults.total) * 100) : 0;

    return {
      baselineTotal: baselineResults.total,
      simulatedTotal: simulatedResults.total,
      baselineBreakdown: baselineResults.breakdown,
      simulatedBreakdown: simulatedResults.breakdown,
      savedKg: co2Saved,
      savedPct: pctSaved,
      equivalents: Calculator.getEquivalents(co2Saved > 0 ? co2Saved : 0)
    };
  }
};

window.Simulator = Simulator;
