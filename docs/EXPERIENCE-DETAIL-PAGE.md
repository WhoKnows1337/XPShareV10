# Experience Detail Page - Vollständige Spezifikation

## 🎯 Ziel

**Die wichtigste Page der Plattform** - Hier konsumieren User die Experiences und entdecken Patterns!

### Kern-Anforderungen:
- ✅ **Content-Fokus** (Story im Mittelpunkt)
- ✅ **Pattern-Discovery** (Similar, External-Events, Graph)
- ✅ **Social-Interaction** (Comments, Reactions, Share)
- ✅ **Responsive** (Desktop 3-Column, Mobile Tabs)
- ✅ **Performance** (Streaming-SSR, Lazy-Loading)
- ✅ **Accessibility** (WCAG AA, Keyboard-Navigation)
- ✅ **Multilingual** (Original ↔ Translation Toggle)

---

## 🎨 Design-Prinzipien

### Visueller Stil (konsistent mit Plattform)
```
✅ Dark-Mode-First (Glassmorphism)
✅ Daten-fokussiert (Visualisierungen prominent)
✅ Progressive Disclosure (Details on-demand)
✅ Framer Motion (subtle Animations)
✅ Aceternity UI Premium-Look
✅ shadcn/ui Components
```

### Layout-Philosophie
```
Desktop: 3-Column-Layout (Related | Content | Patterns)
Mobile:  Single-Column + Tabs + Bottom-Sheet
```

### Inspiration
```
Linear:  3-Column-Layout, Command-Palette
Notion:  Flexible-Content, Dark-Mode
GitHub:  Code-Review-Style für Comments
Stripe:  Glassmorphism-Effects
```

---

## 📐 Desktop-Layout (≥1024px)

### **3-Column-Layout**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (Full-Width, Sticky)                                             │
│ @username · UFO-Sichtungen · 15.03.2024 · 234 Views · [Edit] [Share] [•]│
├──────────────────┬──────────────────────────┬──────────────────────────┤
│                  │                          │                          │
│ LEFT SIDEBAR     │   MAIN CONTENT           │   RIGHT SIDEBAR          │
│ (280px, Sticky)  │   (Flexible)             │   (320px, Sticky)        │
│                  │                          │                          │
│ 🔗 Related       │   ┌──────────────────┐   │   📊 Pattern-Insights   │
│                  │   │  [Hero-Image]    │   │                          │
│ ┌──────────────┐ │   │  Full-Width      │   │   ┌──────────────────┐  │
│ │ 🎯 Similar(12)│ │   └──────────────────┘   │   │ 🔥 12 Similar    │  │
│ │              │ │                          │   │ 📍 8 in Nähe     │  │
│ │ [Thumbnail]  │ │   UFO-Sichtung am See    │   │ 🕐 5 zur Zeit    │  │
│ │ "Ich sah..." │ │   ━━━━━━━━━━━━━━━━━━━━   │   │                  │  │
│ │ 94% Match    │ │                          │   │ [Auf Karte →]    │  │
│ │              │ │   @username              │   └──────────────────┘  │
│ │ [Thumbnail]  │ │   📍 Bodensee            │                          │
│ │ ...          │ │   🕐 15. März 2024, 22:34│   ┌──────────────────┐  │
│ └──────────────┘ │   🌍 Übersetzt aus DE    │   │ 🌞 External      │  │
│                  │                          │   │                  │  │
│ ┌──────────────┐ │   Ich sah nachts ein     │   │ Solar-Sturm G3   │  │
│ │ ⏱️ Timeline   │ │   leuchtendes Objekt     │   │ 14.03, 18:00     │  │
│ │              │ │   über dem Bodensee. Es  │   │ KP: 7.2          │  │
│ │ [Mini-Chart] │ │   bewegte sich sehr      │   │                  │  │
│ │ Peak: März   │ │   schnell und lautlos... │   │ 🌕 Vollmond 98%  │  │
│ └──────────────┘ │                          │   │                  │  │
│                  │   [Mehr lesen ▼]         │   │ 🌦️ Bewölkt, 12°C │  │
│ ┌──────────────┐ │                          │   └──────────────────┘  │
│ │ 🕸️ Graph      │ │   ━━━━━━━━━━━━━━━━━━━━   │                          │
│ │              │ │                          │   ┌──────────────────┐  │
│ │ [Neo4j Viz]  │ │   🏷️ #ufo #bodensee      │   │ 📍 Karte         │  │
│ │ 5 Nodes      │ │   #solarsturm #nachts    │   │                  │  │
│ └──────────────┘ │                          │   │ [Mapbox-Mini]    │  │
│                  │   ━━━━━━━━━━━━━━━━━━━━   │   │                  │  │
│ [Collapse ◀]    │                          │   │ • 8 nearby       │  │
│                  │   📋 Details              │   └──────────────────┘  │
│                  │                          │                          │
│                  │   ┌──────────────────┐   │   ┌──────────────────┐  │
│                  │   │ Bewegung:        │   │   │ 👥 Witnesses     │  │
│                  │   │ ☑ Schnell        │   │   │                  │  │
│                  │   │ ☑ Zick-Zack      │   │   │ [@AlexBodensee]  │  │
│                  │   │                  │   │   │ "War dabei"      │  │
│                  │   │ Geräusche:       │   │   │ Match: 94%       │  │
│                  │   │ ☑ Lautlos        │   │   │                  │  │
│                  │   │                  │   │   │ [Invite ➕]      │  │
│                  │   │ Dauer: 1-5 Min   │   │   └──────────────────┘  │
│                  │   │ Form: Dreieck    │   │                          │
│                  │   └──────────────────┘   │   💡 AI-Suggestions      │
│                  │                          │   "Add more context?"    │
│                  │   ━━━━━━━━━━━━━━━━━━━━   │                          │
│                  │                          │   [Scroll-Zone]          │
│                  │   👥 Collaborative       │                          │
│                  │   ┌──────────────────┐   │                          │
│                  │   │ 🔗 Linked (2)    │   │                          │
│                  │   │                  │   │                          │
│                  │   │ [@Friend1]       │   │                          │
│                  │   │ "Meine Sicht"    │   │                          │
│                  │   │                  │   │                          │
│                  │   │ [@Friend2]       │   │                          │
│                  │   │ "Ich sah's auch" │   │                          │
│                  │   └──────────────────┘   │                          │
│                  │                          │                          │
│                  │   [+ Link Similar XP]    │                          │
│                  │                          │                          │
│                  │   ━━━━━━━━━━━━━━━━━━━━   │                          │
│                  │                          │                          │
│                  │   🖼️ Media (3)           │                          │
│                  │   [Gallery-Grid]         │                          │
│                  │                          │                          │
│                  │   ━━━━━━━━━━━━━━━━━━━━   │                          │
│                  │                          │                          │
│                  │   ✏️ Sketch               │                          │
│                  │   [SVG-Rendering]        │                          │
│                  │                          │                          │
│                  │   ━━━━━━━━━━━━━━━━━━━━   │                          │
│                  │                          │                          │
│                  │   💬 Comments (12)       │                          │
│                  │                          │                          │
│                  │   [@User1] vor 2h        │                          │
│                  │   "Ich sah das auch!"    │                          │
│                  │   [↩️ Reply] [👍 3]       │                          │
│                  │                          │                          │
│                  │     └─ [@Author] vor 1h  │                          │
│                  │        "Wo genau?"       │                          │
│                  │        [👍 1]             │                          │
│                  │                          │                          │
│                  │   [Add Comment...]       │                          │
│                  │                          │                          │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

