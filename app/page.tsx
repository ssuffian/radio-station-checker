import { Suspense } from 'react'
import VoteTracker from './components/VoteTracker'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <Suspense>
          <VoteTracker />
        </Suspense>
      </div>
    </main>
  )
}
