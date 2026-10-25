import api from './api';

export const spaceService = {
  // ISS Tracker
  async getIssTelemetry() {
    const response = await api.get('/space/tracker/iss');
    return response.data;
  },

  // Launches
  async getUpcomingLaunches(params = {}) {
    const response = await api.get('/space/launches', { params });
    return response.data;
  },

  async getLaunchById(id) {
    const response = await api.get(`/space/launches/${id}`);
    return response.data;
  },

  // NASA Content
  async getApod(date) {
    const response = await api.get('/space/nasa/apod', {
      params: date ? { date } : {},
    });
    return response.data;
  },

  async getMarsPhotos(params = {}) {
    const response = await api.get('/space/nasa/mars', { params });
    return response.data;
  },

  async getNeoAsteroids(startDate, endDate) {
    const response = await api.get('/space/nasa/neo', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