### **Component-Breakdown**

#### **1. Header (ExperienceHeader.tsx)**
```tsx
// Sticky Header mit User, Actions, Stats
<header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
  <div className="flex items-center justify-between px-6 py-4">
    {/* Left: User Info */}
    <div className="flex items-center gap-3">
      <Avatar src={user.avatar} size="sm" />
      <div>
        <div className="flex items-center gap-2">
          <Link href={`/@${user.username}`} className="font-semibold hover:underline">
            @{user.username}
          </Link>
          {/* User Level & Badges */}
          <Badge variant="secondary" className="text-xs">
            Lvl {user.level}
          </Badge>
          {user.topBadges?.slice(0, 2).map((badge) => (
            <Tooltip key={badge.slug}>
              <TooltipTrigger>
                <span className="text-sm" title={badge.name}>
                  {badge.icon}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{category}</Badge>
          <span>·</span>
          <time dateTime={occurredAt}>{formatDate(occurredAt)}</time>
          <span>·</span>
          <span>{viewCount} Views</span>
        </div>
      </div>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm">
        <Heart className="w-4 h-4 mr-2" />
        {likeCount}
      </Button>

      <Button variant="ghost" size="sm">
        <Share2 className="w-4 h-4" />
      </Button>

      {isAuthor && (
        <>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/experiences/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {!isAuthor && (
        <Button variant="ghost" size="sm">
          <Flag className="w-4 h-4" />
        </Button>
      )}
    </div>
  </div>

  {/* Community Thank-You Banner (Aha-Moment #12 - nur für Author, wenn 10+ Views) */}
  {isAuthor && experience.view_count >= 10 && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="border-b bg-primary/5 px-6 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            🙏
          </div>
          <div>
            <p className="font-semibold text-sm">
              Deine XP hat {experience.view_count} Menschen geholfen!
            </p>
            <p className="text-xs text-muted-foreground">
              {experience.comment_count} Kommentare · {experience.like_count} Reactions
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          Impact ansehen →
        </Button>
      </div>
    </motion.div>
  )}
</header>
```

**Aha-Moment #12:** "Deine XP hat 127 Menschen geholfen!" (wird nach 10+ Views angezeigt)

---

#### **2. Left Sidebar (RelatedSidebar.tsx)**
```tsx
// Sticky Sidebar mit ähnlichen Experiences
<aside className="w-[280px] sticky top-[72px] h-[calc(100vh-88px)] overflow-y-auto">
  {/* Similar Experiences */}
  <section className="mb-6">
    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
      <Target className="w-4 h-4" />
      Similar ({similarCount})
    </h3>

    <div className="space-y-3">
      {similarExperiences.map((exp) => (
        <Link
          key={exp.id}
          href={`/experiences/${exp.id}`}
          className="block p-3 rounded-lg border hover:bg-accent transition-colors"
        >
          {exp.thumbnail && (
            <img
              src={exp.thumbnail}
              alt=""
              className="w-full h-24 object-cover rounded mb-2"
            />
          )}
          <p className="text-xs line-clamp-2 mb-1">{exp.title}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>@{exp.author.username}</span>
            <Badge variant="secondary" className="text-xs">
              {exp.similarity}% Match
            </Badge>
          </div>
        </Link>
      ))}
    </div>

    <Button variant="outline" size="sm" className="w-full mt-3">
      See all {similarCount} →
    </Button>
  </section>

  {/* Timeline-Preview */}
  <section className="mb-6">
    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
      <Clock className="w-4 h-4" />
      Timeline
    </h3>
    <div className="relative h-32 bg-accent/50 rounded-lg p-3">
      {/* Mini-Chart via Recharts */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timelineData}>
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-2">
        Peak: März 2024 (15 Reports)
      </p>
    </div>
  </section>

  {/* Graph-Preview */}
  <section>
    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
      <Network className="w-4 h-4" />
      Connections
    </h3>
    <div className="aspect-square bg-accent/50 rounded-lg p-3">
      {/* Neo4j Graph Visualization (Sigma.js) */}
      <GraphVisualization nodes={graphNodes} edges={graphEdges} />
      <p className="text-xs text-muted-foreground mt-2">
        {graphNodes.length} connected experiences
      </p>
    </div>
    <Button variant="outline" size="sm" className="w-full mt-3">
      Explore Graph →
    </Button>
  </section>

  {/* Collapse-Toggle */}
  <Button
    variant="ghost"
    size="sm"
    className="w-full mt-4"
    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
  >
    <ChevronsLeft className="w-4 h-4" />
    Collapse
  </Button>
</aside>
```

