import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { setPageTitle } from '../utils/pageTitle';

export default function WorkTypes() {
  useEffect(() => {
    setPageTitle('Work Types');
  }, []);
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('create');
  const [currentWorkType, setCurrentWorkType] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  // Filter work types based on search
  const filteredWorkTypes = workTypes.filter(workType =>
    workType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workType.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch work types
  const fetchWorkTypes = () => {
    setLoading(true);
    api.get('/worktypes')
      .then((res) => {
        setWorkTypes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkTypes();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create work type
  const handleCreate = (e) => {
    e.preventDefault();
    api.post('/worktypes', formData)
      .then(() => {
        setShowForm(false);
        setFormData({ name: '', description: '' });
        fetchWorkTypes();
      })
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  // Edit work type
  const handleEdit = (workType) => {
    setFormType('edit');
    setCurrentWorkType(workType);
    setFormData({ name: workType.name, description: workType.description });
    setShowForm(true);
  };

  // Update work type
  const handleUpdate = (e) => {
    e.preventDefault();
    api.put(`/worktypes/${currentWorkType._id}`, formData)
      .then(() => {
        setShowForm(false);
        setCurrentWorkType(null);
        setFormData({ name: '', description: '' });
        fetchWorkTypes();
      })
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  // Delete work type
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this work type?')) return;
    api.delete(`/worktypes/${id}`)
      .then(() => fetchWorkTypes())
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-blue-600">Loading work types...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-lg text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Work Types Management</h1>
            <p className="text-blue-100">Organize and categorize maintenance work types</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 flex items-center gap-2 font-medium"
              onClick={() => { setFormType('create'); setShowForm(true); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Work Type
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search & Filter
          </h3>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Table
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Work Types</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-blue-600">{filteredWorkTypes.length}</span> of <span className="font-semibold">{workTypes.length}</span> work types
            {searchTerm && (
              <span className="ml-2 text-green-600">• Search applied</span>
            )}
          </p>
        </div>
      </div>

      {/* Work Types Display */}
      {filteredWorkTypes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏷️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No work types found</h3>
          <p className="text-gray-500 mb-6">
            {workTypes.length === 0 
              ? "No work types have been created yet. Create your first work type to get started!"
              : "No work types match your search criteria. Try adjusting your search terms."
            }
          </p>
          {workTypes.length === 0 && (
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              onClick={() => { setFormType('create'); setShowForm(true); }}
            >
              Create First Work Type
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Card View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWorkTypes.map((workType) => (
                <div key={workType._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{workType.name}</h3>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{workType.description}</p>
                    
                    {/* Created Date */}
                    <div className="text-xs text-gray-500">
                      Created: {new Date(workType.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Card Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1 flex-1 justify-center"
                        onClick={() => handleEdit(workType)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-1 flex-1 justify-center"
                        onClick={() => handleDelete(workType._id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWorkTypes.map((workType) => (
                      <tr key={workType._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">{workType.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{workType.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(workType.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 p-1"
                              onClick={() => handleEdit(workType)}
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 p-1"
                              onClick={() => handleDelete(workType._id)}
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {formType === 'create' ? 'Create Work Type' : 'Edit Work Type'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white hover:text-blue-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={formType === 'create' ? handleCreate : handleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Electrical Maintenance"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe what this work type includes..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {formType === 'create' ? 'Create' : 'Update'}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}