# XPChat v3 - Mobile-First Design

**Status:** Planning Phase
**Created:** 2025-10-26

> **Design System Context:** Mobile-spezifische Patterns werden mit shadcn/ui + Framer Motion implementiert. Siehe [17-DESIGN-SYSTEM-2025.md](./17-DESIGN-SYSTEM-2025.md) für vollständige Komponenten-Library, Animationen, Touch Gestures, und Accessibility.

---

## 📱 Why Mobile-First?

**Reality Check:**
- 70% der User kommen über Mobile
- Spontane Erlebnisse werden unterwegs eingetragen (direkt nach dem Event)
- Chat ist ein natürlich mobiles Interface

**Principe:** Design für den kleinsten Screen, dann scale up (nicht umgekehrt)

---

## 🎨 Mobile UI Architecture

### The 3-Zone Layout

```
┌─────────────────────────────┐
│  HEADER (Fixed)             │ ← 56px
│  [←] Discovery [🔔] [👤]    │
├─────────────────────────────┤
│                             │
│                             │
│  CONTENT (Scrollable)       │ ← Fill
│  • Messages                 │
│  • Visualizations           │
│  • Suggestions              │
│                             │
│                             │
├─────────────────────────────┤
│  INPUT (Fixed Bottom)       │ ← Dynamic
│  [📎] [Input...] [Send →]   │
└─────────────────────────────┘
```

---

## 💬 Chat Interface Mobile

### Message Bubbles

```typescript
export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn(
      'flex mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-3',
        isUser
          ? 'bg-blue-500 text-white rounded-br-none'
          : 'bg-gray-100 text-gray-900 rounded-bl-none'
      )}>
        {/* Text Content */}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Tool Results (if any) */}
        {message.toolInvocations?.map(tool => (
          <ToolResultCard key={tool.toolCallId} tool={tool} />
        ))}

        {/* Timestamp */}
        <span className={cn(
          'text-xs mt-2 block',
          isUser ? 'text-blue-100' : 'text-gray-500'
        )}>
          {format(message.createdAt, 'HH:mm')}
        </span>
      </div>
    </div>
  )
}
```

### Smart Input Bar

```typescript
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [height, setHeight] = useState(56) // Dynamic height
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight + 'px'
      setHeight(Math.max(56, Math.min(120, scrollHeight + 16)))
    }
  }, [input])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t safe-area-inset-bottom"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-end gap-2 p-3 h-full">
        {/* Attachment Button */}
        <button
          className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={() => {/* Open attachment picker */}}
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend(input)
              setInput('')
            }
          }}
          placeholder="Nachricht..."
          disabled={disabled}
          className="flex-1 resize-none border-0 bg-transparent text-[15px] placeholder:text-gray-400 focus:outline-none max-h-[120px]"
          rows={1}
        />

        {/* Send Button */}
        <button
          onClick={() => {
            onSend(input)
            setInput('')
          }}
          disabled={disabled || !input.trim()}
          className={cn(
            'w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-colors',
            input.trim()
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-400'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
```

---

## 🗺️ Visualizations Mobile

### Collapsible Cards

```typescript
export function VisualizationCard({ type, data }: VisualizationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="my-4">
      {/* Header (always visible) */}
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getVisualizationIcon(type)}
            <CardTitle className="text-base">
              {getVisualizationTitle(type)}
            </CardTitle>
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </div>

        {/* Quick Stats (collapsed state) */}
        {!isExpanded && (
          <p className="text-sm text-gray-600 mt-1">
            {getQuickSummary(type, data)}
          </p>
        )}
      </CardHeader>

      {/* Content (expanded state) */}
      {isExpanded && (
        <CardContent>
          {type === 'map' && <MapViewMobile data={data} />}
          {type === 'timeline' && <TimelineViewMobile data={data} />}
          {type === 'dashboard' && <DashboardViewMobile data={data} />}
        </CardContent>
      )}
    </Card>
  )
}
```

### Map View Mobile

```typescript
export function MapViewMobile({ data }: { data: GeoJSON }) {
  return (
    <div>
      {/* Map (touch-optimized) */}
      <div className="h-[300px] rounded-lg overflow-hidden border">
        <Mapbox
          data={data}
          touchZoom={true}
          touchRotate={false} // Disable rotation (UX: confusing on mobile)
          dragPan={true}
          scrollZoom={false} // Prevent accidental zoom while scrolling page
        />
      </div>

      {/* List View Toggle */}
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          🗺️ Karte
        </Button>
        <Button size="sm" variant="ghost" className="flex-1">
          📋 Liste
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-2xl font-bold">{data.features.length}</div>
          <div className="text-xs text-gray-600">Orte</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{getTopRegion(data)}</div>
          <div className="text-xs text-gray-600">Top Region</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{getSpread(data)} km</div>
          <div className="text-xs text-gray-600">Reichweite</div>
        </div>
      </div>
    </div>
  )
}
```

