import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Регистрация компонентов Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AnalyticsSection = ({ applications }) => {
  // Подсчёт целей занятий
  const purposeCounts = applications.reduce((acc, app) => {
    const purpose = app.purpose || 'Не указана';
    acc[purpose] = (acc[purpose] || 0) + 1;
    return acc;
  }, {});

  // Подсчёт популярных часов
  const timeSlots = applications.reduce((acc, app) => {
    if (!app.startTime) return acc;
    const hour = app.startTime.split(':')[0];
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  // Данные для графика целей (Pie Chart)
  const purposeData = {
    labels: Object.keys(purposeCounts),
    datasets: [{
      data: Object.values(purposeCounts),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    }],
  };

  // Данные для графика времени (Bar Chart)
  const timeData = {
    labels: Object.keys(timeSlots).sort().map(h => `${h}:00`),
    datasets: [{
      label: 'Количество заявок',
      data: Object.keys(timeSlots).sort().map(h => timeSlots[h]),
      backgroundColor: '#36A2EB',
    }],
  };

  return (
    <div className="analytics-container">
      {/* Блок целей занятий */}
      <div className="analytics-card">
        <h3 className="analytics-title">Цели занятий</h3>
        <div className="progress-bars">
          {Object.entries(purposeCounts).map(([purpose, count]) => (
            <div key={purpose} className="progress-item">
              <div className="progress-label">
                <span>
                  {purpose === "Повышение успеваемости" ? "📈 " : 
                   purpose === "Подготовка к экзамену" ? "📚 " : "✨ "}
                  {purpose}
                </span>
                <span>{count} ({Math.round((count / applications.length) * 100)}%)</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(count / applications.length) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Блок популярных часов */}
      <div className="analytics-card">
        <h3 className="analytics-title">Популярные часы</h3>
        <div className="time-slots">
          {Object.entries(timeSlots)
            .sort(([hourA], [hourB]) => hourA - hourB)
            .map(([hour, count]) => (
              <div key={hour} className="time-slot">
                <span className="time">{hour.padStart(2, '0')}:00</span>
                <div className="slot-bar">
                  <div 
                    className="slot-fill"
                    style={{ 
                      width: `${(count / Math.max(...Object.values(timeSlots))) * 100}%`,
                      opacity: 0.7 + (count / Math.max(...Object.values(timeSlots))) * 0.3
                    }}
                  ></div>
                </div>
                <span className="count">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};