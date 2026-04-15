import React, { useState, useEffect } from 'react';
import { getExpenses, deleteExpense, getCategories } from '../services/api';

const ExpenseList = ({ refreshTrigger, onEdit, onExpenseDeleted }) => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', categoryId: '' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // 3x3 grid looks nice

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [filters, refreshTrigger]);

    const fetchCategories = async () => {
        const result = await getCategories();
        if (result.success) {
            setCategories(result.data);
        }
    };

    const fetchExpenses = async () => {
        setLoading(true);
        const result = await getExpenses(
            filters.startDate || undefined,
            filters.endDate || undefined,
            filters.categoryId || undefined
        );

        if (result.success) {
            setExpenses(result.data);
            setCurrentPage(1);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            const result = await deleteExpense(id);
            if (result.success) {
                fetchExpenses();
                if (onExpenseDeleted) onExpenseDeleted();
            } else {
                alert(result.error || 'Failed to delete expense');
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ startDate: '', endDate: '', categoryId: '' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExpenses = expenses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(expenses.length / itemsPerPage);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Styles
    const filterInputStyle = {
        padding: '0.625rem',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        outline: 'none',
        width: '100%',
        minWidth: '150px'
    };

    const expenseCardStyle = (categoryColor) => ({
        borderLeft: `5px solid ${categoryColor || '#ccc'}`,
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative'
    });

    return (
        <div>
            {/* Filters Section */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Filter Expenses</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1' }}>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            style={filterInputStyle}
                            placeholder="Start Date"
                        />
                    </div>
                    <div style={{ flex: '1' }}>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            style={filterInputStyle}
                            placeholder="End Date"
                        />
                    </div>
                    <div style={{ flex: '1' }}>
                        <select
                            name="categoryId"
                            value={filters.categoryId}
                            onChange={handleFilterChange}
                            style={filterInputStyle}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="btn btn-secondary"
                        style={{ height: '42px' }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Expenses Grid */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Transactions</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {expenses.length} records found
                    </span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid var(--primary-color)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem'
                        }}></div>
                        <p>Loading expenses...</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No transactions found.</p>
                        <p style={{ color: '#9ca3af' }}>Try adjusting filters or add a new expense.</p>
                    </div>
                ) : (
                    <div className="grid-view">
                        {currentExpenses.map((expense) => (
                            <div key={expense.expenseId} style={expenseCardStyle(expense.category?.color)} className="card">
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <span className="badge" style={{
                                            backgroundColor: (expense.category?.color || '#eee') + '20', // Light opacity background
                                            color: expense.category?.color || '#666'
                                        }}>
                                            {expense.category?.name || 'Uncategorized'}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {formatDate(expense.date)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        {formatAmount(expense.amount)}
                                    </div>
                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        margin: '0 0 1rem 0',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {expense.description || 'No description provided'}
                                    </p>
                                </div>
                                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => onEdit(expense)}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(expense.expenseId)}
                                        className="btn"
                                        style={{
                                            backgroundColor: '#fee2e2',
                                            color: '#ef4444',
                                            fontSize: '0.8rem',
                                            padding: '0.4rem 0.8rem'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {expenses.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="btn btn-secondary"
                        style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        &larr; Previous
                    </button>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="btn btn-secondary"
                        style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
