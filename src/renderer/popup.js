const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');
const { getAssetPath } = require('./utils');

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

async function loadQuotes() {
    try {
        const language = await loadLanguage();
        const quotesPath = getAssetPath(`quotes/${language}/quotes.json`);
        console.log('Loading quotes from:', quotesPath);
        return JSON.parse(fs.readFileSync(quotesPath, 'utf-8'));
    } catch (error) {
        console.error('Error loading quotes:', error);
        return null;
    }
}

function loadIndices() {
    try {
        const indicesPath = path.join(ipcRenderer.sendSync('get-user-data-path'), 'indices.json');
        console.log('Loading indices from:', indicesPath);

        if (fs.existsSync(indicesPath)) {
            const data = JSON.parse(fs.readFileSync(indicesPath, 'utf-8'));
            const currentDay = new Date().getDay() + 1;

            if (data.lastDay !== currentDay) {
                return {
                    quoteIndices: {},
                    imageIndices: {},
                    lastDay: currentDay
                };
            }
            return data;
        }
    } catch (error) {
        console.error('Error loading indices:', error);
    }
    return {
        quoteIndices: {},
        imageIndices: {},
        lastDay: new Date().getDay() + 1
    };
}

function saveIndices(indices) {
    try {
        const indicesPath = path.join(ipcRenderer.sendSync('get-user-data-path'), 'indices.json');
        console.log('Saving indices to:', indicesPath);
        indices.lastDay = new Date().getDay() + 1;
        fs.writeFileSync(indicesPath, JSON.stringify(indices, null, 2));
    } catch (error) {
        console.error('Error saving indices:', error);
    }
}

// Load initial indices
const indices = loadIndices();
const quoteIndices = indices.quoteIndices;
const imageIndices = indices.imageIndices;

async function getSequentialQuote() {
    const quotes = await loadQuotes();
    if (!quotes) {
        console.error('Failed to load quotes');
        return 'Error loading quote';
    }

    const dayOfWeek = new Date().getDay() + 1; // 1-7 (Domingo-Sábado)
    const dayQuotes = quotes[dayOfWeek.toString()].quotes;

    if (!quoteIndices[dayOfWeek]) {
        quoteIndices[dayOfWeek] = 0;
    }

    const quote = dayQuotes[quoteIndices[dayOfWeek]];

    quoteIndices[dayOfWeek] = (quoteIndices[dayOfWeek] + 1) % dayQuotes.length;

    saveIndices({ quoteIndices, imageIndices });

    return quote;
}

function getSequentialImage() {
    try {
        const dayOfWeek = new Date().getDay() + 1; // 1-7 (Domingo-Sábado)
        const imagesDir = getAssetPath(`images/ordinary/${dayOfWeek}`);
        console.log('Loading images from:', imagesDir);

        const images = fs.readdirSync(imagesDir);
        if (images.length === 0) {
            console.error('No images found in directory:', imagesDir);
            return null;
        }

        if (!imageIndices[dayOfWeek]) {
            imageIndices[dayOfWeek] = 0;
        }

        const image = images[imageIndices[dayOfWeek]];
        imageIndices[dayOfWeek] = (imageIndices[dayOfWeek] + 1) % images.length;

        saveIndices({ quoteIndices, imageIndices });

        const imagePath = path.join(imagesDir, image);
        console.log('Selected image path:', imagePath);
        return imagePath;
    } catch (error) {
        console.error('Error getting sequential image:', error);
        return null;
    }
}

async function updatePopupContent() {
    const quoteElement = document.getElementById('daily-quote');
    const imageElement = document.getElementById('daily-image');

    if (quoteElement && imageElement) {
        try {
            const quote = await getSequentialQuote();
            const imagePath = getSequentialImage();

            quoteElement.textContent = quote;
            imageElement.src = imagePath;

            // Adicionar classe de fade-in ao carregar
            document.body.classList.add('fade-in');
        } catch (error) {
            console.error('Erro ao carregar conteúdo do popup:', error);
        }
    }
}

function closePopup() {
    window.close();
}

async function initializePopup() {
    try {
        await updatePopupContent();
    } catch (error) {
        console.error('Erro ao inicializar popup:', error);
    }
}

// Atualizar o conteúdo quando a página carregar
window.addEventListener('load', initializePopup);

document.getElementById('close-button').addEventListener('click', closePopup);