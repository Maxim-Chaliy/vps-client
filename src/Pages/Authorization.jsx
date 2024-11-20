import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import '../Components/style/authorization.css';

const Authorization = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                alert('Авторизация прошла успешно');
                navigate('/'); // Перенаправление на главную страницу после успешной авторизации
                window.location.reload(); // Перезагрузка страницы для обновления состояния в Header
            } else {
                alert('Ошибка при авторизации');
            }
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            alert('Ошибка при отправке данных');
        }
    };

    return (
        <>
            <Header />
            <main className="box-2-1">
                <div className="conteiner">
                    <div className="form-enter">
                        <div className="h-logo-text-enter">
                            <div className="logo-text-flex">
                                {/* <div className=""><img className="img-logo" src="assets/img/free-icon-mathematics-symbol-2117721 1.png" alt=""></div> */}
                                <div><p className="text-logo-easymath">Easymath</p></div>
                            </div>
                            <div className="block-h-text-enter"><p className="h-text-enter">Авторизация</p></div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label className="login" htmlFor="username">Логин</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required />

                            <label className="password" htmlFor="password">Пароль</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                            <a href="#" style={{ color: 'black', margin: 'auto', marginTop: '10px' }}><p>Не помню пароль</p></a>

                            <div className="section-button">
                                <button className="button-enter-in-acc" type="submit">Войти</button>
                                <Link className="link-registration" to="/registration"><button className="button-register-in-acc">Регистрация</button></Link>
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
