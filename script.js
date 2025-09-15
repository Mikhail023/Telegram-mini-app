document.addEventListener('DOMContentLoaded', () => {

    const tg = window.Telegram.WebApp;
    tg.ready();

    const body = document.body;
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const currencyBtns = document.querySelectorAll('.currency-btn');
    let currentCurrency = '₽';

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

    // --- Логика для страницы настроек ---
    // Смена темы по кнопке
    document.getElementById('theme-light-btn').addEventListener('click', () => {
        applyTheme('light');
    });

    document.getElementById('theme-dark-btn').addEventListener('click', () => {
        applyTheme('dark');
    });

    // Смена валюты (пока только для отображения)
    document.getElementById('currency-rub-btn').addEventListener('click', () => {
        currentCurrency = '₽';
        updateCurrencyButtons('currency-rub-btn');
        // Обновляем отображение всех сумм
        updateBalanceDisplay();
    });

    document.getElementById('currency-usd-btn').addEventListener('click', () => {
        currentCurrency = '$';
        updateCurrencyButtons('currency-usd-btn');
        updateBalanceDisplay();
    });
    
    document.getElementById('currency-eur-btn').addEventListener('click', () => {
        currentCurrency = '€';
        updateCurrencyButtons('currency-eur-btn');
        updateBalanceDisplay();
    });

    // Функция для подсветки активной кнопки валюты
    function updateCurrencyButtons(activeBtnId) {
        document.querySelectorAll('.currency-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(activeBtnId).classList.add('active');
    }

    // Временные данные для примера
    const assetsData = [
        { name: 'Золото', amount: 8000, type: 'metal' },
        { name: 'Bitcoin', amount: 2000, type: 'crypto' },
        { name: 'Акции Газпром', amount: 5000, type: 'stocks' }
    ];
    let totalBalance = 15000;

    // Функция для отрисовки активов и обновления баланса
    function updateBalanceDisplay() {
        const totalBalanceElement = document.getElementById('total-balance');
        const assetsList = document.getElementById('assets-list');
        
        // Обновляем баланс
        totalBalanceElement.textContent = `${totalBalance} ${currentCurrency}`;

        // Обновляем список активов
        assetsList.innerHTML = '';
        assetsData.forEach(asset => {
            const assetItem = document.createElement('div');
            assetItem.classList.add('asset-item');
            assetItem.innerHTML = `
                <span>${asset.name}</span>
                <span>${asset.amount} ${currentCurrency}</span>
            `;
            assetsList.appendChild(assetItem);
        });
    }

    // Инициализация при запуске
    updateBalanceDisplay();
});
