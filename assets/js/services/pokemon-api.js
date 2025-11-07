/**
 * Serviço de API para buscar dados de Pokémon
 * Responsabilidade única: chamadas à PokeAPI
 */
class PokemonApiService {
    constructor() {
        this.baseUrl = "https://pokeapi.co/api/v2/pokemon";
    }

    /**
     * Busca lista de Pokémon
     * @param {number} limit - Limite de Pokémon a buscar (padrão: 151)
     * @returns {Promise<Array>} Lista de Pokémon
     */
    async fetchPokemonList(limit = 151) {
        try {
            const response = await fetch(`${this.baseUrl}/?limit=${limit}`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar lista: ${response.status}`);
            }
            const data = await response.json();
            
            // Validar resposta
            if (!window.isValidListResponse || !window.isValidListResponse(data)) {
                throw new Error('Resposta da API inválida');
            }
            
            return data.results;
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handleApiError(error, 'buscar lista de Pokémon');
            }
            throw error;
        }
    }

    /**
     * Busca detalhes de um Pokémon específico
     * @param {string} url - URL do Pokémon
     * @param {boolean} useCache - Usar cache se disponível (padrão: true)
     * @returns {Promise<Object>} Detalhes do Pokémon
     */
    async fetchPokemonDetails(url, useCache = true) {
        try {
            // Verificar cache primeiro
            if (useCache && window.cacheManager) {
                const cacheKey = `pokemon_${url}`;
                const cached = window.cacheManager.get(cacheKey);
                if (cached) {
                    return cached;
                }
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ao buscar detalhes: ${response.status}`);
            }
            const data = await response.json();
            
            // Validar e normalizar dados
            let normalized = data;
            if (window.validateAndNormalizePokemon) {
                normalized = window.validateAndNormalizePokemon(data);
                if (!normalized) {
                    throw new Error('Dados do Pokémon inválidos');
                }
            }
            
            // Salvar no cache
            if (useCache && window.cacheManager) {
                const cacheKey = `pokemon_${url}`;
                const snapshot = this.createPokemonCacheSnapshot(normalized);
                window.cacheManager.set(cacheKey, snapshot);
            }
            
            return normalized;
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handleApiError(error, 'buscar detalhes do Pokémon');
            }
            throw error;
        }
    }

    createPokemonCacheSnapshot(pokemonData) {
        if (!pokemonData || typeof pokemonData !== 'object') {
            return pokemonData;
        }

        const mapStats = Array.isArray(pokemonData.stats)
            ? pokemonData.stats.map(stat => ({
                base_stat: stat.base_stat,
                effort: stat.effort,
                stat: stat.stat ? { name: stat.stat.name, url: stat.stat.url } : stat.stat
            }))
            : [];

        const mapTypes = Array.isArray(pokemonData.types)
            ? pokemonData.types.map(type => ({
                slot: type.slot,
                type: type.type ? { name: type.type.name, url: type.type.url } : type.type
            }))
            : [];

        const mapAbilities = Array.isArray(pokemonData.abilities)
            ? pokemonData.abilities.map(ability => ({
                ability: ability.ability ? { name: ability.ability.name, url: ability.ability.url } : ability.ability,
                is_hidden: ability.is_hidden,
                slot: ability.slot
            }))
            : [];

        const sprites = pokemonData.sprites || {};
        const otherSprites = sprites.other || {};
        const officialArtwork = otherSprites['official-artwork'] || {};

        return {
            id: pokemonData.id,
            name: pokemonData.name,
            height: pokemonData.height,
            weight: pokemonData.weight,
            base_experience: pokemonData.base_experience,
            order: pokemonData.order,
            stats: mapStats,
            types: mapTypes,
            abilities: mapAbilities,
            sprites: {
                front_default: sprites.front_default || null,
                front_shiny: sprites.front_shiny || null,
                back_default: sprites.back_default || null,
                back_shiny: sprites.back_shiny || null,
                other: {
                    'official-artwork': {
                        front_default: officialArtwork.front_default || null,
                        front_shiny: officialArtwork.front_shiny || null
                    }
                }
            },
            species: pokemonData.species ? { name: pokemonData.species.name, url: pokemonData.species.url } : null,
            moves: []
        };
    }

    /**
     * Busca todos os Pokémon com seus detalhes
     * @param {number} limit - Limite de Pokémon a buscar
     * @returns {Promise<Array>} Lista de Pokémon com detalhes completos
     */
    async fetchAllPokemonWithDetails(limit = 151) {
        try {
            const pokemonList = await this.fetchPokemonList(limit);
            const pokemonPromises = pokemonList.map(pokemon => 
                this.fetchPokemonDetails(pokemon.url)
            );
            const results = await Promise.all(pokemonPromises);
            
            // Validar lista completa
            if (window.validatePokemonList) {
                return window.validatePokemonList(results);
            }
            
            return results;
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handleApiError(error, 'buscar todos os Pokémon');
            }
            throw error;
        }
    }

    /**
     * Busca Pokémon em lotes (lazy loading)
     * @param {number} offset - Índice inicial
     * @param {number} limit - Quantidade a buscar
     * @returns {Promise<Array>} Lista de Pokémon com detalhes
     */
    async fetchPokemonBatch(offset = 0, limit = 20) {
        try {
            const response = await fetch(`${this.baseUrl}/?offset=${offset}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar lote: ${response.status}`);
            }
            const data = await response.json();
            
            // Validar resposta
            if (!window.isValidListResponse || !window.isValidListResponse(data)) {
                throw new Error('Resposta da API inválida');
            }

            // Buscar detalhes em paralelo
            const pokemonPromises = data.results.map(pokemon => 
                this.fetchPokemonDetails(pokemon.url)
            );
            const results = await Promise.all(pokemonPromises);
            
            // Validar lista
            if (window.validatePokemonList) {
                return window.validatePokemonList(results);
            }
            
            return results;
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handleApiError(error, 'buscar lote de Pokémon');
            }
            throw error;
        }
    }

    /**
     * Busca dados da espécie do Pokémon (para evoluções e descrições)
     * @param {number} id - ID do Pokémon
     * @param {boolean} useCache - Usar cache se disponível (padrão: true)
     * @returns {Promise<Object>} Dados da espécie
     */
    async fetchPokemonSpecies(id, useCache = true) {
        try {
            const cacheKey = `pokemon_species_${id}`;
            
            // Verificar cache primeiro
            if (useCache && window.cacheManager) {
                const cached = window.cacheManager.get(cacheKey);
                if (cached) {
                    return cached;
                }
            }

            const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar espécie: ${response.status}`);
            }
            const data = await response.json();
            
            // Salvar no cache
            if (useCache && window.cacheManager) {
                window.cacheManager.set(cacheKey, data);
            }
            
            return data;
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handleApiError(error, 'buscar espécie do Pokémon');
            }
            throw error;
        }
    }

    /**
     * Busca detalhes de uma habilidade (flavor text em PT-BR)
     * @param {string} url - URL da habilidade
     * @param {boolean} useCache - Usar cache se disponível (padrão: true)
     * @returns {Promise<Object>} Detalhes da habilidade
     */
    async fetchAbilityDetails(url, useCache = true) {
        try {
            const cacheKey = `ability_${url}`;
            
            // Verificar cache primeiro
            if (useCache && window.cacheManager) {
                const cached = window.cacheManager.get(cacheKey);
                if (cached) {
                    return cached;
                }
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ao buscar habilidade: ${response.status}`);
            }
            const data = await response.json();
            
            // Salvar no cache
            if (useCache && window.cacheManager) {
                window.cacheManager.set(cacheKey, data);
            }
            
            return data;
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handleApiError(error, 'buscar detalhes da habilidade');
            }
            throw error;
        }
    }

    /**
     * Busca cadeia evolutiva do Pokémon
     * @param {string} url - URL da cadeia evolutiva
     * @param {boolean} useCache - Usar cache se disponível (padrão: true)
     * @returns {Promise<Object>} Cadeia evolutiva
     */
    async fetchEvolutionChain(url, useCache = true) {
        try {
            const cacheKey = `evolution_chain_${url}`;
            
            // Verificar cache primeiro
            if (useCache && window.cacheManager) {
                const cached = window.cacheManager.get(cacheKey);
                if (cached) {
                    return cached;
                }
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ao buscar cadeia evolutiva: ${response.status}`);
            }
            const data = await response.json();
            
            // Salvar no cache
            if (useCache && window.cacheManager) {
                window.cacheManager.set(cacheKey, data);
            }
            
            return data;
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handleApiError(error, 'buscar cadeia evolutiva');
            }
            throw error;
        }
    }
}

// Tornar classe global
window.PokemonApiService = PokemonApiService;

