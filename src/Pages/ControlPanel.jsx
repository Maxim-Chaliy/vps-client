import React from 'react';
import { Link } from 'react-router-dom';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../Components/style/controlpanel.css";

const ControlPanel = () => {
    const widgets = [
        {
            title: "Учебные материалы",
            path: "/educmat",
            icon: "📚",
            color: "#4CAF50",
            description: "Управление учебными материалами и курсами"
        },
        {
            title: "Управление расписанием",
            path: "/editing",
            icon: "📅",
            color: "#2196F3",
            description: "Настройка расписания занятий"
        },
        {
            title: "Управление заявками",
            path: "/listapp",
            icon: "📋",
            color: "#FF9800",
            description: "Просмотр и обработка заявок"
        },
        {
            title: "Отзывы",
            path: "/reviews",
            icon: "⭐",
            color: "#FF5722",
            description: "Просмотр отзывов студентов и их родителей"
        },
        {
            title: "Занятость дня",
            path: "/employment",
            icon: "👨‍🏫",
            color: "#9C27B0",
            description: "Просмотр занятости на день/неделю"
        },
        {
            title: "Социальные сети",
            path: "/settings",
            icon: "⚙️",
            color: "#607D8B",
            description: "Ссылки на соцсети"
        },
    ];

    return (
        <>
            <Header />
            <main>
                <div className="control-panel">
                    <div className="panel-container">
                        <div className="panel-header">
                            <h1>Панель управления</h1>
                            <p>Централизованное управление всеми аспектами работы системы</p>
                        </div>
                        <div className="widgets-grid">
                            {widgets.map((widget, index) => (
                                <Link
                                    to={widget.path}
                                    key={index}
                                    className="widget"
                                    style={{ '--widget-color': widget.color }}
                                >
                                    <div className="widget-content">
                                        <div className="widget-icon-container">
                                            <span className="widget-icon">{widget.icon}</span>
                                        </div>
                                        <h3>{widget.title}</h3>
                                        <p>{widget.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default ControlPanel;