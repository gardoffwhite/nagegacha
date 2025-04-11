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
  const [rate, setRate] = useState([]);  // กำหนดให้ rate เป็น array ที่เริ่มต้นเป็น empty

  // ดึงประวัติการสุ่ม
  const fetchHistory = async () => {
    const res = await fetch(`${BACKEND_URL}?action=gethistory`);
    const data = await res.json();
    setHistory(data.slice(0, 20));
  };

  // ดึงเรทการสุ่มจาก Backend
  const fetchRate = async () => {
    const res = await fetch(`${BACKEND_URL}?action=getrate`);
    const data = await res.json();
    setRate(data.rate || []);  // กำหนดให้รับข้อมูลที่ส่งจาก backend และเก็บไว้ใน rate
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchRate();  // ดึงข้อมูลเรทเมื่อผู้ใช้เข้าสู่ระบบ
    }
  }, [isLoggedIn]);  // เมื่อเข้าสู่ระบบ, ดึงข้อมูลเรท

  // ฟังก์ชันที่ใช้สำหรับเข้าสู่ระบบ
  const handleAuth = async (action) => {
    const params = new URLSearchParams({ action, username, password });
    const res = await fetch(BACKEND_URL, { method: 'POST', body: params });
    const result = await res.json();

    if (result.status === 'LoginSuccess') {
      setIsLoggedIn(true);
      setToken(result.token || 0);
      setView(result.role === 'admin' ? 'admin' : 'dashboard');
      fetchHistory();  // โหลดประวัติการสุ่ม
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

  // ฟังก์ชันที่ใช้สำหรับสุ่มไอเท็ม
  const handleDraw = async () => {
    if (token <= 0) return alert('คุณไม่มี Token เพียงพอสำหรับการสุ่ม!');
    if (!characterName) return alert('ใส่ชื่อตัวละครก่อนสุ่ม!');

    const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data === 'NotEnoughTokens') {
      alert('Token ไม่พอ!');
    } else {
      setItem(data);  // กำหนดผลลัพธ์ของการสุ่ม
      setToken(prev => prev - 1);  // ลดจำนวน Token
      fetchHistory();  // โหลดประวัติการสุ่มใหม่
    }
  };

  return (
    <div className="app-container">
      {/* ... (ส่วนอื่น ๆ ของ UI) ... */}

      {view === 'dashboard' && (
        <div className="container">
          <div className="dashboard-container">
            <h2>🎮 N-age Warzone Gacha!!</h2>
            <div className="token-display">Token คงเหลือ: {token}</div>
            <input className="input-field" placeholder="ชื่อตัวละครของคุณ" value={characterName} onChange={(e) => setCharacterName(e.target.value)} />
            <button className="btn btn-gacha" onClick={handleDraw}>สุ่มไอเท็ม 🔮</button>

            {item && (
              <div className="item-display-card">
                <div className="item-name">🎁 คุณได้รับ: {item.item}</div>
                <div className="character-name">ตัวละคร: {item.character}</div>
              </div>
            )}

            {/* ประวัติการสุ่ม */}
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

            {/* เรทการสุ่ม */}
            <div className="rate-container">
              <h3>เรทการสุ่ม</h3>
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>ไอเท็ม</th>
                    <th>เรท</th>
                  </tr>
                </thead>
                <tbody>
                  {rate.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.item}</td>
                      <td>{entry.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
