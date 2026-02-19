import { SAINT_QUOTES } from '../../content/quotes';

export function SaintQuotes() {
  return (
    <section aria-label="Citações de santos">
      <h2>Citações de santos</h2>
      <ul>
        {SAINT_QUOTES.map((quote) => (
          <li key={`${quote.author}-${quote.text.slice(0, 20)}`}>
            <blockquote>{quote.text}</blockquote>
            <p>{quote.author}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
