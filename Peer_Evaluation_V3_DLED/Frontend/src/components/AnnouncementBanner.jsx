function AnnouncementBanner({ message, onDismiss }) {
  return (
    <div className="announcement-banner">
      <span>📢 {message}</span>
      <button onClick={onDismiss} aria-label="Dismiss announcement">✕</button>
    </div>
  );
}

export default AnnouncementBanner;
