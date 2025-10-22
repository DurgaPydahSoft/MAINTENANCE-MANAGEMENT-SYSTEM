import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Adjust the path if needed
import { setPageTitle } from '../utils/pageTitle';

function Tasks() {
  useEffect(() => {
    setPageTitle('Tasks Management');
  }, []);
  const [tasks, setTasks] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('create'); // 'create' or 'edit'
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area: '',
    materials: '',
    manpower: '',
    estimatedTime: '',
    tags: '',
    workType: '',
  });
  const [images, setImages] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // string[]
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', remarks: '', actualTime: '', assignedTo: '' });
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    workType: '',
    search: '',
    dateRange: ''
  });
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const statusOptions = [
    "Awaiting Approval",
    "Pending",
    "In Progress",
    "Completed"
  ];
  const updatableStatuses = statusOptions.filter(s => s !== 'Awaiting Approval');

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesWorkType = !filters.workType || (typeof task.workType === 'object' ? task.workType?._id === filters.workType : task.workType === filters.workType);
    const matchesSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      (task.area && task.area.toLowerCase().includes(filters.search.toLowerCase()));
    
    let matchesDateRange = true;
    if (filters.dateRange) {
      const taskDate = new Date(task.createdAt);
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          matchesDateRange = taskDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateRange = taskDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDateRange = taskDate >= monthAgo;
          break;
      }
    }
    
    return matchesStatus && matchesWorkType && matchesSearch && matchesDateRange;
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ status: '', workType: '', search: '', dateRange: '' });
  };

  // Fetch tasks
  const fetchTasks = () => {
    setLoading(true);
    api.get('/tasks')
      .then((res) => {
        setTasks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  };

  // Fetch work types
  const fetchWorkTypes = () => {
    api.get('/worktypes')
      .then((res) => {
        setWorkTypes(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
      });
  };

  useEffect(() => {
    fetchTasks();
    fetchWorkTypes();
    // eslint-disable-next-line
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image file selection
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Create task
  const handleCreate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const materialsArr = formData.materials.split(',').map(m => m.trim()).filter(Boolean);
    const tagsArr = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    if (formData.area) fd.append('area', formData.area);
    if (formData.manpower) fd.append('manpower', formData.manpower);
    if (formData.estimatedTime) fd.append('estimatedTime', formData.estimatedTime);
    fd.append('workType', formData.workType);
    // Send arrays as JSON strings for backend to parse
    fd.append('materials', JSON.stringify(materialsArr));
    fd.append('tags', JSON.stringify(tagsArr));
    // Append images
    images.forEach(file => fd.append('images', file));

    api.post('/tasks', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setShowForm(false);
        setFormData({ title: '', description: '', area: '', materials: '', manpower: '', estimatedTime: '', tags: '', workType: '' });
        setImages([]);
        setImagePreviews([]);
        fetchTasks();
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setSubmitting(false));
  };

  // Edit task
  const handleEdit = (task) => {
    setFormType('edit');
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      area: task.area || '',
      materials: Array.isArray(task.materials) ? task.materials.join(', ') : '',
      manpower: task.manpower || '',
      estimatedTime: task.estimatedTime || '',
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
      workType: task.workType?._id || task.workType || '',
    });
    setImages([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  // Update task
  const handleUpdate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const materialsArr = formData.materials.split(',').map(m => m.trim()).filter(Boolean);
    const tagsArr = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    if (formData.area) fd.append('area', formData.area);
    if (formData.manpower) fd.append('manpower', formData.manpower);
    if (formData.estimatedTime) fd.append('estimatedTime', formData.estimatedTime);
    fd.append('workType', formData.workType);
    fd.append('materials', JSON.stringify(materialsArr));
    fd.append('tags', JSON.stringify(tagsArr));
    // Only append images if user selected files; backend keeps old images otherwise
    images.forEach(file => fd.append('images', file));

    api.put(`/tasks/${currentTask._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setShowForm(false);
        setCurrentTask(null);
        setFormData({ title: '', description: '', area: '', materials: '', manpower: '', estimatedTime: '', tags: '', workType: '' });
        setImages([]);
        setImagePreviews([]);
        fetchTasks();
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setSubmitting(false));
  };

  // Delete task
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    api.delete(`/tasks/${id}`)
      .then(() => fetchTasks())
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  // Approve task
  const handleApprove = (id) => {
    if (!window.confirm('Are you sure you want to approve this task?')) return;
    api.post(`/tasks/${id}/approve`)
      .then(() => fetchTasks())
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  // Reject task
  const handleReject = (id) => {
    if (!window.confirm('Are you sure you want to reject this task? This will delete it permanently.')) return;
    api.post(`/tasks/${id}/reject`)
      .then(() => fetchTasks())
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  // Show task details
  const handleShowDetails = (task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  // Show status update modal
  const handleShowStatusModal = (task) => {
    setSelectedTask(task);
    setStatusForm({ 
      status: task.status || '', 
      remarks: '', 
      actualTime: task.actualTime || '', 
      assignedTo: task.assignedTo || '' });
    setShowStatusModal(true);
  };

  // Update task status (remarks and actual time optional)
  const handleStatusUpdate = () => {
    if (!selectedTask) return;
    if (!statusForm.status) {
      setError('Please choose a status');
      return;
    }
    setSubmitting(true);
    const payload = {
      status: statusForm.status,
      remarks: statusForm.remarks || undefined,
      actualTime: statusForm.actualTime || undefined,
    };
    if (statusForm.status === 'In Progress') {
      payload.assignedTo = statusForm.assignedTo || undefined;
    }
    api.post(`/tasks/${selectedTask._id}/status`, payload).then(() => {
      setShowStatusModal(false);
      setSelectedTask(null);
      setStatusForm({ status: '', remarks: '', actualTime: '', assignedTo: '' });
      fetchTasks();
    }).catch(err => setError(err.response?.data?.message || err.message))
    .finally(() => setSubmitting(false));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-blue-600">Loading tasks...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Task Management</h1>
            <p className="text-blue-100">Manage and track all maintenance tasks</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 flex items-center gap-2 font-medium"
              onClick={() => { setFormType('create'); setShowForm(true); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Task
            </button>
            <button
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-medium"
              onClick={() => {
                const publicUrl = `${window.location.origin}/public/submit`;
                navigator.clipboard.writeText(publicUrl);
                alert('Public submission link copied to clipboard!');
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.632-2.684 3 3 0 00-5.632 2.684zm0 9.316a3 3 0 105.632 2.684 3 3 0 00-5.632-2.684z" />
              </svg>
              Copy Public Link
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters & Search
          </h3>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Work Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
            <select
              value={filters.workType}
              onChange={(e) => handleFilterChange('workType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Work Types</option>
              {workTypes.map(workType => (
                <option key={workType._id} value={workType._id}>{workType.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-blue-600">{filteredTasks.length}</span> of <span className="font-semibold">{tasks.length}</span> tasks
            {Object.values(filters).some(f => f) && (
              <span className="ml-2 text-green-600">• Filters applied</span>
            )}
          </p>
        </div>
      </div>
      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-6">
            {tasks.length === 0 
              ? "No tasks have been created yet. Create your first task to get started!"
              : "No tasks match your current filters. Try adjusting your search criteria."
            }
          </p>
          {tasks.length === 0 && (
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              onClick={() => { setFormType('create'); setShowForm(true); }}
            >
              Create First Task
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Card View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTasks
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .map((task) => (
                  <div key={task._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => handleShowDetails(task)}>
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 mb-1">{new Date(task.createdAt).toLocaleDateString()}</div>
                          <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{task.title}</h3>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          task.status === 'Awaiting Approval' ? 'bg-yellow-100 text-yellow-700' :
                          task.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      
                      {/* Image Preview */}
                      {Array.isArray(task.images) && task.images.length > 0 && (
                        <div className="mb-4">
                          <img src={task.images[0]} alt="thumbnail" className="w-full h-40 object-cover rounded-xl" />
                        </div>
                      )}
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{task.description}</p>
                      
                      {/* Task Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-600">{task.area || 'No location specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <span className="text-gray-600">{typeof task.workType === 'object' ? task.workType?.name : task.workType}</span>
                        </div>
                        {task.estimatedTime && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600">{task.estimatedTime}</span>
                          </div>
                        )}
                        {task.assignedTo && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-600">{task.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Card Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 flex-wrap">
                        {task.status === 'Awaiting Approval' ? (
                          <>
                            <button
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                              onClick={() => handleApprove(task._id)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-1"
                              onClick={() => handleDelete(task._id)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                              onClick={() => handleShowStatusModal(task)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Update Status
                            </button>
                            <button
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium flex items-center gap-1"
                              onClick={() => handleEdit(task)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-1"
                              onClick={() => handleDelete(task._id)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </>
                        )}
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Task</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Area</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Work Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Est. Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTasks
                      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                      .map((task) => (
                        <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {Array.isArray(task.images) && task.images.length > 0 && (
                                <img src={task.images[0]} alt="thumbnail" className="w-12 h-12 object-cover rounded-lg" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                <p className="text-sm text-gray-500 truncate">{task.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              task.status === 'Awaiting Approval' ? 'bg-yellow-100 text-yellow-700' :
                              task.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                              task.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{task.area || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {typeof task.workType === 'object' ? task.workType?.name : task.workType}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{task.estimatedTime || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-800 p-1"
                                onClick={() => handleShowDetails(task)}
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {task.status === 'Awaiting Approval' ? (
                                <>
                                  <button
                                    className="text-green-600 hover:text-green-800 p-1"
                                    onClick={() => handleApprove(task._id)}
                                    title="Approve"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800 p-1"
                                    onClick={() => handleDelete(task._id)}
                                    title="Delete"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    onClick={() => handleShowStatusModal(task)}
                                    title="Update Status"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  </button>
                                  <button
                                    className="text-yellow-600 hover:text-yellow-800 p-1"
                                    onClick={() => handleEdit(task)}
                                    title="Edit"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800 p-1"
                                    onClick={() => handleDelete(task._id)}
                                    title="Delete"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </>
                              )}
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={formType === 'create' ? handleCreate : handleUpdate}>
              <h3 className="text-xl font-semibold mb-4">
                {formType === 'create' ? 'Create Task' : 'Edit Task'}
              </h3>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Area/Location:</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Building A, Room 101"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Materials (comma separated):</label>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  placeholder="e.g. cement, bricks, sand"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Manpower Details:</label>
                <input
                  type="text"
                  name="manpower"
                  value={formData.manpower}
                  onChange={handleChange}
                  placeholder="e.g. 2 electricians, 1 supervisor"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Estimated Time:</label>
                <input
                  type="text"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleChange}
                  placeholder="e.g. 2 hours, 1 day, 3 days"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Tags (comma separated):</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. urgent, electrical, maintenance"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Images (up to 5):</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesChange}
                  className="w-full"
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {imagePreviews.map((src, idx) => (
                      <img key={idx} src={src} alt="preview" className="h-24 w-full object-cover rounded border" />
                    ))}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Work Type:</label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Work Type</option>
                  {workTypes.map((wt) => (
                    <option key={wt._id} value={wt._id}>
                      {wt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {formType === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      {formType === 'create' ? 'Create' : 'Update'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showDetails && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedTask.title}</h3>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTask.status === 'Awaiting Approval' ? 'bg-yellow-500 text-white' :
                      selectedTask.status === 'Pending' ? 'bg-blue-500 text-white' :
                      selectedTask.status === 'In Progress' ? 'bg-orange-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {selectedTask.status}
                    </span>
                    <span className="text-sm">
                      Created {new Date(selectedTask.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:text-blue-200 text-3xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedTask.description}</p>
                  </div>

                  {/* Images */}
                  {Array.isArray(selectedTask.images) && selectedTask.images.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Images ({selectedTask.images.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {selectedTask.images.map((image, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={image} 
                              alt={`Task image ${idx + 1}`} 
                              className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105"
                              onClick={() => window.open(image, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* History */}
                  {Array.isArray(selectedTask.history) && selectedTask.history.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        History
                      </h4>
                      <div className="space-y-3">
                        {selectedTask.history.map((entry, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-gray-800">{entry.status}</span>
                                {entry.remarks && <p className="text-sm text-gray-600 mt-1">{entry.remarks}</p>}
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {new Date(entry.changedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Task Info */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Task Information</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Area</span>
                        <p className="text-gray-800">{selectedTask.area || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Work Type</span>
                        <p className="text-gray-800">
                          {typeof selectedTask.workType === 'object' ? selectedTask.workType?.name : selectedTask.workType}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Materials</span>
                        <p className="text-gray-800">
                          {Array.isArray(selectedTask.materials) && selectedTask.materials.length > 0 
                            ? selectedTask.materials.join(', ') 
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Manpower</span>
                        <p className="text-gray-800">{selectedTask.manpower || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Estimated Time</span>
                        <p className="text-gray-800">{selectedTask.estimatedTime || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Actual Time</span>
                        <p className="text-gray-800">{selectedTask.actualTime || 'Not specified'}</p>
                      </div>
                      {selectedTask.assignedTo && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Assigned To</span>
                          <p className="text-gray-800">{selectedTask.assignedTo}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-600">Tags</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(selectedTask.tags) && selectedTask.tags.length > 0 ? (
                            selectedTask.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Actions</h4>
                    <div className="space-y-3">
                      {selectedTask.status === 'Awaiting Approval' ? (
                        <>
                          <button
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                            onClick={() => {
                              handleApprove(selectedTask._id);
                              setShowDetails(false);
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button
                            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center"
                            onClick={() => {
                              handleDelete(selectedTask._id);
                              setShowDetails(false);
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                            onClick={() => {
                              handleShowStatusModal(selectedTask);
                              setShowDetails(false);
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Update Status
                          </button>
                          <button
                            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center justify-center"
                            onClick={() => {
                              handleEdit(selectedTask);
                              setShowDetails(false);
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center"
                            onClick={() => {
                              handleDelete(selectedTask._id);
                              setShowDetails(false);
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Update Status</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-white hover:text-blue-200 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-1">Task: {selectedTask.title}</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    {updatableStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    value={statusForm.remarks}
                    onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                    placeholder="Optional remarks about the status change"
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Time</label>
                  <input
                    type="text"
                    value={statusForm.actualTime}
                    onChange={(e) => setStatusForm({ ...statusForm, actualTime: e.target.value })}
                    placeholder="e.g. 2 hours, 1 day"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {statusForm.status === 'In Progress' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                    <input
                      type="text"
                      value={statusForm.assignedTo}
                      onChange={(e) => setStatusForm({ ...statusForm, assignedTo: e.target.value })}
                      placeholder="e.g. John Doe, Maintenance Team"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={handleStatusUpdate}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      Update Status
                    </>
                  )}
                </button>
                <button
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
