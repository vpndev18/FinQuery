import React from 'react';
import { Link } from 'react-router-dom';

const PublicLayout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
            {/* Public Header */}
            <header style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                padding: '1rem 2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Link to="/login" style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span>💸</span> ExpenseTracker
                </Link>
            </header>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                {children}
            </div>

            <footer style={{ textAlign: 'center', padding: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} ExpenseTracker. All rights reserved.
            </footer>
        </div>
    );
};

export default PublicLayout;
