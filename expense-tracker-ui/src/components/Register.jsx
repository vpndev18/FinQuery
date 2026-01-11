import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerUser } from '../services/api';

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm({
        mode: 'onBlur',
        defaultValues: { email: '', password: '', confirmPassword: '' },
    });

    const password = watch('password');

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);

        const result = await registerUser(data.email, data.password, data.confirmPassword);

        if (result.success) {
            alert('Registration successful! Please login.');
            navigate('/login');
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    };

    const formCardStyle = {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
    };

    const inputGroupStyle = {
        marginBottom: '1rem',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
    };

    const errorStyle = {
        color: '#dc3545',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
        display: 'block',
    };

    const buttonStyle = {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        fontSize: '1rem',
        fontWeight: '500',
        marginTop: '1rem',
    };

    return (
        <div style={containerStyle}>
            <div style={formCardStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>

                {error && (
                    <div style={{ ...errorStyle, backgroundColor: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={inputGroupStyle}>
                        <label htmlFor="email" style={labelStyle}>Email</label>
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
                        {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
                    </div>

                    <div style={inputGroupStyle}>
                        <label htmlFor="password" style={labelStyle}>Password</label>
                        <input
                            id="password"
                            type="password"
                            style={inputStyle}
                            placeholder="Create password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                                pattern: {
                                    value: /^(?=.*[A-Z])(?=.*\d)/,
                                    message: 'Password must contain at least one uppercase letter and one number'
                                }
                            })}
                        />
                        {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
                    </div>

                    <div style={inputGroupStyle}>
                        <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            style={inputStyle}
                            placeholder="Confirm password"
                            {...register('confirmPassword', {
                                required: 'Please confirm description',
                                validate: value => value === password || 'The passwords do not match'
                            })}
                        />
                        {errors.confirmPassword && <span style={errorStyle}>{errors.confirmPassword.message}</span>}
                    </div>

                    <button type="submit" style={buttonStyle} disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
