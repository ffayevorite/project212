import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import LoginPage from './components/LoginPage';
import Catalog from './components/Catalog';
import AuthSuccess from './components/AuthSuccess';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}