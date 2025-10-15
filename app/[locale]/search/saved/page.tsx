import { Metadata } from 'next'
import { SavedSearchesManager } from '@/components/search/saved-searches-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Saved Searches | XP-Share',
  description: 'Manage your saved searches and alerts',
}

export default function SavedSearchesPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Searches</h1>
        <p className="text-muted-foreground">
          Manage your saved searches and set up alerts for new matches
        </p>
      </div>

      <div className="space-y-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Search Alerts</CardTitle>
            <CardDescription>
              Get notified when new experiences match your saved searches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Hourly:</strong> Check for new matches every hour</li>
              <li>• <strong>Daily:</strong> Get a daily digest of new matches</li>
              <li>• <strong>Weekly:</strong> Weekly summary of all new matches</li>
            </ul>
          </CardContent>
        </Card>

        {/* Saved Searches Manager */}
        <SavedSearchesManager />
      </div>
    </div>
  )
}
