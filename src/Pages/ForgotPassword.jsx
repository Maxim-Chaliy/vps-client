import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import freeIcon2 from "../img/FreeMathematics2.png";
import ReCAPTCHA from "react-google-recaptcha";
import '../Components/style/authorization.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (!email) {
            setError('Пожалуйста, введите ваш email');
            setIsLoading(false);
            return;
        }

        if (!recaptchaToken) {
            setError('Пожалуйста, подтвердите, что вы не робот');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    recaptchaToken
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Ссылка для сброса пароля отправлена на ваш email');
            } else {
                setError(data.error || 'Ошибка при отправке запроса');
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
                                    <h1 className="auth-title">Восстановление пароля</h1>
                                    <p className="auth-subtitle">Easymath</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className='auth-fields'>
                                <div className='auth-field-group'>
                                    <label className='auth-label'>Email*</label>
                                    <input
                                        className='auth-input'
                                        type="email"
                                        placeholder='Введите ваш email'
                                        value={email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className='auth-field-group'>
                                    <ReCAPTCHA
                                        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                        onChange={handleRecaptchaChange}
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
                                        <span>Отправка...</span>
                                    ) : (
                                        <span>Отправить ссылку</span>
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

export default ForgotPassword;