#### **3. Main Content (ExperienceContent.tsx)**
```tsx
// Hauptinhalt mit Progressive-Disclosure
<main className="flex-1 max-w-3xl mx-auto px-6 py-8">
  {/* Hero-Image */}
  {heroImage && (
    <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
      <Image
        src={heroImage}
        alt={title}
        fill
        className="object-cover"
        priority
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
    </div>
  )}

  {/* Title */}
  <h1 className="text-4xl font-bold mb-4">{title}</h1>

  {/* Meta-Info */}
  <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4" />
      {locationName}
    </div>
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      <time dateTime={occurredAt}>{formatLongDate(occurredAt)}</time>
    </div>
  </div>

  {/* Translation-Badge */}
  {isTranslated && (
    <Alert className="mb-6">
      <Globe className="w-4 h-4" />
      <AlertTitle>Übersetzt aus {originalLanguage}</AlertTitle>
      <AlertDescription>
        Diese Erfahrung wurde automatisch übersetzt.
        <Button variant="link" className="ml-2 h-auto p-0" onClick={showOriginal}>
          Original anzeigen ({originalLanguage.toUpperCase()})
        </Button>
      </AlertDescription>
    </Alert>
  )}

  {/* Content (mit Read-More) */}
  <div className="prose prose-invert max-w-none mb-8">
    {isExpanded ? (
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    ) : (
      <>
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedContent.slice(0, 500) + '...' }}
        />
        <Button
          variant="link"
          className="mt-2"
          onClick={() => setIsExpanded(true)}
        >
          Mehr lesen ▼
        </Button>
      </>
    )}
  </div>

  {/* Tags */}
  <div className="flex flex-wrap gap-2 mb-8">
    {tags.map((tag) => (
      <Link key={tag} href={`/browse?tag=${tag}`}>
        <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
          #{tag}
        </Badge>
      </Link>
    ))}
  </div>

  <Separator className="my-8" />

  {/* Dynamic-Questions-Answers */}
  <section className="mb-8">
    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
      <Info className="w-5 h-5" />
      Details
    </h2>

    <div className="grid gap-4">
      {questionAnswers.map((qa) => (
        <div key={qa.questionId} className="bg-accent/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">{qa.question}</p>

          {/* Render based on answer-type */}
          {qa.type === 'chips' && (
            <div className="flex flex-wrap gap-2">
              {qa.answer.map((val) => (
                <Badge key={val} variant="outline">{val}</Badge>
              ))}
            </div>
          )}

          {qa.type === 'text' && (
            <p className="text-sm">{qa.answer}</p>
          )}

          {qa.type === 'slider' && (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-primary/20 rounded-full h-2">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${qa.answer}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{qa.answer}/10</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </section>

  <Separator className="my-8" />

  {/* Collaborative-Experiences */}
  {linkedExperiences.length > 0 && (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Gemeinsam erlebt ({linkedExperiences.length})
      </h2>

      <div className="grid gap-4">
        {linkedExperiences.map((linked) => (
          <Card key={linked.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar src={linked.user.avatar} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/@${linked.user.username}`}
                    className="font-semibold hover:underline"
                  >
                    @{linked.user.username}
                  </Link>
                  <Badge variant="secondary" className="text-xs">
                    {linked.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {linked.title}
                </p>
                <Button variant="link" className="h-auto p-0 mt-2" asChild>
                  <Link href={`/experiences/${linked.id}`}>
                    Perspektive lesen →
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4">
        <Plus className="w-4 h-4 mr-2" />
        Link Similar Experience
      </Button>
    </section>
  )}

  {/* Media-Gallery */}
  {media.length > 0 && (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Image className="w-5 h-5" />
        Media ({media.length})
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {media.map((item) => (
          <button
            key={item.id}
            onClick={() => openLightbox(item)}
            className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
          >
            <img
              src={item.thumbnail || item.url}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  )}

  {/* Sketch */}
  {sketchUrl && (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Pencil className="w-5 h-5" />
        Sketch
      </h2>

      <div className="bg-accent/50 rounded-lg p-6">
        <object data={sketchUrl} type="image/svg+xml" className="w-full" />
      </div>
    </section>
  )}

  <Separator className="my-8" />

  {/* Comments-Section */}
  <section>
    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
      <MessageSquare className="w-5 h-5" />
      Comments ({commentCount})
    </h2>

    {/* Comment-Input */}
    {isAuthenticated && (
      <div className="mb-6">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
        />
        <div className="flex justify-end">
          <Button onClick={submitComment}>
            Post Comment
          </Button>
        </div>
      </div>
    )}

    {/* Comment-List (Threaded) */}
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentThread key={comment.id} comment={comment} depth={0} />
      ))}
    </div>

    {hasMoreComments && (
      <Button variant="outline" className="w-full mt-4" onClick={loadMoreComments}>
        Load More Comments
      </Button>
    )}
  </section>
