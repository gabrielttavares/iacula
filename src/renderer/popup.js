const fs = require('fs');
const path = require('path');

function loadQuotes() {
    const quotesPath = path.join(__dirname, '../../assets/quotes/quotes.json');
    return JSON.parse(fs.readFileSync(quotesPath, 'utf-8'));
}

function loadIndices() {
    const indicesPath = path.join(__dirname, '../../assets/indices.json');
    try {
        if (fs.existsSync(indicesPath)) {
            return JSON.parse(fs.readFileSync(indicesPath, 'utf-8'));
        }
    } catch (error) {
        console.error('Error loading indices:', error);
    }
    return { quoteIndices: {}, imageIndices: {} };
}

function saveIndices(indices) {
    const indicesPath = path.join(__dirname, '../../assets/indices.json');
    try {
        fs.writeFileSync(indicesPath, JSON.stringify(indices, null, 2));
    } catch (error) {
        console.error('Error saving indices:', error);
    }
}

// Load initial indices
const indices = loadIndices();
const quoteIndices = indices.quoteIndices;
const imageIndices = indices.imageIndices;

function getSequentialQuote() {
    const quotes = loadQuotes();
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
    const dayOfWeek = new Date().getDay() + 1; // 1-7 (Domingo-Sábado)
    const imagesDir = path.join(__dirname, `../../assets/images/ordinary/${dayOfWeek}`);
    const images = fs.readdirSync(imagesDir);

    if (!imageIndices[dayOfWeek]) {
        imageIndices[dayOfWeek] = 0;
    }

    const image = images[imageIndices[dayOfWeek]];

    imageIndices[dayOfWeek] = (imageIndices[dayOfWeek] + 1) % images.length;

    saveIndices({ quoteIndices, imageIndices });

    return path.join(imagesDir, image);
}

function updatePopupContent() {
    const quoteElement = document.getElementById('daily-quote');
    const imageElement = document.getElementById('daily-image');

    if (quoteElement && imageElement) {
        try {
            const quote = getSequentialQuote();
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

// Atualizar o conteúdo quando a página carregar
window.addEventListener('load', updatePopupContent);

document.getElementById('close-button').addEventListener('click', closePopup);