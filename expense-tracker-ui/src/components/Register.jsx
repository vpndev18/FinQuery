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
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    });

    const password = watch('password');

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);

        const result = await registerUser(data.name, data.email, data.password, data.confirmPassword);

        if (result.success) {
            alert('Registration successful! Please login.');
            navigate('/login');
        } else {
            setError(result.error);
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
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>Create Account</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Get started tracking your expenses today.</p>
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
                    <label htmlFor="name" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Full Name</label>
                    <input
                        id="name"
                        type="text"
                        style={inputStyle}
                        placeholder="Enter your full name"
                        {...register('name', {
                            required: 'Name is required',
                            minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        })}
                    />
                    {errors.name && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.name.message}</span>}
                </div>

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
                    <label htmlFor="password" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Password</label>
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
                    {errors.password && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.password.message}</span>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="confirmPassword" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        style={inputStyle}
                        placeholder="Confirm password"
                        {...register('confirmPassword', {
                            required: 'Please confirm password',
                            validate: value => value === password || 'The passwords do not match'
                        })}
                    />
                    {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.confirmPassword.message}</span>}
                </div>

                <button
                    type="submit"
                    className="btn"
                    style={{
                        width: '100%',
                        padding: '0.875rem',
                        fontSize: '1.1rem',
                        marginTop: '0.5rem',
                        backgroundColor: 'var(--secondary-color)',
                        color: 'white'
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
