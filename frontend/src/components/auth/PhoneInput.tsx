import React, { useState } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const countryCodes = [
  { code: '+998', country: 'UZ', flag: '🇺🇿' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+7', country: 'RU', flag: '🇷🇺' },
  { code: '+44', country: 'GB', flag: '🇬🇧' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  disabled,
}) => {
  const [selectedCode, setSelectedCode] = useState(countryCodes[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCodeSelect = (code: typeof countryCodes[0]) => {
    setSelectedCode(code);
    setShowDropdown(false);
    onChange(code.code + phoneNumber);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/\D/g, '');
    setPhoneNumber(num);
    onChange(selectedCode.code + num);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-telegram-text-secondary mb-2">
        Telefon raqami
      </label>
      <div className="relative flex">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowDropdown(!showDropdown)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-l-xl
              bg-telegram-bg-light border border-r-0 border-telegram-bg-lighter
              text-telegram-text hover:bg-telegram-bg-lighter
              transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-xl">{selectedCode.flag}</span>
            <span className="font-medium">{selectedCode.code}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-telegram-bg-light border border-telegram-bg-lighter rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-fadeIn">
              {countryCodes.map((code) => (
                <button
                  key={code.code}
                  type="button"
                  onClick={() => handleCodeSelect(code)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3
                    hover:bg-telegram-bg-lighter transition-colors
                    ${selectedCode.code === code.code ? 'bg-telegram-bg-lighter' : ''}
                  `}
                >
                  <span className="text-xl">{code.flag}</span>
                  <span className="font-medium">{code.code}</span>
                  <span className="text-telegram-text-secondary text-sm">{code.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-secondary" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            disabled={disabled}
            placeholder="90 123 45 67"
            className={`
              w-full pl-12 pr-4 py-3 rounded-r-xl
              bg-telegram-bg-light border border-telegram-bg-lighter
              text-telegram-text placeholder-telegram-text-secondary
              focus:border-telegram-blue focus:ring-1 focus:ring-telegram-blue
              transition-all duration-200
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
};
