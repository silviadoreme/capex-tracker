import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create an empty response object
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Create supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            response.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/auth/callback', '/auth-error']
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Skip auth check for public routes
    if (isPublicRoute) {
      return response
    }

    // log all cookies
    // For protected routes, verify the session
    const data = await supabase.auth.getSession()
    let session = data.data.session
    if (!session) {
      // No session found, redirect to login
      const redirectUrl = request.nextUrl.pathname
      return NextResponse.redirect(new URL(`/login?redirectTo=${redirectUrl}`, request.url))
    }

    return response
  } catch (e) {
    console.error('Middleware error:', e)
    // If there's an error, redirect to login
    return NextResponse.redirect(new URL('/login?error=middleware_error', request.url))
  }
}

// ignore this url /.well-known/appspecific/com.chrome.devtools.json
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)', '/.well-known/appspecific/com.chrome.devtools.json'],
}