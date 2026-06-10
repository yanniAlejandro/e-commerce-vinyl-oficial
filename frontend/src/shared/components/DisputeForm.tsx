import { useRef, useState } from 'react';
import type { Order } from '../types';
import { buildDisputeMailto } from '../utils/dispute';

interface DisputeFormProps {
  order: Order;
  customerName: string;
  customerEmail: string;
  managerEmail?: string;
}

const MAX_EVIDENCE_FILES = 5;
const MAX_FILE_SIZE_MB = 5;

export function DisputeForm({ order, customerName, customerEmail, managerEmail }: DisputeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleFilesChange = (files: FileList | null) => {
    if (!files) return;
    setError('');

    const selected = Array.from(files);
    const tooLarge = selected.find((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (tooLarge) {
      setError(`Cada archivo debe pesar menos de ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    const merged = [...evidenceFiles, ...selected].slice(0, MAX_EVIDENCE_FILES);
    if (merged.length < evidenceFiles.length + selected.length) {
      setError(`Puedes adjuntar hasta ${MAX_EVIDENCE_FILES} archivos de evidencia.`);
    }

    setEvidenceFiles(merged);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (message.trim().length < 10) {
      setError('Describe el problema con al menos 10 caracteres.');
      return;
    }

    setError('');
    const mailto = buildDisputeMailto({
      order,
      customerName,
      customerEmail,
      message: message.trim(),
      managerEmail,
      evidenceFileNames: evidenceFiles.map((file) => file.name),
    });

    setNotice(
      evidenceFiles.length > 0
        ? 'Se abrirá tu cliente de correo. Adjunta manualmente las fotos seleccionadas antes de enviar.'
        : 'Se abrirá tu cliente de correo con el mensaje preparado.',
    );
    window.location.href = mailto;
  };

  return (
    <div className="dispute-form">
      <h2>Enviar incidencia</h2>
      <p className="dispute-form__hint">
        Cuéntanos qué ocurrió con tu pedido. Si tienes fotos del daño o del paquete,
        súbelas como evidencia y luego envía el correo.
      </p>

      <label htmlFor="dispute-message" className="label">
        Descripción del problema
      </label>
      <textarea
        id="dispute-message"
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ej: el vinilo llegó rayado, la funda venía rota, falta un artículo..."
      />

      <div className="dispute-form__evidence">
        <div className="dispute-form__evidence-header">
          <label htmlFor="dispute-evidence" className="label">
            Evidencia (opcional)
          </label>
          <span className="dispute-form__evidence-limit">
            Hasta {MAX_EVIDENCE_FILES} imágenes · máx. {MAX_FILE_SIZE_MB} MB c/u
          </span>
        </div>

        <input
          ref={fileInputRef}
          id="dispute-evidence"
          type="file"
          accept="image/*"
          multiple
          className="dispute-form__file-input"
          onChange={(e) => handleFilesChange(e.target.files)}
          disabled={evidenceFiles.length >= MAX_EVIDENCE_FILES}
        />

        {evidenceFiles.length > 0 && (
          <ul className="dispute-form__evidence-list">
            {evidenceFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className="dispute-form__evidence-item">
                <span>{file.name}</span>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => removeFile(index)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error-msg" role="alert">{error}</p>}
      {notice && <p className="dispute-form__notice" role="status">{notice}</p>}

      <button type="button" className="btn btn--primary btn--block" onClick={handleSubmit}>
        Preparar y enviar correo
      </button>
    </div>
  );
}
