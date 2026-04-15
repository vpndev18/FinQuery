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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This might affect existing expenses.')) {
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

    return (
        <div>
            {/* Form Section */}
            <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--secondary-color)' }}>
                <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Category' : 'Create New Category'}</h3>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        border: '1px solid #fecaca'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'end' }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Food, Transport"
                            required
                            style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                width: '100%',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Color Tag</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                style={{ width: '50px', height: '45px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{formData.color}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ backgroundColor: editingId ? 'var(--accent-color)' : 'var(--secondary-color)' }}
                        >
                            {editingId ? 'Update Category' : 'Add Category'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div>
                <h3 style={{ marginBottom: '1.5rem' }}>Your Categories</h3>
                {loading ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Loading categories...</p>
                ) : categories.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>No categories found.</p>
                    </div>
                ) : (
                    <div className="grid-view" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                        {categories.map((category) => (
                            <div key={category.categoryId} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: category.color || '#ccc',
                                            borderRadius: '8px',
                                            flexShrink: 0
                                        }}
                                    />
                                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{category.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, fontSize: '0.85rem' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.categoryId)}
                                        className="btn"
                                        style={{ flex: 1, backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '0.85rem' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryManager;
