/**
 * Port: ISettingsRepository
 * Interface para persistência de configurações.
 * A implementação concreta fica na camada de infraestrutura.
 */

import { Settings, SettingsProps } from '../../domain/entities/Settings';

export interface ISettingsRepository {
  /**
   * Carrega as configurações persistidas.
   * Retorna as configurações padrão se não existirem.
   */
  load(): Promise<Settings>;

  /**
   * Persiste as configurações.
   */
  save(settings: Settings): Promise<void>;

  /**
   * Verifica se existem configurações salvas.
   */
  exists(): Promise<boolean>;
}
