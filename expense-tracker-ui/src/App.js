import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import ReportsChart from './components/ReportsChart';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import CategoryManager from './components/CategoryManager';
import { logout } from './services/api';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    return token ? children : <Navigate to="/login" />;
};

const Dashboard = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Expense Tracker</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/categories" style={{ textDecoration: 'none', color: '#007bff' }}>Manage Categories</Link>
                    <Link to="/reports" style={{ textDecoration: 'none', color: '#007bff' }}>View Reports</Link>
                    <button onClick={handleLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Sidebar / Form Area */}
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <button
                        onClick={() => { setShowForm(!showForm); setEditingExpense(null); }}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {showForm ? 'Hide Form' : 'Add New Expense'}
                    </button>

                    {(showForm || editingExpense) && (
                        <ExpenseForm
                            expense={editingExpense}
                            onSuccess={() => {
                                setRefreshTrigger(prev => prev + 1);
                                setShowForm(false);
                                setEditingExpense(null);
                            }}
                        />
                    )}
                </div>

                {/* Main Content Area */}
                <div style={{ flex: '2', minWidth: '400px' }}>
                    <ExpenseList
                        refreshTrigger={refreshTrigger}
                        onEdit={(expense) => {
                            setEditingExpense(expense);
                            setShowForm(true);
                        }}
                        onExpenseDeleted={() => setRefreshTrigger(prev => prev + 1)}
                    />
                </div>
            </div>
        </div>
    );
};

const ReportsPage = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>&larr; Back to Dashboard</button>
            <ReportsChart />
        </div>
    )
}

const CategoriesPage = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>&larr; Back to Dashboard</button>
            <CategoryManager />
        </div>
    )
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
                <Route path="/reports" element={
                    <PrivateRoute>
                        <ReportsPage />
                    </PrivateRoute>
                } />
                <Route path="/categories" element={
                    <PrivateRoute>
                        <CategoriesPage />
                    </PrivateRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;
