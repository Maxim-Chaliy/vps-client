import React, { useEffect, useState } from 'react';
import iconadd from "../img/icon-add.png";
import "../Components/style/ScheduleEditor.css";
import { BsFiletypeTxt, BsFiletypeDocx, BsFiletypeDoc, BsFiletypePdf, BsFiletypeXlsx } from "react-icons/bs";
import { PiMicrosoftPowerpointLogoThin } from "react-icons/pi";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";

const ScheduleEditor = ({ selectedUser }) => {
    const [schedule, setSchedule] = useState([]);
    const [homework, setHomework] = useState([]);
    const [editing, setEditing] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const [mode, setMode] = useState('lessons');
    const [isAddingHomework, setIsAddingHomework] = useState(false);

    useEffect(() => {
        if (selectedUser) {
            fetch(`http://localhost:3001/api/schedules/${selectedUser._id}`)
                .then(response => response.json())
                .then(data => setSchedule(data))
                .catch(error => console.error('Ошибка при получении расписания:', error));

            fetch(`http://localhost:3001/api/homework/${selectedUser._id}`)
                .then(response => response.json())
                .then(data => setHomework(data))
                .catch(error => console.error('Ошибка при получении домашнего задания:', error));
        }
    }, [selectedUser]);

    const handleAddToSchedule = async () => {
        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        const durationInput = document.getElementById('durationInput').value;
        const subjectInput = document.getElementById('exampleSelect').value;
        const descriptionInput = document.getElementById('descriptionInput').value;

        if (!dateInput || !timeInput || !durationInput || !subjectInput) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const dateObj = new Date(dateInput);
        const dayOfWeek = getShortDayOfWeek(dateObj);

        const newScheduleItem = {
            student_id: selectedUser._id,
            day: dayOfWeek,
            date: dateObj,
            time: timeInput,
            duration: parseInt(durationInput) || 60,
            subject: subjectInput,
            description: descriptionInput || '',
            attendance: false
        };

        try {
            const response = await fetch('http://localhost:3001/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newScheduleItem),
            });

            if (response.ok) {
                const savedScheduleItem = await response.json();
                setSchedule([...schedule, savedScheduleItem]);
                document.getElementById('dateInput').value = '';
                document.getElementById('timeInput').value = '';
                document.getElementById('durationInput').value = '60';
                document.getElementById('descriptionInput').value = '';
            } else {
                throw new Error('Ошибка при добавлении занятия в расписание');
            }
        } catch (error) {
            console.error('Ошибка при добавлении занятия в расписание:', error);
            alert('Не удалось добавить занятие');
        }
    };

    const handleAddToHomework = async () => {
        const dueDateInput = document.getElementById('dueDateInput').value;
        const filesInput = document.getElementById('filesInput').files;

        if (!dueDateInput || filesInput.length === 0) {
            alert('Пожалуйста, укажите дату выполнения и прикрепите файлы');
            return;
        }

        const formData = new FormData();
        formData.append('student_id', selectedUser._id);
        formData.append('day', getShortDayOfWeek(new Date(dueDateInput)));
        formData.append('dueDate', dueDateInput);
        formData.append('answer', '');
        formData.append('grade', null);

        for (let i = 0; i < filesInput.length; i++) {
            formData.append('files', filesInput[i]);
        }

        try {
            const response = await fetch('http://localhost:3001/api/homework', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const savedHomeworkItem = await response.json();
                setHomework([...homework, savedHomeworkItem]);
                setIsAddingHomework(false);
                document.getElementById('dueDateInput').value = '';
                document.getElementById('filesInput').value = '';
            } else {
                throw new Error('Ошибка при добавлении домашнего задания');
            }
        } catch (error) {
            console.error('Ошибка при добавлении домашнего задания:', error);
            alert('Не удалось добавить домашнее задание');
        }
    };

    const handleAttendanceChange = async (id, attendance) => {
        try {
            const response = await fetch(`http://localhost:3001/api/schedules/${id}/updateAttendance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ attendance }),
            });

            if (response.ok) {
                const updatedScheduleItem = await response.json();
                setSchedule(schedule.map(item => item._id === id ? updatedScheduleItem : item));
            } else {
                throw new Error('Ошибка при обновлении посещаемости');
            }
        } catch (error) {
            console.error('Ошибка при обновлении посещаемости:', error);
        }
    };

    const handleEdit = (id) => {
        const itemToEdit = schedule.find(item => item._id === id);
        setEditing(id);
        setEditValues({
            date: formatDateForInput(itemToEdit.date),
            time: itemToEdit.time,
            duration: itemToEdit.duration,
            subject: itemToEdit.subject,
            description: itemToEdit.description
        });
    };

    const handleInputChange = (field, value) => {
        setEditValues(prevValues => ({
            ...prevValues,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (editing) {
            const updatedItem = {
                ...schedule.find(item => item._id === editing),
                ...editValues,
                date: new Date(editValues.date),
                day: getShortDayOfWeek(new Date(editValues.date)),
                duration: parseInt(editValues.duration) || 60
            };

            try {
                const response = await fetch(`http://localhost:3001/api/schedules/${editing}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedItem),
                });

                if (response.ok) {
                    const updatedScheduleItem = await response.json();
                    setSchedule(schedule.map(item => item._id === editing ? updatedScheduleItem : item));
                    setEditing(null);
                    setEditValues({});
                } else {
                    throw new Error('Ошибка при сохранении изменений');
                }
            } catch (error) {
                console.error('Ошибка при сохранении изменений:', error);
                alert('Не удалось сохранить изменения');
            }
        }
    };

    const handleCancel = () => {
        setEditing(null);
        setEditValues({});
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return;

        try {
            const response = await fetch(`http://localhost:3001/api/schedules/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setSchedule(schedule.filter(item => item._id !== id));
                setSelectedItems(selectedItems.filter(itemId => itemId !== id));
            } else {
                throw new Error('Ошибка при удалении записи');
            }
        } catch (error) {
            console.error('Ошибка при удалении записи:', error);
            alert('Не удалось удалить запись');
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) return;
        if (!window.confirm(`Вы уверены, что хотите удалить ${selectedItems.length} выбранных записей?`)) return;

        try {
            const response = await fetch('http://localhost:3001/api/schedules/deleteMultiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedItems }),
            });

            if (response.ok) {
                setSchedule(schedule.filter(item => !selectedItems.includes(item._id)));
                setSelectedItems([]);
            } else {
                throw new Error('Ошибка при удалении записей');
            }
        } catch (error) {
            console.error('Ошибка при удалении записей:', error);
            alert('Не удалось удалить выбранные записи');
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prevSelectedItems =>
            prevSelectedItems.includes(id)
                ? prevSelectedItems.filter(itemId => itemId !== id)
                : [...prevSelectedItems, id]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    const getShortDayOfWeek = (date) => {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        const daysOfWeek = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
        return daysOfWeek[date.getDay()];
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}ч ${mins > 0 ? `${mins}м` : ''}` : `${mins}м`;
    };

    const calculateEndTime = (startTime, duration) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    const getFileIcon = (file) => {
        const extension = file.split('.').pop().toLowerCase();
        switch (extension) {
            case 'txt': return <BsFiletypeTxt className="file-icon" />;
            case 'docx': return <BsFiletypeDocx className="file-icon" />;
            case 'doc': return <BsFiletypeDoc className="file-icon" />;
            case 'pptx': return <PiMicrosoftPowerpointLogoThin className="file-icon" />;
            case 'pdf': return <BsFiletypePdf className="file-icon" />;
            case 'xlsx': return <BsFiletypeXlsx className="file-icon" />;
            default: return <BsFiletypeTxt className="file-icon" />;
        }
    };

    const formatCombinedDateTime = (item) => {
        const date = formatDate(item.date);
        const startTime = item.time;
        const endTime = calculateEndTime(item.time, item.duration);
        const duration = formatDuration(item.duration);
        return `${date}<br>${startTime}-${endTime}<br>${duration}`;
    };

    return (
        <div className="schedule-editor-container">
            <div className="editor-header">
                <h3>
                    {selectedUser ? `${selectedUser.surname} ${selectedUser.name} ${selectedUser.patronymic}` : 'Выберите студента'}
                </h3>
                <div className='mode-switcher'>
                    <button
                        className={`mode-button ${mode === 'lessons' ? 'active' : ''}`}
                        onClick={() => setMode('lessons')}
                    >
                        Занятия
                    </button>
                    <button
                        className={`mode-button ${mode === 'homework' ? 'active' : ''}`}
                        onClick={() => setMode('homework')}
                    >
                        Домашнее задание
                    </button>
                </div>
            </div>

            {mode === 'lessons' ? (
                <>
                    <div className="add-lesson-form">
                        <div className="form-group">
                            <label htmlFor="dateInput">Дата</label>
                            <input type="date" id="dateInput" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="timeInput">Время начала</label>
                            <input type="time" id="timeInput" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="durationInput">Продолжительность (мин)</label>
                            <input
                                type="number"
                                id="durationInput"
                                className="form-input"
                                min="30"
                                step="30"
                                defaultValue="60"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleSelect">Предмет</label>
                            <select id="exampleSelect" className="form-input">
                                <option value="">Выберите предмет</option>
                                <option value="Алгебра">Алгебра</option>
                                <option value="Геометрия">Геометрия</option>
                                <option value="Физика">Физика</option>
                                <option value="Химия">Химия</option>
                                <option value="Информатика">Информатика</option>
                            </select>
                        </div>
                        <div className="form-group description-group">
                            <label htmlFor="descriptionInput">Описание</label>
                            <input
                                type="text"
                                id="descriptionInput"
                                className="form-input"
                                placeholder="Дополнительная информация"
                            />
                        </div>
                        <button
                            className="add-button"
                            onClick={handleAddToSchedule}
                        >
                            <img src={iconadd} alt="Добавить" className="add-icon" />
                            Добавить
                        </button>
                    </div>

                    {selectedItems.length > 0 && (
                        <div className="bulk-actions">
                            <button
                                onClick={handleDeleteSelected}
                                className="delete-selected-button"
                            >
                                <FiTrash2 /> Удалить выбранные ({selectedItems.length})
                            </button>
                        </div>
                    )}

                    <div className="schedule-table-container">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th>День</th>
                                    <th>Дата/Время/Продолжительность</th>
                                    <th>Предмет</th>
                                    <th>Описание</th>
                                    <th style={{ width: '100px' }}>Посещаемость</th>
                                    <th style={{ width: '120px' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.length > 0 ? (
                                    schedule.map((item) => (
                                        <React.Fragment key={item._id}>
                                            <tr className={editing === item._id ? 'editing-row' : ''}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item._id)}
                                                        onChange={() => handleSelectItem(item._id)}
                                                        className="row-checkbox"
                                                    />
                                                </td>
                                                <td>{item.day}</td>
                                                <td dangerouslySetInnerHTML={{ __html: formatCombinedDateTime(item) }}></td>
                                                <td>{item.subject}</td>
                                                <td>{item.description || '-'}</td>
                                                <td>
                                                    <label className="attendance-toggle">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.attendance}
                                                            onChange={() => handleAttendanceChange(item._id, !item.attendance)}
                                                        />
                                                        <span className="toggle-slider">
                                                            {item.attendance ? (
                                                                <FaRegCheckCircle className="attendance-icon present" />
                                                            ) : (
                                                                <FaRegTimesCircle className="attendance-icon absent" />
                                                            )}
                                                        </span>
                                                    </label>
                                                </td>
                                                <td>
                                                    <div className="row-actions">
                                                        <button
                                                            onClick={() => handleEdit(item._id)}
                                                            className="action-button edit-button"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="action-button delete-button"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {editing === item._id && (
                                                <tr className="edit-card-row">
                                                    <td colSpan="10">
                                                        <div className="edit-card">
                                                            <div className="edit-card-content">
                                                                <div className="edit-form-group">
                                                                    <label>Дата</label>
                                                                    <input
                                                                        type="date"
                                                                        value={editValues.date}
                                                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                                                        className="edit-input"
                                                                    />
                                                                </div>
                                                                <div className="edit-form-group">
                                                                    <label>Время начала</label>
                                                                    <input
                                                                        type="time"
                                                                        value={editValues.time}
                                                                        onChange={(e) => handleInputChange('time', e.target.value)}
                                                                        className="edit-input"
                                                                    />
                                                                </div>
                                                                <div className="edit-form-group">
                                                                    <label>Продолжительность (мин)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={editValues.duration}
                                                                        onChange={(e) => handleInputChange('duration', e.target.value)}
                                                                        className="edit-input"
                                                                        min="30"
                                                                        step="30"
                                                                    />
                                                                </div>
                                                                <div className="edit-form-group">
                                                                    <label>Предмет</label>
                                                                    <select
                                                                        value={editValues.subject}
                                                                        onChange={(e) => handleInputChange('subject', e.target.value)}
                                                                        className="edit-input"
                                                                    >
                                                                        <option value="Алгебра">Алгебра</option>
                                                                        <option value="Геометрия">Геометрия</option>
                                                                        <option value="Физика">Физика</option>
                                                                        <option value="Химия">Химия</option>
                                                                        <option value="Информатика">Информатика</option>
                                                                    </select>
                                                                </div>
                                                                <div className="edit-form-group description-group">
                                                                    <label>Описание</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editValues.description || ''}
                                                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                                                        className="edit-input"
                                                                        placeholder="Дополнительная информация"
                                                                    />
                                                                </div>
                                                                <div className="edit-card-actions">
                                                                    <button
                                                                        onClick={handleSave}
                                                                        className="action-button save-button"
                                                                    >
                                                                        <FiCheck /> Сохранить
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancel}
                                                                        className="action-button cancel-button"
                                                                    >
                                                                        <FiX /> Отменить
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr className="no-data-row">
                                        <td colSpan="10">Нет данных о занятиях</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <div className="homework-actions">
                        <button
                            className={`add-homework-button ${isAddingHomework ? 'cancel' : 'add'}`}
                            onClick={() => setIsAddingHomework(!isAddingHomework)}
                        >
                            {isAddingHomework ? 'Отменить' : 'Добавить задание'}
                        </button>
                    </div>

                    {isAddingHomework && (
                        <div className="add-homework-form">
                            <div className="form-group">
                                <label htmlFor="dueDateInput">Дата выполнения</label>
                                <input type="date" id="dueDateInput" className="form-input" />
                            </div>
                            <div className="form-group file-group">
                                <label htmlFor="filesInput">Файлы задания</label>
                                <input
                                    type="file"
                                    id="filesInput"
                                    multiple
                                    className="file-input"
                                />
                                <label htmlFor="filesInput" className="file-input-label">
                                    Выберите файлы...
                                </label>
                            </div>
                            <button
                                className="submit-homework-button"
                                onClick={handleAddToHomework}
                            >
                                Сохранить задание
                            </button>
                        </div>
                    )}

                    <div className="homework-table-container">
                        <table className="homework-table">
                            <thead>
                                <tr>
                                    <th>День</th>
                                    <th>Выполнить до</th>
                                    <th>Файлы задания</th>
                                    <th>Ответ</th>
                                    <th>Оценка</th>
                                </tr>
                            </thead>
                            <tbody>
                                {homework.length > 0 ? (
                                    homework.map((item) => (
                                        <tr key={item._id}>
                                            <td>{item.day}</td>
                                            <td>{formatDate(item.dueDate)}</td>
                                            <td>
                                                <div className="files-list">
                                                    {item.files.map((file, idx) => (
                                                        <div key={idx} className="file-item">
                                                            {getFileIcon(file)}
                                                            <a
                                                                href={`http://localhost:3001/homework/${file}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                                className="file-link"
                                                            >
                                                                {file}
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                {item.answer && item.answer.length > 0 ? (
                                                    <div className="files-list">
                                                        {item.answer.map((file, idx) => (
                                                            <div key={idx} className="file-item">
                                                                {getFileIcon(file)}
                                                                <a
                                                                    href={`http://localhost:3001/homework/${file}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    download
                                                                    className="file-link"
                                                                >
                                                                    {file}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="no-answer">Нет ответа</span>
                                                )}
                                            </td>
                                            <td>
                                                {item.grade ? (
                                                    <span className="grade-badge">{item.grade}</span>
                                                ) : (
                                                    <span className="no-grade">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="no-data-row">
                                        <td colSpan="5">Нет данных о домашних заданиях</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default ScheduleEditor;
