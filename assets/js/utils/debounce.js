/**
 * Utilitário para debounce de funções
 * Responsabilidade única: otimização de performance com debounce
 */

/**
 * Cria uma função com debounce
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} Função com debounce aplicado
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Tornar função global
window.debounce = debounce;

