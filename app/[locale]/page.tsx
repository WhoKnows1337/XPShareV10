import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Search, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 px-4 py-24">
        <div className="max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <Sparkles className="h-16 w-16 text-purple-600" aria-hidden="true" />
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Share Your{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Extraordinary
            </span>{' '}
            Experiences
          </h1>

          <p className="mb-8 text-xl text-slate-600 sm:text-2xl">
            Connect with others, discover patterns, and explore the unexplained
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Join thousands sharing paranormal events, UFO sightings, and unexplained phenomena
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-white px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-purple-100 p-4">
                <Sparkles className="h-8 w-8 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Share Experiences</h3>
              <p className="text-slate-600">
                Tell your story through text, audio, photos, or sketches with our intelligent submission flow
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-purple-100 p-4">
                <Search className="h-8 w-8 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Discover Patterns</h3>
              <p className="text-slate-600">
                Find connections with similar experiences worldwide using AI-powered pattern matching
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-purple-100 p-4">
                <Users className="h-8 w-8 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Join Community</h3>
              <p className="text-slate-600">
                Connect with others who've had similar encounters and share insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-br from-purple-600 to-pink-600 px-4 py-16 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to Share Your Story?
          </h2>
          <p className="mb-8 text-lg text-purple-100">
            Join our community and help map the unexplained
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
