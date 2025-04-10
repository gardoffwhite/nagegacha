import React, { useState } from 'react';
import './App.css';

const sampleRates = [
  { item: 'ดาบเทพเจ้า' },
  { item: 'โล่พลังน้ำแข็ง' },
  { item: 'หมวกนักรบ' },
  { item: 'เกราะแสงอาทิตย์' },
  { item: 'แหวนเวทย์มนต์' },
  { item: 'ปีกมังกร' },
  { item: 'ดาบเงา' },
  { item: 'หอกสายฟ้า' }
];

export default function App() {
  const [username, setUsername] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [item, setItem] = useState(null);
  const [dropRates, setDropRates] = useState(sampleRates);

  const handleDraw = () => {
    if (!characterName) return alert('กรุณาใส่ชื่อตัวละคร');
    setIsRolling(true);
    setItem(null);
    const result = dropRates[Math.floor(Math.random() * dropRates.length)];

    setTimeout(() => {
      setItem({ item: result.item, character: characterName });
      setIsRolling(false);
    }, 5000);
  };

  return (
    <div className="app-container">
      <h2>🎮 ระบบสุ่มไอเท็มแนวตั้ง</h2>
      <input
        className="input-field"
        placeholder="ชื่อตัวละครของคุณ"
        value={characterName}
        onChange={(e) => setCharacterName(e.target.value)}
      />
      <button className="btn" onClick={handleDraw}>สุ่มไอเท็ม 🔮</button>

      {isRolling && dropRates.length > 0 && (
        <div className="scroll-container">
          <div className="scroll-inner">
            {Array.from({ length: 30 }).map((_, i) => {
              const entry = dropRates[i % dropRates.length];
              return (
                <div className="scroll-item" key={i}>
                  {entry.item}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {item && !isRolling && (
        <p className="item-name stop-animation">
          🎁 คุณได้รับ: {item.item} <br />🎭 ตัวละคร: {item.character}
        </p>
      )}
    </div>
  );
}
