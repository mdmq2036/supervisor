import { useState } from 'react';
import { supabase } from '../config/supabase';
import { Search, Calendar, FileText, Image as ImageIcon } from 'lucide-react';

export default function ConsultaSupervision({ supervisor }) {
    const [filters, setFilters] = useState({
        fechaInicio: '',
        fechaFin: '',
        cuentaContrato: ''
    });

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let query = supabase
                .from('supervisiones')
                .select('*')
                .eq('supervisor_id', supervisor.id)
                .order('fecha', { ascending: false });

            if (filters.fechaInicio) {
                query = query.gte('fecha', filters.fechaInicio);
            }
            if (filters.fechaFin) {
                query = query.lte('fecha', filters.fechaFin);
            }
            if (filters.cuentaContrato) {
                query = query.ilike('cuenta_contrato', `%${filters.cuentaContrato}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            setResults(data || []);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al buscar supervisiones');
        } finally {
            setLoading(false);
        }
    };

    const viewDetails = (record) => {
        setSelectedRecord(record);
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '1.5rem' }}>Consultar Supervisiones</h1>

            <div className="card">
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                    Filtros de Búsqueda
                </h2>

                <form onSubmit={handleSearch}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Fecha Inicio</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.fechaInicio}
                                onChange={(e) => setFilters(prev => ({ ...prev, fechaInicio: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fecha Fin</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.fechaFin}
                                onChange={(e) => setFilters(prev => ({ ...prev, fechaFin: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Cuenta/Contrato</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Buscar por cuenta o contrato..."
                            value={filters.cuentaContrato}
                            onChange={(e) => setFilters(prev => ({ ...prev, cuentaContrato: e.target.value }))}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        <Search size={20} style={{ marginRight: '0.5rem' }} />
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>
            </div>

            {results.length > 0 && (
                <div className="card">
                    <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                        Resultados ({results.length})
                    </h2>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Cuenta/Contrato</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Observación I</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((record) => (
                                    <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <Calendar size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            {new Date(record.fecha).toLocaleDateString('es-ES')}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{record.cuenta_contrato}</td>
                                        <td style={{ padding: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {record.observacion1 || '-'}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <button
                                                onClick={() => viewDetails(record)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                            >
                                                <FileText size={16} style={{ marginRight: '0.5rem' }} />
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedRecord && (
                <div className="loading-overlay" onClick={() => setSelectedRecord(null)}>
                    <div
                        className="card"
                        style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                            Detalles de Supervisión
                        </h2>

                        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                            <div>
                                <strong style={{ color: 'var(--text-muted)' }}>Fecha:</strong>
                                <p>{new Date(selectedRecord.fecha).toLocaleDateString('es-ES')}</p>
                            </div>
                            <div>
                                <strong style={{ color: 'var(--text-muted)' }}>Cuenta/Contrato:</strong>
                                <p>{selectedRecord.cuenta_contrato}</p>
                            </div>
                            <div>
                                <strong style={{ color: 'var(--text-muted)' }}>Cuenta Nueva:</strong>
                                <p>{selectedRecord.cuenta_nueva || '-'}</p>
                            </div>
                            <div>
                                <strong style={{ color: 'var(--text-muted)' }}>Número de Medidor:</strong>
                                <p>{selectedRecord.numero_medidor || '-'}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <strong style={{ color: 'var(--text-muted)' }}>Observación I:</strong>
                            <p>{selectedRecord.observacion1 || '-'}</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <strong style={{ color: 'var(--text-muted)' }}>Observación II:</strong>
                            <p>{selectedRecord.observacion2 || '-'}</p>
                        </div>

                        <div>
                            <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
                                <ImageIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Fotografías:
                            </strong>
                            <div className="photo-upload-grid">
                                {[1, 2, 3, 4, 5].map((num) => {
                                    const photoUrl = selectedRecord[`foto${num}_url`];
                                    return photoUrl ? (
                                        <div key={num} style={{
                                            aspectRatio: '1',
                                            background: 'var(--input-bg)',
                                            borderRadius: '0.5rem',
                                            overflow: 'hidden'
                                        }}>
                                            <img
                                                src={photoUrl}
                                                alt={`Foto ${num}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedRecord(null)}
                            className="btn btn-primary btn-block"
                            style={{ marginTop: '1.5rem' }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
