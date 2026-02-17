import { LiturgyHourModule } from '../application/dto/LiturgyHoursDTO';

const OFFICE_QUERY_BY_MODULE: Record<LiturgyHourModule, string> = {
  laudes: 'lodi',
  vespers: 'vespri',
  compline: 'compieta',
  ora_media: 'ora_media',
};

export function buildIbreviaryOfficeUrl(module: LiturgyHourModule | string): string {
  const office = OFFICE_QUERY_BY_MODULE[module as LiturgyHourModule] ?? 'lodi';
  const url = new URL('https://www.ibreviary.com/m2/breviario.php');
  url.searchParams.set('lang', 'pt');
  url.searchParams.set('s', office);
  return url.toString();
}
