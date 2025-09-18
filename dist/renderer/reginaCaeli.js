const fs = require('fs');
const path = require('path');
const { getAssetPath } = require('./utils');
const { ipcRenderer } = require('electron');

const DEFAULT_LANGUAGE = 'pt-br';

async function loadLanguage() {
    try {
        const config = await ipcRenderer.invoke('get-config');
        const language = config.language || 'pt-br';
        return language;
    } catch (error) {
        return DEFAULT_LANGUAGE;
    }
}

// Função para carregar as orações do arquivo JSON
async function loadPrayers() {
    try {
        const language = await loadLanguage();

        const prayersPath = getAssetPath(`prayers/${language}/angelus.json`);
        console.log('Loading prayers from:', prayersPath);
        const prayers = JSON.parse(fs.readFileSync(prayersPath, 'utf-8'));
        console.log('Loaded prayers:', prayers);
        return prayers;
    } catch (error) {
        console.error('Error loading prayers:', error);
        return null;
    }
}

// Função para obter a imagem da Regina Caeli
function getReginaCaeliImage() {
    try {
        const imagePath = getAssetPath('images/reginaCaeli/Regina caeli.jpg');
        console.log('Loading Regina Caeli image from:', imagePath);
        return imagePath;
    } catch (error) {
        console.error('Error getting Regina Caeli image:', error);
        return null;
    }
}

// Função para atualizar o conteúdo da oração
async function updatePrayerContent() {
    try {
        const prayers = await loadPrayers();
        if (!prayers) {
            console.error('Failed to load prayers');
            return;
        }

        const reginaCaeli = prayers.easter;
        const imagePath = getReginaCaeliImage();

        // Atualizar título
        document.getElementById('prayer-title').textContent = reginaCaeli.title;

        // Atualizar imagem
        const imageElement = document.getElementById('regina-caeli-image');
        if (imagePath) {
            imageElement.src = imagePath;
        }

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
    } catch (error) {
        console.error('Error updating prayer content:', error);
    }
}

document.getElementById('close-button').addEventListener('click', () => {
    window.close();
});

async function initializeReginaCaeli() {
    try {
        await updatePrayerContent();
    } catch (error) {
        console.error('Error initializing Regina Caeli:', error);
    }
}

// Atualizar o conteúdo quando a página carregar
window.addEventListener('load', initializeReginaCaeli); 