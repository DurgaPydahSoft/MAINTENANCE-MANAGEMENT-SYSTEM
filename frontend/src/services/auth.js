import api from './api';

const auth = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  setSession: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  getCurrentUser: () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }
};

export const login = auth.login;
export const getMe = auth.getMe;
export const logout = auth.logout;
export const setSession = auth.setSession;
export const getCurrentUser = auth.getCurrentUser;
export default auth;