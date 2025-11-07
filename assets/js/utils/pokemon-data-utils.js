/**
 * Utilitários para processamento de dados de Pokémon
 * Responsabilidade única: normalização e formatação de dados da API
 */

/**
 * Extrai descrição (flavor text) em português brasileiro
 * @param {Array} flavorTexts - Array de flavor texts da API
 * @param {string} lang - Idioma desejado (padrão: 'pt-BR')
 * @returns {string} Descrição em PT-BR ou primeira disponível
 */
function getFlavorTextByLanguage(flavorTexts, lang = 'pt-BR') {
    if (!Array.isArray(flavorTexts) || flavorTexts.length === 0) {
        return '';
    }

    // Tentar encontrar em PT-BR primeiro
    const ptBrText = flavorTexts.find(entry => entry.language && entry.language.name === 'pt-BR');
    if (ptBrText && ptBrText.flavor_text) {
        return ptBrText.flavor_text.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Tentar encontrar em português (pt)
    const ptText = flavorTexts.find(entry => entry.language && entry.language.name === 'pt');
    if (ptText && ptText.flavor_text) {
        return ptText.flavor_text.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Tentar encontrar em inglês (en) como fallback
    const enText = flavorTexts.find(entry => entry.language && entry.language.name === 'en');
    if (enText && enText.flavor_text) {
        return enText.flavor_text.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Retornar primeira descrição disponível
    const firstText = flavorTexts.find(entry => entry.flavor_text);
    if (firstText && firstText.flavor_text) {
        return firstText.flavor_text.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim();
    }

    return '';
}

/**
 * Normaliza cadeia evolutiva em estrutura plana
 * @param {Object} chain - Cadeia evolutiva da API
 * @returns {Array} Array de estágios evolutivos
 */
function normalizeEvolutionChain(chain) {
    if (!chain || !chain.chain) {
        return [];
    }

    const evolutionChain = [];
    
    function processChain(evolution, level = 0) {
        if (!evolution || !evolution.species) {
            return;
        }

        const evolutionData = {
            name: evolution.species.name,
            id: extractIdFromUrl(evolution.species.url),
            level: level,
            details: []
        };

        // Processar detalhes de evolução
        if (Array.isArray(evolution.evolution_details) && evolution.evolution_details.length > 0) {
            evolution.evolution_details.forEach(detail => {
                const detailObj = {};
                
                if (detail.min_level) {
                    detailObj.type = 'level';
                    detailObj.value = detail.min_level;
                    detailObj.label = `Nível ${detail.min_level}`;
                } else if (detail.item) {
                    detailObj.type = 'item';
                    detailObj.value = detail.item.name;
                    detailObj.label = `Item: ${detail.item.name}`;
                } else if (detail.trigger && detail.trigger.name === 'trade') {
                    detailObj.type = 'trade';
                    detailObj.value = 'trade';
                    detailObj.label = 'Troca';
                    if (detail.held_item) {
                        detailObj.label += ` com ${detail.held_item.name}`;
                    }
                } else if (detail.trigger && detail.trigger.name === 'use-item') {
                    detailObj.type = 'item';
                    detailObj.value = detail.item ? detail.item.name : 'item';
                    detailObj.label = `Usar item: ${detail.item ? detail.item.name : 'item'}`;
                } else if (detail.happiness) {
                    detailObj.type = 'happiness';
                    detailObj.value = detail.happiness;
                    detailObj.label = `Felicidade: ${detail.happiness}`;
                } else if (detail.time_of_day) {
                    detailObj.type = 'time';
                    detailObj.value = detail.time_of_day;
                    detailObj.label = `Horário: ${detail.time_of_day}`;
                } else if (detail.known_move_type) {
                    detailObj.type = 'move';
                    detailObj.value = detail.known_move_type.name;
                    detailObj.label = `Movimento tipo ${detail.known_move_type.name}`;
                } else if (detail.trigger) {
                    detailObj.type = 'trigger';
                    detailObj.value = detail.trigger.name;
                    detailObj.label = detail.trigger.name;
                }

                if (Object.keys(detailObj).length > 0) {
                    evolutionData.details.push(detailObj);
                }
            });
        }

        evolutionChain.push(evolutionData);

        // Processar evoluções seguintes
        if (Array.isArray(evolution.evolves_to) && evolution.evolves_to.length > 0) {
            evolution.evolves_to.forEach(nextEvolution => {
                processChain(nextEvolution, level + 1);
            });
        }
    }

    processChain(chain.chain);
    return evolutionChain;
}

/**
 * Extrai ID de uma URL da PokeAPI
 * @param {string} url - URL da API
 * @returns {number|null} ID extraído ou null
 */
function extractIdFromUrl(url) {
    if (!url) return null;
    const matches = url.match(/\/(\d+)\/?$/);
    return matches ? parseInt(matches[1], 10) : null;
}

/**
 * Identifica geração de um movimento baseado na versão
 * @param {Object} move - Movimento da API
 * @returns {string} Geração ('I', 'II', 'III', etc.) ou 'all'
 */
function getMoveGeneration(move) {
    if (!move || !Array.isArray(move.version_group_details) || move.version_group_details.length === 0) {
        return 'all';
    }

    // Mapear versões para gerações
    const versionToGeneration = {
        'red-blue': 'I',
        'yellow': 'I',
        'gold-silver': 'II',
        'crystal': 'II',
        'ruby-sapphire': 'III',
        'emerald': 'III',
        'firered-leafgreen': 'III',
        'diamond-pearl': 'IV',
        'platinum': 'IV',
        'heartgold-soulsilver': 'IV',
        'black-white': 'V',
        'black-2-white-2': 'V',
        'x-y': 'VI',
        'omega-ruby-alpha-sapphire': 'VI',
        'sun-moon': 'VII',
        'ultra-sun-ultra-moon': 'VII',
        'lets-go-pikachu-lets-go-eevee': 'VII',
        'sword-shield': 'VIII',
        'brilliant-diamond-and-shining-pearl': 'VIII',
        'legends-arceus': 'VIII',
        'scarlet-violet': 'IX'
    };

    // Pegar primeira versão disponível
    const firstVersion = move.version_group_details[0];
    if (firstVersion && firstVersion.version_group && firstVersion.version_group.name) {
        const gen = versionToGeneration[firstVersion.version_group.name];
        return gen || 'all';
    }

    return 'all';
}

/**
 * Agrupa movimentos por geração
 * @param {Array} moves - Array de movimentos
 * @returns {Object} Objeto com movimentos agrupados por geração
 */
function groupMovesByGeneration(moves) {
    if (!Array.isArray(moves)) {
        return {};
    }

    const grouped = {
        'all': moves,
        'I': [],
        'II': [],
        'III': [],
        'IV': [],
        'V': [],
        'VI': [],
        'VII': [],
        'VIII': [],
        'IX': []
    };

    moves.forEach(move => {
        const gen = getMoveGeneration(move);
        if (gen !== 'all' && grouped[gen]) {
            grouped[gen].push(move);
        }
    });

    return grouped;
}

/**
 * Traduz categoria de movimento para português
 * @param {string} category - Categoria em inglês
 * @returns {string} Categoria em português
 */
function formatMoveCategory(category) {
    const translations = {
        'physical': 'Físico',
        'special': 'Especial',
        'status': 'Status'
    };
    return translations[category] || category;
}

/**
 * Traduz nome do tipo de movimento para português
 * @param {string} typeName - Nome do tipo em inglês
 * @returns {string} Nome do tipo em português
 */
function translateMoveType(typeName) {
    if (!typeName || typeof window.translateType !== 'function') {
        return typeName;
    }
    return window.translateType(typeName);
}

// Tornar funções globais
window.getFlavorTextByLanguage = getFlavorTextByLanguage;
window.normalizeEvolutionChain = normalizeEvolutionChain;
window.extractIdFromUrl = extractIdFromUrl;
window.getMoveGeneration = getMoveGeneration;
window.groupMovesByGeneration = groupMovesByGeneration;
window.formatMoveCategory = formatMoveCategory;
window.translateMoveType = translateMoveType;

