import { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";

function ProfileMenu({ user, onLogout, onProfile, darkMode, toggleDarkMode, onAvatarUpdate }) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleMenu = () => setOpen(o => !o);
  const handleProfile = () => { setOpen(false); onProfile(); };
  const handleLogout = () => { setOpen(false); onLogout(); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.profile-menu-container')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/user/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && onAvatarUpdate) onAvatarUpdate(data.profilePicture);
    } catch (err) {
      console.error('Avatar upload failed', err);
    }
    e.target.value = '';
  };

  const dropdownBg = darkMode ? '#1e1e3a' : '#fff';
  const dropdownColor = darkMode ? '#e0e0e0' : '#3f3d56';
  const dropdownBorder = darkMode ? '#2a2a4a' : '#e3e6f0';
  const itemColor = darkMode ? '#c0c0e0' : '#4a4e69';
  const dividerColor = darkMode ? '#2a2a4a' : '#f0f0f0';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleMenu}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, margin: 0, outline: 'none' }}
        aria-label="Profile menu"
      >
        {user.profilePicture ? (
          <img
            src={`http://localhost:5000${user.profilePicture}`}
            alt="avatar"
            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <FaUserCircle size={38} color="#4a4e69" />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 44,
          right: 0,
          background: dropdownBg,
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(60,60,120,0.13)',
          minWidth: 200,
          padding: '0.5rem 0',
          zIndex: 100,
          border: `1px solid ${dropdownBorder}`,
        }} className="profile-menu-container">

          {/* Header: name + last login */}
          <div style={{ padding: '0.75rem 1.25rem', color: dropdownColor, fontWeight: 600, borderBottom: `1px solid ${dividerColor}` }}>
            <div>{user.name || 'User'}</div>
            {user.lastLogin && (
              <div style={{ fontSize: '0.72rem', color: darkMode ? '#888' : '#aaa', fontWeight: 400, marginTop: 2 }}>
                Last login: {new Date(user.lastLogin).toLocaleString()}
              </div>
            )}
          </div>

          {/* Profile */}
          <button onClick={handleProfile} style={{
            width: '100%', background: 'none', border: 'none', color: itemColor,
            fontWeight: 500, fontSize: '1rem', textAlign: 'left',
            padding: '0.75rem 1.25rem', cursor: 'pointer',
            borderBottom: `1px solid ${dividerColor}`, transition: 'background 0.15s',
          }}>
            👤 Profile
          </button>

          {/* Upload Photo */}
          <button onClick={() => fileInputRef.current?.click()} style={{
            width: '100%', background: 'none', border: 'none', color: itemColor,
            fontWeight: 500, fontSize: '1rem', textAlign: 'left',
            padding: '0.75rem 1.25rem', cursor: 'pointer',
            borderBottom: `1px solid ${dividerColor}`, transition: 'background 0.15s',
          }}>
            📷 Upload Photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

          {/* Dark mode toggle */}
          <button onClick={() => { toggleDarkMode?.(); }} style={{
            width: '100%', background: 'none', border: 'none', color: itemColor,
            fontWeight: 500, fontSize: '1rem', textAlign: 'left',
            padding: '0.75rem 1.25rem', cursor: 'pointer',
            borderBottom: `1px solid ${dividerColor}`, transition: 'background 0.15s',
          }}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          {/* Logout */}
          <button onClick={handleLogout} style={{
            width: '100%', background: 'none', border: 'none', color: '#c0392b',
            fontWeight: 500, fontSize: '1rem', textAlign: 'left',
            padding: '0.75rem 1.25rem', cursor: 'pointer', transition: 'background 0.15s',
          }}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
