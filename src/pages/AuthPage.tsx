import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { OtpInput } from '@/components/auth/OtpInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type Step = 'phone' | 'otp' | 'loading';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\s/g, '').length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setStep('loading');
    await login(`${countryCode} ${phone}`);
    setStep('otp');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }
    setError('');
    setStep('loading');
    const success = await verifyOtp(otp);
    if (success) {
      navigate('/chats');
    } else {
      setStep('otp');
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError('');
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
          {step === 'loading' ? (
            <div className="flex flex-col items-center gap-4 animate-fade-in-up">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground">
                {otp ? 'Verifying...' : 'Sending OTP...'}
              </p>
            </div>
          ) : step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-fade-in-up">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Enter your phone number
                </h1>
                <p className="text-muted-foreground">
                  WhatsApp will send an SMS message to verify your phone number
                </p>
              </div>

              <PhoneInput
                value={phone}
                onChange={setPhone}
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
              />

              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-whatsapp-green-dark transition-colors"
              >
                Next
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-fade-in-up">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Verify your number
                </h1>
                <p className="text-muted-foreground">
                  Enter the 6-digit code sent to
                  <br />
                  <span className="text-foreground font-medium">
                    {countryCode} {phone}
                  </span>
                </p>
              </div>

              <OtpInput value={otp} onChange={handleOtpChange} />

              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={otp.length !== 6}
                  className={cn(
                    'w-full py-3 rounded-xl font-semibold transition-colors',
                    otp.length === 6
                      ? 'bg-primary text-primary-foreground hover:bg-whatsapp-green-dark'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  Verify
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="w-full py-3 rounded-xl font-semibold text-primary hover:bg-accent transition-colors"
                >
                  Change number
                </button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Didn't receive code?{' '}
                <button type="button" className="text-primary font-medium hover:underline">
                  Resend
                </button>
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
