# 🎯 Regras Fundamentais do Projeto Pokedex

## 📋 Visão Geral do Projeto

**Pokedex** é uma aplicação web desenvolvida em **Vue.js 3** para busca e visualização de informações sobre Pokémon, desenvolvida para o mercado brasileiro.

### Stack Tecnológica

- **Frontend**: Vue.js 3 (CDN)
- **Estilização**: CSS/SCSS com estrutura modular
- **API**: PokeAPI (RESTful)
- **Público-alvo**: Brasil (PT-BR)

---

## 🚨 REGRAS CRÍTICAS (NUNCA VIOLAR)

### 1. 🚫 Proibição de CSS/JS Inline e Alerts Nativos

- **PROIBIDO tags `<style>` no HTML**
- **PROIBIDO tags `<script>` no HTML** (exceto referências a bibliotecas externas)
- **PROIBIDO `window.alert()`, `window.confirm()`, `window.prompt()`** - sempre usar alternativas modernas
- **EVITAR atributos `style=""`** (preferir classes CSS sempre que possível)
- **PERMITIDO `onclick=""`, `onload=""` quando necessário** (pragmatismo, especialmente para passar dados dinâmicos do Vue)

**✅ CORRETO:**

```html
<!-- Atributos onclick são permitidos quando necessário -->
<button type="button" class="pokemon-card" @click="openPokedex(pokemon)">
 Ver Detalhes
</button>
```

**❌ PROIBIDO:**

```html
<!-- NUNCA usar tags <style> -->
<style>
 .custom-class {
  color: blue;
 }
</style>

<!-- NUNCA usar tags <script> para lógica da aplicação -->
<script>
 function doSomething() {
  console.log('Isto é proibido');
 }
</script>

<!-- NUNCA usar window.alert -->
<script>
 window.alert('Pokémon adicionado!'); // ❌ ERRADO
 window.confirm('Tem certeza?'); // ❌ ERRADO
</script>

<!-- EVITAR style inline (usar classes quando possível) -->
<div style="color: red; font-size: 20px;">Evitar isto</div>
```

### 2. 🇧🇷 Público-alvo: Brasil

- **Idioma**: Português do Brasil (PT-BR)
- **Formato de datas**: DD/MM/YYYY
- **Moeda**: Real (R$) - sempre usar símbolo R$ quando aplicável
- **Fuso horário**: BRT/BRST (Brasília Time)
- **Exemplos PT-BR**:
  - ✅ "pesquisar", "buscar", "detalhes", "tipo", "peso", "altura", "estatísticas", "habilidades"
  - ❌ "utilizador" (PT-PT), "utilizador" (usar "usuário" em PT-BR quando aplicável)

### 3. 🏗️ Arquitetura e Organização

#### Princípio da Responsabilidade Única

- **Services**: apenas chamadas à API e manipulação de dados externos
- **Utils**: funções utilitárias puras e reutilizáveis
- **Filters**: lógica de filtros e ordenação
- **Main (Vue.js)**: apenas orquestração e bindings
- **CSS Components**: estilos separados por componente/funcionalidade

#### Separação de Responsabilidades (CRÍTICO)

- **CSS**: `assets/css/` - APENAS estilos, em arquivos `.css` ou `.scss`
- **JS**: `assets/js/` - APENAS comportamento, em arquivos `.js`
- **HTML**: `index.html` - APENAS estrutura e apresentação
- **NUNCA misturar responsabilidades**

### 4. 📦 Estrutura de Arquivos

#### Organização de Arquivos CSS

```
assets/
├── css/
│   ├── variables.css          # Variáveis CSS (cores, tema)
│   ├── base.css               # Reset e estilos base
│   ├── components/
│   │   ├── search.css         # Estilos da busca
│   │   ├── pokemon-card.css   # Estilos dos cards de Pokémon
│   │   └── pokedex-modal.css  # Estilos do modal de detalhes
│   └── app.css                # Arquivo principal que importa tudo
```

