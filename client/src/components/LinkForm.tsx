import { useState } from 'react';
import { createLink } from '../services/api';

interface LinkFormData {
  title: string;
  url: string;
  userId: string;
  order?: number;
}

interface LinkFormProps {
  onSuccess?: () => void;
  userId: string;
}

export function LinkForm({ onSuccess, userId }: LinkFormProps) {
  const [formData, setFormData] = useState<LinkFormData>({
    title: '',
    url: '',
    userId: userId,
    order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await createLink(formData);
      setSuccess(true);
      setFormData({ 
        title: '', 
        url: '', 
        userId: userId, 
        order: 0 
      });
      onSuccess?.();
    } catch {
      setError('Erro ao criar link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="link-form">
      <div className="form-group">
        <label>Título</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Meu YouTube"
          required
        />
      </div>

      <div className="form-group">
        <label>URL</label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://..."
          required
        />
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">Link criado com sucesso!</p>}

      <button
        type="submit"
        disabled={loading}
        className="submit-btn"
      >
        {loading ? 'Salvando...' : 'Criar Link'}
      </button>
    </form>
  );
}
