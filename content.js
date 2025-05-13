// === Конфигурация сайтов ===
const selectors = [
    {
        hosts: ["rimi.lv", "www.rimi.lv"],
        pathStart: "/e-veikals",
        cardSelector: ".js-product-container.card",
        extract: (card) => {
            const name = card.querySelector(".card__name")?.textContent?.trim();
            const link = card.querySelector("a.card__url")?.href;
            return { name, link };
        }
    },
    {
        hosts: ["rimi.ee", "www.rimi.ee"],
        pathStart: "/epood",
        cardSelector: ".js-product-container.card",
        extract: (card) => {
            const name = card.querySelector(".card__name")?.textContent?.trim();
            const link = card.querySelector("a.card__url")?.href;
            return { name, link };
        }
    }, //p.s. I haven't tested the selectors for estonian rimi, but I am 70% sure they are the same
    {
        hosts: ["barbora.lv", "barbora.lt", "www.barbora.lv", "www.barbora.lt"],
        pathStart: "",
        cardSelector: ".tw-flex.tw-shrink-0.tw-grow.tw-basis-auto.tw-flex-col.tw-pb-2",
        extract: (card) => {
            const name = card.querySelector(".tw-block")?.textContent?.trim();
            const link = card.querySelector("a")?.href;
            return { name, link };
        }
    }
];

const currentHost = window.location.hostname;
const currentPath = window.location.pathname;

console.log("💡 content.js загружен на", window.location.href);

let siteConfig = null;

for (const site of selectors) {
    if (site.hosts.includes(currentHost)) {
        if (!site.pathStart || currentPath.startsWith(site.pathStart)) {
            siteConfig = site;
            break;
        }
    }
}

if (siteConfig) {
    console.log("🔍 Ищем карточки с селектором:", siteConfig.cardSelector);
    startScraping(siteConfig);
} else {
    console.log("⚠️ В моем словаре нет этого сайта.");
}

// === Сбор карточек и слежка ===

function startScraping(site) {
    const seen = new Set();
    let productId = 1;
    localStorage.setItem("products", JSON.stringify([]));

    const saveProduct = async (name, link) => {
        const ingredients = await fetchIngredients(link);
        const product = {
            id: productId++,
            name: name || "",
            link: link || "",
            ingridients: ingredients || "",
            status: 1
        };

        const data = JSON.parse(localStorage.getItem("products")) || [];
        data.push(product);
        localStorage.setItem("products", JSON.stringify(data));
        console.log("💾 Сохранён продукт:", product);
    };

    const handleCard = (card) => {
        if (seen.has(card)) return;
        seen.add(card);

        const { name, link } = site.extract(card);

        if (!name && !link) return;

        saveProduct(name, link);
    };

    const initialCheck = () => {
        document.querySelectorAll(site.cardSelector).forEach(handleCard);
        console.log("🚀 Изначальная проверка карточек завершена");
    };

    const observer = new MutationObserver(() => {
        document.querySelectorAll(site.cardSelector).forEach(handleCard);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    initialCheck();
    console.log("👀 Слежка за карточками запущена.");
}

async function fetchIngredients(link) {
    if (!link) return "";
    try {
        const res = await fetch(link);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        // Попытка найти состав (зависит от сайта, подстрой потом под каждый)
        const ingrElement = [...doc.querySelectorAll('.heading')].find(el => el.textContent.includes('Sastāvdaļas'))?.nextElementSibling?.querySelector('li > div > p')
            || [...doc.querySelectorAll('.b-product-info--info-3-title')].find(el => el.textContent.includes('Sastāvdaļas'))?.nextElementSibling;

            const testHeading = [...doc.querySelectorAll('.side-cart-adapt product-tabs')];
    console.log("Найденный heading:", testHeading);


        if (ingrElement) {
            return ingrElement.textContent.trim();
        }
    } catch (e) {
        console.warn("❌ Не удалось получить состав:", e);
    }
    return "";
}

// === SPA-навигация ===

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
    window.location.reload(); // просто перезагружаем расширение
});