#### Organização de Arquivos JavaScript

```
assets/
└── js/
    ├── services/
    │   └── pokemon-api.js     # Serviço de API (responsabilidade única)
    ├── utils/
    │   ├── normalizer.js      # Funções de normalização
    │   └── sorter.js          # Funções de ordenação
    ├── filters/
    │   └── pokemon-filters.js # Lógica de filtros
    └── main.js                # App Vue.js principal (orquestração)
```

#### Nomenclatura de Arquivos

- **Descritiva**: `pokemon-card.css` (não `card.css`)
- **Kebab-case**: `pokemon-api.js`, `pokedex-modal.css`
- **Por feature/página**: um arquivo por funcionalidade principal

### 5. 🎨 Padrões de CSS

#### Nomenclatura de Classes

- **Kebab-case**: `.pokemon-card`, `.search-input`, `.pokedex-modal`
- **Prefixos por contexto**: `.pokemon-`, `.search-`, `.pokedex-`
- **BEM para componentes complexos**: `.pokemon-card__header--highlighted`
- **Descritivas**: `.pokemon-type-badge` (não `.red-badge`)

#### Evitar IDs para Estilização

- ❌ IDs para estilização (usar classes)
- ✅ IDs apenas quando necessário para Vue.js (`#app`)
- ✅ Classes para tudo que precisa de estilo

#### Variáveis CSS

- **Definir em**: `assets/css/variables.css`
- **Usar**: `var(--primary-color)`, `var(--bug-type)`
- **Sempre implementar variáveis** para cores e valores reutilizáveis

#### Evitar

- ❌ IDs para estilização (usar classes)
- ❌ `!important` (resolver especificidade corretamente)
- ❌ Magic numbers (usar variáveis CSS)

### 6. 💻 Padrões de JavaScript

#### Estrutura

- **Classes para lógica complexa**
- **Funções modulares**
- **Evitar variáveis globais**
- **`const` e `let`** (NUNCA `var`)
- **PROIBIDO `window.alert()`, `window.confirm()`, `window.prompt()`**

#### Event Listeners

```javascript
// Opção 1: Diretivas Vue.js (recomendado)
<button @click="handleClick">Botão</button>

// Opção 2: Event listeners em JS (para lógica complexa)
document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll('[data-action="mark-shipped"]');
    buttons.forEach((btn) => {
        btn.addEventListener("click", handleMarkShipped);
    });
});
```

#### Organização de Código JS

```javascript
// Exemplo: assets/js/services/pokemon-api.js
class PokemonApiService {
 constructor() {
  this.baseUrl = 'https://pokeapi.co/api/v2/pokemon';
 }

 async fetchPokemonList(limit = 151) {
  // Lógica de API aqui
 }

 async fetchPokemonDetails(url) {
  // Lógica de API aqui
 }
}

export default PokemonApiService;
```

```javascript
// Exemplo: assets/js/main.js
import PokemonApiService from './services/pokemon-api.js';
import { normalizeText } from './utils/normalizer.js';
import { sortPokemonById } from './utils/sorter.js';
import { filterPokemonList } from './filters/pokemon-filters.js';

Vue.createApp({
 data() {
  return {
   // Estado da aplicação
  };
 },
 // ...
}).mount('#app');
```

### 7. 🔍 Evitar Duplicatas

#### Antes de Criar Código Novo

1. **Procurar se já existe funcionalidade similar**
2. **Verificar se há código duplicado**
3. **Reutilizar código existente** (Services, Utils)
4. **Refatorar em vez de duplicar**

#### Usar

- **Services**: para lógica reutilizável de API
- **Utils**: para funções utilitárias simples
- **Filters**: para lógica de filtros reutilizável
- **Componentes CSS**: para estilos reutilizáveis

### 8. 📝 Git e Commits

#### Commits

