import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import UserInfo from "../Components/UserInfo";
import ScheduleEditor from "../Components/ScheduleEditor";
import "../Components/style/config.css";
import "../Components/style/editing.css";
import iconUsers from "../img/user.png";
import iconGraduation from "../img/graduation.png";
import iconEducation from "../img/education.png";

const Editing = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeImage, setActiveImage] = useState(1); // Устанавливаем начальное значение для первой иконки
    const [selectedUser, setSelectedUser] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [activeComponent, setActiveComponent] = useState('UserInfo'); // Устанавливаем начальное значение для компонента
    const [sectionTitle, setSectionTitle] = useState("Пользователи"); // Устанавливаем начальное значение для названия раздела

    useEffect(() => {
        // Восстановление состояния из localStorage при монтировании компонента
        const savedActiveImage = localStorage.getItem('activeImage');
        const savedSearchQuery = localStorage.getItem('searchQuery');
        const savedSelectedUser = localStorage.getItem('selectedUser');
        const savedSchedule = localStorage.getItem('schedule');
        const savedActiveComponent = localStorage.getItem('activeComponent');
        const savedSectionTitle = localStorage.getItem('sectionTitle');

        if (savedActiveImage) setActiveImage(JSON.parse(savedActiveImage));
        if (savedSearchQuery) setSearchQuery(savedSearchQuery);
        if (savedSelectedUser) setSelectedUser(JSON.parse(savedSelectedUser));
        if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
        if (savedActiveComponent) setActiveComponent(savedActiveComponent);
        if (savedSectionTitle) setSectionTitle(savedSectionTitle);

        fetch('http://localhost:3001/api/users')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при получении пользователей');
                }
                return response.json();
            })
            .then(data => {
                console.log('Полученные данные:', data);
                setUsers(data);
            })
            .catch(error => {
                console.error('Ошибка при получении пользователей:', error);
                setError(error.message);
            });
    }, []);

    useEffect(() => {
        // Сохранение состояния в localStorage при изменении состояния
        localStorage.setItem('activeImage', JSON.stringify(activeImage));
        localStorage.setItem('searchQuery', searchQuery);
        localStorage.setItem('selectedUser', JSON.stringify(selectedUser));
        localStorage.setItem('schedule', JSON.stringify(schedule));
        localStorage.setItem('activeComponent', activeComponent);
        localStorage.setItem('sectionTitle', sectionTitle);
    }, [activeImage, searchQuery, selectedUser, schedule, activeComponent, sectionTitle]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleImageClick = (imageId) => {
        setActiveImage(imageId);
        setActiveComponent(imageId === 1 ? 'UserInfo' : imageId === 2 ? 'ScheduleEditor' : null);
        setSelectedUser(null); // Сброс выбранного пользователя
        setSectionTitle(imageId === 1 ? 'Пользователи' : imageId === 2 ? 'Студенты' : 'Группы'); // Обновление названия раздела
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const handleAddToStudents = async () => {
        if (selectedUser) {
            try {
                const response = await fetch(`http://localhost:3001/api/users/${selectedUser._id}/updateRole`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ role: 'student' }),
                });

                if (response.ok) {
                    const updatedUser = await response.json();
                    setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
                    setSelectedUser(null);
                } else {
                    throw new Error('Ошибка при обновлении роли пользователя');
                }
            } catch (error) {
                console.error('Ошибка при обновлении роли пользователя:', error);
                setError(error.message);
            }
        }
    };

    const handleAddToSchedule = () => {
        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        const subjectInput = document.getElementById('exampleSelect').value;
        const descriptionInput = document.getElementById('descriptionInput').value;

        const dateObj = new Date(dateInput);
        const options = { weekday: 'long' };
        const dayOfWeek = new Intl.DateTimeFormat('ru-RU', options).format(dateObj);

        const newScheduleItem = {
            day: dayOfWeek,
            date: dateInput,
            time: timeInput,
            subject: subjectInput,
            description: descriptionInput
        };

        setSchedule([...schedule, newScheduleItem]);
    };

    const filteredUsers = activeImage === 1 ? users
        .filter(user =>
            user.role === 'user' &&
            `${user.name} ${user.surname} ${user.patronymic}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const fullNameA = `${a.surname} ${a.name} ${a.patronymic}`.toLowerCase();
            const fullNameB = `${b.surname} ${b.name} ${b.patronymic}`.toLowerCase();
            if (fullNameA < fullNameB) return -1;
            if (fullNameA > fullNameB) return 1;
            return 0;
        }) : activeImage === 2 ? users
            .filter(user =>
                user.role === 'student' &&
                `${user.name} ${user.surname} ${user.patronymic}`.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => {
                const fullNameA = `${a.surname} ${a.name} ${a.patronymic}`.toLowerCase();
                const fullNameB = `${b.surname} ${b.name} ${b.patronymic}`.toLowerCase();
                if (fullNameA < fullNameB) return -1;
                if (fullNameA > fullNameB) return 1;
                return 0;
            }) : [];

    return (
        <>
            <Header />
            <main>
                <div className="conteiner">
                    <div className="blocks-flex">
                        <div>
                            <div
                                className={`block-img-style-circle ${activeImage === 1 ? 'active' : ''}`}
                                onClick={() => handleImageClick(1)}
                            >
                                <img className="img-group-icon" src={iconUsers} alt="" />
                            </div>
                            <div
                                className={`block-img-style-circle ${activeImage === 2 ? 'active' : ''}`}
                                onClick={() => handleImageClick(2)}
                            >
                                <img className="img-group-icon" src={iconGraduation} alt="" />
                            </div>
                            <div
                                className={`block-img-style-circle ${activeImage === 3 ? 'active' : ''}`}
                                onClick={() => handleImageClick(3)}
                            >
                                <img className="img-group-icon" src={iconEducation} alt="" />
                            </div>
                        </div>
                        <div>
                            <div className="search-container">
                                <div className="block-list">
                                    <div className="section">
                                        <p>{sectionTitle}</p> {/* Отображение названия раздела */}
                                    </div>
                                    <div className="input-search">
                                        <div className="searchBox">
                                            <input className="searchInput" type="text" name="" placeholder="Поиск" value={searchQuery} onChange={handleSearchChange}/>
                                                <button className="searchButton" href="#">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 29 29" fill="none">
                                                        <g clip-path="url(#clip0_2_17)">
                                                            <g filter="url(#filter0_d_2_17)">
                                                                <path d="M23.7953 23.9182L19.0585 19.1814M19.0585 19.1814C19.8188 18.4211 20.4219 17.5185 20.8333 16.5251C21.2448 15.5318 21.4566 14.4671 21.4566 13.3919C21.4566 12.3167 21.2448 11.252 20.8333 10.2587C20.4219 9.2653 19.8188 8.36271 19.0585 7.60242C18.2982 6.84214 17.3956 6.23905 16.4022 5.82759C15.4089 5.41612 14.3442 5.20435 13.269 5.20435C12.1938 5.20435 11.1291 5.41612 10.1358 5.82759C9.1424 6.23905 8.23981 6.84214 7.47953 7.60242C5.94407 9.13789 5.08145 11.2204 5.08145 13.3919C5.08145 15.5634 5.94407 17.6459 7.47953 19.1814C9.01499 20.7168 11.0975 21.5794 13.269 21.5794C15.4405 21.5794 17.523 20.7168 19.0585 19.1814Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"></path>
                                                            </g>
                                                        </g>
                                                        <defs>
                                                            <filter id="filter0_d_2_17" x="-0.418549" y="3.70435" width="29.7139" height="29.7139" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                                                <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix>
                                                                <feOffset dy="4"></feOffset>
                                                                <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                                                                <feComposite in2="hardAlpha" operator="out"></feComposite>
                                                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix>
                                                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_17"></feBlend>
                                                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_17" result="shape"></feBlend>
                                                            </filter>
                                                            <clipPath id="clip0_2_17">
                                                                <rect width="28.0702" height="28.0702" fill="white" transform="translate(0.403503 0.526367)"></rect>
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                </button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="user-list">
                                            {error && <p>Ошибка: {error}</p>}
                                            <ul>
                                                {filteredUsers.map(user => (
                                                    <li key={user._id} onClick={() => handleUserClick(user)}>
                                                        {user.surname} {user.name} {user.patronymic}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {activeComponent === 'UserInfo' && (
                            <UserInfo selectedUser={selectedUser} handleAddToStudents={handleAddToStudents} />
                        )}
                        {activeComponent === 'ScheduleEditor' && (
                            <ScheduleEditor
                                schedule={schedule}
                                handleAddToSchedule={handleAddToSchedule}
                                selectedUser={selectedUser}
                            />
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Editing;