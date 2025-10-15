"use client"

import React, { createContext, useContext } from "react"
import { useAuth as useNextAuth } from "@tbe/auth"
import type { User, AuthContextType } from "@tbe/types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const nextAuth = useNextAuth()

    // Convert NextAuth user to quiz app user format
    const user: User | null = nextAuth.user
        ? {
              _id: nextAuth.user.id,
              id: nextAuth.user.id,
              name: nextAuth.user.name || "",
              email: nextAuth.user.email || "",
              image: nextAuth.user.image || "",
              isOnboarded: (nextAuth.user as any).isOnboarded || false,
              userName: (nextAuth.user as any).userName || "",
              occupation: (nextAuth.user as any).occupation || "",
              purpose: (nextAuth.user as any).purpose || []
          }
        : null

    const value: AuthContextType = {
        user,
        loading: nextAuth.isLoading,
        signInWithGoogle: async () => {
            await nextAuth.signIn()
        },
        signOut: nextAuth.signOut,
        updateUser: () => {
            // NextAuth handles user updates automatically
            console.warn(
                "updateUser not implemented for NextAuth - user updates handled automatically"
            )
        },
        refreshUserFromBackend: async () => {
            // NextAuth handles user refresh automatically
            console.warn(
                "refreshUserFromBackend not implemented for NextAuth - user refresh handled automatically"
            )
        },
        retryBackendVerification: async () => {
            // NextAuth handles verification automatically
            console.warn(
                "retryBackendVerification not implemented for NextAuth - verification handled automatically"
            )
        },
        checkAuth: async () => {
            // NextAuth handles auth checking automatically
            console.warn(
                "checkAuth not implemented for NextAuth - auth checking handled automatically"
            )
        }
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