- **NUNCA `git add .`** (sempre verificar arquivos específicos)
- **Conventional Commits**:
  - `feat: Adiciona sistema de filtros por tipo`
  - `fix: Corrige erro ao carregar detalhes do Pokémon`
  - `refactor: Modulariza JavaScript de filtros`
  - `style: Remove CSS inline e modulariza estilos`
  - `docs: Atualiza documentação do projeto`

#### Antes de Commitar

1. [ ] Verificar arquivos alterados (`git status`)
2. [ ] Adicionar apenas arquivos relevantes
3. [ ] Verificar linter errors
4. [ ] Escrever mensagem descritiva
5. [ ] Testar funcionalidade

### 9. 🔒 Segurança

#### Validação

- **SEMPRE validar dados da API** antes de usar
- **Sanitizar inputs** do utilizador
- **Tratamento de erros** adequado

#### Proteção

- **XSS**: sempre garantir que dados da API são seguros
- **Tratamento de erros**: sempre usar try/catch em chamadas async
- **Validação de dados**: verificar estrutura antes de usar

### 10. ✅ Checklist de Qualidade (Antes de Commitar)

- [ ] Código segue princípios de responsabilidade única
- [ ] **CSS está em arquivo externo** (ZERO inline)
- [ ] **JavaScript está em arquivo externo** (ZERO inline)
- [ ] Sem `console.log()` esquecidos (exceto para debug temporário)
- [ ] Variáveis e funções com nomes descritivos em PT-BR
- [ ] Comentários onde necessário (lógica complexa)
- [ ] Responsivo para mobile (se aplicável)
- [ ] Tratamento de erros adequado
- [ ] Sem duplicatas de código
- [ ] IDs substituídos por classes (exceto #app)
- [ ] Textos traduzidos para PT-BR

### 11. 🎯 Padrões Vue.js

#### Data Properties

- **Nomes descritivos**: `pokemonList` (não `list`)
- **Inicialização adequada**: sempre inicializar com valores padrão
- **Estrutura clara**: objetos aninhados bem definidos

#### Methods

- **Métodos pequenos e focados**: uma responsabilidade por método
- **Nomes descritivos**: `openPokedexModal()` (não `open()`)
- **Reutilização**: extrair lógica comum para utils/services

#### Computed Properties

- **Usar para valores derivados**: `filteredList` baseado em `list` e `filter`
- **Performance**: cache automático de Vue.js
- **Lógica simples**: computed deve ser puro e síncrono

---

## 📚 Referências Importantes

- **Vue.js 3 Documentation**: https://vuejs.org/
- **PokeAPI**: https://pokeapi.co/
- **Este arquivo**: `REGRAS_PROJETO_POKEDEX.md`

---

## 🎯 Resumo: O Que NUNCA Fazer

1. ❌ Tags `<style>` e `<script>` inline (ZERO tolerância)
2. ❌ `window.alert()`, `window.confirm()`, `window.prompt()` (usar alternativas modernas)
3. ❌ Usar `git add .` (sempre específico)
4. ❌ Código duplicado (verificar se já existe)
5. ❌ Lógica de negócio misturada (usar Services/Utils)
6. ❌ Português de Portugal (usar PT-BR)
7. ❌ Commits sem testar funcionalidade
8. ❌ Misturar responsabilidades (CSS em arquivos .css, JS em arquivos .js)
9. ❌ IDs para estilização (usar classes, exceto #app)
10. ❌ Usar `var` (usar `const` e `let`)

## ✅ O Que é PERMITIDO (com bom senso)

1. ✅ Atributos `onclick=""`, `onload=""` quando necessário
2. ✅ Atributos `style=""` quando absolutamente necessário (evitar quando possível)
3. ✅ Diretivas Vue.js (`@click`, `v-model`, etc.)
4. ✅ Referências a bibliotecas externas via CDN no HTML

---

**Estas regras são OBRIGATÓRIAS para manter a qualidade, consistência e funcionamento correto do projeto.**

**Última atualização**: Janeiro 2025
