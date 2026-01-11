import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({ mode: 'onBlur' });

    const onSubmit = (data) => {
        // We don't have an API endpoint for this yet, so we mock the success
        // In a real app: await api.forgotPassword(data.email);
        console.log('Forgot password for:', data.email);
        setIsSubmitted(true);
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    };

    const cardStyle = {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        marginBottom: '1rem',
        marginTop: '0.5rem'
    };

    const buttonStyle = {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#ffc107',
        color: '#000',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ marginBottom: '1rem' }}>Reset Password</h2>

                {!isSubmitted ? (
                    <>
                        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div style={{ textAlign: 'left' }}>
                                <label htmlFor="email" style={{ fontWeight: '500' }}>Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    style={inputStyle}
                                    placeholder="Enter your email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                />
                                {errors.email && <span style={{ color: '#dc3545', fontSize: '0.875rem', display: 'block', marginBottom: '1rem' }}>{errors.email.message}</span>}
                            </div>

                            <button type="submit" style={buttonStyle}>Send Reset Link</button>
                        </form>
                    </>
                ) : (
                    <div style={{ padding: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                        <p><strong>Check your email</strong></p>
                        <p style={{ fontSize: '0.9rem' }}>If an account exists for that email, we have sent password reset instructions.</p>
                    </div>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                    <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9rem' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
