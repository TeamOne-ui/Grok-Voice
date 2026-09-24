import { NextResponse } from 'next/server'

export const config = {
  matcher: ,
}

export default function middleware(req) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const = atob(authValue).split(':')

    if (user === process.env.AUTH_USER && pwd === process.env.AUTH_PASS) {
      return NextResponse.next()
    }
  }
  url.pathname = '/api/auth'

  return NextResponse.rewrite(url)
}