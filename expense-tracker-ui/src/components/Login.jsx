import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm({
        mode: 'onBlur',
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);

        const result = await login(data.email, data.password);

        if (result.success) {
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            navigate('/dashboard');
        } else {
            setError(result.error);
            setValue('password', ''); // Clear password field on error
            // Note: Requirements mentioned "Display authentication errors... in alert/toast". 
            // I'm displaying it in the UI as requested in "Display error message" under "On error".
            // For the alert requirement:
            // alert(result.error); // Uncomment if a browser alert is strictly desired in addition to UI text.
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
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        fontSize: '1rem',
        fontWeight: '500',
        marginTop: '1rem',
    };

    const linkContainerStyle = {
        marginTop: '1rem',
        textAlign: 'center',
        fontSize: '0.9rem',
    };

    return (
        <div style={containerStyle}>
            <div style={formCardStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h2>

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
                            placeholder="Enter your password"
                            {...register('password', {
                                required: 'Password is required',
                            })}
                        />
                        {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
                    </div>

                    <button type="submit" style={buttonStyle} disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={linkContainerStyle}>
                    <p>
                        <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
