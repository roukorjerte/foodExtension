const allergenButtons = document.querySelectorAll('.alergens');
const allergens = [
    { name: "Nuts", status: false },
    { name: "Lactose", status: false },
    { name: "Gluten", status: false }
];

// Загружаем состояние из Chrome Storage
chrome.storage.local.get("allergens", (data) => {
    if (data.allergens) {
        allergens.forEach(allergen => {
            allergen.status = data.allergens.includes(allergen.name);
        });
    }
    updateButtonStates();
});

// Функция для обновления кнопок и навешивания событий
function updateButtonStates() {
    allergenButtons.forEach((button, index) => {
        button.classList.toggle('selected', allergens[index].status);

        button.onclick = () => {
            allergens[index].status = !allergens[index].status;
            button.classList.toggle('selected', allergens[index].status);
            saveAllergens(); // сохраняем сразу после клика
        };
    });
}

// Функция для сохранения в chrome.storage
function saveAllergens() {
    const selectedAllergens = allergens
        .filter(allergen => allergen.status)
        .map(allergen => allergen.name);

    chrome.storage.local.set({ allergens: selectedAllergens }, () => {
        console.log("Данные сохранены с выбранными аллергенами:", selectedAllergens);
    });
}
