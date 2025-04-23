const { ipcRenderer } = require('electron');

// Configurações padrão
const DEFAULT_CONFIG = {
    interval: 15,
    duration: 10,
    autostart: true,
    easterTime: false
};

// Carregar configurações atuais
async function loadCurrentSettings() {
    try {
        const config = await ipcRenderer.invoke('get-config');
        document.getElementById('interval').value = config.interval;
        document.getElementById('duration').value = config.duration;
        document.getElementById('autostart').checked = config.autostart;
        document.getElementById('easterTime').checked = config.easterTime;
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        // Em caso de erro, usar as configurações padrão
        document.getElementById('interval').value = DEFAULT_CONFIG.interval;
        document.getElementById('duration').value = DEFAULT_CONFIG.duration;
        document.getElementById('autostart').checked = DEFAULT_CONFIG.autostart;
        document.getElementById('easterTime').checked = DEFAULT_CONFIG.easterTime;
    }
}

// Salvar configurações
function saveSettings(event) {
    event.preventDefault();

    const settings = {
        interval: parseInt(document.getElementById('interval').value),
        duration: parseInt(document.getElementById('duration').value),
        autostart: document.getElementById('autostart').checked,
        easterTime: document.getElementById('easterTime').checked
    };

    // Validar valores
    if (settings.interval < 1 || settings.interval > 60) {
        showStatus('O intervalo deve estar entre 1 e 60 minutos', 'error');
        return;
    }

    if (settings.duration < 5 || settings.duration > 30) {
        showStatus('A duração deve estar entre 5 e 30 segundos', 'error');
        return;
    }

    // Enviar configurações para o processo principal
    ipcRenderer.send('save-settings', settings);
}

// Mostrar mensagem de status
function showStatus(message, type) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';

    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadCurrentSettings);
document.getElementById('settings-form').addEventListener('submit', saveSettings);

// Receber resposta do processo principal
ipcRenderer.on('settings-saved', (event, success) => {
    if (success) {
        showStatus('Configurações salvas com sucesso!', 'success');
        ipcRenderer.send('close-settings-and-show-popup');
    } else {
        showStatus('Erro ao salvar configurações', 'error');
    }
}); 