import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function middleware(request: NextRequest) {
  let response = await updateSession(request)
  
  // Check if user is trying to access /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            },
          },
        }
      )

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch user profile with role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role_id, roles(role_name)")
          .eq("id", user.id)
          .single()

        // Check if user is admin or moderator
        const userRole = (profile?.roles as any)?.role_name
        if (userRole === 'admin' || userRole === 'moderator') {
          // Redirect to /admin
          return NextResponse.redirect(new URL('/admin', request.url))
        }
      }
    } catch (error) {
      console.error('Middleware error:', error)
      // Continue with normal flow if there's an error
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
