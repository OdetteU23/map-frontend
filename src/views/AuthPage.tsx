import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';

type UserType = 'normal' | 'business';

const AuthPage: React.FC = () => {
  const [userType, setUserType] = useState<UserType>('normal');
  const { isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username: string, _password: string | number) => {
    // Backend integration: call your login API here, then on success call
    // loginSuccess(userData) from useAuth and navigate based on user.role
    navigate('/home');
  };

  const handleRegister = async (
    Firstname: string,
    Lastname: string,
    email: string,
    username: string,
    _password: string | number
  ) => {
    // Backend integration: call your register API here with
    // role = userType === 'business' ? 'provider' : 'consumer'
    // then on success call registerSuccess(userData) from useAuth and navigate
    const role = userType === 'business' ? 'provider' as const : 'consumer' as const;
    navigate(role === 'provider' ? '/provider' : '/home');
  };

  return (
    <div className="auth-page">
      {error && (
        <div className="auth-error">
          <span>{error}</span>
          <button onClick={clearError} className="auth-error__close">&times;</button>
        </div>
      )}

      {/* User type tabs */}
      <div className="auth-tabs">
        <button
          className={`auth-tabs__btn ${userType === 'normal' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
          onClick={() => setUserType('normal')}
        >
          Normal user registry
        </button>
        <button
          className={`auth-tabs__btn ${userType === 'business' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
          onClick={() => setUserType('business')}
        >
          Business owner registery
        </button>
      </div>

      {isLoading && <div className="auth-loading">Ladataan...</div>}

      {/* Register form */}
      <RegisterForm onRegister={handleRegister} />

      {/* Login form */}
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default AuthPage;
