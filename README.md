# 💈 ESCOL BARBER — Landing Page Oficial

Landing page de alta conversão, moderna e cinematográfica desenvolvida para a **ESCOL BARBER**, localizada em Heliópolis, São Paulo/SP. O projeto combina identidade visual premium em tons preto, grafite e bronze com uma experiência imersiva 3D, carrossel tridimensional de trabalhos e integração direta com o sistema de agendamento do **Booksy**.

---

## 🚀 Destaques e Funcionalidades

- **Experiência 3D Imersiva (Three.js & GSAP)**: Cadeira clássica de barbeiro modelada em 3D que acompanha o scroll do visitante através das seções (*Início* → *Essência* → *Serviços*), ancorando-se no pedestal da seção de portfólio onde gira 360° continuamente.
- **Header Inteligente Glassmorphism**: Menu de navegação fixo que no topo do Hero é transparente e, ao rolar por qualquer seção (incluindo as seções com fundo claro), ganha barra de vidro fosco dark (`backdrop-filter: blur`) com borda bronze, garantindo 100% de legibilidade e contraste contínuo.
- **Portfólio 3D Rotativo com Fotos Reais**: Carrossel tridimensional com cards verticais exibindo fotos reais de cortes e barbas extraídas diretamente do perfil oficial no Booksy.
- **Seção "Nosso Espaço"**: Apresentação real do interior da barbearia e mapa de localização de Heliópolis integrado com o Google Maps.
- **Agendamento com 1 Clique (Booksy)**: Botões de ação (*CTAs*) distribuídos estrategicamente direcionando para a página de reservas online da Escol Barber.
- **100% Responsivo e Otimizado**: Interface adaptada para smartphones, tablets e telas desktop ultrawide.
- **SEO & Compartilhamento Social**: Meta tags Open Graph completas para geração de previews automáticos e atrativos ao compartilhar o link no WhatsApp, Instagram, Telegram e Facebook.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico**: Estruturação acessível com tags ARIA e hierarquia semântica.
- **CSS3 Moderno**: Variáveis CSS (*Custom Properties*), CSS Grid, Flexbox, Animações 3D por hardware (`transform-style: preserve-3d`) e Glassmorphism.
- **JavaScript (ES6+ Vanilla Modular)**: Código limpo, componentizado e de altíssima performance sem dependência de frameworks pesados.
- **Three.js**: Renderização gráfica 3D com sombras e materiais PBR.
- **GSAP & ScrollTrigger**: Animações fluidas atreladas à rolagem da página.

---

## 📁 Estrutura de Pastas e Arquivos

```text
landing-page-Escolbarber/
├── .env.example          # Exemplo documentado de variáveis de ambiente
├── .gitignore            # Regras de exclusão para Git e GitHub
├── favicon.ico           # Favicon oficial da aplicação
├── index.html            # Estrutura principal da landing page
├── netlify.toml          # Configuração de build e headers para Netlify
├── package.json          # Metadados e scripts de execução local
├── README.md             # Documentação completa do projeto
├── vercel.json           # Configuração de cache e segurança para Vercel
│
├── assets/
│   └── images/           # Fotografias oficiais, mapa, logo e texturas
│       ├── corte-1.jpg
│       ├── corte-2.jpg
│       ├── corte-3.jpg
│       ├── corte-4.jpg
│       ├── espaco-escol-barber.jpg
│       ├── favicon.ico
│       ├── logo.png
│       ├── lucas.png
│       ├── mapa-escol-barber.jpg
│       └── smoke.png
│
├── css/                  # Estilos modulares organizados por seção
│   ├── about.css         # Seção Essência / Manifesto
│   ├── animations.css    # Animações de entrada e keyframes
│   ├── chair-scrub.css   # Estilos do canvas 3D
│   ├── footer.css        # Rodapé
│   ├── global.css        # Regras globais e botões
│   ├── header.css        # Cabeçalho e glassmorphism no scroll
│   ├── hero.css          # Seção de abertura com fumaça e Lucas
│   ├── location.css      # Seção "Nosso Espaço" e Google Maps
│   ├── reset.css         # Reset de estilos cross-browser
│   ├── responsive.css    # Media queries para mobile e tablet
│   ├── services.css      # Cards de serviços e carrossel 3D
│   └── variables.css     # Paleta de cores, fontes e espaçamentos
│
└── js/                   # Scripts de comportamento e interação
    ├── animations.js     # Revelação de elementos via IntersectionObserver
    ├── booking.js        # Lógica de agendamento
    ├── chair-scrub.js    # Controlador da cadeira 3D com Three.js
    ├── main.js           # Ponto de entrada e inicialização
    ├── navigation.js     # Controle do cabeçalho e menu
    ├── scroll-effects.js # Efeitos de empilhamento e parallax
    └── vendor/           # Bibliotecas locais otimizadas
        ├── gsap.min.js
        ├── ScrollTrigger.min.js
        └── three.min.js
```

