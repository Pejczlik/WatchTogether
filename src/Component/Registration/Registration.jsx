import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithRedirect,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { app } from "../../firebase.js";
import React from "react";
import { getAuth } from "firebase/auth";
import { Outlet, Link } from "react-router-dom";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase.js";
import "./Registration.css";
import { useNavigate } from "react-router-dom";

function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = getAuth(app);
  const navigate = useNavigate();

  const HandleSingUp = async (e) => {
    try {
      e.preventDefault();
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/room");
      console.log("SignUp Done");
    } catch (error) {
      console.error("SignUp Error", error);
    }
  };

  const HandleLogin = async (e) => {
    try {
      e.preventDefault();
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/room");

      console.log("Logged in");
    } catch (error) {
      console.error("Login Error", error);
    }
  };

  const HandleGoogleLogin = async (e) => {
    try {
      const googleProvider = await new GoogleAuthProvider();
      await signInWithPopup(auth, googleProvider);
      navigate("/room");
      console.log("Google done");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="register-title">Zaloguj się</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
        />
        <button className="register-button" onClick={HandleLogin}>
          Zaloguj
        </button>
      </div>
      <div className="register-options">
        <button className="register-button" onClick={HandleSingUp}>
          Zarejestruj się
        </button>
        <button className="register-button google" onClick={HandleGoogleLogin}>
          Kontynuuj z Google
        </button>
      </div>
    </div>
  );
}

export default Registration;
