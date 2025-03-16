import React, { useState, useEffect } from "react";
import Registration from "./Component/Registration/Registration.jsx";
import Login from "./Login.jsx";
import Room from "./Component/Registration/Chat/Room.jsx";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

function App() {
  const [room, setRoom] = useState(localStorage.getItem("room") || "");

  useEffect(() => {
    const savedRoom = localStorage.getItem("room");
    if (savedRoom) {
      setRoom(savedRoom); // ✅ Jeśli `room` istnieje w `localStorage`, ustawiamy go w stanie
    }
  }, []);

  console.log("Aktualny pokój w App:", room);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/login" element={<Login /*room={room} */ />} />
          <Route path="/room" element={<Room setRoom={setRoom} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
