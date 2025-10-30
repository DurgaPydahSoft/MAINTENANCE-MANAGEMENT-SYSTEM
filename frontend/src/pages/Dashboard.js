import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import { Link, useNavigate } from 'react-router-dom';
import { setPageTitle } from '../utils/pageTitle';

export default function Dashboard() {
  useEffect(() => {
    setPageTitle('Dashboard');
  }, []);
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    awaiting: 0, 
    pending: 0, 
    inProgress: 0, 
    completed: 0,
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    overdue: 0
  });
  const [workTypeStats, setWorkTypeStats] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const navigate = useNavigate();

  const goToTasksWithFilter = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.workType) params.set('workType', filters.workType);
    if (filters.search) params.set('search', filters.search);
    if (filters.dateRange) params.set('dateRange', filters.dateRange);
    navigate(`/tasks?${params.toString()}`);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, workTypesRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/worktypes')
      ]);

      const tasks = tasksRes.data;
      const workTypes = workTypesRes.data;
      
      // Calculate basic stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const basicStats = {
        awaiting: tasks.filter(t => t.status === 'Awaiting Approval').length,
          pending: tasks.filter(t => t.status === 'Pending').length,
          inProgress: tasks.filter(t => t.status === 'In Progress').length,
          completed: tasks.filter(t => t.status === 'Completed').length,
        total: tasks.length,
        thisWeek: tasks.filter(t => new Date(t.createdAt) >= weekAgo).length,
        thisMonth: tasks.filter(t => new Date(t.createdAt) >= monthAgo).length,
        overdue: tasks.filter(t => {
          if (t.status === 'Completed') return false;
          const createdAt = new Date(t.createdAt);
          const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
          return daysSinceCreation > 7; // Consider overdue if older than 7 days
        }).length
      };

      // Calculate work type statistics
      const workTypeStatsData = workTypes.map(workType => {
        const tasksForType = tasks.filter(t => 
          (typeof t.workType === 'object' ? t.workType?._id : t.workType) === workType._id
        );
        return {
          ...workType,
          taskCount: tasksForType.length,
          completedCount: tasksForType.filter(t => t.status === 'Completed').length,
          pendingCount: tasksForType.filter(t => t.status === 'Pending').length,
          inProgressCount: tasksForType.filter(t => t.status === 'In Progress').length
        };
      }).sort((a, b) => b.taskCount - a.taskCount);

      // Get recent tasks (last 5)
      const recentTasksData = tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Calculate monthly trends (last 6 months)
      const monthlyTrendsData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthTasks = tasks.filter(t => {
          const taskDate = new Date(t.createdAt);
          return taskDate >= monthStart && taskDate <= monthEnd;
        });

        monthlyTrendsData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count: monthTasks.length,
          completed: monthTasks.filter(t => t.status === 'Completed').length
        });
      }

      setStats(basicStats);
      setWorkTypeStats(workTypeStatsData);
      setRecentTasks(recentTasksData);
      setMonthlyTrends(monthlyTrendsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-blue-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-blue-100">Welcome back, {user?.name || user?.email}</p>
            <p className="text-blue-200 text-sm mt-1">Here's what's happening with your maintenance tasks</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/tasks" 
              className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              View All Tasks
            </Link>
            <Link 
              to="/worktypes" 
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Manage Work Types
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div role="button" tabIndex={0} onClick={() => goToTasksWithFilter({})} onKeyDown={(e) => e.key === 'Enter' && goToTasksWithFilter({})} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+{stats.thisWeek}</span>
            <span className="text-gray-500 ml-1">this week</span>
          </div>
        </div>

        <div role="button" tabIndex={0} onClick={() => goToTasksWithFilter({ status: 'Awaiting Approval' })} onKeyDown={(e) => e.key === 'Enter' && goToTasksWithFilter({ status: 'Awaiting Approval' })} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Awaiting Approval</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.awaiting}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Needs review</span>
          </div>
        </div>

        <div role="button" tabIndex={0} onClick={() => goToTasksWithFilter({ status: 'In Progress' })} onKeyDown={(e) => e.key === 'Enter' && goToTasksWithFilter({ status: 'In Progress' })} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-purple-600">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Active work</span>
          </div>
        </div>

        <div role="button" tabIndex={0} onClick={() => goToTasksWithFilter({ status: 'Completed' })} onKeyDown={(e) => e.key === 'Enter' && goToTasksWithFilter({ status: 'Completed' })} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </span>
            <span className="text-gray-500 ml-1">completion rate</span>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div role="button" tabIndex={0} onClick={() => goToTasksWithFilter({ status: 'Pending' })} onKeyDown={(e) => e.key === 'Enter' && goToTasksWithFilter({ status: 'Pending' })} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Work Type Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Work Type Distribution
          </h3>
          <div className="space-y-3">
            {workTypeStats.slice(0, 5).map((workType, index) => (
              <div key={workType._id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{workType.name}</span>
                    <span className="text-gray-500">{workType.taskCount} tasks</span>
                  </div>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (workType.taskCount / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Monthly Trends
          </h3>
          <div className="space-y-3">
            {monthlyTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{trend.month}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{trend.count} total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{trend.completed} completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Tasks
        </h3>
        <div className="space-y-3">
          {recentTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent tasks found</p>
          ) : (
            recentTasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(task.createdAt).toLocaleDateString()} • 
                    {typeof task.workType === 'object' ? task.workType?.name : task.workType}
                  </p>
        </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    task.status === 'Awaiting Approval' ? 'bg-yellow-100 text-yellow-700' :
                    task.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                    task.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.status}
                  </span>
                  <Link 
                    to="/tasks" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View →
                  </Link>
        </div>
      </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
