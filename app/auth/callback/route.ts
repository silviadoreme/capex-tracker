import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
    }

    const supabase = await createClient()

    // Exchange the code for a session
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=exchange_failed`)
    }

    if (!session) {
      console.error('No session returned after code exchange')
      return NextResponse.redirect(`${requestUrl.origin}/login?error=no_session`)
    }

    // Create response with redirect
    const response = NextResponse.redirect(requestUrl.origin)

    // Set the auth cookie
    await supabase.auth.setSession(session)

    // Get user to verify session was set
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Error getting user after session set:', userError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=session_verification_failed`)
    }

    return response
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=unexpected`)
  }
}