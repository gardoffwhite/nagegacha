import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzib6C9lGk23Zemy9f0Vj78E5eK8-TQBIaZEGPE5l0FT2Kc0-vDbdfK5xsRG58qmseGsA/exec";

function App() {
  const [username, setUsername] = useState('');
  const [character, setCharacter] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(0);
  const [history, setHistory] = useState([]);
  const [rates, setRates] = useState([]);
  const [rollingItems, setRollingItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const fetchRates = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}?action=getRates`);
      setRates(response.data);
    } catch (err) {
      console.error("Error fetching rates", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}?action=getHistory&username=${username}`);
      setHistory(response.data.slice(-20).reverse());
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  const handleLogin = async () => {
    if (!username) return alert("Please enter username.");
    try {
      const response = await axios.get(`${BACKEND_URL}?action=login&username=${username}`);
      setToken(response.data.token);
      setIsLoggedIn(true);
      fetchHistory();
      fetchRates();
    } catch (err) {
      console.error("Login error", err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCharacter('');
    setToken(0);
    setRollingItems([]);
    setSelectedItem(null);
  };

  const handleGacha = async () => {
    if (!character) return alert("Please enter character name.");
    try {
      setIsRolling(true);
      setSelectedItem(null);
      const response = await axios.get(`${BACKEND_URL}?action=gacha&username=${username}&character=${character}`);
      const receivedItem = response.data.item;
      setToken(response.data.token);

      // สุ่มแบบลบทีละชิ้น
      const fullItemList = response.data.allItems;
      let tempList = [...fullItemList];
      setRollingItems(tempList);

      const removeItemsOneByOne = (index) => {
        if (tempList.length <= 1 || tempList[index] === receivedItem) {
          setTimeout(() => {
            setSelectedItem(receivedItem);
            setIsRolling(false);
            fetchHistory();
          }, 500);
          return;
        }

        tempList.splice(index, 1);
        setRollingItems([...tempList]);

        const nextIndex = Math.min(index, tempList.length - 1);
        setTimeout(() => removeItemsOneByOne(nextIndex), 200);
      };

      setTimeout(() => removeItemsOneByOne(0), 500);
    } catch (err) {
      console.error("Gacha error", err);
      setIsRolling(false);
    }
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <div className="dashboard-container">
          <h2>🎮 เข้าสู่ระบบ</h2>
          <input className="input-field" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <button className="btn" onClick={handleLogin}>เข้าสู่ระบบ</button>
        </div>
      ) : (
        <>
          <div className="dashboard-container">
            <h2>🎰 ระบบสุ่ม Gacha</h2>
            <div className="token-display">💎 Token: {token}</div>
            <input className="input-field" type="text" placeholder="ชื่อตัวละคร" value={character} onChange={e => setCharacter(e.target.value)} />
            <button className="btn btn-gacha" onClick={handleGacha} disabled={isRolling}>สุ่มไอเท็ม</button>
            <button className="btn btn-logout" onClick={handleLogout}>ออกจากระบบ</button>

            {/* 🎯 SLOT แบบลบทีละชิ้น */}
            {rollingItems.length > 0 && (
              <div className="rolling-container">
                {rollingItems.map((item, index) => (
                  <div className="rolling-item" key={index}>{item}</div>
                ))}
              </div>
            )}

            {/* 🎁 แสดงผลลัพธ์ */}
            {selectedItem && (
              <div className="item-display-card">
                <div className="item-name">{selectedItem}</div>
                <div className="character-name">สำหรับ {character}</div>
              </div>
            )}
          </div>

          <div className="container">
            <div className="history-container">
              <h3>📜 ประวัติการสุ่ม (ล่าสุด)</h3>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>เวลา</th>
                    <th>ชื่อตัวละคร</th>
                    <th>ไอเท็มที่ได้รับ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.timestamp}</td>
                      <td>{entry.character}</td>
                      <td>{entry.item}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rate-container">
              <h3>📊 อัตราการได้รับ</h3>
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>ชื่อไอเท็ม</th>
                    <th>โอกาส (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate, index) => (
                    <tr key={index}>
                      <td>{rate.item}</td>
                      <td>{rate.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
