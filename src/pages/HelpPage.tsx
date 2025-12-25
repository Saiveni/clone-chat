import React from 'react';
import { ArrowLeft, Mail, FileText, Shield, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpPage = () => {
  const navigate = useNavigate();

  const helpItems = [
    {
      icon: MessageCircle,
      title: 'Help Center',
      description: 'Get answers to common questions',
      action: () => window.open('https://faq.whatsapp.com/', '_blank'),
    },
    {
      icon: Mail,
      title: 'Contact Us',
      description: 'Send us your feedback or report an issue',
      action: () => window.location.href = 'mailto:support@whatsapp.com',
    },
    {
      icon: Shield,
      title: 'Privacy Policy',
      description: 'Learn how we protect your data',
      action: () => window.open('https://www.whatsapp.com/legal/privacy-policy', '_blank'),
    },
    {
      icon: FileText,
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      action: () => window.open('https://www.whatsapp.com/legal/terms-of-service', '_blank'),
    },
  ];

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
        <h1 className="text-xl md:text-2xl font-bold">Help</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-card rounded-lg shadow-sm divide-y divide-border">
          {helpItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={item.action}
                className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors touch-manipulation"
              >
                <div className="h-11 w-11 md:h-10 md:w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground flex-shrink-0">
                  <Icon className="h-6 w-6 md:h-5 md:w-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-medium text-base md:text-sm">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="h-6 w-6 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-card rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Need More Help?</h3>
          <p className="text-sm text-muted-foreground">
            Visit our Help Center for detailed guides, FAQs, and troubleshooting tips. You can also contact our support team directly for personalized assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
