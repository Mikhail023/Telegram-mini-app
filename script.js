document.addEventListener('DOMContentLoaded', () => {

    const tg = window.Telegram.WebApp;
    tg.ready();

    const body = document.body;
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    // Логика переключения темы (остаётся прежней)
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

    // Логика переключения страниц
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
            page.classList.add('hidden');
        });
        const currentPage = document.getElementById(pageId);
        currentPage.classList.remove('hidden');
        currentPage.classList.add('active');
    }

    // Слушатель событий для каждой навигационной кнопки
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
                // Открываем канал в новом окне
                tg.openLink('https://t.me/telegram'); // Замените на URL вашего канала
            }
        });
    });

    // Функция для отрисовки активов
    function renderAssets() {
        const assetsList = document.getElementById('assets-list');
        // Временные данные для примера
        const assets = [
            { name: 'Золото', amount: 8000, type: 'metal' },
            { name: 'Bitcoin', amount: 2000, type: 'crypto' },
            { name: 'Акции Газпром', amount: 5000, type: 'stocks' }
        ];

        assetsList.innerHTML = ''; // Очищаем список перед добавлением
        assets.forEach(asset => {
            const assetItem = document.createElement('div');
            assetItem.classList.add('asset-item');
            assetItem.innerHTML = `
                <span>${asset.name}</span>
                <span>${asset.amount} ₽</span>
            `;
            assetsList.appendChild(assetItem);
        });
    }

    // Инициализация при запуске
    renderAssets(); // Отрисовываем активы
    document.getElementById('total-balance').textContent = '15000 ₽'; // Обновляем баланс
});
