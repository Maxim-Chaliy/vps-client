import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import UserInfo from "../Components/UserInfo";
import ScheduleEditor from "../Components/ScheduleEditor";
import GroupEditor from "../Components/GroupEditor";
import "../Components/style/config.css";
import "../Components/style/editing.css";
import iconUsers from "../img/user.png";
import iconGraduation from "../img/graduation.png";
import iconEducation from "../img/education.png";

const Editing = () => {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeImage, setActiveImage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [activeComponent, setActiveComponent] = useState('UserInfo');
    const [sectionTitle, setSectionTitle] = useState("Пользователи");
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [showSearchContainer, setShowSearchContainer] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        const savedActiveImage = localStorage.getItem('activeImage');
        const savedSearchQuery = localStorage.getItem('searchQuery');
        const savedSelectedUser = localStorage.getItem('selectedUser');
        const savedSelectedGroup = localStorage.getItem('selectedGroup');
        const savedSchedule = localStorage.getItem('schedule');
        const savedActiveComponent = localStorage.getItem('activeComponent');
        const savedSectionTitle = localStorage.getItem('sectionTitle');
        const savedSelectedStudentId = localStorage.getItem('selectedStudentId');
        const savedShowSearchContainer = localStorage.getItem('showSearchContainer');

        if (savedActiveImage) setActiveImage(JSON.parse(savedActiveImage));
        if (savedSearchQuery) setSearchQuery(savedSearchQuery);
        if (savedSelectedUser) setSelectedUser(JSON.parse(savedSelectedUser));
        if (savedSelectedGroup) setSelectedGroup(JSON.parse(savedSelectedGroup));
        if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
        if (savedActiveComponent) setActiveComponent(savedActiveComponent);
        if (savedSectionTitle) setSectionTitle(savedSectionTitle);
        if (savedSelectedStudentId) setSelectedStudentId(savedSelectedStudentId);
        if (savedShowSearchContainer) setShowSearchContainer(JSON.parse(savedShowSearchContainer));

        fetch('/api/users')
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

        fetch('/api/groups')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при получении групп');
                }
                return response.json();
            })
            .then(data => {
                console.log('Полученные группы:', data);
                setGroups(data);
            })
            .catch(error => {
                console.error('Ошибка при получении групп:', error);
                setError(error.message);
            });
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) {
                throw new Error('Ошибка при получении пользователей');
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Ошибка при получении пользователей:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        localStorage.setItem('activeImage', JSON.stringify(activeImage));
        localStorage.setItem('searchQuery', searchQuery);
        localStorage.setItem('selectedUser', JSON.stringify(selectedUser));
        localStorage.setItem('selectedGroup', JSON.stringify(selectedGroup));
        localStorage.setItem('schedule', JSON.stringify(schedule));
        localStorage.setItem('activeComponent', activeComponent);
        localStorage.setItem('sectionTitle', sectionTitle);
        localStorage.setItem('selectedStudentId', selectedStudentId);
        localStorage.setItem('showSearchContainer', JSON.stringify(showSearchContainer));
    }, [activeImage, searchQuery, selectedUser, selectedGroup, schedule, activeComponent, sectionTitle, selectedStudentId, showSearchContainer]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleImageClick = (imageId) => {
        setActiveImage(imageId);
        setActiveComponent(imageId === 1 ? 'UserInfo' : imageId === 2 ? 'ScheduleEditor' : null);
        setSelectedUser(null);
        setSelectedGroup(null);
        setSelectedStudentId(null);
        setSectionTitle(imageId === 1 ? 'Пользователи' : imageId === 2 ? 'Ученики' : 'Группы');
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setSelectedGroup(null);
        setSelectedStudentId(user._id);
    };

    const handleGroupClick = (group) => {
        setSelectedGroup(group);
        setSelectedUser(null);
    };

    const handleAddToStudents = async () => {
        if (selectedUser) {
            try {
                const response = await fetch(`/api/users/${selectedUser._id}/updateRole`, {
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

    const [stats, setStats] = useState({
        total: 0,
        individual: 0,
        group: 0,
        attendance: 0,
        subjects: [], // Инициализация как пустой массив
        totalHours: 0
    });


    const fetchStats = async () => {
        try {
            const response = await fetch('/api/schedules/stats');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const allStats = await response.json();

            const firstDay = new Date(selectedYear, selectedMonth, 1);
            const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

            // Фильтрация данных на клиенте
            const filteredStats = allStats.filter(stat => {
                const statDate = new Date(stat.date);
                return statDate >= firstDay && statDate <= lastDay;
            });

            // Подсчет статистики на основе отфильтрованных данных
            let totalSessions = 0;
            let individualSessions = 0;
            let groupSessions = 0;
            let attendedSessions = 0;
            let totalPossibleAttendance = 0;

            filteredStats.forEach(stat => {
                if (stat.student_id) {
                    // Индивидуальное занятие
                    individualSessions++;
                    totalPossibleAttendance++;
                    if (stat.attendance === true) {
                        attendedSessions++;
                    }
                } else if (stat.group_id && stat.attendance && typeof stat.attendance === 'object') {
                    // Групповое занятие
                    groupSessions++;
                    const students = Object.keys(stat.attendance);
                    totalPossibleAttendance += students.length;
                    attendedSessions += students.filter(studentId => stat.attendance[studentId] === true).length;
                }
            });

            totalSessions = individualSessions + groupSessions;

            // Подсчет средней посещаемости
            const attendancePercentage = totalPossibleAttendance > 0 ? (attendedSessions / totalPossibleAttendance) * 100 : 0;

            // Подсчет часов
            const totalHours = filteredStats.reduce((sum, stat) => sum + stat.duration, 0) / 60;

            // Подсчет по предметам
            const subjects = filteredStats.reduce((acc, stat) => {
                const subject = stat.subject;
                acc[subject] = (acc[subject] || 0) + 1;
                return acc;
            }, {});

            setStats({
                total: totalSessions,
                individual: individualSessions,
                group: groupSessions,
                attendance: attendancePercentage,
                subjects: Object.entries(subjects).map(([subject, count]) => ({ _id: subject, count })),
                totalHours
            });
        } catch (error) {
            console.error('Ошибка при загрузке статистики:', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [selectedMonth, selectedYear]);

    const handleCreateGroup = async () => {
        const groupName = prompt("Введите название группы:");
        if (groupName) {
            try {
                const response = await fetch('/api/groups', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: groupName }),
                });

                if (response.ok) {
                    const newGroup = await response.json();
                    setGroups([...groups, newGroup]);
                } else {
                    throw new Error('Ошибка при создании группы');
                }
            } catch (error) {
                console.error('Ошибка при создании группы:', error);
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
                                title="Ученики"
                            >
                                <img className="sidebar-icon" src={iconGraduation} alt="Ученики" />
                                <span className="icon-tooltip">Ученики</span>
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
                                        {activeImage === 3 && (
                                            <button onClick={handleCreateGroup} className="create-group-button">
                                                Создать группу
                                            </button>
                                        )}
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
                                        {activeImage === 3 ? (
                                            <ul className="user-list">
                                                {groups.map(group => (
                                                    <li
                                                        key={group._id}
                                                        onClick={() => handleGroupClick(group)}
                                                        className={`user-item ${selectedGroup?._id === group._id ? 'selected' : ''}`}
                                                    >
                                                        <span className="user-name">{group.name}</span>
                                                        <span className="user-role-badge">
                                                            {group.students?.length || 0} учеников
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
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
                                                            <span className="user-role-badge student">Ученик</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
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
                                    setUsers={setUsers}
                                    setSelectedUser={setSelectedUser}
                                    setGroups={setGroups} // Передаем setGroups как пропс
                                    refreshStudents={fetchUsers}
                                />
                            )}
                            {activeImage === 3 && (
                                <GroupEditor
                                    selectedGroup={selectedGroup}
                                    setSelectedGroup={setSelectedGroup}
                                    groups={groups}
                                    setGroups={setGroups}
                                    users={users}
                                    setUsers={setUsers}
                                />
                            )}
                        </div>
                    </div>
                    <div className="stats-container">
                        <div className="stats-card">
                            <div className="stats-controls">
                                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                                    {months.map((month, index) => (
                                        <option key={index} value={index}>{month}</option>
                                    ))}
                                </select>
                                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <button onClick={fetchStats} className="refresh-button">
                                    Обновить
                                </button>
                            </div>
                            <h3>Статистика занятий за {months[selectedMonth]} {selectedYear}</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-value">{stats.total}</span>
                                    <span className="stat-label">Всего занятий</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{stats.individual}</span>
                                    <span className="stat-label">Индивидуальных</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{stats.group}</span>
                                    <span className="stat-label">Групповых</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{Math.round(stats.attendance)}%</span>
                                    <span className="stat-label">Средняя посещаемость</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{stats.totalHours}</span>
                                    <span className="stat-label">Общее количество часов</span>
                                </div>
                                {stats.subjects && [...stats.subjects].sort((a, b) => a._id.localeCompare(b._id)).map((subject, index) => (
                                    <div key={index} className="stat-item">
                                        <span className="stat-value">{subject.count}</span>
                                        <span className="stat-label">{subject._id}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Editing;
