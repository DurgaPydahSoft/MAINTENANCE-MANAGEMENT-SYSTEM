import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import WorkTypes from './pages/WorkTypes';
import Settings from './pages/Settings';
import PublicSubmit from './pages/PublicSubmit';
import PrivateRoute from './components/PrivateRoute';
import { logout, getCurrentUser } from './services/auth';

function AppShell() {
  const location = useLocation();
  const [user, setUser] = useState(getCurrentUser());
  const isPublic = location.pathname.startsWith('/public');
  const isLogin = location.pathname === '/login';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/login';
  };

  // Render login page without sidebar
  if (isLogin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={
            user ? <Dashboard /> : <Login onLogin={u => { setUser(u); window.location.replace('/'); }} />
          } />
        </Routes>
      </div>
    );
  }

  // Render public routes without sidebar
  if (isPublic) {
    return (
      <Routes>
        <Route path="/public/submit" element={<PublicSubmit />} />
      </Routes>
    );
  }

  // Render authenticated routes with sidebar
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Modern Sidebar - Fixed position */}
      <aside className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 w-72 hidden md:flex flex-col shadow-2xl fixed left-0 top-0 h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-white">PYDAH</h1>
                <p className="text-xs text-gray-400">Maintenance Portal</p>
              </div>
              <div className="w-32 h-20">
                <DotLottieReact
                  src="https://lottie.host/e6ff0b4d-b519-4509-a423-1ff4a4c520d3/1g7wwRt38G.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg'
            }`}
          >
            {({ isActive }) => (
              <>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                  isActive ? 'bg-white/20' : 'bg-gray-700 group-hover:bg-gray-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Dashboard</div>
                  <div className="text-xs opacity-75">Overview & Analytics</div>
                </div>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/tasks" 
            className={({ isActive }) => `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg'
            }`}
          >
            {({ isActive }) => (
              <>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                  isActive ? 'bg-white/20' : 'bg-gray-700 group-hover:bg-gray-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Task Management</div>
                  <div className="text-xs opacity-75">Create & Manage Tasks</div>
                </div>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/worktypes" 
            className={({ isActive }) => `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg'
            }`}
          >
            {({ isActive }) => (
              <>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                  isActive ? 'bg-white/20' : 'bg-gray-700 group-hover:bg-gray-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Work Types</div>
                  <div className="text-xs opacity-75">Categorize Work</div>
                </div>
              </>
            )}
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg'
            }`}
          >
            {({ isActive }) => (
              <>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                  isActive ? 'bg-white/20' : 'bg-gray-700 group-hover:bg-gray-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09c0-.61-.39-1.16-.99-1.51a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82A1.65 1.65 0 015 12c0-1.1.68-2.06 1.65-2.41a1.65 1.65 0 00.99-1.51V8a2 2 0 014 0v.09c0 .61.39 1.16.99 1.51A1.65 1.65 0 0012 10c1.1 0 2.06.68 2.41 1.65.36.97 1.31 1.65 2.41 1.65.86 0 1.62.5 1.99 1.24z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Settings</div>
                  <div className="text-xs opacity-75">App configuration</div>
                </div>
              </>
            )}
          </NavLink>
        </nav>

        {/* Sticky User Profile & Logout */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-700/50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name || user?.email}</div>
              <div className="text-xs text-gray-400 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Online
              </div>
            </div>
          </div>
          
          <button 
            className="w-full group flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
            onClick={handleLogout}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-gray-700 group-hover:bg-red-500 transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Logout</div>
              <div className="text-xs opacity-75">Sign out of account</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 md:ml-72 min-h-screen flex flex-col">
      {/* Mobile header */}
        <div className="md:hidden w-full bg-white border-b border-gray-200 p-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
          <button
            className="text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </button>
          <Link to="/" className="font-bold text-lg text-blue-700">PYDAH</Link>
          {user ? (
            <button className="text-sm text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/login" className="text-sm p-2 hover:bg-blue-50 rounded-lg transition-colors">Login</Link>
          )}
        </div>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Mobile sidebar drawer */}
            <div className="md:hidden fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <Link to="/" className="flex items-center space-x-3 group" onClick={() => setIsSidebarOpen(false)}>
                    <div>
                      <h1 className="text-2xl font-bold text-white">PYDAH</h1>
                      <p className="text-xs text-gray-400">Maintenance Portal</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-white hover:text-gray-300 p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <NavLink
                  to="/"
                  end
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                        isActive ? 'bg-white/20' : 'bg-gray-700 group-hover:bg-gray-600'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Dashboard</div>
                        <div className="text-xs opacity-75">Overview & Analytics</div>
                      </div>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/tasks"
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                        isActive ? 'bg-white/20' : 'bg-gray-700 group-hover:bg-gray-600'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Task Management</div>
                        <div className="text-xs opacity-75">Create & Manage Tasks</div>
                      </div>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/worktypes"
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                        isActive ? 'bg-white/20' : 'bg-gray-700 group-hover:bg-gray-600'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Work Types</div>
                        <div className="text-xs opacity-75">Categorize Work</div>
                      </div>
                    </>
                  )}
                </NavLink>
                <NavLink
                  to="/settings"
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                        isActive ? 'bg-white/20' : 'bg-gray-700 group-hover:bg-gray-600'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09c0-.61-.39-1.16-.99-1.51a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82A1.65 1.65 0 015 12c0-1.1.68-2.06 1.65-2.41a1.65 1.65 0 00.99-1.51V8a2 2 0 014 0v.09c0 .61.39 1.16.99 1.51A1.65 1.65 0 0012 10c1.1 0 2.06.68 2.41 1.65.36.97 1.31 1.65 2.41 1.65.86 0 1.62.5 1.99 1.24z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Settings</div>
                        <div className="text-xs opacity-75">App configuration</div>
                      </div>
                    </>
                  )}
                </NavLink>
              </nav>

              {/* Sticky User Profile & Logout */}
              <div className="p-4 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{user?.name || user?.email}</div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Online
                    </div>
                  </div>
                </div>

                <button
                  className="w-full group flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    handleLogout();
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-gray-700 group-hover:bg-red-500 transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Logout</div>
                    <div className="text-xs opacity-75">Sign out of account</div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <Routes>
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
            <Route path="/worktypes" element={<PrivateRoute roles={["super_admin", "admin"]}><WorkTypes /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute roles={["super_admin", "admin"]}><Settings /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
