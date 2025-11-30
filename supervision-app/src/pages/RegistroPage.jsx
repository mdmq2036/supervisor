import { useState } from 'react';
import { supabase } from '../config/supabase';
import { uploadToGoogleDrive } from '../utils/googleDrive';
import PhotoUpload from '../components/PhotoUpload';
import { Save, Loader } from 'lucide-react';

export default function RegistroPage({ supervisor }) {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        cuentaContrato: '',
        observacion1: '',
        observacion2: '',
        cuentaNueva: '',
        numeroMedidor: '',
        fecha: today
    });

    const [photos, setPhotos] = useState([null, null, null, null, null]);
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
            // Validar que haya al menos una foto
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
                .from('registros')
                .insert({
                    supervisor_id: supervisor.id,
                    cuenta_contrato: formData.cuentaContrato,
                    observacion_1: formData.observacion1,
                    observacion_2: formData.observacion2,
                    cuenta_nueva: formData.cuentaNueva,
                    numero_medidor: formData.numeroMedidor,
                    fecha: formData.fecha,
                    foto_1: photoUrls[0],
                    foto_2: photoUrls[1],
                    foto_3: photoUrls[2],
                    foto_4: photoUrls[3],
                    foto_5: photoUrls[4]
                });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Registro guardado exitosamente' });

            // Limpiar formulario
            setFormData({
                cuentaContrato: '',
                observacion1: '',
                observacion2: '',
                cuentaNueva: '',
                numeroMedidor: '',
                fecha: today
            });
            setPhotos([null, null, null, null, null]);

        } catch (error) {
            console.error('Error:', error);
            setMessage({ type: 'error', text: 'Error al guardar el registro' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>Nuevo Registro de Supervisión</h1>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '0.25rem',
                    background: message.type === 'success'
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                    color: message.type === 'success' ? 'var(--success)' : 'var(--error)'
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="card">
                    <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                        Datos del Contrato
                    </h2>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Cuenta Contrato *</label>
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
                            value={formData.observacion1}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Observación II</label>
                        <textarea
                            name="observacion2"
                            className="form-input"
                            value={formData.observacion2}
                            onChange={handleInputChange}
                            rows="3"
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
                        Fotografías
                    </h2>
                    <PhotoUpload photos={photos} onChange={setPhotos} />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                    style={{ fontSize: '1.1rem', padding: '1rem' }}
                >
                    {loading ? (
                        <>
                            <Loader size={20} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save size={20} style={{ marginRight: '0.5rem' }} />
                            Guardar Registro
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
