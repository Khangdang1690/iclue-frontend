'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

interface UserData {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  profile_image_url: string | null
  created_at: string | null
  updated_at: string | null
  last_sign_in_at: string | null
  clerk_metadata: any
}

export default function GetMeButton() {
  const { userId } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMe = async () => {
    if (!userId) {
      setError('No user ID found')
      return
    }

    setLoading(true)
    setError(null)
    setUserData(null)

    try {
      const res = await fetch(`http://localhost:8000/api/me/${userId}`)

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('User not found in database. Webhook may not have been triggered yet.')
        }
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      setUserData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data')
      console.error('Get Me error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Database User Check</h3>
      <p className="text-sm text-gray-600 mb-4">
        Verify that your user data is stored in the PostgreSQL database.
      </p>

      <Button
        onClick={fetchMe}
        disabled={loading}
        className="w-full mb-4"
      >
        {loading ? 'Loading...' : 'Get Me'}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-1">Error:</p>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-2">
            Make sure:
            <br />
            • Backend server is running
            <br />
            • Webhook has been triggered (sign out and sign in again)
            <br />• Database is running
          </p>
        </div>
      )}

      {userData && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-800 mb-3">
            ✅ User found in database!
          </p>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-green-900">ID:</span>
              <p className="font-mono text-green-700 break-all">{userData.id}</p>
            </div>
            <div>
              <span className="font-semibold text-green-900">Email:</span>
              <p className="text-green-700">{userData.email}</p>
            </div>
            <div>
              <span className="font-semibold text-green-900">Name:</span>
              <p className="text-green-700">
                {userData.first_name} {userData.last_name}
              </p>
            </div>
            <div>
              <span className="font-semibold text-green-900">Created At:</span>
              <p className="text-green-700">
                {userData.created_at
                  ? new Date(userData.created_at).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-semibold text-green-900">Last Sign In:</span>
              <p className="text-green-700">
                {userData.last_sign_in_at
                  ? new Date(userData.last_sign_in_at).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