</main>
```

#### **4. Right Sidebar (PatternSidebar.tsx)**
```tsx
// Sticky Sidebar mit Pattern-Insights
<aside className="w-[320px] sticky top-[72px] h-[calc(100vh-88px)] overflow-y-auto">
  {/* Pattern-Summary */}
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Pattern-Insights
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Similar Reports</span>
        <Badge variant="secondary">{similarCount}</Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Nearby (50km)</span>
        <Badge variant="secondary">{nearbyCount}</Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Same Time (±2d)</span>
        <Badge variant="secondary">{sameTimeCount}</Badge>
      </div>

      <Button variant="outline" size="sm" className="w-full mt-2">
        <Map className="w-4 h-4 mr-2" />
        View on Map
      </Button>
    </CardContent>
  </Card>

  {/* External-Events */}
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        External Events
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {/* Solar-Storm */}
      {solarEvent && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold">Solar Storm G3</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            14. März 2024, 18:00 UTC
          </p>
          <p className="text-xs text-muted-foreground">
            KP-Index: {solarEvent.kpIndex} · 18h vor Sichtung
          </p>
          <Progress value={solarEvent.kpIndex * 10} className="mt-2" />
        </div>
      )}

      {/* Moon-Phase */}
      {moonPhase && (
        <div className="bg-accent/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4" />
            <span className="text-sm font-semibold">{moonPhase.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {moonPhase.illumination}% beleuchtet
          </p>
        </div>
      )}

      {/* Weather */}
      {weather && (
        <div className="bg-accent/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-4 h-4" />
            <span className="text-sm font-semibold">{weather.condition}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {weather.temp}°C · {weather.clouds}% Wolken · {weather.windSpeed} km/h Wind
          </p>
        </div>
      )}

      <Button variant="link" size="sm" className="h-auto p-0">
        Scientific Details →
      </Button>
    </CardContent>
  </Card>

  {/* Mini-Map */}
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Location
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="aspect-square rounded-lg overflow-hidden bg-accent/50">
        {/* Mapbox-Static-Image */}
        <img
          src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+8b5cf6(${lng},${lat})/${lng},${lat},11,0/400x400@2x?access_token=${MAPBOX_TOKEN}`}
          alt="Map"
          className="w-full h-full object-cover"
        />
      </div>
      <Button variant="outline" size="sm" className="w-full mt-3">
        Open Full Map →
      </Button>
    </CardContent>
  </Card>

  {/* Witnesses (mit Verification - Aha-Moment #2) */}
  {witnesses.length > 0 && (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Witnesses ({witnesses.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {witnesses.map((witness) => (
          <div key={witness.id} className="flex items-center gap-2">
            <Avatar src={witness.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <Link
                href={`/@${witness.username}`}
                className="text-sm font-semibold hover:underline truncate block"
              >
                @{witness.username}
                {/* Verified Badge (Aha-Moment #2) */}
                {witness.verification_status === 'verified' && (
                  <Tooltip>
                    <TooltipTrigger>
                      <CheckCircle className="inline w-3 h-3 ml-1 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">Verifiziert!</p>
                      <p className="text-xs">{witness.verification_comment}</p>
                      <p className="text-xs text-muted-foreground">
                        +20 XP · Badge "Verified Witness"
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                "{witness.perspective.slice(0, 30)}..."
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {witness.matchScore}%
            </Badge>
          </div>
        ))}

        <Button variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Invite Witness
        </Button>
      </CardContent>
    </Card>
  )}

  {/* Cross-Category-Insight (Aha-Moment #9) */}
  <Card className="bg-primary/5">
    <CardHeader>
      <CardTitle className="text-sm">🧠 Cross-Pattern Insight</CardTitle>
    </CardHeader>
    <CardContent className="text-sm">
      <p className="mb-3">
        User die <strong>{experience.category}</strong> erleben, berichten:
      </p>
      <div className="space-y-2">
        {crossCategoryInsights.map((insight) => (
          <div key={insight.category} className="flex items-center justify-between">
            <Link
              href={`/categories/${insight.category_slug}`}
              className="hover:underline"
            >
              {insight.category_icon} {insight.category_name}
            </Link>
            <Badge variant="outline">{insight.correlation}x häufiger</Badge>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" className="w-full mt-3">
        Weitere Kategorien erkunden →
      </Button>
    </CardContent>
  </Card>
</aside>
```

**Aha-Moment #2:** Witness-Verification mit Badge + Push-Notification
**Aha-Moment #9:** Cross-Category-Insight ("User die UFOs sehen, berichten 3x häufiger Träume")

---

**Witness-Verification Flow (Backend):**

```typescript
// app/api/experiences/[id]/verify-witness/route.ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { witness_user_id, verification_comment } = await req.json()

  // 1. Create verification record
  await supabase.from('witness_verifications').insert({
    experience_id: params.id,
    witness_user_id,
    verification_comment,
    status: 'verified',
    verified_at: new Date()
  })

  // 2. Award Badge + XP
  await awardBadge(witness_user_id, 'verified_witness')
  await addXP(witness_user_id, 20)

  // 3. Create Neo4j relationship
  await neo4j.run(`
    MATCH (u1:User {id: $authorId}), (u2:User {id: $witnessId})
    CREATE (u1)-[:WITNESSED_TOGETHER {
      experience_id: $experienceId,
      verified_at: datetime()
    }]->(u2)
  `, { authorId, witnessId: witness_user_id, experienceId: params.id })

  // 4. Send Push Notification (Aha-Moment!)
  await sendNotification(witness_user_id, {
    type: 'witness_verified',
    title: '🎉 Deine Witness-Verifikation wurde bestätigt!',
    body: `@${authorUsername} hat dich als Witness verifiziert!`,
    data: { experience_id: params.id, badge: 'verified_witness', xp: 20 }
  })

  return Response.json({ success: true })
}
```

---

**Cross-Category-Insight SQL:**

```sql
CREATE OR REPLACE FUNCTION get_cross_category_insights(p_category text)
RETURNS TABLE (
  category_name text,
  category_slug text,
  category_icon text,
  correlation float
) AS $$
BEGIN
  RETURN QUERY
  WITH category_users AS (
    SELECT DISTINCT user_id
    FROM experiences
    WHERE category = p_category
  ),
  other_category_counts AS (
    SELECT
      e.category,
      COUNT(DISTINCT e.user_id) as user_count
    FROM experiences e
    JOIN category_users cu ON e.user_id = cu.user_id
    WHERE e.category != p_category
    GROUP BY e.category
  ),
  baseline_counts AS (
    SELECT
      category,
      COUNT(DISTINCT user_id) as baseline_count
    FROM experiences
    WHERE category != p_category
    GROUP BY category
  )
  SELECT
    c.name,
    c.slug,
    c.icon,
    ROUND((occ.user_count::float / bc.baseline_count) * 10) / 10 as correlation
  FROM other_category_counts occ
  JOIN baseline_counts bc ON occ.category = bc.category
  JOIN categories c ON c.slug = occ.category
  WHERE (occ.user_count::float / bc.baseline_count) > 1.5 -- Min 1.5x correlation
  ORDER BY correlation DESC
  LIMIT 3;
END;
$$ LANGUAGE plpgsql;
```

---

</aside>
```

---

## 📱 Mobile-Layout (≤768px)

### **Single-Column + Tabs**

```
┌───────────────────────────────────┐
│ HEADER (Sticky)                   │
│ ← @username · UFO · [···]         │
├───────────────────────────────────┤
│                                   │
│ [Hero-Image]                      │
│ Full-Width                        │
│                                   │
├───────────────────────────────────┤
│                                   │
│ UFO-Sichtung am See               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                   │
│ @username                         │
│ 📍 Bodensee · 🕐 15.03.2024       │
│ 🌍 Übersetzt aus Deutsch          │
│                                   │
├───────────────────────────────────┤
│ [📖 Story] [🔗12] [📊Stats] [💬5]│  ← Tab-Navigation
├───────────────────────────────────┤
│                                   │
│ [Active-Tab-Content]              │
│                                   │
│ TAB 1 (Story):                    │
│ Ich sah nachts ein leuchtendes    │
│ Objekt über dem Bodensee. Es      │
│ bewegte sich sehr schnell...      │
│                                   │
│ [Mehr lesen ▼]                    │
│                                   │
│ 🏷️ #ufo #bodensee #solarsturm     │
│                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                   │
│ 📋 Details                        │
│ [Accordion-Items]                 │
│                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                   │
│ 👥 Gemeinsam erlebt (2)           │
│ [Cards]                           │
│                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                   │
│ 🖼️ Media (3)                      │
│ [Grid-2-Cols]                     │
│                                   │
│ [Scroll-Zone]                     │
│                                   │
├───────────────────────────────────┤
│ [Pull-up-Handle ═══]              │  ← Bottom-Sheet
│                                   │
│ BOTTOM-SHEET (Patterns):          │
│ ┌─────────────────────────────┐   │
│ │ 📊 12 Similar Reports       │   │
│ │ 🌞 Solar-Storm G3           │   │
│ │ 📍 8 nearby                 │   │
│ │                             │   │
│ │ [View on Map →]             │   │
│ └─────────────────────────────┘   │
└───────────────────────────────────┘
```

### **Tab-Navigation (Mobile)**

#### **Tab 1: Story (Default)**
- Content (truncated)
- Tags
- Details (Accordion)
- Collaborative (Cards)
- Media-Gallery
- Comments

#### **Tab 2: Related (🔗12)**
- Similar-Experiences (List)
- Timeline-Chart
- Graph-Preview

#### **Tab 3: Stats (📊)**
- Pattern-Summary
- External-Events
- Map
- Witnesses

#### **Tab 4: Comments (💬5)**
- Comment-Input
- Comment-List (Threaded)

### **Bottom-Sheet (für Patterns)**
```tsx
// shadcn/ui Sheet-Component
<Sheet>
  <SheetTrigger asChild>
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 cursor-pointer">
      <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-2" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Pattern-Insights</span>
        <ChevronUp className="w-4 h-4" />
      </div>
    </div>
  </SheetTrigger>

  <SheetContent side="bottom" className="h-[80vh]">
    <SheetHeader>
      <SheetTitle>Pattern-Insights</SheetTitle>
    </SheetHeader>

    {/* Pattern-Content (gleich wie Desktop Right-Sidebar) */}
    <PatternInsights {...} />
  </SheetContent>
</Sheet>
```

---

## 🎭 Interaktionen & Animations

### **Framer-Motion-Animationen**

#### **Page-Entry-Animation**
```tsx
// Staggered-Fade-In für Sections
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div variants={itemVariants}>
    <ExperienceHeader {...} />
  </motion.div>
  <motion.div variants={itemVariants}>
    <ExperienceContent {...} />
  </motion.div>
  {/* ... */}
</motion.div>
```

#### **Scroll-Triggered-Animations**
```tsx
// Pattern-Sidebar erscheint bei Scroll
const { scrollY } = useScroll()
const sidebarY = useTransform(scrollY, [0, 300], [100, 0])
const sidebarOpacity = useTransform(scrollY, [0, 300], [0, 1])

<motion.aside
  style={{ y: sidebarY, opacity: sidebarOpacity }}
  className="sticky top-[72px]"
>
  <PatternSidebar {...} />
</motion.aside>
```

#### **Hover-Effects (Cards)**
```tsx
// Similar-Experience-Card mit Lift-Effect
<motion.a
  href={`/experiences/${id}`}
  whileHover={{
    y: -4,
    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)'
  }}
  transition={{ duration: 0.2 }}
  className="block p-3 rounded-lg border"
