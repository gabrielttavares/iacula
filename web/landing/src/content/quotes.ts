export type QuoteContext = 'hero' | 'purpose' | 'settings' | 'footer';

export interface SaintQuote {
  context: QuoteContext;
  author: string;
  text: string;
}

export const SAINT_QUOTES: SaintQuote[] = [
  {
    context: 'hero',
    author: 'Salmos 16,8',
    text: '“Tenho sempre o Senhor diante dos meus olhos.”',
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
    author: 'Hebreus 6,19',
    text: 'Temos esta esperança como âncora da alma, firme e segura.',
  },
];
