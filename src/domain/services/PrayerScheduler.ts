/**
 * Domain Service: PrayerScheduler
 * Lógica pura para cálculo de agendamento de orações.
 * Não depende de Electron, Node ou qualquer infraestrutura.
 */

export interface ScheduleResult {
  nextTriggerTime: Date;
  delayMs: number;
}

export class PrayerScheduler {
  /**
   * Calcula o próximo horário de meio-dia para o Angelus/Regina Caeli.
   */
  static calculateNextNoon(currentTime: Date = new Date()): ScheduleResult {
    const nextNoon = new Date(currentTime);
    nextNoon.setHours(12, 0, 0, 0);

    if (currentTime >= nextNoon) {
      nextNoon.setDate(nextNoon.getDate() + 1);
    }

    const delayMs = nextNoon.getTime() - currentTime.getTime();

    return {
      nextTriggerTime: nextNoon,
      delayMs,
    };
  }

  /**
   * Verifica se o horário atual é meio-dia (12:00 - 12:01).
   * Usado para validar se o timer disparou no momento correto.
   */
  static isNoonTime(currentTime: Date = new Date()): boolean {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return hours === 12 && minutes <= 1;
  }

  /**
   * Calcula o intervalo em milissegundos para 24 horas.
   */
  static get dailyIntervalMs(): number {
    return 24 * 60 * 60 * 1000;
  }

  /**
   * Retorna o dia da semana (1-7, Domingo-Sábado).
   */
  static getDayOfWeek(date: Date = new Date()): number {
    return date.getDay() + 1;
  }
}
