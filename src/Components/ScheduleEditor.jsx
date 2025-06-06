import React, { useEffect, useState } from 'react';
import iconadd from "../img/icon-add.png";
import "../Components/style/ScheduleEditor.css";
import { BsFiletypeTxt, BsFiletypeDocx, BsFiletypeDoc, BsFiletypePdf, BsFiletypeXlsx } from "react-icons/bs";
import { PiMicrosoftPowerpointLogoThin } from "react-icons/pi";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";

const ScheduleEditor = ({ selectedUser, selectedGroup, refreshStudents, setUsers, setSelectedUser, setGroups }) => {
    const [schedule, setSchedule] = useState([]);
    const [homework, setHomework] = useState([]);
    const [editing, setEditing] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedHomeworkItems, setSelectedHomeworkItems] = useState([]);
    const [mode, setMode] = useState('lessons');
    const [isAddingHomework, setIsAddingHomework] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [gradeValue, setGradeValue] = useState('');
    const [showDemoteModal, setShowDemoteModal] = useState(false);
    const [deleteRecords, setDeleteRecords] = useState(false);
    const [isDemoting, setIsDemoting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (selectedUser) {
                    const scheduleResponse = await fetch(`/api/schedules/student/${selectedUser._id}`);
                    const homeworkResponse = await fetch(`/api/homework/${selectedUser._id}`);
                    setSchedule(await scheduleResponse.json());
                    setHomework(await homeworkResponse.json());
                } else if (selectedGroup) {
                    const scheduleResponse = await fetch(`/api/schedules/group/${selectedGroup._id}`);
                    const homeworkResponse = await fetch(`/api/homework/group/${selectedGroup._id}`);
                    setSchedule(await scheduleResponse.json());
                    setHomework(await homeworkResponse.json());
                }
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
            }
        };

        fetchData();
    }, [selectedUser, selectedGroup]);

    const handleDemoteStudent = async () => {
        if (!selectedUser) return;

        setIsDemoting(true);
        try {
            // Удаляем студента из всех групп
            const groupsResponse = await fetch(`/api/groups/student/${selectedUser._id}`);
            if (!groupsResponse.ok) {
                throw new Error('Не удалось получить группы студента');
            }

            const groups = await groupsResponse.json();

            for (const group of groups) {
                const removeResponse = await fetch(`/api/groups/${group._id}/removeStudent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ studentId: selectedUser._id }),
                });

                if (!removeResponse.ok) {
                    console.error(`Не удалось удалить студента из группы ${group._id}`);
                }
            }

            // Изменяем роль пользователя
            const updateResponse = await fetch(`/api/users/${selectedUser._id}/updateRole`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: 'user' }),
            });

            if (!updateResponse.ok) {
                throw new Error('Не удалось изменить роль пользователя');
            }

            // Удаляем связанные записи, если выбрано
            if (deleteRecords) {
                await fetch('/api/schedules/deleteByStudent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ student_id: selectedUser._id }),
                });

                await fetch('/api/homework/deleteByStudent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ student_id: selectedUser._id }),
                });
            }

            setShowDemoteModal(false);
            setDeleteRecords(false);
            alert('Студент успешно переведен в обычные пользователи');

            // Обновляем список пользователей
            const usersResponse = await fetch('/api/users');
            if (usersResponse.ok) {
                const updatedUsers = await usersResponse.json();
                setUsers(updatedUsers);
            }

            // Обновляем список групп
            const groupsResponseAfterUpdate = await fetch('/api/groups');
            if (groupsResponseAfterUpdate.ok) {
                const updatedGroups = await groupsResponseAfterUpdate.json();
                setGroups(updatedGroups);
            }

            // Сбрасываем выбор студента и очищаем данные
            setSelectedUser(null);
            setSchedule([]);
            setHomework([]);

            if (refreshStudents) refreshStudents();
        } catch (error) {
            console.error('Ошибка при переводе студента:', error);
            alert('Ошибка: ' + error.message);
        } finally {
            setIsDemoting(false);
        }
    };

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

        const newDate = new Date(dateInput);
        const newStartTime = timeInput;
        const newDuration = parseInt(durationInput) || 60;
        const newEndTime = calculateEndTime(newStartTime, newDuration);

        const hasConflict = schedule.some(item => {
            const itemDate = new Date(item.date);
            if (itemDate.toDateString() !== newDate.toDateString()) {
                return false;
            }

            const toMinutes = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };

            const newStart = toMinutes(newStartTime);
            const newEnd = toMinutes(newEndTime);
            const existStart = toMinutes(item.time);
            const existEnd = toMinutes(calculateEndTime(item.time, item.duration));

            return (newStart < existEnd && newEnd > existStart);
        });

        if (hasConflict) {
            alert('Ошибка: В выбранное время уже есть занятие. Пожалуйста, выберите другое время.');
            return;
        }

        const dayOfWeek = getShortDayOfWeek(newDate);

        const newScheduleItem = {
            student_id: selectedUser ? selectedUser._id : null,
            group_id: selectedGroup ? selectedGroup._id : null,
            day: dayOfWeek,
            date: newDate,
            time: newStartTime,
            duration: newDuration,
            subject: subjectInput,
            description: descriptionInput || '',
            attendance: false,
            grade: null
        };

        try {
            const response = await fetch('/api/schedules', {
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
                const errorData = await response.json();
                alert(errorData.error || 'Ошибка при добавлении занятия в расписание');
            }
        } catch (error) {
            console.error('Ошибка при добавлении занятия в расписание:', error);
            alert(error.message || 'Не удалось добавить занятие');
        }
    };

    const handleSaveGrade = async (id) => {
        try {
            const response = await fetch(`/api/schedules/${id}/updateGrade`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ grade: gradeValue }),
            });

            if (response.ok) {
                const updatedScheduleItem = await response.json();
                setSchedule(schedule.map(item => item._id === id ? updatedScheduleItem : item));
                setEditingGrade(null);
                setGradeValue('');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при сохранении оценки');
            }
        } catch (error) {
            console.error('Ошибка при сохранении оценки:', error);
            alert(error.message || 'Не удалось сохранить оценку');
        }
    };

    const handleAddToHomework = async () => {
        const dueDateInput = document.getElementById('dueDateInput').value;
        const filesInput = document.getElementById('filesInput').files;
        const commentInput = document.getElementById('commentInput').value;

        if (!dueDateInput || filesInput.length === 0) {
            alert('Пожалуйста, укажите дату выполнения и прикрепите файлы');
            return;
        }

        const formData = new FormData();
        if (selectedUser) formData.append('student_id', selectedUser._id);
        if (selectedGroup) formData.append('group_id', selectedGroup._id);
        formData.append('day', getShortDayOfWeek(new Date(dueDateInput)));
        formData.append('dueDate', dueDateInput);
        formData.append('comment', commentInput);

        for (let i = 0; i < filesInput.length; i++) {
            formData.append('files', filesInput[i]);
        }

        try {
            const response = await fetch('/api/homework', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при добавлении домашнего задания');
            }

            const savedHomeworkItem = await response.json();
            setHomework([...homework, savedHomeworkItem]);
            setIsAddingHomework(false);
            document.getElementById('dueDateInput').value = '';
            document.getElementById('filesInput').value = '';
            document.getElementById('commentInput').value = '';
        } catch (error) {
            console.error('Ошибка при добавлении домашнего задания:', error);
            alert(error.message || 'Не удалось добавить домашнее задание');
        }
    };

    const handleAttendanceChange = async (id, attendance) => {
        try {
            const response = await fetch(`/api/schedules/${id}/updateAttendance`, {
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

    const handleSaveHomeworkGrade = async (id, studentId) => {
        try {
            const gradeValueToSave = gradeValue ? parseInt(gradeValue) : null;

            const response = await fetch(`/api/homework/${id}/grade/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ grade: gradeValueToSave }),
            });

            if (response.ok) {
                const updatedHomework = await response.json();
                setHomework(homework.map(item =>
                    item._id === id ? updatedHomework : item
                ));
                setEditingGrade(null);
                setGradeValue('');
            } else {
                throw new Error('Ошибка при обновлении оценки');
            }
        } catch (error) {
            console.error('Ошибка при сохранении оценки:', error);
            alert('Не удалось сохранить оценку');
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

            const hasConflict = schedule.some(item => {
                if (item._id === editing) return false;

                const itemDate = new Date(item.date);
                const updatedDate = new Date(updatedItem.date);
                if (itemDate.toDateString() !== updatedDate.toDateString()) {
                    return false;
                }

                const toMinutes = (timeStr) => {
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    return hours * 60 + minutes;
                };

                const newStart = toMinutes(updatedItem.time);
                const newEnd = toMinutes(calculateEndTime(updatedItem.time, updatedItem.duration));
                const existStart = toMinutes(item.time);
                const existEnd = toMinutes(calculateEndTime(item.time, item.duration));

                return (newStart < existEnd && newEnd > existStart);
            });

            if (hasConflict) {
                alert('Ошибка: В выбранное время уже есть занятие. Пожалуйста, выберите другое время.');
                return;
            }

            try {
                const response = await fetch(`/api/schedules/${editing}`, {
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
            const response = await fetch(`/api/schedules/${id}`, {
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
            const response = await fetch('/api/schedules/deleteMultiple', {
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

    const handleDeleteHomework = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить это домашнее задание?')) return;

        try {
            const response = await fetch(`/api/homework/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setHomework(homework.filter(item => item._id !== id));
                setSelectedHomeworkItems(selectedHomeworkItems.filter(itemId => itemId !== id));
            } else {
                throw new Error('Ошибка при удалении домашнего задания');
            }
        } catch (error) {
            console.error('Ошибка при удалении домашнего задания:', error);
            alert('Не удалось удалить домашнее задание');
        }
    };

    const handleDeleteSelectedHomework = async () => {
        if (selectedHomeworkItems.length === 0) return;
        if (!window.confirm(`Вы уверены, что хотите удалить ${selectedHomeworkItems.length} выбранных заданий?`)) return;

        try {
            const response = await fetch('/api/homework/deleteMultiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedHomeworkItems }),
            });

            if (response.ok) {
                setHomework(homework.filter(item => !selectedHomeworkItems.includes(item._id)));
                setSelectedHomeworkItems([]);
            } else {
                throw new Error('Ошибка при удалении заданий');
            }
        } catch (error) {
            console.error('Ошибка при удалении заданий:', error);
            alert('Не удалось удалить выбранные задания');
        }
    };

    const handleSelectHomeworkItem = (id) => {
        setSelectedHomeworkItems(prevSelectedItems =>
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

    const getFileIcon = (filename) => {
        if (!filename) return <BsFiletypeTxt className="file-icon" />;
        const extension = typeof filename === 'string'
            ? filename.split('.').pop().toLowerCase()
            : '';
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
                <div className="name-and-actions">
                    <h3 className='name-division'>
                        {selectedUser ? `${selectedUser.surname} ${selectedUser.name} ${selectedUser.patronymic}` : 'Выберите студента'}
                        {selectedGroup && ` - ${selectedGroup.name}`}
                    </h3>
                    {selectedUser && (
                        <button
                            className="demote-student-button"
                            onClick={() => setShowDemoteModal(true)}
                        >
                            Убрать из студентов
                        </button>
                    )}
                </div>
                <div className='mode-switcher'>
                    <button
                        className={`mode-button-scheduleeditor ${mode === 'lessons' ? 'active' : ''}`}
                        onClick={() => setMode('lessons')}
                    >
                        Занятия
                    </button>
                    <button
                        className={`mode-button-scheduleeditor ${mode === 'homework' ? 'active' : ''}`}
                        onClick={() => setMode('homework')}
                    >
                        Домашнее задание
                    </button>
                </div>
            </div>

            {showDemoteModal && (
                <div className="modal-overlay">
                    <div className="demote-modal">
                        <h3>Подтверждение действия</h3>
                        <p>Вы точно хотите перевести {selectedUser.surname} {selectedUser.name} в обычные пользователи?</p>

                        <div className="delete-records-option">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={deleteRecords}
                                    onChange={(e) => setDeleteRecords(e.target.checked)}
                                />
                                Удалить все связанные записи (расписание и ДЗ)
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => {
                                    setShowDemoteModal(false);
                                    setDeleteRecords(false);
                                }}
                                disabled={isDemoting}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDemoteStudent}
                                disabled={isDemoting}
                                className="confirm-button"
                            >
                                {isDemoting ? 'Выполняется...' : 'Подтвердить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mode === 'lessons' ? (
                <>
                    <div className="add-lesson-form">
                        <div className="form-group">
                            <label htmlFor="dateInput">Дата</label>
                            <input type="date" id="dateInput" className="scheduleeditor-form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="timeInput">Время начала</label>
                            <input type="time" id="timeInput" className="scheduleeditor-form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="durationInput">Продолжительность (мин)</label>
                            <input
                                type="number"
                                id="durationInput"
                                className="scheduleeditor-form-input"
                                min="30"
                                step="30"
                                defaultValue="60"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleSelect">Предмет</label>
                            <select id="exampleSelect" className="scheduleeditor-form-input">
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
                                className="scheduleeditor-form-input"
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
                                    <th style={{ width: '100px' }}>Оценка</th>
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
                                                    <div className='grade-edit-container'>
                                                        {editingGrade === item._id ? (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max="5"
                                                                    value={gradeValue}
                                                                    onChange={(e) => setGradeValue(e.target.value)}
                                                                    className="grade-input"
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveGrade(item._id)}
                                                                    className="scheduleeditor-action-button save-button"
                                                                >
                                                                    <FiCheck />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingGrade(null);
                                                                        setGradeValue('');
                                                                    }}
                                                                    className="scheduleeditor-action-button cancel-button"
                                                                >
                                                                    <FiX />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {item.grade ? (
                                                                    <span className={`grade-badge grade-${item.grade}`}>
                                                                        {item.grade}
                                                                    </span>
                                                                ) : (
                                                                    <span>-</span>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingGrade(item._id);
                                                                        setGradeValue(item.grade || '');
                                                                    }}
                                                                    className="scheduleeditor-action-button edit-button"
                                                                >
                                                                    <FiEdit2 />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="row-actions">
                                                        {editing === item._id ? (
                                                            <>
                                                                <button
                                                                    onClick={handleSave}
                                                                    className="scheduleeditor-action-button save-button"
                                                                >
                                                                    <FiCheck />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancel}
                                                                    className="scheduleeditor-action-button cancel-button"
                                                                >
                                                                    <FiX />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(item._id)}
                                                                    className="scheduleeditor-action-button edit-button"
                                                                >
                                                                    <FiEdit2 />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item._id)}
                                                                    className="scheduleeditor-action-button delete-button"
                                                                >
                                                                    <FiTrash2 />
                                                                </button>
                                                            </>
                                                        )}
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

                        {selectedHomeworkItems.length > 0 && (
                            <button
                                onClick={handleDeleteSelectedHomework}
                                className="delete-selected-button"
                            >
                                <FiTrash2 /> Удалить выбранные ({selectedHomeworkItems.length})
                            </button>
                        )}
                    </div>
                    {isAddingHomework && (
                        <div className="add-homework-form">
                            <div className="form-group">
                                <label htmlFor="dueDateInput">Дата выполнения</label>
                                <input type="date" id="dueDateInput" className="scheduleeditor-form-input" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="commentInput">Комментарий</label>
                                <input type="text" id="commentInput" className="scheduleeditor-form-input" placeholder="Введите комментарий" />
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
                                    <th style={{ width: '40px' }}></th>
                                    <th>День</th>
                                    <th>Выполнить до</th>
                                    <th>Файлы задания</th>
                                    <th>Комментарий</th>
                                    <th>Ответ</th>
                                    <th>Оценка</th>
                                    <th style={{ width: '80px' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {homework.length > 0 ? (
                                    homework.map((item) => (
                                        <tr key={item._id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedHomeworkItems.includes(item._id)}
                                                    onChange={() => handleSelectHomeworkItem(item._id)}
                                                    className="row-checkbox"
                                                />
                                            </td>
                                            <td>{item.day}</td>
                                            <td>{formatDate(item.dueDate)}</td>
                                            <td>
                                                <div className="scheduleeditor-files-list">
                                                    {item.files.map((file, idx) => (
                                                        <div key={idx} className="scheduleeditor-file-item">
                                                            {getFileIcon(file)}
                                                            <a
                                                                href={`/homework/${file}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                                className="scheduleeditor-file-link"
                                                            >
                                                                {file}
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>{item.comment || '-'}</td>
                                            <td>
                                                {item.answer && item.answer.length > 0 ? (
                                                    <div className="scheduleeditor-files-list">
                                                        {item.answer.map((answer, idx) => (
                                                            <div key={idx} className="scheduleeditor-file-item">
                                                                {getFileIcon(answer.file)}
                                                                <a
                                                                    href={`/homework/${answer.file}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    download
                                                                    className="scheduleeditor-file-link"
                                                                >
                                                                    {answer.file}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="no-answer">Нет ответа</span>
                                                )}
                                            </td>
                                            <td>
                                                {editingGrade === item._id ? (
                                                    <div className="grade-edit-container">
                                                        <input
                                                            type="number"
                                                            value={gradeValue}
                                                            onChange={(e) => setGradeValue(e.target.value)}
                                                            className="grade-input"
                                                            min="1"
                                                            max="5"
                                                        />
                                                        <div className="grade-edit-actions">
                                                            <button
                                                                onClick={() => handleSaveHomeworkGrade(item._id, selectedUser._id)}
                                                                className="scheduleeditor-action-button save-button"
                                                            >
                                                                <FiCheck />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingGrade(null);
                                                                    setGradeValue('');
                                                                }}
                                                                className="scheduleeditor-action-button cancel-button"
                                                            >
                                                                <FiX />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grade-display">
                                                        {item.grades?.[selectedUser?._id] ? (
                                                            <span className={`grade-badge grade-${item.grades[selectedUser._id]}`}>
                                                                {item.grades[selectedUser._id]}
                                                            </span>
                                                        ) : (
                                                            <span className="no-grade">-</span>
                                                        )}
                                                        {selectedUser && (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingGrade(item._id);
                                                                    setGradeValue(item.grades?.[selectedUser._id] || '');
                                                                }}
                                                                className="scheduleeditor-action-button edit-button"
                                                            >
                                                                <FiEdit2 />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteHomework(item._id)}
                                                    className="scheduleeditor-action-button delete-button"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="no-data-row">
                                        <td colSpan="7">Нет данных о домашних заданиях</td>
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
