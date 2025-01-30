import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoginHeader from './LoginHeader';
import LoginForm from './LoginForm';

function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    toast.success('Login successful!');
    navigate('/'); // Redirect to LandingPage after login
  };

  return (
    <div className="max-w-screen h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-[20%] right-[15%] w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[15%] left-[15%] w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md transform transition-all duration-300 hover:scale-[1.02]">
        <div className="glass-card backdrop-blur-lg bg-white/10 dark:bg-gray-900/10 rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl transform -rotate-1"></div>
          <div className="relative">
            <LoginHeader />
            <LoginForm onSuccess={handleLoginSuccess} />
            
            <div className="mt-8 text-center space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign up
                </button>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Forgot password?
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
