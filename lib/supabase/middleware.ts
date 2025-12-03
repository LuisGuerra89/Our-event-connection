import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth")
  const isHomePage = request.nextUrl.pathname === "/"
  const isOnboardingRoute = request.nextUrl.pathname.startsWith("/onboarding")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")
  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/events") ||
    request.nextUrl.pathname.startsWith("/about") ||
    request.nextUrl.pathname.startsWith("/how-it-works") ||
    request.nextUrl.pathname.startsWith("/contact") ||
    request.nextUrl.pathname.startsWith("/privacy") ||
    request.nextUrl.pathname.startsWith("/terms") ||
    request.nextUrl.pathname.startsWith("/faq") ||
    request.nextUrl.pathname.startsWith("/pricing")

  // Redirect to login if not authenticated and trying to access protected routes
  if (!user && !isAuthRoute && !isHomePage && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && !isAuthRoute && !isOnboardingRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, roles(role_name)")
      .eq("id", user.id)
      .maybeSingle()

    const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null
    const userRole = profileWithRole?.roles?.role_name

    // Skip waiver check for admins and moderators
    if (userRole !== "admin" && userRole !== "moderator") {
      const { data: waiver } = await supabase.from("waivers").select("id").eq("user_id", user.id).maybeSingle()

      if (!waiver && request.nextUrl.pathname !== "/onboarding/waiver") {
        const url = request.nextUrl.clone()
        url.pathname = "/onboarding/waiver"
        return NextResponse.redirect(url)
      }
    }
  }

  if (user && request.nextUrl.pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, roles(role_name)")
      .eq("id", user.id)
      .maybeSingle()

    const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null
    const userRole = profileWithRole?.roles?.role_name

    // Allow admins and moderators to access admin routes
    if (userRole !== "admin" && userRole !== "moderator") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
