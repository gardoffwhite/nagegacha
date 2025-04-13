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
  const [itemList, setItemList] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  // Fetch item list from backend
  const fetchItemList = async () => {
    const res = await fetch(`${BACKEND_URL}?action=itemlist`);
    const data = await res.json();
    setItemList(data); // Store item list from backend
  };

  const fetchHistory = async () => {
    const res = await fetch(`${BACKEND_URL}?action=gethistory`);
    const data = await res.json();
    setHistory(data.slice(0, 20));
  };

  const handleAuth = async (action) => {
    const params = new URLSearchParams({ action, username, password });
    const res = await fetch(BACKEND_URL, { method: 'POST', body: params });
    const result = await res.json();

    if (result.status === 'LoginSuccess') {
      setIsLoggedIn(true);
      setToken(result.token || 0);
      setView(result.role === 'admin' ? 'admin' : 'dashboard');
      fetchHistory();
      fetchItemList(); // Fetch item list after login
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
    if (token <= 0) return alert('คุณไม่มี Token เพียงพอสำหรับการสุ่ม!');
    if (!characterName) return alert('ใส่ชื่อตัวละครก่อนสุ่ม!');
    if (isRolling) return;

    setIsRolling(true);

    // เริ่มการสุ่ม
    const spinDuration = 5000; // ระยะเวลาในการสุ่ม (5 วินาที)
    const spinInterval = 100; // ความเร็วในการสุ่ม
    let spinCount = spinDuration / spinInterval;

    // สร้าง array สำหรับแสดงไอเท็มทั้งหมด
    let rollingItems = [...itemList];

    // ค่อยๆ ลบไอเท็มออกทีละชิ้น
    let currentItemList = rollingItems.slice(); // สร้างสำเนารายการไอเท็ม
    const interval = setInterval(() => {
      if (currentItemList.length > 1) {
        // ลบไอเท็มแรกออก
        currentItemList.shift();
        setItemList(currentItemList); // อัปเดตรายการไอเท็ม
      } else {
        clearInterval(interval); // หยุดการสุ่มเมื่อเหลือไอเท็มเดียว
        handleFinishDraw(currentItemList[0]); // แสดงผลเมื่อการสุ่มเสร็จ
      }
      spinCount--;
      if (spinCount <= 0) {
        clearInterval(interval); // หยุดการสุ่ม
      }
    }, spinInterval);
  };

  // ฟังก์ชันที่ทำเมื่อการสุ่มเสร็จ
  const handleFinishDraw = async (finalItem) => {
    // ดึงข้อมูลจาก backend
    const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data === 'NotEnoughTokens') {
      alert('Token ไม่พอ!');
      setIsRolling(false);
    } else {
      setItem(finalItem); // ตั้งค่าไอเท็มที่สุ่มได้
      setToken((prev) => prev - 1); // ลด Token
      fetchHistory(); // โหลดประวัติการสุ่มใหม่
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
          <p>ยังไม่มีบัญชี? <span className="link" onClick={() => setView('register')}>สมัครสมาชิก</span></p>
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
                  {itemList.map((item, index) => (
                    <div className="rolling-item" key={index}>
                      {item.item} {/* ใช้รายการไอเท็มจาก backend */}
                    </div>
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
        </div>
      )}
    </div>
  );
}
