import axios from 'axios';

const api = axios.create({
  baseURL: 'https://offcon-backend.onrender.com/api/',
});

// Переменные для предотвращения множественных refresh-запросов
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Перехватчик ответов: обрабатываем 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const response = await axios.post('/api/token/refresh/', {
          refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

const token = localStorage.getItem('access_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// === НОВАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ПОЛНОГО URL ИЗОБРАЖЕНИЙ ===
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return '';
  if (mediaPath.startsWith('http')) return mediaPath;
  const base = 'https://offcon-backend.onrender.com';
  return `${base}${mediaPath.startsWith('/') ? mediaPath : '/' + mediaPath}`;
};
// =====================================================

export const getProjects = (params) => api.get('projects/', { params });
export const getServices = () => api.get('services/');
export const getNews = () => api.get('news/');
export const getReviews = () => api.get('reviews/');
export const sendRequest = (data) => api.post('requests/', data);
export const getSettings = () => api.get('settings/');
export const getAboutSettings = () => api.get('about-settings/');
export const getFooterSettings = () => api.get('footer-settings/');
export const getSocialLinks = () => api.get('social-links/');
export const getContactSettings = () => api.get('contact-settings/');
export const getPrivacyPolicy = () => api.get('privacy-policy/');
export const getServicesBanner = () => api.get('services-banner/');
export const getReviewQuote = () => api.get('review-quote/');
export const getTeamMembers = () => api.get('team-members/');
export const getFAQ = () => api.get('faq/');

export const login = (username, password) => api.post('/token/', { username, password });
export const register = (userData) => api.post('/register/', userData);
export const getProfile = () => api.get('/user/me/');
export const getUserRequests = () => api.get('/user/requests/');

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('access_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const deleteRequest = (id) => api.delete(`/user/requests/${id}/`);
export const updateRequest = (id, data) => api.patch(`/user/requests/${id}/update/`, data);