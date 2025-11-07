/**
 * Gerenciador de cache para dados de Pokémon
 * Responsabilidade única: gerenciar cache no localStorage
 */

class CacheManager {
    constructor() {
        this.cachePrefix = 'pokedex_cache_';
        this.cacheVersion = 'v1';
        this.maxAge = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
        this.maxEntries = 40;
        this.indexKey = `${this.cachePrefix}${this.cacheVersion}_index`;
        this.isCacheDisabled = false;
        this.hasShownQuotaWarning = false;
    }

    /**
     * Gera chave de cache
     * @param {string} key - Chave base
     * @returns {string} Chave completa
     */
    getCacheKey(key) {
        return `${this.cachePrefix}${this.cacheVersion}_${key}`;
    }

    /**
     * Salva dados no cache
     * @param {string} key - Chave do cache
     * @param {*} data - Dados a salvar
     */
    set(key, data) {
        if (this.isCacheDisabled) {
            return;
        }
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            version: this.cacheVersion
        };
        const cacheKey = this.getCacheKey(key);

        try {
            this.writeCacheEntry(cacheKey, cacheData);
        } catch (error) {
            this.handleCacheSetError(error, cacheKey, cacheData);
        }
    }

    /**
     * Recupera dados do cache
     * @param {string} key - Chave do cache
     * @returns {*|null} Dados em cache ou null
     */
    get(key) {
        try {
            const cacheKey = this.getCacheKey(key);
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) {
                return null;
            }

            const cacheData = JSON.parse(cached);
            
            // Verificar versão
            if (cacheData.version !== this.cacheVersion) {
                this.remove(key);
                return null;
            }

            // Verificar idade do cache
            const age = Date.now() - cacheData.timestamp;
            if (age > this.maxAge) {
                this.remove(key);
                return null;
            }

            return cacheData.data;
        } catch (error) {
            console.warn('Erro ao recuperar do cache:', error);
            return null;
        }
    }

    /**
     * Remove item do cache
     * @param {string} key - Chave do cache
     */
    remove(key) {
        try {
            const cacheKey = this.getCacheKey(key);
            localStorage.removeItem(cacheKey);
            this.removeFromIndex(cacheKey);
        } catch (error) {
            console.warn('Erro ao remover do cache:', error);
        }
    }

    /**
     * Limpa todo o cache
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.cachePrefix)) {
                    localStorage.removeItem(key);
                }
            });
            localStorage.removeItem(this.indexKey);
        } catch (error) {
            console.warn('Erro ao limpar cache:', error);
        }
    }

    /**
     * Limpa cache antigo (mais de 7 dias)
     */
    clearOldCache() {
        try {
            const oldAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith(this.cachePrefix)) {
                    try {
                        const cached = localStorage.getItem(key);
                        if (cached) {
                            const cacheData = JSON.parse(cached);
                            const age = Date.now() - cacheData.timestamp;
                            if (age > oldAge) {
                                localStorage.removeItem(key);
                                this.removeFromIndex(key);
                            }
                        }
                    } catch (e) {
                        // Se não conseguir parsear, remover
                        localStorage.removeItem(key);
                        this.removeFromIndex(key);
                    }
                }
            });
        } catch (error) {
            console.warn('Erro ao limpar cache antigo:', error);
        }
    }

    /**
     * Remove entradas mais antigas para liberar espaço
     * @param {number} quantity Quantidade máxima de entradas removidas
     */
    removeOldestEntries(quantity = 5) {
        try {
            const entries = [];
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.cachePrefix)) {
                    try {
                        const cached = JSON.parse(localStorage.getItem(key));
                        const timestamp = cached && cached.timestamp ? cached.timestamp : 0;
                        entries.push({ key, timestamp });
                    } catch (error) {
                        localStorage.removeItem(key);
                    }
                }
            });

            if (entries.length === 0) {
                return;
            }

            entries
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(0, quantity)
                .forEach(entry => {
                    localStorage.removeItem(entry.key);
                    this.removeFromIndex(entry.key);
                });
        } catch (error) {
            console.warn('Erro ao remover itens antigos do cache:', error);
        }
    }

    /**
     * Trata erros ao salvar no cache (quota excedida, etc.)
     * @param {Error} error
     * @param {string} key
     * @param {*} data
     */
    handleCacheSetError(error, cacheKey, cacheData) {
        const isQuotaExceeded = error && (
            error.name === 'QuotaExceededError' ||
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        );

        if (!isQuotaExceeded) {
            console.warn('Erro ao salvar no cache:', error);
            return;
        }

        if (!this.hasShownQuotaWarning) {
            console.warn('Limite de armazenamento do localStorage atingido. Tentando liberar espaço...');
            this.hasShownQuotaWarning = true;
        }

        // Limpar cache muito antigo
        this.clearOldCache();

        if (this.isStorageFull()) {
            this.removeOldestEntries(10);
        }

        try {
            this.writeCacheEntry(cacheKey, cacheData);
        } catch (retryError) {
            console.warn('Não foi possível salvar no cache após limpeza. Cache será desativado nesta sessão.', retryError);
            this.isCacheDisabled = true;
        }
    }

    /**
     * Verifica se o localStorage continua cheio
     * @returns {boolean}
     */
    isStorageFull() {
        try {
            const testKey = `${this.cachePrefix}__test__`;
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return false;
        } catch (error) {
            return true;
        }
    }

    /**
     * Verifica se existe cache válido
     * @param {string} key - Chave do cache
     * @returns {boolean} True se existe cache válido
     */
    has(key) {
        return this.get(key) !== null;
    }

    writeCacheEntry(cacheKey, cacheData) {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        this.addToIndex(cacheKey);
        this.enforceMaxEntries();
    }

    getIndex() {
        try {
            const raw = localStorage.getItem(this.indexKey);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.warn('Erro ao obter índice do cache:', error);
            return [];
        }
    }

    saveIndex(index) {
        try {
            localStorage.setItem(this.indexKey, JSON.stringify(index));
        } catch (error) {
            console.warn('Erro ao salvar índice do cache:', error);
        }
    }

    addToIndex(cacheKey) {
        const index = this.getIndex().filter(key => key !== cacheKey);
        index.push(cacheKey);
        this.saveIndex(index);
    }

    removeFromIndex(cacheKey) {
        const index = this.getIndex().filter(key => key !== cacheKey);
        this.saveIndex(index);
    }

    enforceMaxEntries() {
        const index = this.getIndex();
        if (index.length <= this.maxEntries) {
            return;
        }

        const toRemove = index.splice(0, index.length - this.maxEntries);
        toRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        this.saveIndex(index);
    }
}

// Criar instância global
const cacheManager = new CacheManager();
window.cacheManager = cacheManager;
window.CacheManager = CacheManager;

