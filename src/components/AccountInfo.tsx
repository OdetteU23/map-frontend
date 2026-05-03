import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { User } from 'map-hybrid-types-server';
import { useAuth } from '../context/AuthContext';
import { api } from '../helpers/data/fetchData';
import { getUserDisplayName, isUser } from '../helpers/types/localTypes';

type AccountFormState = {
  Firstname: string;
  Lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const emptyFormState: AccountFormState = {
  Firstname: '',
  Lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const AccountInfo = () => {
  const { user, editUser } = useAuth();
  const [form, setForm] = useState<AccountFormState>(emptyFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isUser(user)) {
      setForm(emptyFormState);
      return;
    }

    setForm({
      Firstname: user.Firstname ?? '',
      Lastname: user.Lastname ?? '',
      email: user.email ?? '',
      password: '',
      confirmPassword: '',
    });
  }, [user]);

  const handleChange =
    (field: keyof AccountFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setError(null);
      setSuccess(null);
    };

  const resetPasswordFields = () => {
    setForm((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !isUser(user)) {
      setError('This account type cannot be edited yet.');
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const payload: Partial<User> = {
      Firstname: form.Firstname.trim(),
      Lastname: form.Lastname.trim(),
      email: form.email.trim(),
    };

    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await api.user.editingProfile(user.username, payload);
      editUser(updatedUser);
      setSuccess('Account updated successfully.');
      resetPasswordFields();
    } catch (err) {
      console.error('Failed to update account:', err);
      setError(err instanceof Error ? err.message : 'Failed to update account.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <section className="account-section">
        <h3 className="account-section__title">Account information</h3>
        <p className="account-section__empty">Sign in to view and edit your account details.</p>
      </section>
    );
  }

  if (!isUser(user)) {
    return (
      <section className="account-section">
        <h3 className="account-section__title">Account information</h3>
        <p className="account-section__empty">
          {getUserDisplayName(user)} can view this profile, but editable account fields are not available for this profile type yet.
        </p>
      </section>
    );
  }

  return (
    <section className="account-section account-info">
      <div className="account-info__header">
        <h3 className="account-section__title">Account information</h3>
        <p className="account-info__subtitle">
          Signed in as <strong>{getUserDisplayName(user)}</strong> ({user.role})
        </p>
      </div>

      <form className="account-info__form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="account-username">Username</label>
          <input id="account-username" type="text" value={user.username} readOnly />
        </div>

        <div className="account-info__name-grid">
          <div className="form-group">
            <label htmlFor="account-firstname">First name</label>
            <input
              id="account-firstname"
              type="text"
              value={form.Firstname}
              onChange={handleChange('Firstname')}
              placeholder="First name"
              autoComplete="given-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="account-lastname">Last name</label>
            <input
              id="account-lastname"
              type="text"
              value={form.Lastname}
              onChange={handleChange('Lastname')}
              placeholder="Last name"
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="account-email">Email</label>
          <input
            id="account-email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="Email address"
            autoComplete="email"
          />
        </div>

        <div className="account-info__password-grid">
          <div className="form-group">
            <label htmlFor="account-password">New password</label>
            <input
              id="account-password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              placeholder="Leave empty to keep current password"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="account-confirm-password">Confirm password</label>
            <input
              id="account-confirm-password"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && <p className="account-info__message account-info__message--error">{error}</p>}
        {success && <p className="account-info__message account-info__message--success">{success}</p>}

        <div className="account-info__actions">
          <button type="submit" className="btn btn--dark" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AccountInfo;
