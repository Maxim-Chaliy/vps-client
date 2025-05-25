import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import "../Components/style/appform.css";
import freeIcon2 from "../img/FreeMathematics2.png";
import InputMask from 'react-input-mask';
import ReCAPTCHA from "react-google-recaptcha";

const ApplicationForm = () => {
    const [charCount, setCharCount] = useState(0);
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        middleName: '',
        email: '',
        phone: '',
        startTime: '',
        endTime: '',
        classNumber: '',
        purpose: 'Повышение успеваемости',
        additionalInfo: ''
    });
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const recaptchaRef = useRef();

    const handleTextareaChange = (event) => {
        const text = event.target.value;
        setCharCount(text.length);
        setFormData({
            ...formData,
            additionalInfo: text
        });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
        setSubmitError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        // Валидация обязательных полей
        if (!formData.lastName || !formData.firstName || !formData.email || !formData.phone) {
            setSubmitError('Пожалуйста, заполните все обязательные поля');
            setIsSubmitting(false);
            return;
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setSubmitError('Пожалуйста, введите корректный email');
            setIsSubmitting(false);
            return;
        }

        // Валидация телефона
        const cleanedPhone = formData.phone.replace(/[^+\d]/g, '');
        if (cleanedPhone.length !== 12 || !cleanedPhone.startsWith('+7')) {
            setSubmitError('Пожалуйста, введите корректный номер телефона в формате +7XXXXXXXXXX');
            setIsSubmitting(false);
            return;
        }

        // Проверка reCAPTCHA
        if (!recaptchaToken) {
            setSubmitError('Пожалуйста, подтвердите, что вы не робот');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`/api/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    phone: cleanedPhone,
                    recaptchaToken
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка при отправке заявки');
            }

            // Сброс формы после успешной отправки
            setFormData({
                lastName: '',
                firstName: '',
                middleName: '',
                email: '',
                phone: '',
                startTime: '',
                endTime: '',
                classNumber: '',
                purpose: 'Повышение успеваемости',
                additionalInfo: ''
            });
            setCharCount(0);
            recaptchaRef.current.reset();
            setRecaptchaToken(null);

            alert('Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
        } catch (error) {
            console.error('Ошибка отправки заявки:', error);
            setSubmitError(error.message || 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
            recaptchaRef.current.reset();
            setRecaptchaToken(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Форма заявки на курсы подготовки к ЕГЭ</title>
                <meta name="description" content="Заполните форму заявки для записи на курсы подготовки к ЕГЭ. Мы свяжемся с вами в ближайшее время." />
                <meta name="keywords" content="ЕГЭ, подготовка, курсы, заявка, форма" />
                <meta property="og:title" content="Форма заявки на курсы подготовки к ЕГЭ" />
                <meta property="og:description" content="Заполните форму заявки для записи на курсы подготовки к ЕГЭ. Мы свяжемся с вами в ближайшее время." />
                <meta property="og:image" content="https://easymath-online.ru/path-to-your-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Форма заявки на курсы подготовки к ЕГЭ" />
                <meta name="twitter:description" content="Заполните форму заявки для записи на курсы подготовки к ЕГЭ. Мы свяжемся с вами в ближайшее время." />
                <meta name="twitter:image" content="https://easymath-online.ru/path-to-your-image.jpg" />
                <script type="application/ld+json">
                    {`
                        {
                            "@context": "https://schema.org",
                            "@type": "WebPage",
                            "name": "Форма заявки на курсы подготовки к ЕГЭ",
                            "description": "Заполните форму заявки для записи на курсы подготовки к ЕГЭ. Мы свяжемся с вами в ближайшее время.",
                            "url": "https://easymath-online.ru/appform"
                        }
                    `}
                </script>
            </Helmet>
            <Header />
            <main className="appform-main-container">
                <div className='appform-container'>
                    <div className='appform-card'>
                        <div className='appform-header'>
                            <div className="appform-logo-container">
                                <img src={freeIcon2} alt="Easymath Logo" className="appform-logo" />
                                <div className="appform-title-container">
                                    <h1 className="appform-title">Форма заявки</h1>
                                    <p className="appform-subtitle">Easymath</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="appform-form">
                            <div className='appform-fields'>
                                <div className='appform-field-group'>
                                    <label className='appform-label'>Фамилия*</label>
                                    <input
                                        className='appform-input'
                                        type="text"
                                        placeholder='Введите вашу фамилию'
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className='appform-field-group'>
                                    <label className='appform-label'>Имя*</label>
                                    <input
                                        className='appform-input'
                                        type="text"
                                        placeholder='Введите ваше имя'
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className='appform-field-group'>
                                    <label className='appform-label'>Отчество</label>
                                    <input
                                        className='appform-input'
                                        type="text"
                                        placeholder='Введите ваше отчество'
                                        name="middleName"
                                        value={formData.middleName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className='appform-field-group'>
                                    <label className='appform-label'>Email*</label>
                                    <input
                                        className='appform-input'
                                        type="email"
                                        placeholder='example@mail.com'
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className='appform-field-group'>
                                    <label className='appform-label'>Номер телефона*</label>
                                    <InputMask
                                        mask="+7 (999) 999-99-99"
                                        className='appform-input'
                                        type="tel"
                                        placeholder='+7 (___) ___-__-__'
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className='appform-field-group'>
                                    <label className='appform-label'>Удобное время занятий (По МСК)</label>
                                    <div className='appform-time-group'>
                                        <input
                                            className='appform-time-input'
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                        />
                                        <span className="appform-time-separator">—</span>
                                        <input
                                            className='appform-time-input'
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className='appform-field-group'>
                                    <label className='appform-label'>Цель занятий</label>
                                    <select
                                        className='appform-select'
                                        name="purpose"
                                        value={formData.purpose}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Подготовка к экзамену">Подготовка к экзамену</option>
                                        <option value="Повышение успеваемости">Повышение успеваемости</option>
                                        <option value="Изучение языка с нуля">Изучение языка с нуля</option>
                                    </select>
                                </div>

                                <div className='appform-field-group'>
                                    <label className='appform-label'>Дополнительная информация</label>
                                    <textarea
                                        className='appform-textarea'
                                        name="additionalInfo"
                                        value={formData.additionalInfo}
                                        onChange={handleTextareaChange}
                                        maxLength={255}
                                        placeholder='Введите дополнительную информацию...'
                                    ></textarea>
                                    <div className='appform-char-counter'>
                                        {charCount}/255
                                    </div>
                                </div>

                                <div className='appform-field-group'>
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                        onChange={handleRecaptchaChange}
                                    />
                                </div>
                            </div>

                            {submitError && (
                                <div className="appform-error-message">
                                    {submitError}
                                </div>
                            )}

                            <div className='appform-submit-container'>
                                <button
                                    type="submit"
                                    className='appform-submit-button'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span>Отправка...</span>
                                    ) : (
                                        <span>Отправить заявку</span>
                                    )}
                                </button>
                                <p className="appform-required-note">* Обязательные поля для заполнения</p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ApplicationForm;