>
  {/* Card-Content */}
</motion.a>
```

#### **Like-Button-Animation**
```tsx
// Heart-Animation bei Click
const [isLiked, setIsLiked] = useState(false)

<motion.button
  onClick={() => setIsLiked(!isLiked)}
  whileTap={{ scale: 0.9 }}
>
  <motion.div
    animate={{
      scale: isLiked ? [1, 1.3, 1] : 1,
      rotate: isLiked ? [0, -10, 10, 0] : 0
    }}
    transition={{ duration: 0.3 }}
  >
    <Heart
      className={cn(
        "w-4 h-4 transition-colors",
        isLiked && "fill-red-500 text-red-500"
      )}
    />
  </motion.div>
</motion.button>
```

### **Interaktive Features**

#### **1. Share-Sheet**
```tsx
// Native-Share-API (Mobile) + Custom-Sheet (Desktop)
const handleShare = async () => {
  if (navigator.share) {
    // Mobile: Native-Share
    await navigator.share({
      title: experience.title,
      text: experience.content.slice(0, 100),
      url: window.location.href
    })
  } else {
    // Desktop: Custom-Sheet
    setShareSheetOpen(true)
  }
}

<Sheet open={shareSheetOpen} onOpenChange={setShareSheetOpen}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Share Experience</SheetTitle>
    </SheetHeader>

    <div className="space-y-3">
      <Button variant="outline" className="w-full justify-start">
        <Twitter className="w-4 h-4 mr-2" />
        Share on Twitter
      </Button>
      <Button variant="outline" className="w-full justify-start">
        <Facebook className="w-4 h-4 mr-2" />
        Share on Facebook
      </Button>

      <Separator />

      <div className="flex gap-2">
        <Input value={shareUrl} readOnly />
        <Button onClick={copyToClipboard}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </SheetContent>
</Sheet>
```

#### **2. Report-Dialog**
```tsx
// Report-Feature (Moderation)
<Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Report Experience</DialogTitle>
      <DialogDescription>
        Help us keep the community safe. Select a reason:
      </DialogDescription>
    </DialogHeader>

    <RadioGroup value={reportReason} onValueChange={setReportReason}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="spam" id="spam" />
        <Label htmlFor="spam">Spam or Misleading</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="harassment" id="harassment" />
        <Label htmlFor="harassment">Harassment</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="misinformation" id="misinformation" />
        <Label htmlFor="misinformation">Misinformation</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="other" id="other" />
        <Label htmlFor="other">Other</Label>
      </div>
    </RadioGroup>

    <Textarea
      placeholder="Additional details (optional)..."
      value={reportDetails}
      onChange={(e) => setReportDetails(e.target.value)}
    />

    <DialogFooter>
      <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={submitReport}>
        Submit Report
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### **3. Edit-Flow**
```tsx
// Edit-Button → Re-Enter-Submission-Flow mit Pre-Fill
<Button variant="ghost" size="sm" asChild>
  <Link href={`/experiences/${id}/edit`}>
    <Edit className="w-4 h-4 mr-2" />
    Edit
  </Link>
</Button>

// /experiences/[id]/edit/page.tsx
export default async function EditExperiencePage({ params }) {
  const experience = await getExperience(params.id)

  // Check permissions
  if (experience.userId !== currentUser.id) {
    redirect('/experiences/' + params.id)
  }

  // Render Submission-Flow mit Pre-Fill
  return (
    <ExperienceWizard
      mode="edit"
      initialData={{
        title: experience.title,
        content: experience.content,
        category: experience.category,
        tags: experience.tags,
        location: experience.location,
        occurredAt: experience.occurredAt,
        questionAnswers: experience.metadata.questions,
        media: experience.media,
        privacy: experience.visibility
      }}
      onSubmit={async (data) => {
        await updateExperience(params.id, data)
        router.push(`/experiences/${params.id}`)
      }}
    />
  )
}
```

#### **4. Lightbox (Media-Gallery)**
```tsx
// Image-Lightbox mit Keyboard-Navigation
const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

useEffect(() => {
  if (lightboxIndex === null) return

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      setLightboxIndex((prev) =>
        prev !== null && prev < media.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowLeft') {
      setLightboxIndex((prev) =>
        prev !== null && prev > 0 ? prev - 1 : prev
      )
    } else if (e.key === 'Escape') {
      setLightboxIndex(null)
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [lightboxIndex, media.length])

{lightboxIndex !== null && (
  <Dialog open={true} onOpenChange={() => setLightboxIndex(null)}>
    <DialogContent className="max-w-4xl">
      <div className="relative aspect-video">
        <Image
          src={media[lightboxIndex].url}
          alt=""
          fill
          className="object-contain"
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="ghost"
          onClick={() => setLightboxIndex(Math.max(0, lightboxIndex - 1))}
          disabled={lightboxIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          {lightboxIndex + 1} / {media.length}
        </span>

        <Button
          variant="ghost"
          onClick={() => setLightboxIndex(Math.min(media.length - 1, lightboxIndex + 1))}
          disabled={lightboxIndex === media.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)}
```

