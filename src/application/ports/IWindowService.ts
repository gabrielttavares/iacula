/**
 * Port: IWindowService
 * Interface para gerenciamento de janelas do aplicativo.
 * Abstrai as operações de criação/exibição de janelas.
 */

export type WindowType = 'popup' | 'angelus' | 'reginaCaeli' | 'settings';

export interface WindowOptions {
  width?: number;
  height?: number;
  autoClose?: boolean;
  autoCloseDelayMs?: number;
}

export interface IWindowService {
  /**
   * Exibe uma janela do tipo especificado.
   */
  show(type: WindowType, options?: WindowOptions): Promise<void>;

  /**
   * Fecha uma janela específica.
   */
  close(type: WindowType): Promise<void>;

  /**
   * Fecha todas as janelas abertas.
   */
  closeAll(): Promise<void>;

  /**
   * Verifica se uma janela está aberta.
   */
  isOpen(type: WindowType): boolean;
}
