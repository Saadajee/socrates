import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../auth/AuthContext';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-marble">
      {currentUser && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <header className="bg-parchment/90 backdrop-blur-sm shadow-lg gold-accent px-8 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold font-serif text-deep">Socrates</h1>
          
          {currentUser && (
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gold/20 text-deep font-medium rounded-xl hover:bg-gold/40 transition border border-gold/30"
            >
              Logout
            </button>
          )}
        </header>
        
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}