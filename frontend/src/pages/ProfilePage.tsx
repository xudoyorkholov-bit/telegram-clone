import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, AtSign, FileText, Check, X, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/user';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError('Rasm hajmi 5MB dan oshmasligi kerak'); return; }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setProfilePicture(base64);
        try {
          await userApi.updatePhoto(base64);
          updateUser({ profilePicture: base64 });
          setSuccess('Rasm yangilandi');
          setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) { setError(err.response?.data?.error?.message || 'Rasm yuklashda xatolik'); }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError(''); setLoading(true);
    try {
      const response = await userApi.updateProfile({ displayName: displayName.trim(), username: username.trim() || undefined, bio: bio.trim() || undefined });
      updateUser({ displayName: response.data.displayName, username: response.data.username, bio: response.data.bio });
      setSuccess('Profil yangilandi'); setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Xatolik yuz berdi'); }
    finally { setLoading(false); }
  };

  const handleCancel = () => { setDisplayName(user?.displayName || ''); setUsername(user?.username || ''); setEditing(false); setError(''); };
  const handleLogout = () => { logout(); navigate('/login'); };
  const getInitials = () => displayName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#0e1621]">
      {/* Header */}
      <div className="bg-[#17212b] border-b border-[#0e1621]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => navigate('/chat')} className="p-2 hover:bg-[#232e3c] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-white">Profil</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {error && <div className="mb-4 sm:mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 text-red-400 text-xs sm:text-sm">{error}</div>}
        {success && <div className="mb-4 sm:mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-3 sm:p-4 text-green-400 text-xs sm:text-sm">{success}</div>}

        {/* Profile Card */}
        <div className="bg-[#17212b] rounded-2xl p-4 sm:p-6 shadow-xl">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="relative">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#3390ec]" />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#3390ec] flex items-center justify-center border-4 border-[#2b7fd4]">
                  <span className="text-4xl sm:text-5xl font-bold text-white">{getInitials()}</span>
                </div>
              )}
              <button onClick={handlePhotoClick} className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#3390ec] rounded-full flex items-center justify-center shadow-lg hover:bg-[#2b7fd4] transition-colors">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </div>
            <p className="mt-3 sm:mt-4 text-[#aaaaaa] text-xs sm:text-sm">Rasmni o'zgartirish uchun bosing</p>
          </div>

          {/* Profile Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#aaaaaa] mb-2">Ism</label>
              {editing ? (
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ismingizni kiriting" icon={<User className="w-5 h-5" />} />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-[#0e1621] rounded-xl">
                  <User className="w-5 h-5 text-[#aaaaaa]" />
                  <span className="text-white text-sm sm:text-base">{displayName || 'Kiritilmagan'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#aaaaaa] mb-2">Username</label>
              {editing ? (
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" icon={<AtSign className="w-5 h-5" />} />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-[#0e1621] rounded-xl">
                  <AtSign className="w-5 h-5 text-[#aaaaaa]" />
                  <span className="text-white text-sm sm:text-base">{username ? `@${username}` : 'Kiritilmagan'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#aaaaaa] mb-2">Bio</label>
              {editing ? (
                <div className="relative">
                  <FileText className="absolute left-4 top-3 w-5 h-5 text-[#aaaaaa]" />
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="O'zingiz haqingizda yozing..." rows={3} maxLength={500}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0e1621] border border-[#232e3c] text-white placeholder-[#aaaaaa] focus:border-[#3390ec] focus:ring-1 focus:ring-[#3390ec] transition-all resize-none text-sm sm:text-base" />
                  <span className="absolute bottom-2 right-3 text-xs text-[#aaaaaa]">{bio.length}/500</span>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-[#0e1621] rounded-xl">
                  <FileText className="w-5 h-5 text-[#aaaaaa] mt-0.5" />
                  <span className="text-white text-sm sm:text-base">{bio || 'Kiritilmagan'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#aaaaaa] mb-2">Telefon raqami</label>
              <div className="flex items-center gap-3 p-3 bg-[#0e1621] rounded-xl">
                <span className="text-white text-sm sm:text-base">{user?.phoneNumber}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 space-y-3">
            {editing ? (
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={handleCancel} icon={<X className="w-5 h-5" />}>Bekor qilish</Button>
                <Button className="flex-1" onClick={handleSave} loading={loading} icon={<Check className="w-5 h-5" />}>Saqlash</Button>
              </div>
            ) : (
              <Button className="w-full" onClick={() => setEditing(true)} icon={<User className="w-5 h-5" />}>Profilni tahrirlash</Button>
            )}
            <Button variant="outline" className="w-full text-red-400 border-red-400/50 hover:bg-red-500/10 hover:text-red-400" onClick={handleLogout} icon={<LogOut className="w-5 h-5" />}>Chiqish</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
