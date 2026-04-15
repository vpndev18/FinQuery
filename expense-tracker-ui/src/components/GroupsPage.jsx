import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroups, createGroup } from '../services/api';

const GroupsPage = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        setLoading(true);
        const result = await getGroups();
        if (result.success) {
            setGroups(result.data);
        }
        setLoading(false);
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        const result = await createGroup(newGroupName);
        if (result.success) {
            setNewGroupName('');
            setShowCreateModal(false);
            loadGroups();
        } else {
            alert('Failed to create group: ' + result.error);
        }
    };

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || '??';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-large"></div>
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading groups...</p>
            </div>
        );
    }

    return (
        <div className="groups-page">
            {/* Hero Header */}
            <div className="groups-hero">
                <div className="hero-content">
                    <div>
                        <h1 className="hero-title">My Groups</h1>
                        <p className="hero-subtitle">Manage shared expenses with friends and family</p>
                    </div>
                    <button className="btn-hero" onClick={() => setShowCreateModal(true)}>
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>+</span>
                        Create New Group
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="stats-bar">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        👥
                    </div>
                    <div>
                        <div className="stat-value">{groups.length}</div>
                        <div className="stat-label">Total Groups</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        💰
                    </div>
                    <div>
                        <div className="stat-value">
                            {groups.reduce((sum, g) => sum + Math.abs(g.myBalance), 0).toFixed(0)}
                        </div>
                        <div className="stat-label">Total Exposure</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        📊
                    </div>
                    <div>
                        <div className="stat-value">
                            {groups.filter(g => g.myBalance > 0).length}
                        </div>
                        <div className="stat-label">You're Owed</div>
                    </div>
                </div>
            </div>

            {/* Groups Grid */}
            {groups.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎉</div>
                    <h3>No Groups Yet</h3>
                    <p>Create your first group to start splitting expenses with friends!</p>
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        Create Your First Group
                    </button>
                </div>
            ) : (
                <div className="groups-grid">
                    {groups.map(group => (
                        <div
                            key={group.groupId}
                            className="group-card"
                            onClick={() => navigate(`/groups/${group.groupId}`)}
                        >
                            <div className="group-card-header">
                                <div className="group-avatar">{getInitials(group.name)}</div>
                                <div className="group-info">
                                    <h3 className="group-name">{group.name}</h3>
                                    <div className="group-meta">
                                        <span className="member-count">
                                            <span style={{ marginRight: '0.25rem' }}>👤</span>
                                            {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="group-balance-section">
                                <div className="balance-label">Your Balance</div>
                                <div className={`balance-amount ${group.myBalance >= 0 ? 'positive' : 'negative'}`}>
                                    {group.myBalance >= 0 ? '+' : ''}₹{group.myBalance.toFixed(2)}
                                </div>
                                <div className={`balance-status ${group.myBalance >= 0 ? 'positive' : 'negative'}`}>
                                    {group.myBalance > 0
                                        ? '✓ You are owed'
                                        : group.myBalance < 0
                                            ? '⚠ You owe'
                                            : '✓ Settled up'}
                                </div>
                            </div>

                            <div className="group-card-footer">
                                <button className="btn-view-details">
                                    View Details →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-animate">
                        <div className="modal-header">
                            <h3>Create New Group</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateGroup}>
                            <div className="form-group">
                                <label>Group Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="e.g., Weekend Trip, Roommates, Office Lunch"
                                    required
                                    autoFocus
                                />
                                <p className="form-hint">Choose a memorable name for your expense group</p>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .groups-page {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0;
                }

                .groups-hero {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 3rem 2rem;
                    border-radius: 0 0 24px 24px;
                    margin: -20px -20px 2rem -20px;
                    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
                }

                .hero-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .hero-title {
                    color: white;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .hero-subtitle {
                    color: rgba(255,255,255,0.9);
                    font-size: 1.1rem;
                    margin: 0.5rem 0 0 0;
                }

                .btn-hero {
                    background: white;
                    color: #667eea;
                    padding: 0.875rem 1.75rem;
                    border-radius: 12px;
                    border: none;
                    font-weight: 600;
                    font-size: 1rem;
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

                .stats-bar {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    padding: 0 1rem;
                }

                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }

                .stat-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    flex-shrink: 0;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                }

                .groups-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                    padding: 0 1rem 2rem 1rem;
                }

                .group-card {
                    background: white;
                    border-radius: 20px;
                    padding: 1.75rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .group-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                }

                .group-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
                }

                .group-card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .group-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .group-info {
                    flex: 1;
                }

                .group-name {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 0.25rem 0;
                }

                .group-meta {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.875rem;
                    color: #6b7280;
                }

                .member-count {
                    display: flex;
                    align-items: center;
                }

                .group-balance-section {
                    background: #f9fafb;
                    padding: 1.25rem;
                    border-radius: 12px;
                    margin-bottom: 1.25rem;
                    text-align: center;
                }

                .balance-label {
                    font-size: 0.75rem;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                }

                .balance-amount {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .balance-amount.positive {
                    color: #10b981;
                }

                .balance-amount.negative {
                    color: #ef4444;
                }

                .balance-status {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .balance-status.positive {
                    color: #10b981;
                }

                .balance-status.negative {
                    color: #ef4444;
                }

                .group-card-footer {
                    text-align: center;
                }

                .btn-view-details {
                    width: 100%;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-view-details:hover {
                    opacity: 0.9;
                    transform: scale(1.02);
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 20px;
                    margin: 2rem 1rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .empty-state p {
                    color: #6b7280;
                    margin-bottom: 2rem;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
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
                    .hero-content {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .hero-title {
                        font-size: 2rem;
                    }

                    .groups-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-bar {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default GroupsPage;
