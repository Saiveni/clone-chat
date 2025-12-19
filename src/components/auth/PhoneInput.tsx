import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
}

const countries = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
];

export const PhoneInput = ({ value, onChange, countryCode, onCountryCodeChange }: PhoneInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

  const formatPhoneNumber = (input: string) => {
    const cleaned = input.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const parts = [match[1], match[2], match[3]].filter(Boolean);
      return parts.join(' ');
    }
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <span className="text-xl">{selectedCountry.flag}</span>
          <span className="font-medium">{selectedCountry.code}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="h-6 w-px bg-border" />
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder="Phone number"
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
          maxLength={12}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-auto animate-scale-in">
          {countries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                onCountryCodeChange(country.code);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
            >
              <span className="text-xl">{country.flag}</span>
              <span className="font-medium">{country.country}</span>
              <span className="text-muted-foreground ml-auto">{country.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
