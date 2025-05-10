"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type UserRole = "patient" | "doctor" | "admin"

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  photoURL?: string | null
  createdAt?: any
  lastLogin?: any
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUserData: (data: Partial<UserData>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          // Create a basic userData object from auth info
          // This ensures we have something even if Firestore fetch fails
          const basicUserData: UserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: "patient", // Default role
            photoURL: currentUser.photoURL,
            lastLogin: serverTimestamp(),
          }

          try {
            // Try to get the user document
            const userDocRef = doc(db, "users", currentUser.uid)
            const userDoc = await getDoc(userDocRef)

            if (userDoc.exists()) {
              // If document exists, use that data and update last login
              const firestoreUserData = userDoc.data() as UserData

              // Update last login time
              await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true })

              setUserData(firestoreUserData)
            } else {
              // If document doesn't exist yet, create it with basic info
              await setDoc(doc(db, "users", currentUser.uid), {
                ...basicUserData,
                createdAt: serverTimestamp(),
              })
              setUserData(basicUserData)
            }
          } catch (error) {
            console.error("Error fetching user data:", error)
            // Still set the basic user data even if Firestore fails
            setUserData(basicUserData)
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, {
        displayName: name,
      })

      // Create user document in Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: role,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      }

      // Set the user data with merge option to avoid overwriting
      await setDoc(doc(db, "users", user.uid), userData)

      // Also create a role-specific document
      if (role === "patient") {
        await setDoc(doc(db, "patients", user.uid), {
          userId: user.uid,
          name,
          email: user.email,
          createdAt: serverTimestamp(),
          // Add other patient-specific fields here
        })
      } else if (role === "doctor") {
        await setDoc(doc(db, "doctors", user.uid), {
          userId: user.uid,
          name,
          email: user.email,
          createdAt: serverTimestamp(),
          isVerified: false, // Doctors need verification
          // Add other doctor-specific fields here
        })
      }

      setUserData(userData)
      return
    } catch (error: any) {
      console.error("Error during registration:", error)
      // Extract Firebase error code and throw more user-friendly error
      if (error.code === "auth/email-already-in-use") {
        throw new Error("This email is already registered. Please use a different email or try logging in.")
      } else if (error.code === "auth/weak-password") {
        throw new Error("Password is too weak. Please use a stronger password.")
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address format.")
      } else {
        throw error
      }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Error during login:", error)
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        throw new Error("Invalid email or password. Please try again.")
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many failed login attempts. Please try again later.")
      } else {
        throw error
      }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error during logout:", error)
      throw error
    }
  }

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) throw new Error("No authenticated user")

    try {
      const userDocRef = doc(db, "users", user.uid)
      await setDoc(userDocRef, data, { merge: true })

      // Update local state
      setUserData((prev) => (prev ? { ...prev, ...data } : null))
    } catch (error) {
      console.error("Error updating user data:", error)
      throw error
    }
  }

  const value = {
    user,
    userData,
    loading,
    register,
    login,
    logout,
    updateUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
