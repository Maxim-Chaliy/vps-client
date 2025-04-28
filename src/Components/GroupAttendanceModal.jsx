import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';

const GroupAttendanceModal = ({ 
    scheduleItem, 
    students, 
    onClose, 
    onSave 
}) => {
    const [attendance, setAttendance] = React.useState({});

    // Инициализация состояния посещаемости
    React.useEffect(() => {
        if (scheduleItem) {
            // Если это групповое занятие
            if (scheduleItem.group_id) {
                setAttendance(scheduleItem.attendance || {});
            }
            // Если это индивидуальное занятие
            else if (scheduleItem.student_id) {
                setAttendance({
                    [scheduleItem.student_id]: scheduleItem.attendance || false
                });
            }
        }
    }, [scheduleItem]);

    const handleToggleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const handleSave = () => {
        // Для индивидуальных занятий передаем просто boolean
        if (scheduleItem.student_id) {
            onSave(attendance[scheduleItem.student_id]);
        } 
        // Для групповых занятий передаем весь объект attendance
        else {
            onSave(attendance);
        }
    };

    if (!scheduleItem) return null;

    return (
        <div className="modal-overlay">
            <div className="attendance-modal">
                <h3>
                    Посещаемость занятия
                    <br />
                    <small>
                        {scheduleItem.subject} - {new Date(scheduleItem.date).toLocaleDateString()} {scheduleItem.time}
                    </small>
                </h3>
                
                <div className="attendance-list">
                    {students.map(student => (
                        <div key={student._id} className="attendance-item">
                            <span className="student-name">
                                {student.surname} {student.name}
                            </span>
                            <label className="attendance-toggle">
                                <input
                                    type="checkbox"
                                    checked={attendance[student._id] || false}
                                    onChange={() => handleToggleAttendance(student._id)}
                                />
                                <span className="toggle-slider">
                                    {attendance[student._id] ? (
                                        <FaRegCheckCircle className="attendance-icon present" />
                                    ) : (
                                        <FaRegTimesCircle className="attendance-icon absent" />
                                    )}
                                </span>
                            </label>
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button
                        onClick={handleSave}
                        className="action-button save-button"
                    >
                        <FiCheck /> Сохранить
                    </button>
                    <button
                        onClick={onClose}
                        className="action-button cancel-button"
                    >
                        <FiX /> Отменить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupAttendanceModal;