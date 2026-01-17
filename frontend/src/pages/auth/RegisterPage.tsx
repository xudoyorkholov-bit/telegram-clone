import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, ArrowLeft, User, Lock, Check } from 'lucide-react';
import { PhoneInput } from '../../components/auth/PhoneInput';
import { CodeInput } from '../../components/auth/CodeInput';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

type Step = 'phone' | 'code' | 'profile';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [step, setStep] = useState<Step>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.register(phoneNumber);
      setSessionId(response.data.sessionId);
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('6 raqamli kodni kiriting');
      return;
    }
    setError('');
    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Ismingizni kiriting');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Parollar mos kelmaydi');
      return;
    }

    if (password && password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.verify(
        sessionId,
        code,
        displayName,
        password || undefined
      );

      setAuth(
        {
          id: '',
          phoneNumber,
          displayName,
        },
        response.data.accessToken,
        response.data.refreshToken
      );

      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Xatolik yuz berdi');
      if (err.response?.data?.error?.code === 'VERIFICATION_ERROR') {
        setStep('code');
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError('');
    if (step === 'code') setStep('phone');
    if (step === 'profile') setStep('code');
  };

  return (
    <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-telegram-blue rounded-full mb-4">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-telegram-text">Telegram</h1>
          <p className="text-telegram-text-secondary mt-2">
            {step === 'phone' && 'Ro\'yxatdan o\'tish'}
            {step === 'code' && 'Tasdiqlash'}
            {step === 'profile' && 'Profil yaratish'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['phone', 'code', 'profile'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${step === s ? 'bg-telegram-blue text-white' : 
                    ['phone', 'code', 'profile'].indexOf(step) > i 
                      ? 'bg-telegram-green text-white' 
                      : 'bg-telegram-bg-light text-telegram-text-secondary'}
                `}
              >
                {['phone', 'code', 'profile'].indexOf(step) > i ? (
                  <Check className="w-5 h-5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`
                    w-12 h-1 rounded-full transition-all duration-300
                    ${['phone', 'code', 'profile'].indexOf(step) > i 
                      ? 'bg-telegram-green' 
                      : 'bg-telegram-bg-light'}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-telegram-bg-light rounded-2xl p-6 shadow-xl animate-fadeIn">
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-telegram-text">
                  Telefon raqamingiz
                </h2>
                <p className="text-telegram-text-secondary text-sm mt-2">
                  Tasdiqlash kodi yuboriladi
                </p>
              </div>

              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                error={error}
                disabled={loading}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Davom etish
              </Button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 text-telegram-text-secondary hover:text-telegram-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Orqaga
              </button>

              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-telegram-text">
                  Kodni kiriting
                </h2>
                <p className="text-telegram-text-secondary text-sm mt-2">
                  {phoneNumber} raqamiga kod yuborildi
                </p>
              </div>

              <CodeInput
                value={code}
                onChange={setCode}
                error={error}
                disabled={loading}
              />

              <div className="text-center">
                <button
                  type="button"
                  className="text-telegram-blue hover:underline text-sm"
                  onClick={() => {
                    setCode('');
                    handlePhoneSubmit({ preventDefault: () => {} } as React.FormEvent);
                  }}
                >
                  Kodni qayta yuborish
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                disabled={code.length !== 6}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Tasdiqlash
              </Button>
            </form>
          )}

          {/* Step 3: Profile Setup */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 text-telegram-text-secondary hover:text-telegram-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Orqaga
              </button>

              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-telegram-text">
                  Profilingiz
                </h2>
                <p className="text-telegram-text-secondary text-sm mt-2">
                  Ismingiz va parolingizni kiriting
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Ismingiz"
                placeholder="Ismingizni kiriting"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                icon={<User className="w-5 h-5" />}
                disabled={loading}
              />

              <Input
                label="Parol (ixtiyoriy)"
                type="password"
                placeholder="Parol yarating"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                disabled={loading}
              />

              {password && (
                <Input
                  label="Parolni tasdiqlang"
                  type="password"
                  placeholder="Parolni qayta kiriting"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  disabled={loading}
                />
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                icon={<Check className="w-5 h-5" />}
              >
                Ro'yxatdan o'tish
              </Button>
            </form>
          )}
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-telegram-text-secondary">
          Akkauntingiz bormi?{' '}
          <Link to="/login" className="text-telegram-blue hover:underline font-medium">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
};
