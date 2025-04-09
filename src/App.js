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
  const [items, setItems] = useState([]); // สถานะเก็บไอเท็มทั้งหมด
  const [isRolling, setIsRolling] = useState(false); // ตรวจสอบว่ากำลังสุ่มหรือไม่

  useEffect(() => {
    fetchItems(); // ดึงไอเท็มจาก Backend เมื่อ Component โหลด
  }, []);

  const fetchItems = async () => {
    const res = await fetch(`${BACKEND_URL}?action=getItems`);
    const data = await res.json();
    setItems(data.items || []);
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
    if (!characterName) return alert('กรุณาใส่ชื่อตัวละครก่อนสุ่ม!');
    const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data === 'NotEnoughTokens') {
      alert('Token ไม่พอ!');
    } else {
      setIsRolling(true);
      setItem(data);
      setToken((prev) => prev - 1);

      // เริ่มแอนิเมชันแล้วหยุดเมื่อสุ่มเสร็จ
      setTimeout(() => {
        setIsRolling(false);
        setItem(prevItem => ({ ...prevItem, stopAnimation: true }));
      }, 3000); // ใช้เวลา 3 วินาทีสำหรับแอนิเมชัน
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
          <h2>🎮 N-age Warzone Gacha!!</h2>
          <p>Token คงเหลือ: {token}</p>
          <input
            className="input-field"
            placeholder="ชื่อตัวละครของคุณ"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
          />
          <button className="btn" onClick={handleDraw}>สุ่มไอเท็ม 🔮</button>
          {isRolling ? (
            <div className="items-list rolling">
              {items.map((item, index) => (
                <div key={index} className="item-name">
                  {item}
                </div>
              ))}
            </div>
          ) : (
            item && (
              <div className="items-list stop">
                <div className="item-name stop-animation">
                  🎁 คุณได้รับ: {item.item} ตัวละคร {item.character}
                </div>
              </div>
            )
          )}
          <button className="btn" onClick={() => { setIsLoggedIn(false); setView('login'); }}>ออกจากระบบ</button>
        </div>
      )}

      {view === 'admin' && (
        <div className="admin-container">
          <h2>🛠️ แอดมิน - เติม Token</h2>
          <input
            className="input-field"
            placeholder="ชื่อผู้ใช้"
            value={adminUser}
            onChange={(e) => setAdminUser(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="จำนวน Token"
            type="number"
            value={adminTokens}
            onChange={(e) => setAdminTokens(Number(e.target.value))}
          />
          <button className="btn" onClick={handleAdminAddToken}>เติม Token</button>
          <button className="btn" onClick={() => { setIsLoggedIn(false); setView('login'); }}>ออกจากระบบ</button>
        </div>
      )}
    </div>
  );
}
