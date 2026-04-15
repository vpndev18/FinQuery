import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createExpense, updateExpense, getCategories, getGroups, createGroupExpense } from '../services/api';

const ExpenseForm = ({ onSuccess, expense, categoryId: initialCategoryId }) => {
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [formError, setFormError] = useState(null);

    // Group Expense Toggles
    const [isGroupExpense, setIsGroupExpense] = useState(false);

    const isEditMode = !!expense;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue
    } = useForm({
        defaultValues: {
            amount: 0,
            description: '',
            categoryId: '',
            groupId: '',
            date: new Date().toISOString().split('T')[0],
        },
    });

    const watchedAmount = watch('amount');

    useEffect(() => {
        const loadData = async () => {
            setIsLoadingCategories(true);

            // Load Categories
            const catResult = await getCategories();
            if (catResult.success) {
                setCategories(catResult.data);
            } else {
                setFormError('Failed to load categories');
            }

            // Load Groups
            const groupResult = await getGroups();
            if (groupResult.success) {
                setGroups(groupResult.data);
            }

            setIsLoadingCategories(false);
        };

        loadData();
    }, []);

    useEffect(() => {
        if (expense) {
            // Pre-populate fields for edit mode
            setValue('amount', expense.amount);
            setValue('description', expense.description || '');
            setValue('categoryId', expense.categoryId);

            // If it's a group expense (assuming expense object has groupId)
            if (expense.groupId) {
                setIsGroupExpense(true);
                setValue('groupId', expense.groupId);
            }

            // Format date to YYYY-MM-DD
            const formattedDate = expense.date ? new Date(expense.date).toISOString().split('T')[0] : '';
            setValue('date', formattedDate);
        } else if (initialCategoryId) {
            setValue('categoryId', initialCategoryId);
        }
    }, [expense, initialCategoryId, setValue]);

    const onSubmit = async (data) => {
        setFormError(null);

        // Transform data
        const expenseData = {
            categoryId: data.categoryId,
            amount: parseFloat(data.amount),
            description: data.description || null,
            date: new Date(data.date).toISOString()
        };

        console.log('Submitting expense data:', expenseData);

        let result;

        if (isEditMode) {
            // Updating logic (Assuming endpoints handle group updates transparently or we block it)
            // For now, simple update
            result = await updateExpense(expense.expenseId, expenseData);
        } else {
            // Creation Logic
            if (isGroupExpense && data.groupId) {
                // Shared Expense
                const groupData = { ...expenseData, groupId: data.groupId };
                result = await createGroupExpense(groupData);
            } else {
                // Personal Expense
                result = await createExpense(expenseData);
            }
        }

        if (result.success) {
            if (!isEditMode) {
                reset({
                    amount: 0,
                    description: '',
                    categoryId: '',
                    groupId: '',
                    date: new Date().toISOString().split('T')[0],
                });
                setIsGroupExpense(false);
            }

            if (onSuccess) {
                onSuccess();
            }
        } else {
            setFormError(result.error || `Failed to ${isEditMode ? 'update' : 'create'} expense`);
        }
    };

    // Styles
    const containerStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };

    const formGroupStyle = { marginBottom: '1rem' };
    const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' };
    const inputStyle = { width: '100%', padding: '0.625rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem' };
    const errorTextStyle = { color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' };
    const buttonStyle = {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: isEditMode ? '#ffc107' : '#28a745',
        color: isEditMode ? '#000' : '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        opacity: isSubmitting ? 0.7 : 1,
    };

    const toggleLabelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        fontWeight: '500',
        color: '#4f46e5'
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', textAlign: 'center' }}>
                {isEditMode ? 'Edit Expense' : 'Add New Expense'}
            </h3>

            {watchedAmount > 0 && (
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#28a745', marginBottom: '1rem', textAlign: 'center' }}>
                    ₹ {parseFloat(watchedAmount).toFixed(2)}
                </div>
            )}

            {formError && (
                <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                    {formError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Group Expense Toggle */}
                {!isEditMode && groups.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                        <label style={toggleLabelStyle}>
                            <input
                                type="checkbox"
                                checked={isGroupExpense}
                                onChange={(e) => setIsGroupExpense(e.target.checked)}
                                style={{ width: '1.2rem', height: '1.2rem' }}
                            />
                            Split with a Group?
                        </label>

                        {isGroupExpense && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <select
                                    style={inputStyle}
                                    {...register('groupId', { required: isGroupExpense ? 'Select a group' : false })}
                                >
                                    <option value="">-- Select Group --</option>
                                    {groups.map(g => (
                                        <option key={g.groupId} value={g.groupId}>{g.name}</option>
                                    ))}
                                </select>
                                {errors.groupId && <span style={errorTextStyle}>{errors.groupId.message}</span>}
                                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>
                                    Cost will be split equally among all members.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div style={formGroupStyle}>
                    <label htmlFor="amount" style={labelStyle}>Amount (₹)</label>
                    <input
                        id="amount"
                        type="number"
                        step="0.01"
                        style={inputStyle}
                        placeholder="0.00"
                        {...register('amount', {
                            required: 'Amount is required and must be greater than 0',
                            min: { value: 0.01, message: 'Amount must be greater than 0' },
                            valueAsNumber: true,
                        })}
                    />
                    {errors.amount && <span style={errorTextStyle}>{errors.amount.message}</span>}
                </div>

                <div style={formGroupStyle}>
                    <label htmlFor="categoryId" style={labelStyle}>Category</label>
                    <select
                        id="categoryId"
                        style={inputStyle}
                        disabled={isLoadingCategories}
                        {...register('categoryId', {
                            required: 'Please select a category',
                        })}
                    >
                        <option value="">-- Select Category --</option>
                        {categories.map((cat) => (
                            <option key={cat.categoryId} value={cat.categoryId}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    {errors.categoryId && <span style={errorTextStyle}>{errors.categoryId.message}</span>}
                </div>

                <div style={formGroupStyle}>
                    <label htmlFor="date" style={labelStyle}>Date</label>
                    <input
                        id="date"
                        type="date"
                        style={inputStyle}
                        {...register('date', {
                            required: 'Please select a date',
                        })}
                    />
                    {errors.date && <span style={errorTextStyle}>{errors.date.message}</span>}
                </div>

                <div style={formGroupStyle}>
                    <label htmlFor="description" style={labelStyle}>Description (Optional)</label>
                    <input
                        id="description"
                        type="text"
                        style={inputStyle}
                        placeholder="What did you spend on?"
                        {...register('description', {
                            maxLength: {
                                value: 500,
                                message: 'Description cannot exceed 500 characters',
                            },
                        })}
                    />
                    {errors.description && <span style={errorTextStyle}>{errors.description.message}</span>}
                </div>

                <button type="submit" style={buttonStyle} disabled={isSubmitting || isLoadingCategories}>
                    {isSubmitting ? (
                        <span>Processing...</span>
                    ) : (
                        <span>{isEditMode ? 'Update Expense' : (isGroupExpense ? 'Add Group Expense' : 'Add Expense')}</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;
