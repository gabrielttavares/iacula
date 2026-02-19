import { DownloadCTA, DownloadCtaModel } from './DownloadCTA';
import { SaintQuote } from '../../content/quotes';
import { InspirationalQuote } from './SaintQuotes';

interface HeroProps {
  cta: DownloadCtaModel;
  quote: SaintQuote;
}

export function Hero({ cta, quote }: HeroProps) {
  return (
    <section
      aria-label="Apresentação do Iacula"
      className="hero-shell relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32"
    >
      <div
        className="hero-backdrop"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
        aria-hidden="true"
      />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-content relative z-10 mx-auto mt-10 flex max-w-4xl flex-col items-start gap-6">
        <p className="eyebrow">
          Jaculatórias · Presença de Deus
        </p>

        <h1 className="hero-title">
          Iacula
        </h1>

        <div className="ornament" aria-hidden="true" />

        <p className="hero-subtitle">
          Um auxílio simples para cultivar a presença de Deus no cotidiano,
          com jaculatórias e lembretes discretos ao longo do dia.
        </p>

        <InspirationalQuote quote={quote} compact />

        <div className="mt-1">
          <DownloadCTA cta={cta} size="lg" />
        </div>

        <p className="meta-line">
          Windows · macOS · Linux — gratuito
        </p>
      </div>
    </section>
  );
}
