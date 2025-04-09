import React, { useState } from 'react';
import './App.css';

const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzib6C9lGk23Zemy9f0Vj78E5eK8-TQBIaZEGPE5l0FT2Kc0-vDbdfK5xsRG58qmseGsA/exec';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(0);
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [view, setView] = useState('login');
  const [adminUser, setAdminUser] = useState('');
  const [adminTokens, setAdminTokens] = useState(0);

  const handleAuth = async (action) => {
    const params = new URLSearchParams({ action, username, password });
    const res = await fetch(BACKEND_URL, { method: 'POST', body: params });
    const result = await res.json();

    if (result.status === 'LoginSuccess') {
      setIsLoggedIn(true);
      setToken(result.token || 0);
      setView(result.role === 'admin' ? 'admin' : 'dashboard');
    } else if (result.status === 'Registered') {
      alert('สมัครสำเร็จ! ลองเข้าสู่ระบบ');
      setView('login');
    } else if (result.status === 'UsernameAlreadyExists') {
      alert('ชื่อผู้ใช้นี้มีอยู่แล้ว');
    } else if (result.status === 'InvalidCredentials') {
      alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } else {
      alert('เกิดข้อผิดพลาด: ' + result.status);
    }
  };

  const handleDraw = async () => {
    if (!characterName) return alert('ใส่ชื่อตัวละครก่อนสุ่ม!');
    const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data === 'NotEnoughTokens') {
      alert('Token ไม่พอ!');
    } else {
      setItems(data.items);  // รับข้อมูลไอเท็มจาก backend
      startSlotAnimation(data.items);  // เริ่มแอนิเมชันการเลื่อนไอเท็ม
    }
  };

  const startSlotAnimation = (items) => {
    let i = 0;
    let interval = setInterval(() => {
      setItem(items[i]);
      i = (i + 1) % items.length;  // เลื่อนไอเท็มไปเรื่อยๆ
    }, 100);  // ใช้เวลา 100ms สำหรับการเลื่อนแต่ละขั้น

    setTimeout(() => {
      clearInterval(interval);  // หยุดแอนิเมชันหลังจาก 3 วินาที
      setItem(items[Math.floor(Math.random() * items.length)]);  // เลือกไอเท็มสุ่มสุดท้าย
    }, 3000);  // รอ 3 วินาทีเพื่อให้แอนิเมชันเลื่อนครบ
  };

  return (
    <div className="app-container">
      {/* ชื่อเกมที่มุมซ้าย */}
      <div className="game-title">🎮 N-age Warzone Gacha!!</div>
      
      {/* ปุ่มล็อกเอาต์ที่มุมขวาบน */}
      {isLoggedIn && (
        <button className="btn logout-btn" onClick={() => { setIsLoggedIn(false); setView('login'); }}>ออกจากระบบ</button>
      )}

      {view === 'login' && (
        <div className="auth-container">
          <h2>เข้าสู่ระบบ</h2>
          <input
            className="input-field"
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="รหัสผ่าน"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn" onClick={() => handleAuth('login')}>เข้าสู่ระบบ</button>
          <p>
            ยังไม่มีบัญชี? <span className="link" onClick={() => setView('register')}>สมัครสมาชิก</span>
          </p>
        </div>
      )}

      {view === 'register' && (
        <div className="auth-container">
          <h2>สมัครสมาชิก</h2>
          <input
            className="input-field"
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="รหัสผ่าน"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn" onClick={() => handleAuth('register')}>สมัครสมาชิก</button>
          <p>
            มีบัญชีอยู่แล้ว? <span className="link" onClick={() => setView('login')}>เข้าสู่ระบบ</span>
          </p>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="dashboard-container">
          {/* ป้อนชื่อตัวละครและปุ่มสุ่มติดกัน */}
          <div className="draw-container">
            <input
              className="input-field"
              placeholder="ชื่อตัวละครของคุณ"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
            <button className="btn" onClick={handleDraw}>สุ่มไอเท็ม 🔮</button>
          </div>

          {/* รายละเอียดการสุ่ม */}
          {item && (
            <div className="item-details">
              <p className={`item-name ${item.stopAnimation ? 'stop-animation' : ''}`}>
                🎁 คุณได้รับ: {item}
              </p>
              <p>ตัวละคร: {characterName}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