### Timeline View Mobile

```typescript
export function TimelineViewMobile({ data }: { data: TimelineData[] }) {
  const [groupBy, setGroupBy] = useState<'day' | 'month' | 'year'>('month')

  return (
    <div>
      {/* Group By Selector */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={groupBy === 'day' ? 'default' : 'outline'}
          onClick={() => setGroupBy('day')}
          className="flex-1"
        >
          Tag
        </Button>
        <Button
          size="sm"
          variant={groupBy === 'month' ? 'default' : 'outline'}
          onClick={() => setGroupBy('month')}
          className="flex-1"
        >
          Monat
        </Button>
        <Button
          size="sm"
          variant={groupBy === 'year' ? 'default' : 'outline'}
          onClick={() => setGroupBy('year')}
          className="flex-1"
        >
          Jahr
        </Button>
      </div>

      {/* Chart (responsive) */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={aggregateData(data, groupBy)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(date) => formatDateMobile(date, groupBy)}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
        <strong>Peak:</strong> {getPeakDate(data, groupBy)} mit {getPeakCount(data)} Erlebnissen
      </div>
    </div>
  )
}
```

---

## 🎯 Touch Interactions

### Gestures

```typescript
// Swipe to go back
export function useSwipeBack(onSwipeBack: () => void) {
  const [startX, setStartX] = useState(0)

  const handleTouchStart = (e: TouchEvent) => {
    setStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    const diff = endX - startX

    // Swipe right from left edge
    if (startX < 50 && diff > 100) {
      onSwipeBack()
    }
  }

  return { handleTouchStart, handleTouchEnd }
}

// Pull to refresh
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const handleTouchStart = (e: TouchEvent) => {
    const scrollY = window.scrollY
    if (scrollY === 0) {
      setIsPulling(true)
      setPullDistance(0)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (isPulling && window.scrollY === 0) {
      const distance = e.touches[0].clientY
      setPullDistance(Math.min(distance, 100))
    }
  }

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 60) {
      await onRefresh()
    }
    setIsPulling(false)
    setPullDistance(0)
  }

  return {
    isPulling,
    pullDistance,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}
```

### Long Press Actions

```typescript
export function useLongPress(
  onLongPress: () => void,
  delay = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const start = () => {
    timeoutRef.current = setTimeout(onLongPress, delay)
  }

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel
  }
}

// Usage: Long press on message to see options
<MessageBubble
  message={message}
  {...useLongPress(() => {
    showMessageActions(message)
  })}
/>
```

---

## 🎨 Mobile-Specific Components

### Bottom Sheet (for selections)

```typescript
'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function CategorySelector({ onSelect }: CategorySelectorProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Kategorie wählen</Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[60vh]">
        <div className="p-4">
          <h3 className="font-semibold mb-4">Was möchtest du teilen?</h3>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className="p-4 border rounded-lg flex flex-col items-center gap-2 active:bg-gray-50"
              >
                <span className="text-4xl">{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

### Action Sheet (for message actions)

```typescript
export function MessageActions({ message }: { message: Message }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="h-auto">
        <div className="py-2">
          <button
            className="w-full p-4 text-left flex items-center gap-3 active:bg-gray-50"
            onClick={() => {
              copyToClipboard(message.content)
              setOpen(false)
            }}
          >
            <Copy className="w-5 h-5" />
            <span>Kopieren</span>
          </button>

          <button
            className="w-full p-4 text-left flex items-center gap-3 active:bg-gray-50"
            onClick={() => {
              shareMessage(message)
              setOpen(false)
            }}
          >
            <Share className="w-5 h-5" />
            <span>Teilen</span>
          </button>

          <button
            className="w-full p-4 text-left flex items-center gap-3 text-red-600 active:bg-red-50"
            onClick={() => {
              deleteMessage(message.id)
              setOpen(false)
            }}
          >
            <Trash className="w-5 h-5" />
            <span>Löschen</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

---

## 📸 Camera & Media Mobile

### Camera Capture

```typescript
'use client'

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Back camera
        audio: false
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsActive(true)
    } catch (err) {
      console.error('Camera access denied:', err)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(blob)
          stopCamera()
        }
      }, 'image/jpeg', 0.8)
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop())
    setStream(null)
    setIsActive(false)
  }

  return (
    <div>
      {!isActive ? (
        <Button onClick={startCamera}>
          📷 Foto aufnehmen
        </Button>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button size="lg" onClick={capturePhoto} className="rounded-full">
              📸
            </Button>
            <Button size="lg" variant="outline" onClick={stopCamera}>
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Voice Recording

```typescript
export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      onRecordingComplete(blob, duration)
      chunksRef.current = []
      setDuration(0)
    }

    mediaRecorder.start()
    setIsRecording(true)

    // Duration counter
    const interval = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  return (
    <div>
      {!isRecording ? (
        <Button onClick={startRecording}>
          🎤 Sprachnotiz
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-mono text-sm">
              {formatDuration(duration)}
            </span>
          </div>
          <Button onClick={stopRecording}>
            Stop
          </Button>
        </div>
      )}
    </div>
  )
}
```

---

## 🔔 Native Features

### Push Notifications (PWA)

```typescript
// Request permission
export async function requestNotificationPermission() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Send subscription to backend
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription)
      })

      return true
    }
  }

  return false
}

