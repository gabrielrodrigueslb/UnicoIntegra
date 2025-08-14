import React from 'react';
import ReactDOM from 'react-dom/client';

import { Routes, BrowserRouter, Route } from 'react-router';
import LoginPage from './pages/LoginPage/LoginPage';
import App from './pages/Main/App';
import './main.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
