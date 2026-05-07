import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  const csv = readFileSync(join(process.cwd(), 'data', 'votes.csv'), 'utf-8')
  return new NextResponse(csv, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
