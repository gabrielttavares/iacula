/**
 * Use Case: GetPrayerUseCase
 * Obtém a oração apropriada (Angelus ou Regina Caeli).
 */

import { ISettingsRepository } from '../ports/ISettingsRepository';
import { IAssetService } from '../ports/IAssetService';
import { PrayerDTO } from '../dto/PrayerDTO';
import { Prayer } from '../../domain/entities/Prayer';
import { ILiturgicalSeasonService } from '../ports/ILiturgicalSeasonService';

export class GetPrayerUseCase {
  constructor(
    private readonly settingsRepository: ISettingsRepository,
    private readonly assetService: IAssetService,
    private readonly liturgicalSeasonService: ILiturgicalSeasonService
  ) {}

  /**
   * @param forceEasterTime - Se definido, sobrescreve a configuração de easterTime
   */
  async execute(forceEasterTime?: boolean): Promise<PrayerDTO> {
    const settings = await this.settingsRepository.load();
    const prayerCollection = await this.assetService.loadPrayers(settings.language);
    const season = await this.liturgicalSeasonService.getCurrentSeason();

    const isEasterTime = forceEasterTime ?? season === 'easter';
    const prayer = Prayer.fromCollection(prayerCollection, isEasterTime);

    const imagePath = isEasterTime
      ? await this.assetService.getReginaCaeliImagePath()
      : await this.assetService.getAngelusImagePath();

    return {
      title: prayer.title,
      verses: prayer.verses,
      prayer: prayer.prayer,
      type: prayer.type,
      imagePath,
    };
  }
}
