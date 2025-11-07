/**
 * Sistema de tratamento de erros e notificações
 * Responsabilidade única: gerenciar erros e exibir notificações ao usuário
 */

/**
 * Tipos de notificação
 */
const NotificationType = {
    ERROR: 'error',
    SUCCESS: 'success',
    WARNING: 'warning',
    INFO: 'info'
};

/**
 * Classe para gerenciar notificações
 */
class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    /**
     * Inicializa o container de notificações
     */
    init() {
        // Criar container se não existir
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
        }
        this.container = document.getElementById('notification-container');
    }

    /**
     * Exibe uma notificação
     * @param {string} title - Título da notificação
     * @param {string} message - Mensagem da notificação
     * @param {string} type - Tipo da notificação (error, success, warning, info)
     * @param {number} duration - Duração em milissegundos (0 = não fecha automaticamente)
     */
    show(title, message, type = NotificationType.INFO, duration = 5000) {
        if (!this.container) {
            this.init();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');

        // Ícones por tipo
        const icons = {
            error: 'alert-circle',
            success: 'checkmark-circle',
            warning: 'warning',
            info: 'information-circle'
        };

        notification.innerHTML = `
            <ion-icon name="${icons[type] || icons.info}" class="notification-icon" aria-hidden="true"></ion-icon>
            <div class="notification-content">
                <h4 class="notification-title">${this.escapeHtml(title)}</h4>
                ${message ? `<p class="notification-message">${this.escapeHtml(message)}</p>` : ''}
            </div>
            <button 
                type="button" 
                class="notification-close" 
                aria-label="Fechar notificação"
                @click="this.removeNotification('${Date.now()}')"
            >
                <ion-icon name="close" aria-hidden="true"></ion-icon>
            </button>
        `;

        const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        notification.id = notificationId;
        notification.dataset.notificationId = notificationId;

        // Adicionar evento de fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.remove(notificationId);
        });

        this.container.appendChild(notification);
        this.notifications.push(notificationId);

        // Auto-remover após duração especificada
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notificationId);
            }, duration);
        }

        return notificationId;
    }

    /**
     * Remove uma notificação
     * @param {string} notificationId - ID da notificação
     */
    remove(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.classList.add('notification--exiting');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications = this.notifications.filter(id => id !== notificationId);
            }, 300);
        }
    }

    /**
     * Remove todas as notificações
     */
    clear() {
        this.notifications.forEach(id => this.remove(id));
    }

    /**
     * Escapa HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Exibe erro
     */
    error(title, message, duration = 7000) {
        return this.show(title, message, NotificationType.ERROR, duration);
    }

    /**
     * Exibe sucesso
     */
    success(title, message, duration = 3000) {
        return this.show(title, message, NotificationType.SUCCESS, duration);
    }

    /**
     * Exibe aviso
     */
    warning(title, message, duration = 5000) {
        return this.show(title, message, NotificationType.WARNING, duration);
    }

    /**
     * Exibe informação
     */
    info(title, message, duration = 4000) {
        return this.show(title, message, NotificationType.INFO, duration);
    }
}

/**
 * Classe para tratamento centralizado de erros
 */
class ErrorHandler {
    constructor() {
        this.notificationManager = new NotificationManager();
    }

    /**
     * Trata erros de API
     * @param {Error} error - Erro ocorrido
     * @param {string} context - Contexto onde o erro ocorreu
     */
    handleApiError(error, context = 'Operação') {
        console.error(`Erro em ${context}:`, error);
        
        let title = 'Erro ao carregar dados';
        let message = 'Ocorreu um erro ao tentar carregar os dados. Por favor, tente novamente.';

        if (error.message) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                title = 'Erro de conexão';
                message = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
            } else if (error.message.includes('404')) {
                title = 'Recurso não encontrado';
                message = 'O recurso solicitado não foi encontrado.';
            } else if (error.message.includes('500')) {
                title = 'Erro no servidor';
                message = 'O servidor está temporariamente indisponível. Tente novamente mais tarde.';
            } else {
                message = error.message;
            }
        }

        this.notificationManager.error(title, message);
    }

    /**
     * Trata erros genéricos
     * @param {Error} error - Erro ocorrido
     * @param {string} context - Contexto onde o erro ocorreu
     */
    handleError(error, context = 'Operação') {
        console.error(`Erro em ${context}:`, error);
        this.notificationManager.error(
            'Erro inesperado',
            `Ocorreu um erro: ${error.message || 'Erro desconhecido'}`
        );
    }

    /**
     * Exibe mensagem de sucesso
     */
    showSuccess(title, message) {
        this.notificationManager.success(title, message);
    }

    /**
     * Exibe mensagem de aviso
     */
    showWarning(title, message) {
        this.notificationManager.warning(title, message);
    }

    /**
     * Exibe mensagem informativa
     */
    showInfo(title, message) {
        this.notificationManager.info(title, message);
    }
}

// Criar instância global
const errorHandler = new ErrorHandler();
window.errorHandler = errorHandler;
window.NotificationManager = NotificationManager;
window.NotificationType = NotificationType;

