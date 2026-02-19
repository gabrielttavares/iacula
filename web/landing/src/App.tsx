import { useEffect, useMemo, useState } from 'react';
import { buildDownloadCta } from './application/download/buildDownloadCta';
import { detectPlatform } from './domain/download/detectPlatform';
import { DownloadManifest } from './domain/download/types';
import { fetchManifest } from './infrastructure/manifest/fetchManifest';
import { DownloadCtaModel } from './presentation/components/DownloadCTA';
import { Hero } from './presentation/components/Hero';
import { SaintQuotes } from './presentation/components/SaintQuotes';
import { SettingsOverview } from './presentation/components/SettingsOverview';

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

  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{
          background: 'rgba(12,12,12,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-gold-border)',
        }}
        aria-label="Navegação principal"
      >
        <span
          className="text-xl font-light tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gold)' }}
        >
          Iacula
        </span>
        <a
          href="https://github.com/gabrielttavares/iacula"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs tracking-widest uppercase transition-colors duration-200"
          style={{ color: 'var(--color-muted-light)' }}
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

      {/* HERO */}
      <Hero cta={cta} />

      {/* PROPÓSITO */}
      <section
        aria-label="Propósito do app"
        style={{ background: 'var(--color-bg)' }}
        className="py-24 px-6"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <p
              className="text-xs tracking-[0.35em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              Por que o Iacula?
            </p>
            <h2
              className="text-4xl md:text-5xl font-light leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
            >
              Presença de Deus no cotidiano
            </h2>
            <div
              className="w-12 h-px"
              style={{ background: 'var(--color-gold)' }}
              aria-hidden="true"
            />
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-muted-light)' }}
            >
              O Iacula foi pensado para ajudar você a manter viva a oração breve no meio
              das tarefas normais do dia. Uma jaculatória, um versículo, um lembrete discreto
              — e o coração se volta a Deus sem interromper o trabalho.
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-muted-light)' }}
            >
              Inspirado na espiritualidade do trabalho santificado, o aplicativo roda
              silenciosamente na bandeja do sistema e aparece nos momentos certos.
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-3 -z-10"
              style={{ background: 'var(--color-gold-dim)' }}
              aria-hidden="true"
            />
            <img
              src="/images/purpose.jpg"
              alt="Imagem de oração e contemplação"
              className="w-full object-cover"
              style={{
                border: '1px solid var(--color-gold-border)',
                aspectRatio: '4/3',
              }}
            />
          </div>
        </div>
      </section>

      {/* CITAÇÕES */}
      <SaintQuotes />

      {/* CONFIGURAÇÕES */}
      <SettingsOverview />

      {/* FOOTER */}
      <footer
        className="py-12 px-6 text-center flex flex-col items-center gap-4"
        style={{ borderTop: '1px solid var(--color-gold-border)' }}
      >
        <span
          className="text-2xl font-light tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gold)' }}
        >
          Iacula
        </span>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Gratuito e de código aberto.{' '}
          <a
            href="https://github.com/gabrielttavares/iacula"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 transition-colors duration-200"
            style={{ color: 'var(--color-muted-light)' }}
          >
            Ver no GitHub
          </a>
        </p>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          &ldquo;Quem tem Deus, nada lhe falta. Só Deus basta.&rdquo; — Santa Teresa de Ávila
        </p>
      </footer>
    </div>
  );
}
