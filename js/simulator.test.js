import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

beforeAll(() => {
  global.window = global;
  
  // Load data.js
  const dataCode = fs.readFileSync(path.resolve(__dirname, 'data.js'), 'utf8');
  eval(dataCode);

  // Load calculator.js
  const calcCode = fs.readFileSync(path.resolve(__dirname, 'calculator.js'), 'utf8');
  eval(calcCode);

  // Load simulator.js
  const simCode = fs.readFileSync(path.resolve(__dirname, 'simulator.js'), 'utf8');
  eval(simCode);
});

describe('What-If Simulation Engine', () => {
  it('should run simulation correctly', () => {
    const baseline = {
      drivingMiles: 500,
      transitMiles: 100,
      greenEnergyPct: 10,
      meatMeals: 10,
      vegMeals: 10,
      veganMeals: 5,
      shoppingSpend: 200
    };

    const adjustments = {
      drivingReductionPct: 50,
      transitIncreaseMiles: 20,
      greenEnergyPct: 100,
      meatMealReductionPct: 50,
      shoppingReductionPct: 20
    };

    const results = window.Simulator.simulate(baseline, adjustments, 'US');
    expect(results.baselineTotal).toBeGreaterThan(0);
    expect(results.simulatedTotal).toBeGreaterThan(0);
    expect(results.savedKg).toBeGreaterThan(0);
    expect(results.savedPct).toBeGreaterThan(0);
    expect(results.equivalents).toBeDefined();
  });
});
