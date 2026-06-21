// Carbon Footprint Calculator Engine
const Calculator = {
  /**
   * Calculates carbon footprint for each category and total emissions in kg CO2e.
   * @param {Object} logs - User logging data (can be partial or complete).
   * @param {string} regionCode - Region code ('US', 'UK', or 'IPCC').
   * @returns {Object} Calculated emission metrics.
   */
  calculate: function(logs, regionCode = 'US') {
    const factors = ReferenceData.regions[regionCode] || ReferenceData.regions.US;
    const defaults = ReferenceData.defaults;
    
    // Resolve values: use logged value if present and valid number, otherwise use defaults
    const resolve = (val, def) => (typeof val === 'number' && !isNaN(val)) ? val : def;

    // 1. Transportation
    const drivingMiles = resolve(logs.drivingMiles, defaults.drivingMiles);
    const transitMiles = resolve(logs.transitMiles, defaults.transitMiles);
    const flightsMiles = resolve(logs.flightsMiles, defaults.flightsMiles);

    const transportEmissions = (drivingMiles * factors.gasoline) +
                               (transitMiles * factors.transit) +
                               (flightsMiles * factors.flights);

    // 2. Home Energy
    const electricityKwh = resolve(logs.electricityKwh, defaults.electricityKwh);
    const greenEnergyPct = resolve(logs.greenEnergyPct, defaults.greenEnergyPct);
    const gridIntensityFactor = factors.electricity;
    
    // Emissions = non-renewable electricity consumption * grid factor
    const energyEmissions = electricityKwh * (1 - (greenEnergyPct / 100)) * gridIntensityFactor;

    // 3. Food Consumption
    const meatMeals = resolve(logs.meatMeals, defaults.meatMeals);
    const vegMeals = resolve(logs.vegMeals, defaults.vegMeals);
    const veganMeals = resolve(logs.veganMeals, defaults.veganMeals);

    const foodEmissions = (meatMeals * factors.foodMeat) +
                          (vegMeals * factors.foodVeg) +
                          (veganMeals * factors.foodVegan);

    // 4. Shopping
    const shoppingSpend = resolve(logs.shoppingSpend, defaults.shoppingSpend);
    const shoppingEmissions = shoppingSpend * factors.shopping;

    // 5. Water Usage
    const waterGallons = resolve(logs.waterGallons, defaults.waterGallons);
    const waterEmissions = waterGallons * factors.water;

    // 6. Waste Management
    const wasteKg = resolve(logs.wasteKg, defaults.wasteKg);
    const recycledPct = resolve(logs.recycledPct, defaults.recycledPct);
    const compostedPct = resolve(logs.compostedPct, defaults.compostedPct);
    
    const landfillPct = Math.max(0, 100 - recycledPct - compostedPct);

    const wasteEmissions = wasteKg * (
      ((landfillPct / 100) * factors.wasteLandfill) +
      ((recycledPct / 100) * factors.wasteRecycled) +
      ((compostedPct / 100) * factors.wasteCompost)
    );

    // Totals
    const breakdown = {
      transportation: Math.round(transportEmissions * 10) / 10,
      energy: Math.round(energyEmissions * 10) / 10,
      food: Math.round(foodEmissions * 10) / 10,
      shopping: Math.round(shoppingEmissions * 10) / 10,
      water: Math.round(waterEmissions * 10) / 10,
      waste: Math.round(wasteEmissions * 10) / 10
    };

    const total = Math.round(
      (breakdown.transportation + breakdown.energy + breakdown.food + breakdown.shopping + breakdown.water + breakdown.waste) * 10
    ) / 10;

    return {
      breakdown,
      total,
      region: regionCode,
      equivalents: this.getEquivalents(total)
    };
  },

  /**
   * Generates interactive/relatable carbon equivalents for a given amount of CO2.
   * @param {number} totalCo2Kg - CO2 emissions in kg.
   * @returns {Object} Key equivalents comparisons.
   */
  getEquivalents: function(totalCo2Kg) {
    return {
      // 1 gallon of gas ~ 8.887 kg CO2
      gasolineGallons: Math.round((totalCo2Kg / 8.887) * 10) / 10,
      // 1 smartphone charge ~ 0.008 kg CO2
      smartphoneCharges: Math.round(totalCo2Kg / 0.008),
      // 1 tree seedlings grown for 10 years absorbs ~22 kg CO2 per year (so ~1.8kg/month)
      treeMonths: Math.round((totalCo2Kg / 1.83) * 10) / 10,
      // 1 mile driven in a typical passenger car ~ 0.35 kg CO2
      carMiles: Math.round(totalCo2Kg / 0.35)
    };
  }
};

window.Calculator = Calculator;
