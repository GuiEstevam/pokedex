/**
 * Utilitário para normalização de texto
 * Responsabilidade única: normalização de strings
 */

/**
 * Normaliza texto removendo acentos e convertendo para maiúsculas
 * @param {string} value - Valor a normalizar
 * @returns {string} Texto normalizado
 */
function normalizeText(value) {
    if (!value) return "";
    return String(value)
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Verifica se um texto contém outro texto (normalizado)
 * @param {string} text - Texto principal
 * @param {string} search - Texto a procurar
 * @returns {boolean} True se contém
 */
function containsNormalized(text, search) {
    const normalizedText = normalizeText(text);
    const normalizedSearch = normalizeText(search);
    return normalizedText.indexOf(normalizedSearch) !== -1;
}

// Tornar funções globais
window.normalizeText = normalizeText;
window.containsNormalized = containsNormalized;

