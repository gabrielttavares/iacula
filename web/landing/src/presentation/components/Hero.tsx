import { DownloadCTA, DownloadCtaModel } from './DownloadCTA';

interface HeroProps {
  cta: DownloadCtaModel;
}

export function Hero({ cta }: HeroProps) {
  return (
    <section
      aria-label="Apresentação do Iacula"
      className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 overflow-hidden"
    >
      {/* background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
        aria-hidden="true"
      />

      {/* dark overlay with gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(12,12,12,0.55) 0%, rgba(12,12,12,0.75) 60%, rgba(12,12,12,0.95) 100%)',
        }}
        aria-hidden="true"
      />

      {/* gold top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'var(--color-gold)' }}
        aria-hidden="true"
      />

      {/* content */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
        <p
          className="text-xs tracking-[0.35em] uppercase"
          style={{ color: 'var(--color-gold)' }}
        >
          Jaculatórias · Presença de Deus
        </p>

        <h1
          className="text-6xl md:text-8xl font-light leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
        >
          Iacula
        </h1>

        <div
          className="w-16 h-px"
          style={{ background: 'var(--color-gold)' }}
          aria-hidden="true"
        />

        <p
          className="text-lg md:text-xl font-light max-w-xl leading-relaxed"
          style={{ color: 'var(--color-muted-light)', fontFamily: 'var(--font-display)' }}
        >
          Um auxílio simples para cultivar a presença de Deus no cotidiano,
          com jaculatórias e lembretes discretos ao longo do dia.
        </p>

        <div className="mt-2">
          <DownloadCTA cta={cta} size="lg" />
        </div>

        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Windows · macOS · Linux — gratuito
        </p>
      </div>

      {/* scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--color-muted)' }}>
          Rolar
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--color-muted)' }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
