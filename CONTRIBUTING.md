Contributing to ifood-delivery

Obrigado por contribuir! Siga estas orientações para facilitar revisões e manter a qualidade do projeto.

Fluxo de trabalho
- Fork → branch com nome descritivo → commit pequenos e atômicos → PR para `master` (ou outra branch principal).
- Use mensagens de commit no estilo: `feat:`, `fix:`, `chore:`, `docs:`.

Como rodar localmente
- Backend:
  cd ifood-route-backend
  npm install
  npm run start:dev

- Frontend:
  cd ifood-route-frontend
  npm install
  npm run dev

Testes / lint
- Rodar testes backend: `npm test -- --runInBand` (na pasta `ifood-route-backend`).
- Rodar lint/format: configurar ESLint/Prettier localmente (recomendações em `REPO_QUALITY.md`).

Pull Requests
- Vincule o PR a um issue quando aplicável.
- Descreva a mudança, motivo, e como testar manualmente.
- Adicione reviewers e aguarde aprovação. CI deve passar antes do merge.

Obrigado por colaborar!