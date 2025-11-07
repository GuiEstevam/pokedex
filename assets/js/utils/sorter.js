/**
 * Utilitário para ordenação de dados
 * Responsabilidade única: funções de ordenação
 */

/**
 * Ordena lista de Pokémon por ID
 * @param {Array} pokemonList - Lista de Pokémon
 * @returns {Array} Lista ordenada
 */
function sortPokemonById(pokemonList) {
    return [...pokemonList].sort((a, b) => {
        return a.id - b.id;
    });
}

/**
 * Ordena lista de Pokémon por nome
 * @param {Array} pokemonList - Lista de Pokémon
 * @param {boolean} ascending - Ordem crescente (padrão: true)
 * @returns {Array} Lista ordenada
 */
function sortPokemonByName(pokemonList, ascending = true) {
    return [...pokemonList].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        const comparison = nameA.localeCompare(nameB, 'pt-BR');
        return ascending ? comparison : -comparison;
    });
}

/**
 * Ordena lista de Pokémon por tipo primário
 * @param {Array} pokemonList - Lista de Pokémon
 * @param {boolean} ascending - Ordem crescente (padrão: true)
 * @returns {Array} Lista ordenada
 */
function sortPokemonByType(pokemonList, ascending = true) {
    return [...pokemonList].sort((a, b) => {
        const typeA = (a.types && a.types[0] && a.types[0].type.name) || 'normal';
        const typeB = (b.types && b.types[0] && b.types[0].type.name) || 'normal';
        const comparison = typeA.localeCompare(typeB, 'pt-BR');
        return ascending ? comparison : -comparison;
    });
}

/**
 * Ordena lista de Pokémon por peso
 * @param {Array} pokemonList - Lista de Pokémon
 * @param {boolean} ascending - Ordem crescente (padrão: true)
 * @returns {Array} Lista ordenada
 */
function sortPokemonByWeight(pokemonList, ascending = true) {
    return [...pokemonList].sort((a, b) => {
        const weightA = a.weight || 0;
        const weightB = b.weight || 0;
        return ascending ? weightA - weightB : weightB - weightA;
    });
}

/**
 * Ordena lista de Pokémon por altura
 * @param {Array} pokemonList - Lista de Pokémon
 * @param {boolean} ascending - Ordem crescente (padrão: true)
 * @returns {Array} Lista ordenada
 */
function sortPokemonByHeight(pokemonList, ascending = true) {
    return [...pokemonList].sort((a, b) => {
        const heightA = a.height || 0;
        const heightB = b.height || 0;
        return ascending ? heightA - heightB : heightB - heightA;
    });
}

/**
 * Ordena lista de Pokémon por HP (pontos de vida)
 * @param {Array} pokemonList - Lista de Pokémon
 * @param {boolean} ascending - Ordem crescente (padrão: true)
 * @returns {Array} Lista ordenada
 */
function sortPokemonByHP(pokemonList, ascending = true) {
    return [...pokemonList].sort((a, b) => {
        const getHP = (pokemon) => {
            if (!pokemon.stats || !Array.isArray(pokemon.stats)) {
                return 0;
            }
            const hpStat = pokemon.stats.find(stat => stat.stat && stat.stat.name === 'hp');
            return hpStat ? (hpStat.base_stat || 0) : 0;
        };
        
        const hpA = getHP(a);
        const hpB = getHP(b);
        return ascending ? hpA - hpB : hpB - hpA;
    });
}

/**
 * Ordena lista de Pokémon por critério especificado
 * @param {Array} pokemonList - Lista de Pokémon
 * @param {string} sortBy - Critério de ordenação ('id', 'name', 'type', 'weight', 'height', 'hp')
 * @param {boolean} ascending - Ordem crescente (padrão: true)
 * @returns {Array} Lista ordenada
 */
function sortPokemonBy(pokemonList, sortBy = 'id', ascending = true) {
    switch (sortBy) {
        case 'name':
            return sortPokemonByName(pokemonList, ascending);
        case 'type':
            return sortPokemonByType(pokemonList, ascending);
        case 'weight':
            return sortPokemonByWeight(pokemonList, ascending);
        case 'height':
            return sortPokemonByHeight(pokemonList, ascending);
        case 'hp':
            return sortPokemonByHP(pokemonList, ascending);
        case 'id':
        default:
            // Ordenar por ID respeitando ascending
            return [...pokemonList].sort((a, b) => {
                return ascending ? a.id - b.id : b.id - a.id;
            });
    }
}

// Tornar funções globais
window.sortPokemonById = sortPokemonById;
window.sortPokemonByName = sortPokemonByName;
window.sortPokemonByType = sortPokemonByType;
window.sortPokemonByWeight = sortPokemonByWeight;
window.sortPokemonByHeight = sortPokemonByHeight;
window.sortPokemonByHP = sortPokemonByHP;
window.sortPokemonBy = sortPokemonBy;

