import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';

const GroupAttendanceModal = ({
    scheduleItem,
    students,
    onClose,
    onSave
}) => {
    const [attendanceData, setAttendanceData] = React.useState({});
    const [error, setError] = React.useState(null);

    // Инициализация состояния посещаемости и оценок
    React.useEffect(() => {
        if (scheduleItem) {
            const initialData = {};

            if (scheduleItem.group_id) {
                // Для групповых занятий
                students.forEach(student => {
                    // Обрабатываем как Map, так и обычный объект
                    let grade = null;
                    if (scheduleItem.grades instanceof Map) {
                        grade = scheduleItem.grades.get(student._id.toString()) || null;
                    } else if (scheduleItem.grades && typeof scheduleItem.grades === 'object') {
                        grade = scheduleItem.grades[student._id.toString()] || null;
                    }

                    initialData[student._id] = {
                        attended: scheduleItem.attendance?.[student._id] || false,
                        grade: grade
                    };
                });
            } else if (scheduleItem.student_id) {
                // Для индивидуальных занятий
                initialData[scheduleItem.student_id] = {
                    attended: scheduleItem.attendance || false,
                    grade: scheduleItem.grade || null
                };
            }

            setAttendanceData(initialData);
        }
    }, [scheduleItem, students]);

    const handleToggleAttendance = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                attended: !prev[studentId].attended,
                // Сбрасываем оценку при снятии посещаемости
                grade: !prev[studentId].attended ? prev[studentId].grade : null
            }
        }));
    };

    const handleGradeChange = (studentId, value) => {
        const gradeValue = value ? parseInt(value) : null;
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                grade: gradeValue >= 1 && gradeValue <= 5 ? gradeValue : null
            }
        }));
    };

    const handleSave = () => {
        // Подготавливаем данные для сохранения
        const attendanceToSave = {};
        const gradesToSave = {};

        Object.entries(attendanceData).forEach(([studentId, data]) => {
            attendanceToSave[studentId] = data.attended;
            if (data.attended && data.grade) {
                gradesToSave[studentId] = data.grade;
            }
        });

        onSave({
            attendance: attendanceToSave,
            grades: gradesToSave
        });
    };

    if (!scheduleItem) return null;

    return (
        <div className="modal-overlay">
            <div className="attendance-modal">
                <h3>
                    Посещаемость и оценки
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

                            <div className="attendance-controls">
                                <label className="attendance-toggle">
                                    <input
                                        type="checkbox"
                                        checked={attendanceData[student._id]?.attended || false}
                                        onChange={() => handleToggleAttendance(student._id)}
                                    />
                                    <span className="toggle-slider">
                                        {attendanceData[student._id]?.attended ? (
                                            <FaRegCheckCircle className="attendance-icon present" />
                                        ) : (
                                            <FaRegTimesCircle className="attendance-icon absent" />
                                        )}
                                    </span>
                                </label>

                                {attendanceData[student._id]?.attended && (
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={attendanceData[student._id]?.grade || ''}
                                        onChange={(e) => handleGradeChange(student._id, e.target.value)}
                                        className="grade-input"
                                        placeholder="Оценка"
                                    />
                                )}
                            </div>
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