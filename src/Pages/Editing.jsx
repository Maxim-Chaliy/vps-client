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
    const [activeImage, setActiveImage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [activeComponent, setActiveComponent] = useState('UserInfo');
    const [sectionTitle, setSectionTitle] = useState("Пользователи");
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [showSearchContainer, setShowSearchContainer] = useState(true);

    useEffect(() => {
        const savedActiveImage = localStorage.getItem('activeImage');
        const savedSearchQuery = localStorage.getItem('searchQuery');
        const savedSelectedUser = localStorage.getItem('selectedUser');
        const savedSchedule = localStorage.getItem('schedule');
        const savedActiveComponent = localStorage.getItem('activeComponent');
        const savedSectionTitle = localStorage.getItem('sectionTitle');
        const savedSelectedStudentId = localStorage.getItem('selectedStudentId');
        const savedShowSearchContainer = localStorage.getItem('showSearchContainer');

        if (savedActiveImage) setActiveImage(JSON.parse(savedActiveImage));
        if (savedSearchQuery) setSearchQuery(savedSearchQuery);
        if (savedSelectedUser) setSelectedUser(JSON.parse(savedSelectedUser));
        if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
        if (savedActiveComponent) setActiveComponent(savedActiveComponent);
        if (savedSectionTitle) setSectionTitle(savedSectionTitle);
        if (savedSelectedStudentId) setSelectedStudentId(savedSelectedStudentId);
        if (savedShowSearchContainer) setShowSearchContainer(JSON.parse(savedShowSearchContainer));

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
        localStorage.setItem('activeImage', JSON.stringify(activeImage));
        localStorage.setItem('searchQuery', searchQuery);
        localStorage.setItem('selectedUser', JSON.stringify(selectedUser));
        localStorage.setItem('schedule', JSON.stringify(schedule));
        localStorage.setItem('activeComponent', activeComponent);
        localStorage.setItem('sectionTitle', sectionTitle);
        localStorage.setItem('selectedStudentId', selectedStudentId);
        localStorage.setItem('showSearchContainer', JSON.stringify(showSearchContainer));
    }, [activeImage, searchQuery, selectedUser, schedule, activeComponent, sectionTitle, selectedStudentId, showSearchContainer]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleImageClick = (imageId) => {
        setActiveImage(imageId);
        setActiveComponent(imageId === 1 ? 'UserInfo' : imageId === 2 ? 'ScheduleEditor' : null);
        setSelectedUser(null);
        setSelectedStudentId(null);
        setSectionTitle(imageId === 1 ? 'Пользователи' : imageId === 2 ? 'Студенты' : 'Группы');
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setSelectedStudentId(user._id);
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
            <main className="editing-main">
                <div className="editing-container">
                    <div className="blocks-flex">
                        <div className="sidebar-icons">
                            <div
                                className={`icon-container ${activeImage === 1 ? 'active' : ''}`}
                                onClick={() => handleImageClick(1)}
                                title="Пользователи"
                            >
                                <img className="sidebar-icon" src={iconUsers} alt="Пользователи" />
                                <span className="icon-tooltip">Пользователи</span>
                            </div>
                            <div
                                className={`icon-container ${activeImage === 2 ? 'active' : ''}`}
                                onClick={() => handleImageClick(2)}
                                title="Студенты"
                            >
                                <img className="sidebar-icon" src={iconGraduation} alt="Студенты" />
                                <span className="icon-tooltip">Студенты</span>
                            </div>
                            <div
                                className={`icon-container ${activeImage === 3 ? 'active' : ''}`}
                                onClick={() => handleImageClick(3)}
                                title="Группы"
                            >
                                <img className="sidebar-icon" src={iconEducation} alt="Группы" />
                                <span className="icon-tooltip">Группы</span>
                            </div>
                            <div
                                className="icon-container toggle-container"
                                onClick={() => setShowSearchContainer(!showSearchContainer)}
                                title={showSearchContainer ? "Скрыть панель" : "Показать панель"}
                            >
                                <svg className="sidebar-icon icon-90deg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    {showSearchContainer ? (
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    ) : (
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    )}
                                </svg>
                                <span className="icon-tooltip">
                                    {showSearchContainer ? "Скрыть панель" : "Показать панель"}
                                </span>
                            </div>
                        </div>
                        
                        <div className="content-area">
                            <div 
                                className="editing-search-container" 
                                style={{ display: showSearchContainer ? 'block' : 'none' }}
                            >
                                <div className="user-list-container">
                                    <div className="section-header">
                                        <h3>{sectionTitle}</h3>
                                        <div className="search-box">
                                            <input 
                                                className="search-input" 
                                                type="text" 
                                                placeholder="Поиск..." 
                                                value={searchQuery} 
                                                onChange={handleSearchChange}
                                            />
                                            <span className="search-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="user-list-scroll">
                                        {error && <p className="error-message">Ошибка: {error}</p>}
                                        <ul className="user-list">
                                            {filteredUsers.map(user => (
                                                <li
                                                    key={user._id}
                                                    onClick={() => handleUserClick(user)}
                                                    className={`user-item ${selectedStudentId === user._id ? 'selected' : ''}`}
                                                >
                                                    <span className="user-name">
                                                        {user.surname} {user.name} {user.patronymic}
                                                    </span>
                                                    {activeImage === 1 && (
                                                        <span className="user-role-badge">Пользователь</span>
                                                    )}
                                                    {activeImage === 2 && (
                                                        <span className="user-role-badge student">Студент</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {activeComponent === 'UserInfo' && (
                                <UserInfo selectedUser={selectedUser} handleAddToStudents={handleAddToStudents} />
                            )}
                            {activeComponent === 'ScheduleEditor' && (
                                <ScheduleEditor
                                    schedule={schedule}
                                    selectedUser={selectedUser}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Editing;