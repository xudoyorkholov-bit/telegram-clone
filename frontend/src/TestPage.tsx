import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: '#0e1621', 
      color: 'white', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Test Sahifasi</h1>
      <p>Agar bu matnni ko'rayotgan bo'lsangiz, React ishlayapti!</p>
      <div style={{ 
        backgroundColor: '#17212b', 
        padding: '20px', 
        borderRadius: '10px',
        marginTop: '20px'
      }}>
        <h2>Telegram Clone</h2>
        <p>Server holati: Ishlamoqda ✅</p>
        <p>Frontend holati: Ishlamoqda ✅</p>
      </div>
    </div>
  );
};