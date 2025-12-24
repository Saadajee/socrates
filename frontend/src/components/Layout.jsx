// src/components/Layout.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../auth/AuthContext';
import { useState } from 'react';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-marble relative">
      {/* Dark overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-stone/30 border-r-4 border-gold
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:block
        `}
      >
        {currentUser && <Sidebar />}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full md:ml-0">
        <header className="bg-parchment/90 backdrop-blur-sm shadow-lg gold-accent px-4 md:px-8 pt-6 md:pt-8 pb-6 md:pb-5 flex justify-between items-center relative z-30">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gold/20 transition"
              aria-label="Open menu"
            >
              <svg className="w-7 h-7 text-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Title - left-aligned on mobile, centered only if no menu button */}
            <h1 className="text-3xl font-bold font-serif text-deep">
              Socrates
            </h1>
          </div>

          {/* Logout button - smaller on mobile */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="px-4 md:px-6 py-2 bg-gold/20 text-deep text-sm md:text-base font-medium rounded-xl hover:bg-gold/40 transition border border-gold/30"
            >
              Logout
            </button>
          )}
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
