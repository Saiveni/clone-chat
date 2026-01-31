import React from 'react';
import { ArrowLeft, MessageCircle, Code, Heart, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-header text-header-foreground px-4 py-3.5 md:py-3 flex items-center gap-3 shadow-sm sticky top-0 z-50">
        <button
          onClick={() => navigate('/settings')}
          className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6 md:h-5 md:w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold">About</h1>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* App Icon and Name */}
        <div className="flex flex-col items-center py-8 px-4">
          <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center mb-4">
            <MessageCircle className="h-12 w-12 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold">WhatsApp Clone</h2>
          <p className="text-muted-foreground mt-1">Version 1.0.0</p>
        </div>

        {/* App Info */}
        <div className="bg-card mx-4 rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Code className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Built with Modern Technology</h3>
              <p className="text-sm text-muted-foreground">
                This application is built using React, TypeScript, Firebase, and Tailwind CSS to provide a seamless messaging experience.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Made with Care</h3>
              <p className="text-sm text-muted-foreground">
                Designed and developed with attention to detail to replicate the WhatsApp experience while adding modern features.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Real-time Messaging</h3>
              <p className="text-sm text-muted-foreground">
                Features include real-time messaging, group chats, read receipts, typing indicators, and profile customization.
              </p>
            </div>
          </div>
        </div>

        {/* Developer Info */}
        <div className="p-4 mt-6">
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 WhatsApp Clone. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This is a demonstration project and is not affiliated with WhatsApp Inc.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="px-4 pb-6">
          <div className="flex justify-center gap-6">
            <button
              onClick={() => window.open('https://github.com', '_blank')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              Source Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
