/**
 * Port: IAutoStartService
 * Interface para configuração de inicialização automática do app.
 */

export interface IAutoStartService {
  /**
   * Configura ou remove a inicialização automática.
   */
  setup(enable: boolean): Promise<void>;

  /**
   * Verifica se a inicialização automática está habilitada.
   */
  isEnabled(): Promise<boolean>;
}
