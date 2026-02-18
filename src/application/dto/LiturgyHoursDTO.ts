export type LiturgyHourModule = 'laudes' | 'vespers' | 'compline' | 'ora_media';

export interface LiturgyReminderDTO {
  module: LiturgyHourModule;
  title: string;
  summary: string;
}
