export const containerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  minHeight: '100vh',
  minWidth: '100vw',
  height: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  padding: '2rem',
  boxSizing: 'border-box',
  zIndex: 0
};

export const sidebarStyle = {
  width: '250px',
  background: 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)',
  color: 'white',
  padding: '2rem 1rem',
  borderTopRightRadius: '20px',
  borderBottomRightRadius: '20px',
  boxShadow: '4px 0 20px rgba(30,58,138,0.22)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  minWidth: 0,
  boxSizing: 'border-box',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
};

export const mainStyle = {
  flex: 1,
  padding: '3rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minWidth: 0,
  boxSizing: 'border-box',
  marginLeft: '250px',
  transition: 'margin-left 0.3s',
};

export const contentStyle = {
  background: 'rgba(255,255,255,0.97)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(30,58,138,0.12)',
  border: '1.5px solid rgba(147,197,253,0.4)',
  padding: '2rem',
  width: '100%',
  height: '80vh',
  minHeight: '500px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
};

export const sidebarToggleBtnStyle = {
  display: 'none', // will be overridden by CSS media queries
};

export function buttonStyle(active) {
  return {
    background: active
      ? 'linear-gradient(90deg, rgba(59,130,246,0.25), rgba(37,99,235,0.18))'
      : 'transparent',
    color: 'white',
    padding: '0.7rem 1rem',
    textAlign: 'left',
    border: 'none',
    borderLeft: active ? '3px solid rgba(255,255,255,0.9)' : '3px solid transparent',
    cursor: 'pointer',
    fontWeight: active ? 700 : 500,
    borderRadius: '10px',
    transition: 'background 0.2s ease, border-left 0.2s ease',
    fontSize: '0.97rem',
    textTransform: 'capitalize',
    width: '100%',
    boxSizing: 'border-box',
    letterSpacing: '0.01em',
  };
}

export const sectionHeading = {
  fontSize: '1.8rem',
  fontWeight: 800,
  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: '1.25rem',
  letterSpacing: '-0.01em',
};