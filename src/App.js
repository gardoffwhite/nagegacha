import React, { useState } from 'react';

const BACKEND_URL = 'YOUR_GOOGLE_SCRIPT_URL';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(0);
  const [item, setItem] = useState(null);
  const [view, setView] = useState('login');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminTokens, setAdminTokens] = useState(0);

  const handleAuth = async (action) => {
    const params = new URLSearchParams({ action, email, password });
    const res = await fetch(BACKEND_URL, { method: 'POST', body: params });
    const text = await res.text();
    if (text === 'LoginSuccess' || text === 'Registered') {
      setIsLoggedIn(true);
      setView(email === 'admin@example.com' ? 'admin' : 'dashboard');
      setToken(5);
    } else {
      alert(text);
    }
  };

  const handleDraw = async () => {
    if (!characterName) return alert('ใส่ชื่อตัวละครก่อนสุ่ม!');
    const url = `${BACKEND_URL}?email=${email}&character=${characterName}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data === 'NotEnoughTokens') {
      alert('Token ไม่พอ!');
    } else {
      setItem(data);
      setToken((prev) => prev - 1);
    }
  };

  const handleAdminAddToken = async () => {
    const params = new URLSearchParams({
      action: 'addtoken',
      email: adminEmail,
      token: adminTokens,
    });
    const res = await fetch(BACKEND_URL, { method: 'POST', body: params });
    const text = await res.text();
    alert(text);
  };

  return (
    <div>
      {view === 'login' && (
        <>
          <h2>เข้าสู่ระบบ</h2>
          <input placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="รหัสผ่าน" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => handleAuth('login')}>เข้าสู่ระบบ</button>
          <p>ยังไม่มีบัญชี? <span onClick={() => setView('register')}>สมัครสมาชิก</span></p>
        </>
      )}
      {view === 'register' && (
        <>
          <h2>สมัครสมาชิก</h2>
          <input placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="รหัสผ่าน" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => handleAuth('register')}>สมัครสมาชิก</button>
          <p>มีบัญชีอยู่แล้ว? <span onClick={() => setView('login')}>เข้าสู่ระบบ</span></p>
        </>
      )}
      {view === 'dashboard' && (
        <>
          <h2>🎮 ยินดีต้อนรับ!</h2>
          <p>Token คงเหลือ: {token}</p>
          <input placeholder="ชื่อตัวละครของคุณ" value={characterName} onChange={(e) => setCharacterName(e.target.value)} />
          <button onClick={handleDraw}>สุ่มไอเท็ม 🔮</button>
          {item && <p>🎁 คุณได้รับ: {item.item} จาก {item.character}</p>}
          <button onClick={() => { setIsLoggedIn(false); setView('login'); }}>ออกจากระบบ</button>
        </>
      )}
      {view === 'admin' && (
        <>
          <h2>🛠️ แอดมิน - เติม Token</h2>
          <input placeholder="อีเมลของผู้ใช้" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          <input placeholder="จำนวน Token" type="number" value={adminTokens} onChange={(e) => setAdminTokens(Number(e.target.value))} />
          <button onClick={handleAdminAddToken}>เติม Token</button>
          <button onClick={() => { setIsLoggedIn(false); setView('login'); }}>ออกจากระบบ</button>
        </>
      )}
    </div>
  );
}