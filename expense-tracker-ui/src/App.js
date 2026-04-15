import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import ReportsChart from './components/ReportsChart';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import CategoryManager from './components/CategoryManager';
import Navbar from './components/Navbar';
import PublicLayout from './components/PublicLayout';
import GroupsPage from './components/GroupsPage';
import GroupDetailsPage from './components/GroupDetailsPage';
import AiChatbot from './components/AiChatbot';
import { logout } from './services/api';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    return token ? children : <Navigate to="/login" />;
};

// Layout Component to wrap authentication pages
const MainLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar onLogout={handleLogout} />
            <div className="container" style={{ flex: 1, marginTop: '20px' }}>
                {children}
            </div>
            <AiChatbot />
        </div>
    );
};

const Dashboard = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showForm, setShowForm] = useState(false);

    return (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Sidebar / Form Area */}
            <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <div className="card" style={{ marginBottom: '1rem', borderTop: '4px solid var(--primary-color)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Quick Actions</h3>
                    <button
                        onClick={() => { setShowForm(!showForm); setEditingExpense(null); }}
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '1rem' }}
                    >
                        {showForm ? 'Cancel Adding' : 'Add New Expense'}
                    </button>
                    {!showForm && !editingExpense && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                            Click above to add a new transaction record.
                        </p>
                    )}
                </div>

                {(showForm || editingExpense) && (
                    <div className="animate-fade-in">
                        <ExpenseForm
                            expense={editingExpense}
                            onSuccess={() => {
                                setRefreshTrigger(prev => prev + 1);
                                setShowForm(false);
                                setEditingExpense(null);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: '2', minWidth: '300px' }}>
                <ExpenseList
                    refreshTrigger={refreshTrigger}
                    onEdit={(expense) => {
                        setEditingExpense(expense);
                        setShowForm(true);
                        // Scroll to top or form
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onExpenseDeleted={() => setRefreshTrigger(prev => prev + 1)}
                />
            </div>
        </div>
    );
};

const ReportsPage = () => {
    return (
        <div style={{ maxWidth: '100%', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem' }}>Financial Reports</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Visualize your spending habits over time.</p>
            </div>
            <ReportsChart />
        </div>
    )
}

const CategoriesPage = () => {
    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ borderLeft: '4px solid var(--secondary-color)', paddingLeft: '1rem' }}>Category Management</h2>
            </div>
            <CategoryManager />
        </div>
    )
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    <PublicLayout>
                        <Login />
                    </PublicLayout>
                } />
                <Route path="/register" element={
                    <PublicLayout>
                        <Register />
                    </PublicLayout>
                } />
                <Route path="/forgot-password" element={
                    <PublicLayout>
                        <ForgotPassword />
                    </PublicLayout>
                } />

                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/reports" element={
                    <PrivateRoute>
                        <MainLayout>
                            <ReportsPage />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/categories" element={
                    <PrivateRoute>
                        <MainLayout>
                            <CategoriesPage />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/groups" element={
                    <PrivateRoute>
                        <MainLayout>
                            <GroupsPage />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/groups/:groupId" element={
                    <PrivateRoute>
                        <MainLayout>
                            <GroupDetailsPage />
                        </MainLayout>
                    </PrivateRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;
