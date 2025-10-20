import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Clue</h1>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  Dashboard
                </button>
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Welcome to Clue
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Sign up now to access your personalized dashboard and unlock all features.
          </p>
          <SignedOut>
            <div className="flex gap-4 justify-center">
              <SignUpButton mode="modal">
                <button className="px-8 py-3 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800">
                  Get Started
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-3 text-base font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="px-8 py-3 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800">
                Go to Dashboard
              </button>
            </Link>
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
