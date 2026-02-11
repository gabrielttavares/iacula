/**
 * Bootstrap: Container
 * Container de Injeção de Dependência manual.
 * Centraliza a criação e configuração de todas as dependências.
 */

import { app } from 'electron';
import path from 'path';

// Ports
import { ISettingsRepository } from '../../application/ports/ISettingsRepository';
import { IAssetService } from '../../application/ports/IAssetService';
import { IIndicesRepository } from '../../application/ports/IIndicesRepository';
import { IAutoStartService } from '../../application/ports/IAutoStartService';
import { IWindowService } from '../../application/ports/IWindowService';

// Infrastructure implementations
import { FileSettingsRepository } from '../../infrastructure/storage/FileSettingsRepository';
import { FileAssetService } from '../../infrastructure/storage/FileAssetService';
import { FileIndicesRepository } from '../../infrastructure/storage/FileIndicesRepository';
import { AutoStartService } from '../../infrastructure/electron/AutoStartService';
import { WindowService } from '../../infrastructure/electron/WindowService';

// Use Cases
import { GetSettingsUseCase } from '../../application/use-cases/GetSettingsUseCase';
import { UpdateSettingsUseCase } from '../../application/use-cases/UpdateSettingsUseCase';
import { GetNextQuoteUseCase } from '../../application/use-cases/GetNextQuoteUseCase';
import { GetPrayerUseCase } from '../../application/use-cases/GetPrayerUseCase';

// IPC Handlers
import { SettingsIpcHandler } from '../ipc/SettingsIpcHandler';
import { QuoteIpcHandler } from '../ipc/QuoteIpcHandler';
import { PrayerIpcHandler } from '../ipc/PrayerIpcHandler';
import { SystemIpcHandler } from '../ipc/SystemIpcHandler';

export interface ContainerCallbacks {
  onSettingsUpdated: (easterTimeChanged: boolean) => void;
  onCloseSettingsAndShowPopup: () => void;
}

export class Container {
  // Repositories
  private _settingsRepository: ISettingsRepository | null = null;
  private _assetService: IAssetService | null = null;
  private _indicesRepository: IIndicesRepository | null = null;
  private _autoStartService: IAutoStartService | null = null;
  private _windowService: IWindowService | null = null;

  // Use Cases
  private _getSettingsUseCase: GetSettingsUseCase | null = null;
  private _updateSettingsUseCase: UpdateSettingsUseCase | null = null;
  private _getNextQuoteUseCase: GetNextQuoteUseCase | null = null;
  private _getPrayerUseCase: GetPrayerUseCase | null = null;

  // IPC Handlers
  private _settingsIpcHandler: SettingsIpcHandler | null = null;
  private _quoteIpcHandler: QuoteIpcHandler | null = null;
  private _prayerIpcHandler: PrayerIpcHandler | null = null;
  private _systemIpcHandler: SystemIpcHandler | null = null;

  private readonly isDevelopment: boolean;
  private readonly userDataPath: string;
  private readonly resourcesPath: string;
  private readonly presentationPath: string;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.userDataPath = app.getPath('userData');
    this.resourcesPath = process.resourcesPath || process.cwd();
    this.presentationPath = path.join(__dirname, '../presentation');
  }

  // Repositories
  get settingsRepository(): ISettingsRepository {
    if (!this._settingsRepository) {
      this._settingsRepository = new FileSettingsRepository(this.userDataPath);
    }
    return this._settingsRepository;
  }

  get assetService(): IAssetService {
    if (!this._assetService) {
      this._assetService = new FileAssetService(this.resourcesPath, this.isDevelopment);
    }
    return this._assetService;
  }

  get indicesRepository(): IIndicesRepository {
    if (!this._indicesRepository) {
      this._indicesRepository = new FileIndicesRepository(this.userDataPath);
    }
    return this._indicesRepository;
  }

  get autoStartService(): IAutoStartService {
    if (!this._autoStartService) {
      this._autoStartService = new AutoStartService();
    }
    return this._autoStartService;
  }

  get windowService(): IWindowService {
    if (!this._windowService) {
      this._windowService = new WindowService(this.presentationPath);
    }
    return this._windowService;
  }

  // Use Cases
  get getSettingsUseCase(): GetSettingsUseCase {
    if (!this._getSettingsUseCase) {
      this._getSettingsUseCase = new GetSettingsUseCase(this.settingsRepository);
    }
    return this._getSettingsUseCase;
  }

  get updateSettingsUseCase(): UpdateSettingsUseCase {
    if (!this._updateSettingsUseCase) {
      this._updateSettingsUseCase = new UpdateSettingsUseCase(
        this.settingsRepository,
        this.autoStartService
      );
    }
    return this._updateSettingsUseCase;
  }

  get getNextQuoteUseCase(): GetNextQuoteUseCase {
    if (!this._getNextQuoteUseCase) {
      this._getNextQuoteUseCase = new GetNextQuoteUseCase(
        this.settingsRepository,
        this.assetService,
        this.indicesRepository
      );
    }
    return this._getNextQuoteUseCase;
  }

  get getPrayerUseCase(): GetPrayerUseCase {
    if (!this._getPrayerUseCase) {
      this._getPrayerUseCase = new GetPrayerUseCase(
        this.settingsRepository,
        this.assetService
      );
    }
    return this._getPrayerUseCase;
  }

  // IPC Handlers
  createIpcHandlers(callbacks: ContainerCallbacks): void {
    this._settingsIpcHandler = new SettingsIpcHandler(
      this.getSettingsUseCase,
      this.updateSettingsUseCase,
      { onSettingsUpdated: callbacks.onSettingsUpdated }
    );

    this._quoteIpcHandler = new QuoteIpcHandler(this.getNextQuoteUseCase);

    this._prayerIpcHandler = new PrayerIpcHandler(this.getPrayerUseCase);

    this._systemIpcHandler = new SystemIpcHandler({
      onCloseSettingsAndShowPopup: callbacks.onCloseSettingsAndShowPopup,
    });
  }

  registerIpcHandlers(): void {
    this._settingsIpcHandler?.register();
    this._quoteIpcHandler?.register();
    this._prayerIpcHandler?.register();
    this._systemIpcHandler?.register();
  }

  unregisterIpcHandlers(): void {
    this._settingsIpcHandler?.unregister();
    this._quoteIpcHandler?.unregister();
    this._prayerIpcHandler?.unregister();
    this._systemIpcHandler?.unregister();
  }
}
