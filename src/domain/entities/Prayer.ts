/**
 * Domain Entity: Prayer
 * Representa uma oração estruturada (Angelus ou Regina Caeli).
 */

export interface PrayerVerse {
  verse: string;
  response: string;
}

export interface PrayerProps {
  title: string;
  verses: PrayerVerse[];
  prayer: string;
  type: PrayerType;
}

export type PrayerType = 'angelus' | 'reginaCaeli';

export interface PrayerCollection {
  regular: Omit<PrayerProps, 'type'>;
  easter: Omit<PrayerProps, 'type'>;
}

export class Prayer {
  private readonly props: PrayerProps;

  private constructor(props: PrayerProps) {
    this.props = props;
  }

  static create(props: PrayerProps): Prayer {
    Prayer.validate(props);
    return new Prayer(props);
  }

  static fromCollection(collection: PrayerCollection, isEasterTime: boolean): Prayer {
    const source = isEasterTime ? collection.easter : collection.regular;
    const type: PrayerType = isEasterTime ? 'reginaCaeli' : 'angelus';

    return Prayer.create({
      title: source.title,
      verses: source.verses,
      prayer: source.prayer,
      type,
    });
  }

  private static validate(props: PrayerProps): void {
    const errors: string[] = [];

    if (!props.title || props.title.trim().length === 0) {
      errors.push('Prayer title cannot be empty');
    }

    if (!props.verses || props.verses.length === 0) {
      errors.push('Prayer must have at least one verse');
    }

    if (!props.prayer || props.prayer.trim().length === 0) {
      errors.push('Prayer final text cannot be empty');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid prayer: ${errors.join('; ')}`);
    }
  }

  get title(): string {
    return this.props.title;
  }

  get verses(): PrayerVerse[] {
    return [...this.props.verses];
  }

  get prayer(): string {
    return this.props.prayer;
  }

  get type(): PrayerType {
    return this.props.type;
  }

  get isAngelus(): boolean {
    return this.props.type === 'angelus';
  }

  get isReginaCaeli(): boolean {
    return this.props.type === 'reginaCaeli';
  }
}
