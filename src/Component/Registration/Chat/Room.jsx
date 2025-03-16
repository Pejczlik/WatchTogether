import React, { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase.js";
import "./Room.css"; // Import pliku stylów

function Room() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const HandleRoom = (e) => {
    setRoom(e.target.value);
  };

  const createOrJoinRoom = async (roomName) => {
    if (!roomName || roomName.trim() === "") {
      console.error("Room name cannot be empty");
      return;
    }

    try {
      const docRef = doc(db, "rooms", roomName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Pokój istnieje. Dołączamy do pokoju:", roomName);
        return true; // Pokój istnieje, dołączamy
      } else {
        await setDoc(docRef, {
          name: roomName,
          createdAt: new Date(),
        });
        console.log("Pokój utworzony z Document ID:", roomName);
        return true; // Pokój został utworzony, można do niego dołączyć
      }
    } catch (error) {
      console.error("Błąd przy tworzeniu lub dołączaniu do pokoju:", error);
      return false;
    }
  };

  const HandleJoin = async (e) => {
    e.preventDefault(); // Zapobiega domyślnemu przesłaniu formularza
    try {
      const success = await createOrJoinRoom(room); // Tworzy/dołącza do pokoju
      if (success) {
        localStorage.setItem("room", room); // Zapisujemy pokój w localStorage
        console.log("Pokój zapisany:", room);
        navigate("/login"); // Przekierowanie do widoku pokoju
      }
    } catch (error) {
      console.error("Błąd podczas zapisywania pokoju:", error);
    }
  };

  return (
    <div className="room-container">
      <form className="room-form" onSubmit={HandleJoin}>
        <label htmlFor="room" className="room-label">
          Wpisz kod pokoju
        </label>
        <input
          type="text"
          id="room"
          name="room"
          className="room-input"
          value={room}
          onChange={HandleRoom}
        />
        <button type="submit" className="room-button">
          Dołącz
        </button>
      </form>
    </div>
  );
}

export default Room;
