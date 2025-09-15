// Ждем, пока весь HTML-документ будет загружен
document.addEventListener('DOMContentLoaded', () => {

    // Инициализируем Telegram WebApp
    const tg = window.Telegram.WebApp;
    tg.ready(); // Уведомляем Telegram, что приложение готово

    // Определяем элементы интерфейса по их ID
    const body = document.body;
    const balanceContainer = document.getElementById('balance-container');
    const assetsList = document.getElementById('assets-list');
    const navButtons = document.querySelectorAll('.nav-btn'); // Все кнопки в нижней панели

    // --- Логика переключения темы ---
    // Функция для применения темы
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
    }

    // Слушаем событие смены темы в Telegram
    tg.onEvent('themeChanged', () => {
        applyTheme(tg.colorScheme);
    });

    // Устанавливаем начальную тему при запуске
    applyTheme(tg.colorScheme);

    // --- Логика разворачивания списка активов ---
    // При клике на контейнер с балансом
    balanceContainer.addEventListener('click', () => {
        // Проверяем, если список активов скрыт...
        if (assetsList.classList.contains('hidden')) {
            // ...показываем его
            assetsList.classList.remove('hidden');
            // Здесь мы будем динамически добавлять элементы списка
            // Например:
            assetsList.innerHTML = `
                <div class="asset-item">
                    <span>Золото</span>
                    <span>8000 ₽</span>
                </div>
                <div class="asset-item">
                    <span>TAC coin</span>
                    <span>2000 ₽</span>
                </div>
            `;
        } else {
            // ...иначе, скрываем
            assetsList.classList.add('hidden');
        }
    });

    // --- Логика навигации (подсветка активной кнопки) ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Сначала убираем класс 'active' у всех кнопок
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Затем добавляем его к нажатой кнопке
            button.classList.add('active');

            // Здесь будет логика для переключения между страницами
            // (например, история, новости и т.д.)
        });
    });

    // --- Пример функции для обновления баланса (будет использоваться позже) ---
    function updateBalance(newBalance) {
        document.getElementById('total-balance').textContent = `${newBalance} ₽`;
    }

    // Вызываем функцию для обновления баланса (временно)
    updateBalance(10000); // 8000 + 2000
});