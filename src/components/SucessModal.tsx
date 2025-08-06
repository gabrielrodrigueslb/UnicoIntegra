// src/components/SuccessModal.tsx
import './SuccessModal.scss';

interface Props {
  onClose: () => void;
  base64: string;
  filename: string;
}

export function SuccessModal({ onClose, base64, filename }: Props) {
  const handleDownload = () => {
    const blob = new Blob([base64], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-popup">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="modal-body">
          <h2>✅ IVR Gerado!</h2>
          <p>Seu arquivo está pronto para download.</p>
          <button className="btn-success" onClick={handleDownload}>
            Baixar IVR
          </button>
        </div>
      </div>
    </div>
  );
}
