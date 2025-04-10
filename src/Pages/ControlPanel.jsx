import React from 'react';
import { Link } from 'react-router-dom';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../Components/style/controlpanel.css";

const ControlPanel = () => {
    const widgets = [
        { title: "Учебные материалы", path: "/educmat", icon: "📚", color: "#4CAF50" },
        { title: "Управление расписанием", path: "/editing", icon: "📅", color: "#2196F3" },
        { title: "Управление заявками", path: "/listapp", icon: "📋", color: "#FF9800" },
        { title: "Отзывы", path: "/reviews", icon: "⭐", color: "#FF5722" },
        { title: "Настройки", path: "/settings", icon: "⚙️", color: "#607D8B" },
    ];

    return (
        <>
            <Header />
            <main className="control-panel">
                <div className="panel-container">
                    <div className="panel-header">
                        <h1>Панель управления</h1>
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
                                </div>
                                <div className="widget-hover-indicator"></div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ControlPanel;