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
  const [itemRates, setItemRates] = useState(ITEM_LIST.reduce((acc, item) => {
    acc[item] = 10; // Default 10% drop rate for each item
    return acc;
  }, {}));

  useEffect(() => {
    if (isLoggedIn) {
      fetchHistory();
    }
  }, [isLoggedIn]);

  const fetchHistory = async () => {
    const res = await fetch(`${BACKEND_URL}?action=fetchHistory`);
    const data = await res.json();
    setHistory(data); // Assuming the backend returns an array of history records
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
        setIsRolling(false);

        // Save the draw history
        saveHistory(data);
      }, 5000);
    }
  };

  const saveHistory = async (data) => {
    const params = new URLSearchParams({
      action: 'saveHistory',
      characterName: data.character,
      itemReceived: data.item,
      timestamp: new Date().toISOString(),
    });
    await fetch(BACKEND_URL, { method: 'POST', body: params });
    fetchHistory(); // Update the history after saving
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

  const handleRateChange = (item, rate) => {
    setItemRates(prevRates => ({
      ...prevRates,
      [item]: rate,
    }));
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
      )}

      {view === 'admin' && (
        <div className="admin-container">
          <h2>🛠️ แอดมิน - เติม Token</h2>
          <input className="input-field" placeholder="ชื่อผู้ใช้" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} />
          <input className="input-field" placeholder="จำนวน Token" type="number" value={adminTokens} onChange={(e) => setAdminTokens(Number(e.target.value))} />
          <button className="btn" onClick={handleAdminAddToken}>เติม Token</button>

          <h3>การตั้งค่าอัตราการสุ่ม</h3>
          <div>
            {ITEM_LIST.map(item => (
              <div key={item}>
                <label>{item}:</label>
                <input 
                  type="number" 
                  value={itemRates[item]} 
                  onChange={(e) => handleRateChange(item, e.target.value)} 
                  min="0" max="100"
                />
              </div>
            ))}
          </div>

          <h3>อัตราการสุ่มไอเท็ม</h3>
          <table>
            <thead>
              <tr>
                <th>ไอเท็ม</th>
                <th>อัตราการสุ่ม (%)</th>
              </tr>
            </thead>
            <tbody>
              {ITEM_LIST.map(item => (
                <tr key={item}>
                  <td>{item}</td>
                  <td>{itemRates[item]}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="btn btn-logout" onClick={() => { setIsLoggedIn(false); setView('login'); }}>ออกจากระบบ</button>
        </div>
      )}

      {view === 'history' && (
        <div className="history-container">
          <h2>ประวัติการสุ่ม</h2>
          <table>
            <thead>
              <tr>
                <th>ตัวละคร</th>
                <th>ไอเท็มที่ได้รับ</th>
                <th>เวลา</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr key={index}>
                  <td>{record.character}</td>
                  <td>{record.item}</td>
                  <td>{new Date(record.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
