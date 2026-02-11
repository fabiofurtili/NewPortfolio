# Portfólio — Fábio Furtili

Site/portfólio pessoal com apresentação profissional, projetos, contatos e easter eggs jogáveis.

## Estrutura
- `index.html` — página principal
- `assets/css/style.css` — estilos globais do site
- `assets/js/main.js` — scripts gerais (reveal, lightbox, etc.)
- `assets/js/easter-eggs/` — jogos/easter eggs
- `assets/js/easter-eggs/pixel-platformer/` — jogo Pixel Rush + editor de fases
- `assets/img/` — imagens dos projetos
- `assets/sound/` — áudios dos easter eggs

## Easter Eggs
- `Snake` (sequência: `↑ ↓ ↑ ↑ ↓`)
- `Glitch Courier` (sequência: `↑ ↓ ↑ → →`)
- `Pixel Rush` (sequência: `↑ ↑ ↑ ↓`)
- Player “Minha História” (5 cliques no nome)

## Pixel Rush (Platformer)
Jogo de plataforma em pixel art com HUD, ranking local e progressão de fases.

### Controles
- `A / D` ou `← / →`: mover
- `W` ou `↑` ou `Espaço`: pular
- `S` ou `↓`: agachar
- `Q`: interagir (abrir baú / usar chave na porta final)
- `P`: pausar
- `Esc`: fechar overlay do jogo

### Mecânicas implementadas
- Câmera seguindo o player
- Vidas com corações (até 5)
- Moedas com animação de rotação
- Chave com indicador visual na UI
- Baú fechado/aberto (coleta de chave via `Q`)
- Porta final (goal) com animação de abertura e transição de fase
- Inimigo slime com animações:
  - mover
  - atacar por proximidade
  - morrer
- Dano por perigos:
  - espinho (`^`)
  - lava (`Z`)
- Água animada (`P/Q/U`) com:
  - camada de frente quando o player entra
  - splash ao entrar/sair
- Ponte com variações:
  - `=` ponte padrão
  - `(` subida
  - `)` descida

## Level Editor (Pixel Platformer)
Editor de mapas em grade para criação e manutenção de fases compatíveis com `levels.js`.

### Arquivos
- `assets/js/easter-eggs/pixel-platformer/level-editor.html`
- `assets/js/easter-eggs/pixel-platformer/level-editor.js`
- `assets/js/easter-eggs/pixel-platformer/level-editor.css`

### Recursos
- Paleta com miniaturas visuais dos tiles
- Redimensionar grade e limpar mapa
- Carregar fase existente de `LEVELS`
- Exportar fase completa ou apenas `map`
- Importar `map` via JSON
- Salvar diretamente no `levels.js`:
  - sobrescrever fase selecionada
  - salvar como nova fase

### Conjunto de tiles atual (resumo)
- Piso combinável `1..9`
- Parede combinável `a..j`
- Água `P Q U`
- Lava `Z`
- Espinho `^`
- Ponte `= ( )`
- Objetos e decorativos: `C E D B Y K L T H W R O X V M I`
- Especiais: `S` (spawn), `G` (goal), `.` (vazio), `# % @`

## Como executar
### Portfólio
- Abrir `index.html` no navegador.

### Editor de fases
- Abrir `assets/js/easter-eggs/pixel-platformer/level-editor.html`.
- Para salvar direto no arquivo (`levels.js`), use navegador com File System Access API (Chromium) em contexto permitido (ex.: `localhost`).

## Dependências externas (CDN)
- Font Awesome
- Google Fonts
- Green Audio Player

## Autor
Fábio Furtili
