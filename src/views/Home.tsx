import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';


const Home: React.FC = () => {
    const handleRegister = (username: string, password: string | number) => {
        // Implementing registration logic here
        console.log('Registering with:', username, password);
    };
    const handleLogin = (username: string, password: string | number) => {
        // Implementing login logic here
        console.log('Logging in with:', username, password);
    };

    return (
        <>
            <RegisterForm onRegister={handleRegister} />
            <LoginForm onLogin={handleLogin} />
            
        </>
    );
};

export default Home;