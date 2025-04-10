import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzib6C9lGk23Zemy9f0Vj78E5eK8-TQBIaZEGPE5l0FT2Kc0-vDbdfK5xsRG58qmseGsA/exec';
const ITEM_LIST = [
  'ดาบเทพ', 'เกราะเหล็ก', 'หมวกนักรบ', 'ปีกปีศาจ',
  'ยาเพิ่มพลัง', 'กล่องสุ่ม', 'โล่เวท', 'หอกสายฟ้า',
  'รองเท้าเร็ว', 'แหวนเวทย์มนตร์'
];

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
  const [rate, setRate] = useState([
    { item: 'ดาบเทพ', rate: '10%' },
    { item: 'เกราะเหล็ก', rate: '15%' },
    { item: 'หมวกนักรบ', rate: '20%' },
    { item: 'ปีกปีศาจ', rate: '5%' },
    { item: 'ยาเพิ่มพลัง', rate: '30%' },
    { item: 'กล่องสุ่ม', rate: '10%' },
    { item: 'โล่เวท', rate: '5%' },
  ]);

  const fetchHistory = async () => {
    const url = `${BACKEND_URL}?action=gethistory`;
    const res = await fetch(url);
    const data = await res.json();
    const recentHistory = data.history ? data.history.slice(-20).reverse() : []; // เก็บแค่ 20 แถวล่าสุดแล้ว reverse
    setHistory(recentHistory);
  };

  useEffect(() => {
    fetchHistory();  // ดึงประวัติเมื่อ Component ถูกโหลด
  }, []);

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
    if (token <= 0) return alert('คุณไม่มี Token เพียงพอสำหรับการสุ่ม!');
    if (!characterName) return alert('ใส่ชื่อตัวละครก่อนสุ่ม!');
    if (isRolling) return;

    setIsRolling(true);
    setItem(null);

    const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data === 'NotEnoughTokens') {
      alert('Token ไม่พอ!');
      setIsRolling(false);
    } else {
      setTimeout(() => {
        setItem(data);
        setToken((prev) => prev - 1);
        setHistory((prevHistory) => [...prevHistory, { ...data, time: new Date().toLocaleString() }]); // Add to history with time
        setIsRolling(false);
      }, 5000);
    }
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
                      {ITEM_LIST[Math.floor(Math.random() * ITEM_LIST.length)]}
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

          {/* Left - History */}
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
                    <td>{entry.item}</td> {/* แสดงไอเท็มที่ได้รับ */}
                    <td>{entry.time}</td> {/* แสดงเวลา */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right - Rate */}
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
      )}
    </div>
  );
}