---

## 🚀 Data-Fetching-Strategy

### **Next.js 14+ App-Router-Pattern**

#### **Server-Component (Default)**
```tsx
// app/experiences/[id]/page.tsx
import { Suspense } from 'react'
import { getExperience, getSimilar, getExternalEvents } from '@/lib/api'

export default async function ExperiencePage({ params }: { params: { id: string } }) {
  // Server-Component: Fetch-on-Server
  const experience = await getExperience(params.id)

  return (
    <div className="grid grid-cols-[280px_1fr_320px] gap-6">
      {/* Left-Sidebar */}
      <Suspense fallback={<RelatedSidebarSkeleton />}>
        <RelatedSidebar experienceId={params.id} />
      </Suspense>

      {/* Main-Content */}
      <ExperienceContent experience={experience} />

      {/* Right-Sidebar */}
      <Suspense fallback={<PatternSidebarSkeleton />}>
        <PatternSidebar experienceId={params.id} />
      </Suspense>
    </div>
  )
}

// Streaming-SSR: Fetch-in-Parallel
async function RelatedSidebar({ experienceId }: { experienceId: string }) {
  const similar = await getSimilar(experienceId)

  return (
    <aside>
      <SimilarList experiences={similar} />
    </aside>
  )
}

async function PatternSidebar({ experienceId }: { experienceId: string }) {
  const [externalEvents, weather, moonPhase] = await Promise.all([
    getExternalEvents(experienceId),
    getWeather(experienceId),
    getMoonPhase(experienceId)
  ])

  return (
    <aside>
      <ExternalEventsList events={externalEvents} />
      <WeatherCard weather={weather} />
      <MoonPhaseCard moonPhase={moonPhase} />
    </aside>
  )
}
```

#### **Metadata-Generation (SEO)**
```tsx
// Dynamic-Metadata für Experience-Pages
export async function generateMetadata({ params }: { params: { id: string } }) {
  const experience = await getExperience(params.id)

  return {
    title: `${experience.title} | XP-Share`,
    description: experience.content.slice(0, 160),
    openGraph: {
      title: experience.title,
      description: experience.content.slice(0, 160),
      images: [experience.heroImage || '/og-default.png'],
      type: 'article',
      publishedTime: experience.createdAt,
      authors: [experience.user.username]
    },
    twitter: {
      card: 'summary_large_image',
      title: experience.title,
      description: experience.content.slice(0, 160),
      images: [experience.heroImage || '/og-default.png']
    }
  }
}
```

#### **Incremental-Static-Regeneration (ISR)**
```tsx
// Cache für 1 Stunde, dann revalidate
export const revalidate = 3600

// Oder: On-Demand-Revalidation bei Edit
// app/api/experiences/[id]/revalidate/route.ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { revalidatePath } = await import('next/cache')

  revalidatePath(`/experiences/${params.id}`)

  return Response.json({ revalidated: true })
}
```

### **Client-Side-Interactivity**

