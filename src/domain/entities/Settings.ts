/**
 * Domain Entity: Settings
 * Representa as configurações do aplicativo.
 * Entidade pura sem dependências externas.
 */

export interface SettingsProps {
  interval: number;
  duration: number;
  autostart: boolean;
  easterTime: boolean;
  language: string;
  laudesEnabled: boolean;
  vespersEnabled: boolean;
  complineEnabled: boolean;
  oraMediaEnabled: boolean;
  laudesTime: string;
  vespersTime: string;
  complineTime: string;
  oraMediaTime: string;
}

export class Settings {
  private readonly props: SettingsProps;

  private constructor(props: SettingsProps) {
    this.props = props;
  }

  static create(props: Partial<SettingsProps>): Settings {
    const defaults = Settings.defaults;
    const validated = Settings.validate({
      interval: props.interval !== undefined ? props.interval : defaults.interval,
      duration: props.duration !== undefined ? props.duration : defaults.duration,
      autostart: props.autostart !== undefined ? props.autostart : defaults.autostart,
      easterTime: props.easterTime !== undefined ? props.easterTime : defaults.easterTime,
      language: props.language !== undefined ? props.language : defaults.language,
      laudesEnabled: props.laudesEnabled !== undefined ? props.laudesEnabled : defaults.laudesEnabled,
      vespersEnabled: props.vespersEnabled !== undefined ? props.vespersEnabled : defaults.vespersEnabled,
      complineEnabled: props.complineEnabled !== undefined ? props.complineEnabled : defaults.complineEnabled,
      oraMediaEnabled: props.oraMediaEnabled !== undefined ? props.oraMediaEnabled : defaults.oraMediaEnabled,
      laudesTime: props.laudesTime !== undefined ? props.laudesTime : defaults.laudesTime,
      vespersTime: props.vespersTime !== undefined ? props.vespersTime : defaults.vespersTime,
      complineTime: props.complineTime !== undefined ? props.complineTime : defaults.complineTime,
      oraMediaTime: props.oraMediaTime !== undefined ? props.oraMediaTime : defaults.oraMediaTime,
    });
    return new Settings(validated);
  }

  static get defaults(): SettingsProps {
    return {
      interval: 15,
      duration: 10,
      autostart: true,
      easterTime: false,
      language: 'pt-br',
      laudesEnabled: false,
      vespersEnabled: false,
      complineEnabled: false,
      oraMediaEnabled: false,
      laudesTime: '06:00',
      vespersTime: '18:00',
      complineTime: '21:00',
      oraMediaTime: '12:30',
    };
  }

  private static validate(props: SettingsProps): SettingsProps {
    const errors: string[] = [];

    if (props.interval < 1 || props.interval > 60) {
      errors.push('Interval must be between 1 and 60 minutes');
    }

    if (props.duration < 5 || props.duration > 30) {
      errors.push('Duration must be between 5 and 30 seconds');
    }

    const supportedLanguages = ['pt-br', 'en', 'la'];
    if (!supportedLanguages.includes(props.language)) {
      errors.push(`Language must be one of: ${supportedLanguages.join(', ')}`);
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timePattern.test(props.laudesTime)) {
      errors.push('Laudes time must be in HH:MM format');
    }
    if (!timePattern.test(props.vespersTime)) {
      errors.push('Vespers time must be in HH:MM format');
    }
    if (!timePattern.test(props.complineTime)) {
      errors.push('Compline time must be in HH:MM format');
    }
    if (!timePattern.test(props.oraMediaTime)) {
      errors.push('Ora Media time must be in HH:MM format');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid settings: ${errors.join('; ')}`);
    }

    return props;
  }

  get interval(): number {
    return this.props.interval;
  }

  get duration(): number {
    return this.props.duration;
  }

  get autostart(): boolean {
    return this.props.autostart;
  }

  get easterTime(): boolean {
    return this.props.easterTime;
  }

  get language(): string {
    return this.props.language;
  }

  get laudesEnabled(): boolean {
    return this.props.laudesEnabled;
  }

  get vespersEnabled(): boolean {
    return this.props.vespersEnabled;
  }

  get complineEnabled(): boolean {
    return this.props.complineEnabled;
  }

  get oraMediaEnabled(): boolean {
    return this.props.oraMediaEnabled;
  }

  get laudesTime(): string {
    return this.props.laudesTime;
  }

  get vespersTime(): string {
    return this.props.vespersTime;
  }

  get complineTime(): string {
    return this.props.complineTime;
  }

  get oraMediaTime(): string {
    return this.props.oraMediaTime;
  }

  get intervalInMs(): number {
    return this.props.interval * 60 * 1000;
  }

  get durationInMs(): number {
    return this.props.duration * 1000;
  }

  update(props: Partial<SettingsProps>): Settings {
    return Settings.create({
      ...this.props,
      ...props,
    });
  }

  toPlainObject(): SettingsProps {
    return { ...this.props };
  }
}
