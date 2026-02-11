/**
 * DTO: PrayerDTO
 * Data Transfer Object para orações.
 */

export interface PrayerVerseDTO {
  verse: string;
  response: string;
}

export interface PrayerDTO {
  title: string;
  verses: PrayerVerseDTO[];
  prayer: string;
  type: 'angelus' | 'reginaCaeli';
  imagePath: string;
}
