import { useState } from "react";
// import { useUser } from "../context/UserContext"; // TODO: create UserContext
import type { User } from "map-hybrid-types-server";


const useLoginRegister = () => {
    // TODO: replace stubs with real context once UserContext is created
    const contextLogin = async (_username: string, _password: string | number) => {};
    const contextLogout = async () => {};
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

const handleLogin = async (username: User['username'], password: User['password']) => {
    setIsLoading(true);
    setError(null);

    try {
        await contextLogin(username, password);
        return{ success: true };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
    } finally {
        setIsLoading(false);
    }
};

const handleLogout = async () => {
    setIsLoading(true);
    try {
        await contextLogout();
    } catch (err) {
        console.error('Logout failed:', err);
    } finally {
        setIsLoading(false);
    }
};
const handleRegister = async (Firstname: string, Lastname: string, email: User['email'], username: User['username'], password: User['password']) => {
    setIsLoading(true);
    setError(null);

    try {
        // TODO: replace with real API call
        console.log('Register:', { Firstname, Lastname, email, username, password });
        return { success: true };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
    } finally {
        setIsLoading(false);
    }
};

return { handleLogin, handleLogout, handleRegister, isLoading, error, clearError: () => setError(null), };
};

export default useLoginRegister;