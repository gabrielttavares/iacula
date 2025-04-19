const fs = require('fs');
const path = require('path');

function loadQuotes() {
    const quotesPath = path.join(__dirname, '../../assets/quotes/quotes.json');
    return JSON.parse(fs.readFileSync(quotesPath, 'utf-8'));
}

function getRandomQuote() {
    const quotes = loadQuotes();
    const dayOfWeek = new Date().getDay() + 1; // 1-7 (Domingo-Sábado)
    const dayQuotes = quotes[dayOfWeek.toString()].quotes;
    const randomIndex = Math.floor(Math.random() * dayQuotes.length);
    return dayQuotes[randomIndex];
}

function getRandomImage() {
    const dayOfWeek = new Date().getDay() + 1; // 1-7 (Domingo-Sábado)
    const imagesDir = path.join(__dirname, `../../assets/images/ordinary/${dayOfWeek}`);
    const images = fs.readdirSync(imagesDir);
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return path.join(imagesDir, randomImage);
}

function updatePopupContent() {
    const quoteElement = document.getElementById('daily-quote');
    const imageElement = document.getElementById('daily-image');

    if (quoteElement && imageElement) {
        try {
            const quote = getRandomQuote();
            const imagePath = getRandomImage();

            quoteElement.textContent = quote;
            imageElement.src = imagePath;

            // Adicionar classe de fade-in ao carregar
            document.body.classList.add('fade-in');
        } catch (error) {
            console.error('Erro ao carregar conteúdo do popup:', error);
        }
    }
}

// Atualizar o conteúdo quando a página carregar
window.addEventListener('load', updatePopupContent); 