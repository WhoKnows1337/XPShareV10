'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Monitor, Smartphone, ArrowLeft, CheckCircle2, Info } from 'lucide-react'
import { DevicePreview } from '@/components/submit/DevicePreview'
import { useSubmissionStore } from '@/lib/stores/submissionStore'
import { motion } from 'framer-motion'

export default function PreviewPage() {
  const router = useRouter()
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop')

  const { content, title, confirmed, witnesses, mediaFiles } = useSubmissionStore()

  // Build preview data
  const previewData = {
    title,
    content: content || 'Keine Inhalte verfügbar',
    category: confirmed.category || 'other',
    tags: confirmed.tags || [],
    location: confirmed.location?.name,
    date: confirmed.time?.date,
    witnesses: witnesses,
    mediaFiles: mediaFiles.map((file) => ({ url: file.url, type: file.type })),
  }

  const handleContinue = () => {
    router.push('/submit/final')
  }

  const handleBack = () => {
    router.push('/submit/privacy')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold">📱 Vorschau</h1>
          <p className="text-muted-foreground">Sieh dir an, wie deine Erfahrung aussehen wird</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          💡 Prüfe, wie deine Erfahrung auf verschiedenen Geräten dargestellt wird, bevor du sie
          veröffentlichst.
        </AlertDescription>
      </Alert>

      {/* Device Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Geräteansicht wählen</CardTitle>
          <CardDescription>Wechsle zwischen Desktop- und Mobile-Ansicht</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={deviceType} onValueChange={(v) => setDeviceType(v as 'desktop' | 'mobile')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Area */}
      <motion.div
        key={deviceType}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="py-8"
      >
        <DevicePreview data={previewData} deviceType={deviceType} />
      </motion.div>

      {/* Preview Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Inhaltslänge</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{content?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Zeichen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tags & Metadaten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{confirmed.tags?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Tags hinzugefügt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Medien</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mediaFiles?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Dateien hochgeladen</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Bereit zum Veröffentlichen?</CardTitle>
          <CardDescription>Stelle sicher, dass alles korrekt ist</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ChecklistItem
              checked={!!content && content.length >= 50}
              label="Inhalt ist ausreichend detailliert (min. 50 Zeichen)"
            />
            <ChecklistItem
              checked={!!confirmed.category}
              label="Kategorie wurde ausgewählt"
            />
            <ChecklistItem
              checked={!!confirmed.tags && confirmed.tags.length > 0}
              label="Mindestens ein Tag wurde hinzugefügt"
            />
            <ChecklistItem
              checked={!!confirmed.location}
              label="Ort wurde angegeben (optional)"
              optional
            />
            <ChecklistItem
              checked={!!confirmed.time?.date}
              label="Datum wurde angegeben (optional)"
              optional
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleBack} className="flex-1" size="lg">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Privacy
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1"
          size="lg"
          disabled={!content || !confirmed.category || !confirmed.tags || confirmed.tags.length === 0}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Weiter zu Final Review →
        </Button>
      </div>
    </div>
  )
}

interface ChecklistItemProps {
  checked: boolean
  label: string
  optional?: boolean
}

function ChecklistItem({ checked, label, optional }: ChecklistItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          checked
            ? 'bg-green-500 border-green-500'
            : optional
            ? 'border-muted-foreground/30'
            : 'border-muted-foreground'
        }`}
      >
        {checked && <CheckCircle2 className="h-3 w-3 text-white" />}
      </div>
      <span className={`text-sm ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
        {optional && <span className="text-xs ml-1">(optional)</span>}
      </span>
    </div>
  )
}
