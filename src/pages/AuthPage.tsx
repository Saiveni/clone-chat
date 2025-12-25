import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/chats');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/chats');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-header h-32 flex items-end pb-4 px-6">
        <div className="flex items-center gap-3 text-header-foreground">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold">WhatsApp</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 animate-fade-in-up">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground">Signing in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back
                </h1>
                <p className="text-muted-foreground">
                  Sign in to continue to WhatsApp
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email or Phone
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter email or phone number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 md:h-11 text-base"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 md:h-11 pr-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 touch-manipulation active:scale-95"
                    >
                      {showPassword ? <EyeOff className="h-6 w-6 md:h-5 md:w-5" /> : <Eye className="h-6 w-6 md:h-5 md:w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3.5 md:py-3 rounded-xl font-semibold hover:bg-whatsapp-green-dark transition-all active:scale-[0.98] touch-manipulation text-base md:text-sm"
              >
                Sign In
              </button>

              <p className="text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Create account
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
