import React, { useState } from 'react';
import type { RegisterFormProps } from '../helpers/types/localTypes';

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister }) => {
    const [Firstname, setFirstname] = useState<string>('');
    const [Lastname, setLastname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRegister(Firstname, Lastname, email, username, password);
    };

    return (
        <form className="form-section" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>First name:</label>
                <input
                    type="text"
                    value={Firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="Enter your name ..."
                />
            </div>
            <div className="form-group">
                <label>Last name:</label>
                <input
                    type="text"
                    value={Lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Enter your last name ..."
                />
            </div>
            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email ..."
                />
            </div>
            <div className="form-group">
                <label>username:</label>
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
                    placeholder="Enter your password ..."
                />
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn--dark">Submit</button>
            </div>
        </form>
    );
};

export default RegisterForm;