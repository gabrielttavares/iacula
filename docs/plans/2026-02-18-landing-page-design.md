# Landing Page do Iacula (Design)

## Contexto

Criar um novo módulo web dentro do projeto para uma landing page em pt-BR, com foco em:
- apresentar claramente o propósito do Iacula;
- reforçar espiritualidade prática no cotidiano;
- servir como ponto central de download do app.

Referência visual: template `opus-landing-page-XyHhjIjd6Y2` do v0.

## Decisões Validadas

1. Stack da landing: `Vite + React + TypeScript`.
2. Estrutura no repositório: módulo isolado em `web/landing`.
3. Download: botão único dinâmico por SO (`Baixar para Windows/Linux/macOS`).
4. Fallback quando SO/asset não resolvido: `Ver downloads` (GitHub Releases).
5. Fonte de resolução de assets: `manifest.json` gerado pelo pipeline (não consulta direta à API do GitHub no browser).
6. Conteúdo em português brasileiro.
7. Implementação obrigatória via TDD.

## Arquitetura Proposta (clean-ish frontend)

### Domain
Regras puras sem dependência de framework:
- detecção de plataforma do usuário;
- seleção de asset ideal por plataforma;
- resolução de label e ação do CTA.

### Application
Casos de uso:
- carregar manifesto;
- montar estado final do CTA (texto, URL, fallback).

### Infrastructure
Integrações:
- fetch de `manifest.json`;
- validação do contrato do manifesto;
- tratamento de erro de rede/manifesto inválido.

### Presentation
Componentes React curtos e reutilizáveis, sem regra pesada.

## Estrutura de Conteúdo da Landing

1. Hero
- Título sobre presença de Deus no cotidiano.
- Subtítulo explicando o propósito do app.
- CTA único dinâmico por SO.

2. Propósito do app
- Cards curtos sobre jaculatórias, ritmo de oração e lembretes discretos.

3. Como funciona
- Fluxo em 3 passos: instalar, receber lembretes/jaculatórias, recolher-se em meio aos deveres.

4. Citações de santos
- Bloco com citações de São Josemaria Escrivá, São João Crisóstomo e outros santos sobre oração e vida cotidiana.
- Atribuição clara das citações.

5. Preview visual
- Uso de imagens existentes de `assets/images` adaptadas para a LP.

6. Configurações (seção breve)
- explicar funcionalidades existentes na tela de configuração:
  - intervalo e duração dos popups;
  - idioma;
  - som e volume do lembrete;
  - módulos opcionais da Liturgia das Horas e horários;
  - iniciar com o sistema.

7. FAQ curto
- compatibilidade e comportamento de atualização por plataforma.

8. CTA final
- repetir CTA dinâmico + fallback para releases.

## Fluxo Técnico do Botão de Download

1. LP carrega `manifest.json`.
2. Detecta SO do usuário.
3. Resolve melhor asset para o SO:
- Windows: instalador `.exe`;
- Linux: AppImage;
- macOS: asset disponível no manifesto.
4. Se não houver asset para o SO detectado, troca para fallback `Ver downloads`.

## Requisitos de Qualidade

- Código legível, componentes curtos e reutilizáveis.
- DRY e YAGNI.
- TDD obrigatório em toda regra de domínio e caso de uso.
- Testes de contrato do manifesto e testes de UI para CTA dinâmico/fallback.

## Fora de Escopo Inicial

- analytics/trackings;
- backend próprio para download;
- internacionalização da LP além de pt-BR.
