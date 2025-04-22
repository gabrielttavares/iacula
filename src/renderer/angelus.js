const fs = require('fs');
const path = require('path');
const { getAssetPath } = require('./utils');

// Função para carregar as orações do arquivo JSON
function loadPrayers() {
    try {
        const prayersPath = getAssetPath('prayers/angelus.json');
        console.log('Loading prayers from:', prayersPath);
        const prayers = JSON.parse(fs.readFileSync(prayersPath, 'utf-8'));
        console.log('Loaded prayers:', prayers);
        return prayers;
    } catch (error) {
        console.error('Error loading prayers:', error);
        return null;
    }
}

function getAngelusImage() {
    try {
        const imagePath = getAssetPath('images/angelus/J.jpg');
        console.log('Loading Angelus image from:', imagePath);
        return imagePath;
    } catch (error) {
        console.error('Error getting Angelus image:', error);
        return null;
    }
}

// Função para atualizar o conteúdo da oração
function updatePrayerContent() {
    try {
        const prayers = loadPrayers();
        if (!prayers) {
            console.error('Failed to load prayers');
            return;
        }

        const angelus = prayers.regular;
        const imagePath = getAngelusImage();

        // Atualizar título
        document.getElementById('prayer-title').textContent = angelus.title;

        // Atualizar imagem
        const imageElement = document.getElementById('angelus-image');
        if (imagePath) {
            imageElement.src = imagePath;
        }

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
    } catch (error) {
        console.error('Error updating prayer content:', error);
    }
}

// Atualizar o conteúdo quando a página carregar
window.addEventListener('load', updatePrayerContent);

document.getElementById('close-button').addEventListener('click', () => {
    window.close();
});