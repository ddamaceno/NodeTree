import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LinkForm } from './components/LinkForm';
import { EditProfileModal } from './components/EditProfileModal';
import { SortableLinkList } from './components/SortableLinkList';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getLinksByUser, type Link, type User } from './services/api';
import './App.css';

function AdminApp() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const { user: authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const fetchLinks = async () => {
    if (!authUser) return;
    try {
      const data = await getLinksByUser(authUser.id);
      setLinks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser && !authLoading) {
      fetchLinks();
    }
  }, [authUser, authLoading]);

  const handleSaveProfile = (updatedUser: User) => {
    if (authUser) {
      authUser.displayName = updatedUser.displayName;
      authUser.bio = updatedUser.bio;
      authUser.location = updatedUser.location;
      authUser.avatar = updatedUser.avatar;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (authLoading) {
    return (
      <div className="page">
        <div className="container">
          <p className="loading">Carregando...</p>
        </div>
      </div>
    );
  }

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
            {authUser?.avatar ? (
              <img src={`http://localhost:3001${authUser.avatar}`} alt="Avatar" />
            ) : (
              <span>{getInitials(authUser?.displayName || null)}</span>
            )}
          </div>
          <h1>{authUser?.displayName || 'Seu nome'}</h1>
          <p className="bio">{authUser?.bio || 'Sua bio'}</p>
          <p className="location">📍 {authUser?.location || 'Seu local'}</p>
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
                userId={authUser?.id || ''}
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminApp />
            </ProtectedRoute>
          } />
          <Route path="/:slug" element={<PublicProfile />} />
          <Route path="/" element={<Navigate to="/teste" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function PublicProfile() {
  const { slug } = useParams();
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchPublicData();
  }, [slug]);

  const fetchPublicData = async () => {
    try {
      const userRes = await fetch(`http://localhost:3001/api/users/${slug}`);
      if (!userRes.ok) throw new Error('Usuário não encontrado');
      const userData = await userRes.json();
      setUser(userData);

      const linksRes = await fetch(`http://localhost:3001/api/links/public/${slug}`);
      const linksData = await linksRes.json();
      setLinks(linksData);
    } catch (error) {
      console.error('Erro ao carregar dados públicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) return <p>Carregando...</p>;
  if (!user) return <p>Usuário não encontrado</p>;

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
              <span>{getInitials(user?.displayName)}</span>
            )}
          </div>
          <h1>{user?.displayName}</h1>
          <p className="bio">{user?.bio}</p>
          {user?.location && <p className="location">📍 {user?.location}</p>}
        </header>

        <section className="links-section">
          {links.length === 0 ? (
            <p className="no-links">Nenhum link disponível ainda.</p>
          ) : (
            <div className="links-list">
              {links.map(link => (
                <a
                  key={link.id}
                  href="#"
                  className="link-card"
                  onClick={async (e) => {
                    e.preventDefault();
                    await fetch(`http://localhost:3001/api/links/${link.id}/click`, { method: 'POST' });
                    window.open(link.url, '_blank');
                  }}
                >
                  <div className="link-title">{link.title}</div>
                  {link.description && <p className="link-desc">{link.description}</p>}
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
