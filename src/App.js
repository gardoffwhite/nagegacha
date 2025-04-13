import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzib6C9lGk23Zemy9f0Vj78E5eK8-TQBIaZEGPE5l0FT2Kc0-vDbdfK5xsRG58qmseGsA/exec';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(0);
  const [item, setItem] = useState(null);
  const [view, setView] = useState('login');
  const [history, setHistory] = useState([]);
  const [itemList, setItemList] = useState([]); // รายการไอเท็มทั้งหมด
  const [itemRates, setItemRates] = useState([]); // รายการเรทไอเท็ม
  const [isRolling, setIsRolling] = useState(false);

  // ฟังก์ชันดึงรายการไอเท็มทั้งหมดจาก backend
  const fetchItemList = async () => {
    const res = await fetch(`${BACKEND_URL}?action=itemlist`);
    const data = await res.json();
    setItemList(data); // เก็บรายการไอเท็มจาก backend
  };

  // ฟังก์ชันดึงรายการเรทไอเท็มจาก backend
  const fetchItemRates = async () => {
    const res = await fetch(`${BACKEND_URL}?action=itemrates`);
    const data = await res.json();
    setItemRates(data); // เก็บเรทไอเท็มจาก backend
  };

  // ฟังก์ชันดึงประวัติการสุ่ม
  const fetchHistory = async () => {
    const res = await fetch(`${BACKEND_URL}?action=gethistory`);
    const data = await res.json();
    setHistory(data.slice(0, 20));
  };

  // ฟังก์ชันจัดการการเข้าสู่ระบบ
  const handleAuth = async (action) => {
    const params = new URLSearchParams({ action, username, password });
    const res = await fetch(BACKEND_URL, { method: 'POST', body: params });
    const result = await res.json();

    if (result.status === 'LoginSuccess') {
      setIsLoggedIn(true);
      setToken(result.token || 0);
      setView(result.role === 'admin' ? 'admin' : 'dashboard');
      fetchHistory();
      fetchItemList(); // ดึงรายการไอเท็มหลังจากล็อกอิน
      fetchItemRates(); // ดึงรายการเรทไอเท็มหลังจากล็อกอิน
    } else if (result.status === 'Registered') {
      alert('สมัครสำเร็จ! ลองเข้าสู่ระบบ');
      setView('login');
    } else {
      alert('เกิดข้อผิดพลาด: ' + result.status);
    }
  };

  // ฟังก์ชันสำหรับการสุ่มไอเท็ม
  const handleDraw = async () => {
    if (token <= 0) return alert('คุณไม่มี Token เพียงพอสำหรับการสุ่ม!');
    if (!characterName) return alert('ใส่ชื่อตัวละครก่อนสุ่ม!');
    if (isRolling) return;

    setIsRolling(true);
    setItem(null);

    // เริ่มแสดงไอเท็มทั้งหมด
    let rollingItems = [...itemList];

    // ค่อยๆ จางหายไป
    let remainingItems = [...itemList];
    const fadeDuration = 5000; // ระยะเวลาทั้งหมดในการสุ่ม
    const fadeInterval = 200; // ความเร็วในการจางหาย

    let intervalCount = fadeDuration / fadeInterval;

    const interval = setInterval(() => {
      remainingItems = remainingItems.slice(1); // เอาไอเท็มออกทีละตัว
      setItemList(remainingItems); // อัปเดตรายการไอเท็มที่จางหาย
      intervalCount--;

      if (intervalCount <= 0) {
        clearInterval(interval); // หยุดเมื่อครบเวลา
        handleFinishDraw(); // เมื่อการสุ่มเสร็จ ให้แสดงผลไอเท็ม
      }
    }, fadeInterval);
  };

  // ฟังก์ชันที่จะทำเมื่อการสุ่มเสร็จ
  const handleFinishDraw = async () => {
    const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data === 'NotEnoughTokens') {
      alert('Token ไม่พอ!');
      setIsRolling(false);
    } else {
      setItem(data); // ไอเท็มที่สุ่มได้จาก backend
      setToken((prev) => prev - 1);
      fetchHistory(); // อัปเดตประวัติการสุ่ม
      setIsRolling(false);
    }
  };

  return (
    <div className="app-container">
      {view === 'login' && (
        <div className="auth-container">
          <h2>เข้าสู่ระบบ</h2>
          <input className="input-field" placeholder="ชื่อผู้ใช้" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="input-field" placeholder="รหัสผ่าน" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn" onClick={() => handleAuth('login')}>เข้าสู่ระบบ</button>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="container">
          <div className="dashboard-container">
            <h2>🎮 N-age Warzone Gacha!!</h2>
            <div className="token-display">Token คงเหลือ: {token}</div>
            <input className="input-field" placeholder="ชื่อตัวละครของคุณ" value={characterName} onChange={(e) => setCharacterName(e.target.value)} />
            <button className="btn btn-gacha" onClick={handleDraw} disabled={isRolling}>
              {isRolling ? 'กำลังสุ่ม...' : 'สุ่มไอเท็ม 🔮'}
            </button>

            {isRolling && (
              <div className="rolling-container">
                <div className="rolling-strip">
                  {itemList.map((item, i) => (
                    <div className="rolling-item" key={i}>{item.item}</div>
                  ))}
                </div>
              </div>
            )}

            {item && !isRolling && (
              <div className="item-display-card">
                <div className="item-name">🎁 คุณได้รับ: {item.item}</div>
                <div className="character-name">ตัวละคร: {item.character}</div>
              </div>
            )}

            <button className="btn btn-logout" onClick={() => { setIsLoggedIn(false); setView('login'); }}>ออกจากระบบ</button>
          </div>

          <div className="history-container">
            <h3>ประวัติการสุ่ม</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>ตัวละคร</th>
                  <th>ไอเท็มที่ได้รับ</th>
                  <th>เวลา</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.character}</td>
                    <td>{entry.item}</td>
                    <td>{entry.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="item-rates-container">
            <h3>เรทไอเท็ม</h3>
            <table className="item-rates-table">
              <thead>
                <tr>
                  <th>ไอเท็ม</th>
                  <th>เรท</th>
                </tr>
              </thead>
              <tbody>
                {itemRates.map((rate, index) => (
                  <tr key={index}>
                    <td>{rate.item}</td>
                    <td>{rate.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
