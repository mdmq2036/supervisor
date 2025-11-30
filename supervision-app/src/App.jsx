import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Header from './components/Header';
import RegistroSupervision from './pages/RegistroSupervision';
import ConsultaSupervision from './pages/ConsultaSupervision';
import './index.css';

function App() {
  const [supervisor, setSupervisor] = useState(null);

  const handleLogin = (supervisorData) => {
    setSupervisor(supervisorData);
  };

  const handleLogout = () => {
    setSupervisor(null);
  };

  if (!supervisor) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Header supervisor={supervisor} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Navigate to="/registro" replace />} />
        <Route path="/registro" element={<RegistroSupervision supervisor={supervisor} />} />
        <Route path="/consulta" element={<ConsultaSupervision supervisor={supervisor} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
