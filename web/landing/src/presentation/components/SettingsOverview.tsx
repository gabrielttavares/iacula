const FEATURES = [
  {
    title: 'Intervalo entre popups',
    description: 'Defina o intervalo entre os lembretes e a duração na tela conforme sua rotina.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Idioma da aplicação',
    description: 'Escolha o idioma das jaculatórias e da interface do aplicativo.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: 'Som e volume',
    description: 'Ative ou desative o som do lembrete e ajuste o volume conforme preferir.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
  },
  {
    title: 'Liturgia das Horas',
    description: 'Módulos opcionais com horários para Laudes, Vésperas e outras horas canônicas.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: 'Início automático',
    description: 'O Iacula pode iniciar automaticamente com o sistema operacional.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  {
    title: 'Discreto e leve',
    description: 'Roda silenciosamente na bandeja do sistema, sem interferir no seu trabalho.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

export function SettingsOverview() {
  return (
    <section
      aria-label="Configurações"
      style={{ background: 'var(--color-bg)' }}
      className="py-24 px-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* section header */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <p
            className="text-xs tracking-[0.35em] uppercase"
            style={{ color: 'var(--color-gold)' }}
          >
            Personalize sua experiência
          </p>
          <h2
            className="text-4xl md:text-5xl font-light"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
          >
            Configurações
          </h2>
          <div
            className="w-12 h-px"
            style={{ background: 'var(--color-gold)' }}
            aria-hidden="true"
          />
        </div>

        {/* feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group p-7 border flex flex-col gap-4 transition-all duration-300"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-gold-border)',
              }}
            >
              <div style={{ color: 'var(--color-gold)' }}>
                {feature.icon}
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-muted-light)' }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
