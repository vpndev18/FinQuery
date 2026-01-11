import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createExpense, updateExpense, getCategories } from '../services/api';

const ExpenseForm = ({ onSuccess, expense, categoryId: initialCategoryId }) => {
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [formError, setFormError] = useState(null);

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
            date: new Date().toISOString().split('T')[0],
        },
    });

    const watchedAmount = watch('amount');

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            const result = await getCategories();
            if (result.success) {
                setCategories(result.data);
            } else {
                setFormError('Failed to load categories');
            }
            setIsLoadingCategories(false);
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (expense) {
            // Pre-populate fields for edit mode
            setValue('amount', expense.amount);
            setValue('description', expense.description || '');
            setValue('categoryId', expense.categoryId);
            // Format date to YYYY-MM-DD
            const formattedDate = expense.date ? new Date(expense.date).toISOString().split('T')[0] : '';
            setValue('date', formattedDate);
        } else if (initialCategoryId) {
            setValue('categoryId', initialCategoryId);
        }
    }, [expense, initialCategoryId, setValue]);

    const onSubmit = async (data) => {
        setFormError(null);

        // Transform data to match backend expectations
        const expenseData = {
            categoryId: data.categoryId, // Already a GUID string from the select
            amount: parseFloat(data.amount),
            description: data.description || null,
            date: new Date(data.date).toISOString() // Convert to ISO DateTime
        };

        console.log('Submitting expense data:', expenseData);

        let result;

        if (isEditMode) {
            result = await updateExpense(expense.expenseId, expenseData);
        } else {
            result = await createExpense(expenseData);
        }

        if (result.success) {
            if (!isEditMode) {
                reset({
                    amount: 0,
                    description: '',
                    categoryId: '',
                    date: new Date().toISOString().split('T')[0],
                });
            }

            // Show simple alert callback or console log as "toast" isn't strictly defined in env
            // Ideally this would be a toast notification library
            // alert(`Expense ${isEditMode ? 'updated' : 'created'} successfully`); 

            if (onSuccess) {
                onSuccess();
            }
        } else {
            setFormError(result.error || `Failed to ${isEditMode ? 'update' : 'create'} expense`);
        }
    };

    const containerStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };

    const formGroupStyle = {
        marginBottom: '1rem',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: '#333',
    };

    const inputStyle = {
        width: '100%',
        padding: '0.625rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        fontSize: '1rem',
    };

    const errorTextStyle = {
        color: '#dc3545',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
        display: 'block',
    };

    const buttonStyle = {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: isEditMode ? '#ffc107' : '#28a745', // Yellow for edit, Green for add
        color: isEditMode ? '#000' : '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        opacity: isSubmitting ? 0.7 : 1,
    };

    const amountDisplayStyle = {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#28a745',
        marginBottom: '1rem',
        textAlign: 'center',
        display: 'block',
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', textAlign: 'center' }}>
                {isEditMode ? 'Edit Expense' : 'Add New Expense'}
            </h3>

            {watchedAmount > 0 && (
                <div style={amountDisplayStyle}>
                    ₹ {parseFloat(watchedAmount).toFixed(2)}
                </div>
            )}

            {formError && (
                <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                    {formError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
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
                    {isLoadingCategories && <span style={{ fontSize: '0.8rem', color: '#666' }}>Loading categories...</span>}
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
                        <span>{isEditMode ? 'Update Expense' : 'Add Expense'}</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;
