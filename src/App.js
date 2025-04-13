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
  const [isDrawing, setIsDrawing] = useState(false); // ตัวแปรใหม่เพื่อป้องกันการกดปุ่มซ้ำ
  const [showCard, setShowCard] = useState(false); // สถานะในการแสดง display card

  const fetchHistory = async () => {
    const res = await fetch(`${BACKEND_URL}?action=gethistory`);
    const data = await res.json();
    setHistory(data.slice(0, 10));
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
      fetchHistory();
      fetchRate();
      fetchItemList();
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
  if (isDrawing) return; // ถ้ามีการสุ่มแล้วจะไม่ให้กดปุ่มอีก
  setIsDrawing(true); // ตั้งค่า isDrawing เป็น true เพื่อเริ่มต้นแอนิเมชัน
  setShowCard(false); // ซ่อน display card ก่อนการสุ่มใหม่

  if (token <= 0) {
    alert('คุณไม่มี Token เพียงพอสำหรับการสุ่ม!');
    setIsDrawing(false);
    return;
  }

  if (!characterName) {
    alert('ใส่ชื่อตัวละครก่อนสุ่ม!');
    setIsDrawing(false);
    return;
  }

  const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data === 'NotEnoughTokens') {
    alert('Token ไม่พอ!');
    setIsDrawing(false);
    return;
  }

  setItem(data); // เก็บไอเท็มที่สุ่มได้
  setToken((prev) => prev - 1); // ลดจำนวน Token
  fetchHistory();

  // สุ่มรายการไอเท็มทั้งหมด
  let rollingItems = [...itemList.filter(i => i.item !== data.item)];
  const randomIndex = Math.floor(Math.random() * (rollingItems.length + 1));
  rollingItems.splice(randomIndex, 0, { item: data.item }); // <--- ไอเท็มสุ่มจะอยู่ตำแหน่งสุ่ม

  // แปลงรายการไอเท็มให้เป็น object ที่มี opacity เพื่อใช้ในแอนิเมชัน
  const fadingItems = rollingItems.map(item => ({ ...item, opacity: 1 }));
  setFadingItemList([...fadingItems]);

  // สุ่มลำดับการทำให้หายไปทีละรายการ
  let indexToFade = [...Array(fadingItems.length - 1).keys()];
  indexToFade = indexToFade.sort(() => Math.random() - 0.5);

  let current = 0;
  const fadeInterval = setInterval(() => {
    // ตรวจสอบหากถึงไอเท็มสุดท้ายให้หยุดแอนิเมชัน
    if (current >= fadingItems.length - 1) {
      setFadingItemList(prevState => {
        const lastItem = [...prevState];
        lastItem[lastItem.length - 1].opacity = 1; // ไอเท็มสุดท้ายจะคงไว้
        return lastItem;
      });

      // แสดง display card หลังแอนิเมชันเสร็จ
      setTimeout(() => {
        setShowCard(true);
      }, 300);  // ปรับเวลาให้ตรงกับช่วงสุดท้ายของแอนิเมชัน

      clearInterval(fadeInterval);
      setIsDrawing(false);  // ตั้งค่า isDrawing เป็น false เมื่อแอนิเมชันเสร็จ
      return;
    }

    // ทำให้รายการไอเท็มหายไปทีละรายการ
    const fadingIndex = indexToFade[current];
    fadingItems[fadingIndex].opacity = 0;
    setFadingItemList([...fadingItems]);

    current++;
  }, 300); // ปรับให้หายทีละชิ้นทุก 300ms
};


        clearInterval(fadeInterval);
        setIsDrawing(false);  // ตั้งค่า isDrawing เป็น false เมื่อแอนิเมชันเสร็จ
        return;
      }

      // ทำให้รายการไอเท็มหายไปทีละรายการ
      const fadingIndex = indexToFade[current];
      fadingItems[fadingIndex].opacity = 0;
      setFadingItemList([...fadingItems]);

      current++;
    }, 300); // ปรับให้หายทีละชิ้นทุก 300ms
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
            <button className="btn btn-gacha" onClick={handleDraw} disabled={isDrawing}>สุ่มไอเท็ม 🔮</button>

            <div className="item-list-container">
              {fadingItemList.map((item, index) => (
                <div className="item" key={index} style={{ opacity: item.opacity, transition: 'opacity 0.5s ease' }}>
                  {item.item}
                </div>
              ))}
            </div>

            {/* แสดง display card หลังจากสุ่มเสร็จ */}
            {showCard && item && (
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
