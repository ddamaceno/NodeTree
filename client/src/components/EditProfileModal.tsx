import { useState, useEffect } from 'react';
import { getCurrentUser, updateCurrentUser, uploadFile, type User } from '../services/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

export function EditProfileModal({ isOpen, onClose, onSave }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setAvatar(user.avatar || '');
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let avatarUrl = avatar;
      
      if (avatarFile) {
        const result = await uploadFile(avatarFile);
        avatarUrl = result.url;
      }

      const updatedUser = await updateCurrentUser({
        displayName,
        bio,
        location,
        avatar: avatarUrl,
      });

      onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Perfil</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group avatar-group">
              <label>Foto de perfil</label>
              <div className="avatar-preview">
                {avatar ? (
                  <img src={`http://localhost:3001${avatar}`} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">{getInitials(displayName)}</div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Sua bio"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Local</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Sua localização"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
