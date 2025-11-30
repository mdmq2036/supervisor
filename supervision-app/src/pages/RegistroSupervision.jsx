import { useState } from 'react';
import { supabase } from '../config/supabase';
import { uploadToGoogleDrive } from '../utils/googleDrive';
import PhotoUpload from '../components/PhotoUpload';
import { Save, Loader } from 'lucide-react';

export default function RegistroSupervision({ supervisor }) {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        cuentaContrato: '',
        observacion1: '',
        observacion2: '',
        cuentaNueva: '',
        numeroMedidor: '',
        fecha: today
    });

    const [photos, setPhotos] = useState(Array(5).fill(null));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validar que al menos haya una foto
            const validPhotos = photos.filter(p => p !== null);
            if (validPhotos.length === 0) {
                setMessage({ type: 'error', text: 'Debe cargar al menos una foto' });
                setLoading(false);
                return;
            }

            // Subir fotos a Google Drive
            const photoUrls = [];
            for (let i = 0; i < photos.length; i++) {
                if (photos[i]) {
                    const result = await uploadToGoogleDrive(photos[i].file, {
                        supervisor: supervisor.username,
                        fecha: formData.fecha,
                        codigoContrato: formData.cuentaContrato
                    });
                    photoUrls.push(result.url);
                } else {
                    photoUrls.push(null);
                }
            }

            // Guardar en Supabase
            const { error } = await supabase
                .from('supervisiones')
                .insert({
                    supervisor_id: supervisor.id,
                    cuenta_contrato: formData.cuentaContrato,
                    observacion1: formData.observacion1,
                    observacion2: formData.observacion2,
                    cuenta_nueva: formData.cuentaNueva,
                    numero_medidor: formData.numeroMedidor,
                    fecha: formData.fecha,
                    foto1_url: photoUrls[0],
                    foto2_url: photoUrls[1],
                    foto3_url: photoUrls[2],
                    foto4_url: photoUrls[3],
                    foto5_url: photoUrls[4]
                });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Supervisión registrada exitosamente' });

            // Limpiar formulario
            setFormData({
                cuentaContrato: '',
                observacion1: '',
                observacion2: '',
                cuentaNueva: '',
                numeroMedidor: '',
                fecha: today
            });
            setPhotos(Array(5).fill(null));

        } catch (error) {
            console.error('Error:', error);
            setMessage({ type: 'error', text: 'Error al guardar la supervisión' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '1.5rem' }}>Nuevo Registro de Supervisión</h1>

            <form onSubmit={handleSubmit}>
                <div className="card">
                    <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                        Datos de la Cuenta
                    </h2>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Cuenta/Contrato *</label>
                            <input
                                type="text"
                                name="cuentaContrato"
                                className="form-input"
                                value={formData.cuentaContrato}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fecha</label>
                            <input
                                type="date"
                                name="fecha"
                                className="form-input"
                                value={formData.fecha}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Observación I</label>
                        <textarea
                            name="observacion1"
                            className="form-input"
                            rows="3"
                            value={formData.observacion1}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Observación II</label>
                        <textarea
                            name="observacion2"
                            className="form-input"
                            rows="3"
                            value={formData.observacion2}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Cuenta Nueva</label>
                            <input
                                type="text"
                                name="cuentaNueva"
                                className="form-input"
                                value={formData.cuentaNueva}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Número de Medidor</label>
                            <input
                                type="text"
                                name="numeroMedidor"
                                className="form-input"
                                value={formData.numeroMedidor}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                        Fotografías (Mínimo 1, Máximo 5)
                    </h2>
                    <PhotoUpload photos={photos} onChange={setPhotos} />
                </div>

                {message.text && (
                    <div style={{
                        padding: '1rem',
                        background: message.type === 'success'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        borderRadius: '0.5rem',
                        color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                        marginBottom: '1.5rem'
                    }}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                    style={{ fontSize: '1.125rem', padding: '1rem' }}
                >
                    {loading ? (
                        <>
                            <Loader size={20} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save size={20} style={{ marginRight: '0.5rem' }} />
                            Guardar Supervisión
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
