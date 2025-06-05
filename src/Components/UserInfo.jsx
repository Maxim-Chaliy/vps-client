import React from "react";
import PropTypes from "prop-types";
import "../Components/style/UserInfo.css";

const UserInfo = ({ selectedUser, handleAddToStudents }) => {
    return (
        <div className="info-editing">
            {selectedUser ? (
                <>
                    <div className="info-header">
                        <h3>Информация о пользователе</h3>
                    </div>
                    <div className="info-content">
                        <div className="user-avatar">
                            <div className="avatar-placeholder">
                                {selectedUser.name.charAt(0)}{selectedUser.surname.charAt(0)}
                            </div>
                        </div>
                        <div className="user-details">
                            <div className="detail-row">
                                <span className="detail-label">Фамилия:</span>
                                <span className="detail-value">{selectedUser.surname}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Имя:</span>
                                <span className="detail-value">{selectedUser.name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Отчество:</span>
                                <span className="detail-value">{selectedUser.patronymic || '—'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{selectedUser.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Статус:</span>
                                <span className="detail-value role-badge">
                                    {selectedUser.role === 'student' ? 'Студент' : 'Пользователь'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {selectedUser.role !== 'student' && (
                        <div className="actions">
                            <button
                                className="promote-button"
                                onClick={handleAddToStudents}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                                Сделать студентом
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <p>Выберите пользователя для просмотра информации</p>
                </div>
            )}
        </div>
    );
};

UserInfo.propTypes = {
    selectedUser: PropTypes.object,
    handleAddToStudents: PropTypes.func.isRequired,
};

export default UserInfo;
