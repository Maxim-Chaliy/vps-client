import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import freeIcon2 from "../img/FreeMathematics2.png";
import ReCAPTCHA from "react-google-recaptcha";
import '../Components/style/authorization.css';

const Authorization = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const recaptchaRef = useRef();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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
    
        // Валидация обязательных полей
        if (!formData.username || !formData.password) {
            setError('Пожалуйста, заполните все поля');
            setIsLoading(false);
            return;
        }
    
        // Проверка reCAPTCHA
        if (!recaptchaToken) {
            setError('Пожалуйста, подтвердите, что вы не робот');
            setIsLoading(false);
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    recaptchaToken
                })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('studentId', data.user.id); // Сохранение studentId
                localStorage.setItem('role', data.user.role); // Сохранение роли пользователя
    
                if (data.user.role === 'admin') {
                    navigate('/controlpanel');
                } else {
                    navigate('/');
                }
                window.location.reload();
            } else {
                setError(data.message || 'Ошибка при авторизации');
                recaptchaRef.current.reset();
                setRecaptchaToken(null);
            }
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            setError('Ошибка соединения с сервером');
            recaptchaRef.current.reset();
            setRecaptchaToken(null);
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
                                    <h1 className="auth-title">Авторизация</h1>
                                    <p className="auth-subtitle">Easymath</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className='auth-fields'>
                                <div className='auth-field-group'>
                                    <label className='auth-label'>Логин или Email*</label>
                                    <input
                                        className='auth-input'
                                        type="text"
                                        placeholder='Введите ваш логин или email'
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className='auth-field-group'>
                                    <label className='auth-label'>Пароль*</label>
                                    <input
                                        className='auth-input'
                                        type="password"
                                        placeholder='Введите ваш пароль'
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <div className="auth-forgot-password">
                                        <Link to="/forgot-password" className="auth-forgot-link">Забыли пароль?</Link>
                                    </div>
                                </div>

                                <div className='auth-field-group'>
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
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

                            <div className='auth-submit-container'>
                                <button
                                    type="submit"
                                    className='auth-submit-button'
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span>Вход...</span>
                                    ) : (
                                        <span>Войти</span>
                                    )}
                                </button>

                                <div className="auth-divider">
                                    <span className="auth-divider-text">или</span>
                                </div>

                                <Link to="/registration" className="auth-register-link">
                                    <button
                                        className='auth-register-button'
                                        type="button"
                                    >
                                        Зарегистрироваться
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

export default Authorization;
