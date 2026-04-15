import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupDetails, addMemberToGroup } from '../services/api';

const GroupDetailsPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [error, setError] = useState(null);

    const loadGroupDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await getGroupDetails(groupId);
        if (result.success) {
            setGroup(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }, [groupId]);

    useEffect(() => {
        loadGroupDetails();
    }, [loadGroupDetails]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberEmail.trim()) return;

        const result = await addMemberToGroup(groupId, newMemberEmail);
        if (result.success) {
            setNewMemberEmail('');
            setShowAddMemberModal(false);
            loadGroupDetails();
        } else {
            alert('Failed to add member: ' + result.error);
        }
    };

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || '?';
    };

    const getAvatarColor = (index) => {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-large"></div>
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading group details...</p>
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3>Oops! Something went wrong</h3>
                <p>{error || 'Group not found'}</p>
                <button className="btn-primary" onClick={() => navigate('/groups')}>
                    ← Back to Groups
                </button>
            </div>
        );
    }

    const totalOwed = group.members.reduce((sum, m) => m.balance > 0 ? sum + m.balance : sum, 0);
    const totalOwe = Math.abs(group.members.reduce((sum, m) => m.balance < 0 ? sum + m.balance : sum, 0));

    return (
        <div className="group-details-page">
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate('/groups')}>
                    ← Back to Groups
                </button>
                <div className="header-content">
                    <div className="header-left">
                        <div className="group-avatar-large">{getInitials(group.name)}</div>
                        <div>
                            <h1 className="page-title">{group.name}</h1>
                            <p className="page-subtitle">Created by {group.createdByName || group.createdByEmail}</p>
                        </div>
                    </div>
                    <button className="btn-hero" onClick={() => setShowAddMemberModal(true)}>
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>+</span>
                        Add Member
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-box stat-members">
                    <div className="stat-icon-bg">👥</div>
                    <div>
                        <div className="stat-number">{group.members?.length || 0}</div>
                        <div className="stat-label">Members</div>
                    </div>
                </div>
                <div className="stat-box stat-expenses">
                    <div className="stat-icon-bg">💸</div>
                    <div>
                        <div className="stat-number">{group.expenses?.length || 0}</div>
                        <div className="stat-label">Expenses</div>
                    </div>
                </div>
                <div className="stat-box stat-owed">
                    <div className="stat-icon-bg">💰</div>
                    <div>
                        <div className="stat-number">₹{totalOwed.toFixed(0)}</div>
                        <div className="stat-label">Total Owed</div>
                    </div>
                </div>
                <div className="stat-box stat-owing">
                    <div className="stat-icon-bg">📊</div>
                    <div>
                        <div className="stat-number">₹{totalOwe.toFixed(0)}</div>
                        <div className="stat-label">Total Owing</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="content-grid">
                {/* Members Section */}
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="section-icon">👥</span>
                            Members
                        </h2>
                        <span className="member-badge">{group.members?.length || 0}</span>
                    </div>

                    {group.members && group.members.length > 0 ? (
                        <div className="members-list">
                            {group.members.map((member, index) => (
                                <div key={member.userId} className="member-item" title={member.email}>
                                    <div className="member-left">
                                        <div
                                            className="member-avatar"
                                            style={{ background: getAvatarColor(index) }}
                                        >
                                            {getInitials(member.name)}
                                        </div>
                                        <div className="member-info">
                                            <div className="member-name">{member.name}</div>
                                            <div className="member-joined">
                                                <span style={{ marginRight: '0.5rem' }}>📅</span>
                                                {new Date(member.joinedDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="member-balance">
                                        <div className={`balance-value ${member.balance >= 0 ? 'positive' : 'negative'}`}>
                                            {member.balance >= 0 ? '+' : ''}₹{Math.abs(member.balance).toFixed(2)}
                                        </div>
                                        <div className={`balance-tag ${member.balance >= 0 ? 'positive' : 'negative'}`}>
                                            {member.balance > 0 ? '✓ is owed' : member.balance < 0 ? '⚠ owes' : '✓ settled'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-section">
                            <div className="empty-icon">👥</div>
                            <p>No members yet</p>
                        </div>
                    )}
                </div>

                {/* Expenses Section */}
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="section-icon">💸</span>
                            Recent Expenses
                        </h2>
                        <span className="member-badge">{group.expenses?.length || 0}</span>
                    </div>

                    {group.expenses && group.expenses.length > 0 ? (
                        <div className="expenses-list">
                            {group.expenses.slice(0, 10).map((expense) => (
                                <div key={expense.expenseId} className="expense-item">
                                    <div className="expense-icon">💳</div>
                                    <div className="expense-content">
                                        <div className="expense-description">
                                            {expense.description || 'No description'}
                                        </div>
                                        <div className="expense-meta">
                                            <span className="expense-date">
                                                📅 {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="expense-payer">
                                                👤 {expense.paidByUserName || expense.paidByUserEmail}
                                            </span>
                                            <span className="expense-category">
                                                {expense.categoryName}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="expense-amount">
                                        ₹{expense.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-section">
                            <div className="empty-icon">📭</div>
                            <p>No expenses yet</p>
                            <button className="btn-primary-outline" onClick={() => navigate('/dashboard')}>
                                Add First Expense
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-animate">
                        <div className="modal-header">
                            <h3>Add Member to {group.name}</h3>
                            <button className="modal-close" onClick={() => setShowAddMemberModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddMember}>
                            <div className="form-group">
                                <label>Member Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    placeholder="friend@example.com"
                                    required
                                    autoFocus
                                />
                                <p className="form-hint">
                                    ⚠️ The user must already have an account to be added.
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowAddMemberModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .group-details-page {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0;
                }

                .page-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 2rem;
                    border-radius: 0 0 24px 24px;
                    margin: -20px -20px 2rem -20px;
                    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
                }

                .btn-back {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    padding: 0.625rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    margin-bottom: 1.5rem;
                    transition: all 0.3s ease;
                }

                .btn-back:hover {
                    background: rgba(255,255,255,0.3);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .group-avatar-large {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    background: white;
                    color: #667eea;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.75rem;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                }

                .page-title {
                    color: white;
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .page-subtitle {
                    color: rgba(255,255,255,0.9);
                    margin: 0.5rem 0 0 0;
                }

                .btn-hero {
                    background: white;
                    color: #667eea;
                    padding: 0.875rem 1.75rem;
                    border-radius: 12px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                }

                .btn-hero:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    padding: 0 1rem;
                }

                .stat-box {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s ease;
                }

                .stat-box:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }

                .stat-icon-bg {
                    width: 60px;
                    height: 60px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                }

                .stat-members .stat-icon-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .stat-expenses .stat-icon-bg { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
                .stat-owed .stat-icon-bg { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
                .stat-owing .stat-icon-bg { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

                .stat-number {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    padding: 0 1rem 2rem 1rem;
                }

                @media (max-width: 1024px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .section-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #f3f4f6;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .section-icon {
                    font-size: 1.5rem;
                }

                .member-badge {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 0.375rem 0.875rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .members-list, .expenses-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .member-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem;
                    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
                    border-radius: 14px;
                    border: 1px solid #e5e7eb;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }

                .member-item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .member-item:hover {
                    background: linear-gradient(135deg, #fefefe 0%, #f3f4f6 100%);
                    transform: translateX(6px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                    border-color: #667eea;
                }

                .member-item:hover::before {
                    opacity: 1;
                }

                .member-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .member-avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: transform 0.3s ease;
                }

                .member-item:hover .member-avatar {
                    transform: scale(1.05);
                }

                .member-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .member-name {
                    font-weight: 600;
                    color: #1f2937;
                    font-size: 1.05rem;
                    margin-bottom: 0.25rem;
                }

                .member-joined {
                    font-size: 0.8125rem;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                }

                .member-balance {
                    text-align: right;
                }

                .balance-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .balance-value.positive { color: #10b981; }
                .balance-value.negative { color: #ef4444; }

                .balance-tag {
                    font-size: 0.75rem;
                    font-weight: 500;
                    padding: 0.25rem 0.625rem;
                    border-radius: 12px;
                    display: inline-block;
                }

                .balance-tag.positive {
                    background: #d1fae5;
                    color: #065f46;
                }

                .balance-tag.negative {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .expense-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
                    border-radius: 14px;
                    border: 1px solid #e5e7eb;
                    border-left: 4px solid #667eea;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .expense-item:hover {
                    background: linear-gradient(135deg, #fefefe 0%, #f3f4f6 100%);
                    transform: translateX(6px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                    border-left-width: 6px;
                }

                .expense-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .expense-content {
                    flex: 1;
                }

                .expense-description {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .expense-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    font-size: 0.8125rem;
                    color: #6b7280;
                }

                .expense-category {
                    background: #e0e7ff;
                    color: #4f46e5;
                    padding: 0.125rem 0.5rem;
                    border-radius: 6px;
                    font-weight: 500;
                }

                .expense-amount {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #667eea;
                    flex-shrink: 0;
                }

                .empty-section {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #6b7280;
                }

                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .btn-primary-outline {
                    background: transparent;
                    border: 2px solid #667eea;
                    color: #667eea;
                    padding: 0.625rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 1rem;
                }

                .btn-primary-outline:hover {
                    background: #667eea;
                    color: white;
                }

                .loading-container, .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    text-align: center;
                    padding: 2rem;
                }

                .error-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .spinner-large {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-content {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    max-width: 500px;
                    width: 100%;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }

                .modal-animate {
                    animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes modalSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #1f2937;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s;
                }

                .modal-close:hover {
                    color: #1f2937;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .form-input {
                    width: 100%;
                    padding: 0.875rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .form-hint {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-top: 0.5rem;
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }

                .btn-primary, .btn-secondary {
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                @media (max-width: 768px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }

                    .header-content {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .page-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default GroupDetailsPage;
