import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  // Placeholder for auth state
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="glass" style={{
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--text-main)', gap: '0.5rem' }}>
        <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '12px' }}>
          <PawPrint size={24} color="white" />
        </div>
        <span className="brand" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>PetStay</span>
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hi, {user.username}</span>
              <button onClick={handleLogout} className="glass" style={{ padding: '8px', borderRadius: '10px', color: '#ff4b2b' }}>
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
