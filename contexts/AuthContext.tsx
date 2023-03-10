import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { User } from "firebase/auth";
import Cookies from "js-cookie";

const AuthContext = createContext<any>({});
export const useAuth = () => useContext(AuthContext);
export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>();
  const [loading, setLoading] = useState<boolean>();

  //AuthState Change Use Effect
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        //TODOsetcookies here
        Cookies.set("loggedin", "true");

        setUser(user);
      } else {
        Cookies.remove("loggedin");
        setUser(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  //Sign Up Auth function
  async function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password).then(
      async (cred) => {
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email,
          emailVerified: cred.user.emailVerified,
        });
      }
    );
  }
  //login Auth function
  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  //Googlelogin Auth function
  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  //Google signup Auth function
  const googleSignup = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider).then(async (result) => {
      const docRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          emailVerified: result.user.emailVerified,
        });
      }
    });
  };

  //logout Auth function
  const logout = async () => {
    await signOut(auth).then(() => {
      setUser(null);
      console.log("loggedout");
      Cookies.remove("loggedin");
    });
  };
  //Password Reset Auth function
  const resetPass = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };
  //Send Email Verification Auth Function
  const sendEV = () => {
    let sender = null;
    if (auth.currentUser != null) {
      sender = sendEmailVerification(auth.currentUser).then(() => {
        console.log("email sent");
      });
    }
    return sender;
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        signup,
        googleLogin,
        googleSignup,
        sendEV,
        logout,
        resetPass,
        user,
      }}
    >
      {loading ? <div className="loading">Loading...</div> : children}
    </AuthContext.Provider>
  );
};
