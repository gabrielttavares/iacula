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
    autostart: true,
    easterTime: false,
    language: 'pt-br' // Idioma padrão
};

// Interface para as configurações
interface AppConfig {
    interval: number;
    duration: number;
    autostart: boolean;
    easterTime: boolean;
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
            this.createDockMenu();
            this.loadConfig();

            console.log('==================================');
            console.log('APP CONFIGURATION:');
            console.log('Interval:', this.config.interval, 'minutes');
            console.log('Duration:', this.config.duration, 'seconds');
            console.log('Autostart:', this.config.autostart);
            console.log('Easter Time (Tempo Pascal):', this.config.easterTime);
            console.log('==================================');

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
                const oldEasterTime = this.config.easterTime;
                this.config = { ...this.config, ...settings };
                this.saveConfig();

                // Reiniciar timers com novas configurações
                if (this.popupIntervalTimer) {
                    console.log('Clearing existing interval timer');
                    clearInterval(this.popupIntervalTimer);
                }

                // Reset Angelus/Regina Caeli timer if easterTime setting changed
                if (oldEasterTime !== this.config.easterTime) {
                    console.log(`Easter time setting changed from ${oldEasterTime} to ${this.config.easterTime}`);
                    if (this.angelusTimer) {
                        console.log('Clearing and resetting Angelus/Regina Caeli timer');
                        clearTimeout(this.angelusTimer);
                        clearInterval(this.angelusTimer);
                        this.setupAngelusTimer();
                    }
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

        ipcMain.on('get-user-data-path', (event) => {
            event.returnValue = app.getPath('userData');
        });
    }

    private createTray() {
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

    private createDockMenu() {
        if (process.platform !== 'darwin') return;

        const dockMenu = Menu.buildFromTemplate([
        { label: 'Mostrar jaculatória', click: () => this.showPopup() },
        { label: 'Mostrar Angelus', click: () => this.showAngelus(false) },
        { label: 'Mostrar Regina Caeli (Tempo Pascal)', click: () => this.showAngelus(true) },
        { type: 'separator' },
        { label: 'Configurações', click: () => this.showSettings() },
        { type: 'separator' },
        ]);

        app.dock.setMenu(dockMenu);
    }

    private loadConfig() {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        try {
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf-8');
                let loadedConfig = JSON.parse(configData);

                // Handle potential nested config object (seen in logs)
                if (loadedConfig.config && typeof loadedConfig.config === 'object') {
                    console.log('Found nested config object, flattening...');
                    loadedConfig = { ...loadedConfig, ...loadedConfig.config };
                    delete loadedConfig.config;
                }

                // Ensure all properties exist, using defaults for any missing ones
                this.config = {
                    ...DEFAULT_CONFIG,
                    ...loadedConfig,
                    // Make sure easterTime is explicitly set if missing
                    easterTime: loadedConfig.easterTime !== undefined ? loadedConfig.easterTime : DEFAULT_CONFIG.easterTime
                };
                console.log('Loaded config:', this.config);
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
        console.log(`Setting up Angelus/Regina Caeli timer for ${nextNoon.toLocaleString()}, in ${timeUntilNoon / 1000 / 60} minutes`);

        // Clear any existing angelus timer
        if (this.angelusTimer) {
            clearTimeout(this.angelusTimer);
        }

        // Set initial timer for today's noon
        this.angelusTimer = setTimeout(() => {
            console.log('Noon timer triggered, current easterTime setting:', this.config.easterTime);
            this.showAngelus();
            // Configurar o próximo timer para amanhã
            this.angelusTimer = setInterval(() => {
                console.log('Daily noon timer triggered, current easterTime setting:', this.config.easterTime);
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

    private showAngelus(forceEasterTime: boolean | undefined = undefined) {
        console.log(`showAngelus called with forceEasterTime=${forceEasterTime}, config.easterTime=${this.config.easterTime}`);
        // Use the forced value if provided, otherwise use the config setting
        const isEasterTime = forceEasterTime === undefined ? this.config.easterTime : forceEasterTime;
        const prayerType = isEasterTime ? 'reginaCaeli' : 'angelus';
        console.log(`Showing ${prayerType} based on isEasterTime=${isEasterTime}`);

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