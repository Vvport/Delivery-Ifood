Qualidade do Repositório — ifood-delivery

Objetivo
- Diretrizes e ações práticas para melhorar a qualidade do repositório: CI, lint, formatação, PR/issue templates, segurança e automações.

Recomendações e passos práticos (tópico 6)

1) Integração Contínua (CI)
- Adicione um workflow GitHub Actions que execute lint e testes para backend e frontend em PRs e pushes nas branches principais.
- Exemplo de arquivo: `.github/workflows/ci.yml` (fornecido neste repositório).
- O workflow deve falhar o PR quando testes/lint falharem.

2) Linter e Formatador
- Use `ESLint` com rules padrão para TypeScript + React.
- Use `Prettier` para formatação consistente e adicione `eslint-config-prettier` para evitar conflitos.
- Comandos de instalação (executar nas pastas `ifood-route-backend` e `ifood-route-frontend`):

  npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier prettier

- Inicialize e ajuste configurações. Exemplo de `package.json` scripts:

  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""

3) Hooks de commit (Husky + lint-staged)
- Instale `husky` e `lint-staged` para bloquear commits com problemas:

  npm install --save-dev husky lint-staged
  npx husky install
  npx husky add .husky/pre-commit "npx --no -- lint-staged"

- Exemplo `package.json`:

  "lint-staged": {
    "**/*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }

4) Testes e cobertura
- Garanta que o backend execute testes no CI com `npm test`.
- Adicione cobertura com `jest --coverage` e publique badges no `README.md` opcionalmente.
- Considere usar bancos em memória ou variáveis de ambiente mock durante CI.

5) Documentação e templates
- Adicione `CONTRIBUTING.md` com fluxo de PR, convenções de commit e como rodar o projeto localmente.
- Crie templates de Issue/PR em `.github/ISSUE_TEMPLATE/` e `.github/PULL_REQUEST_TEMPLATE.md`.

6) Dependabot e segurança
- Habilite `dependabot.yml` para atualizações de dependências automáticas.
- Adicione `security.md` ou `SECURITY.md` com contato para vulnerabilidades.

7) Automação e badges
- Insira badges no `README.md` para build status, coverage e npm versions.

8) Limpeza e Secrets
- Evite commitar arquivos sensíveis. Use `.gitignore` (já configurado).
- Se arquivos sensíveis foram commitados, execute `git rm --cached` e considere `git filter-repo` para histórico (cuidado).

Comandos úteis

- Rodar lint em root via workspaces (se usar):

  cd ifood-route-frontend
  npm run lint

- Rodar testes backend:

  cd ifood-route-backend
  npm test -- --runInBand

Conclusão
- Implementar CI + lint + husky + templates e adicionar documentação traz confiança, reduz regressões e acelera revisões. Se quiser, posso aplicar automaticamente as primeiras mudanças: adicionar workflow CI, criar `CONTRIBUTING.md`, e rascunho de `package.json` scripts para `lint`/`format`.
