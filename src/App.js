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
  const [rollingItems, setRollingItems] = useState([]); // รายการที่แสดงระหว่างหมุน
  const [finalItemIndex, setFinalItemIndex] = useState(0); // index ของไอเท็มที่ได้จริง

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

    // ดึงผลการสุ่มจริงจาก backend ก่อน
    const url = `${BACKEND_URL}?username=${username}&character=${characterName}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data === 'NotEnoughTokens') {
      alert('Token ไม่พอ!');
      setIsRolling(false);
      return;
    }

    // หาตำแหน่งของไอเท็มที่สุ่มได้ใน itemList
    const itemIndex = itemList.findIndex((i) => i.item === data.item);
    const fallbackIndex = Math.floor(Math.random() * itemList.length);
    const targetIndex = itemIndex >= 0 ? itemIndex : fallbackIndex;

    // สร้างรายการที่แสดงเลื่อนแนวตั้ง โดยมีไอเท็มที่ได้จริงซ่อนอยู่ท้ายสุด
    const cycles = 30;
    const fullList = [];

    for (let i = 0; i < cycles; i++) {
      fullList.push(itemList[Math.floor(Math.random() * itemList.length)]);
    }

    // ปิดท้ายด้วยไอเท็มที่สุ่มได้จริง เพื่อให้เลื่อนมาหยุดตรงนี้
    fullList.push(itemList[targetIndex]);
    setRollingItems(fullList);
    setFinalItemIndex(cycles);

    // เริ่มหมุนสล็อต
    const spinDuration = 5000; // ระยะเวลาในการหมุน (5 วินาที)
    const spinInterval = 100; // ความเร็วในการหมุน
    let spinCount = spinDuration / spinInterval;

    const interval = setInterval(() => {
      const updatedRollingItems = rollingItems.map(() => itemList[Math.floor(Math.random() * itemList.length)]);
      setRollingItems(updatedRollingItems); // อัปเดตรายการที่หมุน
      spinCount--;

      if (spinCount <= 0) {
        clearInterval(interval); // หยุดการหมุนเมื่อครบเวลา
        handleFinishDraw(); // เมื่อการหมุนเสร็จ ให้แสดงผลไอเท็ม
      }
    }, spinInterval);

    // ฟังก์ชันที่จะทำเมื่อการหมุนเสร็จ
    const handleFinishDraw = async () => {
      setItem(data); // ตั้งค่าไอเท็มที่สุ่มได้จาก backend
      setToken((prev) => prev - 1);
      fetchHistory(); // โหลดประวัติการสุ่มใหม่
      setIsRolling(false);
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
            <div
