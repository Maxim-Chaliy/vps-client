import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import freeIcon2 from "../img/FreeMathematics2.png";
import '../Components/style/authorization.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (!token) {
            setError('Недействительная ссылка для сброса пароля');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Пароль успешно изменен! Вы будете перенаправлены на страницу входа...');
                setTimeout(() => {
                    navigate('/authorization');
                }, 3000);
            } else {
                setError(data.error || 'Ошибка при сбросе пароля');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Ошибка соединения с сервером');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="auth-main-container">
                <div className='auth-container'>
                    <div className='auth-card'>
                        <div className='auth-header'>
                            <div className="auth-logo-container">
                                <img src={freeIcon2} alt="Easymath Logo" className="auth-logo" />
                                <div className="auth-title-container">
                                    <h1 className="auth-title">Сброс пароля</h1>
                                    <p className="auth-subtitle">Easymath</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className='auth-fields'>
                                <div className='auth-field-group'>
                                    <label className='auth-label'>Новый пароль*</label>
                                    <input
                                        className='auth-input'
                                        type="password"
                                        placeholder='Введите новый пароль (мин. 6 символов)'
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                </div>

                                <div className='auth-field-group'>
                                    <label className='auth-label'>Подтвердите пароль*</label>
                                    <input
                                        className='auth-input'
                                        type="password"
                                        placeholder='Повторите новый пароль'
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error-message">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="auth-success-message">
                                    {success}
                                </div>
                            )}

                            <div className='auth-submit-container'>
                                <button
                                    type="submit"
                                    className='auth-submit-button'
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span>Сброс пароля...</span>
                                    ) : (
                                        <span>Установить новый пароль</span>
                                    )}
                                </button>

                                <div className="auth-divider">
                                    <span className="auth-divider-text">или</span>
                                </div>

                                <Link to="/authorization" className="auth-register-link">
                                    <button
                                        className='auth-register-button'
                                        type="button"
                                    >
                                        Войти в аккаунт
                                    </button>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ResetPassword;
