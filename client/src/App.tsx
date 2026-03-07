import { useState, useEffect } from 'react';
import { LinkForm } from './components/LinkForm';
import { getLinksByUser } from './services/api';
import type { Link } from './services/api';
import './App.css';

const USER_ID = '3487a01f-caca-4a92-a25c-12e00a5cec80';

function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchLinks = async () => {
    try {
      const data = await getLinksByUser(USER_ID);
      setLinks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <header className="profile">
          <div className="avatar">
            <span>DD</span>
          </div>
          <h1>Daniel Damaceno</h1>
          <p className="bio">Desenvolvedor & Consultor</p>
          <p className="location">📍 Brasil</p>
        </header>

        <section className="links-section">
          {loading ? (
            <p className="loading">Carregando...</p>
          ) : links.length === 0 ? (
            <p className="no-links">Nenhum link disponível ainda.</p>
          ) : (
            links.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="link-card">
                {link.title}
              </a>
            ))
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
    </div>
  );
}

export default App;
