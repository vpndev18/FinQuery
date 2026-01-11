import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', color: '#3498db' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const result = await getCategories();
        if (result.success) {
            setCategories(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        let result;
        if (editingId) {
            result = await updateCategory(editingId, formData.name, formData.color);
        } else {
            result = await createCategory(formData.name, formData.color);
        }

        if (result.success) {
            setFormData({ name: '', color: '#3498db' });
            setEditingId(null);
            fetchCategories();
        } else {
            setError(result.error);
        }
    };

    const handleEdit = (category) => {
        setFormData({ name: category.name, color: category.color || '#3498db' });
        setEditingId(category.categoryId);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            const result = await deleteCategory(id);
            if (result.success) {
                fetchCategories();
            } else {
                setError(result.error);
            }
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', color: '#3498db' });
        setEditingId(null);
        setError(null);
    };

    const containerStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };

    const formStyle = {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'end',
    };

    const inputStyle = {
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1rem',
    };

    const buttonStyle = {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
    };

    const categoryItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        marginBottom: '0.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #e9ecef',
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ marginTop: 0 }}>Manage Categories</h3>

            {error && (
                <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={formStyle}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Category Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Food, Transport"
                        required
                        style={{ ...inputStyle, width: '100%' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Color</label>
                    <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        style={{ ...inputStyle, width: '60px', height: '38px', cursor: 'pointer' }}
                    />
                </div>

                <button
                    type="submit"
                    style={{ ...buttonStyle, backgroundColor: editingId ? '#ffc107' : '#28a745', color: editingId ? '#000' : 'white' }}
                >
                    {editingId ? 'Update' : 'Add'} Category
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{ ...buttonStyle, backgroundColor: '#6c757d', color: 'white' }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <div>
                <h4>Existing Categories</h4>
                {loading ? (
                    <p>Loading categories...</p>
                ) : categories.length === 0 ? (
                    <p style={{ color: '#666' }}>No categories yet. Add one above!</p>
                ) : (
                    categories.map((category) => (
                        <div key={category.categoryId} style={categoryItemStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        backgroundColor: category.color || '#ccc',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                    }}
                                />
                                <span style={{ fontWeight: '500' }}>{category.name}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleEdit(category)}
                                    style={{ ...buttonStyle, backgroundColor: '#ffc107', color: '#000', padding: '0.25rem 0.75rem' }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category.categoryId)}
                                    style={{ ...buttonStyle, backgroundColor: '#dc3545', color: 'white', padding: '0.25rem 0.75rem' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CategoryManager;
