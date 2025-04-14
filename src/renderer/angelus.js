const fs = require('fs');
const path = require('path');

// Função para carregar a oração do arquivo JSON
function loadPrayer() {
    const prayerPath = path.join(__dirname, '../../assets/prayers/angelus.json');
    return JSON.parse(fs.readFileSync(prayerPath, 'utf-8'));
}

// Função para obter a imagem da oração
function getPrayerImage(isEasterTime) {
    const imageType = isEasterTime ? 'reginaCaeli' : 'angelus';
    const imagesDir = path.join(__dirname, `../../assets/images/${imageType}`);
    const images = fs.readdirSync(imagesDir);
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return path.join(imagesDir, randomImage);
}

// Função para verificar se estamos no Tempo Pascal
function isEasterTime() {
    const now = new Date();
    const year = now.getFullYear();

    // Algoritmo de Meeus/Jones/Butcher para calcular a Páscoa
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    const easterDate = new Date(year, month - 1, day);
    const pentecostDate = new Date(easterDate);
    pentecostDate.setDate(easterDate.getDate() + 49);

    return now >= easterDate && now <= pentecostDate;
}

// Função para atualizar o conteúdo da oração
function updatePrayerContent() {
    const prayer = loadPrayer();
    const isEaster = isEasterTime();
    const prayerType = isEaster ? prayer.easter : prayer.regular;

    // Atualizar título
    const titleElement = document.getElementById('prayer-title');
    if (titleElement) {
        titleElement.textContent = prayerType.title;
    }

    // Atualizar versos
    const versesContainer = document.getElementById('verses-container');
    if (versesContainer) {
        versesContainer.innerHTML = '';
        prayerType.verses.forEach(verse => {
            const verseElement = document.createElement('div');
            verseElement.className = 'verse';
            verseElement.textContent = verse.verse;

            const responseElement = document.createElement('div');
            responseElement.className = 'response';
            responseElement.textContent = verse.response;

            versesContainer.appendChild(verseElement);
            versesContainer.appendChild(responseElement);
        });
    }

    // Atualizar oração final
    const finalPrayerElement = document.getElementById('final-prayer');
    if (finalPrayerElement) {
        finalPrayerElement.textContent = prayerType.prayer;
    }

    // Atualizar imagem
    const imageElement = document.getElementById('prayer-image');
    if (imageElement) {
        imageElement.src = getPrayerImage(isEaster);
    }
}

// Adicionar classe de fade-in ao carregar
document.body.classList.add('fade-in');

// Atualizar o conteúdo quando a página carregar
window.addEventListener('load', updatePrayerContent); 