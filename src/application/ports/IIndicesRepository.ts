/**
 * Port: IIndicesRepository
 * Interface para persistência dos índices de citações/imagens.
 * Permite manter a sequência entre sessões.
 */

import { QuoteIndices } from '../../domain/services/QuoteSelector';

export interface IIndicesRepository {
  /**
   * Carrega os índices persistidos.
   */
  load(): Promise<QuoteIndices>;

  /**
   * Persiste os índices.
   */
  save(indices: QuoteIndices): Promise<void>;
}
