import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [refreshApp, setRefreshApp] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [announcement, setAnnouncement] = useState(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  useEffect(() => {
    fetch('http://localhost:5000/api/announcements/active')
      .then(r => r.json())
      .then(data => { if (data?._id) setAnnouncement(data); })
      .catch(() => {});
  }, []);

  const dismissAnnouncement = () => setAnnouncementDismissed(true);

  return (
    <AppContext.Provider value={{
      refreshApp, setRefreshApp,
      darkMode, toggleDarkMode,
      announcement, announcementDismissed, dismissAnnouncement,
    }}>
      {children}
    </AppContext.Provider>
  );
};
