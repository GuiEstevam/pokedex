/**
 * Gerenciador de favoritos
 * Responsabilidade única: gerenciar Pokémon favoritos no localStorage
 */

class FavoritesManager {
    constructor() {
        this.storageKey = 'pokedex_favorites';
    }

    /**
     * Obtém lista de favoritos
     * @returns {Array<number>} Array de IDs de Pokémon favoritos
     */
    getFavorites() {
        try {
            const favorites = localStorage.getItem(this.storageKey);
            if (!favorites) {
                return [];
            }
            return JSON.parse(favorites);
        } catch (error) {
            console.warn('Erro ao recuperar favoritos:', error);
            return [];
        }
    }

    /**
     * Verifica se um Pokémon é favorito
     * @param {number} pokemonId - ID do Pokémon
     * @returns {boolean} True se é favorito
     */
    isFavorite(pokemonId) {
        const favorites = this.getFavorites();
        return favorites.includes(Number(pokemonId));
    }

    /**
     * Adiciona Pokémon aos favoritos
     * @param {number} pokemonId - ID do Pokémon
     */
    addFavorite(pokemonId) {
        try {
            const favorites = this.getFavorites();
            const id = Number(pokemonId);
            
            if (!favorites.includes(id)) {
                favorites.push(id);
                localStorage.setItem(this.storageKey, JSON.stringify(favorites));
            }
        } catch (error) {
            console.warn('Erro ao adicionar favorito:', error);
        }
    }

    /**
     * Remove Pokémon dos favoritos
     * @param {number} pokemonId - ID do Pokémon
     */
    removeFavorite(pokemonId) {
        try {
            const favorites = this.getFavorites();
            const id = Number(pokemonId);
            const filtered = favorites.filter(favId => favId !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        } catch (error) {
            console.warn('Erro ao remover favorito:', error);
        }
    }

    /**
     * Alterna favorito (adiciona se não existe, remove se existe)
     * @param {number} pokemonId - ID do Pokémon
     * @returns {boolean} True se foi adicionado, false se foi removido
     */
    toggleFavorite(pokemonId) {
        if (this.isFavorite(pokemonId)) {
            this.removeFavorite(pokemonId);
            return false;
        } else {
            this.addFavorite(pokemonId);
            return true;
        }
    }

    /**
     * Limpa todos os favoritos
     */
    clearFavorites() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Erro ao limpar favoritos:', error);
        }
    }

    /**
     * Obtém quantidade de favoritos
     * @returns {number} Quantidade de favoritos
     */
    getCount() {
        return this.getFavorites().length;
    }
}

// Criar instância global
const favoritesManager = new FavoritesManager();
window.favoritesManager = favoritesManager;
window.FavoritesManager = FavoritesManager;

