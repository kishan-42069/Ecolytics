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
});

describe('Carbon Footprint Calculator Engine', () => {
  it('should calculate with defaults when logs are empty', () => {
    const results = window.Calculator.calculate({});
    expect(results).toBeDefined();
    expect(results.total).toBeGreaterThan(0);
    expect(results.region).toBe('US');
    expect(results.equivalents).toBeDefined();
  });

  it('should correctly calculate emissions for specific inputs', () => {
    const logs = {
      drivingMiles: 100,
      transitMiles: 50,
      flightsMiles: 200,
      electricityKwh: 150,
      greenEnergyPct: 50,
      meatMeals: 4,
      vegMeals: 10,
      veganMeals: 16,
      shoppingSpend: 80,
      waterGallons: 300,
      wasteKg: 5,
      recycledPct: 40,
      compostedPct: 20
    };

    const results = window.Calculator.calculate(logs, 'US');
    
    // Check breakdown calculations
    const factors = window.ReferenceData.regions.US;
    const expectedTransport = (100 * factors.gasoline) + (50 * factors.transit) + (200 * factors.flights);
    expect(results.breakdown.transportation).toBe(Math.round(expectedTransport * 10) / 10);
    
    const expectedEnergy = 150 * (1 - 0.5) * factors.electricity;
    expect(results.breakdown.energy).toBe(Math.round(expectedEnergy * 10) / 10);

    const expectedFood = (4 * factors.foodMeat) + (10 * factors.foodVeg) + (16 * factors.foodVegan);
    expect(results.breakdown.food).toBe(Math.round(expectedFood * 10) / 10);

    expect(results.breakdown.shopping).toBe(Math.round((80 * factors.shopping) * 10) / 10);
    expect(results.breakdown.water).toBe(Math.round((300 * factors.water) * 10) / 10);
    
    const expectedLandfillPct = 100 - 40 - 20;
    const expectedWaste = 5 * (
      ((expectedLandfillPct / 100) * factors.wasteLandfill) +
      ((40 / 100) * factors.wasteRecycled) +
      ((20 / 100) * factors.wasteCompost)
    );
    expect(results.breakdown.waste).toBe(Math.round(expectedWaste * 10) / 10);
  });

  it('should support different regions', () => {
    const logs = { drivingMiles: 100 };
    const resultsUS = window.Calculator.calculate(logs, 'US');
    const resultsIN = window.Calculator.calculate(logs, 'IN');
    
    expect(resultsUS.region).toBe('US');
    expect(resultsIN.region).toBe('IN');
  });

  it('should generate equivalents correctly', () => {
    const equivs = window.Calculator.getEquivalents(100);
    expect(equivs.gasolineGallons).toBe(Math.round((100 / 8.887) * 10) / 10);
    expect(equivs.smartphoneCharges).toBe(Math.round(100 / 0.008));
    expect(equivs.treeMonths).toBe(Math.round((100 / 1.83) * 10) / 10);
    expect(equivs.carMiles).toBe(Math.round(100 / 0.35));
  });
});
