import api from './api';

export const userService = {
  // Dashboard
  async getDashboard() {
    const response = await api.get('/user/dashboard');
    return response.data;
  },

  // Favorites
  async getFavorites(itemType) {
    const response = await api.get('/user/favorites', {
      params: itemType ? { itemType } : {},
    });
    return response.data;
  },

  async addFavorite(favoriteData) {
    const response = await api.post('/user/favorites', favoriteData);
    return response.data;
  },

  async updateFavorite(id, notes) {
    const response = await api.patch(`/user/favorites/${id}`, { notes });
    return response.data;
  },

  async removeFavorite(id) {
    const response = await api.delete(`/user/favorites/${id}`);
    return response.data;
  },

  // Watchlist
  async getWatchlist() {
    const response = await api.get('/user/watchlist');
    return response.data;
  },

  async addToWatchlist(watchlistData) {
    const response = await api.post('/user/watchlist', watchlistData);
    return response.data;
  },

  async updateWatchlistItem(id, updateData) {
    const response = await api.patch(`/user/watchlist/${id}`, updateData);
    return response.data;
  },

  async removeFromWatchlist(id) {
    const response = await api.delete(`/user/watchlist/${id}`);
    return response.data;
  },
};
