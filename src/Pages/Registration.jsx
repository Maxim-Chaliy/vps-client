import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import freeIcon2 from "../img/FreeMathematics2.png";
import ReCAPTCHA from "react-google-recaptcha";
import "../Components/style/registration.css";

const Registration = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        patronymic: '',
        email: '',
        username: '',
        password: '',
        repeatpassword: ''
    });
    const [errors, setErrors] = useState({});
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const recaptchaRef = useRef();
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
            case 'surname':
            case 'patronymic':
                if (value && !/^[а-яА-ЯёЁa-zA-Z\-]+$/.test(value)) {
                    error = 'Только буквы и дефисы';
                }
                break;
            case 'email':
                if (!value) {
                    error = 'Обязательное поле';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Некорректный email';
                }
                break;
            case 'username':
                if (!value) error = 'Обязательное поле';
                else if (value.length < 3) error = 'Минимум 3 символа';
                else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Только буквы, цифры и _';
                break;
            case 'password':
                if (!value) error = 'Обязательное поле';
                else if (value.length < 6) error = 'Минимум 6 символов';
                break;
            case 'repeatpassword':
                if (value !== formData.password) error = 'Пароли не совпадают';
                break;
            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        setSubmitError('');
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
        setErrors(prev => ({
            ...prev,
            recaptcha: ''
        }));
        setSubmitError('');
    };

    const resetRecaptcha = () => {
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
    };

    useEffect(() => {
        if (submitError) {
            const timer = setTimeout(() => {
                setSubmitError('');
                resetRecaptcha();
            }, 3000); // 3 секунды

            return () => clearTimeout(timer);
        }
    }, [submitError]);

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        const requiredFields = ['name', 'surname', 'email', 'username', 'password', 'repeatpassword'];
        requiredFields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        if (!recaptchaToken) {
            newErrors.recaptcha = 'Подтвердите, что вы не робот';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const hasErrors = () => {
        return Object.values(errors).some(error => error) || !recaptchaToken;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSubmitError('');

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    patronymic: formData.patronymic,
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                    recaptchaToken
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    setSubmitError(data.error || 'Ошибка при регистрации');
                } else {
                    throw new Error(data.message || `Ошибка сервера: ${response.status}`);
                }
            } else {
                alert('Регистрация прошла успешно! Ссылка для подтверждения отправлена на ваш email.');
                navigate('/authorization');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setSubmitError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="reg-main-container">
                <div className='reg-container'>
                    <div className='reg-card'>
                        <div className='reg-header'>
                            <div className="reg-logo-container">
                                <img src={freeIcon2} alt="Easymath Logo" className="reg-logo" />
                                <div className="reg-title-container">
                                    <h1 className="reg-title">Регистрация</h1>
                                    <p className="reg-subtitle">Easymath</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="reg-form" noValidate>
                            <div className='reg-fields'>
                                <div className='reg-field-group'>
                                    <label className='reg-label'>Имя*</label>
                                    <input
                                        className={`reg-input ${errors.name ? 'input-error' : ''}`}
                                        type="text"
                                        placeholder='Введите ваше имя'
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.name && <span className="field-error">{errors.name}</span>}
                                </div>

                                <div className='reg-field-group'>
                                    <label className='reg-label'>Фамилия*</label>
                                    <input
                                        className={`reg-input ${errors.surname ? 'input-error' : ''}`}
                                        type="text"
                                        placeholder='Введите вашу фамилию'
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.surname && <span className="field-error">{errors.surname}</span>}
                                </div>

                                <div className='reg-field-group'>
                                    <label className='reg-label'>Отчество</label>
                                    <input
                                        className='reg-input'
                                        type="text"
                                        placeholder='Введите ваше отчество'
                                        name="patronymic"
                                        value={formData.patronymic}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='reg-field-group'>
                                    <label className='reg-label'>Email*</label>
                                    <input
                                        className={`reg-input ${errors.email ? 'input-error' : ''}`}
                                        type="email"
                                        placeholder='example@mail.com'
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email && <span className="field-error">{errors.email}</span>}
                                </div>

                                <div className='reg-field-group'>
                                    <label className='reg-label'>Логин*</label>
                                    <input
                                        className={`reg-input ${errors.username ? 'input-error' : ''}`}
                                        type="text"
                                        placeholder='Придумайте логин'
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.username && <span className="field-error">{errors.username}</span>}
                                </div>

                                <div className='reg-field-group'>
                                    <label className='reg-label'>Пароль*</label>
                                    <input
                                        className={`reg-input ${errors.password ? 'input-error' : ''}`}
                                        type="password"
                                        placeholder='Придумайте пароль'
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.password && <span className="field-error">{errors.password}</span>}
                                </div>

                                <div className='reg-field-group'>
                                    <label className='reg-label'>Повторите пароль*</label>
                                    <input
                                        className={`reg-input ${errors.repeatpassword ? 'input-error' : ''}`}
                                        type="password"
                                        placeholder='Повторите пароль'
                                        name="repeatpassword"
                                        value={formData.repeatpassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.repeatpassword && <span className="field-error">{errors.repeatpassword}</span>}
                                </div>

                                <div className='reg-field-group'>
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                        onChange={handleRecaptchaChange}
                                    />
                                    {errors.recaptcha && <span className="field-error">{errors.recaptcha}</span>}
                                </div>
                            </div>

                            {submitError && (
                                <div className="reg-error-message">
                                    {submitError}
                                </div>
                            )}

                            <div className='reg-submit-container'>
                                <button
                                    type="submit"
                                    className='reg-submit-button'
                                    disabled={isLoading || hasErrors()}
                                >
                                    {isLoading ? (
                                        <span className="loading-text">Регистрация...</span>
                                    ) : (
                                        <span>Зарегистрироваться</span>
                                    )}
                                </button>

                                <div className="reg-login-link">
                                    Уже есть аккаунт? <Link to="/authorization" className="reg-login-link-text">Войти</Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Registration;