// Show notification
export function showNotification(title: string, options: NotificationOptions) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, options)
    })
  }
}
```

### Share API

```typescript
export async function shareExperience(experience: Experience) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: experience.title,
        text: experience.description.slice(0, 200) + '...',
        url: `https://xpshare.com/experiences/${experience.id}`
      })
    } catch (err) {
      console.error('Share failed:', err)
    }
  } else {
    // Fallback: Copy to clipboard
    copyToClipboard(`https://xpshare.com/experiences/${experience.id}`)
  }
}
```

### Vibration Feedback

```typescript
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    }
    navigator.vibrate(patterns[type])
  }
}

// Usage: On button press, match found, etc.
<Button
  onClick={() => {
    hapticFeedback('medium')
    handleSubmit()
  }}
>
  Eintragen
</Button>
```

---

## ⚡ Performance Mobile

### Lazy Loading

```typescript
// Lazy load visualizations
const MapView = lazy(() => import('@/components/visualizations/MapView'))
const TimelineView = lazy(() => import('@/components/visualizations/TimelineView'))

export function VisualizationRenderer({ type, data }: VisualizationProps) {
  return (
    <Suspense fallback={<VisualizationSkeleton />}>
      {type === 'map' && <MapView data={data} />}
      {type === 'timeline' && <TimelineView data={data} />}
    </Suspense>
  )
}
```

### Image Optimization

```typescript
// Use Next.js Image with blur placeholder
import Image from 'next/image'

export function ExperienceImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL={generateBlurDataURL(src)}
      loading="lazy"
      className="rounded-lg"
    />
  )
}
```

### Infinite Scroll

```typescript
export function ExperienceList({ initialData }: ExperienceListProps) {
  const [page, setPage] = useState(1)
  const [experiences, setExperiences] = useState(initialData)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    const { data } = await fetch(`/api/experiences?page=${page + 1}`)
    if (data.length === 0) {
      setHasMore(false)
    } else {
      setExperiences(prev => [...prev, ...data])
      setPage(prev => prev + 1)
    }
  }

  return (
    <div>
      {experiences.map(exp => (
        <ExperienceCard key={exp.id} experience={exp} />
      ))}

      {hasMore && (
        <div
          ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting) {
                    loadMore()
                  }
                },
                { threshold: 0.5 }
              )
              observer.observe(el)
              return () => observer.disconnect()
            }
          }}
          className="h-20 flex items-center justify-center"
        >
          <Loader className="w-6 h-6 animate-spin" />
        </div>
      )}
    </div>
  )
}
```

---

## 🎯 Mobile UX Checklist

### Must-Haves

- ✅ Touch targets ≥ 44×44px (Apple HIG)
- ✅ No hover states (use active states instead)
- ✅ Thumb-friendly bottom navigation
- ✅ Safe area insets (iPhone notch, etc.)
- ✅ Prevent zoom on input focus
- ✅ Smooth scroll behavior
- ✅ Loading states for all async operations
- ✅ Offline support (service worker)

### Nice-to-Haves

- ✅ PWA installable
- ✅ Push notifications
- ✅ Haptic feedback
- ✅ Native share
- ✅ Camera/mic access
- ✅ Geolocation

---

**Nächstes Dokument:** 00-README.md (Navigation Hub)
