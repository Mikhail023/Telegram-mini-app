document.addEventListener('DOMContentLoaded', () => {

    const tg = window.Telegram.WebApp;
    tg.ready();

    const body = document.body;
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    const addForm = document.getElementById('add-form');
    const removeForm = document.getElementById('remove-form');
    const addTabBtn = document.getElementById('add-btn-tab');
    const removeTabBtn = document.getElementById('remove-btn-tab');
    const assetTypeSelect = document.getElementById('asset-type');
    const bankSelectDiv = document.getElementById('bank-select');
    const removeAssetSelect = document.getElementById('remove-asset-select');

    let currentCurrency = '₽';
    let totalBalance = 0;
    let assetsData = {}; 
    let transactionsHistory = [];

    // --- Логика сохранения и загрузки данных ---
    function saveData() {
        const data = {
            totalBalance: totalBalance,
            assetsData: assetsData,
            transactionsHistory: transactionsHistory,
            currentCurrency: currentCurrency
        };
        tg.setItem('finance_data', JSON.stringify(data));
    }

    function loadData() {
        const storedData = tg.getItem('finance_data');
        if (storedData) {
            const data = JSON.parse(storedData);
            totalBalance = data.totalBalance || 0;
            assetsData = data.assetsData || {};
            transactionsHistory = data.transactionsHistory || [];
            currentCurrency = data.currentCurrency || '₽';
        }
    }

    // --- Логика переключения темы ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
    }
    tg.onEvent('themeChanged', () => {
        applyTheme(tg.colorScheme);
    });
    applyTheme(tg.colorScheme);

    // --- Логика переключения страниц и кнопок ---
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');

        if (pageId === 'add-page' && removeTabBtn.classList.contains('active')) {
            updateRemoveFormAssets();
        }
        if (pageId === 'history-page') {
            renderHistory();
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            if (button.id === 'home-btn') {
                showPage('home-page');
            } else if (button.id === 'history-btn') {
                showPage('history-page');
            } else if (button.id === 'add-btn') {
                showPage('add-page');
            } else if (button.id === 'channel-btn') {
                tg.openLink('https://t.me/mwth_news');
            } else if (button.id === 'settings-btn') {
                showPage('settings-page');
            }
        });
    });

    // --- Логика переключения форм добавления/удаления ---
    addTabBtn.addEventListener('click', () => {
        addTabBtn.classList.add('active');
        removeTabBtn.classList.remove('active');
        addForm.classList.remove('hidden');
        removeForm.classList.add('hidden');
    });

    removeTabBtn.addEventListener('click', () => {
        removeTabBtn.classList.add('active');
        addTabBtn.classList.remove('active');
        removeForm.classList.remove('hidden');
        addForm.classList.add('hidden');
        updateRemoveFormAssets();
    });

    // --- Логика для страницы настроек ---
    document.getElementById('theme-light-btn').addEventListener('click', () => {
        applyTheme('light');
        saveData();
    });

    document.getElementById('theme-dark-btn').addEventListener('click', () => {
        applyTheme('dark');
        saveData();
    });

    document.getElementById('currency-rub-btn').addEventListener('click', () => {
        currentCurrency = '₽';
        updateCurrencyButtons('currency-rub-btn');
        updateAllDisplays();
        saveData();
    });

    document.getElementById('currency-usd-btn').addEventListener('click', () => {
        currentCurrency = '$';
        updateCurrencyButtons('currency-usd-btn');
        updateAllDisplays();
        saveData();
    });
    
    document.getElementById('currency-eur-btn').addEventListener('click', () => {
        currentCurrency = '€';
        updateCurrencyButtons('currency-eur-btn');
        updateAllDisplays();
        saveData();
    });

    function updateCurrencyButtons(activeBtnId) {
        document.querySelectorAll('.setting-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(activeBtnId).classList.add('active');
    }

    // --- Логика для форм добавления/удаления ---
    assetTypeSelect.addEventListener('change', (event) => {
        const type = event.target.value;
        if (type === 'deposit' || type === 'metal' || type === 'stocks') {
            bankSelectDiv.style.display = 'flex';
        } else {
            bankSelectDiv.style.display = 'none';
        }
    });

    addForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('asset-name').value;
        const amount = parseFloat(document.getElementById('asset-amount').value);
        const type = document.getElementById('asset-type').value;

        if (name && !isNaN(amount) && amount > 0) {
            if (assetsData[name]) {
                assetsData[name].value += amount;
            } else {
                assetsData[name] = {
                    type: type,
                    value: amount
                };
            }

            totalBalance += amount;

            transactionsHistory.push({
                date: new Date().toLocaleString(),
                name: name,
                amount: amount,
                action: 'deposit'
            });

            addForm.reset();
            bankSelectDiv.style.display = 'none';

            updateAllDisplays();
            saveData();
            showPage('home-page');
            document.getElementById('home-btn').classList.add('active');
            document.getElementById('add-btn').classList.remove('active');
            
            tg.showAlert(`Актив "${name}" пополнен на ${amount} ${currentCurrency}!`);
        } else {
            tg.showAlert('Пожалуйста, заполните все поля!');
        }
    });

    removeForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = removeAssetSelect.value;
        const amount = parseFloat(document.getElementById('remove-amount').value);

        if (name && assetsData[name] && !isNaN(amount) && amount > 0) {
            if (assetsData[name].value >= amount) {
                assetsData[name].value -= amount;
                totalBalance -= amount;

                transactionsHistory.push({
                    date: new Date().toLocaleString(),
                    name: name,
                    amount: amount,
                    action: 'withdrawal'
                });

                removeForm.reset();

                if (assetsData[name].value <= 0) {
                    delete assetsData[name];
                }

                updateAllDisplays();
                saveData();
                showPage('home-page');
                document.getElementById('home-btn').classList.add('active');
                document.getElementById('add-btn').classList.remove('active');
                tg.showAlert(`Со счета "${name}" выведено ${amount} ${currentCurrency}.`);
            } else {
                tg.showAlert('Недостаточно средств на счете!');
            }
        } else {
            tg.showAlert('Пожалуйста, выберите актив и введите сумму!');
        }
    });

    // --- Функции рендеринга ---
    function updateAllDisplays() {
        renderAssets();
        renderHistory();
        document.getElementById('total-balance').textContent = `${totalBalance} ${currentCurrency}`;
    }
    
    function updateRemoveFormAssets() {
        removeAssetSelect.innerHTML = '';
        const activeAssets = Object.keys(assetsData).filter(key => assetsData[key].value > 0);
        if (activeAssets.length === 0) {
            removeAssetSelect.innerHTML = '<option value="">Нет активов для вывода</option>';
            removeForm.querySelector('button').disabled = true;
        } else {
            removeForm.querySelector('button').disabled = false;
            activeAssets.forEach(assetName => {
                const option = document.createElement('option');
                option.value = assetName;
                option.textContent = `${assetName} (${assetsData[assetName].value} ${currentCurrency})`;
                removeAssetSelect.appendChild(option);
            });
        }
    }

    function renderAssets() {
        const assetsList = document.getElementById('assets-list');
        assetsList.innerHTML = '';
        if (Object.keys(assetsData).length === 0) {
            assetsList.innerHTML = `<p class="centered" style="opacity: 0.6;">Активов пока нет.</p>`;
        } else {
            for (const name in assetsData) {
                const asset = assetsData[name];
                const assetItem = document.createElement('div');
                assetItem.classList.add('asset-item');
                assetItem.innerHTML = `
                    <div class="left-info">
                        <span class="name">${name}</span>
                        <span class="type">${getAssetTypeName(asset.type)}</span>
                    </div>
                    <div class="right-info">
                        <span class="current-balance">${asset.value} ${currentCurrency}</span>
                    </div>
                `;
                assetsList.appendChild(assetItem);
            }
        }
    }
    
    function renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        if (transactionsHistory.length === 0) {
            historyList.innerHTML = `<p class="centered" style="opacity: 0.6;">История операций пуста.</p>`;
        } else {
            transactionsHistory.forEach(transaction => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                const amountClass = transaction.action === 'deposit' ? 'deposit' : 'withdrawal';
                const sign = transaction.action === 'deposit' ? '+' : '-';
                historyItem.innerHTML = `
                    <div class="date">${transaction.date}</div>
                    <div class="details">
                        <span>${transaction.name}</span>
                        <span class="amount ${amountClass}">${sign}${transaction.amount} ${currentCurrency}</span>
                    </div>
                `;
                historyList.prepend(historyItem);
            });
        }
    }

    function getAssetTypeName(type) {
        switch(type) {
            case 'deposit': return 'Вклад';
            case 'stocks': return 'Акции';
            case 'bonds': return 'Облигации';
            case 'metal': return 'Драгметаллы';
            case 'crypto': return 'Криптовалюта';
            default: return '';
        }
    }

    // Инициализация
    loadData();
    updateAllDisplays();
});
