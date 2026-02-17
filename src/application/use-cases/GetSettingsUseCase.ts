/**
 * Use Case: GetSettingsUseCase
 * Obtém as configurações atuais do aplicativo.
 */

import { ISettingsRepository } from '../ports/ISettingsRepository';
import { SettingsDTO } from '../dto/SettingsDTO';

export class GetSettingsUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) {}

  async execute(): Promise<SettingsDTO> {
    const settings = await this.settingsRepository.load();

    return {
      interval: settings.interval,
      duration: settings.duration,
      autostart: settings.autostart,
      easterTime: settings.easterTime,
      language: settings.language,
      laudesEnabled: settings.laudesEnabled,
      vespersEnabled: settings.vespersEnabled,
      complineEnabled: settings.complineEnabled,
      oraMediaEnabled: settings.oraMediaEnabled,
      laudesTime: settings.laudesTime,
      vespersTime: settings.vespersTime,
      complineTime: settings.complineTime,
      oraMediaTime: settings.oraMediaTime,
    };
  }
}
