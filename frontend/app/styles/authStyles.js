// Общие стили для страниц авторизации (логин и регистрация)

export const authStyles = {
  container: {
    height: 'calc(100vh - 62px)', //62px - высота navbara
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    color: 'black'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#666',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#667eea',
  },
  button: {
    padding: '0.875rem',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '0.5rem',
  },
  buttonHover: {
    ':hover': {
      backgroundColor: '#5a67d8',
    },
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e0',
    cursor: 'not-allowed',
  },
  message: {
    marginTop: '1.5rem',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    textAlign: 'center',
  },
  messageSuccess: {
    backgroundColor: '#f0fff4',
    border: '1px solid #9ae6b4',
    color: '#2f855a',
  },
  messageError: {
    backgroundColor: '#fff5f5',
    border: '1px solid #feb2b2',
    color: '#c53030',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.9rem',
    color: '#718096',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },
};