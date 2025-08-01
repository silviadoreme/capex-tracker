import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    
    const requestUrl = new URL(request.url)
    if (requestUrl.hostname === 'localhost') {
      requestUrl.hostname = '127.0.0.1'
      requestUrl.host = '127.0.0.1' + (requestUrl.port ? `:${requestUrl.port}` : '')
    }
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

    // Set the auth cookie
    await supabase.auth.setSession(session)

    // Get user to verify session was set
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Error getting user after session set:', userError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=session_verification_failed`)
    }

    console.log('requestUrl.origin', requestUrl.origin)
    // Return HTML with client-side redirect
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Logged in successfully</title>
          <script>
            setTimeout(() => {
              window.location.href = '${requestUrl.origin}';
            }, 2000);
          </script>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f9fafb;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 {
              color: #111827;
              font-size: 1.875rem;
              font-weight: 600;
              margin-bottom: 1rem;
            }
            p {
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome ${user.user_metadata.full_name || user.email}!</h1>
            <p>Successfully logged in. Redirecting you in a few seconds to ${requestUrl.origin}</p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      }
    })
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=unexpected`)
  }
}