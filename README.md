# GUICODEX - Pokédex Interativa

Uma aplicação web moderna e interativa para explorar o mundo dos Pokémon, desenvolvida com Vue.js 3.

## 📋 Sobre o Projeto

GUICODEX é uma Pokédex completa que permite buscar, filtrar e visualizar informações detalhadas sobre mais de 150 Pokémon da região de Kanto. A aplicação oferece uma experiência de usuário fluida com animações suaves, design responsivo e interface intuitiva.

## ✨ Funcionalidades

- **Busca e Filtros Avançados**
  - Busca por nome de Pokémon
  - Filtros por tipo (múltiplos tipos simultâneos)
  - Filtros por estatísticas (HP, Peso, Altura)
  - Ordenação por ID, Nome, Tipo, Peso, Altura ou HP

- **Visualizações**
  - Modo Grid (1 ou 2 cards por linha)
  - Modo Lista (layout detalhado)
  - Agrupamento por tipo
  - Tema claro/escuro

- **Detalhes Completos**
  - Modal interativo com informações detalhadas
  - Estatísticas de batalha
  - Habilidades e descrições
  - Movimentos por geração
  - Linha evolutiva
  - Galeria de imagens (normal, shiny, sprite, verso)

- **Performance**
  - Lazy loading com scroll infinito
  - Pré-carregamento inteligente em background
  - Cache de dados
  - Animações otimizadas

## 🛠️ Tecnologias

- **Frontend**: Vue.js 3 (via CDN)
- **Estilização**: CSS modular
- **API**: [PokeAPI](https://pokeapi.co/) (RESTful)
- **Ícones**: Ionicons 7.1.0
- **Fontes**: Google Fonts (Poppins)

## 🚀 Como Executar

Este projeto é uma aplicação frontend pura e não requer instalação de dependências ou build tools.

### Opção 1: Servidor Local Simples

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd pokedex
```

2. Abra o arquivo `index.html` diretamente no navegador ou use um servidor HTTP simples:

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

3. Acesse `http://localhost:8000` no navegador

### Opção 2: Abrir Diretamente

Simplesmente abra o arquivo `index.html` no seu navegador moderno (Chrome, Firefox, Edge, Safari).

## 📁 Estrutura do Projeto

```
pokedex/
├── assets/
│   ├── css/
│   │   ├── components/      # Estilos modulares por componente
│   │   ├── app.css         # Arquivo principal de estilos
│   │   ├── base.css        # Reset e estilos base
│   │   └── variables.css   # Variáveis CSS
│   ├── js/
│   │   ├── services/       # Serviços de API
│   │   ├── utils/          # Funções utilitárias
│   │   ├── filters/        # Lógica de filtros
│   │   └── main.js         # Aplicação Vue.js principal
│   └── imgs/               # Imagens e assets
├── index.html              # Página principal
└── manifest.json           # Manifest PWA
```

## 🎨 Características de Design

- **Design Moderno**: Interface limpa e minimalista inspirada em cards TCG
- **Responsivo**: Adaptável a diferentes tamanhos de tela
- **Acessibilidade**: Suporte a navegação por teclado e leitores de tela
- **Animações Fluidas**: Transições suaves e animações de entrada
- **Tema Escuro/Claro**: Alternância entre modos de visualização

## 📱 Compatibilidade

- Navegadores modernos (Chrome, Firefox, Edge, Safari)
- Dispositivos móveis (iOS e Android)
- Tablets e desktops

## 🔧 Requisitos

- Navegador moderno com suporte a:
  - ES6+ (JavaScript moderno)
  - CSS Grid e Flexbox
  - Fetch API
  - Intersection Observer API

## 📝 Notas

- A aplicação consome dados da [PokeAPI](https://pokeapi.co/), uma API pública e gratuita
- Os dados são carregados sob demanda para otimizar performance
- O projeto não requer Node.js ou ferramentas de build para execução

## 📄 Licença

Este projeto é de código aberto e está disponível para fins educacionais.

## 🙏 Agradecimentos

- [PokeAPI](https://pokeapi.co/) - API de dados dos Pokémon
- [Vue.js](https://vuejs.org/) - Framework JavaScript
- [Ionicons](https://ionic.io/ionicons) - Biblioteca de ícones
