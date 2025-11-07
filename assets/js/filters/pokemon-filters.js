/**
 * Filtros para lista de Pokémon
 * Responsabilidade única: lógica de filtros
 */

/**
 * Verifica se um Pokémon tem um tipo específico ou qualquer um dos tipos filtrados
 * @param {Array} types - Array de tipos do Pokémon
 * @param {string|Array} filterType - Tipo(s) a filtrar (string ou array)
 * @returns {boolean} True se o Pokémon tem o tipo (ou qualquer um dos tipos se for array)
 */
function hasType(types, filterType) {
    // Se não há filtro, retornar true (não filtrar)
    if (!filterType || 
        (Array.isArray(filterType) && filterType.length === 0) || 
        (typeof filterType === 'string' && filterType === "")) {
        return true;
    }
    
    // Converter para array se for string (compatibilidade)
    const filterTypes = Array.isArray(filterType) ? filterType : [filterType];
    
    // Se não há tipos para filtrar, retornar true
    if (filterTypes.length === 0) return true;
    
    // Verificar se o Pokémon tem pelo menos um dos tipos filtrados
    for (const typeObj of types) {
        if (filterTypes.includes(typeObj.type.name)) {
            return true;
        }
    }
    return false;
}

/**
 * Filtra lista de Pokémon por estatísticas (HP, peso, altura)
 * @param {Array} pokemonList - Lista de Pokémon
 * @param {Object} hpFilter - Filtro de HP { min: number|null, max: number|null }
 * @param {Object} weightFilter - Filtro de peso { min: number|null, max: number|null }
 * @param {Object} heightFilter - Filtro de altura { min: number|null, max: number|null }
 * @returns {Array} Lista filtrada
 */
function filterByStats(pokemonList, hpFilter, weightFilter, heightFilter) {
    return pokemonList.filter(pokemon => {
        // Filtro de HP
        if (hpFilter && (hpFilter.min !== null || hpFilter.max !== null)) {
            const hp = pokemon.stats && pokemon.stats.length > 0
                ? pokemon.stats.find(s => s.stat && s.stat.name === 'hp')?.base_stat || 0
                : 0;
            
            if (hpFilter.min !== null && hp < hpFilter.min) return false;
            if (hpFilter.max !== null && hp > hpFilter.max) return false;
        }
        
        // Filtro de peso
        // API retorna peso em hectogramas (hg), converter para kg (dividir por 10)
        // Mas o filtro já vem em kg, então precisamos converter o peso do Pokémon para kg
        if (weightFilter && (weightFilter.min !== null || weightFilter.max !== null)) {
            const weightInKg = (pokemon.weight || 0) / 10; // Converter de hg para kg
            const minWeight = weightFilter.min !== null ? weightFilter.min : 0;
            const maxWeight = weightFilter.max !== null ? weightFilter.max : Infinity;
            
            if (weightInKg < minWeight || weightInKg > maxWeight) return false;
        }
        
        // Filtro de altura
        // API retorna altura em decímetros (dm), converter para metros (dividir por 10)
        // Mas o filtro já vem em metros, então precisamos converter a altura do Pokémon para metros
        if (heightFilter && (heightFilter.min !== null || heightFilter.max !== null)) {
            const heightInM = (pokemon.height || 0) / 10; // Converter de dm para m
            const minHeight = heightFilter.min !== null ? heightFilter.min : 0;
            const maxHeight = heightFilter.max !== null ? heightFilter.max : Infinity;
            
            if (heightInM < minHeight || heightInM > maxHeight) return false;
        }
        
        return true;
    });
}

/**
 * Filtra lista de Pokémon por nome e tipo
 * @param {Array} pokemonList - Lista de Pokémon
 * @param {string} nameFilter - Filtro de nome
 * @param {string|Array} typeFilter - Filtro de tipo (string ou array de tipos)
 * @param {Function} normalizeFn - Função de normalização
 * @param {Object} hpFilter - Filtro de HP { min: number|null, max: number|null } (opcional)
 * @param {Object} weightFilter - Filtro de peso { min: number|null, max: number|null } (opcional)
 * @param {Object} heightFilter - Filtro de altura { min: number|null, max: number|null } (opcional)
 * @returns {Array} Lista filtrada
 */
function filterPokemonList(pokemonList, nameFilter, typeFilter, normalizeFn, hpFilter = null, weightFilter = null, heightFilter = null) {
    let filtered = pokemonList.filter(pokemon => {
        // Filtro por nome
        const nameMatch = !nameFilter || 
            nameFilter === "" || 
            normalizeFn(pokemon.name).indexOf(normalizeFn(nameFilter)) !== -1;
        
        // Filtro por tipo (aceita string ou array)
        const typeMatch = hasType(pokemon.types, typeFilter);
        
        return nameMatch && typeMatch;
    });
    
    // Aplicar filtros de estatísticas se fornecidos
    if (hpFilter || weightFilter || heightFilter) {
        filtered = filterByStats(filtered, hpFilter, weightFilter, heightFilter);
    }
    
    return filtered;
}

// Tornar funções globais
window.hasType = hasType;
window.filterPokemonList = filterPokemonList;
window.filterByStats = filterByStats;

