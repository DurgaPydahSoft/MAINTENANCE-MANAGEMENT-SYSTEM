import api from './api';

// Get all admin credentials
export const getAdmins = async () => {
  const response = await api.get('/admins');
  return response.data;
};

// Create a new admin credential
export const createAdmin = async (adminData) => {
  const response = await api.post('/admins', adminData);
  return response.data;
};

// Update an admin credential
export const updateAdmin = async (id, adminData) => {
  const response = await api.put(`/admins/${id}`, adminData);
  return response.data;
};

// Delete an admin credential
export const deleteAdmin = async (id) => {
  const response = await api.delete(`/admins/${id}`);
  return response.data;
};

// Get a single admin credential
export const getAdmin = async (id) => {
  const response = await api.get(`/admins/${id}`);
  return response.data;
};
