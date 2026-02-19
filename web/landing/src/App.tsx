import { useEffect, useMemo, useState } from 'react';
import { buildDownloadCta } from './application/download/buildDownloadCta';
import { detectPlatform } from './domain/download/detectPlatform';
import { DownloadManifest } from './domain/download/types';
import { fetchManifest } from './infrastructure/manifest/fetchManifest';
import { DownloadCtaModel } from './presentation/components/DownloadCTA';
import { Hero } from './presentation/components/Hero';
import { InspirationalQuote } from './presentation/components/SaintQuotes';
import { SettingsOverview } from './presentation/components/SettingsOverview';
import { SAINT_QUOTES } from './content/quotes';

const FALLBACK_RELEASES_URL = 'https://github.com/gabrielttavares/iacula/releases';
const DEFAULT_CTA: DownloadCtaModel = {
  kind: 'fallback',
  label: 'Ver downloads',
  href: FALLBACK_RELEASES_URL,
};

export default function App() {
  const [manifest, setManifest] = useState<DownloadManifest | null>(null);
  const [platform, setPlatform] = useState<'windows' | 'linux' | 'macos' | 'unknown'>('unknown');

  useEffect(() => {
    setPlatform(detectPlatform(navigator.userAgent));

    fetchManifest('/manifest.json')
      .then((resolvedManifest) => setManifest(resolvedManifest))
      .catch(() => {
        setManifest(null);
      });
  }, []);

  const cta = useMemo(() => {
    const fallbackUrl = manifest?.fallbackUrl || FALLBACK_RELEASES_URL;

    if (!manifest) {
      return {
        ...DEFAULT_CTA,
        href: fallbackUrl,
      };
    }

    return buildDownloadCta(manifest, platform, fallbackUrl);
  }, [manifest, platform]);

  const heroQuote = SAINT_QUOTES.find((quote) => quote.context === 'hero') || SAINT_QUOTES[0];
  const purposeQuote = SAINT_QUOTES.find((quote) => quote.context === 'purpose') || SAINT_QUOTES[1];
  const settingsQuote = SAINT_QUOTES.find((quote) => quote.context === 'settings') || SAINT_QUOTES[2];
  const footerQuote = SAINT_QUOTES.find((quote) => quote.context === 'footer') || SAINT_QUOTES[3];

  return (
    <div className="app-shell">
      <nav
        className="top-nav"
        aria-label="Navegação principal"
      >
        <img
          src="/images/icon.png"
          alt="Iacula"
          className="brand-icon"
          width="140"
          height="42"
        />
        <a
          href="https://github.com/gabrielttavares/iacula"
          target="_blank"
          rel="noopener noreferrer"
          className="top-nav-link"
          aria-label="Ver no GitHub"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
      </nav>

      <Hero cta={cta} quote={heroQuote} />

      <section
        aria-label="Propósito do app"
        className="section-shell"
      >
        <div className="section-inner grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-5">
            <p className="eyebrow">
              Por que o Iacula?
            </p>
            <h2 className="section-title">
              Presença de Deus no cotidiano
            </h2>
            <div className="ornament" aria-hidden="true" />
            <p className="section-copy">
              O Iacula foi pensado para ajudar você a manter viva a oração breve no meio
              das tarefas normais do dia. Uma jaculatória, um versículo, um lembrete discreto
              — e o coração se volta a Deus sem interromper o trabalho.
            </p>
            <p className="section-copy">
              Inspirado na espiritualidade do trabalho santificado, o aplicativo roda
              silenciosamente na bandeja do sistema e aparece nos momentos certos.
            </p>
            <InspirationalQuote quote={purposeQuote} />
          </div>

          <div className="relative mt-2 lg:mt-0">
            <img
              src="/images/purpose.jpg"
              alt="Imagem de oração e contemplação"
              className="w-full object-cover"
              style={{ border: '1px solid var(--color-line)', aspectRatio: '4/3' }}
            />
          </div>
        </div>
      </section>

      <SettingsOverview quote={settingsQuote} />

      <footer
        className="footer-shell"
      >
        <span className="brand-mark">Iacula</span>
        <p className="meta-line">
          Gratuito e de código aberto.{' '}
          <a
            href="https://github.com/gabrielttavares/iacula"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Ver no GitHub
          </a>
        </p>
        <InspirationalQuote quote={footerQuote} compact />
      </footer>
    </div>
  );
}
