import { app, BrowserWindow, Tray, Menu, nativeImage, screen, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { setupAutoStart } from './autostart';

// Enable remote module
require('@electron/remote/main').initialize();

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
    private popupIntervalTimer: NodeJS.Timeout | null = null;
    private popupCloseTimer: NodeJS.Timeout | null = null;
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
                console.log('Saving new settings:', settings);
                this.config = { ...this.config, ...settings };
                this.saveConfig();
                // Reiniciar timers com novas configurações
                if (this.popupIntervalTimer) {
                    console.log('Clearing existing interval timer');
                    clearInterval(this.popupIntervalTimer);
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
        // Use different icon paths based on platform
        let iconPath;
        if (process.platform === 'win32') {
            iconPath = path.join(__dirname, '../../assets/images/icon.ico');
        } else if (process.platform === 'darwin') {
            iconPath = path.join(__dirname, '../../assets/images/icon.icns');
        } else {
            iconPath = path.join(__dirname, '../../assets/images/icon.png');
        }

        const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
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
            // Update autostart setting
            setupAutoStart(this.config.autostart);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    }

    private setupTimers() {
        // Timer para popups regulares
        console.log('Setting up popup interval timer:', this.config.interval, 'minutes');
        this.popupIntervalTimer = setInterval(() => {
            console.log('Interval timer triggered, showing popup');
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

        // Clear any existing angelus timer
        if (this.angelusTimer) {
            clearTimeout(this.angelusTimer);
        }

        // Set initial timer for today's noon
        this.angelusTimer = setTimeout(() => {
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
        const windowWidth = 280;
        const windowHeight = 360;

        this.mainWindow = new BrowserWindow({
            width: windowWidth,
            height: windowHeight,
            x: width - windowWidth,  // aligns with right edge
            y: height - windowHeight, // aligns with bottom edge, above taskbar
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        // Enable remote module for this window
        require('@electron/remote/main').enable(this.mainWindow.webContents);

        this.mainWindow.loadFile(path.join(__dirname, '../renderer/popup.html'));

        // Handle window close event
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        if (this.popupCloseTimer) {
            clearTimeout(this.popupCloseTimer);
        }

        this.popupCloseTimer = setTimeout(() => {
            if (this.mainWindow) {
                this.mainWindow.destroy();
                this.mainWindow = null;
            }
        }, this.config.duration * 1000);
    }

    private showAngelus(forceEasterTime: boolean = false) {
        const isEasterTime = forceEasterTime !== undefined ? forceEasterTime : this.isEasterTime();
        const prayerType = isEasterTime ? 'reginaCaeli' : 'angelus';

        if (this.mainWindow) {
            this.mainWindow.destroy();
            this.mainWindow = null;
        }

        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const windowWidth = 320;
        const windowHeight = 740;

        this.mainWindow = new BrowserWindow({
            width: windowWidth,
            height: windowHeight,
            x: width - windowWidth,  // aligns with right edge
            y: height - windowHeight, // aligns with bottom edge, above taskbar
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

        // Clear any existing close timer
        if (this.popupCloseTimer) {
            clearTimeout(this.popupCloseTimer);
        }

        // Set new timer for this popup with fixed 1-minute duration
        this.popupCloseTimer = setTimeout(() => {
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
            height: 450,
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