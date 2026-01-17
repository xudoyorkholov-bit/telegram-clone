import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Menu, User, Bell, Moon, Settings, LogOut, X, Loader2, Send, Check, CheckCheck, Paperclip, Smile, Mic, ArrowLeft, Image, Video, Play } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Chat, chatApi } from '../api/chat';
import { UserProfile, userApi } from '../api/user';
import { messageApi } from '../api/message';
import { mediaApi } from '../api/media';
import { useSocket } from '../hooks/useSocket';

interface LocalMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
  status: 'sent' | 'delivered' | 'read';
  mediaId?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [showMenu, setShowMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [loadingChats, setLoadingChats] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const selectedChatRef = useRef<Chat | null>(null);
  
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);


  const handleNewMessage = useCallback((message: any) => {
    console.log('📨 New message received:', message);
    console.log('📱 Current chat:', selectedChatRef.current?.participant.id);
    console.log('👤 Message sender:', message.senderId);
    
    const newMsg: LocalMessage = {
      id: message.id || `msg-${Date.now()}`,
      text: message.text || '',
      senderId: message.senderId,
      createdAt: new Date(message.createdAt),
      status: 'delivered',
      mediaId: message.mediaId,
      mediaType: message.mediaType,
    };
    
    const currentChat = selectedChatRef.current;
    
    // Always add to messages if it's from current chat
    if (currentChat && message.senderId === currentChat.participant.id) {
      console.log('✅ Adding message to current chat');
      setMessages(prev => [...prev, newMsg]);
    } else {
      console.log('❌ Not adding to current chat - different sender or no chat selected');
    }
    
    // Always update chat list
    setChats(prev => {
      const chatExists = prev.some(chat => chat.participant.id === message.senderId);
      console.log('💬 Chat exists:', chatExists);
      
      if (chatExists) {
        return prev.map(chat => 
          chat.participant.id === message.senderId
            ? { ...chat, lastMessage: { id: newMsg.id, text: newMsg.mediaType === 'video' ? '🎥 Video' : newMsg.mediaType === 'image' ? '📷 Rasm' : newMsg.text, senderId: newMsg.senderId, createdAt: newMsg.createdAt.toISOString() },
                unreadCount: currentChat?.participant.id === message.senderId ? 0 : chat.unreadCount + 1 }
            : chat
        );
      } else {
        console.log('🔄 Loading chats because sender not found');
        loadChats();
        return prev;
      }
    });
  }, []);

  const handleTypingStart = useCallback((userId: string) => {
    setTypingUsers(prev => new Set(prev).add(userId));
  }, []);

  const handleTypingStop = useCallback((userId: string) => {
    setTypingUsers(prev => { const newSet = new Set(prev); newSet.delete(userId); return newSet; });
  }, []);

  const handleUserOnline = useCallback((userId: string) => {
    setOnlineUsers(prev => new Set(prev).add(userId));
    setChats(prev => prev.map(chat => chat.participant.id === userId ? { ...chat, participant: { ...chat.participant, isOnline: true } } : chat));
  }, []);

  const handleUserOffline = useCallback((userId: string, lastSeen: Date) => {
    setOnlineUsers(prev => { const newSet = new Set(prev); newSet.delete(userId); return newSet; });
    setChats(prev => prev.map(chat => chat.participant.id === userId ? { ...chat, participant: { ...chat.participant, isOnline: false, lastSeen: lastSeen.toISOString() } } : chat));
  }, []);

  const handleMessageDelivered = useCallback((messageId: string, recipientId: string) => {
    console.log('📬 Message delivered:', messageId, 'to:', recipientId);
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'delivered' } : msg
    ));
  }, []);

  const handleMessageSeen = useCallback((readerId: string, senderId: string) => {
    console.log('👁️ Messages seen by:', readerId, 'from:', senderId);
    setMessages(prev => prev.map(msg => 
      msg.senderId === user?.id && msg.status !== 'read' ? { ...msg, status: 'read' } : msg
    ));
  }, [user?.id]);

  const { isConnected, sendMessage: socketSendMessage, startTyping, stopTyping, markAsRead, markAsSeen } = useSocket({
    onNewMessage: handleNewMessage, onTypingStart: handleTypingStart, onTypingStop: handleTypingStop,
    onUserOnline: handleUserOnline, onUserOffline: handleUserOffline,
    onMessageDelivered: handleMessageDelivered, onMessageSeen: handleMessageSeen,
  });

  useEffect(() => { loadChats(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadChats = async () => {
    setLoadingChats(true);
    try { const response = await chatApi.getMyChats(); setChats(response.data); }
    catch (error) { console.error('Failed to load chats:', error); setChats([]); }
    finally { setLoadingChats(false); }
  };


  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); setShowSearchResults(false); return; }
    setIsSearching(true); setShowSearchResults(true);
    const timer = setTimeout(async () => {
      try { const response = await userApi.searchUsers(searchQuery.trim()); setSearchResults(response.data.filter(u => u.id !== user?.id)); }
      catch (error) { console.error('Search error:', error); setSearchResults([]); }
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, user?.id]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSelectUser = async (selectedUser: UserProfile) => {
    const existingChat = chats.find(c => c.participant.id === selectedUser.id);
    if (existingChat) { setSelectedChat(existingChat); handleSelectChat(existingChat); }
    else {
      try { const response = await chatApi.createChat(selectedUser.id); setChats([response.data, ...chats]); setSelectedChat(response.data); setMessages([]); }
      catch (error) {
        const newChat: Chat = { id: `chat-${selectedUser.id}`, participant: { id: selectedUser.id, displayName: selectedUser.displayName, username: selectedUser.username, profilePicture: selectedUser.profilePicture, isOnline: selectedUser.isOnline || onlineUsers.has(selectedUser.id), lastSeen: selectedUser.lastSeen }, unreadCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setChats([newChat, ...chats]); setSelectedChat(newChat); setMessages([]);
      }
    }
    setSearchQuery(''); setShowSearchResults(false); setShowMobileChat(true);
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat); markAsSeen(chat.participant.id);
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
    setLoadingMessages(true); setShowMobileChat(true);
    try {
      const response = await messageApi.getMessages(chat.participant.id);
      setMessages(response.data.map(msg => ({ 
        id: msg.id, 
        text: msg.content.text || '', 
        senderId: msg.senderId, 
        createdAt: new Date(msg.createdAt), 
        status: msg.status,
        mediaId: msg.content.mediaId,
        mediaType: msg.content.mediaType as 'image' | 'video' | 'audio' | 'document' | undefined,
      })));
    } catch (error) { console.error('Failed to load messages:', error); setMessages([]); }
    finally { setLoadingMessages(false); }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    const message: LocalMessage = { id: `msg-${Date.now()}`, text: newMessage.trim(), senderId: user?.id || '', createdAt: new Date(), status: 'sent' };
    setMessages([...messages, message]); setNewMessage('');
    socketSendMessage(selectedChat.participant.id, message.text);
    setChats(chats.map(c => c.id === selectedChat.id ? { ...c, lastMessage: { id: message.id, text: message.text, senderId: message.senderId, createdAt: message.createdAt.toISOString() } } : c));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => setVideoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendImage = async () => {
    if (!selectedImage || !selectedChat) return;
    
    setUploadingImage(true);
    try {
      // Upload image first
      const uploadResponse = await mediaApi.uploadImage(selectedImage);
      
      // Create message with media
      const message: LocalMessage = { 
        id: `msg-${Date.now()}`, 
        text: '', 
        senderId: user?.id || '', 
        createdAt: new Date(), 
        status: 'sent',
        mediaId: uploadResponse.data.id,
        mediaType: 'image'
      };
      
      setMessages([...messages, message]);
      
      // Send via socket
      socketSendMessage(selectedChat.participant.id, '', uploadResponse.data.id, 'image');
      
      // Update chat list
      setChats(chats.map(c => c.id === selectedChat.id ? { 
        ...c, 
        lastMessage: { 
          id: message.id, 
          text: '📷 Rasm', 
          senderId: message.senderId, 
          createdAt: message.createdAt.toISOString() 
        } 
      } : c));
      
      // Clear image selection
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to send image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendVideo = async () => {
    if (!selectedVideo || !selectedChat) return;
    
    setUploadingVideo(true);
    try {
      // Upload video first
      const uploadResponse = await mediaApi.uploadMedia(selectedVideo);
      
      // Create message with media
      const message: LocalMessage = { 
        id: `msg-${Date.now()}`, 
        text: '', 
        senderId: user?.id || '', 
        createdAt: new Date(), 
        status: 'sent',
        mediaId: uploadResponse.data.id,
        mediaType: 'video'
      };
      
      setMessages([...messages, message]);
      
      // Send via socket
      socketSendMessage(selectedChat.participant.id, '', uploadResponse.data.id, 'video');
      
      // Update chat list
      setChats(chats.map(c => c.id === selectedChat.id ? { 
        ...c, 
        lastMessage: { 
          id: message.id, 
          text: '🎥 Video', 
          senderId: message.senderId, 
          createdAt: message.createdAt.toISOString() 
        } 
      } : c));
      
      // Clear video selection
      setSelectedVideo(null);
      setVideoPreview(null);
    } catch (error) {
      console.error('Failed to send video:', error);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCancelVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (selectedChat && e.target.value) {
      startTyping(selectedChat.participant.id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => { if (selectedChat) stopTyping(selectedChat.participant.id); }, 2000);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSendMessage(); };
  useEffect(() => { if (selectedChat) markAsRead(selectedChat.participant.id); }, [selectedChat, markAsRead]);


  const formatTime = (date: Date | string) => new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return '';
    const minutes = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 60000);
    if (minutes < 1) return 'hozirgina';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} soat oldin`;
    return `${Math.floor(minutes / 1440)} kun oldin`;
  };
  const formatChatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return formatTime(date);
    if (days === 1) return 'Kecha';
    if (days < 7) return date.toLocaleDateString('uz-UZ', { weekday: 'short' });
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
  };
  const getStatusIcon = (status: string, isOwn: boolean) => {
    if (!isOwn) return null;
    switch (status) {
      case 'read':
        return <CheckCheck className="w-3 h-3 md:w-4 md:h-4 text-[#4dcd5e]" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 md:w-4 md:h-4 text-white/50" />;
      case 'sent':
        return <Check className="w-3 h-3 md:w-4 md:h-4 text-white/50" />;
      default:
        return <Check className="w-3 h-3 md:w-4 md:h-4 text-white/30" />;
    }
  };

  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: 'Profilim', onClick: () => { setShowMenu(false); navigate('/profile'); } },
    { icon: <Bell className="w-5 h-5" />, label: 'Bildirishnomalar', onClick: () => setShowMenu(false) },
    { icon: <Moon className="w-5 h-5" />, label: 'Tungi rejim', toggle: true, checked: darkMode, onClick: () => setDarkMode(!darkMode) },
    { icon: <Settings className="w-5 h-5" />, label: 'Sozlamalar', onClick: () => setShowMenu(false) },
    { icon: <LogOut className="w-5 h-5" />, label: 'Chiqish', danger: true, onClick: handleLogout },
  ];

  const groupMessagesByDate = (msgs: LocalMessage[]) => {
    const groups: { date: string; messages: LocalMessage[] }[] = [];
    let currentDate = '';
    msgs.forEach(msg => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString('uz-UZ');
      if (msgDate !== currentDate) { currentDate = msgDate; groups.push({ date: msgDate, messages: [msg] }); }
      else { groups[groups.length - 1].messages.push(msg); }
    });
    return groups;
  };
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr.split('.').reverse().join('-'));
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Bugun';
    if (days === 1) return 'Kecha';
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const messageGroups = groupMessagesByDate(messages);
  const handleBackToList = () => { setShowMobileChat(false); setSelectedChat(null); };


  return (
    <div className="h-screen bg-[#0e1621] flex overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 bg-[#17212b] border-r border-[#0e1621] flex-col`}>
        {/* Header */}
        <div className="h-14 px-3 md:px-4 flex items-center gap-2 md:gap-3 border-b border-[#0e1621]">
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-[#232e3c] rounded-full transition-colors">
              <Menu className="w-5 h-5 text-[#aaaaaa]" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#17212b] border border-[#232e3c] rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-[#232e3c]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">{user?.displayName?.charAt(0) || 'U'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{user?.displayName || 'Foydalanuvchi'}</p>
                        <p className="text-[#aaaaaa] text-sm truncate">{user?.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    {menuItems.map((item, index) => (
                      <button key={index} onClick={item.onClick} className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#232e3c] transition-colors ${item.danger ? 'text-red-400' : 'text-white'}`}>
                        <div className="flex items-center gap-4">
                          <span className={item.danger ? 'text-red-400' : 'text-[#aaaaaa]'}>{item.icon}</span>
                          <span className="text-[15px]">{item.label}</span>
                        </div>
                        {item.toggle && (
                          <div className={`w-11 h-6 rounded-full transition-colors relative ${item.checked ? 'bg-[#3390ec]' : 'bg-[#232e3c]'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.checked ? 'translate-x-6' : 'translate-x-1'}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Qidirish"
              className="w-full pl-10 pr-10 py-2 rounded-full bg-[#242f3d] text-white placeholder-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#3390ec] transition-all text-[15px]" />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#17212b] border border-[#232e3c] rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-[#3390ec] animate-spin" /></div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((result) => (
                      <button key={result.id} onClick={() => handleSelectUser(result)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#232e3c] transition-colors">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                            <span className="text-white font-semibold">{result.displayName.charAt(0)}</span>
                          </div>
                          {(result.isOnline || onlineUsers.has(result.id)) && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4dcd5e] rounded-full border-2 border-[#17212b]" />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-white font-medium">{result.displayName}</p>
                          <p className="text-[#aaaaaa] text-sm">{result.username ? `@${result.username}` : result.phoneNumber}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : <div className="py-8 text-center text-[#aaaaaa]">Hech narsa topilmadi</div>}
              </div>
            )}
          </div>
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-[#4dcd5e]' : 'bg-red-500'}`} title={isConnected ? 'Ulangan' : 'Ulanmagan'} />
        </div>


        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-[#3390ec] animate-spin" /></div>
          ) : chats.length > 0 ? (
            <div>
              {chats.map((chat) => (
                <button key={chat.id} onClick={() => handleSelectChat(chat)}
                  className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 transition-colors ${selectedChat?.id === chat.id ? 'bg-[#3390ec]' : 'hover:bg-[#232e3c]'}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 md:w-[54px] md:h-[54px] rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg md:text-xl">{chat.participant.displayName.charAt(0)}</span>
                    </div>
                    {(chat.participant.isOnline || onlineUsers.has(chat.participant.id)) && <div className="absolute bottom-0.5 right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 bg-[#4dcd5e] rounded-full border-2 border-[#17212b]" />}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-medium truncate text-white text-[15px]">{chat.participant.displayName}</p>
                      {chat.lastMessage && <span className={`text-xs flex-shrink-0 ml-2 ${selectedChat?.id === chat.id ? 'text-white/70' : 'text-[#aaaaaa]'}`}>{formatChatTime(chat.lastMessage.createdAt)}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${selectedChat?.id === chat.id ? 'text-white/70' : 'text-[#aaaaaa]'}`}>
                        {typingUsers.has(chat.participant.id) ? <span className="text-[#3390ec]">yozmoqda...</span> : chat.lastMessage ? <>{chat.lastMessage.senderId === user?.id && <span className="text-[#4dcd5e]">Siz: </span>}{chat.lastMessage.text || (chat.lastMessage.text === '📷 Rasm' ? '📷 Rasm' : chat.lastMessage.text === '🎥 Video' ? '🎥 Video' : 'Media')}</> : "Xabar yo'q"}
                      </p>
                      {chat.unreadCount > 0 && <span className="bg-[#3390ec] text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[22px] text-center ml-2">{chat.unreadCount}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-20 h-20 bg-[#232e3c] rounded-full flex items-center justify-center mb-4"><MessageCircle className="w-10 h-10 text-[#aaaaaa]" /></div>
              <h3 className="text-white font-medium mb-2">Chatlar yo'q</h3>
              <p className="text-[#aaaaaa] text-sm">Qidiruvdan foydalaning</p>
            </div>
          )}
        </div>
      </div>


      {/* Main Content - Chat Area */}
      <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#0e1621]`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-14 bg-[#17212b] border-b border-[#0e1621] flex items-center justify-between px-3 md:px-4">
              <div className="flex items-center gap-2 md:gap-3">
                <button onClick={handleBackToList} className="md:hidden p-2 hover:bg-[#232e3c] rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-[#aaaaaa]" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                    <span className="text-white font-medium">{selectedChat.participant.displayName.charAt(0)}</span>
                  </div>
                  {(selectedChat.participant.isOnline || onlineUsers.has(selectedChat.participant.id)) && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4dcd5e] rounded-full border-2 border-[#17212b]" />}
                </div>
                <div>
                  <p className="text-white font-medium text-[15px]">{selectedChat.participant.displayName}</p>
                  <p className="text-sm">
                    {typingUsers.has(selectedChat.participant.id) ? <span className="text-[#3390ec]">yozmoqda...</span>
                      : selectedChat.participant.isOnline || onlineUsers.has(selectedChat.participant.id) ? <span className="text-[#4dcd5e]">online</span>
                      : <span className="text-[#aaaaaa]">oxirgi: {formatLastSeen(selectedChat.participant.lastSeen)}</span>}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-[#232e3c] rounded-full transition-colors"><Search className="w-5 h-5 text-[#aaaaaa]" /></button>
            </div>


            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182533' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-[#3390ec] animate-spin" /></div>
              ) : messages.length > 0 ? (
                <div className="max-w-3xl mx-auto space-y-1">
                  {messageGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      <div className="flex justify-center my-4">
                        <span className="bg-[#182533]/80 text-[#aaaaaa] text-xs md:text-sm px-3 py-1 rounded-full backdrop-blur-sm">{formatDateHeader(group.date)}</span>
                      </div>
                      {group.messages.map((msg, msgIndex) => {
                        const isOwn = msg.senderId === user?.id;
                        const showTail = msgIndex === group.messages.length - 1 || group.messages[msgIndex + 1]?.senderId !== msg.senderId;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                            <div className={`relative max-w-[85%] md:max-w-[65%] px-3 py-1.5 ${isOwn ? `bg-[#2b5278] text-white ${showTail ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl'}` : `bg-[#182533] text-white ${showTail ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl'}`}`}>
                              {msg.mediaType === 'image' && msg.mediaId ? (
                                <div className="mb-2">
                                  <img 
                                    src={mediaApi.getMediaUrl(msg.mediaId)} 
                                    alt="Shared image"
                                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    style={{ maxHeight: '300px' }}
                                    onClick={() => window.open(mediaApi.getMediaUrl(msg.mediaId!), '_blank')}
                                  />
                                </div>
                              ) : msg.mediaType === 'video' && msg.mediaId ? (
                                <div className="mb-2 relative">
                                  <video 
                                    src={mediaApi.getMediaUrl(msg.mediaId)}
                                    className="max-w-full h-auto rounded-lg"
                                    style={{ maxHeight: '300px' }}
                                    controls
                                    preload="metadata"
                                  />
                                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                    <Play className="w-3 h-3" />
                                    Video
                                  </div>
                                </div>
                              ) : null}
                              {msg.text && (
                                <p className="text-[14px] md:text-[15px] leading-relaxed break-words">{msg.text}</p>
                              )}
                              <div className={`flex items-center justify-end gap-1 mt-0.5 ${isOwn ? '-mr-1' : ''}`}>
                                <span className="text-[10px] md:text-[11px] text-white/50">{formatTime(msg.createdAt)}</span>
                                {getStatusIcon(msg.status, isOwn)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#182533] rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-[#3390ec]" /></div>
                    <p className="text-[#aaaaaa] text-sm md:text-base">Xabarlar yo'q. Birinchi xabarni yuboring!</p>
                  </div>
                </div>
              )}
            </div>


            {/* Message Input */}
            <div className="bg-[#17212b] border-t border-[#0e1621] px-2 md:px-4 py-2 md:py-3">
              {/* Image Preview */}
              {imagePreview && (
                <div className="max-w-3xl mx-auto mb-3 p-3 bg-[#232e3c] rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button 
                        onClick={handleCancelImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm mb-2">Rasm yuborish uchun tayyor</p>
                      <button 
                        onClick={handleSendImage}
                        disabled={uploadingImage}
                        className="px-4 py-2 bg-[#3390ec] text-white rounded-lg hover:bg-[#2b7fd4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Yuborilmoqda...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Yuborish
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Preview */}
              {videoPreview && (
                <div className="max-w-3xl mx-auto mb-3 p-3 bg-[#232e3c] rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <video 
                        src={videoPreview} 
                        className="w-20 h-20 object-cover rounded-lg"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <button 
                        onClick={handleCancelVideo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm mb-2">Video yuborish uchun tayyor</p>
                      <button 
                        onClick={handleSendVideo}
                        disabled={uploadingVideo}
                        className="px-4 py-2 bg-[#3390ec] text-white rounded-lg hover:bg-[#2b7fd4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {uploadingVideo ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Yuborilmoqda...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Yuborish
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="max-w-3xl mx-auto flex items-center gap-1 md:gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageSelect}
                  className="hidden" 
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload"
                  className="p-2 hover:bg-[#232e3c] rounded-full transition-colors cursor-pointer"
                >
                  <Image className="w-5 h-5 text-[#aaaaaa]" />
                </label>
                
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoSelect}
                  className="hidden" 
                  id="video-upload"
                />
                <label 
                  htmlFor="video-upload"
                  className="p-2 hover:bg-[#232e3c] rounded-full transition-colors cursor-pointer"
                >
                  <Video className="w-5 h-5 text-[#aaaaaa]" />
                </label>
                
                <button className="p-2 hover:bg-[#232e3c] rounded-full transition-colors hidden sm:block"><Paperclip className="w-5 h-5 text-[#aaaaaa]" /></button>
                <div className="flex-1 relative">
                  <input type="text" value={newMessage} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Xabar yozing..."
                    className="w-full px-4 py-2 md:py-2.5 rounded-xl bg-[#242f3d] text-white placeholder-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#3390ec] transition-all text-[14px] md:text-[15px]" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] hover:text-white transition-colors hidden sm:block"><Smile className="w-5 h-5" /></button>
                </div>
                {newMessage.trim() ? (
                  <button onClick={handleSendMessage} className="p-2 md:p-2.5 bg-[#3390ec] rounded-full text-white hover:bg-[#2b7fd4] transition-colors"><Send className="w-5 h-5" /></button>
                ) : (
                  <button className="p-2 md:p-2.5 hover:bg-[#232e3c] rounded-full transition-colors"><Mic className="w-5 h-5 text-[#aaaaaa]" /></button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex-col items-center justify-center hidden md:flex" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182533' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
            <div className="text-center bg-[#182533]/80 backdrop-blur-sm rounded-2xl p-6 md:p-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[#3390ec]/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-[#3390ec]" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">Telegram Clone</h2>
              <p className="text-[#aaaaaa] max-w-md text-sm md:text-base">Suhbatni boshlash uchun chatni tanlang yoki qidiruvdan foydalaning</p>
              {!isConnected && <p className="text-red-400 text-sm mt-4 flex items-center justify-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>Serverga ulanmagan</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
