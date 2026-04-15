import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
    const location = useLocation();

    const navStyle = {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
    };

    const logoStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        letterSpacing: '-0.5px',
        textDecoration: 'none',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const linkContainerStyle = {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center'
    };

    const linkStyle = (path) => ({
        color: 'white',
        textDecoration: 'none',
        opacity: location.pathname === path ? 1 : 0.8,
        fontWeight: location.pathname === path ? '600' : '400',
        transition: 'opacity 0.2s',
        borderBottom: location.pathname === path ? '2px solid white' : '2px solid transparent',
        paddingBottom: '2px'
    });

    const logoutBtnStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '0.9rem',
        transition: 'background-color 0.2s'
    };

    return (
        <nav style={navStyle}>
            <Link to="/dashboard" style={logoStyle}>
                <span>💸</span> ExpenseTracker
            </Link>
            <div style={linkContainerStyle}>
                <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
                <Link to="/groups" style={linkStyle('/groups')}>Groups</Link>
                <Link to="/categories" style={linkStyle('/categories')}>Categories</Link>
                <Link to="/reports" style={linkStyle('/reports')}>Reports</Link>
                <button
                    onClick={onLogout}
                    style={logoutBtnStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
