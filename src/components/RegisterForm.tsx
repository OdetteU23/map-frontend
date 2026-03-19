import React, { useState } from 'react';
import type { User } from 'map-hybrid-types-server';

interface RegisterFormProps {
    onRegister: (Firstname: string, Lastname: string, email: User['email'], username: User['username'], password: User['password']) => void;
}

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
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={Firstname}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder="First Name"
            />
            <input
                type="text"
                value={Lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Last Name"
            />
            <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Register</button>
        </form>
    );
};

export default RegisterForm;