/**
 * Domain Entity: Quote
 * Representa uma jaculatória/citação espiritual.
 */

export interface QuoteProps {
  text: string;
  dayOfWeek: DayOfWeek;
}

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface DayQuotes {
  day: string;
  theme: string;
  quotes: string[];
}

export type QuotesCollection = Record<string, DayQuotes>;

export class Quote {
  private readonly props: QuoteProps;

  private constructor(props: QuoteProps) {
    this.props = props;
  }

  static create(text: string, dayOfWeek: DayOfWeek): Quote {
    if (!text || text.trim().length === 0) {
      throw new Error('Quote text cannot be empty');
    }
    return new Quote({ text: text.trim(), dayOfWeek });
  }

  get text(): string {
    return this.props.text;
  }

  get dayOfWeek(): DayOfWeek {
    return this.props.dayOfWeek;
  }
}
