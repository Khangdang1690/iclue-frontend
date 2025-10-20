'use client'

import { useState } from 'react'

export default function TestBackendButton() {
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testBackend = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('http://localhost:8000/api/test')

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend')
      console.error('Backend connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Backend Connection Test</h3>

      <button
        onClick={testBackend}
        disabled={loading}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
      >
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-1">Error:</p>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-2">
            Make sure the backend server is running on http://localhost:8000
          </p>
        </div>
      )}

      {response && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-800 mb-2">
            {response.message}
          </p>
          <div className="space-y-1 text-xs text-green-700">
            <p><strong>Status:</strong> {response.status}</p>
            <p><strong>Version:</strong> {response.backend_version}</p>
            <p><strong>Timestamp:</strong> {new Date(response.timestamp).toLocaleString()}</p>
            {response.tip && (
              <p className="mt-2 italic">{response.tip}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
