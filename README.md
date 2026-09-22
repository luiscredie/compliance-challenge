# LG Compliance Challenge — P1

Interface pública para GitHub Pages, integrada ao Supabase. Versão 6.0.0-p1.

Somente esta pasta deve ser enviada ao repositório. Gabaritos, lista de funcionários e migrações privadas ficam fora deste repositório.

1. Configure o Supabase usando as instruções privadas fornecidas ao operador.
2. A conexão pública está em `public-config.json`. Variáveis de Actions `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` podem substituir esses valores. Nunca use uma chave secreta.
3. Em Settings → Pages, selecione GitHub Actions.
4. Execute o workflow Test and publish GitHub Pages.

Local: Node 22+, `npm ci`, `npm test`, `npm run build` com as duas variáveis no ambiente.

O workflow publica somente dist/. Nunca configure o Pages para publicar a raiz inteira de outro pacote.

P1: autenticação, três etapas, rotas Business/Factory, progresso, ranking e administração por unidade. Atividades extras e conquistas especiais serão migradas em pacote posterior.

Dependências fixadas no package-lock.json. Biblioteca Supabase empacotada localmente, sem CDN de scripts.

## Piloto sem e-mail

A configuração pública `emailAuthEnabled: false` interrompe solicitações de e-mail e orienta o contato com o administrador. O login por matrícula e senha continua disponível.

A página `index.html?activate=1` permite definir a primeira senha usando um código aleatório individual de 256 bits. O operador deve verificar a identidade do destinatário, gravar apenas o SHA-256 do código em `cc_private.activations`, com expiração, e entregar o código diretamente ao destinatário. Nenhum código emitido deve ser incluído neste repositório. A função `manual-activation` consome o código atomicamente e cria somente uma conta nova usando a identidade já autorizada. Ela não altera senhas de contas existentes nem concede funções administrativas. A senha é escolhida pelo participante.

As funções Edge precisam ser implantadas separadamente no Supabase. Os dados privados e gabaritos continuam fora do repositório.