---

## 💻 Como Executar Localmente

Como o projeto é desenvolvido com tecnologias web nativas, você pode rodá-lo diretamente sem necessidade de compilação:

### Opção 1: Usando Node.js (Recomendado)
```bash
# Executa um servidor local na porta 3000
npm start
```
Abra seu navegador em: `http://localhost:3000`

### Opção 2: Usando VS Code (Extensão Live Server)
1. Instale a extensão **Live Server** no VS Code.
2. Clique com o botão direito no arquivo `index.html`.
3. Selecione **"Open with Live Server"**.

### Opção 3: Usando Python
```bash
python -m http.server 3000
```

---

## 🧪 Verificação e Testes

Para verificar a sintaxe e integridade de todos os scripts JavaScript:
```bash
npm test
```

---

## 📤 Como Publicar no GitHub

Siga os comandos abaixo no seu terminal para enviar o projeto para o seu repositório no GitHub:

```bash
# 1. Adicionar todos os arquivos preparados
git add .

# 2. Criar o commit de produção
git commit -m "chore: prepare project for production"

# 3. Garantir a branch principal como main
git branch -M main

# 4. Vincular ao seu repositório remoto (substitua pela URL do seu repositório)
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git

# 5. Enviar para o GitHub
git push -u origin main
```

---

## 🌐 Como Fazer o Deploy em Produção

A aplicação é 100% compatível com as principais plataformas modernas de hospedagem estática e CDN global:

### 1. Vercel (Altamente Recomendado)
1. Acesse [vercel.com](https://vercel.com/) e faça login com sua conta do GitHub.
2. Clique em **"Add New..."** → **"Project"**.
3. Importe o repositório do projeto.
4. O arquivo `vercel.json` já configurado no projeto aplicará automaticamente as políticas de segurança (HSTS, CSP, X-Frame-Options) e cache de assets.
5. Clique em **"Deploy"**.

### 2. Netlify
1. Acesse [netlify.com](https://netlify.com/) e conecte com o GitHub.
2. Selecione o repositório.
3. As configurações do `netlify.toml` serão detectadas automaticamente.
4. Clique em **"Deploy Site"**.

### 3. GitHub Pages
1. No repositório do GitHub, vá em **Settings** → **Pages**.
2. Em **Branch**, selecione `main` e a pasta `/ (root)`.
3. Clique em **Save**. O site estará disponível em poucos instantes no domínio `https://seu-usuario.github.io/nome-do-repositorio/`.

---

## 🔒 Segurança e Boas Práticas

- Nenhum token, chave secreta ou credencial sensível está exposto no código.
- Todas as aberturas de links externos utilizam `rel="noopener noreferrer"`.
- Políticas de segurança HSTS e prevenção contra clickjacking configuradas nos arquivos de deploy.
- Assets de terceiros (Three.js, GSAP) versionados localmente para garantir estabilidade e disponibilidade contínua sem depender de CDNs externas sujeitas a instabilidade.

---

## 📍 Contato & Localização

- **Barbearia**: ESCOL BARBER
- **Endereço**: Rua Itamarati Brasileiro, 12 — Heliópolis, São Paulo — SP (CEP 04236-160)
- **Agendamentos**: [Booksy Oficial](https://booksy.com/pt-br/200780_escol-barber_barbearias_1047773_sao-paulo)

