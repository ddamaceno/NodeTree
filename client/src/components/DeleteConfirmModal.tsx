import { useState } from 'react';
import { deleteLink } from '../services/api';

interface DeleteConfirmModalProps {
  linkId: string;
  linkTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmModal({ linkId, linkTitle, isOpen, onClose, onSuccess }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await deleteLink(linkId);
      onSuccess();
      onClose();
    } catch {
      setError('Erro ao deletar link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <span>⚠️</span>
        </div>
        
        <h2>Confirmar Deleção</h2>
        <p>Tem certeza que deseja deletar o link <strong>"{linkTitle}"</strong>?</p>
        <p className="warning">Esta ação não pode ser desfeita.</p>

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className="delete-btn" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deletando...' : 'Deletar'}
          </button>
        </div>
      </div>
    </div>
  );
}