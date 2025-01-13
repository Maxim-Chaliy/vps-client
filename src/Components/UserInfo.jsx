import React from "react";
import PropTypes from "prop-types";

const UserInfo = ({ selectedUser, handleAddToStudents }) => {
    return (
        <div className="info-editing">
            <div className="info">
                <div className="FIO">
                    <div><p><b>Имя:</b> {selectedUser ? selectedUser.name : ''}</p></div>
                    <div><p><b>Фамилия:</b> {selectedUser ? selectedUser.surname : ''}</p></div>
                    <div><p><b>Отчество:</b> {selectedUser ? selectedUser.patronymic : ''}</p></div>
                </div>
                <div className="block-button-student-on">
                    <button className="button-student-on" onClick={handleAddToStudents}>
                        Добавить в студенты
                    </button>
                </div>
            </div>
        </div>
    );
};

UserInfo.propTypes = {
    selectedUser: PropTypes.object,
    handleAddToStudents: PropTypes.func.isRequired,
};

export default UserInfo;