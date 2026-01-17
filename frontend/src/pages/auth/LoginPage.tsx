import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Phone, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PhoneInput } from '../../components/auth/PhoneInput';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Telefon raqamini to\'liq kiriting');
      return;
    }

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    setLoading(true);

    try {
      const response = await authApi.loginByPhone(formattedPhone);
      const { accessToken, refreshToken, user } = response.data;
      
      setAuth(
        { id: user.id, phoneNumber: user.phoneNumber, displayName: user.displayName, username: user.username, bio: user.bio, profilePicture: user.profilePicture },
        accessToken, refreshToken
      );
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1621] flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#3390ec] rounded-full mb-3 sm:mb-4 shadow-lg shadow-[#3390ec]/30">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Telegram</h1>
          <p className="text-[#aaaaaa] mt-2 text-sm sm:text-base">Akkauntingizga kiring</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#17212b] rounded-2xl p-4 sm:p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0e1621] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone className="w-7 h-7 sm:w-8 sm:h-8 text-[#3390ec]" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Telefon raqamingiz</h2>
              <p className="text-[#aaaaaa] text-xs sm:text-sm mt-2">Telefon raqamingizni kiriting</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 text-red-400 text-xs sm:text-sm">{error}</div>
            )}

            <PhoneInput value={phoneNumber} onChange={setPhoneNumber} disabled={loading} />

            <Button type="submit" className="w-full" size="lg" loading={loading} icon={<LogIn className="w-5 h-5" />}>
              Kirish
            </Button>
          </form>
        </div>

        {/* Register Link */}
        <p className="text-center mt-4 sm:mt-6 text-[#aaaaaa] text-sm">
          Akkauntingiz yo'qmi?{' '}
          <Link to="/register" className="text-[#3390ec] hover:underline font-medium">Ro'yxatdan o'tish</Link>
        </p>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-[#aaaaaa] text-xs sm:text-sm">
          <p>Telegram Clone © 2024</p>
        </div>
      </div>
    </div>
  );
};
