import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';

const GroupAttendanceModal = ({ scheduleItem, students, onClose, onSave }) => {
    const [attendanceData, setAttendanceData] = React.useState({});

    React.useEffect(() => {
        if (scheduleItem && students) {
            const initialData = {};

            students.forEach(student => {
                initialData[student._id] = {
                    attended: scheduleItem.attendance?.[student._id] || false,
                    grade: scheduleItem.grade_group?.[student._id] || null
                };
            });

            setAttendanceData(initialData);
        }
    }, [scheduleItem, students]);

    const handleToggleAttendance = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                attended: !prev[studentId]?.attended,
                grade: !prev[studentId]?.attended ? prev[studentId]?.grade || null : null
            }
        }));
    };

    const handleGradeChange = (studentId, value) => {
        const gradeValue = value.trim() === '' ? null : Math.min(5, Math.max(1, parseInt(value)));

        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                grade: isNaN(gradeValue) ? null : gradeValue
            }
        }));
    };

    const handleSave = () => {
        const attendanceToSave = {};
        const gradesToSave = {};

        Object.entries(attendanceData).forEach(([studentId, data]) => {
            attendanceToSave[studentId] = data.attended;
            if (data.attended && data.grade !== null && !isNaN(data.grade)) {
                gradesToSave[studentId] = data.grade;
            }
        });

        console.log('Prepared data for save:', { attendance: attendanceToSave, grades: gradesToSave });
        onSave({
            attendance: attendanceToSave,
            grades: gradesToSave
        });
    };

    if (!scheduleItem) return null;

    // Сортировка учеников по фамилии и имени
    const sortedStudents = [...students].sort((a, b) => {
        const nameA = `${a.surname} ${a.name}`.toLowerCase();
        const nameB = `${b.surname} ${b.name}`.toLowerCase();
        return nameA.localeCompare(nameB);
    });

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
                    {sortedStudents.map(student => {
                        const studentData = attendanceData[student._id] || { attended: false, grade: null };

                        return (
                            <div key={student._id} className="attendance-item">
                                <span className="student-name">
                                    {student.surname} {student.name}
                                </span>

                                <div className="attendance-controls">
                                    <label className="attendance-toggle">
                                        <input
                                            type="checkbox"
                                            checked={studentData.attended}
                                            onChange={() => handleToggleAttendance(student._id)}
                                        />
                                        <span className="toggle-slider">
                                            {studentData.attended ? (
                                                <FaRegCheckCircle className="attendance-icon present" />
                                            ) : (
                                                <FaRegTimesCircle className="attendance-icon absent" />
                                            )}
                                        </span>
                                    </label>

                                    {studentData.attended && (
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={studentData.grade || ''}
                                            onChange={(e) => handleGradeChange(student._id, e.target.value)}
                                            className="grade-input"
                                            placeholder="Оценка"
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
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
