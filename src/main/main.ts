import { app, BrowserWindow, Tray, Menu, nativeImage, screen, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

// Configurações padrão
const DEFAULT_CONFIG = {
    interval: 15, // minutos
    duration: 10, // segundos
    autostart: true
};

// Interface para as configurações
interface AppConfig {
    interval: number;
    duration: number;
    autostart: boolean;
}

class IaculaApp {
    private mainWindow: BrowserWindow | null = null;
    private tray: Tray | null = null;
    private config: AppConfig = DEFAULT_CONFIG;
    private popupTimer: NodeJS.Timeout | null = null;
    private angelusTimer: NodeJS.Timeout | null = null;
    private settingsWindow: BrowserWindow | null = null;

    constructor() {
        app.whenReady().then(() => {
            this.createTray();
            this.loadConfig();
            this.setupTimers();
            this.setupAngelusTimer();
            this.setupIPC();
            this.showPopup();
        });

        app.on('window-all-closed', () => {
            // app in background
        });
    }

    private setupIPC() {
        // Handler para salvar configurações
        ipcMain.on('save-settings', (event, settings) => {
            try {
                this.config = { ...this.config, ...settings };
                this.saveConfig();
                // Reiniciar timers com novas configurações
                if (this.popupTimer) {
                    clearInterval(this.popupTimer);
                }
                this.setupTimers();
                event.reply('settings-saved', true);
            } catch (error) {
                console.error('Erro ao salvar configurações:', error);
                event.reply('settings-saved', false);
            }
        });

        // Handler para fechar janela de configurações e mostrar popup
        ipcMain.on('close-settings-and-show-popup', () => {
            if (this.settingsWindow) {
                this.settingsWindow.close();
                this.settingsWindow = null;
            }
            this.showPopup();
        });

        // Handler para carregar configurações
        ipcMain.handle('get-config', () => {
            return this.config;
        });
    }

    private createTray() {
        const iconPath = path.join(__dirname, '../../assets/images/icon.png');
        const trayIcon = nativeImage.createFromPath(iconPath);
        this.tray = new Tray(trayIcon);

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Mostrar jaculatória',
                click: () => this.showPopup()
            },
            {
                label: 'Mostrar Angelus',
                click: () => this.showAngelus(false)
            },
            {
                label: 'Mostrar Regina Caeli (Tempo Pascal)',
                click: () => this.showAngelus(true)
            },
            { type: 'separator' },
            {
                label: 'Configurações',
                click: () => this.showSettings()
            },
            { type: 'separator' },
            {
                label: 'Sair',
                click: () => app.quit()
            }
        ]);

        this.tray.setToolTip('Iacula');
        this.tray.setContextMenu(contextMenu);
    }

    private loadConfig() {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        try {
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf-8');
                this.config = { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
            } else {
                // Se o arquivo de configuração não existir, criar com as configurações padrão
                this.saveConfig();
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            this.config = { ...DEFAULT_CONFIG };
        }
    }

    private saveConfig() {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        try {
            fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    }

    private setupTimers() {
        // Timer para popups regulares
        this.popupTimer = setInterval(() => {
            this.showPopup();
        }, this.config.interval * 60 * 1000);

        // Timer para Angelus/Regina Caeli
        this.setupAngelusTimer();
    }

    private setupAngelusTimer() {
        const now = new Date();
        const nextNoon = new Date(now);
        nextNoon.setHours(12, 0, 0, 0);

        if (now > nextNoon) {
            nextNoon.setDate(nextNoon.getDate() + 1);
        }

        const timeUntilNoon = nextNoon.getTime() - now.getTime();

        setTimeout(() => {
            this.showAngelus();
            // Configurar o próximo timer para amanhã
            this.angelusTimer = setInterval(() => {
                this.showAngelus();
            }, 24 * 60 * 60 * 1000);
        }, timeUntilNoon);
    }

    private showPopup() {
        if (this.mainWindow) {
            this.mainWindow.destroy();
            this.mainWindow = null;
        }

        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        this.mainWindow = new BrowserWindow({
            width: 300,
            height: 400,
            x: width - 305,
            y: height - 405,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        this.mainWindow.loadFile(path.join(__dirname, '../renderer/popup.html'));

        // Handle window close event
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        if (this.popupTimer) {
            clearTimeout(this.popupTimer);
        }

        this.popupTimer = setTimeout(() => {
            if (this.mainWindow) {
                this.mainWindow.destroy();
                this.mainWindow = null;
            }
        }, this.config.duration * 1000);
    }

    private showAngelus(forceEasterTime: boolean = false) {
        const isEasterTime = forceEasterTime || this.isEasterTime();
        const prayerType = isEasterTime ? 'reginaCaeli' : 'angelus';

        if (this.mainWindow) {
            this.mainWindow.destroy();
            this.mainWindow = null;
        }

        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        this.mainWindow = new BrowserWindow({
            width: 400,
            height: 500,
            x: width - 420,
            y: height - 520,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        this.mainWindow.loadFile(path.join(__dirname, `../renderer/${prayerType}.html`));

        // Handle window close event
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        if (this.popupTimer) {
            clearTimeout(this.popupTimer);
        }

        this.popupTimer = setTimeout(() => {
            if (this.mainWindow) {
                this.mainWindow.destroy();
                this.mainWindow = null;
            }
        }, 60 * 1000); // 1 minute in milliseconds
    }

    private isEasterTime(): boolean {
        const now = new Date();
        const year = now.getFullYear();

        // Implementar lógica para determinar se estamos no Tempo Pascal
        // (desde o Sábado Santo até Pentecostes)
        const easterDate = this.calculateEasterDate(year);
        const pentecostDate = new Date(easterDate);
        pentecostDate.setDate(easterDate.getDate() + 49);

        return now >= easterDate && now <= pentecostDate;
    }

    private calculateEasterDate(year: number): Date {
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

        return new Date(year, month - 1, day);
    }

    private showSettings() {
        this.settingsWindow = new BrowserWindow({
            width: 400,
            height: 300,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        this.settingsWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));
    }
}

// Inicializar o aplicativo
new IaculaApp(); 