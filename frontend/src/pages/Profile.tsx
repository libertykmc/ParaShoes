import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Profile.css";

export default function Profile() {
  const { user, logout, updateAvatar, loading: authLoading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user]);

  const handleAvatarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrl.trim()) {
      setError("Введите URL аватара");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await updateAvatar(avatarUrl.trim());
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка обновления аватара"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (authLoading) {
    return <div className="profile-container">Загрузка...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Профиль пользователя</h1>
        <div style={{ marginBottom: 20 }}>
          <button
            className="update-button"
            onClick={() => navigate("/products")}
          >
            Товары
          </button>
        </div>
        <div className="profile-info">
          <div className="avatar-section">
            {user.avatar ? (
              <img src={user.avatar} alt="Аватар" className="avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            <p>
              <strong>Роль:</strong> {user.role}
            </p>
          </div>
        </div>

        <div className="avatar-form-section">
          <h2>Установить аватар</h2>
          <form onSubmit={handleAvatarSubmit}>
            <div className="form-group">
              <label htmlFor="avatarUrl">URL аватара</label>
              <input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="update-button">
              {loading ? "Обновление..." : "Обновить аватар"}
            </button>
          </form>
        </div>

        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </div>
    </div>
  );
}
