import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import App from './pages/Main/App';
import './globals.css';

function LegacyDocsRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={`/main${location.pathname}${location.search}${location.hash}`}
      replace
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/docs/*" element={<LegacyDocsRedirect />} />
        <Route path="/main/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