#### **Comments (Real-Time)**
```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function CommentsSection({ experienceId, initialComments }) {
  const [comments, setComments] = useState(initialComments)

  useEffect(() => {
    // Real-Time-Subscription (Supabase-Realtime)
    const channel = supabase
      .channel(`comments:${experienceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `experience_id=eq.${experienceId}`
        },
        (payload) => {
          setComments((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [experienceId])

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
```

#### **Like-Button (Optimistic-Update)**
```tsx
'use client'

import { useState, useTransition } from 'react'
import { likeExperience } from '@/app/actions'

export function LikeButton({ experienceId, initialLikeCount, initialIsLiked }) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isPending, startTransition] = useTransition()

  const handleLike = () => {
    // Optimistic-Update
    setIsLiked(!isLiked)
    setLikeCount((prev) => isLiked ? prev - 1 : prev + 1)

    // Server-Action
    startTransition(async () => {
      const result = await likeExperience(experienceId)

      if (!result.success) {
        // Rollback on error
        setIsLiked(initialIsLiked)
        setLikeCount(initialLikeCount)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isPending}
    >
      <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-red-500 text-red-500")} />
      {likeCount}
    </Button>
  )
}
```

---

## 🎯 Performance-Optimizations

### **1. Image-Optimization**
```tsx
// Next/Image mit Blur-Placeholder
import { getPlaiceholder } from 'plaiceholder'

// Server-Component
const { base64, img } = await getPlaiceholder(experience.heroImage)

<Image
  {...img}
  alt={experience.title}
  placeholder="blur"
  blurDataURL={base64}
  priority // Above-the-Fold
/>

// Gallery-Images: Lazy-Load
<Image
  src={image.url}
  alt=""
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### **2. Code-Splitting**
```tsx
// Dynamic-Import für Heavy-Components
import dynamic from 'next/dynamic'

const GraphVisualization = dynamic(
  () => import('@/components/GraphVisualization'),
  {
    loading: () => <Skeleton className="w-full h-64" />,
    ssr: false // Client-only
  }
)

const MapboxMap = dynamic(
  () => import('@/components/MapboxMap'),
  { ssr: false }
)
```

### **3. Virtualization (Long-Comments)**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function CommentList({ comments }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: comments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-y-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <CommentCard comment={comments[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### **4. Prefetching (Similar-Experiences)**
```tsx
// Prefetch on Hover
import { useRouter } from 'next/navigation'

export function SimilarCard({ experience }) {
  const router = useRouter()

  return (
    <Link
      href={`/experiences/${experience.id}`}
      onMouseEnter={() => router.prefetch(`/experiences/${experience.id}`)}
    >
      {/* Card-Content */}
    </Link>
  )
}
```

### **5. Caching-Strategy**
```typescript
// lib/api.ts
import { unstable_cache } from 'next/cache'

export const getExperience = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from('experiences')
      .select('*, user:profiles(*), media(*)')
      .eq('id', id)
      .single()

    return data
  },
  ['experience'], // Cache-Key
  {
    revalidate: 3600, // 1 Stunde
    tags: ['experiences'] // Tag für Invalidation
  }
)

// On-Demand-Invalidation
import { revalidateTag } from 'next/cache'

async function updateExperience(id: string, data: any) {
  await supabase
    .from('experiences')
    .update(data)
    .eq('id', id)

  revalidateTag('experiences')
}
```

---

## ♿ Accessibility-Features

### **1. Keyboard-Navigation**
```tsx
// Skip-to-Content-Link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
>
  Skip to content
</a>

// Main-Content mit ID
<main id="main-content" tabIndex={-1}>
  <ExperienceContent {...} />
</main>

// Custom-Focus-Order (wenn nötig)
<div className="relative">
  <Button tabIndex={1}>Primary-Action</Button>
  <Button tabIndex={2}>Secondary-Action</Button>
</div>
```

### **2. ARIA-Labels**
```tsx
// Experience-Card (in Similar-List)
<article
  role="article"
  aria-labelledby={`exp-title-${id}`}
  aria-describedby={`exp-meta-${id}`}
>
  <h3 id={`exp-title-${id}`}>{title}</h3>
  <div id={`exp-meta-${id}`} className="sr-only">
    Von {username}, veröffentlicht am {date}, {likeCount} Likes
  </div>
</article>

// Like-Button
<Button
  aria-label={isLiked ? `Unlike (${likeCount})` : `Like (${likeCount})`}
  aria-pressed={isLiked}
>
  <Heart className="w-4 h-4" />
</Button>

// Share-Button
<Button aria-label="Share experience">
  <Share2 className="w-4 h-4" />
</Button>
```

### **3. Focus-Management (Modal)**
```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap'

export function ReportDialog({ open, onClose }) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus-Trap (innerhalb Modal)
  useFocusTrap(dialogRef, open)

  // Return-Focus nach Close
  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement as HTMLElement

    return () => {
      previousFocus?.focus()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent ref={dialogRef}>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}
```

### **4. Screen-Reader-Announcements**
```tsx
'use client'

export function LiveRegion() {
  const [announcement, setAnnouncement] = useState('')

  // Announce new comments
  useEffect(() => {
    const channel = supabase
      .channel('comments')
      .on('postgres_changes', { ... }, (payload) => {
        setAnnouncement(`New comment from ${payload.new.username}`)

        // Clear after announcement
        setTimeout(() => setAnnouncement(''), 1000)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}
```

### **5. Color-Contrast (Tailwind-Config)**
```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        // Alle Farben WCAG-AA-compliant (4.5:1 gegen Background)
        background: 'hsl(0 0% 4%)',      // #0a0a0a
        foreground: 'hsl(0 0% 93%)',     // #ededed (20.5:1 ✓)
        primary: 'hsl(258 90% 66%)',     // #8b5cf6 (4.7:1 ✓)
        'muted-foreground': 'hsl(0 0% 65%)', // #a1a1aa (7.8:1 ✓)
      }
    }
  }
}
```

---

## 🧪 Testing-Strategy

### **1. Unit-Tests (Components)**
```tsx
// __tests__/ExperienceHeader.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExperienceHeader } from '@/components/ExperienceHeader'

describe('ExperienceHeader', () => {
  it('renders user info correctly', () => {
    render(<ExperienceHeader experience={mockExperience} />)

    expect(screen.getByText('@testuser')).toBeInTheDocument()
    expect(screen.getByText('UFO-Sichtungen')).toBeInTheDocument()
  })

  it('shows edit button for author', () => {
    render(<ExperienceHeader experience={mockExperience} isAuthor={true} />)

    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument()
  })

  it('shows report button for non-author', () => {
    render(<ExperienceHeader experience={mockExperience} isAuthor={false} />)

    expect(screen.getByRole('button', { name: /report/i })).toBeInTheDocument()
  })
})
```

### **2. E2E-Tests (Playwright)**
```typescript
// e2e/experience-detail.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Experience Detail Page', () => {
  test('loads and displays experience', async ({ page }) => {
    await page.goto('/experiences/test-id')

    await expect(page.locator('h1')).toContainText('UFO-Sichtung')
    await expect(page.locator('[data-testid="author"]')).toContainText('@testuser')
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/experiences/test-id')

    // Tab durch alle interaktive Elemente
    await page.keyboard.press('Tab') // Skip-Link
    await page.keyboard.press('Tab') // Like-Button
    await page.keyboard.press('Tab') // Share-Button

    // Enter öffnet Share-Sheet
    await page.keyboard.press('Enter')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('like button works', async ({ page }) => {
    await page.goto('/experiences/test-id')

    const likeButton = page.locator('[aria-label*="Like"]')
    const initialCount = await likeButton.textContent()

    await likeButton.click()

    await expect(likeButton).toHaveAttribute('aria-pressed', 'true')
    await expect(likeButton).not.toHaveText(initialCount)
  })
})
```

### **3. Accessibility-Tests (axe)**
```typescript
// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/experiences/test-id')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
```

---

## 📦 Technical-Implementation

### **File-Structure**
```
app/
└── experiences/
    └── [id]/
        ├── page.tsx                    // Main-Page (Server-Component)
        ├── layout.tsx                  // Layout (Metadata, Scripts)
        ├── loading.tsx                 // Loading-State
        ├── error.tsx                   // Error-Boundary
        ├── not-found.tsx               // 404-State
        └── edit/
            └── page.tsx                // Edit-Mode

components/
└── experience-detail/
    ├── ExperienceHeader.tsx           // Header (User, Actions)
    ├── ExperienceContent.tsx          // Main-Content
    ├── RelatedSidebar.tsx             // Left-Sidebar
    ├── PatternSidebar.tsx             // Right-Sidebar
    ├── SimilarCard.tsx                // Similar-Experience-Card
    ├── CommentThread.tsx              // Comment (Recursive)
    ├── CommentInput.tsx               // Add-Comment-Form
    ├── GraphVisualization.tsx         // Neo4j-Graph (Sigma.js)
    ├── MediaGallery.tsx               // Image-Grid
    ├── Lightbox.tsx                   // Image-Lightbox
    ├── ShareSheet.tsx                 // Share-Dialog
    ├── ReportDialog.tsx               // Report-Form
    └── skeletons/
        ├── ExperienceDetailSkeleton.tsx
        ├── SidebarSkeleton.tsx
        └── CommentSkeleton.tsx

lib/
├── api/
│   └── experiences.ts                 // API-Functions
├── utils/
│   ├── format-date.ts
│   ├── sanitize-html.ts
│   └── calculate-reading-time.ts
└── hooks/
    ├── useFocusTrap.ts
    ├── useKeyboardShortcuts.ts
    └── useIntersectionObserver.ts
```

### **API-Functions**
```typescript
// lib/api/experiences.ts
import { supabase } from '@/lib/supabase'
import { cache } from 'react'

export const getExperience = cache(async (id: string) => {
  const { data, error } = await supabase
    .from('experiences')
    .select(`
      *,
      user:profiles!user_id(
        id,
        username,
        avatar_url,
        gamification:user_gamification(
          level,
          xp_points,
          current_streak_days
        ),
        badges:user_badges(
          badge:badge_definitions(
            slug,
            name,
            description,
            icon,
            category
          )
        )
      ),
      media(*),
      category:question_categories!category_id(name, slug, icon),
      answers:experience_answers(
        id,
        answer,
        question:dynamic_questions(id, question_text, question_type, options)
      ),
      linked:experience_cluster_members(
        experience:experiences(
          id, title, user:profiles(username, avatar_url)
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  // Sort badges by category priority and take top 2 for header display
  const topBadges = data.user.badges
    ?.sort((a, b) => {
      const priorityOrder = { advanced: 0, pattern: 1, basic: 2 }
      return priorityOrder[a.badge.category] - priorityOrder[b.badge.category]
    })
    .slice(0, 2)
    .map(ub => ub.badge)

  return {
    ...data,
    user: {
      ...data.user,
      level: data.user.gamification?.level || 1,
      topBadges
    }
  }
})

export const getSimilarExperiences = cache(async (id: string) => {
  // Get experience embedding
  const { data: exp } = await supabase
    .from('experiences')
    .select('embedding, category')
    .eq('id', id)
    .single()

  // Vector-Similarity-Search
  const { data } = await supabase.rpc('match_experiences', {
    query_embedding: exp.embedding,
    match_threshold: 0.7,
    match_count: 12
  })

  return data
})

export const getExternalEvents = cache(async (experienceId: string) => {
  const { data: exp } = await supabase
    .from('experiences')
    .select('occurred_at, location')
    .eq('id', experienceId)
    .single()

  // Find external events in time-window
  const { data } = await supabase
    .from('external_events')
    .select('*')
    .gte('timestamp', new Date(exp.occurred_at.getTime() - 24 * 60 * 60 * 1000))
    .lte('timestamp', new Date(exp.occurred_at.getTime() + 24 * 60 * 60 * 1000))
    .order('intensity', { ascending: false })
    .limit(5)

  return data
})

export const getEnvironmentalData = cache(async (experienceId: string) => {
  const { data } = await supabase
    .from('environmental_data')
    .select('*')
    .eq('experience_id', experienceId)
    .single()

  return data
})
```

---

## 🎨 Responsive-Breakpoints

```css
/* Tailwind-Breakpoints */
sm: 640px   /* Tablet-Portrait */
md: 768px   /* Tablet-Landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large-Desktop */
2xl: 1536px /* Extra-Large-Desktop */

/* Layout-Switches */
<= 768px:  Single-Column + Tabs
769-1023:  2-Column (Main + Sidebar)
>= 1024:   3-Column (Related + Main + Pattern)
```

### **Responsive-Layout-Component**
```tsx
'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'

export function ExperienceDetailLayout({ experience, similar, patterns }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')

  if (isDesktop) {
    return (
      <div className="grid grid-cols-[280px_1fr_320px] gap-6">
        <RelatedSidebar similar={similar} />
        <ExperienceContent experience={experience} />
        <PatternSidebar patterns={patterns} />
      </div>
    )
  }

  if (isTablet) {
    return (
      <div className="grid grid-cols-[1fr_300px] gap-6">
        <ExperienceContent experience={experience} />
        <PatternSidebar patterns={patterns} />
      </div>
    )
  }

  // Mobile
  return (
    <div>
      <Tabs defaultValue="story">
        <TabsList>
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="related">Related ({similar.length})</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="story">
          <ExperienceContent experience={experience} />
        </TabsContent>

        <TabsContent value="related">
          <SimilarList experiences={similar} />
        </TabsContent>

        <TabsContent value="stats">
          <PatternInsights patterns={patterns} />
        </TabsContent>
      </Tabs>

      <BottomSheet>
        <PatternSummary patterns={patterns} />
      </BottomSheet>
    </div>
  )
}
```

---

## ✅ Implementation-Checklist

### **Phase 1: Core-Layout**
- [ ] Create `app/experiences/[id]/page.tsx` (Server-Component)
- [ ] Build `ExperienceHeader` (User, Actions, Meta)
- [ ] Build `ExperienceContent` (Title, Content, Tags, Q&A)
- [ ] Build `RelatedSidebar` (Similar-List, Timeline, Graph)
- [ ] Build `PatternSidebar` (External-Events, Map, Witnesses)
- [ ] Implement 3-Column-Layout (Desktop)
- [ ] Implement Tabs-Layout (Mobile)

### **Phase 2: Interactions**
- [ ] Like-Button (Optimistic-Update)
- [ ] Comment-System (Input + Threaded-List)
- [ ] Share-Sheet (Native-API + Custom)
- [ ] Report-Dialog
- [ ] Edit-Flow (Re-Enter-Wizard)
- [ ] Media-Lightbox (Keyboard-Nav)

### **Phase 3: Data-Fetching**
- [ ] API-Functions (`getExperience`, `getSimilar`, etc.)
- [ ] Streaming-SSR (Suspense-Boundaries)
- [ ] Metadata-Generation (SEO)
- [ ] ISR (Incremental-Static-Regeneration)
- [ ] Real-Time-Subscriptions (Comments)

### **Phase 4: Performance**
- [ ] Image-Optimization (Blur-Placeholders)
- [ ] Code-Splitting (Dynamic-Imports)
- [ ] Virtualization (Long-Comments)
- [ ] Prefetching (Similar-Links)
- [ ] Caching-Strategy

### **Phase 5: Accessibility**
- [ ] Keyboard-Navigation (Skip-Links, Focus-Order)
- [ ] ARIA-Labels (All-Interactive-Elements)
- [ ] Screen-Reader-Announcements (Live-Regions)
- [ ] Color-Contrast-Check (WCAG-AA)
- [ ] Focus-Management (Modals)

### **Phase 6: Testing**
- [ ] Unit-Tests (Components)
- [ ] E2E-Tests (Critical-Flows)
- [ ] Accessibility-Tests (axe)
- [ ] Performance-Tests (Lighthouse)

---

## 🚀 Next Steps

1. **Start with `ExperienceHeader`** (einfachste Component)
2. **Build `ExperienceContent`** (Kern-Inhalt)
3. **Add Sidebars** (Pattern-Discovery)
4. **Implement Interactions** (Like, Comment, Share)
5. **Optimize Performance** (Streaming, Caching)
6. **Test Accessibility** (axe, Keyboard)

**Estimated-Time:** 3-4 Wochen für komplette Implementation

---

*Stand: 2025-01-05 (EXPERIENCE-DETAIL-PAGE v1.0)*
