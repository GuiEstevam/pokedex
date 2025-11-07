/**
 * Utilitário para gerenciar tooltips
 * Responsabilidade única: criar e gerenciar tooltips
 */

class TooltipManager {
    constructor() {
        this.tooltips = new Map();
        this.init();
    }

    init() {
        // Inicializar tooltips existentes no DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeTooltips();
        });
    }

    /**
     * Cria um tooltip para um elemento
     * @param {HTMLElement} element - Elemento que receberá o tooltip
     * @param {string} text - Texto do tooltip
     * @param {string} position - Posição do tooltip (top, bottom, left, right)
     * @param {boolean} multiline - Se o tooltip pode ter múltiplas linhas
     */
    createTooltip(element, text, position = 'top', multiline = false) {
        if (!element || !text) {
            return;
        }

        // Remover tooltip existente se houver
        this.removeTooltip(element);

        // Criar wrapper se não existir
        let wrapper = element.closest('.tooltip-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'tooltip-wrapper';
            element.parentNode.insertBefore(wrapper, element);
            wrapper.appendChild(element);
        }

        // Criar tooltip
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip--${position}${multiline ? ' tooltip--multiline' : ''}`;
        tooltip.textContent = text;
        tooltip.setAttribute('role', 'tooltip');
        tooltip.setAttribute('aria-hidden', 'true');
        wrapper.appendChild(tooltip);

        // Armazenar referência
        this.tooltips.set(element, { wrapper, tooltip });

        // Atualizar aria-label do elemento
        if (!element.getAttribute('aria-label')) {
            element.setAttribute('aria-label', text);
        }
    }

    /**
     * Cria um tooltip com HTML customizado
     * @param {HTMLElement} element - Elemento que receberá o tooltip
     * @param {HTMLElement|string} content - Conteúdo HTML do tooltip
     * @param {string} position - Posição do tooltip
     */
    createCustomTooltip(element, content, position = 'top') {
        if (!element || !content) {
            return;
        }

        this.removeTooltip(element);

        let wrapper = element.closest('.tooltip-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'tooltip-wrapper';
            element.parentNode.insertBefore(wrapper, element);
            wrapper.appendChild(element);
        }

        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip--${position} tooltip--multiline`;
        tooltip.setAttribute('role', 'tooltip');
        tooltip.setAttribute('aria-hidden', 'true');

        if (typeof content === 'string') {
            tooltip.innerHTML = content;
        } else {
            tooltip.appendChild(content);
        }

        wrapper.appendChild(tooltip);
        this.tooltips.set(element, { wrapper, tooltip });
    }

    /**
     * Remove tooltip de um elemento
     * @param {HTMLElement} element - Elemento que terá o tooltip removido
     */
    removeTooltip(element) {
        const tooltipData = this.tooltips.get(element);
        if (tooltipData) {
            const { wrapper, tooltip } = tooltipData;
            tooltip.remove();
            
            // Remover wrapper se não tiver outros filhos além do elemento
            if (wrapper && wrapper.children.length === 1) {
                const parent = wrapper.parentNode;
                parent.insertBefore(element, wrapper);
                wrapper.remove();
            }
            
            this.tooltips.delete(element);
        }
    }

    /**
     * Inicializa tooltips existentes no DOM
     */
    initializeTooltips() {
        const elements = document.querySelectorAll('[data-tooltip]');
        elements.forEach(element => {
            const text = element.getAttribute('data-tooltip');
            const position = element.getAttribute('data-tooltip-position') || 'top';
            const multiline = element.hasAttribute('data-tooltip-multiline');
            this.createTooltip(element, text, position, multiline);
        });
    }

    /**
     * Atualiza texto de um tooltip existente
     * @param {HTMLElement} element - Elemento do tooltip
     * @param {string} text - Novo texto
     */
    updateTooltip(element, text) {
        const tooltipData = this.tooltips.get(element);
        if (tooltipData && tooltipData.tooltip) {
            tooltipData.tooltip.textContent = text;
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', text);
            }
        }
    }
}

// Exportar instância global
if (typeof window !== 'undefined') {
    window.TooltipManager = new TooltipManager();
}

// Exportar classe para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TooltipManager;
}

