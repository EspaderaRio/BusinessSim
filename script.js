 const defaultConfig = {
      game_title: "Business Tycoon",
      company_name: "TechCorp Industries",
      background_color: "#667eea",
      surface_color: "#ffffff",
      text_color: "#1a202c",
      primary_action_color: "#667eea",
      secondary_action_color: "#48bb78"
    };

    const BUSINESS_TEMPLATES = [
      { id: 'lemonade', name: '🍋 Lemonade Stand', baseCost: 100, baseRevenue: 1, multiplier: 1.15 },
      { id: 'coffee', name: '☕ Coffee Shop', baseCost: 500, baseRevenue: 5, multiplier: 1.15 },
      { id: 'restaurant', name: '🍕 Restaurant', baseCost: 2500, baseRevenue: 25, multiplier: 1.15 },
      { id: 'retail', name: '🏪 Retail Store', baseCost: 10000, baseRevenue: 100, multiplier: 1.15 },
      { id: 'factory', name: '🏭 Factory', baseCost: 50000, baseRevenue: 500, multiplier: 1.15 },
      { id: 'tech', name: '💻 Tech Startup', baseCost: 250000, baseRevenue: 2500, multiplier: 1.15 },
      { id: 'bank', name: '🏦 Bank', baseCost: 1000000, baseRevenue: 10000, multiplier: 1.15 },
      { id: 'airline', name: '✈️ Airline', baseCost: 5000000, baseRevenue: 50000, multiplier: 1.15 }
    ];

    let gameState = {
      cash: 1000,
      startTime: Date.now(),
      lastTick: Date.now(),
      ownedBusinesses: []
    };

    let achievements = [];

    const dataHandler = {
      onDataChanged(data) {
        gameState.ownedBusinesses = data;
        renderOwnedBusinesses();
        updateStats();
        checkAchievements();
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
          document.querySelector('.header h1').style.fontSize = `${fontSize * 2}px`;
          document.querySelector('.company-name').style.fontSize = `${fontSize * 1.125}px`;
          document.querySelectorAll('.panel h2').forEach(el => el.style.fontSize = `${fontSize * 1.5}px`);
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

      renderAvailableBusinesses();
      startGameLoop();
    }

    function startGameLoop() {
      setInterval(() => {
        const now = Date.now();
        const deltaTime = (now - gameState.lastTick) / 1000;
        gameState.lastTick = now;

        let totalIncome = 0;
        gameState.ownedBusinesses.forEach(business => {
          totalIncome += business.revenue_per_tick;
        });

        gameState.cash += totalIncome * deltaTime;
        updateStats();
      }, 100);

      setInterval(() => {
        updateTimePlayed();
      }, 1000);
    }

    function renderAvailableBusinesses() {
      const container = document.getElementById('available-businesses');
      container.innerHTML = '';

      BUSINESS_TEMPLATES.forEach(template => {
        const ownedCount = gameState.ownedBusinesses.filter(b => b.type === template.id).length;
        const cost = Math.floor(template.baseCost * Math.pow(template.multiplier, ownedCount));
        const revenue = Math.floor(template.baseRevenue * Math.pow(template.multiplier, ownedCount));

        const div = document.createElement('div');
        div.className = 'business-item';
        div.innerHTML = `
          <div class="business-header">
            <div class="business-name">${template.name}</div>
            <div class="business-level">Owned: ${ownedCount}</div>
          </div>
          <div class="business-info">
            💵 Cost: $${formatNumber(cost)} | 📊 Revenue: $${formatNumber(revenue)}/sec
          </div>
          <div class="business-actions">
            <button class="btn btn-primary" onclick="purchaseBusiness('${template.id}')" 
              ${gameState.cash < cost ? 'disabled' : ''}>
              Purchase
            </button>
          </div>
        `;
        container.appendChild(div);
      });
    }

    function renderOwnedBusinesses() {
      const container = document.getElementById('owned-businesses');
      
      if (gameState.ownedBusinesses.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🏢</div>
            <div>No businesses yet. Start building your empire!</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      gameState.ownedBusinesses.forEach(business => {
        const div = document.createElement('div');
        div.className = 'business-item';
        div.innerHTML = `
          <div class="business-header">
            <div class="business-name">${business.name}</div>
            <div class="business-level">Level ${business.level}</div>
          </div>
          <div class="business-info">
            📊 Revenue: $${formatNumber(business.revenue_per_tick)}/sec | 
            ⬆️ Upgrade: $${formatNumber(business.upgrade_cost)}
          </div>
          <div class="business-actions">
            <button class="btn btn-success" onclick="upgradeBusiness('${business.id}')"
              ${gameState.cash < business.upgrade_cost ? 'disabled' : ''}>
              Upgrade
            </button>
            <button class="btn btn-danger" onclick="sellBusiness('${business.id}')">
              Sell
            </button>
          </div>
        `;
        container.appendChild(div);
      });
    }

    async function purchaseBusiness(templateId) {
      const template = BUSINESS_TEMPLATES.find(t => t.id === templateId);
      const ownedCount = gameState.ownedBusinesses.filter(b => b.type === templateId).length;
      const cost = Math.floor(template.baseCost * Math.pow(template.multiplier, ownedCount));

      if (gameState.cash < cost) {
        showToast('Not enough cash!');
        return;
      }

      if (gameState.ownedBusinesses.length >= 999) {
        showToast('Maximum limit of 999 businesses reached!');
        return;
      }

      gameState.cash -= cost;

      const business = {
        id: `${templateId}_${Date.now()}`,
        type: templateId,
        name: template.name,
        level: 1,
        revenue_per_tick: Math.floor(template.baseRevenue),
        cost: cost,
        upgrade_cost: Math.floor(cost * 1.5),
        purchased_at: new Date().toISOString()
      };

      const result = await window.dataSdk.create(business);
      if (result.isOk) {
        showToast(`Purchased ${template.name}!`);
        renderAvailableBusinesses();
        updateStats();
      } else {
        gameState.cash += cost;
        showToast('Failed to purchase business');
      }
    }

    async function upgradeBusiness(businessId) {
      const business = gameState.ownedBusinesses.find(b => b.id === businessId);
      if (!business || gameState.cash < business.upgrade_cost) {
        showToast('Not enough cash!');
        return;
      }

      gameState.cash -= business.upgrade_cost;
      business.level += 1;
      business.revenue_per_tick = Math.floor(business.revenue_per_tick * 1.5);
      business.upgrade_cost = Math.floor(business.upgrade_cost * 1.5);

      const result = await window.dataSdk.update(business);
      if (result.isOk) {
        showToast(`Upgraded ${business.name} to level ${business.level}!`);
        updateStats();
      } else {
        gameState.cash += business.upgrade_cost;
        showToast('Failed to upgrade business');
      }
    }

    async function sellBusiness(businessId) {
      const business = gameState.ownedBusinesses.find(b => b.id === businessId);
      if (!business) return;

      const sellPrice = Math.floor(business.cost * 0.5);
      gameState.cash += sellPrice;

      const result = await window.dataSdk.delete(business);
      if (result.isOk) {
        showToast(`Sold ${business.name} for $${formatNumber(sellPrice)}`);
        renderAvailableBusinesses();
        updateStats();
      } else {
        gameState.cash -= sellPrice;
        showToast('Failed to sell business');
      }
    }

    function updateStats() {
      document.getElementById('cash').textContent = `$${formatNumber(Math.floor(gameState.cash))}`;
      
      let totalIncome = 0;
      gameState.ownedBusinesses.forEach(business => {
        totalIncome += business.revenue_per_tick;
      });
      document.getElementById('income').textContent = `$${formatNumber(Math.floor(totalIncome))}`;
      document.getElementById('business-count').textContent = gameState.ownedBusinesses.length;
    }

    function updateTimePlayed() {
      const elapsed = Math.floor((Date.now() - gameState.startTime) / 60000);
      document.getElementById('time-played').textContent = `${elapsed}m`;
    }

    function checkAchievements() {
      const newAchievements = [];

      if (gameState.ownedBusinesses.length >= 1 && !achievements.includes('first_business')) {
        achievements.push('first_business');
        newAchievements.push('🎉 First Business!');
      }

      if (gameState.ownedBusinesses.length >= 10 && !achievements.includes('ten_businesses')) {
        achievements.push('ten_businesses');
        newAchievements.push('🏆 Business Mogul - 10 Businesses!');
      }

      if (gameState.cash >= 1000000 && !achievements.includes('millionaire')) {
        achievements.push('millionaire');
        newAchievements.push('💎 Millionaire!');
      }

      if (newAchievements.length > 0) {
        const container = document.getElementById('achievements');
        newAchievements.forEach(achievement => {
          const div = document.createElement('div');
          div.className = 'achievement';
          div.textContent = achievement;
          container.appendChild(div);
        });
      }
    }

    function formatNumber(num) {
      if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
      if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
      return num.toFixed(0);
    }

    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    init();

(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'99b540215463ba08',t:'MTc2MjYwNjc5Ny4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
