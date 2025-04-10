import React, { useEffect, useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import "../Components/style/listapp.css";
import { AnalyticsSection } from '../Components/AnalyticsSection';

const ListApplication = () => {
    const [applications, setApplications] = useState([]);
    const [sortField, setSortField] = useState('createdAt'); // Сортировка по дате
    const [sortOrder, setSortOrder] = useState('desc'); // Новые сначала
    const [filterStatus, setFilterStatus] = useState('Новая'); // Фильтр "Новые"
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);
    const [comments, setComments] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [applicationToDelete, setApplicationToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);


    const fetchApplications = async () => {
        try {
            setIsRefreshing(true);
            const response = await fetch('http://localhost:3001/api/applications');
            if (response.ok) {
                const data = await response.json();
                setApplications(data.data);

                const commentsInit = {};
                data.data.forEach(app => {
                    commentsInit[app._id] = app.comment || '';
                });
                setComments(commentsInit);
            } else {
                console.error('Ошибка при получении заявок');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleSort = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const handleStatusChange = async (id, status) => {
        try {
            const response = await fetch('http://localhost:3001/api/applications/status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, status })
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(applications.map(app => app._id === id ? data.data : app));
            } else {
                console.error('Ошибка при обновлении статуса заявки');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const handleCommentChange = async (id, comment) => {
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:3001/api/applications/comment', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, comment })
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(applications.map(app =>
                    app._id === id ? { ...app, comment: data.data.comment } : app
                ));
            } else {
                console.error('Ошибка при обновлении комментария заявки');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveComment = (id, event) => {
        const comment = event.target.value;
        setComments(prev => ({ ...prev, [id]: comment }));

        if (event.type === 'blur' || event.key === 'Enter') {
            handleCommentChange(id, comment.trim());
        }
    };

    const toggleRowExpand = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleDeleteClick = (app) => {
        setApplicationToDelete(app);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch('http://localhost:3001/api/applications', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: applicationToDelete._id })
            });

            if (response.ok) {
                setApplications(applications.filter(app => app._id !== applicationToDelete._id));
            } else {
                const errorData = await response.json();
                console.error('Ошибка при удалении заявки:', errorData.message);
                alert('Не удалось удалить заявку');
            }
        } catch (error) {
            console.error('Ошибка при удалении заявки:', error);
            alert('Произошла ошибка при удалении заявки');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setApplicationToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setApplicationToDelete(null);
    };

    const handleRefresh = () => {
        fetchApplications();
    };

    const filteredAndSortedApplications = applications
        .filter(app => !filterStatus || app.status === filterStatus)
        .filter(app => {
            if (!searchQuery) return true;

            const query = searchQuery.toLowerCase();
            const fullName = `${app.lastName} ${app.firstName} ${app.middleName}`.toLowerCase();
            const lastNameFirst = `${app.lastName} ${app.firstName}`.toLowerCase();
            const firstNameLast = `${app.firstName} ${app.lastName}`.toLowerCase();

            return (
                app.lastName.toLowerCase().includes(query) ||
                app.firstName.toLowerCase().includes(query) ||
                app.middleName.toLowerCase().includes(query) ||
                fullName.includes(query) ||
                lastNameFirst.includes(query) ||
                firstNameLast.includes(query)
            );
        })
        .sort((a, b) => {
            if (!sortField) return 0;
            if (sortField === 'fullName') {
                const fullNameA = `${a.lastName} ${a.firstName} ${a.middleName}`.toLowerCase();
                const fullNameB = `${b.lastName} ${b.firstName} ${b.middleName}`.toLowerCase();
                if (fullNameA < fullNameB) return sortOrder === 'asc' ? -1 : 1;
                if (fullNameA > fullNameB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            }
            if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <>
            <Header />
            <main className='listapp-main'>
                <div className='conteiner'>
                    <div className='listapp'>
                        <div className='listapp-padding'>
                            <div className='listapp-header'>
                                <h2 className='listapp-h2-title'>Список заявок</h2>
                                <div className='listapp-count'>
                                    <span className='count-badge'>{filteredAndSortedApplications.length}</span>
                                    <span>заявок</span>
                                </div>
                            </div>

                            <div className='listapp-filter-container'>
                                <div className='search-container'>
                                    <svg className='search-icon' viewBox="0 0 24 24">
                                        <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                    </svg>
                                    <input
                                        className='listapp-search-input'
                                        type="text"
                                        placeholder='Поиск по ФИО'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className='filter-group'>
                                    <label htmlFor="statusFilter">Фильтр по статусу:</label>
                                    <select
                                        id="statusFilter"
                                        className='listapp-filter-select'
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="Новая">Новые</option>
                                        <option value="В работе">В работе</option>
                                        <option value="Завершена">Завершенные</option>
                                        <option value="Отклонена">Отклоненные</option>
                                        <option value="">Все заявки</option>
                                    </select>
                                </div>
                            </div>

                            <div className='listapp-table-container'>
                                <table className='listapp-table'>
                                    <thead>
                                        <tr className='listapp-table-tr'>
                                            <th onClick={() => handleSort('fullName')}>
                                                <div className='th-content'>
                                                    ФИО
                                                    {sortField === 'fullName' && (
                                                        <span className='sort-icon'>
                                                            {sortOrder === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th>Email</th>
                                            <th>Телефон</th>
                                            <th onClick={() => handleSort('startTime')}>
                                                <div className='th-content'>
                                                    Время
                                                    {sortField === 'startTime' && (
                                                        <span className='sort-icon'>
                                                            {sortOrder === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th onClick={() => handleSort('purpose')}>
                                                <div className='th-content'>
                                                    Цель
                                                    {sortField === 'purpose' && (
                                                        <span className='sort-icon'>
                                                            {sortOrder === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th>Информация</th>
                                            <th onClick={() => handleSort('createdAt')}>
                                                <div className='th-content'>
                                                    Дата
                                                    {sortField === 'createdAt' && (
                                                        <span className='sort-icon'>
                                                            {sortOrder === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th>Статус</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAndSortedApplications.map((app, index) => (
                                            <React.Fragment key={app._id}>
                                                <tr
                                                    className={`${index % 2 === 0 ? 'even-row' : 'odd-row'} ${expandedRow === app._id ? 'expanded' : ''}`}
                                                    onClick={() => toggleRowExpand(app._id)}
                                                >
                                                    <td>
                                                        <div className='name-cell'>
                                                            <span className='avatar-placeholder'>
                                                                {app.lastName.charAt(0)}{app.firstName.charAt(0)}
                                                            </span>
                                                            {`${app.lastName} ${app.firstName} ${app.middleName}`}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <a href={`mailto:${app.email}`} className='email-link'>
                                                            {app.email}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <a href={`tel:${app.phone}`} className='phone-link'>
                                                            {app.phone}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <div className='time-slot'>
                                                            <span className='time-icon'>🕒</span>
                                                            {app.startTime} - {app.endTime}
                                                        </div>
                                                    </td>
                                                    <td>{app.purpose}</td>
                                                    <td className='additional-info'>
                                                        {app.additionalInfo && (
                                                            <div className='info-preview'>
                                                                {app.additionalInfo.length > 50
                                                                    ? `${app.additionalInfo.substring(0, 50)}...`
                                                                    : app.additionalInfo}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {new Date(app.createdAt).toLocaleDateString('ru-RU', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td>
                                                        <select
                                                            className={`status-select ${app.status.toLowerCase().replace(' ', '-')}`}
                                                            value={app.status}
                                                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <option value="Новая">Новая</option>
                                                            <option value="В работе">В работе</option>
                                                            <option value="Завершена">Завершена</option>
                                                            <option value="Отклонена">Отклонена</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className='expand-btn'
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleRowExpand(app._id);
                                                            }}
                                                        >
                                                            {expandedRow === app._id ? 'Свернуть' : 'Подробнее'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRow === app._id && (
                                                    <tr className='details-row'>
                                                        <td colSpan="9">
                                                            <div className='details-container'>
                                                                <div className='details-section'>
                                                                    <h4>Дополнительная информация:</h4>
                                                                    <p>{app.additionalInfo || 'Нет дополнительной информации'}</p>
                                                                </div>
                                                                <div className='details-section'>
                                                                    <h4>Комментарий:</h4>
                                                                    <textarea
                                                                        className='comment-textarea'
                                                                        value={comments[app._id] || ''}
                                                                        placeholder="Добавить комментарий"
                                                                        onChange={(e) => handleSaveComment(app._id, e)}
                                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveComment(app._id, e)}
                                                                        onBlur={(e) => handleSaveComment(app._id, e)}
                                                                        disabled={isSaving}
                                                                    />
                                                                    {isSaving && <div className='saving-indicator'>Сохранение...</div>}
                                                                </div>
                                                                <div className='details-actions'>
                                                                    <button
                                                                        className='delete-btn'
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteClick(app);
                                                                        }}
                                                                    >
                                                                        Удалить заявку
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Блок с кнопкой обновления и счетчиком */}
                            <div className='table-footer'>
                                <div className='listapp-count'>
                                    Показано: {filteredAndSortedApplications.length} из {applications.length} заявок
                                </div>
                                <button
                                    className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                >
                                    <span className="refresh-icon">↻</span>
                                    {isRefreshing ? 'Обновление...' : 'Обновить'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='listapp-analytics'>
                        <div className="listapp-analytics-padding">
                            <AnalyticsSection applications={applications} />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Модальное окно подтверждения удаления */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Подтверждение удаления</h3>
                        <p>Вы уверены, что хотите удалить заявку от {applicationToDelete.lastName} {applicationToDelete.firstName}?</p>
                        <p className="warning-text">Это действие нельзя отменить!</p>
                        <div className="modal-actions">
                            <button
                                className="modal-btn modal-btn-cancel"
                                onClick={cancelDelete}
                                disabled={isDeleting}
                            >
                                Отмена
                            </button>
                            <button
                                className="modal-btn modal-btn-delete"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListApplication;