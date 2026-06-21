// Reference Data & Emission Factors for Ecolytics AI
const ReferenceData = {
  // Emission Factors (kg CO2e per unit)
  regions: {
    US: {
      name: "United States (EPA)",
      electricity: 0.38,    // per kWh
      gasoline: 0.35,       // per mile driving
      transit: 0.08,        // per mile transit
      flights: 0.18,        // per mile flying
      foodMeat: 6.2,        // per meat meal
      foodVeg: 1.4,         // per vegetarian meal
      foodVegan: 0.6,       // per vegan meal
      shopping: 0.12,       // per USD spent
      water: 0.003,         // per gallon
      wasteLandfill: 1.2,   // per kg waste
      wasteRecycled: 0.1,   // per kg recycled
      wasteCompost: 0.05    // per kg compost
    },
    IN: {
      name: "India (MoEFCC)",
      electricity: 0.71,    // per kWh
      gasoline: 0.35,       // per mile driving
      transit: 0.04,        // per mile transit
      flights: 0.16,        // per mile flying
      foodMeat: 5.5,        // per meat meal
      foodVeg: 1.2,         // per vegetarian meal
      foodVegan: 0.5,       // per vegan meal
      shopping: 0.08,       // per USD equivalent spent
      water: 0.002,         // per gallon
      wasteLandfill: 0.9,   // per kg waste
      wasteRecycled: 0.08,  // per kg recycled
      wasteCompost: 0.04    // per kg compost
    },
    GL: {
      name: "Global Average (IPCC)",
      electricity: 0.45,    // per kWh
      gasoline: 0.32,       // per mile driving
      transit: 0.07,        // per mile transit
      flights: 0.17,        // per mile flying
      foodMeat: 6.0,        // per meat meal
      foodVeg: 1.35,        // per vegetarian meal
      foodVegan: 0.55,      // per vegan meal
      shopping: 0.11,       // per USD equivalent spent
      water: 0.0025,        // per gallon
      wasteLandfill: 1.1,   // per kg waste
      wasteRecycled: 0.09,  // per kg recycled
      wasteCompost: 0.045   // per kg compost
    }
  },

  // AI-generated defaults for blank entries (monthly estimations)
  defaults: {
    drivingMiles: 400,
    transitMiles: 120,
    flightsMiles: 150,
    electricityKwh: 300,
    greenEnergyPct: 10,  // 10% renewable electricity
    meatMeals: 12,       // out of ~30 main meals in a month's category tracking
    vegMeals: 12,
    veganMeals: 6,
    shoppingSpend: 250,
    waterGallons: 1200,
    wasteKg: 20,
    recycledPct: 30,
    compostedPct: 10
  },

  // Cohort & Benchmark Baselines (kg CO2e per month)
  benchmarks: {
    US: { average: 1350, cohort: 1100, target: 450 },
    IN: { average: 160, cohort: 140, target: 120 },
    GL: { average: 400, cohort: 350, target: 200 }
  },

  // Behavioral Recommendations library
  recommendations: [
    {
      id: "rec_green_electricity",
      title: "Switch to 100% Renewable Electricity",
      category: "energy",
      description: "Enroll in your utility's green power plan or switch to a community solar subscription.",
      impactScore: 9,     // Carbon reduction impact (1-10)
      savingsScore: 3,    // Financial savings impact (1-10)
      frictionScore: 2,   // Effort/friction (1-10, lower is easier)
      impactDescription: "Reduces electricity emissions to zero",
      savingsDescription: "Slight premium or flat rate depending on provider",
      actionText: "Switch to Green Energy Plan"
    },
    {
      id: "rec_led_bulbs",
      title: "Replace Old Bulbs with LEDs",
      category: "energy",
      description: "Upgrade remaining incandescent or halogen bulbs to smart energy-saving LED bulbs.",
      impactScore: 3,
      savingsScore: 7,
      frictionScore: 1,
      impactDescription: "Uses 80% less lighting energy",
      savingsDescription: "Saves up to $80/year in electric bills",
      actionText: "Install LED Bulbs"
    },
    {
      id: "rec_meatless_monday",
      title: "Adopt Meatless Mondays",
      category: "food",
      description: "Replace beef, lamb, and pork with plant-based proteins at least one day per week.",
      impactScore: 5,
      savingsScore: 6,
      frictionScore: 3,
      impactDescription: "Saves ~15kg CO2e per week",
      savingsDescription: "Reduces grocery spending",
      actionText: "Commit to Meatless Mondays"
    },
    {
      id: "rec_commute_transit",
      title: "Take Transit or Cycle to Commute",
      category: "transportation",
      description: "Choose walking, biking, or public transit for commuting instead of driving alone.",
      impactScore: 8,
      savingsScore: 8,
      frictionScore: 5,
      impactDescription: "Cuts commuting footprint by 60-80%",
      savingsDescription: "Saves gasoline, parking fees, and vehicle wear",
      actionText: "Use Transit / Bike"
    },
    {
      id: "rec_line_dry",
      title: "Line-Dry Your Laundry",
      category: "energy",
      description: "Dry clothes on a drying rack or clothesline instead of running the electric dryer.",
      impactScore: 4,
      savingsScore: 5,
      frictionScore: 2,
      impactDescription: "Saves ~3kg CO2e per laundry load",
      savingsDescription: "Reduces wear on clothes & electric bills",
      actionText: "Line-dry Next Load"
    },
    {
      id: "rec_reduce_shopping",
      title: "Declutter & Reduce Fast Fashion Purchases",
      category: "shopping",
      description: "Buy high-quality, durable goods or opt for thrift stores instead of buying new apparel.",
      impactScore: 6,
      savingsScore: 9,
      frictionScore: 4,
      impactDescription: "Cuts lifecycle retail footprint",
      savingsDescription: "Saves substantial money monthly",
      actionText: "Skip a Non-essential Purchase"
    },
    {
      id: "rec_low_flow_shower",
      title: "Install a Low-Flow Showerhead",
      category: "water",
      description: "Upgrade to a certified low-flow showerhead to reduce water and hot water heating energy.",
      impactScore: 3,
      savingsScore: 5,
      frictionScore: 2,
      impactDescription: "Reduces water flow by 30% without losing pressure",
      savingsDescription: "Saves water heating energy and utility fees",
      actionText: "Install Low-Flow Head"
    },
    {
      id: "rec_start_compost",
      title: "Start a Home Composting Bin",
      category: "waste",
      description: "Separate organic waste and compost it to prevent methane emissions in landfills.",
      impactScore: 4,
      savingsScore: 2,
      frictionScore: 4,
      impactDescription: "Halves organic waste greenhouse gases",
      savingsDescription: "Produces rich, free organic soil for garden",
      actionText: "Set Up Compost Bin"
    }
  ],

  // Verification-standard Offset Projects
  offsets: [
    {
      id: "off_amazon_reforest",
      title: "Amazon Basin Verified Reforestation",
      standard: "Verra (VCS) Project #1462",
      costPerTon: 15,
      type: "Forestry & Land Use",
      description: "Restores native tropical rainforest on degraded cattle pasture lands in Brazil, sequestering carbon and supporting biodiversity.",
      image: "amazon_reforest.jpg",
      url: "https://www.wren.co/projects"
    },
    {
      id: "off_india_wind",
      title: "Rajasthan Wind Energy Corridor",
      standard: "Gold Standard Project #4892",
      costPerTon: 10,
      type: "Renewable Energy",
      description: "Displaces coal-powered grid electricity in Northwest India by installing modern wind turbine arrays.",
      image: "india_wind.jpg",
      url: "https://marketplace.goldstandard.org/collections/projects"
    },
    {
      id: "off_blue_carbon",
      title: "Blue Carbon Mangrove Restoration",
      standard: "Verra (VCS) & CCB Standards",
      costPerTon: 24,
      type: "Wetlands & Marine",
      description: "Protects and replants critical coastal mangrove ecosystems in Kenya, sequestering up to 10x more carbon than land forests.",
      image: "blue_carbon.jpg",
      url: "https://www.wren.co/projects"
    }
  ],

  // Gamification Quests / Challenges
  challenges: [
    {
      id: "chal_transit_warrior",
      title: "Transit Warrior",
      description: "Log at least 30 miles of transit travel this week instead of driving.",
      target: 30,
      unit: "miles",
      xpReward: 150,
      badgeReward: "Transit Starter"
    },
    {
      id: "chal_meatless_march",
      title: "Plant-Powered Streak",
      description: "Log 10 meat-free meals (veg/vegan) in your activity diary.",
      target: 10,
      unit: "meals",
      xpReward: 200,
      badgeReward: "Green Eater"
    },
    {
      id: "chal_zero_waste",
      title: "Zero Waste Champion",
      description: "Reach over 50% recycling and composting rate for your waste entries.",
      target: 50,
      unit: "%",
      xpReward: 250,
      badgeReward: "Waste Warrior"
    }
  ],

  // Badge list with milestones
  badges: [
    { id: "transit_starter", title: "Transit Starter", icon: "🚇", desc: "Logged public transit usage" },
    { id: "carbon_cutter", title: "Carbon Cutter", icon: "✂️", desc: "Cut footprint by 20% compared to average" },
    { id: "energy_saver", title: "Energy Saver", icon: "💡", desc: "Adopted renewable energy option" },
    { id: "green_eater", title: "Green Eater", icon: "🥗", desc: "Completed plant-powered challenge" },
    { id: "waste_warrior", title: "Waste Warrior", icon: "♻️", desc: "Achieved composting milestone" },
    { id: "simulation_genius", title: "Eco forecaster", icon: "🔮", desc: "Completed a What-If carbon simulation" }
  ]
};

// Export to window/module
window.ReferenceData = ReferenceData;
