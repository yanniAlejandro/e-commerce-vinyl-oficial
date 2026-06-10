import { useRef, useState } from 'react';
import { uploadCoverImage } from '../../shared/api/client';

interface CoverUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';

export function CoverUpload({ value, onChange }: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadCoverImage(file);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="cover-upload form-group form-group--full">
      <label className="label">Portada del disco</label>

      <div className="cover-upload__row">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="cover-upload__input"
          disabled={uploading}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Subiendo a Cloudinary...' : 'Elegir imagen'}
        </button>
        <span className="cover-upload__hint">JPG, PNG o WebP · máx. 5 MB</span>
      </div>

      {error && <p className="error-msg" role="alert">{error}</p>}

      {value && (
        <div className="cover-upload__preview">
          <img src={value} alt="Vista previa de la portada" />
          <div className="cover-upload__meta">
            <p className="cover-upload__url">{value}</p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange('')}>
              Quitar
            </button>
          </div>
        </div>
      )}

      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label htmlFor="image_url">O pegar URL manual</label>
        <input
          id="image_url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
        />
      </div>
    </div>
  );
}
