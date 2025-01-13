import React, { useEffect, useState } from 'react';
import iconadd from "../img/icon-add.png";
import "../Components/style/ScheduleEditor.css";

const ScheduleEditor = ({ selectedUser }) => {
    const [schedule, setSchedule] = useState([]);
    const [editing, setEditing] = useState(null); // Состояние для отслеживания редактируемой строки
    const [editValues, setEditValues] = useState({}); // Состояние для временного хранения значений редактируемых ячеек
    const [selectedItems, setSelectedItems] = useState([]); // Состояние для отслеживания выбранных записей

    useEffect(() => {
        if (selectedUser) {
            fetch(`http://localhost:3001/api/schedules/${selectedUser._id}`)
                .then(response => response.json())
                .then(data => setSchedule(data))
                .catch(error => console.error('Ошибка при получении расписания:', error));
        }
    }, [selectedUser]);

    const handleAddToSchedule = async () => {
        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        const subjectInput = document.getElementById('exampleSelect').value;
        const descriptionInput = document.getElementById('descriptionInput').value;

        const dateObj = new Date(dateInput);
        const dayOfWeek = getShortDayOfWeek(dateObj);

        const newScheduleItem = {
            student_id: selectedUser._id,
            day: dayOfWeek,
            date: dateObj, // Отправляем дату как объект Date
            time: timeInput,
            subject: subjectInput,
            description: descriptionInput
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
            } else {
                throw new Error('Ошибка при добавлении занятия в расписание');
            }
        } catch (error) {
            console.error('Ошибка при добавлении занятия в расписание:', error);
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

    const handleEdit = (id, field, value) => {
        setEditing(id);
        setEditValues(prevValues => ({
            ...prevValues,
            [field]: value
        }));
    };

    const handleInputChange = (field, value) => {
        setEditValues(prevValues => ({
            ...prevValues,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (editing) {
            const updatedSchedule = schedule.map(item => {
                if (item._id === editing) {
                    const dateObj = editValues.date ? new Date(editValues.date) : new Date(item.date);
                    const dayOfWeek = getShortDayOfWeek(dateObj);
                    return { ...item, ...editValues, day: dayOfWeek, date: dateObj };
                }
                return item;
            });

            try {
                const response = await fetch(`http://localhost:3001/api/schedules/${editing}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedSchedule.find(item => item._id === editing)),
                });

                if (response.ok) {
                    setSchedule(updatedSchedule);
                    setEditing(null);
                    setEditValues({});
                } else {
                    throw new Error('Ошибка при сохранении изменений');
                }
            } catch (error) {
                console.error('Ошибка при сохранении изменений:', error);
            }
        }
    };

    const handleCancel = () => {
        setEditing(null);
        setEditValues({});
    };

    const handleDelete = async (id) => {
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
        }
    };

    const handleDeleteSelected = async () => {
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
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prevSelectedItems =>
            prevSelectedItems.includes(id)
                ? prevSelectedItems.filter(itemId => itemId !== id)
                : [...prevSelectedItems, id]
        );
    };

    const formatDate = (date) => {
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    const getShortDayOfWeek = (date) => {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        const daysOfWeek = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
        return daysOfWeek[date.getDay()];
    };

    return (
        <div className="schedule-edit">
            <div className="info">
                <div className="window-padding">
                    <div className="name-student">
                        <p>
                            {selectedUser ? `${selectedUser.surname} ${selectedUser.name} ${selectedUser.patronymic}` : 'NAME'}
                        </p>
                    </div>
                    <div className="menu-add">
                        <div><input type="date" id="dateInput" /></div>
                        <div><input type="time" id="timeInput" placeholder="" /></div>
                        <div>
                            <label htmlFor="exampleSelect">Предмет:</label>
                            <select id="exampleSelect" name="exampleSelect">
                                <option value="Алгебра">Алгебра</option>
                                <option value="Геометрия">Геометрия</option>
                            </select>
                        </div>
                        <div><input className="input-description" type="text" id="descriptionInput" placeholder="Описание" /></div>
                        <div className="div-icon-add" onClick={handleAddToSchedule}>
                            <img className="img-icon-add" src={iconadd} alt="Add Icon" />
                        </div>
                    </div>
                    <div className="table-container">
                        {selectedItems.length > 0 && (
                            <button onClick={handleDeleteSelected} className="delete-selected-button">Удалить выбранные</button>
                        )}
                        <table id="dataTable">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>День</th>
                                    <th>Дата</th>
                                    <th>Время</th>
                                    <th>Предмет</th>
                                    <th>Описание</th>
                                    <th>Посещаемость</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item._id)}
                                                onChange={() => handleSelectItem(item._id)}
                                            />
                                        </td>
                                        <td>
                                            {getShortDayOfWeek(new Date(item.date))}
                                        </td>
                                        <td onClick={() => handleEdit(item._id, 'date', item.date)}>
                                            {editing === item._id ? (
                                                <input
                                                    type="date"
                                                    value={editValues.date || formatDate(new Date(item.date))}
                                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                                />
                                            ) : (
                                                formatDate(new Date(item.date))
                                            )}
                                        </td>
                                        <td onClick={() => handleEdit(item._id, 'time', item.time)}>
                                            {editing === item._id ? (
                                                <input
                                                    type="time"
                                                    value={editValues.time || item.time}
                                                    onChange={(e) => handleInputChange('time', e.target.value)}
                                                />
                                            ) : (
                                                item.time
                                            )}
                                        </td>
                                        <td onClick={() => handleEdit(item._id, 'subject', item.subject)}>
                                            {editing === item._id ? (
                                                <input
                                                    type="text"
                                                    value={editValues.subject !== undefined ? editValues.subject : item.subject}
                                                    onChange={(e) => handleInputChange('subject', e.target.value)}
                                                />
                                            ) : (
                                                item.subject
                                            )}
                                        </td>
                                        <td className="description-cell" onClick={() => handleEdit(item._id, 'description', item.description)}>
                                            {editing === item._id ? (
                                                <input
                                                    type="text"
                                                    value={editValues.description !== undefined ? editValues.description : item.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                />
                                            ) : (
                                                item.description
                                            )}
                                        </td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={item.attendance}
                                                onChange={() => handleAttendanceChange(item._id, !item.attendance)}
                                            />
                                        </td>
                                        <td>
                                            {editing === item._id ? (
                                                <>
                                                    <button onClick={handleSave}>Применить</button>
                                                    <button onClick={handleCancel}>Отмена</button>
                                                </>
                                            ) : (
                                                <button onClick={() => handleDelete(item._id)}>Удалить</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleEditor;
