export type QuoteContext = 'hero' | 'purpose' | 'settings' | 'footer';

export interface SaintQuote {
  context: QuoteContext;
  author: string;
  text: string;
}

export const SAINT_QUOTES: SaintQuote[] = [
  {
    context: 'hero',
    author: 'São Josemaria Escrivá',
    text: 'Acostuma-te a elevar o coração a Deus, em ação de graças, muitas vezes ao dia.',
  },
  {
    context: 'purpose',
    author: 'São João Crisóstomo',
    text: 'Ergue um altar a Deus no meio de teus trabalhos, e oferece ali a oração do coração.',
  },
  {
    context: 'settings',
    author: 'São Josemaria Escrivá',
    text: 'Transforma os deveres do teu estado em oração e em encontro com Deus.',
  },
  {
    context: 'footer',
    author: 'Santa Teresa de Ávila',
    text: 'Quem tem Deus, nada lhe falta. Só Deus basta.',
  },
];
