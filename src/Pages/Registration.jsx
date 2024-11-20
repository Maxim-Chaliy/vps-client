import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
// import freeicon from "../img/FreeMathematics2";
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
        if (formData.password !== formData.repeatpassword) {
            alert('Пароли не совпадают');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Регистрация прошла успешно');
                navigate('/authorization'); // Перенаправление на страницу входа после успешной регистрации
            } else {
                alert('Ошибка при регистрации');
            }
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            alert('Ошибка при отправке данных');
        }
    };

    return (
        <>
            <Header />
            <main>
                <div className="conteiner">
                    <div className="form-enter">
                        <div className="h-logo-text-enter">
                            <div className="logo-text-flex">
                                {/* <div className=""><img className="img-logo" src={freeicon} alt="" /></div> */}
                                <div><p className="text-logo-easymath">Easymath</p></div>
                            </div>
                            <div className="block-h-text-enter"><p className="h-text-enter">Регистрация</p></div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label className="login" htmlFor="name">Имя</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />

                            <label className="login" htmlFor="surname">Фамилия</label>
                            <input type="text" name="surname" value={formData.surname} onChange={handleChange} required />

                            <label className="login" htmlFor="patronymic">Отчество</label>
                            <input type="text" name="patronymic" value={formData.patronymic} onChange={handleChange} required />

                            <label className="login" htmlFor="email">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />

                            <label className="login" htmlFor="username">Логин</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required />

                            <label className="password" htmlFor="password">Пароль</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />

                            <label className="login" htmlFor="repeatpassword">Повторить пароль</label>
                            <input type="password" name="repeatpassword" value={formData.repeatpassword} onChange={handleChange} required />

                            <div className="section-button">
                                <button className="button-register-in-acc-1" type="submit">Зарегистриваться</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default Registration;
