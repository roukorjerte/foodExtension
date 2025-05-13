const selectors = [
    { hosts: ["rimi.lv", "www.rimi.lv"], pathStart: "/e-veikals", productName: ".card__name", productLink: "a.card__url.js-gtm-eec-product-click" },
    { hosts: ["rimi.ee", "www.rimi.ee"], pathStart: "/epood", productName: ".card__name" }, //тут добавь продукт линк селектор
    { hosts: ["barbora.lv", "barbora.lt", "www.barbora.lv", "www.barbora.lt"], pathStart: "", productName: ".tw-block" } //тут добавь продукт линк селектор
];

const currentHost = window.location.hostname;
const currentPath = window.location.pathname;

let siteNameSelector = null;
let sitelinkSelector = null;

console.log("💡 content.js загружен на", window.location.href);

// Определяем нужный селектор для текущего сайта
for (const site of selectors) {
    if (site.hosts.includes(currentHost)) {
        if (!site.pathStart || currentPath.startsWith(site.pathStart)) {
            siteNameSelector = site.productName;
            sitelinkSelector = site.productLink;
            break;
        }
    }
}

if (siteNameSelector) {
    console.log("🔍 Ищем товары с селектором:", siteNameSelector);
    startScraping(siteNameSelector, sitelinkSelector);
} else {
    console.log("⚠️ В моем словаре нет этого сайта.");
}

function startScraping(nameSelector, linkSelector) {
    const seen = new Set();
    // const handleNewElement;
    const handleNewElement = (element) => {
        if (!seen.has(element)) {
            seen.add(element);
            const name = element.textContent.trim();
            console.log("🆕 Новый товар:", name);
        }
    };

    // Проверка и сбор уже существующих элементов
    const initialCheck = () => {
        const elementsNames = document.querySelectorAll(nameSelector);
        const elementsLinks = document.querySelectorAll(linkSelector);
        elementsNames.forEach(handleNewElement);
        console.log("функция имени отработала");
        elementsLinks.forEach(handleNewElement);
        console.log("функция ссылки отработала");

    };

    initialCheck();

    // Подключаем MutationObserver для отслеживания новых товаров
    const observer = new MutationObserver(() => {
        const elements = document.querySelectorAll(nameSelector);
        const elementsLinks = document.querySelectorAll(linkSelector);
        elements.forEach(handleNewElement);
        elementsLinks.forEach(handleNewElement);
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
    let newNameSelector = null;
    let newLinkSelector = null;

    for (const site of selectors) {
        if (site.hosts.includes(currentHost)) {
            if (!site.pathStart || newPath.startsWith(site.pathStart)) {
                newNameSelector = site.productName;
                newLinkSelector = site.productLink;
                break;
            }
        }
    }

    if (newNameSelector) {
        console.log("🔁 Перезапуск сбора данных для нового селектора:", newNameSelector);
        startScraping(newNameSelector);
    } else {
        console.log("⚠️ Селектор не найден после смены URL.");
    }
});
