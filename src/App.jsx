import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Reviews from "./Pages/Reviews";
import Registration from "./Pages/Registration";
import Authorization from "./Pages/Authorization";
import Schedule from "./Pages/Schedule";
import Editing from "./Pages/Editing";
import EducMat from "./Pages/EducMat";
import SetMat from "./Pages/SetMat";
import "./Components/style/config.css";
import "./Components/style/buttonStyle.css";
import AppForm from "./Pages/ApplicationForm";
import ListApp from "./Pages/ListApplications";
import ScrollTop from "./Components/ScrollTop";
import ControlPanel from "./Pages/ControlPanel";
import Employment from "./Pages/Employment";
import VerifyEmail from "./Pages/VerifyEmail";
import AdminRoute from './Components/AdminRoute';
import PrivateRoute from './Components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Navigate to="/home"/>}/>
        <Route path="/home" element={<Home />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/registration" element={<Registration/>} />
        <Route path="/authorization" element={<Authorization/>} />
        <Route path="/appform" element={<AppForm/>} />
        <Route path="/verify-email" element={<VerifyEmail/>} />

        {/* Защищенные маршруты для авторизованных пользователей */}
        <Route element={<PrivateRoute />}>
          <Route path="/schedule" element={<Schedule/>} />
          <Route path="/appform" element={<AppForm/>} />
          <Route path="/educmat" element={<EducMat/>} />

          {/* Защищенные маршруты для админов */}
          <Route element={<AdminRoute />}>
            <Route path="/listapp" element={<ListApp/>} />
            <Route path="/editing" element={<Editing/>} />
            <Route path="/controlpanel" element={<ControlPanel/>} />
            <Route path="/employment" element={<Employment/>} />
            <Route path="/setmat" element={<SetMat/>} />
            <Route path="/setmat/:id" element={<SetMat/>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
