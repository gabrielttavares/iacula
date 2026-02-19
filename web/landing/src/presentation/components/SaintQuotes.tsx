import { SaintQuote } from '../../content/quotes';

interface InspirationalQuoteProps {
  quote: SaintQuote;
  compact?: boolean;
}

export function InspirationalQuote({ quote, compact = false }: InspirationalQuoteProps) {
  return (
    <figure className={`inspirational-quote ${compact ? 'inspirational-quote--compact' : ''}`}>
      <blockquote>
        {quote.text}
      </blockquote>
      <figcaption>— {quote.author}</figcaption>
    </figure>
  );
}
