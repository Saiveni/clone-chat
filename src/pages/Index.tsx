import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/chats');
      } else {
        navigate('/auth');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="border-white border-t-transparent mx-auto" />
        <p className="mt-4 text-white/80">Loading WhatsApp...</p>
      </div>
    </div>
  );
};

export default Index;
