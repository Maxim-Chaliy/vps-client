import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../Components/style/schedule.css";
import "../Components/style/config.css"

const Schedule = () => {
    return (
        <>
            <Header />
            <main>
                <div className="block-schedule">
                    <div className="conteiner">
                        <div className="gap">
                            <div className ="flex-schedule">
                                <div className="day"><p className="teg-p-text-schedule-1">Понедельник</p></div>
                                <div className="date"><p className="teg-p-text-schedule-2">Дата</p></div>
                                <div className="metter_and_time"><p className="teg-p-text-schedule-3">ТЕМА И ВРЕМЯ</p></div>
                            </div>
                            <div className="flex-schedule">
                                <div className="day"><p className="teg-p-text-schedule-1">Вторник</p></div>
                                <div className="date"><p className="teg-p-text-schedule-2">Дата</p></div>
                                <div className="metter_and_time"><p className="teg-p-text-schedule-3">ТЕМА И ВРЕМЯ</p></div>
                            </div>
                            <div className="flex-schedule">
                                <div className="day"><p className="teg-p-text-schedule-1">Среда</p></div>
                                <div className="date"><p className="teg-p-text-schedule-2">Дата</p></div>
                                <div className="metter_and_time"><p className="teg-p-text-schedule-3">ТЕМА И ВРЕМЯ</p></div>
                            </div>
                            <div className="flex-schedule">
                                <div className="day"><p className="teg-p-text-schedule-1">Четверг</p></div>
                                <div className="date"><p className="teg-p-text-schedule-2">Дата</p></div>
                                <div className="metter_and_time"><p className="teg-p-text-schedule-3">ТЕМА И ВРЕМЯ</p></div>
                            </div>
                            <div className="flex-schedule">
                                <div className="day"><p className="teg-p-text-schedule-1">Пятница</p></div>
                                <div className="date"><p className="teg-p-text-schedule-2">Дата</p></div>
                                <div className="metter_and_time"><p className="teg-p-text-schedule-3">ТЕМА И ВРЕМЯ</p></div>
                            </div>
                            <div className="flex-schedule">
                                <div className="day"><p className="teg-p-text-schedule-1">Суббота</p></div>
                                <div className="date"><p className="teg-p-text-schedule-2">Дата</p></div>
                                <div className="metter_and_time"><p className="teg-p-text-schedule-3">ТЕМА И ВРЕМЯ</p></div>
                            </div>
                            <div className="flex-schedule">
                                <div className="day"><p className="teg-p-text-schedule-1">Воскресенье</p></div>
                                <div className="date"><p className="teg-p-text-schedule-2">Дата</p></div>
                                <div className="metter_and_time"><p className="teg-p-text-schedule-3">ТЕМА И ВРЕМЯ</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Schedule;
