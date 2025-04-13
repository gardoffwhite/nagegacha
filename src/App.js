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
  const [adminUser, setAdminUser] = useState('');
  const [adminTokens, setAdminTokens] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState([]);
  const [rate, setRate] = useState([]);
  const [itemList, setItemList] = useState([]); // State to store item list

  // Fetch history
  const fetchHistory = async () => {
    const res = await fetch(`${BACKEND_URL}?action=gethistory`);
    const data = await res.json();
    setHistory(data.slice(0, 20));
  };

  // Fetch item list from backend
  const fetchItemList = async () => {
    const res = await fetch(`${BACKEND_URL}?action=itemlist`);
    const data = await res.json();
    setItemList(data); // Store item list from backend
  };

  // Fetch rates
  const fetchRate = async () => {
    const res = await fetch(`${BACKEND_URL}?action=getrate`);
    const data = await res.json();
    setRate(data);
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
      fetchRate();
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
    setItem(null);

    // เริ่มหมุนสล็อต
    const spinDuration = 5000; // ระยะเวลาในการหมุน (5 วินาที)
    const spinInterval = 100; // ความเร็วในการหมุน
    let spinCount = spinDuration / spinInterval;

    // สร้าง array สำหรับแสดงไอเท็ม
    let rollingItems = Array(30).fill(null).map(() => itemList[Math.floor(Math.random() * itemList.length)]);

    setItemList(rollingItems); // ใช้รายการที่สุ่มขึ้นมาแสดงในขณะหมุน

    const interval = setInterval(() => {
        rollingItems = rollingItems.map(() => itemList[Math.floor(Math.random() * itemList.length)]);
        setItemList(rollingItems); // อัปเดตรายการที่หมุน
        spinCount--;

        if (spinCount <= 0) {
            clearInterval(interval); // หยุดการหมุนเมื่อครบเวลา
            handleFinishDraw(); // เมื่อการหมุนเสร็จ ให้แสดงผลไอเท็ม
        }
    }, spinInterval);

    // ฟังก์ชันที่จะทำเมื่อการหมุนเสร็จ
    const handleFinishDraw = async () => {
        // ดึงไอเท็มที่สุ่มได้จาก backend
        const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data === 'NotEnoughTokens') {
            alert('Token ไม่พอ!');
            setIsRolling(false);
        } else {
            setItem(data); // ตั้งค่าไอเท็มที่สุ่มได้จาก backend
            setToken((prev) => prev - 1);
            fetchHistory(); // โหลดประวัติการสุ่มใหม่
            setIsRolling(false);
        }
    };
  };

  const handleAdminAddToken = async () => {
    const params = new URLSearchParams({
      action: 'addtoken',
      username: adminUser,
      token: adminTokens,
    });
    const res = await fetch(BACKEND_URL, { method: 'POST', body: params });
    const result = await res.json();
    alert(result.status === 'TokenAdded' ? 'เติม Token สำเร็จ' : 'ไม่พบผู้ใช้นี้');
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

      {view === 'register' && (
        <div className="auth-container">
          <h2>สมัครสมาชิก</h2>
          <input className="input-field" placeholder="ชื่อผู้ใช้" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="input-field" placeholder="รหัสผ่าน" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn" onClick={() => handleAuth('register')}>สมัครสมาชิก</button>
          <p>มีบัญชีอยู่แล้ว? <span className="link" onClick={() => setView('login')}>เข้าสู่ระบบ</span></p>
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
                  {Array(30).fill(null).map((_, i) => (
                    <div className="rolling-item" key={i}>
                      {itemList[Math.floor(Math.random() * itemList.length)]?.item} {/* Use the itemList from backend */}
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

          <div className="rate-container">
            <h3>เรทการสุ่ม</h3>
            <table className="rate-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Rate</th>
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
      )}
    </div>
  );
}
