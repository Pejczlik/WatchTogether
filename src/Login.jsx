import React, { useState, useEffect, useRef } from "react";
import {
  doc,
  setDoc,
  addDoc,
  Timestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase.js";
import { signOut } from "firebase/auth";
import YouTube from "react-youtube";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Import the CSS file

function Login(/*{ room }*/) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timestamp, setTimestamp] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);
  const playerRef = useRef(null);
  const isUpdating = useRef(false);

  const navigate = useNavigate();
  const room = localStorage.getItem("room");

  // Ref do ostatniej wiadomości
  const lastMessageRef = useRef(null);

  const MessageCollectiobRef = query(
    collection(db, "messages"),
    where("room", "==", room),
    orderBy("date")
  );
  const VideoDocRef = doc(db, "rooms", room);
  const UsersRef = collection(db, "rooms", room, "activeUsers");

  // Przewijanie do ostatniej wiadomości po każdej zmianie messages
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" }); // Przewijanie
    }
  }, [messages]);

  useEffect(() => {
    const unsuscribe = onSnapshot(MessageCollectiobRef, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });

    return () => unsuscribe();
  }, [room]);

  useEffect(() => {
    const unsub = onSnapshot(VideoDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVideoId(data.videoId || "");
        setTimestamp(data.timestamp || 0);
        setIsPlaying(data.isPlaying || false);

        if (playerRef.current) {
          playerRef.current.seekTo(data.timestamp, true);
          if (data.isPlaying) {
            playerRef.current.playVideo();
          } else {
            playerRef.current.pauseVideo();
          }
        }
      }
    });

    return () => unsub();
  }, [room]);

  useEffect(() => {
    const unsub = onSnapshot(UsersRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => doc.id);
      setActiveUsers(users);

      if (users.length > 1) {
        playerRef.current?.pauseVideo();
        updateDoc(VideoDocRef, { isPlaying: false });
      }
    });

    const addUser = async () => {
      const userRef = doc(UsersRef, auth.currentUser?.email || "anonymous");
      await setDoc(userRef, { joinedAt: Timestamp.now() });
    };
    addUser();

    return () => {
      const removeUser = async () => {
        const userRef = doc(UsersRef, auth.currentUser?.email || "anonymous");
        await deleteDoc(userRef);
      };
      removeUser();
      unsub();
    };
  }, [room]);

  // Funkcja obsługująca wysyłanie wiadomości
  const HandleMessageSubmit = async (e) => {
    try {
      e.preventDefault();

      const userEmail = auth?.currentUser?.email;
      if (!userEmail) {
        console.error("Użytkownik nie jest zalogowany.");
        alert("Musisz być zalogowany, aby wysyłać wiadomości.");
        return;
      }

      await addDoc(collection(db, "messages"), {
        text: newMessage,
        date: Timestamp.now(),
        userID: userEmail,
        room: room,
      });

      setNewMessage(""); // Czyści pole wiadomości
      const chat = document.querySelector(".chat-input input");
      if (chat) chat.value = "";
    } catch (error) {
      console.error("Error adding message: ", error);
    }
  };

  const HandleVideoLinkSubmit = async (e) => {
    e.preventDefault();
    const extractedId = extractVideoId(videoLink);
    if (extractedId) {
      setVideoId(extractedId);
      await setDoc(VideoDocRef, {
        videoLink,
        videoId: extractedId,
        timestamp: 0,
        isPlaying: false,
      });
    }
  };

  const extractVideoId = (url) => {
    const regex =
      /(?:youtube\.com\/.*[?&]v=|youtu\.be\/|embed\/|v\/)([^"&?\/\s]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const updateVideoStatus = async (isPlayingState, currentTime) => {
    try {
      await updateDoc(VideoDocRef, {
        isPlaying: isPlayingState,
        timestamp: currentTime,
      });
    } catch (error) {
      console.error("Error updating video status: ", error);
    }
  };

  const onPlay = async (event) => {
    if (!isUpdating.current) {
      isUpdating.current = true;
      const currentTime = Math.floor(event.target.getCurrentTime());
      setIsPlaying(true);
      await updateVideoStatus(true, currentTime);
      isUpdating.current = false;
    }
  };

  const onPause = async (event) => {
    if (!isUpdating.current) {
      isUpdating.current = true;
      const currentTime = Math.floor(event.target.getCurrentTime());
      setIsPlaying(false);
      await updateVideoStatus(false, currentTime);
      isUpdating.current = false;
    }
  };

  const onReady = (event) => {
    playerRef.current = event.target;
    playerRef.current.seekTo(timestamp, true);
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  };

  const HandleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="video-section">
        <div className="video-controls">
          <input
            type="text"
            placeholder="Link do filmu YouTube"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            className="video-input"
          />
          <button onClick={HandleVideoLinkSubmit} className="button">
            Wyślij link
          </button>
        </div>
        <div className="iframe-container">
          {videoId && (
            <YouTube
              className="yt-iframe"
              videoId={videoId}
              opts={{
                width: "800",
                height: "450",
                playerVars: { autoplay: 1 },
              }}
              onPlay={onPlay}
              onPause={onPause}
              onReady={onReady}
            />
          )}
        </div>
        <button onClick={HandleSignOut} className="button sign-out">
          Wyloguj się
        </button>
      </div>
      <div className="chat-section">
        <h2>Wiadomości</h2>
        <div id="chat-container" className="chat-container">
          {messages.map((item, index) => (
            <div
              key={item.id}
              className="message"
              ref={index === messages.length - 1 ? lastMessageRef : null}
            >
              <h3>{item.text}</h3>
              <h5>{item.userID}</h5>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Wiadomość"
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={HandleMessageSubmit} className="button">
            Wyślij
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
