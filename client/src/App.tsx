import { useState, useEffect } from 'react';
import { LinkForm } from './components/LinkForm';
import { EditProfileModal } from './components/EditProfileModal';
import { SortableLinkList } from './components/SortableLinkList';
import { getLinksByUser, getCurrentUser, type Link, type User } from './services/api';
import './App.css';

const USER_ID = '3487a01f-caca-4a92-a25c-12e00a5cec80';

function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const fetchLinks = async () => {
    try {
      const data = await getLinksByUser(USER_ID);
      setLinks(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  useEffect(() => {
    fetchLinks();
    fetchUser();
  }, []);

  const handleSaveProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="page">
      <button className="theme-toggle" onClick={() => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
      }}>
        {darkMode ? '☀️' : '🌙'}
      </button>

      <div className="container">
        <header className="profile">
          <div className="avatar">
            {user?.avatar ? (
              <img src={`http://localhost:3001${user.avatar}`} alt="Avatar" />
            ) : (
              <span>{getInitials(user?.displayName || null)}</span>
            )}
          </div>
          <h1>{user?.displayName || 'Isaac Newton'}</h1>
          <p className="bio">{user?.bio || 'Matemático, físico, astrônomo, alquimista, teólogo e autor'}</p>
          <p className="location">📍 {user?.location || 'Londres'}</p>
          <button className="edit-profile-btn" onClick={() => setShowEditProfile(true)}>
            ✏️ Editar Perfil
          </button>
        </header>

        <section className="links-section">
          {loading ? (
            <p className="loading">Carregando...</p>
          ) : links.length === 0 ? (
            <p className="no-links">Nenhum link disponível ainda.</p>
          ) : (
            <SortableLinkList links={links} onLinksChange={fetchLinks} />
          )}
        </section>

        <footer className="footer">
          <button className="admin-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Fechar' : '+ Adicionar Link'}
          </button>

          {showForm && (
            <div className="admin-panel">
              <h3>Novo Link</h3>
              <LinkForm
                onSuccess={() => {
                  fetchLinks();
                  setShowForm(false);
                }}
              />
            </div>
          )}
        </footer>
      </div>

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default App;
