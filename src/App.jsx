import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Reviews from "./Pages/Reviews";
import Registration from "./Pages/Registration";
import Authorization from "./Pages/Authorization";
import Schedule from "./Pages/Schedule"; 
import Editing from "./Pages/Editing";
import "./Components/style/config.css";
const App = () => {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home"/>}/>
        <Route path="/home" element={<Home />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/registration" element={<Registration/>} />
        <Route path="/authorization" element={<Authorization/>} />
        <Route path="/schedule" element={<Schedule/>} />
        <Route path="/editing" element={<Editing/>} />
      </Routes>
    </Router>

  );
}

export default App;
