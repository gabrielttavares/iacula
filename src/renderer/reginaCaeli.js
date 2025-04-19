const fs = require('fs');
const path = require('path');

// Função para carregar as orações do arquivo JSON
function loadPrayers() {
    const prayersPath = path.join(__dirname, '../../assets/prayers/angelus.json');
    return JSON.parse(fs.readFileSync(prayersPath, 'utf-8'));
}

// Função para obter a imagem da Regina Caeli
function getReginaCaeliImage() {
    const imagePath = path.join(__dirname, '../../assets/images/reginaCaeli/Regina caeli.jpg');
    return imagePath;
}

// Função para atualizar o conteúdo da oração
function updatePrayerContent() {
    const prayers = loadPrayers();
    const reginaCaeli = prayers.easter;
    const imagePath = getReginaCaeliImage();

    // Atualizar título
    document.getElementById('prayer-title').textContent = reginaCaeli.title;

    // Atualizar imagem
    const imageElement = document.getElementById('regina-caeli-image');
    imageElement.src = imagePath;

    // Atualizar versículos
    const versesContainer = document.getElementById('verses-container');
    versesContainer.innerHTML = '';

    reginaCaeli.verses.forEach(verse => {
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
    document.getElementById('final-prayer').textContent = reginaCaeli.prayer;

    // Adicionar classe de fade-in ao carregar
    document.body.classList.add('fade-in');
}

document.getElementById('close-button').addEventListener('click', () => {
    window.close();
});

// Atualizar o conteúdo quando a página carregar
window.addEventListener('load', updatePrayerContent); 