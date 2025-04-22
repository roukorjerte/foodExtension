const selectors = [
    { hosts: ["rimi.lv", "www.rimi.lv"], pathStart: "/e-veikals", selector: ".card__name" },
    { hosts: ["rimi.ee", "www.rimi.ee"], pathStart: "/epood", selector: ".card__name" },
    { hosts: ["barbora.lv", "barbora.lt", "www.barbora.lv", "www.barbora.lt"], pathStart: "", selector: ".tw-block" },
    { hosts: ["ventspils.citro.lv", "rezekne.citro.lv", "www.ventspils.citro.lv", "www.rezekne.citro.lv"], pathStart: "", selector: ".woocommerce-loop-product__title" },
];


const currentHost = window.location.hostname;
const currentPath = window.location.pathname;

let siteSelector = null;

console.log("💡 content.js загружен на", window.location.href);

for (const site of selectors) {
    if (site.hosts.includes(currentHost)) {
        if (!site.pathStart || currentPath.startsWith(site.pathStart)) {
            siteSelector = site.selector;
            break;
        }
    }
}

if (siteSelector) {
    const productElements = document.querySelectorAll(siteSelector);
    const productNames = Array.from(productElements).map(el => el.textContent.trim());
    console.log("🛒 Товары на странице:", productNames);
} else {
    console.log("⚠️ Селектор не найден для текущего сайта.");
}
