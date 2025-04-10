import React, { useState } from 'react';
import './App.css';

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
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState([]);
  const [adminRates, setAdminRates] = useState({
    'ดาบเทพ': 10,
    'เกราะเหล็ก': 20,
    'หมวกนักรบ': 15,
    'ปีกปีศาจ': 5,
    'ยาเพิ่มพลัง': 10,
    'กล่องสุ่ม': 10,
    'โล่เวท': 10,
    'หอกสายฟ้า': 5,
    'รองเท้าเร็ว': 5,
    'แหวนเวทย์มนตร์': 10
  });

  const handleDraw = async () => {
    if (token <= 0) return alert('คุณไม่มี Token เพียงพอสำหรับการสุ่ม!');
    if (!characterName) return alert('ใส่ชื่อตัวละครก่อนสุ่ม!');
    if (isRolling) return;

    setIsRolling(true);
    setItem(null);

    // Randomly select an item
    const randomItem = ITEM_LIST[Math.floor(Math.random() * ITEM_LIST.length)];

    setTimeout(() => {
      setItem({ item: randomItem, character: characterName });
      setToken(prev => prev - 1);
      setHistory(prevHistory => [...prevHistory, { character: characterName, item: randomItem }]);
      setIsRolling(false);
    }, 5000);
  };

  return (
    <div className="app-container">
      {isLoggedIn && (
        <div className="main-container">
          <div className="middle-section">
            <h2>🎮 ระบบสุ่มไอเท็ม</h2>
            <div className="token-display">Token คงเหลือ: {token}</div>
            <input
              className="input-field"
              placeholder="ชื่อตัวละครของคุณ"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
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
          </div>

          <div className="right-section">
            <h2>อัตราการสุ่ม</h2>
            <table className="rate-table">
              <thead>
                <tr>
                  <th>ไอเท็ม</th>
                  <th>อัตรา (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(adminRates).map(([item, rate]) => (
                  <tr key={item}>
                    <td>{item}</td>
                    <td>{rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>

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
        </div>
      )}
    </div>
  );
}
