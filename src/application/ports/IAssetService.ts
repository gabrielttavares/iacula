/**
 * Port: IAssetService
 * Interface para acesso aos assets (imagens, JSONs de orações/citações).
 * A implementação concreta fica na camada de infraestrutura.
 */

import { QuotesCollection } from '../../domain/entities/Quote';
import { PrayerCollection } from '../../domain/entities/Prayer';

export interface IAssetService {
  /**
   * Carrega a coleção de citações para um idioma específico.
   */
  loadQuotes(language: string): Promise<QuotesCollection>;

  /**
   * Carrega a coleção de orações para um idioma específico.
   */
  loadPrayers(language: string): Promise<PrayerCollection>;

  /**
   * Obtém o caminho absoluto para uma imagem do dia.
   */
  getImagePath(dayOfWeek: number): Promise<string | null>;

  /**
   * Lista todas as imagens disponíveis para um dia.
   */
  listDayImages(dayOfWeek: number): Promise<string[]>;

  /**
   * Obtém o caminho da imagem do Angelus.
   */
  getAngelusImagePath(): Promise<string>;

  /**
   * Obtém o caminho da imagem da Regina Caeli.
   */
  getReginaCaeliImagePath(): Promise<string>;
}
