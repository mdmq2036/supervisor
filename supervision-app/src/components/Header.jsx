import { Link, useLocation } from 'react-router-dom';
import { LogOut, FileText, Search } from 'lucide-react';

export default function Header({ supervisor, onLogout }) {
    const location = useLocation();

    return (
        <header className="header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Sistema de Supervisión</h2>
                <nav style={{ display: 'flex', marginLeft: '2rem' }}>
                    <Link
                        to="/registro"
                        className={`nav-link ${location.pathname === '/registro' ? 'active' : ''}`}
                    >
                        <FileText size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Nuevo Registro
                    </Link>
                    <Link
                        to="/consulta"
                        className={`nav-link ${location.pathname === '/consulta' ? 'active' : ''}`}
                    >
                        <Search size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Consultar
                    </Link>
                </nav>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                    Supervisor: <strong style={{ color: 'var(--text-color)' }}>{supervisor.nombre}</strong>
                </span>
                <button
                    onClick={onLogout}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                >
                    <LogOut size={18} style={{ marginRight: '0.5rem' }} />
                    Salir
                </button>
            </div>
        </header>
    );
}
