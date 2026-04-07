import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';

type UserType = 'normal' | 'business';

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isLoginView = searchParams.get('view') === 'login';
  const [userType, setUserType] = useState<UserType>('normal');
  const { user, isLoading, error, clearError, loginSuccess, registerSuccess } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string | number) => {
    try {
      await loginSuccess({ username, password });
      if (isUser(user)) {
        navigate(user.role === 'provider' || user.role === 'admin' ? '/provider' : '/home');
      } else {
        navigate('/home');
      }
    } catch {
      // Error is already set in AuthContext; stay on auth page
    }
  };

  const handleRegister = async (
    Firstname: string,
    Lastname: string,
    email: string,
    username: string,
    password: string | number
  ) => {
    try {
      const role = userType === 'business' ? 'provider' : 'consumer';
      await registerSuccess({ Firstname, Lastname, email, username, password, role });
      navigate(role === 'provider' ? '/provider' : '/home');
    } catch {
      // Error is already set in AuthContext; stay on auth page
    }
  };

  return (
    <div className="auth-page">
      {error && (
        <div className="auth-error">
          <span>{error}</span>
          <button onClick={clearError} className="auth-error__close">&times;</button>
        </div>
      )}

      {isLoading && <div className="auth-loading">Loading...</div>}

      {!isLoginView && (
        <>
          <h2 className="auth-page__heading">Create an account</h2>
          {/* User type tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tabs__btn ${userType === 'normal' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
              onClick={() => setUserType('normal')}
            >
              Normal user
            </button>
            <button
              className={`auth-tabs__btn ${userType === 'business' ? 'auth-tabs__btn--active' : 'auth-tabs__btn--inactive'}`}
              onClick={() => setUserType('business')}
            >
              Business owner
            </button>
          </div>
          <RegisterForm onRegister={handleRegister} />
          <p className="auth-page__switch">
            Already have an account?{' '}
            <button className="auth-page__link" onClick={() => navigate('/auth?view=login')}>Sign in</button>
          </p>
        </>
      )}

      {isLoginView && (
        <>
          <h2 className="auth-page__heading">Sign in</h2>
          <LoginForm onLogin={handleLogin} />
          <p className="auth-page__switch">
            Don't have an account?{' '}
            <button className="auth-page__link" onClick={() => navigate('/auth')}>Register</button>
          </p>
        </>
      )}
    </div>
  );
};

export default AuthPage;
