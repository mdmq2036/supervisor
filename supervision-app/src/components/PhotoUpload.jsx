import { useState } from 'react';
import { Upload, X } from 'lucide-react';

export default function PhotoUpload({ photos, onChange, maxPhotos = 5 }) {
    const handleFileChange = (index, file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newPhotos = [...photos];
                newPhotos[index] = {
                    file,
                    preview: e.target.result,
                    name: file.name
                };
                onChange(newPhotos);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = (index) => {
        const newPhotos = [...photos];
        newPhotos[index] = null;
        onChange(newPhotos);
    };

    return (
        <div className="photo-upload-grid">
            {Array.from({ length: maxPhotos }).map((_, index) => (
                <div key={index} className="photo-box">
                    {photos[index] ? (
                        <>
                            <img src={photos[index].preview} alt={`Foto ${index + 1}`} />
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: 'rgba(0,0,0,0.7)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={18} color="white" />
                            </button>
                        </>
                    ) : (
                        <label style={{ cursor: 'pointer', textAlign: 'center', padding: '1rem' }}>
                            <Upload size={32} color="var(--text-muted)" />
                            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Foto {index + 1}
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(index, e.target.files[0])}
                            />
                        </label>
                    )}
                </div>
            ))}
        </div>
    );
}
