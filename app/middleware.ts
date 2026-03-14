import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Chỉ bảo vệ các đường dẫn bắt đầu bằng /admin
  if (pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')

    if (authHeader) {
      const authValue = authHeader.split(' ')[1]
      const [user, pass] = atob(authValue).split(':')

      // So sánh với biến môi trường
      if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
        return NextResponse.next()
      }
    }

    // Nếu sai hoặc chưa nhập, hiện bảng đăng nhập của trình duyệt
    return new NextResponse('Auth Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
