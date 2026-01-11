import React, { useState, useEffect } from 'react';
import { getExpenses, deleteExpense, getCategories } from '../services/api';

const ExpenseList = ({ refreshTrigger, onEdit, onExpenseDeleted }) => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', categoryId: '' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            setCurrentPage(1); // Reset to first page on filter change
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            setLoading(true); // Ideally handling deleting state per item, but global is simpler for now
            const result = await deleteExpense(id);
            if (result.success) {
                fetchExpenses(); // Refresh list
                if (onExpenseDeleted) onExpenseDeleted();
            } else {
                alert(result.error || 'Failed to delete expense');
            }
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ startDate: '', endDate: '', categoryId: '' });
    };

    // Helper functions
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
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
    const containerStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden', // For table rounded corners
        padding: '1rem',
    };

    const filterContainerStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'end',
    };

    const inputStyle = {
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
    };

    const tableContainerStyle = {
        overflowX: 'auto',
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '600px', // Ensure it doesn't squash too much on small screens
    };

    const thStyle = {
        textAlign: 'left',
        padding: '0.75rem',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        fontWeight: 'bold',
    };

    const tdStyle = {
        padding: '0.75rem',
        borderBottom: '1px solid #dee2e6',
        verticalAlign: 'middle',
    };

    const actionButtonStyle = {
        padding: '0.25rem 0.5rem',
        marginRight: '0.5rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Transactions</h3>

            {/* Filters */}
            <div style={filterContainerStyle}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Category</label>
                    <select
                        name="categoryId"
                        value={filters.categoryId}
                        onChange={handleFilterChange}
                        style={inputStyle}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={resetFilters}
                    style={{ ...actionButtonStyle, backgroundColor: '#6c757d', color: 'white', height: '36px' }}
                >
                    Reset Filters
                </button>
            </div>

            {/* Table */}
            <div style={tableContainerStyle}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading expenses...</div>
                ) : expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No expenses found.</div>
                ) : (
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Category</th>
                                <th style={thStyle}>Description</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Amount</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentExpenses.map((expense, index) => (
                                <tr
                                    key={expense.expenseId}
                                    style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}
                                >
                                    <td style={tdStyle}>{formatDate(expense.date)}</td>
                                    <td style={tdStyle}>
                                        <span
                                            style={{
                                                backgroundColor: expense.category?.color || '#eee', // Fallback color
                                                color: '#fff', // Ideally contrast check, but assuming dark categories for now
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                textShadow: '0 0 2px rgba(0,0,0,0.5)'
                                            }}
                                        >
                                            {expense.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{expense.description || '-'}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '500' }}>
                                        {formatAmount(expense.amount)}
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => onEdit(expense)}
                                            style={{ ...actionButtonStyle, backgroundColor: '#ffc107', color: '#000' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense.expenseId)}
                                            style={{ ...actionButtonStyle, backgroundColor: '#dc3545', color: 'white' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {expenses.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, expenses.length)} of {expenses.length} entries
                    </span>
                    <div>
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            style={{ ...actionButtonStyle, backgroundColor: currentPage === 1 ? '#eee' : '#007bff', color: currentPage === 1 ? '#999' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            Previous
                        </button>
                        <span style={{ margin: '0 0.5rem', fontSize: '0.9rem' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            style={{ ...actionButtonStyle, backgroundColor: currentPage === totalPages ? '#eee' : '#007bff', color: currentPage === totalPages ? '#999' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
