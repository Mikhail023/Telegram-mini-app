document.addEventListener('DOMContentLoaded', () => {

    const tg = window.Telegram.WebApp;
    tg.ready();

    const body = document.body;
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const currencyBtns = document.querySelectorAll('.currency-btn');
    const addForm = document.getElementById('add-form');
    const assetTypeSelect = document.getElementById('asset-type');
    const bankSelectDiv = document.getElementById('bank-select');

    let currentCurrency = '₽';
    let totalBalance = 0;
    const assetsData = []; // Пустой массив для хранения данных

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
    document.getElementById('theme-light-btn').addEventListener('click', () => {
        applyTheme('light');
    });

    document.getElementById('theme-dark-btn').addEventListener('click', () => {
        applyTheme('dark');
    });

    document.getElementById('currency-rub-btn').addEventListener('click', () => {
        currentCurrency = '₽';
        updateCurrencyButtons('currency-rub-btn');
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

    function updateCurrencyButtons(activeBtnId) {
        document.querySelectorAll('.setting-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(activeBtnId).classList.add('active');
    }

    // --- Логика для формы добавления данных ---
    // Показываем/скрываем поле "Банк" в зависимости от выбранного типа актива
    assetTypeSelect.addEventListener('change', (event) => {
        if (event.target.value === 'metal') {
            bankSelectDiv.style.display = 'flex';
        } else {
            bankSelectDiv.style.display = 'none';
        }
    });

    addForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Предотвращаем перезагрузку страницы

        const name = document.getElementById('asset-name').value;
        const amount = parseFloat(document.getElementById('asset-amount').value);
        const type = document.getElementById('asset-type').value;

        if (name && !isNaN(amount) && amount > 0) {
            assetsData.push({
                name: name,
                invested: amount, // Это "вклад"
                currentValue: amount, // Пока что currentValue равен вкладу
                type: type,
            });

            totalBalance += amount; // Обновляем общий баланс

            // Очищаем форму после добавления
            addForm.reset();
            bankSelectDiv.style.display = 'none'; // Скрываем поле "Банк"

            // Обновляем отображение
            updateBalanceDisplay();
            showPage('home-page'); // Возвращаемся на главную страницу
            document.getElementById('home-btn').classList.add('active'); // Подсвечиваем кнопку "Домой"
            document.getElementById('add-btn').classList.remove('active'); // Убираем подсветку с "+"
            
            tg.showAlert(`Актив "${name}" на сумму ${amount} ${currentCurrency} добавлен!`);
        } else {
            tg.showAlert('Пожалуйста, заполните все поля!');
        }
    });

    // Функция для отрисовки активов и обновления баланса
    function updateBalanceDisplay() {
        const totalBalanceElement = document.getElementById('total-balance');
        const assetsList = document.getElementById('assets-list');
        
        // Обновляем баланс
        totalBalanceElement.textContent = `${totalBalance} ${currentCurrency}`;

        // Обновляем список активов
        assetsList.innerHTML = '';
        if (assetsData.length === 0) {
            assetsList.innerHTML = `<p class="centered" style="opacity: 0.6;">Активов пока нет.</p>`;
        } else {
            assetsData.forEach(asset => {
                const assetItem = document.createElement('div');
                assetItem.classList.add('asset-item');
                assetItem.innerHTML = `
                    <div class="left-info">
                        <span class="name">${asset.name}</span>
                        <span class="type">${asset.type}</span>
                    </div>
                    <div class="right-info">
                        <span class="current-balance">${asset.currentValue} ${currentCurrency}</span>
                        <span class="invested">Вклад: ${asset.invested} ${currentCurrency}</span>
                    </div>
                `;
                assetsList.appendChild(assetItem);
            });
        }
    }

    // Инициализация при запуске
    updateBalanceDisplay();
});
