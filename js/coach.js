// NLP Sustainability Coach Subsystem
const Coach = {
  /**
   * Generates a conversational, personalized response from the AI coach.
   * @param {string} userMessage - User input message.
   * @param {Object} currentStats - Carbon footprint stats (total and breakdown).
   * @returns {string} Coach response formatted in Markdown-friendly HTML.
   */
  respond: function(userMessage, currentStats) {
    const msg = userMessage.toLowerCase().trim();
    const total = currentStats.total;
    const breakdown = currentStats.breakdown;
    
    // Determine largest emission category
    let largestCategory = "transportation";
    let largestVal = 0;
    for (const [cat, val] of Object.entries(breakdown)) {
      if (val > largestVal) {
        largestVal = val;
        largestCategory = cat;
      }
    }

    // Dynamic equivalency string helper
    const makeEquivalentStr = (kg) => {
      const eq = Calculator.getEquivalents(kg);
      return `This is equivalent to 🚗 driving **${eq.carMiles.toLocaleString()} miles** in an average car, 📱 charging **${eq.smartphoneCharges.toLocaleString()} smartphones**, or the carbon sequestered by 🌲 **${eq.treeMonths.toLocaleString()} trees** for one month.`;
    };

    // Keyword Responses
    if (msg.includes("explain") || msg.includes("breakdown") || msg.includes("status") || msg.includes("footprint") || msg.includes("good") || msg.includes("bad") || msg.includes("doing") || msg.includes("score")) {
      return `
        <p>Hey! 👋 Your total monthly carbon footprint right now is <strong>${total} kg</strong>.</p>
        <p>Here's where your carbon is coming from:</p>
        <ul>
          <li>🚗 <strong>Getting around:</strong> ${breakdown.transportation} kg (${Math.round(breakdown.transportation/total*100)}%)</li>
          <li>⚡ <strong>Home energy:</strong> ${breakdown.energy} kg (${Math.round(breakdown.energy/total*100)}%)</li>
          <li>🍽️ <strong>What you eat:</strong> ${breakdown.food} kg (${Math.round(breakdown.food/total*100)}%)</li>
          <li>🛍️ <strong>Shopping:</strong> ${breakdown.shopping} kg (${Math.round(breakdown.shopping/total*100)}%)</li>
          <li>🚰 <strong>Water &amp; waste:</strong> ${Math.round((breakdown.water + breakdown.waste)*10)/10} kg (${Math.round((breakdown.water+breakdown.waste)/total*100)}%)</li>
        </ul>
        <p>Your biggest area is <strong>${largestCategory}</strong>. That's the best place to focus first for the most impact!</p>
        <p>Want me to give you some simple, practical tips for reducing that? Just ask 😊</p>
      `;
    }

    if (msg.includes("energy") || msg.includes("electricity") || msg.includes("solar") || msg.includes("light")) {
      const saved = Math.round(breakdown.energy * 0.4);
      return `
        <p>💡 Your home energy accounts for <strong>${breakdown.energy} kg</strong> of your monthly footprint. That's a great area to tackle!</p>
        <p><strong>The biggest win?</strong> Switching to a green energy plan. Many providers offer one for little or no extra cost — and it can cut your electricity-related carbon to nearly zero.</p>
        <p>Other easy wins at home:</p>
        <ul>
          <li>👁️ <strong>Switch to LEDs:</strong> Replacing old light bulbs with LEDs uses 80% less energy for lighting. Easy to do, and they last for years.</li>
          <li>🌡️ <strong>Adjust your thermostat:</strong> Lowering it by just 2°F in winter can noticeably reduce your heating impact.</li>
        </ul>
        <p>If you switched to green energy and replaced your bulbs, you could save around <strong>${saved} kg per month</strong>. That's like not driving a car for several days!</p>
      `;
    }

    if (msg.includes("food") || msg.includes("meat") || msg.includes("diet") || msg.includes("vegan") || msg.includes("veget") || msg.includes("beef") || msg.includes("eat")) {
      const savedMeat = Math.round(breakdown.food * 0.3);
      return `
        <p>🍽️ Food is one of the biggest factors in most people's carbon footprint! Yours is currently <strong>${breakdown.food} kg per month</strong>.</p>
        <p>Here's the thing: <strong>beef has a huge impact</strong> compared to plant-based food. Raising cattle requires a lot of land, water, and feed — and produces methane, a potent warming gas. Here's a simple comparison:</p>
        <ul>
          <li>🥩 <strong>A meal with beef or lamb:</strong> About 6 kg of carbon</li>
          <li>🥚 <strong>A vegetarian meal:</strong> About 1.3 kg of carbon</li>
          <li>🥦 <strong>A fully plant-based meal:</strong> About 0.5 kg of carbon</li>
        </ul>
        <p>Just swapping 2 beef meals per week for something plant-based could save you around <strong>${savedMeat} kg per month</strong>. Easy swaps: lentil curry, pasta with veggies, or a black bean burger!</p>
        <p>You don't have to go vegan — even small changes make a real difference. 😊</p>
      `;
    }

    if (msg.includes("transport") || msg.includes("car") || msg.includes("drive") || msg.includes("commute") || msg.includes("transit") || msg.includes("fly") || msg.includes("travel") || msg.includes("around")) {
      return `
        <p>🚗 Getting around accounts for <strong>${breakdown.transportation} kg</strong> of your monthly footprint. This is often the single biggest category!</p>
        <p>The big difference? <strong>Driving alone vs. taking transit.</strong> A car emits roughly 0.35 kg of carbon per mile, while public transport emits only about 0.07 kg per mile. That's an 80% reduction per trip!</p>
        <p><strong>Some easy changes to try:</strong></p>
        <ul>
          <li>🚌 <strong>Take transit twice a week:</strong> Swapping just 2 car commutes per week can save ~40 kg per month.</li>
          <li>🚴 <strong>Walk or cycle short trips:</strong> For journeys under 2 miles, walking or biking produces zero carbon.</li>
          <li>🗳️ <strong>Combine errands:</strong> Batching your car trips into one loop instead of separate trips cuts mileage fast.</li>
        </ul>
        <p>What does your typical week of getting around look like?</p>
      `;
    }

    if (msg.includes("waste") || msg.includes("recycle") || msg.includes("compost") || msg.includes("recycl")) {
      return `
        <p>♻️ Your waste accounts for <strong>${breakdown.waste} kg</strong> of your monthly footprint.</p>
        <p>Here's something surprising: when food scraps go to landfill, they break down without air and release <strong>methane</strong> — a gas that warms the planet much faster than CO2. Composting lets food break down with air instead, which is much cleaner!</p>
        <p><strong>Simple steps to reduce waste impact:</strong></p>
        <ul>
          <li>🌱 <strong>Start composting:</strong> Even a small bin on your counter for fruit peels and food scraps makes a big difference.</li>
          <li>📦 <strong>Avoid excess packaging:</strong> Buy loose fruit and veg when you can, or products in cardboard rather than plastic.</li>
          <li>🧺 <strong>Recycle properly:</strong> Rinse containers before recycling — dirty packaging often goes straight to landfill anyway.</li>
        </ul>
        <p>Even small steps here add up. What waste habit feels easiest to change first?</p>
      `;
    }

    if (msg.includes("offset") || msg.includes("neutral") || msg.includes("tree") || msg.includes("project") || msg.includes("support")) {
      return `
        <p>🌳 Carbon offset projects are a way to cancel out emissions you haven't been able to reduce yet.</p>
        <p><strong>Think of it like this:</strong> if you can't avoid flying for work, you can support a reforestation project that plants enough trees to absorb those emissions.</p>
        <p><strong>Important:</strong> They're not a replacement for changing your habits — think of them as a "while I'm working on it" tool rather than a get-out-of-jail-free card. Reducing first is always better.</p>
        <p>The projects in our <strong>My Goals</strong> tab are certified by independent organisations to ensure they actually work. Check them out!</p>
      `;
    }

    // Default general response
    return `
      <p>Hi! 😊 I'm here to help. Your current monthly footprint is <strong>${total} kg of carbon</strong>.</p>
      <p>Your biggest area right now is <strong>${largestCategory}</strong>. If you want to make the most difference, that's the best place to start.</p>
      <p>Here are some things you can ask me about:</p>
      <ul>
        <li><em>"How do I save energy at home?"</em></li>
        <li><em>"Why is beef so bad for the planet?"</em></li>
        <li><em>"What's the easiest first step I can take?"</em></li>
      </ul>
      <p>No question is too basic — I'm here to help, not judge! 😊</p>
    `;
  }
};

window.Coach = Coach;
