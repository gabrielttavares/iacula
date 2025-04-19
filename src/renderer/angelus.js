const fs = require('fs');
const path = require('path');

// Função para carregar as orações do arquivo JSON
function loadPrayers() {
    const prayersPath = path.join(__dirname, '../../assets/prayers/angelus.json');
    return JSON.parse(fs.readFileSync(prayersPath, 'utf-8'));
}

// Função para obter a imagem do Angelus
function getAngelusImage() {
    const imagePath = path.join(__dirname, '../../assets/images/angelus/J.jpg');
    return imagePath;
}

// Função para atualizar o conteúdo da oração
function updatePrayerContent() {
    const prayers = loadPrayers();
    const angelus = prayers.regular;
    const imagePath = getAngelusImage();

    // Atualizar título
    document.getElementById('prayer-title').textContent = angelus.title;

    // Atualizar imagem
    const imageElement = document.getElementById('angelus-image');
    imageElement.src = imagePath;

    // Atualizar versículos
    const versesContainer = document.getElementById('verses-container');
    versesContainer.innerHTML = '';

    angelus.verses.forEach(verse => {
        const verseElement = document.createElement('p');
        verseElement.className = 'verse';
        verseElement.textContent = verse.verse;

        const responseElement = document.createElement('p');
        responseElement.className = 'response';
        responseElement.textContent = verse.response;

        versesContainer.appendChild(verseElement);
        versesContainer.appendChild(responseElement);
    });

    // Atualizar oração final
    document.getElementById('final-prayer').textContent = angelus.prayer;

    // Adicionar classe de fade-in ao carregar
    document.body.classList.add('fade-in');
}

// Atualizar o conteúdo quando a página carregar
window.addEventListener('load', updatePrayerContent); 