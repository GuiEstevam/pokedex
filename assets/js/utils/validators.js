/**
 * Validadores de dados da API
 * Responsabilidade única: validar estrutura e tipos de dados da PokeAPI
 */

/**
 * Valida se um objeto é um Pokémon válido
 * @param {Object} pokemon - Objeto a validar
 * @returns {boolean} True se válido
 */
function isValidPokemon(pokemon) {
    if (!pokemon || typeof pokemon !== 'object') {
        return false;
    }

    // Campos obrigatórios
    const requiredFields = ['id', 'name', 'sprites', 'types'];
    for (const field of requiredFields) {
        if (!(field in pokemon)) {
            return false;
        }
    }

    // Validar tipos
    if (!Array.isArray(pokemon.types) || pokemon.types.length === 0) {
        return false;
    }

    // Validar sprites
    if (!pokemon.sprites || typeof pokemon.sprites !== 'object') {
        return false;
    }

    // Validar ID
    if (typeof pokemon.id !== 'number' || pokemon.id < 1) {
        return false;
    }

    // Validar nome
    if (typeof pokemon.name !== 'string' || pokemon.name.trim() === '') {
        return false;
    }

    return true;
}

/**
 * Valida e normaliza dados de um Pokémon
 * @param {Object} pokemon - Dados do Pokémon
 * @returns {Object|null} Pokémon normalizado ou null se inválido
 */
function validateAndNormalizePokemon(pokemon) {
    if (!isValidPokemon(pokemon)) {
        return null;
    }

    // Normalizar estrutura - preservar todos os dados originais importantes
    const normalized = {
        id: Number(pokemon.id),
        name: String(pokemon.name).trim(),
        sprites: {
            front_default: pokemon.sprites?.front_default || null,
            back_default: pokemon.sprites?.back_default || null,
            front_shiny: pokemon.sprites?.front_shiny || null,
            back_shiny: pokemon.sprites?.back_shiny || null,
            other: {
                'official-artwork': {
                    front_default: pokemon.sprites?.other?.['official-artwork']?.front_default || null,
                    front_shiny: pokemon.sprites?.other?.['official-artwork']?.front_shiny || null
                }
            }
        },
        types: Array.isArray(pokemon.types) ? pokemon.types.map(type => ({
            slot: Number(type.slot) || 1,
            type: {
                name: String(type.type?.name || 'normal').toLowerCase()
            }
        })) : [],
        weight: typeof pokemon.weight === 'number' ? pokemon.weight : 0,
        height: typeof pokemon.height === 'number' ? pokemon.height : 0,
        stats: Array.isArray(pokemon.stats) ? pokemon.stats.map(stat => ({
            base_stat: Number(stat.base_stat) || 0,
            stat: {
                name: String(stat.stat?.name || '')
            }
        })) : [],
        abilities: Array.isArray(pokemon.abilities) ? pokemon.abilities.map(ability => ({
            is_hidden: Boolean(ability.is_hidden),
            ability: {
                name: String(ability.ability?.name || ''),
                url: String(ability.ability?.url || '')
            }
        })) : [],
        // Preservar movimentos exatamente como vêm da API (não normalizar estrutura interna)
        moves: Array.isArray(pokemon.moves) ? pokemon.moves : (pokemon.moves || []),
        base_experience: typeof pokemon.base_experience === 'number' ? pokemon.base_experience : null,
        order: typeof pokemon.order === 'number' ? pokemon.order : null
    };

    return normalized;
}

/**
 * Valida lista de Pokémon
 * @param {Array} pokemonList - Lista de Pokémon
 * @returns {Array} Lista validada e normalizada
 */
function validatePokemonList(pokemonList) {
    if (!Array.isArray(pokemonList)) {
        return [];
    }

    return pokemonList
        .map(pokemon => validateAndNormalizePokemon(pokemon))
        .filter(pokemon => pokemon !== null);
}

/**
 * Valida resposta da API de lista
 * @param {Object} response - Resposta da API
 * @returns {boolean} True se válida
 */
function isValidListResponse(response) {
    if (!response || typeof response !== 'object') {
        return false;
    }

    if (!Array.isArray(response.results)) {
        return false;
    }

    return response.results.every(item => 
        item && 
        typeof item === 'object' && 
        typeof item.name === 'string' && 
        typeof item.url === 'string'
    );
}

// Tornar funções globais
window.isValidPokemon = isValidPokemon;
window.validateAndNormalizePokemon = validateAndNormalizePokemon;
window.validatePokemonList = validatePokemonList;
window.isValidListResponse = isValidListResponse;

