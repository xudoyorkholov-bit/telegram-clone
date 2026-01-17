import React, { useRef, useState, useEffect } from 'react';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  value,
  onChange,
  error,
  disabled,
}) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value) {
      const chars = value.split('').slice(0, length);
      setCode([...chars, ...Array(length - chars.length).fill('')]);
    }
  }, [value, length]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;

    const newCode = [...code];
    newCode[index] = char.slice(-1);
    setCode(newCode);
    onChange(newCode.join(''));

    // Auto-focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newCode = [...pastedData.split(''), ...Array(length - pastedData.length).fill('')];
    setCode(newCode);
    onChange(newCode.join(''));
    
    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-telegram-text-secondary mb-3 text-center">
        Tasdiqlash kodini kiriting
      </label>
      <div className="flex justify-center gap-3">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              w-12 h-14 text-center text-2xl font-bold rounded-xl
              bg-telegram-bg-light border-2 border-telegram-bg-lighter
              text-telegram-text
              focus:border-telegram-blue focus:ring-0
              transition-all duration-200
              ${error ? 'border-red-500' : ''}
              ${digit ? 'border-telegram-blue' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
      )}
    </div>
  );
};
