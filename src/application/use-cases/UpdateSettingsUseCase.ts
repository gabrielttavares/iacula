/**
 * Use Case: UpdateSettingsUseCase
 * Atualiza as configurações do aplicativo.
 */

import { ISettingsRepository } from '../ports/ISettingsRepository';
import { IAutoStartService } from '../ports/IAutoStartService';
import { UpdateSettingsDTO, SettingsDTO } from '../dto/SettingsDTO';

export interface UpdateSettingsResult {
  success: boolean;
  settings: SettingsDTO;
  easterTimeChanged: boolean;
}

export class UpdateSettingsUseCase {
  constructor(
    private readonly settingsRepository: ISettingsRepository,
    private readonly autoStartService: IAutoStartService
  ) {}

  async execute(dto: UpdateSettingsDTO): Promise<UpdateSettingsResult> {
    const currentSettings = await this.settingsRepository.load();
    const oldEasterTime = currentSettings.easterTime;

    const updatedSettings = currentSettings.update(dto);

    await this.settingsRepository.save(updatedSettings);

    // Update autostart if changed
    if (dto.autostart !== undefined) {
      await this.autoStartService.setup(dto.autostart);
    }

    return {
      success: true,
      settings: updatedSettings.toPlainObject(),
      easterTimeChanged: oldEasterTime !== updatedSettings.easterTime,
    };
  }
}
