import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Route matchers
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
const isLandingRoute = createRouteMatcher(['/'])

export default clerkMiddleware(async (auth, req) => {
  // Protect dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  const { userId } = await auth()

  // Only fetch user profile for routes where we might need to redirect
  const needsRoutingCheck = isLandingRoute(req) || isAuthRoute(req) || isOnboardingRoute(req) || isProtectedRoute(req)

  if (!userId || !needsRoutingCheck) {
    return
  }

  // Fetch user profile from backend to check onboarding status
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const res = await fetch(`${apiBase}/api/me/${userId}`, {
      headers: { Authorization: `Bearer ${userId}` },
      cache: 'no-store',
    })

    let companyId: string | null = null
    if (res.ok) {
      const user = await res.json()
      companyId = user?.company_id || null
    }

    // If user has a company (onboarded)
    if (companyId) {
      // Redirect from public/auth/onboarding to dashboard
      if (isLandingRoute(req) || isAuthRoute(req) || isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return
    }

    // If user has no company (not onboarded) and is hitting dashboard, send to onboarding
    if (isProtectedRoute(req)) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  } catch (e) {
    // Fail open on errors to avoid blocking navigation
    return
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
