const selectors = [
    { hosts: ["rimi.lv", "www.rimi.lv"], pathStart: "/e-veikals", selector: ".card__name" },
    { hosts: ["rimi.ee", "www.rimi.ee"], pathStart: "/epood", selector: ".card__name" },
    { hosts: ["barbora.lv", "barbora.lt", "www.barbora.lv", "www.barbora.lt"], pathStart: "", selector: ".tw-block" }
    // { hosts: ["ventspils.citro.lv", "rezekne.citro.lv", "www.ventspils.citro.lv", "www.rezekne.citro.lv"], pathStart: "", selector: ".woocommerce-loop-product__title" },
];

const currentHost = window.location.hostname;
const currentPath = window.location.pathname;

let siteSelector = null;

console.log("💡 content.js загружен на", window.location.href);

// Определяем нужный селектор для текущего сайта
for (const site of selectors) {
    if (site.hosts.includes(currentHost)) {
        if (!site.pathStart || currentPath.startsWith(site.pathStart)) {
            siteSelector = site.selector;
            break;
        }
    }
}

if (siteSelector) {
    console.log("🔍 Ищем товары с селектором:", siteSelector);
    startScraping(siteSelector);
} else {
    console.log("⚠️ В моем словаре нет этого сайта.");
}

function startScraping(selector) {
    const seen = new Set();

    const handleNewElement = (element) => {
        if (!seen.has(element)) {
            seen.add(element);
            const name = element.textContent.trim();
            console.log("🆕 Новый товар:", name);
        }
    };

    // Проверка и сбор уже существующих элементов
    const initialCheck = () => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(handleNewElement);
    };

    initialCheck();

    // Подключаем MutationObserver для отслеживания новых товаров
    const observer = new MutationObserver(() => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(handleNewElement);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("👀 Слежка за DOM запущена. Все новые товары будут отображаться в консоли.");
}

// ============================
// 🧭 Поддержка SPA-навигации
// ============================

function onUrlChange(callback) {
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function (...args) {
        pushState.apply(this, args);
        window.dispatchEvent(new Event("urlchange"));
    };
    history.replaceState = function (...args) {
        replaceState.apply(this, args);
        window.dispatchEvent(new Event("urlchange"));
    };

    window.addEventListener("popstate", callback);
    window.addEventListener("urlchange", callback);
}

onUrlChange(() => {
    console.log("🔄 URL изменился:", window.location.href);

    // Повторяем ту же логику при смене URL
    const newPath = window.location.pathname;
    let newSelector = null;

    for (const site of selectors) {
        if (site.hosts.includes(currentHost)) {
            if (!site.pathStart || newPath.startsWith(site.pathStart)) {
                newSelector = site.selector;
                break;
            }
        }
    }

    if (newSelector) {
        console.log("🔁 Перезапуск сбора данных для нового селектора:", newSelector);
        startScraping(newSelector);
    } else {
        console.log("⚠️ Селектор не найден после смены URL.");
    }
});
