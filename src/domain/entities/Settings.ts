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
