import { SAINT_QUOTES } from '../../content/quotes';

export function SaintQuotes() {
  return (
    <section
      aria-label="Citações de santos"
      style={{ background: 'var(--color-surface)' }}
      className="py-24 px-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* section header */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <p
            className="text-xs tracking-[0.35em] uppercase"
            style={{ color: 'var(--color-gold)' }}
          >
            Santos e Doutores da Igreja
          </p>
          <h2
            className="text-4xl md:text-5xl font-light"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
          >
            Citações de santos
          </h2>
          <div
            className="w-12 h-px"
            style={{ background: 'var(--color-gold)' }}
            aria-hidden="true"
          />
        </div>

        {/* quotes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAINT_QUOTES.map((quote) => (
            <figure
              key={`${quote.author}-${quote.text.slice(0, 20)}`}
              className="relative p-8 border-l-2 flex flex-col gap-4 transition-colors duration-300"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-gold)',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                style={{ color: 'var(--color-gold)', opacity: 0.4 }}
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              <blockquote
                className="text-lg md:text-xl font-light italic leading-relaxed"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text)',
                }}
              >
                {quote.text}
              </blockquote>

              <figcaption
                className="text-xs tracking-widest uppercase mt-auto"
                style={{ color: 'var(--color-gold)' }}
              >
                — {quote.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
