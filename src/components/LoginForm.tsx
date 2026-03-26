//Login forms components
import React, { useState } from 'react';
import type { LoginFormProps } from '../helpers/types/localTypes';

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <form className="form-section" onSubmit={handleSubmit}>
            <span className="form-section__title">Sign in</span>
            <div className="form-group">
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username ..."
                />
            </div>
            <div className="form-group">
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password here"
                />
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn--dark">Submit</button>
            </div>
        </form>
    );
};

export default LoginForm;