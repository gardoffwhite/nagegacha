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
  const [history, setHistory] = useState([]);
  const [rate, setRate] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [fadingItemList, setFadingItemList] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false); // สถานะการสุ่ม

  // 🆕 ดึงข้อมูลเมื่อเข้าสู่ระบบ
  useEffect(() => {
    if (isLoggedIn) {
      fetchHistory();
      fetchRate();
      fetchItemList();
    }
  }, [isLoggedIn]);

  const fetchHistory = async () => {
    const res = await fetch(`${BACKEND_URL}?action=gethistory`);
    const data = await res.json();
    setHistory(data.slice(0, 15));
  };

  const fetchItemList = async () => {
    const res = await fetch(`${BACKEND_URL}?action=itemlist`);
    const data = await res.json();
    setItemList(data);
  };

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
    if (isDrawing) return;
    if (token <= 0) return alert('คุณไม่มี ATTO เพียงพอสำหรับการสุ่ม!');
    if (!characterName) return alert('ใส่ชื่อตัวละครก่อนสุ่ม!');

    setIsDrawing(true);
    setItem(null);

    const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data === 'NotEnoughTokens') {
      alert('ATTO ไม่พอ!');
      setIsDrawing(false);
      return;
    }

    setToken((prev) => prev - 1);

    const rollingItems = [...itemList];
    const fadingItems = rollingItems.map((it) => {
      if (it.item === data.item) {
        return { ...it, opacity: 1, isDrawn: true };
      }
      return { ...it, opacity: 1, isDrawn: false };
    });
    setFadingItemList([...fadingItems]);

    let indexToFade = fadingItems
      .map((item, index) => ({ index, isDrawn: item.isDrawn }))
      .filter((entry) => !entry.isDrawn)
      .map((entry) => entry.index);
    indexToFade = indexToFade.sort(() => Math.random() - 0.5);

    let current = 0;
    const fadeInterval = setInterval(() => {
      const fadingIndex = indexToFade[current];
      fadingItems[fadingIndex].opacity = 0;
      setFadingItemList([...fadingItems]);

      current++;
      if (current >= indexToFade.length) {
        clearInterval(fadeInterval);
        setItem(data);
        fetchHistory();
        setIsDrawing(false);
      }
    }, 300);
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

  // 🆕 ออกจากระบบ
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setCharacterName('');
    setToken(0);
    setItem(null);
    setFadingItemList([]);
    setHistory([]);
    setView('login');
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
            <div className="gacha-header">
              <img src="https://i.imgur.com/hLylouD.png" alt="N-age Warzone Gacha" className="gacha-logo" />
            </div>

            <div className="diamond-text">
              <img src="https://i.imgur.com/9uEjL4T.png" alt="RedAttospectrum " className="diamond-glow" />
              Red attospectrum
            </div>
            <div className="RedAttospectrum">คงเหลือ: {token}</div>

            <input className="input-field" placeholder="ชื่อตัวละครของคุณ" value={characterName} onChange={(e) => setCharacterName(e.target.value)} />
            <button className="btn btn-gacha" onClick={handleDraw} disabled={isDrawing}>
              {isDrawing ? 'กำลังสุ่ม...' : 'สุ่มไอเท็ม 🔮'}
            </button>

            <div className="item-list-container">
              {fadingItemList.map((item, index) => (
                <div className="item" key={index} style={{ opacity: item.opacity, transition: 'opacity 0.5s ease' }}>
                  {item.item}
                </div>
              ))}
            </div>

            {item && (
              <div className="item-display-card">
                <div className="item-name">🎁 คุณได้รับ: {item.item}</div>
                <div className="character-name">ตัวละคร: {item.character}</div>
              </div>
            )}

            <button className="btn btn-logout" onClick={handleLogout}>ออกจากระบบ</button>
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

      <div className="footer-text">
        ใช้งานในมือถือ กรุณา ตั้งค่าเปิดใน โหมด DESKTOP
      </div>
    </div>
  );
}
