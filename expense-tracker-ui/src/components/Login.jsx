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
            setValue('password', '');
        }

        setIsLoading(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        boxSizing: 'border-box',
        fontSize: '1rem',
        marginTop: '0.5rem',
        transition: 'border-color 0.2s',
        outline: 'none'
    };

    return (
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please enter your details to sign in.</p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    border: '1px solid #fecaca'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="email" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Email Address</label>
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
                    {errors.email && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.email.message}</span>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label htmlFor="password" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Password</label>
                        <Link to="/forgot-password" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        style={inputStyle}
                        placeholder="Enter your password"
                        {...register('password', {
                            required: 'Password is required',
                        })}
                    />
                    {errors.password && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.password.message}</span>}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.875rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Sign In'}
                </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
