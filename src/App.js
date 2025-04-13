.rolling-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px auto;
  justify-content: center;
}

.rolling-item {
  background-color: #222;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: bold;
  animation: fadeOut 0.3s ease forwards;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0.3; transform: scale(0.9); }
}
