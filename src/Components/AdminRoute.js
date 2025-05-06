import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const role = localStorage.getItem('role');
    return role === 'admin' ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
