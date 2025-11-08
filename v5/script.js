    const defaultConfig = {
      game_title: "Mobile Business Empire",
      company_name: "Global Dynamics Corp",
      background_color: "#667eea",
      surface_color: "#ffffff",
      text_color: "#1a202c",
      primary_action_color: "#667eea",
      secondary_action_color: "#48bb78"
    };

    const CITIES = [
      { id: 'newyork', emoji: '🗽', name: 'New York', multiplier: 1.8, unlockLevel: 1 },
      { id: 'london', emoji: '🇬🇧', name: 'London', multiplier: 1.6, unlockLevel: 2 },
      { id: 'tokyo', emoji: '🗾', name: 'Tokyo', multiplier: 1.7, unlockLevel: 3 },
      { id: 'singapore', emoji: '🇸🇬', name: 'Singapore', multiplier: 1.5, unlockLevel: 4 },
      { id: 'dubai', emoji: '🏜️', name: 'Dubai', multiplier: 2.0, unlockLevel: 5 },
      { id: 'sydney', emoji: '🇦🇺', name: 'Sydney', multiplier: 1.4, unlockLevel: 6 },
      { id: 'mumbai', emoji: '🇮🇳', name: 'Mumbai', multiplier: 1.3, unlockLevel: 7 },
      { id: 'saopaulo', emoji: '🇧🇷', name: 'São Paulo', multiplier: 1.2, unlockLevel: 8 },
      { id: 'moscow', emoji: '🇷🇺', name: 'Moscow', multiplier: 1.6, unlockLevel: 9 },
      { id: 'lagos', emoji: '🇳🇬', name: 'Lagos', multiplier: 1.1, unlockLevel: 10 }
    ];

    const BUSINESS_TEMPLATES = [
      { id: 'food_truck', name: '🚚 Food Truck', baseCost: 1000, baseRevenue: 5, category: 'food' },
      { id: 'cafe', name: '☕ Coffee Shop', baseCost: 5000, baseRevenue: 25, category: 'food' },
      { id: 'restaurant', name: '🍕 Restaurant', baseCost: 25000, baseRevenue: 125, category: 'food' },
      { id: 'boutique', name: '👗 Boutique', baseCost: 15000, baseRevenue: 75, category: 'retail' },
      { id: 'electronics', name: '📱 Electronics Store', baseCost: 50000, baseRevenue: 250, category: 'retail' },
      { id: 'app_dev', name: '📱 App Development', baseCost: 75000, baseRevenue: 375, category: 'tech' },
      { id: 'ai_startup', name: '🤖 AI Startup', baseCost: 200000, baseRevenue: 1000, category: 'tech' },
      { id: 'crypto_mining', name: '₿ Crypto Mining', baseCost: 500000, baseRevenue: 2500, category: 'crypto' },
      { id: 'real_estate', name: '🏠 Real Estate', baseCost: 1000000, baseRevenue: 5000, category: 'property' },
      { id: 'space_tourism', name: '🚀 Space Tourism', baseCost: 10000000, baseRevenue: 50000, category: 'future' }
    ];

    const INVESTMENT_TYPES = [
      { id: 'stocks', name: 'Stock Market', icon: '📈', yield: 0.08, risk: 'medium', minInvest: 1000 },
      { id: 'bonds', name: 'Government Bonds', icon: '🏛️', yield: 0.04, risk: 'low', minInvest: 5000 },
      { id: 'crypto', name: 'Cryptocurrency', icon: '₿', yield: 0.15, risk: 'high', minInvest: 500 },
      { id: 'commodities', name: 'Gold & Oil', icon: '🥇', yield: 0.06, risk: 'medium', minInvest: 2000 },
      { id: 'startups', name: 'Startup Funding', icon: '🚀', yield: 0.25, risk: 'high', minInvest: 10000 },
      { id: 'forex', name: 'Foreign Exchange', icon: '💱', yield: 0.12, risk: 'high', minInvest: 1000 },
      { id: 'reits', name: 'Real Estate Funds', icon: '🏢', yield: 0.07, risk: 'medium', minInvest: 3000 },
      { id: 'art', name: 'Art & Collectibles', icon: '🎨', yield: 0.10, risk: 'medium', minInvest: 15000 },
      { id: 'green_energy', name: 'Green Energy', icon: '🌱', yield: 0.09, risk: 'medium', minInvest: 5000 },
      { id: 'biotech', name: 'Biotech Research', icon: '🧬', yield: 0.20, risk: 'high', minInvest: 25000 }
    ];

    let gameState = {
      cash: 25000,
      startTime: Date.now(),
      lastTick: Date.now(),
      currentCity: 'newyork',
      currentTab: 'businesses',
      playerLevel: 1,
      experience: 0,
      entities: [],
      achievements: [],
      lastEventTime: Date.now(),
      totalEarnings: 0
    };

    const dataHandler = {
      onDataChanged(data) {
        gameState.entities = data;
        renderCurrentTab();
        updateStats();
        checkAchievements();
        checkLevelUp();
      }
    };

    async function init() {
      const initResult = await window.dataSdk.init(dataHandler);
      if (!initResult.isOk) {
        showToast('Failed to initialize game data');
        return;
      }

      await window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (config) => {
          document.getElementById('game-title').textContent = config.game_title || defaultConfig.game_title;
          document.getElementById('company-name').textContent = config.company_name || defaultConfig.company_name;
          
          const customFont = config.font_family || defaultConfig.font_family;
          if (customFont) {
            document.body.style.fontFamily = `${customFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
          }

          const fontSize = config.font_size || 16;
          document.querySelector('.game-title').style.fontSize = `${fontSize * 1.5}px`;
          document.querySelector('.company-name').style.fontSize = `${fontSize * 0.875}px`;
        },
        mapToCapabilities: (config) => ({
          recolorables: [
            {
              get: () => config.background_color || defaultConfig.background_color,
              set: (value) => {
                config.background_color = value;
                window.elementSdk.setConfig({ background_color: value });
              }
            },
            {
              get: () => config.surface_color || defaultConfig.surface_color,
              set: (value) => {
                config.surface_color = value;
                window.elementSdk.setConfig({ surface_color: value });
              }
            },
            {
              get: () => config.text_color || defaultConfig.text_color,
              set: (value) => {
                config.text_color = value;
                window.elementSdk.setConfig({ text_color: value });
              }
            },
            {
              get: () => config.primary_action_color || defaultConfig.primary_action_color,
              set: (value) => {
                config.primary_action_color = value;
                window.elementSdk.setConfig({ primary_action_color: value });
              }
            },
            {
              get: () => config.secondary_action_color || defaultConfig.secondary_action_color,
              set: (value) => {
                config.secondary_action_color = value;
                window.elementSdk.setConfig({ secondary_action_color: value });
              }
            }
          ],
          borderables: [],
          fontEditable: undefined,
          fontSizeable: {
            get: () => config.font_size || 16,
            set: (value) => {
              config.font_size = value;
              window.elementSdk.setConfig({ font_size: value });
            }
          }
        }),
        mapToEditPanelValues: (config) => new Map([
          ["game_title", config.game_title || defaultConfig.game_title],
          ["company_name", config.company_name || defaultConfig.company_name]
        ])
      });

      renderCityGrid();
      renderCurrentTab();
      startGameLoop();
      showWelcomeMessage();
    }

    function showWelcomeMessage() {
      setTimeout(() => {
        showToast('Welcome to Mobile Business Empire! Start by buying your first business.');
      }, 1000);
    }

    function renderCityGrid() {
      const container = document.getElementById('city-grid');
      container.innerHTML = '';
      
      CITIES.forEach(city => {
        const isUnlocked = gameState.playerLevel >= city.unlockLevel;
        const isActive = city.id === gameState.currentCity;
        
        const div = document.createElement('div');
        div.className = `city-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
        div.style.opacity = isUnlocked ? '1' : '0.5';
        div.innerHTML = `
          <span class="city-emoji">${city.emoji}</span>
          <div>${city.name}</div>
          ${!isUnlocked ? `<div style="font-size: 10px; color: #f56565;">Lv.${city.unlockLevel}</div>` : ''}
        `;
        
        if (isUnlocked) {
          div.onclick = () => switchCity(city.id);
        } else {
          div.onclick = () => showUnlockGuidance(city);
        }
        
        container.appendChild(div);
      });
    }

    function switchCity(cityId) {
      gameState.currentCity = cityId;
      renderCityGrid();
      renderCurrentTab();
      
      const city = CITIES.find(c => c.id === cityId);
      showToast(`Switched to ${city.name} (${city.multiplier}x multiplier)`);
    }

    function switchTab(tabName) {
      gameState.currentTab = tabName;
      
      // Update nav buttons
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById(`nav-${tabName}`).classList.add('active');
      
      renderCurrentTab();
    }

    function renderCurrentTab() {
      const container = document.getElementById('content-area');
      
      switch (gameState.currentTab) {
        case 'businesses':
          renderBusinessesTab(container);
          break;
        case 'investments':
          renderInvestmentsTab(container);
          break;
        case 'market':
          renderMarketTab(container);
          break;
        case 'portfolio':
          renderPortfolioTab(container);
          break;
        case 'achievements':
          renderAchievementsTab(container);
          break;
      }
    }

    function renderBusinessesTab(container) {
      const city = CITIES.find(c => c.id === gameState.currentCity);
      const ownedBusinesses = gameState.entities.filter(e => 
        e.entity_type === 'business' && 
        e.owner_type === 'player' && 
        e.city === gameState.currentCity
      );

      container.innerHTML = `
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: white; text-align: center;">
            🏢 Available Businesses in ${city.name}
          </h3>
          <div id="available-businesses"></div>
        </div>
        
        <div>
          <h3 style="margin: 0 0 15px 0; color: white; text-align: center;">
            🏆 Your Businesses (${ownedBusinesses.length})
          </h3>
          <div id="owned-businesses"></div>
        </div>
      `;

      renderAvailableBusinesses();
      renderOwnedBusinesses();
    }

    function renderAvailableBusinesses() {
      const container = document.getElementById('available-businesses');
      const city = CITIES.find(c => c.id === gameState.currentCity);
      
      container.innerHTML = '';
      
      BUSINESS_TEMPLATES.forEach(template => {
        const ownedCount = gameState.entities.filter(e => 
          e.entity_type === 'business' && 
          e.business_type === template.id && 
          e.city === gameState.currentCity &&
          e.owner_type === 'player'
        ).length;
        
        const cost = Math.floor(template.baseCost * city.multiplier * Math.pow(1.15, ownedCount));
        const revenue = Math.floor(template.baseRevenue * city.multiplier * Math.pow(1.15, ownedCount));

        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <div class="card-header">
            <div class="card-title">${template.name}</div>
            <div class="card-badge">Owned: ${ownedCount}</div>
          </div>
          <div class="card-info">
            💵 Cost: $${formatNumber(cost)}<br>
            📊 Revenue: $${formatNumber(revenue)}/sec<br>
            🌍 City Bonus: ${city.multiplier}x
          </div>
          <div class="card-actions">
            <button class="btn btn-primary" onclick="showPurchaseModal('${template.id}')" 
              ${gameState.cash < cost ? 'disabled' : ''}>
              ${gameState.cash < cost ? 'Need $' + formatNumber(cost - gameState.cash) : 'Purchase'}
            </button>
          </div>
        `;
        container.appendChild(div);
      });
    }

    function renderOwnedBusinesses() {
      const container = document.getElementById('owned-businesses');
      const ownedBusinesses = gameState.entities.filter(e => 
        e.entity_type === 'business' && 
        e.owner_type === 'player' && 
        e.city === gameState.currentCity
      );

      if (ownedBusinesses.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🏢</div>
            <div>No businesses in this city yet.<br>Start building your empire!</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      ownedBusinesses.forEach(business => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <div class="card-header">
            <div class="card-title">${business.name}</div>
            <div class="card-badge">Lv.${business.level}</div>
          </div>
          <div class="card-info">
            📊 Revenue: $${formatNumber(business.revenue_per_tick)}/sec<br>
            ⬆️ Upgrade: $${formatNumber(business.upgrade_cost)}<br>
            💰 Value: $${formatNumber(business.market_value)}
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(100, (business.level / 10) * 100)}%"></div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-success" onclick="upgradeBusiness('${business.id}')"
              ${gameState.cash < business.upgrade_cost ? 'disabled' : ''}>
              Upgrade
            </button>
            <button class="btn btn-danger" onclick="showSellModal('${business.id}')">
              Sell
            </button>
          </div>
        `;
        container.appendChild(div);
      });
    }

    function renderInvestmentsTab(container) {
      container.innerHTML = `
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: white; text-align: center;">
            📊 Investment Opportunities
          </h3>
          <div class="investment-grid" id="investment-grid"></div>
        </div>
        
        <div>
          <h3 style="margin: 0 0 15px 0; color: white; text-align: center;">
            💼 Your Investments
          </h3>
          <div id="your-investments"></div>
        </div>
      `;

      renderInvestmentGrid();
      renderYourInvestments();
    }

    function renderInvestmentGrid() {
      const container = document.getElementById('investment-grid');
      container.innerHTML = '';
      
      INVESTMENT_TYPES.forEach(investment => {
        const div = document.createElement('div');
        div.className = 'investment-card';
        div.style.background = getInvestmentGradient(investment.risk);
        div.innerHTML = `
          <div class="risk-indicator risk-${investment.risk}"></div>
          <div class="investment-icon">${investment.icon}</div>
          <div class="investment-name">${investment.name}</div>
          <div class="investment-yield">${(investment.yield * 100).toFixed(1)}% APY</div>
          <div style="font-size: 10px; margin-top: 4px;">Min: $${formatNumber(investment.minInvest)}</div>
        `;
        div.onclick = () => showInvestmentModal(investment);
        container.appendChild(div);
      });
    }

    function getInvestmentGradient(risk) {
      switch (risk) {
        case 'low': return 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
        case 'medium': return 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)';
        case 'high': return 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
        default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }
    }

    function renderYourInvestments() {
      const container = document.getElementById('your-investments');
      const investments = gameState.entities.filter(e => e.entity_type === 'investment');

      if (investments.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <div>No investments yet.<br>Diversify your portfolio!</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      investments.forEach(investment => {
        const investmentType = INVESTMENT_TYPES.find(t => t.id === investment.investment_type);
        const dailyReturn = investment.market_value * investment.yield_rate / 365;
        
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <div class="card-header">
            <div class="card-title">${investmentType.icon} ${investmentType.name}</div>
            <div class="card-badge risk-${investment.risk_level}">${investment.risk_level}</div>
          </div>
          <div class="card-info">
            💰 Invested: $${formatNumber(investment.market_value)}<br>
            📈 Daily Return: $${formatNumber(dailyReturn)}<br>
            🎯 APY: ${(investment.yield_rate * 100).toFixed(1)}%
          </div>
          <div class="card-actions">
            <button class="btn btn-success" onclick="addToInvestment('${investment.id}')">
              Add More
            </button>
            <button class="btn btn-warning" onclick="withdrawInvestment('${investment.id}')">
              Withdraw
            </button>
          </div>
        `;
        container.appendChild(div);
      });
    }

    function renderMarketTab(container) {
      const npcBusinesses = gameState.entities.filter(e => 
        e.entity_type === 'business' && 
        e.owner_type === 'npc' && 
        e.city === gameState.currentCity
      );

      container.innerHTML = `
        <div>
          <h3 style="margin: 0 0 15px 0; color: white; text-align: center;">
            🏪 Market Opportunities in ${CITIES.find(c => c.id === gameState.currentCity).name}
          </h3>
          <div id="market-businesses"></div>
        </div>
      `;

      renderMarketBusinesses(npcBusinesses);
    }

    function renderMarketBusinesses(businesses) {
      const container = document.getElementById('market-businesses');
      
      if (businesses.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🏪</div>
            <div>No market opportunities in this city yet.</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      businesses.forEach(business => {
        const npcData = JSON.parse(business.data || '{}');
        const availableShares = business.total_shares - business.shares_owned;
        const sharePrice = Math.floor(business.market_value / business.total_shares);

        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <div class="card-header">
            <div class="card-title">${business.name}</div>
            <div class="card-badge">Lv.${business.level}</div>
          </div>
          <div class="card-info">
            👤 Owner: ${npcData.npc_name}<br>
            📊 Revenue: $${formatNumber(business.revenue_per_tick)}/sec<br>
            💰 Share Price: $${formatNumber(sharePrice)}<br>
            📈 Available: ${availableShares}%
          </div>
          <div class="card-actions">
            <button class="btn btn-warning" onclick="investInBusiness('${business.id}', 10)" 
              ${gameState.cash < sharePrice * 10 || availableShares < 10 ? 'disabled' : ''}>
              Buy 10%
            </button>
            <button class="btn btn-success" onclick="proposePartnership('${business.id}')" 
              ${business.partnership_type ? 'disabled' : ''}>
              Partner
            </button>
          </div>
        `;
        container.appendChild(div);
      });
    }

    function renderPortfolioTab(container) {
      const totalValue = calculatePortfolioValue();
      const monthlyIncome = calculateMonthlyIncome();
      
      container.innerHTML = `
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-bottom: 20px; color: white;">
          <h3 style="margin: 0 0 15px 0; text-align: center;">💼 Portfolio Overview</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
            <div>
              <div style="font-size: 24px; font-weight: bold;">$${formatNumber(totalValue)}</div>
              <div style="font-size: 12px; opacity: 0.8;">Total Value</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: bold;">$${formatNumber(monthlyIncome)}</div>
              <div style="font-size: 12px; opacity: 0.8;">Monthly Income</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 style="margin: 0 0 15px 0; color: white; text-align: center;">📊 Asset Breakdown</h3>
          <div id="portfolio-breakdown"></div>
        </div>
      `;

      renderPortfolioBreakdown();
    }

    function renderPortfolioBreakdown() {
      const container = document.getElementById('portfolio-breakdown');
      const businesses = gameState.entities.filter(e => e.entity_type === 'business' && e.owner_type === 'player');
      const investments = gameState.entities.filter(e => e.entity_type === 'investment');
      const shares = gameState.entities.filter(e => e.entity_type === 'business' && e.owner_type === 'npc' && e.shares_owned > 0);

      container.innerHTML = '';

      // Business summary
      if (businesses.length > 0) {
        const businessValue = businesses.reduce((sum, b) => sum + b.market_value, 0);
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <div class="card-header">
            <div class="card-title">🏢 Your Businesses</div>
            <div class="card-badge">${businesses.length}</div>
          </div>
          <div class="card-info">
            💰 Total Value: $${formatNumber(businessValue)}<br>
            📊 Monthly Revenue: $${formatNumber(businesses.reduce((sum, b) => sum + b.revenue_per_tick * 30 * 24 * 3600, 0))}
          </div>
        `;
        container.appendChild(div);
      }

      // Investment summary
      if (investments.length > 0) {
        const investmentValue = investments.reduce((sum, i) => sum + i.market_value, 0);
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <div class="card-header">
            <div class="card-title">📊 Investments</div>
            <div class="card-badge">${investments.length}</div>
          </div>
          <div class="card-info">
            💰 Total Invested: $${formatNumber(investmentValue)}<br>
            📈 Monthly Returns: $${formatNumber(investments.reduce((sum, i) => sum + (i.market_value * i.yield_rate / 12), 0))}
          </div>
        `;
        container.appendChild(div);
      }

      // Shares summary
      if (shares.length > 0) {
        const sharesValue = shares.reduce((sum, s) => sum + (s.market_value * s.shares_owned / 100), 0);
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <div class="card-header">
            <div class="card-title">🤝 Share Holdings</div>
            <div class="card-badge">${shares.length}</div>
          </div>
          <div class="card-info">
            💰 Total Value: $${formatNumber(sharesValue)}<br>
            📊 Monthly Dividends: $${formatNumber(shares.reduce((sum, s) => sum + (s.revenue_per_tick * s.shares_owned / 100 * 30 * 24 * 3600), 0))}
          </div>
        `;
        container.appendChild(div);
      }

      if (businesses.length === 0 && investments.length === 0 && shares.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">💼</div>
            <div>Your portfolio is empty.<br>Start building your empire!</div>
          </div>
        `;
      }
    }

    function renderAchievementsTab(container) {
      container.innerHTML = `
        <div>
          <h3 style="margin: 0 0 15px 0; color: white; text-align: center;">🏆 Achievements</h3>
          <div id="achievements-list"></div>
        </div>
        
        <div style="margin-top: 30px;">
          <h3 style="margin: 0 0 15px 0; color: white; text-align: center;">🎯 Goals</h3>
          <div id="goals-list"></div>
        </div>
      `;

      renderAchievements();
      renderGoals();
    }

    function renderAchievements() {
      const container = document.getElementById('achievements-list');
      
      if (gameState.achievements.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🏆</div>
            <div>No achievements yet.<br>Keep building your empire!</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      gameState.achievements.forEach(achievement => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.background = 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)';
        div.style.color = 'white';
        div.innerHTML = `
          <div class="card-title">${achievement}</div>
        `;
        container.appendChild(div);
      });
    }

    function renderGoals() {
      const container = document.getElementById('goals-list');
      const goals = [
        { text: 'Own 5 businesses', progress: Math.min(100, (gameState.entities.filter(e => e.entity_type === 'business' && e.owner_type === 'player').length / 5) * 100) },
        { text: 'Reach $100K cash', progress: Math.min(100, (gameState.cash / 100000) * 100) },
        { text: 'Unlock 5 cities', progress: Math.min(100, (gameState.playerLevel / 5) * 100) },
        { text: 'Make 10 investments', progress: Math.min(100, (gameState.entities.filter(e => e.entity_type === 'investment').length / 10) * 100) }
      ];

      container.innerHTML = '';
      goals.forEach(goal => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <div class="card-info">
            ${goal.text}
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${goal.progress}%"></div>
            </div>
            <div style="text-align: right; font-size: 12px; margin-top: 5px;">${goal.progress.toFixed(0)}%</div>
          </div>
        `;
        container.appendChild(div);
      });
    }

    function showPurchaseModal(templateId) {
      const template = BUSINESS_TEMPLATES.find(t => t.id === templateId);
      const city = CITIES.find(c => c.id === gameState.currentCity);
      const ownedCount = gameState.entities.filter(e => 
        e.entity_type === 'business' && 
        e.business_type === templateId && 
        e.city === gameState.currentCity &&
        e.owner_type === 'player'
      ).length;
      
      const cost = Math.floor(template.baseCost * city.multiplier * Math.pow(1.15, ownedCount));
      const revenue = Math.floor(template.baseRevenue * city.multiplier * Math.pow(1.15, ownedCount));

      showModal('Purchase Business', `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 10px;">${template.name.split(' ')[0]}</div>
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">${template.name}</div>
          <div style="color: #666;">in ${city.name}</div>
        </div>
        
        <div style="background: #f7fafc; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">💵 <strong>Cost:</strong> $${formatNumber(cost)}</div>
          <div style="margin-bottom: 10px;">📊 <strong>Revenue:</strong> $${formatNumber(revenue)}/sec</div>
          <div style="margin-bottom: 10px;">🌍 <strong>City Bonus:</strong> ${city.multiplier}x</div>
          <div>🏢 <strong>You own:</strong> ${ownedCount} of this type</div>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">Cancel</button>
          <button class="btn btn-primary" onclick="purchaseBusiness('${templateId}')" style="flex: 1;" 
            ${gameState.cash < cost ? 'disabled' : ''}>
            ${gameState.cash < cost ? 'Not Enough Cash' : 'Purchase'}
          </button>
        </div>
      `);
    }

    function showInvestmentModal(investment) {
      showModal('Investment Opportunity', `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 10px;">${investment.icon}</div>
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">${investment.name}</div>
          <div style="color: ${investment.risk === 'high' ? '#f56565' : investment.risk === 'medium' ? '#ed8936' : '#48bb78'};">
            ${investment.risk.toUpperCase()} RISK
          </div>
        </div>
        
        <div style="background: #f7fafc; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">📈 <strong>Annual Yield:</strong> ${(investment.yield * 100).toFixed(1)}%</div>
          <div style="margin-bottom: 10px;">💰 <strong>Minimum Investment:</strong> $${formatNumber(investment.minInvest)}</div>
          <div>⚠️ <strong>Risk Level:</strong> ${investment.risk}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Investment Amount:</label>
          <input type="number" id="investment-amount" placeholder="Enter amount" 
            style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 16px;"
            min="${investment.minInvest}" step="1000" value="${investment.minInvest}">
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">Cancel</button>
          <button class="btn btn-primary" onclick="makeInvestment('${investment.id}')" style="flex: 1;">
            Invest Now
          </button>
        </div>
      `);
    }

    function showModal(title, content) {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'current-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">${title}</h2>
            <button class="modal-close" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    function closeModal() {
      const modal = document.getElementById('current-modal');
      if (modal) {
        modal.remove();
      }
    }

    function showQuickActions() {
      showModal('Quick Actions', `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <button class="btn btn-primary" onclick="autoInvest(); closeModal();">
            🤖 Auto Invest
          </button>
          <button class="btn btn-success" onclick="collectAllRevenue(); closeModal();">
            💰 Collect All
          </button>
          <button class="btn btn-warning" onclick="upgradeAll(); closeModal();">
            ⬆️ Upgrade All
          </button>
          <button class="btn btn-secondary" onclick="showStats(); closeModal();">
            📊 Statistics
          </button>
        </div>
      `);
    }

    async function purchaseBusiness(templateId) {
      const template = BUSINESS_TEMPLATES.find(t => t.id === templateId);
      const city = CITIES.find(c => c.id === gameState.currentCity);
      const ownedCount = gameState.entities.filter(e => 
        e.entity_type === 'business' && 
        e.business_type === templateId && 
        e.city === gameState.currentCity &&
        e.owner_type === 'player'
      ).length;
      
      const cost = Math.floor(template.baseCost * city.multiplier * Math.pow(1.15, ownedCount));

      if (gameState.cash < cost) {
        showToast('Not enough cash!');
        return;
      }

      if (gameState.entities.length >= 999) {
        showToast('Maximum limit reached!');
        return;
      }

      // Show loading
      const btn = event.target;
      const originalText = btn.textContent;
      btn.innerHTML = '<div class="loading-spinner"></div>';
      btn.disabled = true;

      gameState.cash -= cost;
      gameState.experience += 10;

      const business = {
        id: `${templateId}_${gameState.currentCity}_${Date.now()}`,
        entity_type: 'business',
        name: template.name,
        city: gameState.currentCity,
        owner_type: 'player',
        owner_id: 'player',
        business_type: templateId,
        investment_type: '',
        level: 1,
        revenue_per_tick: Math.floor(template.baseRevenue * city.multiplier),
        cost: cost,
        upgrade_cost: Math.floor(cost * 1.5),
        market_value: Math.floor(cost * 1.2),
        shares_owned: 0,
        total_shares: 100,
        partnership_type: '',
        partnership_terms: '',
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        status: 'active',
        data: JSON.stringify({ city_multiplier: city.multiplier }),
        risk_level: '',
        yield_rate: 0
      };

      const result = await window.dataSdk.create(business);
      if (result.isOk) {
        showToast(`🎉 Purchased ${template.name}!`);
        closeModal();
        updateStats();
      } else {
        gameState.cash += cost;
        showToast('Failed to purchase business');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }

    async function makeInvestment(investmentTypeId) {
      const investmentType = INVESTMENT_TYPES.find(t => t.id === investmentTypeId);
      const amount = parseInt(document.getElementById('investment-amount').value);

      if (!amount || amount < investmentType.minInvest) {
        showToast(`Minimum investment is $${formatNumber(investmentType.minInvest)}`);
        return;
      }

      if (gameState.cash < amount) {
        showToast('Not enough cash!');
        return;
      }

      if (gameState.entities.length >= 999) {
        showToast('Maximum limit reached!');
        return;
      }

      gameState.cash -= amount;
      gameState.experience += 5;

      const investment = {
        id: `inv_${investmentTypeId}_${Date.now()}`,
        entity_type: 'investment',
        name: investmentType.name,
        city: '',
        owner_type: 'player',
        owner_id: 'player',
        business_type: '',
        investment_type: investmentTypeId,
        level: 1,
        revenue_per_tick: 0,
        cost: amount,
        upgrade_cost: 0,
        market_value: amount,
        shares_owned: 0,
        total_shares: 0,
        partnership_type: '',
        partnership_terms: '',
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        status: 'active',
        data: JSON.stringify({ investment_type: investmentTypeId }),
        risk_level: investmentType.risk,
        yield_rate: investmentType.yield
      };

      const result = await window.dataSdk.create(investment);
      if (result.isOk) {
        showToast(`💰 Invested $${formatNumber(amount)} in ${investmentType.name}!`);
        closeModal();
        updateStats();
      } else {
        gameState.cash += amount;
        showToast('Investment failed');
      }
    }

    async function upgradeBusiness(businessId) {
      const business = gameState.entities.find(e => e.id === businessId);
      if (!business || gameState.cash < business.upgrade_cost) {
        showToast('Not enough cash!');
        return;
      }

      gameState.cash -= business.upgrade_cost;
      gameState.experience += 15;
      business.level += 1;
      business.revenue_per_tick = Math.floor(business.revenue_per_tick * 1.5);
      business.upgrade_cost = Math.floor(business.upgrade_cost * 1.5);
      business.market_value = Math.floor(business.market_value * 1.3);
      business.last_updated = new Date().toISOString();

      const result = await window.dataSdk.update(business);
      if (result.isOk) {
        showToast(`⬆️ Upgraded ${business.name} to level ${business.level}!`);
        updateStats();
      } else {
        gameState.cash += business.upgrade_cost;
        showToast('Upgrade failed');
      }
    }

    function calculatePortfolioValue() {
      return gameState.entities.reduce((total, entity) => {
        if (entity.entity_type === 'business' && entity.owner_type === 'player') {
          return total + entity.market_value;
        } else if (entity.entity_type === 'investment') {
          return total + entity.market_value;
        } else if (entity.entity_type === 'business' && entity.owner_type === 'npc' && entity.shares_owned > 0) {
          return total + (entity.market_value * entity.shares_owned / 100);
        }
        return total;
      }, 0) + gameState.cash;
    }

    function calculateMonthlyIncome() {
      return gameState.entities.reduce((total, entity) => {
        if (entity.entity_type === 'business' && entity.owner_type === 'player') {
          return total + (entity.revenue_per_tick * 30 * 24 * 3600);
        } else if (entity.entity_type === 'investment') {
          return total + (entity.market_value * entity.yield_rate / 12);
        } else if (entity.entity_type === 'business' && entity.owner_type === 'npc' && entity.shares_owned > 0) {
          return total + (entity.revenue_per_tick * entity.shares_owned / 100 * 30 * 24 * 3600);
        }
        return total;
      }, 0);
    }

    function startGameLoop() {
      setInterval(() => {
        const now = Date.now();
        const deltaTime = (now - gameState.lastTick) / 1000;
        gameState.lastTick = now;

        let totalIncome = 0;
        
        gameState.entities.forEach(entity => {
          if (entity.entity_type === 'business' && entity.owner_type === 'player') {
            totalIncome += entity.revenue_per_tick;
          } else if (entity.entity_type === 'investment') {
            const dailyReturn = entity.market_value * entity.yield_rate / 365;
            totalIncome += dailyReturn / (24 * 3600);
          } else if (entity.entity_type === 'business' && entity.owner_type === 'npc' && entity.shares_owned > 0) {
            const dividendPerShare = entity.revenue_per_tick / entity.total_shares;
            totalIncome += dividendPerShare * entity.shares_owned;
          }
        });

        gameState.cash += totalIncome * deltaTime;
        gameState.totalEarnings += totalIncome * deltaTime;
        updateStats();
      }, 100);

      setInterval(() => {
        checkLevelUp();
      }, 5000);
    }

    function checkLevelUp() {
      const requiredExp = gameState.playerLevel * 100;
      if (gameState.experience >= requiredExp) {
        gameState.playerLevel++;
        gameState.experience = 0;
        
        showAchievementPopup(`🎉 Level Up! You're now level ${gameState.playerLevel}!`);
        renderCityGrid();
        updateStats();
      }
    }

    function checkAchievements() {
      const newAchievements = [];

      const myBusinesses = gameState.entities.filter(e => e.entity_type === 'business' && e.owner_type === 'player');
      const investments = gameState.entities.filter(e => e.entity_type === 'investment');

      if (myBusinesses.length >= 1 && !gameState.achievements.includes('first_business')) {
        gameState.achievements.push('first_business');
        newAchievements.push('🏢 First Business Owner!');
      }

      if (investments.length >= 1 && !gameState.achievements.includes('first_investment')) {
        gameState.achievements.push('first_investment');
        newAchievements.push('📊 Smart Investor!');
      }

      if (gameState.cash >= 100000 && !gameState.achievements.includes('hundred_k')) {
        gameState.achievements.push('hundred_k');
        newAchievements.push('💰 $100K Club!');
      }

      if (gameState.playerLevel >= 5 && !gameState.achievements.includes('level_5')) {
        gameState.achievements.push('level_5');
        newAchievements.push('🌟 Level 5 Tycoon!');
      }

      if (myBusinesses.length >= 10 && !gameState.achievements.includes('ten_businesses')) {
        gameState.achievements.push('ten_businesses');
        newAchievements.push('🏆 Business Empire!');
      }

      newAchievements.forEach(achievement => {
        showAchievementPopup(achievement);
      });
    }

    function showAchievementPopup(text) {
      const popup = document.createElement('div');
      popup.className = 'achievement-popup';
      popup.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">🏆</div>
        <div style="font-weight: bold; font-size: 16px;">${text}</div>
      `;
      
      document.body.appendChild(popup);
      
      setTimeout(() => {
        popup.remove();
      }, 3000);
    }

    function updateStats() {
      document.getElementById('cash').textContent = `$${formatNumber(Math.floor(gameState.cash))}`;
      document.getElementById('player-level').textContent = gameState.playerLevel;
      
      let totalIncome = 0;
      let businessCount = 0;
      let investmentCount = 0;
      let partnershipCount = 0;
      
      gameState.entities.forEach(entity => {
        if (entity.entity_type === 'business' && entity.owner_type === 'player') {
          totalIncome += entity.revenue_per_tick;
          businessCount++;
          if (entity.partnership_type) partnershipCount++;
        } else if (entity.entity_type === 'investment') {
          const dailyReturn = entity.market_value * entity.yield_rate / 365;
          totalIncome += dailyReturn / (24 * 3600);
          investmentCount++;
        } else if (entity.entity_type === 'business' && entity.owner_type === 'npc' && entity.shares_owned > 0) {
          const dividendPerShare = entity.revenue_per_tick / entity.total_shares;
          totalIncome += dividendPerShare * entity.shares_owned;
        }
      });
      
      document.getElementById('income').textContent = `$${formatNumber(Math.floor(totalIncome))}/s`;
      document.getElementById('business-count').textContent = businessCount;
      document.getElementById('investment-count').textContent = investmentCount;
      document.getElementById('partnership-count').textContent = partnershipCount;
    }

    function formatNumber(num) {
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toFixed(0);
    }

    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    // Auto functions for quick actions
    function autoInvest() {
      const availableCash = gameState.cash * 0.2; // Invest 20% of cash
      const bestInvestment = INVESTMENT_TYPES.find(i => i.minInvest <= availableCash);
      
      if (bestInvestment && availableCash >= bestInvestment.minInvest) {
        document.getElementById('investment-amount').value = Math.floor(availableCash);
        makeInvestment(bestInvestment.id);
      } else {
        showToast('Not enough cash for auto-invest');
      }
    }

    function collectAllRevenue() {
      // This is just a visual effect since revenue is already auto-collected
      const totalRevenue = gameState.entities.reduce((sum, e) => {
        if (e.entity_type === 'business' && e.owner_type === 'player') {
          return sum + e.revenue_per_tick * 10; // 10 seconds worth
        }
        return sum;
      }, 0);
      
      if (totalRevenue > 0) {
        gameState.cash += totalRevenue;
        showToast(`💰 Collected $${formatNumber(totalRevenue)} in revenue!`);
        updateStats();
      } else {
        showToast('No revenue to collect');
      }
    }

    async function upgradeAll() {
      const businesses = gameState.entities.filter(e => 
        e.entity_type === 'business' && 
        e.owner_type === 'player' && 
        gameState.cash >= e.upgrade_cost
      );
      
      if (businesses.length === 0) {
        showToast('No businesses can be upgraded');
        return;
      }
      
      let upgraded = 0;
      for (const business of businesses.slice(0, 3)) { // Limit to 3 to avoid too many operations
        if (gameState.cash >= business.upgrade_cost) {
          await upgradeBusiness(business.id);
          upgraded++;
        }
      }
      
      if (upgraded > 0) {
        showToast(`⬆️ Upgraded ${upgraded} businesses!`);
      }
    }

    function showUnlockGuidance(city) {
      const levelsNeeded = city.unlockLevel - gameState.playerLevel;
      const expNeeded = (gameState.playerLevel * 100) - gameState.experience;
      
      showModal(`🔒 ${city.name} Locked`, `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 10px;">${city.emoji}</div>
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">${city.name}</div>
          <div style="color: #f56565; font-weight: bold;">Requires Level ${city.unlockLevel}</div>
        </div>
        
        <div style="background: #f7fafc; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; margin-bottom: 5px;">📊 Your Progress:</div>
            <div>Current Level: ${gameState.playerLevel}</div>
            <div>Experience: ${gameState.experience}/100</div>
            <div style="color: #f56565;">Need ${levelsNeeded} more level${levelsNeeded > 1 ? 's' : ''}</div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; margin-bottom: 10px;">🚀 How to Level Up Fast:</div>
            <div style="margin-bottom: 8px;">• 🏢 Buy businesses (+10 XP each)</div>
            <div style="margin-bottom: 8px;">• ⬆️ Upgrade businesses (+15 XP each)</div>
            <div style="margin-bottom: 8px;">• 📊 Make investments (+5 XP each)</div>
            <div style="margin-bottom: 8px;">• 🤝 Form partnerships (+20 XP each)</div>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px; border-radius: 8px; font-size: 14px;">
            💡 <strong>Pro Tip:</strong> Focus on buying and upgrading businesses in your current city for maximum XP gain!
          </div>
        </div>
        
        <div style="text-align: center;">
          <button class="btn btn-primary" onclick="closeModal(); switchTab('businesses');" style="width: 100%;">
            Start Building Empire 🚀
          </button>
        </div>
      `);
    }

    function showStats() {
      const totalValue = calculatePortfolioValue();
      const monthlyIncome = calculateMonthlyIncome();
      
      showModal('Statistics', `
        <div style="text-align: center;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f7fafc; padding: 15px; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #667eea;">$${formatNumber(totalValue)}</div>
              <div style="font-size: 12px; color: #666;">Total Portfolio Value</div>
            </div>
            <div style="background: #f7fafc; padding: 15px; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #48bb78;">$${formatNumber(monthlyIncome)}</div>
              <div style="font-size: 12px; color: #666;">Monthly Income</div>
            </div>
          </div>
          
          <div style="background: #f7fafc; padding: 15px; border-radius: 10px; text-align: left;">
            <div style="margin-bottom: 10px;">🏆 <strong>Level:</strong> ${gameState.playerLevel}</div>
            <div style="margin-bottom: 10px;">⭐ <strong>Experience:</strong> ${gameState.experience}/100</div>
            <div style="margin-bottom: 10px;">💰 <strong>Total Earnings:</strong> $${formatNumber(gameState.totalEarnings)}</div>
            <div>🏆 <strong>Achievements:</strong> ${gameState.achievements.length}</div>
          </div>
        </div>
      `);
    }

    init();
  </script>
(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'99b58bd976f3ba08',t:'MTc2MjYwOTg5OC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
