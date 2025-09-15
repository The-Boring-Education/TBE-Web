'use client'

import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"

export default function DebugPage() {
  const { user, loading } = useAuth()
  const [localStorageUser, setLocalStorageUser] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("quizUser")
      setLocalStorageUser(stored)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
              <p><strong>User:</strong> {user ? 'exists' : 'null'}</p>
              {user && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Onboarded:</strong> {user.isOnboarded ? 'true' : 'false'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">LocalStorage State</h2>
            <div className="space-y-2">
              <p><strong>quizUser:</strong> {localStorageUser ? 'exists' : 'null'}</p>
              {localStorageUser && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <pre className="text-xs overflow-auto">{localStorageUser}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
            <button 
              onClick={() => localStorage.clear()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear LocalStorage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 