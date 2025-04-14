# Iacula - Aplicativo de Orações e Jaculatórias

Iacula é um aplicativo desktop que exibe orações e jaculatórias em popups periódicos, ajudando você a manter um momento de oração ao longo do dia.

## Funcionalidades

- Popups periódicos com imagens e citações inspiradoras
- Oração do Angelus/Regina Caeli ao meio-dia
- Interface minimalista e elegante
- Configurações personalizáveis
- Suporte para Windows, Linux e macOS

## Instalação

### Windows
1. Baixe o arquivo `.exe` da última versão
2. Execute o instalador e siga as instruções

### Linux (Debian/Ubuntu)
1. Baixe o arquivo `.deb` da última versão
2. Instale usando:
   ```bash
   sudo dpkg -i iacula_*.deb
   ```

### macOS
1. Baixe o arquivo `.dmg` da última versão
2. Arraste o aplicativo para a pasta Aplicativos

## Configurações

O aplicativo pode ser configurado através do menu do ícone na bandeja do sistema:

- **Intervalo**: Tempo entre os popups (1-60 minutos)
- **Duração**: Tempo que o popup permanece visível (5-30 segundos)
- **Iniciar com o sistema**: Opção para iniciar automaticamente

## Estrutura do Projeto

```
iacula/
├── assets/
│   ├── images/
│   │   ├── ordinary/
│   │   │   ├── 1/ (Domingo)
│   │   │   ├── 2/ (Segunda)
│   │   │   └── ...
│   │   ├── angelus/
│   │   └── reginaCaeli/
│   ├── prayers/
│   │   └── angelus.json
│   └── quotes/
│       └── quotes.json
├── src/
│   ├── main/
│   │   └── main.ts
│   └── renderer/
│       ├── popup.html
│       ├── popup.js
│       ├── settings.html
│       ├── settings.js
│       ├── angelus.html
│       └── angelus.js
├── package.json
└── tsconfig.json
```

## Desenvolvimento

Para desenvolver o projeto:

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute em modo desenvolvimento:
   ```bash
   npm start
   ```
4. Para construir o aplicativo:
   ```bash
   npm run build
   ```

## Licença

Este projeto está licenciado sob a licença MIT.