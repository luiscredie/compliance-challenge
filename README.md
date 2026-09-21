# LG Compliance Challenge — P1

Interface pública para GitHub Pages, integrada ao Supabase. Versão 6.0.0-p1.

Somente esta pasta deve ser enviada ao repositório. Gabaritos, lista de funcionários e migrações privadas ficam fora deste repositório.

1. Configure o Supabase usando as instruções privadas fornecidas ao operador.
2. Crie as variáveis de Actions `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` (sb_publishable_...).
3. Em Settings → Pages, selecione GitHub Actions.
4. Execute o workflow Test and publish GitHub Pages.

Local: Node 22+, `npm ci`, `npm test`, `npm run build` com as duas variáveis no ambiente.

O workflow publica somente dist/. Nunca configure o Pages para publicar a raiz inteira de outro pacote.

P1: autenticação, três etapas, rotas Business/Factory, progresso, ranking e administração por unidade. Atividades extras e conquistas especiais serão migradas em pacote posterior.

Dependências fixadas no package-lock.json. Biblioteca Supabase empacotada localmente, sem CDN de scripts.
