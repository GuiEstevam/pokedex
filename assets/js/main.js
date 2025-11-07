/**
 * Aplicação Vue.js principal
 * Responsabilidade única: orquestração e bindings
 */

// Aguardar DOM e dependências carregarem
(function() {
    'use strict';
    
    // Função para aplicar tema antes do Vue (para evitar flash)
    function applyInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const html = document.documentElement;
        
        if (savedTheme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else if (savedTheme === 'light') {
            html.removeAttribute('data-theme');
        } else {
            // Verificar preferência do sistema
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                html.setAttribute('data-theme', 'dark');
            } else {
                html.removeAttribute('data-theme');
            }
        }
    }
    
    // Aplicar tema imediatamente quando o script carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            applyInitialTheme();
        });
    } else {
        applyInitialTheme();
    }

    // Função para inicializar quando tudo estiver pronto
    function initializeApp() {
        // Verificar se Vue está disponível
        if (typeof Vue === 'undefined') {
            console.error('Vue.js não foi carregado! Verifique se o CDN está acessível.');
            return;
        }
        
        // Verificar se funções globais estão disponíveis
        if (typeof window.sortPokemonById === 'undefined') {
            console.error('Funções utilitárias não foram carregadas! Verifique os scripts.');
            return;
        }
        
        // Verificar se o elemento #app existe
        const appElement = document.getElementById('app');
        if (!appElement) {
            console.error('Elemento #app não encontrado!');
            return;
        }

        try {
            const app = Vue.createApp({
    data() {
        return {
            pokemonList: [],
            filter: "",
            filterType: [], // Array de tipos selecionados
            pokedexOpen: false,
            sidebarAberta: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
            viewportLargura: typeof window !== 'undefined' ? window.innerWidth : 1024,
            viewportAltura: typeof window !== 'undefined' ? window.innerHeight : 1024,
            isLoading: false,
            isLoadingMore: false,
            viewMode: 'grid', // 'grid' ou 'list'
            gridDensity: 'double', // 'double' (dois cards) ou 'single' (um card)
            isGridDensityTransitioning: false,
            gridDensityTransitionTimeout: null,
            imageViewMode: 'official', // 'official', 'sprite', 'shiny', 'back'
            isDarkMode: false,
            groupByType: false, // Agrupar por tipo ou não
            sortBy: 'id', // Critério de ordenação
            sortAscending: true, // Ordem crescente ou decrescente
            currentOffset: 0, // Offset atual na lista completa (inclui pré-carregados)
            scrollOffset: 0, // Offset dos Pokémon carregados via scroll infinito
            batchSize: 30, // Quantidade de Pokémon por lote
            totalPokemon: 151, // Total de Pokémon a carregar (será atualizado pela região)
            hasMore: true,
            scrollObserver: null, // Intersection Observer para scroll infinito
            selectedRegion: 'kanto', // Região selecionada
            isPreloading: false, // Flag para pré-carregamento em background
            preloadBatchSize: 15, // Tamanho menor do batch para pré-carregamento
            preloadTimeout: null, // Timeout para controlar pré-carregamento
            searchAccelerated: false, // Flag para acelerar carregamento durante busca
            filterHP: { min: null, max: null }, // Filtro de HP (mínimo/máximo)
            filterWeight: { min: null, max: null }, // Filtro de peso (mínimo/máximo)
            filterHeight: { min: null, max: null }, // Filtro de altura (mínimo/máximo)
            regions: {
                kanto: { name: 'Kanto', limit: 151, start: 1, end: 151 },
                johto: { name: 'Johto', limit: 100, start: 152, end: 251 },
                hoenn: { name: 'Hoenn', limit: 135, start: 252, end: 386 },
                sinnoh: { name: 'Sinnoh', limit: 107, start: 387, end: 493 }
            },
            selectedPokemon: {
                sprites: {
                    other: {
                        'official-artwork': {
                            front_default: "",
                        }
                    }
                }
            },
            typesVisibleCount: 9, // Contador de tipos visíveis (inicial: 9)
            typesBatchSize: 6, // Quantidade de tipos por batch
            isLoadingTypes: false, // Flag para loading de tipos
            _pendingFilterType: null, // Filtro de tipo pendente para validação após carregamento
            advancedFiltersCollapsed: true, // Seção de filtros avançados (estatísticas + tipos) colapsada por padrão
            _previousActiveElement: null, // Elemento que tinha foco antes do modal abrir (para foco trap)
            _modalFocusableElements: null, // Elementos focáveis dentro do modal
            // Sistema de abas e dados adicionais
            activeTab: 'info', // Aba ativa no modal ('info', 'moves', 'evolution')
            pokemonSpecies: null, // Dados da espécie do Pokémon
            pokemonAbilitiesDetails: [], // Detalhes das habilidades (com descrições)
            evolutionChain: null, // Cadeia evolutiva normalizada
            pokemonMoves: [], // Movimentos do Pokémon (já vem na API)
            activeMoveGeneration: 'all', // Geração ativa na aba de movimentos
            movesVisibleInitial: 18, // Quantidade inicial de movimentos exibidos
            movesVisibleCount: 18, // Quantidade atual de movimentos visíveis
            movesBatchSize: 12, // Quantidade adicionada a cada ação de "mostrar mais"
            isLoadingAdditionalData: false, // Flag de carregamento de dados adicionais
            // Gestos touch
            _touchStartX: null, // Posição X inicial do toque
            _touchStartY: null, // Posição Y inicial do toque
            _touchThreshold: 50, // Threshold mínimo para detectar swipe (50px)
            _reloadingPokemonData: null, // Flag para prevenir múltiplas chamadas simultâneas de reloadPokemonFullData
        }
    },
    watch: {
        // Expandir seção de filtros avançados se houver filtros ativos
        filterHP: {
            handler(newValue) {
                if ((newValue.min !== null || newValue.max !== null) && this.advancedFiltersCollapsed) {
                    this.advancedFiltersCollapsed = false;
                }
            },
            deep: true
        },
        filterWeight: {
            handler(newValue) {
                if ((newValue.min !== null || newValue.max !== null) && this.advancedFiltersCollapsed) {
                    this.advancedFiltersCollapsed = false;
                }
            },
            deep: true
        },
        filterHeight: {
            handler(newValue) {
                if ((newValue.min !== null || newValue.max !== null) && this.advancedFiltersCollapsed) {
                    this.advancedFiltersCollapsed = false;
                }
            },
            deep: true
        },
        // Expandir seção de tipos se houver tipos selecionados
        filterType: {
            handler(newValue) {
                const hasTypeFilter = Array.isArray(newValue) 
                    ? newValue.length > 0 
                    : (newValue && newValue !== "");
                if (hasTypeFilter && this.advancedFiltersCollapsed) {
                    this.advancedFiltersCollapsed = false;
                }
            },
            deep: true
        }
    },
    computed: {
        /**
         * Determina se o layout deve se comportar como drawer (telas menores)
         */
        isDrawerMode() {
            return this.viewportLargura < 1024;
        },
        
        /**
         * Classes computadas para o container principal do layout
         */
        layoutShellClasses() {
            return {
                'layout-shell--sidebar-collapsed': !this.sidebarAberta,
                'layout-shell--drawer-mode': this.isDrawerMode
            };
        },
        
        /**
         * Exibe overlay quando a sidebar estiver aberta no modo drawer
         */
        shouldShowOverlay() {
            return this.sidebarAberta && this.isDrawerMode;
        },
        
        /**
         * Lista filtrada de Pokémon
         */
        filteredList() {
            // Verificar se funções estão disponíveis
            if (!window.filterPokemonList || !window.normalizeText) {
                // Se não há filtros, limitar aos carregados via scroll
                if (!this.isFiltering) {
                    return this.pokemonList.slice(0, this.scrollOffset);
                }
                return this.pokemonList;
            }
            
            // Determinar qual lista usar
            // Se há filtros ativos, usar todos os Pokémon carregados (incluindo pré-carregados)
            // Se não há filtros e a ordenação é padrão (ID crescente), usar apenas os carregados via scroll infinito
            // Se não há filtros mas a ordenação não é padrão, usar todos os Pokémon carregados para ordenação correta
            let listToFilter = this.pokemonList;
            if (!this.isFiltering) {
                // Verificar se a ordenação é padrão (ID crescente)
                const isDefaultSort = this.sortBy === 'id' && this.sortAscending;
                
                if (isDefaultSort) {
                    // Ordenação padrão: usar apenas os carregados via scroll infinito (lazy loading)
                    listToFilter = this.pokemonList.slice(0, this.scrollOffset);
                } else {
                    // Ordenação personalizada: usar todos os Pokémon carregados para ordenação correta
                    // Isso garante que quando o usuário inverte a ordem, veja todos os Pokémon (ex: do 151 ao 1)
                    listToFilter = this.pokemonList;
                }
            }
            
            // Ordenar primeiro - sempre usar sortPokemonBy quando disponível para respeitar sortAscending
            let sortedList;
            if (window.sortPokemonBy) {
                sortedList = window.sortPokemonBy([...listToFilter], this.sortBy, this.sortAscending);
            } else if (window.sortPokemonById) {
                // Fallback: se sortPokemonBy não estiver disponível, usar sortPokemonById (sempre crescente)
                sortedList = window.sortPokemonById([...listToFilter]);
            } else {
                sortedList = listToFilter;
            }
            
            // Filtrar por nome e tipo
            let filtered = window.filterPokemonList(
                sortedList,
                this.filter,
                this.filterType,
                window.normalizeText,
                this.filterHP,
                this.filterWeight,
                this.filterHeight
            );
            
            return filtered;
        },
        
        /**
         * Lista agrupada por tipo primário (opcional)
         */
        groupedList() {
            if (!this.filteredList || this.filteredList.length === 0) {
                return [];
            }
            
            // Se agrupamento está desabilitado, retornar lista simples
            if (!this.groupByType) {
                return [{
                    type: 'all',
                    label: 'Todos',
                    pokemon: this.filteredList
                }];
            }
            
            // Se há filtro de tipo, não agrupar - retornar lista simples
            const hasTypeFilter = Array.isArray(this.filterType) ? this.filterType.length > 0 : this.filterType !== "";
            if (hasTypeFilter) {
                // Se múltiplos tipos, mostrar como "Múltiplos Tipos"
                const typeLabel = Array.isArray(this.filterType) && this.filterType.length > 1
                    ? `Múltiplos Tipos (${this.filterType.length})`
                    : Array.isArray(this.filterType) && this.filterType.length === 1
                    ? this.translateType(this.filterType[0])
                    : this.translateType(this.filterType);
                return [{
                    type: Array.isArray(this.filterType) ? this.filterType.join(',') : this.filterType,
                    label: typeLabel,
                    pokemon: this.filteredList
                }];
            }
            
            const groups = {};
            
            this.filteredList.forEach(pokemon => {
                const primaryType = pokemon.types && pokemon.types[0] ? pokemon.types[0].type.name : 'normal';
                const typeLabel = this.translateType(primaryType);
                
                if (!groups[typeLabel]) {
                    groups[typeLabel] = {
                        type: primaryType,
                        label: typeLabel,
                        pokemon: []
                    };
                }
                
                groups[typeLabel].pokemon.push(pokemon);
            });
            
            // Ordenar grupos e Pokémon dentro dos grupos
            return Object.keys(groups)
                .sort()
                .map(key => groups[key])
                .map(group => ({
                    ...group,
                    pokemon: group.pokemon.sort((a, b) => a.id - b.id)
                }));
        },
        
        /**
         * Contagem de resultados
         */
        resultCount() {
            return this.filteredList.length;
        },
        
        /**
         * Total de Pokémon carregados
         */
        totalCount() {
            return this.totalPokemon;
        },
        
        /**
         * Verifica se há resultados
         */
        hasResults() {
            return this.filteredList.length > 0;
        },
        
        /**
         * Verifica se está filtrando
         */
        isFiltering() {
            const hasFilter = this.filter && this.filter.trim() !== "";
            const hasTypeFilter = Array.isArray(this.filterType) 
                ? this.filterType.length > 0 
                : (this.filterType && this.filterType !== "");
            const hasHPFilter = this.filterHP && (this.filterHP.min !== null || this.filterHP.max !== null);
            const hasWeightFilter = this.filterWeight && (this.filterWeight.min !== null || this.filterWeight.max !== null);
            const hasHeightFilter = this.filterHeight && (this.filterHeight.min !== null || this.filterHeight.max !== null);
            return hasFilter || hasTypeFilter || hasHPFilter || hasWeightFilter || hasHeightFilter;
        },
        
        /**
         * Classes CSS para modo de visualização
         */
        viewModeClass() {
            const className = `view-mode-${this.viewMode}`;
            return className;
        },
        
        /**
         * Classe CSS para densidade da grelha de cards
         */
        gridDensityClass() {
            if (this.viewMode !== 'grid') {
                return '';
            }
            const baseClass = `grid-density-${this.gridDensity}`;
            return this.isGridDensityTransitioning ? `${baseClass} grid-density-animating` : baseClass;
        },
        
        /**
         * Indica se está em mobile (portrait) para mostrar controles específicos
         */
        isMobilePortrait() {
            const largura = this.viewportLargura || 0;
            const altura = this.viewportAltura || (typeof window !== 'undefined' ? window.innerHeight : largura);
            const isPortrait = altura >= largura;
            return largura <= 768 && isPortrait;
        },
        
        /**
         * Nome da região atual
         */
        currentRegionName() {
            return this.regions[this.selectedRegion]?.name || 'Kanto';
        },
        
        /**
         * Conta quantos Pokémon de cada tipo estão disponíveis (após filtros de nome)
         */
        typeCounts() {
            if (!this.pokemonList || this.pokemonList.length === 0) {
                return {};
            }
            
            // Primeiro aplicar filtro de nome se houver
            let listToCount = this.pokemonList;
            if (this.filter && this.filter.trim() !== '' && window.filterPokemonList && window.normalizeText) {
                listToCount = window.filterPokemonList(
                    this.pokemonList,
                    this.filter,
                    [], // Não filtrar por tipo para contar todos
                    window.normalizeText
                );
            }
            
            // Contar tipos
            const counts = {};
            
            listToCount.forEach(pokemon => {
                if (pokemon.types && Array.isArray(pokemon.types)) {
                    pokemon.types.forEach(typeObj => {
                        if (typeObj && typeObj.type && typeObj.type.name) {
                            const typeName = typeObj.type.name;
                            counts[typeName] = (counts[typeName] || 0) + 1;
                        }
                    });
                }
            });
            
            return counts;
        },
        
        /**
         * Tipos únicos disponíveis na lista atual com contagem
         * IMPORTANTE: SEMPRE retorna todos os tipos possíveis (18 tipos)
         * desde o início, independente de pokemonList estar vazio ou não.
         * Isso garante que o usuário possa filtrar por qualquer tipo,
         * mesmo que ainda não tenha carregado Pokémon com aquele tipo.
         * Tipos sem Pokémon carregados terão count: 0 e aparecerão desabilitados.
         */
        availableTypes() {
            // Obter todos os tipos possíveis (18 tipos)
            // Esta função sempre retorna os 18 tipos, não depende de pokemonList
            const allPossibleTypes = window.getTranslatedTypesForSelect ? window.getTranslatedTypesForSelect() : [];
            
            if (!allPossibleTypes || allPossibleTypes.length === 0) {
                // Fallback: se não houver função de tradução, retornar array vazio
                // Mas isso não deve acontecer se type-translator.js foi carregado
                return [];
            }
            
            // SEMPRE retornar todos os 18 tipos possíveis
            // Não depende de pokemonList estar preenchido
            // A contagem (count) será baseada nos Pokémon carregados via typeCounts
            // Tipos sem Pokémon terão count: 0 (já tratado em typeCounts)
            return allPossibleTypes.map(type => ({
                value: type.value,
                label: type.label,
                count: this.typeCounts[type.value] || 0
            }));
        },
        
        /**
         * Tipos visíveis (carregamento progressivo em batches)
         * SEMPRE limita a quantidade visível baseado em typesVisibleCount
         * Garante que tipos selecionados sempre apareçam, mesmo fora do batch atual
         */
        visibleTypes() {
            if (!this.availableTypes || this.availableTypes.length === 0) {
                return [];
            }
            
            // Obter tipos selecionados
            const selectedTypes = Array.isArray(this.filterType) ? this.filterType : [];
            
            // Se não há tipos selecionados, SEMPRE retornar apenas os visíveis (limitado)
            if (selectedTypes.length === 0) {
                // Limitar aos primeiros typesVisibleCount tipos
                const limited = this.availableTypes.slice(0, this.typesVisibleCount);
                return limited;
            }
            
            // Com tipos selecionados: garantir que apareçam + alguns não selecionados
            const selectedTypeObjects = this.availableTypes.filter(type => 
                selectedTypes.includes(type.value)
            );
            const selectedCount = selectedTypeObjects.length;
            
            // Se typesVisibleCount já cobre todos os tipos, retornar todos
            if (this.typesVisibleCount >= this.availableTypes.length) {
                return this.availableTypes;
            }
            
            // Calcular quantos slots restam para tipos não selecionados
            const remainingSlots = Math.max(0, this.typesVisibleCount - selectedCount);
            
            // Obter tipos não selecionados
            const nonSelectedTypes = this.availableTypes.filter(type => 
                !selectedTypes.includes(type.value)
            );
            
            // Pegar apenas os não selecionados até o limite de slots restantes
            const visibleNonSelected = nonSelectedTypes.slice(0, remainingSlots);
            
            // Combinar: tipos selecionados + não selecionados limitados
            const allVisibleTypes = [...selectedTypeObjects, ...visibleNonSelected];
            
            // Ordenar para manter a ordem original de availableTypes
            return allVisibleTypes.sort((a, b) => {
                const indexA = this.availableTypes.findIndex(t => t.value === a.value);
                const indexB = this.availableTypes.findIndex(t => t.value === b.value);
                return indexA - indexB;
            });
        },
        
        /**
         * Verifica se há mais tipos para mostrar
         * Como todos os tipos (18) estão sempre disponíveis desde o início,
         * o botão aparece sempre que há mais tipos disponíveis que visíveis.
         * Funciona mesmo quando pokemonList está vazio na inicialização.
         */
        hasMoreTypes() {
            // Obter availableTypes (sempre retorna 18 tipos)
            const availableTypesArray = this.availableTypes;
            
            // Se não há tipos disponíveis (não deveria acontecer), não mostrar botão
            if (!availableTypesArray || availableTypesArray.length === 0) {
                return false;
            }
            
            const totalCount = availableTypesArray.length; // Sempre deve ser 18
            const visibleTypesArray = this.visibleTypes;
            const visibleCount = visibleTypesArray ? visibleTypesArray.length : 0;
            
            // Se typesVisibleCount já alcançou o total, não há mais para mostrar
            if (this.typesVisibleCount >= totalCount) {
                return false;
            }
            
            // Se há mais tipos disponíveis que visíveis, mostrar botão
            return visibleCount < totalCount;
        },
        
        /**
         * Verifica se todos os tipos estão visíveis (para mostrar botão "Mostrar Menos")
         */
        allTypesVisible() {
            if (!this.availableTypes || this.availableTypes.length === 0) {
                return false;
            }
            
            const totalCount = this.availableTypes.length; // Sempre deve ser 18
            // Se typesVisibleCount já alcançou ou ultrapassou o total, todos estão visíveis
            return this.typesVisibleCount >= totalCount;
        },
        
        /**
         * Verifica se há filtros ativos
         */
        hasActiveFilters() {
            const hasTypeFilter = Array.isArray(this.filterType) ? this.filterType.length > 0 : this.filterType !== "";
            const hasHPFilter = this.filterHP && (this.filterHP.min !== null || this.filterHP.max !== null);
            const hasWeightFilter = this.filterWeight && (this.filterWeight.min !== null || this.filterWeight.max !== null);
            const hasHeightFilter = this.filterHeight && (this.filterHeight.min !== null || this.filterHeight.max !== null);
            return this.filter !== "" || 
                   hasTypeFilter || 
                   hasHPFilter ||
                   hasWeightFilter ||
                   hasHeightFilter ||
                   this.sortBy !== 'id' || 
                   !this.sortAscending ||
                   this.groupByType;
        },
        
        /**
         * Contagem de filtros ativos
         */
        activeFiltersCount() {
            return this.activeFiltersList ? this.activeFiltersList.length : 0;
        },
        
        /**
         * Lista de filtros ativos para exibir em badges
         */
        activeFiltersList() {
            const filters = [];
            
            // Filtro de nome
            if (this.filter && this.filter.trim() !== "") {
                filters.push({
                    type: 'name',
                    label: `Busca: "${this.filter}"`,
                    value: this.filter
                });
            }
            
            // Filtro de tipo(s) - agora pode ser array
            const hasTypeFilter = Array.isArray(this.filterType) ? this.filterType.length > 0 : this.filterType !== "";
            if (hasTypeFilter) {
                const types = Array.isArray(this.filterType) ? this.filterType : [this.filterType];
                // Criar uma badge para cada tipo selecionado
                types.forEach(type => {
                    const typeLabel = this.translateType(type);
                    filters.push({
                        type: 'type',
                        label: `Tipo: ${typeLabel}`,
                        value: type
                    });
                });
            }
            
            // Filtro de HP
            if (this.filterHP && (this.filterHP.min !== null || this.filterHP.max !== null)) {
                let hpLabel = 'HP: ';
                if (this.filterHP.min !== null && this.filterHP.max !== null) {
                    hpLabel += `${this.filterHP.min}-${this.filterHP.max}`;
                } else if (this.filterHP.min !== null) {
                    hpLabel += `≥${this.filterHP.min}`;
                } else {
                    hpLabel += `≤${this.filterHP.max}`;
                }
                filters.push({
                    type: 'hp',
                    label: hpLabel,
                    value: this.filterHP
                });
            }
            
            // Filtro de Peso
            if (this.filterWeight && (this.filterWeight.min !== null || this.filterWeight.max !== null)) {
                let weightLabel = 'Peso: ';
                if (this.filterWeight.min !== null && this.filterWeight.max !== null) {
                    weightLabel += `${this.filterWeight.min.toFixed(1)}-${this.filterWeight.max.toFixed(1)} kg`;
                } else if (this.filterWeight.min !== null) {
                    weightLabel += `≥${this.filterWeight.min.toFixed(1)} kg`;
                } else {
                    weightLabel += `≤${this.filterWeight.max.toFixed(1)} kg`;
                }
                filters.push({
                    type: 'weight',
                    label: weightLabel,
                    value: this.filterWeight
                });
            }
            
            // Filtro de Altura
            if (this.filterHeight && (this.filterHeight.min !== null || this.filterHeight.max !== null)) {
                let heightLabel = 'Altura: ';
                if (this.filterHeight.min !== null && this.filterHeight.max !== null) {
                    heightLabel += `${this.filterHeight.min.toFixed(1)}-${this.filterHeight.max.toFixed(1)} m`;
                } else if (this.filterHeight.min !== null) {
                    heightLabel += `≥${this.filterHeight.min.toFixed(1)} m`;
                } else {
                    heightLabel += `≤${this.filterHeight.max.toFixed(1)} m`;
                }
                filters.push({
                    type: 'height',
                    label: heightLabel,
                    value: this.filterHeight
                });
            }
            
            // Ordenação (se não for padrão)
            if (this.sortBy !== 'id' || !this.sortAscending) {
                const sortLabels = {
                    'id': 'ID',
                    'name': 'Nome',
                    'type': 'Tipo',
                    'weight': 'Peso',
                    'height': 'Altura',
                    'hp': 'HP'
                };
                const sortLabel = sortLabels[this.sortBy] || this.sortBy;
                const orderLabel = this.sortAscending ? 'Crescente' : 'Decrescente';
                filters.push({
                    type: 'sort',
                    label: `Ordenar: ${sortLabel} (${orderLabel})`,
                    value: `${this.sortBy}-${this.sortAscending}`
                });
            }
            
            return filters;
        },
        
        /**
         * Calcula o total de todas as estatísticas do Pokémon selecionado
         */
        totalStats() {
            if (!this.selectedPokemon || !this.selectedPokemon.stats || !Array.isArray(this.selectedPokemon.stats)) {
                return 0;
            }
            return this.selectedPokemon.stats.reduce((total, stat) => total + (stat.base_stat || 0), 0);
        },
        
        /**
         * Identifica a melhor estatística do Pokémon selecionado
         */
        bestStat() {
            if (!this.selectedPokemon || !this.selectedPokemon.stats || !Array.isArray(this.selectedPokemon.stats) || this.selectedPokemon.stats.length === 0) {
                return null;
            }
            return this.selectedPokemon.stats.reduce((best, stat) => {
                if (!best || (stat.base_stat || 0) > (best.base_stat || 0)) {
                    return stat;
                }
                return best;
            }, null);
        },
        
        /**
         * Identifica a pior estatística do Pokémon selecionado
         */
        worstStat() {
            if (!this.selectedPokemon || !this.selectedPokemon.stats || !Array.isArray(this.selectedPokemon.stats) || this.selectedPokemon.stats.length === 0) {
                return null;
            }
            return this.selectedPokemon.stats.reduce((worst, stat) => {
                if (!worst || (stat.base_stat || 0) < (worst.base_stat || 0)) {
                    return stat;
                }
                return worst;
            }, null);
        },
        
        /**
         * Obtém movimentos agrupados por geração (computed property)
         * @returns {Object} Objeto com movimentos agrupados
         */
        movesByGeneration() {
            if (!Array.isArray(this.pokemonMoves) || this.pokemonMoves.length === 0) {
                return { 'all': [] };
            }
            if (!window.groupMovesByGeneration) {
                return { 'all': this.pokemonMoves };
            }
            return window.groupMovesByGeneration(this.pokemonMoves);
        },

        /**
         * Lista de gerações disponíveis baseada nos movimentos do Pokémon
         */
        availableGenerations() {
            try {
                const generations = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
                if (!this.movesByGeneration || typeof this.movesByGeneration !== 'object') {
                    return [];
                }
                const available = generations.filter(gen => {
                    return this.movesByGeneration[gen] && 
                           Array.isArray(this.movesByGeneration[gen]) && 
                           this.movesByGeneration[gen].length > 0;
                });
                return available || [];
            } catch (error) {
                return [];
            }
        },

        filteredMovesByActiveGeneration() {
            const moves = this.filterMovesByGeneration(this.activeMoveGeneration);
            return Array.isArray(moves) ? moves : [];
        },

        visibleMoves() {
            if (!this.filteredMovesByActiveGeneration.length) {
                return [];
            }
            return this.filteredMovesByActiveGeneration.slice(0, this.movesVisibleCount);
        },

        totalMovesForActiveGeneration() {
            return this.filteredMovesByActiveGeneration.length;
        },

        hasMoreMoves() {
            return this.movesVisibleCount < this.totalMovesForActiveGeneration;
        },

        canCollapseMoves() {
            return this.totalMovesForActiveGeneration > this.movesVisibleInitial &&
                   this.movesVisibleCount > this.movesVisibleInitial;
        },
        
        /**
         * Obtém a URL da imagem atual baseada no modo de visualização
         */
        currentImageUrl() {
            if (!this.selectedPokemon || !this.selectedPokemon.sprites) {
                return '';
            }
            
            const sprites = this.selectedPokemon.sprites;
            
            switch(this.imageViewMode) {
                case 'official':
                    return sprites.other?.['official-artwork']?.front_default || sprites.front_default || '';
                case 'official-shiny':
                    return sprites.other?.['official-artwork']?.front_shiny || sprites.front_shiny || '';
                case 'sprite':
                    return sprites.front_default || '';
                case 'sprite-shiny':
                    return sprites.front_shiny || '';
                case 'back':
                    return sprites.back_default || '';
                case 'back-shiny':
                    return sprites.back_shiny || '';
                default:
                    return sprites.other?.['official-artwork']?.front_default || sprites.front_default || '';
            }
        },
        
        /**
         * Lista de todas as imagens disponíveis do Pokémon selecionado
         */
        availableImages() {
            if (!this.selectedPokemon || !this.selectedPokemon.sprites) {
                return [];
            }
            
            const sprites = this.selectedPokemon.sprites;
            const images = [];
            
            if (sprites.front_default) {
                images.push({
                    mode: 'sprite',
                    label: 'Sprite Frontal',
                    url: sprites.front_default,
                    icon: 'image'
                });
            }
            
            if (sprites.front_shiny) {
                images.push({
                    mode: 'sprite-shiny',
                    label: 'Sprite Shiny',
                    url: sprites.front_shiny,
                    icon: 'star'
                });
            }
            
            if (sprites.back_default) {
                images.push({
                    mode: 'back',
                    label: 'Sprite Traseiro',
                    url: sprites.back_default,
                    icon: 'swap-horizontal'
                });
            }
            
            if (sprites.back_shiny) {
                images.push({
                    mode: 'back-shiny',
                    label: 'Sprite Traseiro Shiny',
                    url: sprites.back_shiny,
                    icon: 'sparkles'
                });
            }
            
            if (sprites.other?.['official-artwork']?.front_default) {
                images.push({
                    mode: 'official',
                    label: 'Arte Oficial',
                    url: sprites.other['official-artwork'].front_default,
                    icon: 'color-palette'
                });
            }
            
            if (sprites.other?.['official-artwork']?.front_shiny) {
                images.push({
                    mode: 'official-shiny',
                    label: 'Arte Oficial Shiny',
                    url: sprites.other['official-artwork'].front_shiny,
                    icon: 'sparkles'
                });
            }
            
            return images;
        }
    },
    methods: {
        /**
         * Formata ID do Pokémon
         */
        formatPokemonId(id) {
            if (!id && id !== 0) return '#000';
            const numId = typeof id === 'number' ? id : parseInt(id);
            if (isNaN(numId)) return '#000';
            return `#${String(numId).padStart(3, '0')}`;
        },
        
        /**
         * Converte peso de hectogramas para kg
         */
        convertWeightToKg(weight) {
            if (!weight && weight !== 0) return '0.0';
            const numWeight = typeof weight === 'number' ? weight : parseInt(weight);
            if (isNaN(numWeight)) return '0.0';
            return (numWeight / 10).toFixed(1);
        },
        
        /**
         * Converte altura de decímetros para metros
         */
        convertHeightToM(height) {
            if (!height && height !== 0) return '0.0';
            const numHeight = typeof height === 'number' ? height : parseInt(height);
            if (isNaN(numHeight)) return '0.0';
            return (numHeight / 10).toFixed(1);
        },
        /**
         * Busca dados da API (carregamento inicial)
         */
        async fetchPokemonData() {
            try {
                if (!window.PokemonApiService) {
                    if (window.errorHandler) {
                        window.errorHandler.handleError(
                            new Error('Serviço de API não disponível'),
                            'inicialização'
                        );
                    }
                    return Promise.resolve();
                }
                this.isLoading = true;
                this.currentOffset = 0;
                this.scrollOffset = 0; // Resetar offset de scroll
                this.hasMore = true;
                this.pokemonList = [];
                
                // Atualizar limite baseado na região
                this.updateRegionLimit();
                
                // Carregar primeiro batch imediatamente
                await this.loadMorePokemon();
                
                // Não iniciar pré-carregamento automático
                // Lazy loading: carregar apenas quando usuário scrolla
                // Pré-carregamento só será iniciado quando usuário pesquisar
            } catch (error) {
                if (window.errorHandler) {
                    window.errorHandler.handleApiError(error, 'carregar Pokémon');
                }
            } finally {
                this.isLoading = false;
            }
        },
        
        /**
         * Atualiza o limite de Pokémon baseado na região selecionada
         */
        updateRegionLimit() {
            const region = this.regions[this.selectedRegion];
            if (region) {
                this.totalPokemon = region.limit;
            } else {
                this.totalPokemon = 151; // Fallback para Kanto
            }
        },
        
        /**
         * Altera a região selecionada
         */
        changeRegion() {
            // Parar pré-carregamento anterior
            this.stopPreloading();
            
            // Resetar estado
            this.currentOffset = 0;
            this.scrollOffset = 0; // Resetar offset de scroll
            this.hasMore = true;
            this.pokemonList = [];
            this.filter = '';
            // Limpar filtro de tipo temporariamente (será validado após carregar dados)
            const savedFilterType = Array.isArray(this.filterType) ? [...this.filterType] : (this.filterType ? [this.filterType] : []);
            this.filterType = [];
            this._pendingFilterType = savedFilterType.length > 0 ? savedFilterType : null;
            // Resetar filtros de estatísticas
            this.filterHP = { min: null, max: null };
            this.filterWeight = { min: null, max: null };
            this.filterHeight = { min: null, max: null };
            this.searchAccelerated = false;
            
            // Resetar visibilidade de tipos para quantidade inicial
            this.resetTypesVisibility();
            
            // Atualizar limite
            this.updateRegionLimit();
            
            // Salvar preferência
            this.saveRegionPreference();
            
            // Recarregar dados
            this.fetchPokemonData().then(() => {
                // Validar e aplicar filtro de tipo após dados serem carregados
                this.validateAndApplyFilterType();
            });
        },
        
        /**
         * Salva preferência de região no localStorage
         */
        saveRegionPreference() {
            localStorage.setItem('selectedRegion', this.selectedRegion);
        },
        
        /**
         * Carrega preferência de região do localStorage
         */
        loadRegionPreference() {
            const savedRegion = localStorage.getItem('selectedRegion');
            if (savedRegion && this.regions[savedRegion]) {
                this.selectedRegion = savedRegion;
                this.updateRegionLimit();
            }
        },

        /**
         * Carrega mais Pokémon (lazy loading)
         */
        async loadMorePokemon() {
            if (this.isLoadingMore || !this.hasMore) {
                return;
            }

            try {
                this.isLoadingMore = true;
                const apiService = new window.PokemonApiService();
                const region = this.regions[this.selectedRegion];
                
                // Usar scrollOffset para calcular o próximo batch a carregar via scroll
                // Isso garante que o scroll infinito não seja afetado pelo pré-carregamento
                const regionOffset = region ? region.start - 1 : 0;
                const actualOffset = regionOffset + this.scrollOffset;
                
                // Calcular limite do batch respeitando o limite da região
                // Verificar baseado no scrollOffset, não no currentOffset
                const remaining = this.totalPokemon - this.scrollOffset;
                const batchLimit = Math.min(this.batchSize, remaining);
                
                if (batchLimit <= 0) {
                    this.hasMore = false;
                    return;
                }
                
                // Verificar se os Pokémon já foram pré-carregados
                // Se sim, apenas atualizar scrollOffset sem fazer nova requisição
                if (this.scrollOffset < this.currentOffset) {
                    // Pokémon já estão na lista, apenas atualizar scrollOffset
                    const nextScrollOffset = Math.min(this.scrollOffset + batchLimit, this.currentOffset);
                    this.scrollOffset = nextScrollOffset;
                    
                    // Verificar se ainda há mais para carregar
                    if (this.scrollOffset >= this.totalPokemon) {
                        this.hasMore = false;
                    }
                    
                    this.isLoadingMore = false;
                    
                    // Atualizar observer após mudança no scrollOffset
                    this.$nextTick(() => {
                        this.updateScrollObserver();
                    });
                    
                    return;
                }
                
                // Se não foram pré-carregados, fazer requisição
                const newPokemon = await apiService.fetchPokemonBatch(
                    actualOffset,
                    batchLimit
                );
                
                if (!newPokemon || newPokemon.length === 0) {
                    this.hasMore = false;
                    return;
                }

                // Adicionar à lista existente
                this.pokemonList = [...this.pokemonList, ...newPokemon];
                this.currentOffset += newPokemon.length;
                this.scrollOffset += newPokemon.length;

                // Verificar se ainda há mais para carregar
                if (this.scrollOffset >= this.totalPokemon || newPokemon.length < batchLimit) {
                    this.hasMore = false;
                    // Se já carregou todos no primeiro batch, mostrar toast aqui
                    if (this.scrollOffset >= this.totalPokemon && window.errorHandler && !this.isFiltering) {
                        window.errorHandler.showSuccess(
                            'Carregamento completo',
                            `Todos os ${this.scrollOffset} Pokémon de ${this.currentRegionName} foram carregados.`
                        );
                    }
                }
            } catch (error) {
                if (window.errorHandler) {
                    window.errorHandler.handleApiError(error, 'carregar mais Pokémon');
                }
            } finally {
                this.isLoadingMore = false;
            }
        },
        
        /**
         * Inicia pré-carregamento em background
         */
        startPreloading() {
            // Parar pré-carregamento anterior se existir
            this.stopPreloading();
            
            // Se já carregou todos, não precisa pré-carregar
            if (this.currentOffset >= this.totalPokemon) {
                return;
            }
            
            this.isPreloading = true;
            this.preloadAllPokemon();
        },
        
        /**
         * Para pré-carregamento
         */
        stopPreloading() {
            if (this.preloadTimeout) {
                clearTimeout(this.preloadTimeout);
                this.preloadTimeout = null;
            }
            this.isPreloading = false;
        },
        
        /**
         * Pré-carrega todos os Pokémon da região em background
         */
        async preloadAllPokemon() {
            // Se não há mais para carregar, parar
            if (this.currentOffset >= this.totalPokemon) {
                this.isPreloading = false;
                // Não definir hasMore = false aqui - deixar scroll infinito controlar
                return;
            }
            
            // Pré-carregamento pode rodar em background suave (searchAccelerated = false)
            // ou acelerado quando há busca/filtros ativos (searchAccelerated = true)
            // A velocidade é controlada pelo delay mais abaixo
            
            // Se já está carregando mais, aguardar
            // Isso evita conflito entre scroll infinito e pré-carregamento
            if (this.isLoadingMore) {
                // Tentar novamente em breve
                const retryDelay = this.searchAccelerated ? 200 : 1000;
                this.preloadTimeout = setTimeout(() => {
                    this.preloadAllPokemon();
                }, retryDelay);
                return;
            }
            
            try {
                const apiService = new window.PokemonApiService();
                const region = this.regions[this.selectedRegion];
                
                // Calcular offset baseado na região
                const regionOffset = region ? region.start - 1 : 0;
                const actualOffset = regionOffset + this.currentOffset;
                
                // Calcular limite do batch para pré-carregamento (pequeno para não bloquear UI)
                const remaining = this.totalPokemon - this.currentOffset;
                // Usar batches pequenos para não sobrecarregar
                const batchLimit = Math.min(10, remaining);
                
                if (batchLimit <= 0) {
                    this.isPreloading = false;
                    return;
                }
                
                // Carregar batch em background
                const newPokemon = await apiService.fetchPokemonBatch(
                    actualOffset,
                    batchLimit
                );
                
                if (!newPokemon || newPokemon.length === 0) {
                    this.isPreloading = false;
                    return;
                }
                
                // Adicionar à lista existente
                // IMPORTANTE: Pré-carregamento só atualiza currentOffset, não scrollOffset
                // scrollOffset só é atualizado via loadMorePokemon (scroll infinito)
                this.pokemonList = [...this.pokemonList, ...newPokemon];
                this.currentOffset += newPokemon.length;
                
                // Verificar se ainda há mais para carregar
                if (this.currentOffset >= this.totalPokemon) {
                    this.isPreloading = false;
                    // Não definir hasMore = false aqui - deixar scroll infinito controlar
                    // Não mostrar toast aqui - o toast só deve aparecer quando scroll infinito termina
                    // O pré-carregamento é silencioso em background
                    return;
                }
                
                // Continuar pré-carregamento em background
                // Se searchAccelerated é true, carregar mais rápido (para busca/filtros)
                // Se searchAccelerated é false, carregar mais devagar (background suave)
                const delay = this.searchAccelerated ? 200 : 800; // Delay maior quando em background suave
                
                // Usar requestIdleCallback se disponível, senão setTimeout
                if (window.requestIdleCallback) {
                    window.requestIdleCallback(() => {
                        this.preloadAllPokemon();
                    }, { timeout: delay });
                } else {
                    this.preloadTimeout = setTimeout(() => {
                        this.preloadAllPokemon();
                    }, delay);
                }
            } catch (error) {
                // Em caso de erro, parar pré-carregamento silenciosamente
                // (não mostrar erro para não incomodar usuário durante pré-carregamento)
                this.isPreloading = false;
            }
        },
        
        /**
         * Limpa todos os filtros
         */
        clearFilters() {
            // Se não há filtros ativos, animar shake
            if (!this.hasActiveFilters) {
                this.triggerShakeAnimation();
                return;
            }
            
            this.filter = "";
            this.filterType = [];
            this.filterHP = { min: null, max: null };
            this.filterWeight = { min: null, max: null };
            this.filterHeight = { min: null, max: null };
            this.sortBy = 'id';
            this.sortAscending = true;
            this.groupByType = false;
            
            // Resetar visibilidade de tipos para quantidade inicial
            this.resetTypesVisibility();
            
            // Não reiniciar pré-carregamento automaticamente
            // Deixar scroll infinito funcionar normalmente
        },
        
        /**
         * Dispara animação de shake no botão limpar tudo
         */
        triggerShakeAnimation() {
            const btn = document.querySelector('.clear-all-btn');
            if (btn) {
                btn.classList.add('shake');
                setTimeout(() => {
                    btn.classList.remove('shake');
                }, 500);
            }
        },
        
        /**
         * Remove filtro de nome
         */
        removeNameFilter() {
            this.filter = "";
        },
        
        /**
         * Remove filtro de tipo (todos ou um específico)
         */
        removeTypeFilter(typeValue = null) {
            // Garantir que filterType é um array
            if (!Array.isArray(this.filterType)) {
                this.filterType = this.filterType ? [this.filterType] : [];
            }
            
            if (typeValue) {
                // Remover tipo específico
                this.filterType = this.filterType.filter(t => t !== typeValue);
            } else {
                // Remover todos os tipos
                this.filterType = [];
            }
            
            // Criar novo array para garantir reatividade do Vue
            this.filterType = [...this.filterType];
        },
        
        /**
         * Reseta ordenação para padrão
         */
        resetSorting() {
            this.sortBy = 'id';
            this.sortAscending = true;
        },
        
        /**
         * Remove um filtro específico pelo tipo
         */
        removeFilter(filterType, filterValue = null) {
            switch(filterType) {
                case 'name':
                    this.removeNameFilter();
                    break;
                case 'type':
                    this.removeTypeFilter(filterValue);
                    break;
                case 'hp':
                    this.filterHP = { min: null, max: null };
                    break;
                case 'weight':
                    this.filterWeight = { min: null, max: null };
                    break;
                case 'height':
                    this.filterHeight = { min: null, max: null };
                    break;
                case 'sort':
                    this.resetSorting();
                    break;
                case 'group':
                    this.groupByType = false;
                    break;
            }
        },
        
        /**
         * Seleciona um tipo para filtrar (usado pelos badges de tipo)
         * Garante que tipos selecionados sempre apareçam (mesmo se fora do batch visível)
         * Permite selecionar qualquer tipo, mesmo com count 0, para acionar pré-carregamento
         */
        selectType(typeValue) {
            const type = this.availableTypes.find(t => t.value === typeValue);
            if (!type) return;
            
            // Garantir que filterType é um array
            if (!Array.isArray(this.filterType)) {
                this.filterType = this.filterType ? [this.filterType] : [];
            }
            
            // Se o tipo já está selecionado, remover do array
            const index = this.filterType.indexOf(typeValue);
            if (index > -1) {
                // Remover tipo do array
                this.filterType = this.filterType.filter(t => t !== typeValue);
            } else {
                // Adicionar tipo ao array
                this.filterType = [...this.filterType, typeValue];
                
                // Se o tipo tem count 0, pode ser que ainda não foram carregados Pokémon daquele tipo
                // Acionar pré-carregamento para garantir que todos os Pokémon sejam carregados
                if (type.count === 0 && !this.isPreloading) {
                    // Acelerar pré-carregamento quando um tipo sem Pokémon é selecionado
                    this.searchAccelerated = true;
                    this.startPreloading();
                }
                
                // Garantir que o tipo selecionado esteja visível
                // Se o tipo não está no batch visível, expandir até ele
                const typeIndex = this.availableTypes.findIndex(t => t.value === typeValue);
                if (typeIndex >= 0 && typeIndex >= this.typesVisibleCount) {
                    // Expandir até incluir este tipo (com um pouco mais de espaço)
                    this.typesVisibleCount = Math.min(
                        typeIndex + this.typesBatchSize,
                        this.availableTypes.length
                    );
                }
            }
            
            // Salvar preferência
            this.saveFilterTypeToStorage(this.filterType);
            
            // Remover foco do botão após clique para evitar estado visual persistente
            this.$nextTick(() => {
                const button = document.querySelector(`.pokemon-type-badge[data-type="${typeValue}"]`);
                if (button && document.activeElement === button) {
                    button.blur();
                }
            });
        },
        
        /**
         * Carrega mais tipos em batches progressivos
         * Incrementa typesVisibleCount em batches de typesBatchSize (6)
         * até alcançar o total de tipos disponíveis (18)
         */
        loadMoreTypes() {
            // Não fazer nada se já está carregando ou não há mais tipos
            if (this.isLoadingTypes || !this.hasMoreTypes) {
                return;
            }
            
            // Obter total de tipos disponíveis (sempre 18)
            const totalTypes = this.availableTypes ? this.availableTypes.length : 18;
            
            // Se já mostramos todos os tipos, não há nada para carregar
            if (this.typesVisibleCount >= totalTypes) {
                return;
            }
            
            this.isLoadingTypes = true;
            
            // Simular um pequeno delay para animação suave
            setTimeout(() => {
                // Incrementar tipos visíveis em batches
                // Garantir que não ultrapasse o total de tipos disponíveis
                this.typesVisibleCount = Math.min(
                    this.typesVisibleCount + this.typesBatchSize,
                    totalTypes
                );
                
                this.isLoadingTypes = false;
            }, 150);
        },
        
        /**
         * Reseta visibilidade de tipos para quantidade inicial
         */
        resetTypesVisibility() {
            this.typesVisibleCount = 9;
            this.isLoadingTypes = false;
        },
        
        /**
         * Colapsa tipos para quantidade inicial (usado pelo botão "Mostrar Menos")
         */
        collapseTypes() {
            // Resetar para quantidade inicial, mas manter tipos selecionados visíveis
            const selectedTypes = Array.isArray(this.filterType) ? this.filterType : [];
            const selectedCount = selectedTypes.length;
            
            // Garantir que pelo menos os tipos selecionados estejam visíveis
            // Mas se houver muitos tipos selecionados, mostrar pelo menos 9
            const minVisible = Math.max(9, selectedCount);
            this.typesVisibleCount = minVisible;
            this.isLoadingTypes = false;
        },
        
        /**
         * Alterna modo de visualização
         */
        toggleViewMode() {
            this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
            this.saveViewModeToStorage();
            if (this.viewMode !== 'grid') {
                this.isGridDensityTransitioning = false;
                if (this.gridDensityTransitionTimeout) {
                    clearTimeout(this.gridDensityTransitionTimeout);
                    this.gridDensityTransitionTimeout = null;
                }
            }
        },
        
        /**
         * Define a densidade do grid (um ou dois cards por linha)
         * @param {'single'|'double'} density
         */
        setGridDensity(density) {
            if (!['single', 'double'].includes(density)) {
                return;
            }
            
            if (this.viewMode !== 'grid') {
                this.viewMode = 'grid';
                this.saveViewModeToStorage();
            }
            
            if (this.gridDensity === density) {
                return;
            }
            
            this.gridDensity = density;
            this.saveGridDensityToStorage();
            
            if (this.gridDensityTransitionTimeout) {
                clearTimeout(this.gridDensityTransitionTimeout);
                this.gridDensityTransitionTimeout = null;
            }
            
            this.isGridDensityTransitioning = true;
            this.$nextTick(() => {
                this.gridDensityTransitionTimeout = setTimeout(() => {
                    this.isGridDensityTransitioning = false;
                    this.gridDensityTransitionTimeout = null;
                }, 360);
            });
        },
        
        /**
         * Carrega modo de visualização do localStorage
         */
        loadViewModeFromStorage() {
            const savedViewMode = localStorage.getItem('viewMode');
            if (savedViewMode === 'grid' || savedViewMode === 'list') {
                this.viewMode = savedViewMode;
            }
        },
        
        /**
         * Carrega densidade do grid a partir do localStorage
         */
        loadGridDensityFromStorage() {
            const savedDensity = localStorage.getItem('gridDensity');
            if (savedDensity === 'single' || savedDensity === 'double') {
                this.gridDensity = savedDensity;
            }
        },
        
        /**
         * Salva modo de visualização no localStorage
         */
        saveViewModeToStorage() {
            localStorage.setItem('viewMode', this.viewMode);
        },
        
        /**
         * Salva densidade de grid no localStorage
         */
        saveGridDensityToStorage() {
            localStorage.setItem('gridDensity', this.gridDensity);
        },
        
        /**
         * Traduz tipo de Pokémon (wrapper para usar no template)
         */
        translateType(type) {
            if (!window.translateTypeUtil) {
                return type || '';
            }
            return window.translateTypeUtil(type);
        },
        
        /**
         * Navega para próximo Pokémon na lista filtrada
         */
        nextPokemon() {
            if (!this.selectedPokemon || !this.selectedPokemon.id) return;
            const currentIndex = this.filteredList.findIndex(p => p.id === this.selectedPokemon.id);
            if (currentIndex >= 0 && currentIndex < this.filteredList.length - 1) {
                const nextPokemon = this.filteredList[currentIndex + 1];
                // Manter o elemento anterior ativo para não perder o foco trap
                const previousElement = this._previousActiveElement;
                this.openPokedex(nextPokemon);
                // Restaurar elemento anterior para manter foco trap
                this._previousActiveElement = previousElement;
            }
        },
        
        /**
         * Navega para Pokémon anterior na lista filtrada
         */
        previousPokemon() {
            if (!this.selectedPokemon || !this.selectedPokemon.id) return;
            const currentIndex = this.filteredList.findIndex(p => p.id === this.selectedPokemon.id);
            if (currentIndex > 0) {
                const prevPokemon = this.filteredList[currentIndex - 1];
                // Manter o elemento anterior ativo para não perder o foco trap
                const previousElement = this._previousActiveElement;
                this.openPokedex(prevPokemon);
                // Restaurar elemento anterior para manter foco trap
                this._previousActiveElement = previousElement;
            }
        },
        
        /**
         * Abre o modal da Pokedex com detalhes do Pokémon
         * @param {Object} pokemon - Pokémon selecionado
         */
        openPokedex(pokemon) {
            try {
                console.group('[Pokedex][Modal] Abrindo detalhes');
                console.info('Pokémon selecionado:', {
                    id: pokemon?.id ?? '(sem id)',
                    nome: pokemon?.name ?? '(desconhecido)',
                    possuiMoves: Array.isArray(pokemon?.moves) ? pokemon.moves.length : 0,
                    possuiAbilities: Array.isArray(pokemon?.abilities) ? pokemon.abilities.length : 0
                });
                // Salvar elemento que tinha foco antes de abrir o modal
                this._previousActiveElement = document.activeElement;
                
                // Resetar dados adicionais e aba
                this.activeTab = 'info';
                console.info('Aba ativa definida para info (reset ao abrir modal).');
                this.pokemonSpecies = null;
                this.pokemonAbilitiesDetails = [];
                this.evolutionChain = null;
                this.pokemonMoves = [];
                this.activeMoveGeneration = 'all';
                this.resetMovesVisibility();
                
                // Definir Pokémon selecionado primeiro
                this.selectedPokemon = pokemon;
                this.pokedexOpen = true;
                
                // Sempre recarregar dados completos do Pokémon ao abrir o modal
                // para garantir que temos todos os dados atualizados (especialmente movimentos)
                // Primeiro, tentar usar movimentos do objeto pokemon se disponíveis
                if (pokemon.moves && Array.isArray(pokemon.moves) && pokemon.moves.length > 0) {
                    this.pokemonMoves = pokemon.moves;
                    console.info('Movimentos iniciais carregados do objeto Pokémon:', this.pokemonMoves.length);
                } else {
                    this.pokemonMoves = [];
                    console.info('Pokémon não possui movimentos pré-carregados, a lista será buscada posteriormente.');
                }
                
                // Sempre recarregar dados completos em background para garantir dados atualizados
                this.reloadPokemonFullData(pokemon.id);
                console.info('Solicitada recarga de dados completos (reloadPokemonFullData).');
                this.loadAdditionalPokemonData();
                console.info('Solicitado carregamento de dados adicionais (loadAdditionalPokemonData).');
                
                // Resetar para arte oficial quando abrir um novo Pokémon
                // Usar $nextTick para garantir que availableImages seja recalculado
                this.$nextTick(() => {
                    try {
                        if (this.availableImages && this.availableImages.length > 0) {
                            const preferredOrder = ['sprite', 'sprite-shiny', 'official', 'official-shiny', 'back', 'back-shiny'];
                            const availableModes = this.availableImages.map(image => image.mode);
                            const preferredMode = preferredOrder.find(mode => availableModes.includes(mode));
                            
                            this.imageViewMode = preferredMode || this.availableImages[0].mode;
                        }
                        
                        // Configurar foco trap após o modal ser renderizado
                        // Usar setTimeout para garantir que o DOM foi completamente renderizado
                        setTimeout(() => {
                            try {
                                this.setupModalFocusTrap();
                                this.setupModalKeyboardNavigation();
                                this.setupTouchGestures();
                                
                                // Focar no botão de fechar (primeiro elemento focável)
                                const closeButton = this.$refs.closeButton || document.querySelector('.pokedex-close-btn');
                                if (closeButton) {
                                    closeButton.focus();
                                }
                            } catch (error) {
                                console.warn('Erro ao configurar foco trap do modal:', error);
                            }
                        }, 50);
                    } catch (error) {
                        console.error('Erro ao abrir modal:', error);
                    }
                });
                console.groupEnd();
            } catch (error) {
                console.error('Erro crítico ao abrir modal:', error);
                // Garantir que o modal seja aberto mesmo se houver erro
                this.pokedexOpen = true;
                this.selectedPokemon = pokemon;
            }
        },

        /**
         * Abre um Pokémon selecionado a partir da cadeia evolutiva
         * @param {number} evolutionId - ID do Pokémon na cadeia
         */
        async openEvolutionPokemon(evolutionId) {
            if (!evolutionId) {
                return;
            }

            if (this.selectedPokemon && evolutionId === this.selectedPokemon.id) {
                console.info('[Pokedex][Evolução] Pokémon já está selecionado, nenhuma ação necessária.');
                return;
            }

            console.group('[Pokedex][Evolução] Abrindo Pokémon da cadeia');
            console.info('Evolução alvo:', evolutionId);

            let targetPokemon = this.filteredList.find(pokemon => pokemon.id === evolutionId);

            if (!targetPokemon) {
                targetPokemon = this.pokemonList.find(pokemon => pokemon.id === evolutionId);
                if (targetPokemon) {
                    console.info('Pokémon encontrado na lista completa carregada.');
                }
            } else {
                console.info('Pokémon encontrado na lista filtrada.');
            }

            if (!targetPokemon && window.PokemonApiService) {
                try {
                    console.info('Pokémon não encontrado nas listas locais. Buscando na API.');
                    const apiService = new window.PokemonApiService();
                    targetPokemon = await apiService.fetchPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${evolutionId}/`);
                } catch (error) {
                    console.error('Erro ao carregar Pokémon da evolução:', error);
                    if (window.errorHandler) {
                        window.errorHandler.handleApiError(error, 'carregar Pokémon da evolução');
                    }
                }
            }

            if (targetPokemon) {
                console.info('Abrindo Pokémon da evolução no modal.');
                this.openPokedex(targetPokemon);
            } else {
                console.warn('Não foi possível localizar o Pokémon da evolução para exibição.');
            }
            console.groupEnd();
        },
        
        /**
         * Alterna modo de visualização de imagem
         */
        setImageViewMode(mode) {
            this.imageViewMode = mode;
        },
        
        /**
         * Fecha o modal da Pokedex
         */
        closePokedex() {
            this.pokedexOpen = false;
            
            // Limpar gestos touch
            const modal = this.$refs.modalContent || document.querySelector('.pokedex-modal');
            if (modal) {
                if (this._touchStartHandler) {
                    modal.removeEventListener('touchstart', this._touchStartHandler);
                }
                if (this._touchMoveHandler) {
                    modal.removeEventListener('touchmove', this._touchMoveHandler);
                }
                if (this._touchEndHandler) {
                    modal.removeEventListener('touchend', this._touchEndHandler);
                }
            }
            
            // Limpar dados adicionais
            this.pokemonSpecies = null;
            this.pokemonAbilitiesDetails = [];
            this.evolutionChain = null;
            this.pokemonMoves = [];
            this.activeTab = 'info';
            this.activeMoveGeneration = 'all';
            
            // Restaurar foco para o elemento que tinha foco antes do modal abrir
            this.$nextTick(() => {
                if (this._previousActiveElement && typeof this._previousActiveElement.focus === 'function') {
                    try {
                        this._previousActiveElement.focus();
                    } catch (e) {
                        // Se o elemento não existir mais, focar no primeiro card ou input de busca
                        const searchInput = document.querySelector('.search-input');
                        if (searchInput) {
                            searchInput.focus();
                        }
                    }
                }
                this._previousActiveElement = null;
                this._modalFocusableElements = null;
            });
        },
        
        /**
         * Configura foco trap no modal (mantém foco dentro do modal)
         */
        setupModalFocusTrap() {
            if (!this.pokedexOpen) return;
            
            // Obter todos os elementos focáveis dentro do modal
            // Usar querySelector como fallback se ref não estiver disponível
            const modal = this.$refs.modalContent || document.querySelector('.pokedex-modal');
            if (!modal) return;
            
            const focusableSelectors = [
                'button:not([disabled])',
                '[href]',
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                '[tabindex]:not([tabindex="-1"])'
            ].join(', ');
            
            this._modalFocusableElements = Array.from(modal.querySelectorAll(focusableSelectors))
                .filter(el => {
                    // Filtrar elementos invisíveis
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });
        },
        
        /**
         * Carrega dados adicionais do Pokémon (espécie, habilidades, evoluções)
         */
        async loadAdditionalPokemonData() {
            if (!this.selectedPokemon || !this.selectedPokemon.id) {
                return;
            }

            this.isLoadingAdditionalData = true;

            try {
                const apiService = new window.PokemonApiService();
                const pokemonId = this.selectedPokemon.id;

                // Carregar espécie (para evoluções)
                try {
                    const species = await apiService.fetchPokemonSpecies(pokemonId);
                    this.pokemonSpecies = species;

                    // Carregar cadeia evolutiva se disponível
                    if (species && species.evolution_chain && species.evolution_chain.url) {
                        const evolutionChain = await apiService.fetchEvolutionChain(species.evolution_chain.url);
                        if (evolutionChain && window.normalizeEvolutionChain) {
                            this.evolutionChain = window.normalizeEvolutionChain(evolutionChain);
                        }
                    }
                } catch (error) {
                    console.warn('Erro ao carregar espécie/evoluções:', error);
                    this.pokemonSpecies = null;
                    this.evolutionChain = null;
                }

                // Carregar detalhes das habilidades
                if (this.selectedPokemon.abilities && Array.isArray(this.selectedPokemon.abilities)) {
                    try {
                        const abilityPromises = this.selectedPokemon.abilities.map(async (ability) => {
                            if (ability.ability && ability.ability.url) {
                                const details = await apiService.fetchAbilityDetails(ability.ability.url);
                                return {
                                    ...ability,
                                    details: details,
                                    description: window.getFlavorTextByLanguage ? 
                                        window.getFlavorTextByLanguage(details.flavor_text_entries || []) : ''
                                };
                            }
                            return ability;
                        });
                        this.pokemonAbilitiesDetails = await Promise.all(abilityPromises);
                    } catch (error) {
                        console.warn('Erro ao carregar detalhes das habilidades:', error);
                        this.pokemonAbilitiesDetails = this.selectedPokemon.abilities || [];
                    }
                }

                // Extrair movimentos do Pokémon (já vem na API)
                // Movimentos são extraídos quando o modal abre, não aqui
            } catch (error) {
                console.error('Erro ao carregar dados adicionais:', error);
            } finally {
                this.isLoadingAdditionalData = false;
            }
        },

        /**
         * Troca a aba ativa no modal
         * @param {string} tab - Nome da aba ('info', 'moves', 'evolution')
         */
        changeTab(tab) {
            if (['info', 'moves', 'evolution'].includes(tab)) {
                const previousTab = this.activeTab;
                this.activeTab = tab;
                console.group('[Pokedex][Tabs] Alterando aba');
                console.info('Aba anterior:', previousTab);
                console.info('Nova aba:', tab);
                
                // Carregar dados adicionais quando necessário
                if (tab === 'moves') {
                    this.resetMovesVisibility();
                    // Movimentos já devem estar carregados, mas garantir
                    if (!this.pokemonMoves || this.pokemonMoves.length === 0) {
                        if (this.selectedPokemon.moves && Array.isArray(this.selectedPokemon.moves)) {
                            this.pokemonMoves = this.selectedPokemon.moves;
                            console.info('Movimentos preenchidos a partir do Pokémon selecionado:', this.pokemonMoves.length);
                        }
                    }
                    // Carregar detalhes das habilidades se ainda não foram carregadas
                    if (this.pokemonAbilitiesDetails.length === 0 && this.selectedPokemon.abilities && Array.isArray(this.selectedPokemon.abilities)) {
                        console.info('Detalhes de habilidades ainda não carregados. Iniciando loadAdditionalPokemonData().');
                        this.loadAdditionalPokemonData();
                    }
                }
                if (tab === 'evolution') {
                    if (!this.pokemonSpecies || !this.evolutionChain || this.evolutionChain.length === 0) {
                        console.info('Evoluções ainda não carregadas. Iniciando loadAdditionalPokemonData().');
                        this.loadAdditionalPokemonData();
                    }
                }
                console.info('Estado atual:', {
                    possuiSpecies: !!this.pokemonSpecies,
                    cadeiaEvolucao: Array.isArray(this.evolutionChain) ? this.evolutionChain.length : 0,
                    movimentos: Array.isArray(this.pokemonMoves) ? this.pokemonMoves.length : 0,
                    habilidadesDetalhadas: Array.isArray(this.pokemonAbilitiesDetails) ? this.pokemonAbilitiesDetails.length : 0,
                    abaAtiva: this.activeTab
                });
                console.groupEnd();
            }
        },

        /**
         * Reseta a quantidade de movimentos visíveis para o valor inicial
         */
        resetMovesVisibility() {
            this.movesVisibleCount = this.movesVisibleInitial;
        },

        /**
         * Altera a geração ativa de movimentos e reseta a paginação
         * @param {string} generation - 'all' ou gerações específicas (I, II, ...)
         */
        changeMoveGeneration(generation) {
            if (!generation) {
                return;
            }
            const previousGeneration = this.activeMoveGeneration;
            this.activeMoveGeneration = generation;
            this.resetMovesVisibility();
            console.group('[Pokedex][Movimentos] Alterando geração');
            console.info('Geração anterior:', previousGeneration);
            console.info('Nova geração:', generation);
            console.info('Total de movimentos na geração selecionada:', this.totalMovesForActiveGeneration);
            console.groupEnd();
        },

        /**
         * Expande a lista para mostrar mais movimentos
         */
        showMoreMoves() {
            const previousCount = this.movesVisibleCount;
            const totalAvailable = this.totalMovesForActiveGeneration;
            this.movesVisibleCount = Math.min(
                this.movesVisibleCount + this.movesBatchSize,
                totalAvailable
            );
            console.info('[Pokedex][Movimentos] Mostrar mais', {
                anterior: previousCount,
                atual: this.movesVisibleCount,
                totalDisponivel: totalAvailable
            });
        },

        /**
         * Colapsa a lista de movimentos para o tamanho inicial
         */
        showLessMoves() {
            if (this.movesVisibleCount === this.movesVisibleInitial) {
                return;
            }
            console.info('[Pokedex][Movimentos] Mostrar menos', {
                anterior: this.movesVisibleCount,
                novo: this.movesVisibleInitial
            });
            this.resetMovesVisibility();
        },

        /**
         * Filtra movimentos por geração
         * @param {string} generation - Geração ('all', 'I', 'II', etc.)
         * @returns {Array} Movimentos filtrados
         */
        filterMovesByGeneration(generation) {
            if (!Array.isArray(this.pokemonMoves)) {
                return [];
            }

            if (generation === 'all') {
                return this.pokemonMoves;
            }

            return this.pokemonMoves.filter(move => {
                const moveGen = window.getMoveGeneration ? window.getMoveGeneration(move) : 'all';
                return moveGen === generation;
            });
        },

        /**
         * Formata o nome do método de aprendizado para exibição
         * @param {string} method - Nome do método (ex: 'level-up', 'machine', 'egg')
         * @returns {string} Nome formatado
         */
        formatMoveLearnMethod(method) {
            if (!method) return 'N/A';
            
            const methodMap = {
                'level-up': 'Nível',
                'machine': 'Máquina',
                'egg': 'Ovo',
                'tutor': 'Tutor',
                'form-change': 'Mudança de Forma',
                'stadium-surfing-pikachu': 'Stadium',
                'light-ball-egg': 'Ovo Light Ball',
                'colosseum-purification': 'Colosseum',
                'xd-shadow': 'XD Shadow',
                'xd-purification': 'XD Purification',
                'dream-world': 'Dream World',
                'event': 'Evento',
                'stadium-surfing-pikachu': 'Stadium'
            };
            
            return methodMap[method.toLowerCase()] || method.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        },

        /**
         * Obtém a geração do movimento de forma simplificada
         * @param {Object} move - Movimento
         * @returns {string} Geração ('I', 'II', etc.) ou 'all'
         */
        getMoveGenerationSimple(move) {
            if (!move) return 'all';
            return window.getMoveGeneration ? window.getMoveGeneration(move) : 'all';
        },

        /**
         * Obtém o tipo do movimento (simplificado - precisa buscar da API ou usar cache)
         * Por enquanto retorna null, pois tipo não vem nos dados básicos
         * @param {Object} move - Movimento
         * @returns {string|null} Tipo do movimento ou null
         */
        getMoveTypeSimple(move) {
            // Os movimentos na lista do Pokémon não trazem o tipo diretamente
            // Seria necessário buscar da API ou ter um cache
            // Por enquanto, retornamos null para não quebrar
            return null;
        },

        /**
         * Obtém o nível mínimo para aprender o movimento
         * @param {Object} move - Movimento
         * @returns {number|null} Nível mínimo ou null
         */
        getMinLevelSimple(move) {
            if (!move || !Array.isArray(move.version_group_details) || move.version_group_details.length === 0) {
                return null;
            }

            // Buscar o menor nível entre os métodos level-up
            let minLevel = null;
            move.version_group_details.forEach(detail => {
                if (detail.move_learn_method && detail.move_learn_method.name === 'level-up' && detail.level_learned_at) {
                    const level = detail.level_learned_at;
                    if (minLevel === null || level < minLevel) {
                        minLevel = level;
                    }
                }
            });

            return minLevel;
        },

        /**
         * Obtém a URL da imagem de um Pokémon da cadeia evolutiva
         * @param {number} pokemonId - ID do Pokémon
         * @returns {string} URL da imagem ou string vazia
         */
        getEvolutionPokemonImage(pokemonId) {
            if (!pokemonId) return '';

            // Primeiro, tentar buscar do pokemonList já carregado
            const pokemonInList = this.pokemonList.find(p => p.id === pokemonId);
            if (pokemonInList && pokemonInList.sprites) {
                // Priorizar sprite frontal padrão para manter consistência com a listagem
                if (pokemonInList.sprites.front_default) {
                    return pokemonInList.sprites.front_default;
                }
                if (pokemonInList.sprites.front_shiny) {
                    return pokemonInList.sprites.front_shiny;
                }
                if (pokemonInList.sprites.other && pokemonInList.sprites.other['official-artwork'] && pokemonInList.sprites.other['official-artwork'].front_default) {
                    return pokemonInList.sprites.other['official-artwork'].front_default;
                }
            }

            // Se não encontrado na lista, usar sprite padrão pela URL oficial da PokeAPI
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
        },

        /**
         * Trata erro ao carregar imagem de evolução
         * @param {Event} event - Evento de erro
         */
        handleEvolutionImageError(event) {
            if (event.target) {
                event.target.style.display = 'none';
                const placeholder = event.target.nextElementSibling;
                if (placeholder && placeholder.classList) {
                    placeholder.classList.remove('evolution-image-placeholder--hidden');
                }
            }
        },

        /**
         * Formata o nome da versão para exibição
         * @param {string} version - Nome da versão (ex: 'red-blue', 'sword-shield')
         * @returns {string} Nome formatado
         */
        formatVersionName(version) {
            if (!version) return 'N/A';
            
            const versionMap = {
                'red-blue': 'Red/Blue',
                'yellow': 'Yellow',
                'gold-silver': 'Gold/Silver',
                'crystal': 'Crystal',
                'ruby-sapphire': 'Ruby/Sapphire',
                'emerald': 'Emerald',
                'firered-leafgreen': 'FireRed/LeafGreen',
                'diamond-pearl': 'Diamond/Pearl',
                'platinum': 'Platinum',
                'heartgold-soulsilver': 'HeartGold/SoulSilver',
                'black-white': 'Black/White',
                'colosseum': 'Colosseum',
                'xd': 'XD',
                'black-2-white-2': 'Black 2/White 2',
                'x-y': 'X/Y',
                'omega-ruby-alpha-sapphire': 'Omega Ruby/Alpha Sapphire',
                'sun-moon': 'Sun/Moon',
                'ultra-sun-ultra-moon': 'Ultra Sun/Ultra Moon',
                'lets-go-pikachu-lets-go-eevee': 'Let\'s Go Pikachu/Eevee',
                'sword-shield': 'Sword/Shield',
                'brilliant-diamond-and-shining-pearl': 'Brilliant Diamond/Shining Pearl',
                'legends-arceus': 'Legends: Arceus',
                'scarlet-violet': 'Scarlet/Violet'
            };
            
            return versionMap[version.toLowerCase()] || version.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        },

        /**
         * Recarrega dados completos do Pokémon da API (incluindo movimentos)
         * @param {number} pokemonId - ID do Pokémon
         */
        async reloadPokemonFullData(pokemonId) {
            // Prevenir múltiplas chamadas simultâneas
            if (this._reloadingPokemonData === pokemonId) {
                return;
            }
            
            try {
                this._reloadingPokemonData = pokemonId;
                const apiService = new window.PokemonApiService();
                const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
                
                // Buscar dados diretamente da API sem normalização para garantir que temos tudo
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar dados: ${response.status}`);
                }
                const fullData = await response.json();
                
                // Atualizar movimentos se disponíveis
                if (fullData && fullData.moves && Array.isArray(fullData.moves) && fullData.moves.length > 0) {
                    this.pokemonMoves = fullData.moves;
                    // Atualizar selectedPokemon também para manter consistência
                    if (this.selectedPokemon && this.selectedPokemon.id === pokemonId) {
                        this.selectedPokemon.moves = fullData.moves;
                    }
                } else {
                    // Se ainda não há movimentos, tentar usar dados normalizados do cache
                    const normalizedData = await apiService.fetchPokemonDetails(url, true);
                    if (normalizedData && normalizedData.moves && Array.isArray(normalizedData.moves) && normalizedData.moves.length > 0) {
                        this.pokemonMoves = normalizedData.moves;
                        if (this.selectedPokemon && this.selectedPokemon.id === pokemonId) {
                            this.selectedPokemon.moves = normalizedData.moves;
                        }
                    }
                }
            } catch (error) {
                // Em caso de erro, tentar usar dados do selectedPokemon se disponíveis
                if (this.selectedPokemon && this.selectedPokemon.moves && Array.isArray(this.selectedPokemon.moves)) {
                    this.pokemonMoves = this.selectedPokemon.moves;
                }
            } finally {
                this._reloadingPokemonData = null;
            }
        },

        /**
         * Configura gestos touch para navegação no modal
         */
        setupTouchGestures() {
            if (!this.pokedexOpen) return;

            const modal = this.$refs.modalContent || document.querySelector('.pokedex-modal');
            if (!modal) return;

            // Remover listeners anteriores se existirem
            if (this._touchStartHandler) {
                modal.removeEventListener('touchstart', this._touchStartHandler);
            }
            if (this._touchMoveHandler) {
                modal.removeEventListener('touchmove', this._touchMoveHandler);
            }
            if (this._touchEndHandler) {
                modal.removeEventListener('touchend', this._touchEndHandler);
            }

            // Criar handlers
            this._touchStartHandler = (e) => this.handleTouchStart(e);
            this._touchMoveHandler = (e) => this.handleTouchMove(e);
            this._touchEndHandler = (e) => this.handleTouchEnd(e);

            // Adicionar listeners
            modal.addEventListener('touchstart', this._touchStartHandler, { passive: true });
            modal.addEventListener('touchmove', this._touchMoveHandler, { passive: true });
            modal.addEventListener('touchend', this._touchEndHandler, { passive: true });
        },

        /**
         * Captura início do toque
         */
        handleTouchStart(event) {
            if (!event.touches || event.touches.length === 0) return;
            
            const touch = event.touches[0];
            this._touchStartX = touch.clientX;
            this._touchStartY = touch.clientY;
        },

        /**
         * Rastreia movimento do toque
         */
        handleTouchMove(event) {
            // Permitir scroll vertical, apenas prevenir scroll horizontal se for swipe
            if (!this._touchStartX || !this._touchStartY) return;
            
            const touch = event.touches[0];
            const deltaX = Math.abs(touch.clientX - this._touchStartX);
            const deltaY = Math.abs(touch.clientY - this._touchStartY);
            
            // Se movimento horizontal for maior que vertical, prevenir scroll padrão
            if (deltaX > deltaY && deltaX > 10) {
                event.preventDefault();
            }
        },

        /**
         * Processa fim do toque e detecta swipe
         */
        handleTouchEnd(event) {
            if (!this._touchStartX || !this._touchStartY) return;
            
            if (!event.changedTouches || event.changedTouches.length === 0) {
                this._touchStartX = null;
                this._touchStartY = null;
                return;
            }

            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - this._touchStartX;
            const deltaY = touch.clientY - this._touchStartY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);

            // Verificar se é um swipe horizontal válido
            if (absDeltaX > this._touchThreshold && absDeltaX > absDeltaY) {
                // Swipe para esquerda = próximo Pokémon
                if (deltaX < 0) {
                    this.nextPokemon();
                }
                // Swipe para direita = Pokémon anterior
                else if (deltaX > 0) {
                    this.previousPokemon();
                }
            }

            // Resetar valores
            this._touchStartX = null;
            this._touchStartY = null;
        },

        /**
         * Configura navegação por teclado no modal
         */
        setupModalKeyboardNavigation() {
            if (!this.pokedexOpen) return;
            
            // Remover listener anterior se existir
            if (this._modalKeydownHandler) {
                document.removeEventListener('keydown', this._modalKeydownHandler);
            }
            
            // Criar novo handler
            this._modalKeydownHandler = (e) => {
                if (!this.pokedexOpen) {
                    document.removeEventListener('keydown', this._modalKeydownHandler);
                    return;
                }
                
                // Escape fecha o modal
                if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closePokedex();
                    return;
                }
                
                // Setas esquerda/direita navegam entre Pokémon
                if (e.key === 'ArrowLeft' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.previousPokemon();
                    return;
                }
                
                if (e.key === 'ArrowRight' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.nextPokemon();
                    return;
                }
                
                // Tab e Shift+Tab para navegação com foco trap
                if (e.key === 'Tab') {
                    this.setupModalFocusTrap();
                    
                    if (!this._modalFocusableElements || this._modalFocusableElements.length === 0) {
                        return;
                    }
                    
                    const firstElement = this._modalFocusableElements[0];
                    const lastElement = this._modalFocusableElements[this._modalFocusableElements.length - 1];
                    const currentElement = document.activeElement;
                    
                    // Se Shift+Tab e está no primeiro elemento, focar no último
                    if (e.shiftKey) {
                        if (currentElement === firstElement || !this._modalFocusableElements.includes(currentElement)) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        // Se Tab e está no último elemento, focar no primeiro
                        if (currentElement === lastElement || !this._modalFocusableElements.includes(currentElement)) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };
            
            // Adicionar listener
            document.addEventListener('keydown', this._modalKeydownHandler);
        },
        
        /**
         * Método legado para compatibilidade (mantido para referência)
         * @deprecated Use openPokedex() em vez disso
         */
        pokedex(item) {
            this.openPokedex(item);
        },
        
        /**
         * Inicializa tooltips nos cards de Pokémon
         */
        initializeTooltips() {
            if (typeof window.TooltipManager === 'undefined') {
                return;
            }
            
            this.$nextTick(() => {
                const cards = document.querySelectorAll('.pokemon-card');
                cards.forEach(card => {
                    const link = card.querySelector('.pokemon-card-link');
                    if (link) {
                        const pokemonName = link.querySelector('.pokemon-name')?.textContent || '';
                        const pokemonHp = link.querySelector('.pokemon-hp-value')?.textContent || '';
                        const pokemonTypes = Array.from(link.querySelectorAll('.pokemon-type-label'))
                            .map(type => type.textContent.trim())
                            .join(', ');
                        
                        const tooltipText = `${pokemonName}${pokemonHp ? ` - HP: ${pokemonHp}` : ''}${pokemonTypes ? ` - Tipo: ${pokemonTypes}` : ''}`;
                        window.TooltipManager.createTooltip(link, tooltipText, 'top', true);
                    }
                });
            });
        },
        
        /**
         * Carrega filtro de tipo do localStorage
         */
        loadFilterTypeFromStorage() {
            const savedFilterType = localStorage.getItem('filterType');
            if (savedFilterType) {
                try {
                    // Tentar parsear como JSON (array)
                    const parsed = JSON.parse(savedFilterType);
                    this._pendingFilterType = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    // Se não for JSON, tratar como string (compatibilidade)
                    this._pendingFilterType = savedFilterType ? [savedFilterType] : null;
                }
            }
        },
        
        /**
         * Valida e aplica filtro de tipo após dados serem carregados
         */
        validateAndApplyFilterType() {
            if (!this._pendingFilterType) {
                return;
            }
            
            // Aguardar um pouco para garantir que availableTypes está atualizado
            // Usar setTimeout para garantir que os dados foram processados
            setTimeout(() => {
                this.$nextTick(() => {
                    this.validateFilterTypeIfNeeded();
                });
            }, 100);
        },
        
        /**
         * Valida filtro de tipo se necessário (usado tanto para filtros pendentes quanto ativos)
         */
        validateFilterTypeIfNeeded() {
            const filterToValidate = this._pendingFilterType || this.filterType;
            
            // Converter para array se necessário
            let typesToValidate = [];
            if (Array.isArray(filterToValidate)) {
                typesToValidate = filterToValidate;
            } else if (filterToValidate && filterToValidate !== '') {
                typesToValidate = [filterToValidate];
            }
            
            if (typesToValidate.length === 0) {
                if (this._pendingFilterType) {
                    this._pendingFilterType = null;
                }
                return;
            }
            
            // Verificar quais tipos existem na lista de tipos disponíveis
            const validTypes = [];
            if (this.availableTypes && this.availableTypes.length > 0) {
                const availableTypeValues = this.availableTypes.map(t => t.value);
                typesToValidate.forEach(type => {
                    if (availableTypeValues.includes(type)) {
                        validTypes.push(type);
                    }
                });
            }
            
            if (validTypes.length > 0) {
                // Se é um filtro pendente, aplicar agora
                if (this._pendingFilterType) {
                    this.filterType = validTypes;
                    this._pendingFilterType = null;
                }
                // Se já está aplicado, manter apenas os válidos
                if (!this._pendingFilterType && Array.isArray(this.filterType)) {
                    this.filterType = this.filterType.filter(t => validTypes.includes(t));
                }
            } else {
                // Se nenhum tipo existe, limpar o filtro
                this.filterType = [];
                this._pendingFilterType = null;
                localStorage.removeItem('filterType');
            }
        },
        
        /**
         * Salva filtro de tipo no localStorage
         */
        saveFilterTypeToStorage(newFilterType) {
            if (Array.isArray(newFilterType) && newFilterType.length > 0) {
                localStorage.setItem('filterType', JSON.stringify(newFilterType));
            } else if (newFilterType && newFilterType !== "" && !Array.isArray(newFilterType)) {
                // Compatibilidade: salvar como string se não for array
                localStorage.setItem('filterType', newFilterType);
            } else {
                localStorage.removeItem('filterType');
            }
        },
        
        /**
         * Alterna a visibilidade da sidebar de filtros
         */
        toggleSidebar() {
            this.sidebarAberta = !this.sidebarAberta;
        },
        
        /**
         * Fecha a sidebar (usado pelo overlay e controles internos)
         */
        closeSidebar() {
            this.sidebarAberta = false;
        },
        
        /**
         * Atualiza dimensões monitoradas e restabelece estado adequado para o layout
         */
        handleResize() {
            if (typeof window === 'undefined') {
                return;
            }
            this.viewportLargura = window.innerWidth;
            this.viewportAltura = window.innerHeight;
            if (this.viewportLargura >= 1024) {
                this.sidebarAberta = true;
            }
        },
        
        /**
         * Alterna entre modo claro e escuro
         */
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            this.applyTheme();
            this.saveThemeToStorage();
            this.updateThemeIcon();
        },
        
        /**
         * Atualiza o ícone do toggle de tema
         */
        updateThemeIcon() {
            // O ícone é atualizado automaticamente pelo Vue binding
            // Este método pode ser usado para outras atualizações se necessário
        },
        
        /**
         * Aplica o tema atual ao documento
         */
        applyTheme() {
            const html = document.documentElement;
            if (this.isDarkMode) {
                html.setAttribute('data-theme', 'dark');
            } else {
                html.removeAttribute('data-theme');
            }
        },
        
        /**
         * Carrega tema salvo do localStorage
         */
        loadThemeFromStorage() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                this.isDarkMode = true;
            } else if (savedTheme === 'light') {
                this.isDarkMode = false;
            } else {
                // Verificar preferência do sistema ou se já foi aplicado
                const html = document.documentElement;
                const hasDarkTheme = html.hasAttribute('data-theme') && html.getAttribute('data-theme') === 'dark';
                if (hasDarkTheme) {
                    this.isDarkMode = true;
                } else {
                    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    this.isDarkMode = prefersDark;
                }
            }
            // Aplicar tema para garantir sincronização
            this.applyTheme();
            this.updateThemeIcon();
        },
        
        /**
         * Salva tema no localStorage
         */
        saveThemeToStorage() {
            localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        },
        
        /**
         * Alterna agrupamento por tipo
         */
        toggleGroupByType() {
            this.groupByType = !this.groupByType;
            this.saveGroupByTypeToStorage();
        },
        
        /**
         * Alterna colapso da seção de filtros avançados (estatísticas + tipos)
         */
        toggleAdvancedFilters() {
            this.advancedFiltersCollapsed = !this.advancedFiltersCollapsed;

            if (!this.advancedFiltersCollapsed) {
                this.$nextTick(() => {
                    const sidebar = document.querySelector('.layout-sidebar');
                    const advancedSection = sidebar ? sidebar.querySelector('.advanced-filters-section') : null;

                    if (sidebar && advancedSection) {
                        requestAnimationFrame(() => {
                            const sectionBottom = advancedSection.offsetTop + advancedSection.scrollHeight;
                            const targetScroll = Math.max(0, sectionBottom - sidebar.clientHeight + 24);

                            if (targetScroll > sidebar.scrollTop) {
                                sidebar.scrollTo({ top: targetScroll, behavior: 'smooth' });
                            }
                        });
                    }
                });
            }
        },
        
        /**
         * Carrega preferência de agrupamento do localStorage
         */
        loadGroupByTypeFromStorage() {
            const saved = localStorage.getItem('groupByType');
            if (saved === 'true') {
                this.groupByType = true;
            } else if (saved === 'false') {
                this.groupByType = false;
            }
        },
        
        /**
         * Salva preferência de agrupamento no localStorage
         */
        saveGroupByTypeToStorage() {
            localStorage.setItem('groupByType', this.groupByType.toString());
        },
        
        /**
         * Alterna ordem de ordenação
         */
        toggleSortOrder() {
            this.sortAscending = !this.sortAscending;
            this.saveSortPreferences();
        },
        
        /**
         * Salva preferências de ordenação
         */
        saveSortPreferences() {
            localStorage.setItem('sortBy', this.sortBy);
            localStorage.setItem('sortAscending', this.sortAscending.toString());
        },
        
        /**
         * Carrega preferências de ordenação
         */
        loadSortPreferences() {
            const savedSortBy = localStorage.getItem('sortBy');
            if (savedSortBy && ['id', 'name', 'type', 'weight', 'height', 'hp'].includes(savedSortBy)) {
                this.sortBy = savedSortBy;
            }
            
            const savedSortAscending = localStorage.getItem('sortAscending');
            if (savedSortAscending === 'true' || savedSortAscending === 'false') {
                this.sortAscending = savedSortAscending === 'true';
            }
        },
        
        /**
         * Salva preferências de visualização
         */
        saveViewPreferences() {
            // Apenas salva viewMode agora
        },
        
        /**
         * Carrega preferências de visualização
         */
        loadViewPreferences() {
            // Apenas carrega viewMode agora
        },
        
        /**
         * Configura Intersection Observer para scroll infinito
         */
        setupInfiniteScroll() {
            // Verificar se Intersection Observer está disponível
            if (typeof IntersectionObserver === 'undefined') {
                console.warn('Intersection Observer não suportado. Usando fallback.');
                return;
            }
            
            // Se já existe um observer, desconectar antes de criar um novo
            if (this.scrollObserver) {
                this.scrollObserver.disconnect();
            }
            
            // Criar observer com opções
            const options = {
                root: null, // viewport
                rootMargin: '200px', // Carregar quando estiver a 200px do final
                threshold: 0.1 // Disparar quando 10% do elemento estiver visível
            };
            
            this.scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // Se o sentinel estiver visível e não estiver carregando
                    // Removido !this.isFiltering para permitir scroll mesmo com filtros
                    // O pré-carregamento já cuida de carregar tudo em background
                    if (entry.isIntersecting && 
                        !this.isLoadingMore && 
                        this.hasMore && 
                        !this.isLoading) {
                        this.loadMorePokemon();
                    }
                });
            }, options);
            
            // Observar o sentinel quando ele for criado
            // Usar setTimeout para garantir que o DOM foi atualizado
            setTimeout(() => {
                this.$nextTick(() => {
                    if (this.$refs.scrollSentinel) {
                        this.scrollObserver.observe(this.$refs.scrollSentinel);
                    } else {
                        // Se o sentinel não existe ainda, tentar novamente
                        setTimeout(() => {
                            if (this.$refs.scrollSentinel) {
                                this.scrollObserver.observe(this.$refs.scrollSentinel);
                            }
                        }, 100);
                    }
                });
            }, 100);
        },
        
        /**
         * Atualiza o observer quando a lista mudar
         */
        updateScrollObserver() {
            if (this.scrollObserver) {
                // Reobservar o sentinel (pode ter sido recriado)
                this.scrollObserver.disconnect();
                this.$nextTick(() => {
                    // Aguardar um pouco para garantir que o sentinel foi renderizado
                    setTimeout(() => {
                        if (this.$refs.scrollSentinel) {
                            this.scrollObserver.observe(this.$refs.scrollSentinel);
                        }
                    }, 50);
                });
            }
        },
        
        /**
         * Configura atalhos de teclado
         */
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Não interceptar se estiver digitando em input/textarea
                if (e.target.tagName === 'INPUT' || 
                    e.target.tagName === 'TEXTAREA' || 
                    e.target.isContentEditable) {
                    // Exceção: '/' deve sempre focar na pesquisa (mesmo digitando)
                    if (e.key === '/' && e.target.classList.contains('search-input') === false) {
                        e.preventDefault();
                        this.focusSearchInput();
                        return;
                    }
                    // Exceção: Esc deve limpar filtros ou fechar modais
                    if (e.key === 'Escape') {
                        if (this.pokedexOpen) {
                            this.closePokedex();
                        } else if (this.hasActiveFilters) {
                            this.clearFilters();
                        }
                    }
                    return;
                }
                
                // Atalho: '/' ou 'Ctrl+K' / 'Cmd+K' - focar campo de pesquisa
                if (e.key === '/' || 
                    (e.key === 'k' && (e.ctrlKey || e.metaKey))) {
                    e.preventDefault();
                    this.focusSearchInput();
                }
                // Atalho: Esc - limpar filtros (não fechar modal aqui, o modal tem seu próprio handler)
                else if (e.key === 'Escape') {
                    // Não fechar modal aqui - o modal tem seu próprio handler de teclado
                    if (!this.pokedexOpen && this.hasActiveFilters) {
                        this.clearFilters();
                    }
                }
            });
        },
        
        /**
         * Foca no campo de pesquisa
         */
        focusSearchInput() {
            this.$nextTick(() => {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            });
        }
    },
    mounted() {
        // Aplicar tema primeiro, antes de qualquer outra coisa
        this.loadThemeFromStorage();
        
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
        }
        
        // Carregar preferências salvas
        this.loadRegionPreference();
        this.loadFilterTypeFromStorage();
        this.loadViewModeFromStorage();
        this.loadGridDensityFromStorage();
        this.loadGroupByTypeFromStorage();
        this.loadSortPreferences();
        this.loadViewPreferences();
        
        // Configurar atalhos de teclado
        this.setupKeyboardShortcuts();
        
        // Buscar dados da API
        this.fetchPokemonData().then(() => {
            // Validar e aplicar filtro de tipo após dados serem carregados
            this.validateAndApplyFilterType();
            
            // Iniciar pré-carregamento em background para ter counts corretos dos tipos
            // Isso garante que todos os tipos tenham suas contagens corretas desde o início
            // O pré-carregamento acontece de forma otimizada e não bloqueia a UI
            // Iniciar pré-carregamento apenas após um pequeno delay
            // para não interferir com o carregamento inicial
            setTimeout(() => {
                if (!this.isPreloading && this.currentOffset < this.totalPokemon) {
                    // Não acelerar pré-carregamento inicial - fazer em background suave
                    this.searchAccelerated = false;
                    this.startPreloading();
                }
            }, 500); // Delay de 500ms para deixar a página inicial carregar primeiro
            
            // Configurar Intersection Observer após carregamento inicial
            this.$nextTick(() => {
                this.setupInfiniteScroll();
                this.initializeTooltips();
            });
        });
        
        // Re-inicializar tooltips quando a lista mudar
        this.$watch('filteredList', () => {
            this.$nextTick(() => {
                this.initializeTooltips();
            });
        });
        
        // Listener duplicado removido - agora o modal tem seu próprio handler via setupModalKeyboardNavigation()
    },
    
    beforeUnmount() {
        // Limpar Intersection Observer
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }
        
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.handleResize);
        }
        
        if (this.gridDensityTransitionTimeout) {
            clearTimeout(this.gridDensityTransitionTimeout);
            this.gridDensityTransitionTimeout = null;
        }
        
        // Limpar handler de teclado do modal
        if (this._modalKeydownHandler) {
            document.removeEventListener('keydown', this._modalKeydownHandler);
            this._modalKeydownHandler = null;
        }
    },
    watch: {
        /**
         * Observa mudanças no filtro de tipo e salva no localStorage
         * Também reseta visibilidade quando filtros são limpos
         */
        filterType: {
            handler(newFilterType, oldFilterType) {
                this.saveFilterTypeToStorage(newFilterType);
                
                // Se o filtro foi limpo (array vazio), resetar visibilidade
                if (Array.isArray(newFilterType) && newFilterType.length === 0) {
                    // Só resetar se não estava vazio antes (para evitar reset desnecessário)
                    if (oldFilterType && (Array.isArray(oldFilterType) ? oldFilterType.length > 0 : oldFilterType)) {
                        this.resetTypesVisibility();
                    }
                }
            },
            deep: true // Observar mudanças profundas no array
        },
        
        sortBy(newSortBy) {
            this.saveSortPreferences();
        },
        
        sortAscending(newValue) {
            this.saveSortPreferences();
        },
        
        // Observar mudanças na lista para atualizar o observer
        pokemonList() {
            this.$nextTick(() => {
                this.updateScrollObserver();
            });
        },
        
        // Observar mudanças no filtro para atualizar o observer
        isFiltering(newValue) {
            this.$nextTick(() => {
                // Quando para de filtrar, garantir que o observer seja atualizado
                if (!newValue) {
                    // Aguardar um pouco mais para garantir que o DOM foi atualizado
                    setTimeout(() => {
                        this.updateScrollObserver();
                    }, 100);
                } else {
                    this.updateScrollObserver();
                }
            });
        },
        
        /**
         * Debounce na busca por nome para melhor performance
         * Nota: Vue já faz re-renderização automática via computed
         */
        filter: {
            handler: function(newFilter) {
                // Salvar filtro no localStorage (opcional)
                if (newFilter) {
                    localStorage.setItem('lastSearch', newFilter);
                } else {
                    localStorage.removeItem('lastSearch');
                }
                
                // Iniciar pré-carregamento apenas quando usuário está pesquisando
                // Isso garante que todos os dados estejam disponíveis para busca
                if (newFilter && newFilter.trim() !== '') {
                    this.searchAccelerated = true;
                    // Iniciar pré-carregamento apenas quando pesquisando
                    if (!this.isPreloading && this.currentOffset < this.totalPokemon) {
                        this.startPreloading();
                    }
                } else {
                    this.searchAccelerated = false;
                    // Parar pré-carregamento quando não está pesquisando
                    // Voltar ao lazy loading normal (scroll infinito)
                    if (this.isPreloading) {
                        this.stopPreloading();
                    }
                    // Restaurar hasMore se ainda há mais para carregar via scroll
                    // Quando limpa a pesquisa, volta ao estado de lazy loading
                    if (this.scrollOffset < this.totalPokemon) {
                        this.hasMore = true;
                        // Atualizar observer para garantir que o scroll sentinel seja observado
                        this.$nextTick(() => {
                            this.updateScrollObserver();
                        });
                    }
                }
            },
            // Debounce aplicado via método separado se necessário
        },
        
        /**
         * Observa mudanças nos tipos disponíveis para revalidar filtro
         * Também força atualização da visibilidade quando tipos são carregados
         */
        availableTypes(newTypes, oldTypes) {
            // Só validar se os tipos realmente mudaram e há dados
            if (newTypes && newTypes.length > 0 && (!oldTypes || oldTypes.length !== newTypes.length)) {
                // Se há filtro pendente ou filtro ativo, validar novamente
                const hasActiveFilter = this._pendingFilterType || 
                    (Array.isArray(this.filterType) ? this.filterType.length > 0 : this.filterType && this.filterType !== '');
                if (hasActiveFilter) {
                    this.$nextTick(() => {
                        this.validateFilterTypeIfNeeded();
                    });
                }
                
                // Forçar atualização da visibilidade quando tipos são carregados pela primeira vez
                // Isso garante que o botão "Mostrar Mais" apareça corretamente
                if (!oldTypes || oldTypes.length === 0) {
                    this.$nextTick(() => {
                        // Forçar re-render do componente se necessário
                        this.$forceUpdate();
                    });
                }
            }
        }
    },
    
    created() {
        // Criar versão com debounce do filtro se necessário
        // Por enquanto, Vue já otimiza via computed properties
    }
});
            
            // Salvar instância globalmente para acesso externo
            const vueInstance = app.mount('#app');
            window.vueAppInstance = vueInstance;
        } catch (error) {
            console.error('Erro ao inicializar aplicação Vue:', error);
            console.error('Detalhes do erro:', error.stack);
        }
    }
    
    // Tentar inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        // DOM já está pronto ou scripts no final do body
        setTimeout(initializeApp, 0);
    }
})();
