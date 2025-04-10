import React, { useState } from 'react';
import './App.css';

const ITEM_LIST = [
  { item: 'Item 1' },
  { item: 'Item 2' },
  { item: 'Item 3' },
  { item: 'Item 4' },
  { item: 'Item 5' }
];

export default function App() {
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(100);
  const [characterName, setCharacterName] = useState('');
  const [item, setItem] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [adminRates, setAdminRates] = useState({
    'Item 1': 30,
    'Item 2': 25,
    'Item 3': 20,
    'Item 4': 15,
    'Item 5': 10,
  });

  const handleAuth = (type) => {
    if (type === 'login') {
      setView('dashboard');
    } else if (type === 'register') {
      setView('login');
    }
  };

  const handleDraw = () => {
    if (token <= 0 || isRolling) return;
    setIsRolling(true);
    setToken(prevToken => prevToken - 1);
    setTimeout(() => {
      const drawnItem = ITEM_LIST[Math.floor(Math.random() * ITEM_LIST.length)];
      setItem({ ...drawnItem, character: characterName });
      setHistory(prevHistory => [
        ...prevHistory,
        { character: characterName, item: drawnItem.item }
      ]);
      setIsRolling(false);
    }, 5000); // Simulate a rolling time of 5 seconds
  };

  const handleAdminAddToken = () => {
    setToken(prevToken => prevToken + 10); // Add 10 tokens as admin
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
          {/* Left Side - History Table */}
          <div className="history-container">
            <h3>ประวัติการสุ่ม</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>ชื่อตัวละคร</th>
                  <th>ไอเท็มที่ได้รับ</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.character}</td>
                    <td>{entry.item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Center - Gacha Area */}
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

          {/* Right Side - Rates Table */}
          <div className="rate-container">
            <h3>เรทการสุ่ม</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>ไอเท็ม</th>
                  <th>เรท (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(adminRates).map(([itemName, rate], index) => (
                  <tr key={index}>
                    <td>{itemName}</td>
                    <td>{rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'admin' && (
        <div className="admin-container">
          <h2>🛠️ แอดมิน - เติม Token</h2>
          <input className="input-field" placeholder="ชื่อผู้ใช้" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} />
          <input className="input-field" placeholder="จำนวน Token" type="number" value={adminTokens} onChange={(e) => setAdminTokens(Number(e.target.value))} />
          <button className="btn" onClick={handleAdminAddToken}>เติม Token</button>
        </div>
      )}
    </div>
  );
}
