.app-container {
  font-family: 'Segoe UI', sans-serif;
  padding: 20px;
  text-align: center;
  background-color: #f4f4f4;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: black;
}

.container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
}

.dashboard-container, .history-container, .rate-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 30%;
  color: black;
}

.history-table, .rate-table {
  margin-top: 20px;
  width: 100%;
  border-collapse: collapse;
  color: black;
}

.history-table th, .history-table td, .rate-table th, .rate-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 14px;
  color: black;
}

.history-table th, .rate-table th {
  background-color: #f0f0f0;
}

.history-table tr:nth-child(even), .rate-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.token-display {
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 18px;
  color: black;
}

.btn {
  background-color: #00c8ff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin: 10px 0;
}

.btn-gacha {
  background-color: #ff7a00;
}

.btn-logout {
  background-color: #e60000;
}

.btn:hover {
  background-color: #0088cc;
}

.input-field {
  padding: 10px;
  margin-bottom: 10px;
  width: 80%;
  border-radius: 8px;
  border: 1px solid #ddd;
  color: black;
}

.item-display-card {
  background-color: #fffbf0;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-top: 20px;
  width: 80%;
  text-align: center;
  animation: pulse 1s ease-in-out infinite;
  transition: transform 0.3s ease-in-out;
}

.item-display-card:hover {
  transform: scale(1.05);
}

.item-name {
  font-size: 26px;
  font-weight: bold;
  color: #ff5733;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 15px;
}

.character-name {
  font-size: 18px;
  color: #2c3e50;
  font-weight: 500;
  margin-top: 15px;
  animation: fadeIn 2s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.fade-out {
  animation: fadeOut 0.3s forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { 
    opacity: 0;
    height: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
}

.rolling-item-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.rolling-item-box {
  background-color: #fff8e1;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  font-weight: bold;
  color: #d35400;
  transition: all 0.3s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .dashboard-container, .history-container, .rate-container {
    width: 100%;
    margin-bottom: 20px;
  }
}

/* ส่วนใหม่ที่เพิ่มมา */
.item-list-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
  gap: 8px;
}

.item {
  background-color: #fff8e1;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  font-weight: bold;
  color: #d35400;
  transition: opacity 0.5s ease;
  opacity: 1; /* เริ่มต้นให้มีความทึบ */
}

.item.fade-out {
  opacity: 0; /* ทำให้ไอเท็มจางหายไป */
  height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
