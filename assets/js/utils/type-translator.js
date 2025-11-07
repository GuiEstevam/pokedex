/**
 * Utilitário para tradução de tipos de Pokémon
 * Responsabilidade única: tradução inglês → português brasileiro
 */

/**
 * Mapeamento de tipos de Pokémon (inglês → português)
 */
const typeTranslations = {
    'bug': 'Inseto',
    'dark': 'Sombrio',
    'dragon': 'Dragão',
    'electric': 'Elétrico',
    'fairy': 'Fada',
    'fighting': 'Lutador',
    'fire': 'Fogo',
    'flying': 'Voador',
    'ghost': 'Fantasma',
    'grass': 'Grama',
    'ground': 'Terra',
    'ice': 'Gelo',
    'normal': 'Normal',
    'poison': 'Veneno',
    'psychic': 'Psíquico',
    'rock': 'Pedra',
    'steel': 'Aço',
    'water': 'Água'
};

/**
 * Traduz nome do tipo de inglês para português
 * @param {string} typeName - Nome do tipo em inglês
 * @returns {string} Nome do tipo em português
 */
function translateType(typeName) {
    if (!typeName) return '';
    return typeTranslations[typeName.toLowerCase()] || typeName;
}

/**
 * Traduz array de tipos
 * @param {Array} types - Array de objetos de tipo
 * @returns {Array} Array com nomes traduzidos
 */
function translateTypes(types) {
    if (!types || !Array.isArray(types)) return [];
    return types.map(type => ({
        ...type,
        type: {
            ...type.type,
            name: translateType(type.type.name)
        }
    }));
}

/**
 * Retorna lista de tipos para select (com tradução)
 * @returns {Array} Array de objetos { value, label }
 */
function getTranslatedTypesForSelect() {
    return Object.entries(typeTranslations).map(([value, label]) => ({
        value,
        label
    }));
}

// Tornar funções globais
window.translateTypeUtil = translateType;
window.getTranslatedTypesForSelect = getTranslatedTypesForSelect;

