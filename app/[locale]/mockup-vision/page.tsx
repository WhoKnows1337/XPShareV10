'use client'

import { useState, useEffect } from 'react'

// ============================================
// MOCKUP COMPARISON PAGE - V1 vs V2 vs V3 vs V4 vs V5 vs V6 vs V7 vs V8 vs V9 vs V10 vs V11 vs V12 vs V13 vs V14
// Toggle between versions to compare approaches
// ============================================

export default function MockupVisionPage() {
  const [version, setVersion] = useState<'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8' | 'v9' | 'v10' | 'v11' | 'v12' | 'v13' | 'v14' | 'v15' | 'v16' | 'v17' | 'v18' | 'v19'>('v19')
  const [showAnnotations, setShowAnnotations] = useState(true)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ============================================ */}
      {/* STICKY CONTROL BAR                          */}
      {/* ============================================ */}
      <div className="fixed top-16 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Version Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Version:</span>
            <div className="flex bg-gray-800 rounded-lg p-1 flex-wrap">
              <button
                onClick={() => setVersion('v1')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v1'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                V1
              </button>
              <button
                onClick={() => setVersion('v2')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v2'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                V2
              </button>
              <button
                onClick={() => setVersion('v3')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v3'
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                V3
              </button>
              <button
                onClick={() => setVersion('v4')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v4'
                    ? 'bg-rose-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                V4
              </button>
              <button
                onClick={() => setVersion('v5')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v5'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                V5
              </button>
              <button
                onClick={() => setVersion('v6')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v6'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                V6
              </button>
              <button
                onClick={() => setVersion('v7')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v7'
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                V7
              </button>
              <button
                onClick={() => setVersion('v8')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v8'
                    ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                V8 ✧
              </button>
              <button
                onClick={() => setVersion('v9')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v9'
                    ? 'bg-[#d4a574] text-[#0d1117] font-bold'
                    : 'text-[#d4a574] hover:text-[#e6c9a8]'
                }`}
              >
                V9 📁
              </button>
              <button
                onClick={() => setVersion('v10')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v10'
                    ? 'bg-gradient-to-r from-[#0a0a1a] via-[#12122a] to-[#0a0a1a] text-[#ffd700] border border-[#ffd700]/50 shadow-[0_0_10px_#ffd70044]'
                    : 'text-[#ffd700] hover:text-[#ffee00]'
                }`}
              >
                V10 🔭
              </button>
              <button
                onClick={() => setVersion('v11')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v11'
                    ? 'bg-[#0d0d0d] text-[#ff2d6a] border border-[#ff2d6a]/60 shadow-[0_0_15px_#ff2d6a33,inset_0_0_20px_#00d4ff11]'
                    : 'text-[#ff2d6a] hover:text-[#ff5a8a] hover:shadow-[0_0_8px_#ff2d6a22]'
                }`}
              >
                V11 🧠
              </button>
              <button
                onClick={() => setVersion('v12')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v12'
                    ? 'bg-gradient-to-r from-[#ff2d6a] via-[#9d4edd] to-[#00d4ff] text-white border border-white/30 shadow-[0_0_20px_#ff2d6a55,0_0_40px_#00d4ff33]'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d6a] to-[#00d4ff] hover:shadow-[0_0_12px_#ff2d6a44]'
                }`}
              >
                V12 🧠⚡
              </button>
              <button
                onClick={() => setVersion('v13')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v13'
                    ? 'bg-[#C8B6FF] text-[#0A0A0A] font-semibold'
                    : 'text-[#C8B6FF]/70 hover:text-[#C8B6FF]'
                }`}
              >
                V13 ✧
              </button>
              <button
                onClick={() => setVersion('v14')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v14'
                    ? 'bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff] text-black font-bold shadow-lg shadow-[#00ff88]/30'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff] hover:shadow-[0_0_12px_#00ff8844]'
                }`}
              >
                V14 ⬢
              </button>
              <button
                onClick={() => setVersion('v15')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v15'
                    ? 'bg-gradient-to-r from-[#e8c4b8] via-[#f5f0eb] to-[#b8c4e8] text-[#0f0f23] font-bold shadow-lg shadow-[#e8c4b8]/30'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-[#e8c4b8] to-[#b8c4e8] hover:shadow-[0_0_12px_#e8c4b844]'
                }`}
              >
                V15 ✧
              </button>
              <button
                onClick={() => setVersion('v16')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v16'
                    ? 'bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#8B5CF6] text-white font-bold shadow-lg shadow-[#8B5CF6]/40 border border-[#06B6D4]/50'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:shadow-[0_0_15px_#8B5CF644]'
                }`}
              >
                V16 ◈
              </button>
              <button
                onClick={() => setVersion('v17')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v17'
                    ? 'bg-gradient-to-r from-[#0C0A1D] via-[#9B6DFF] to-[#4ECDC4] text-white font-bold shadow-lg shadow-[#9B6DFF]/50 border border-[#E8A87C]/50 animate-pulse'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-[#E8A87C] via-[#9B6DFF] to-[#4ECDC4] hover:shadow-[0_0_20px_#9B6DFF44]'
                }`}
              >
                V17 ✧
              </button>
              <button
                onClick={() => setVersion('v18')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v18'
                    ? 'bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#10B981] text-white font-bold shadow-lg shadow-[#8B5CF6]/50 border border-white/30'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#10B981] hover:shadow-[0_0_20px_#8B5CF644]'
                }`}
              >
                V18 ◉
              </button>
              <button
                onClick={() => setVersion('v19')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  version === 'v19'
                    ? 'bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F59E0B] text-white font-bold shadow-lg shadow-[#EC4899]/60 border border-white/40 animate-pulse'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F59E0B] hover:shadow-[0_0_25px_#EC489966]'
                }`}
              >
                V19 ◉⁺
              </button>
            </div>
          </div>

          {/* Annotations Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Erklärungen:</span>
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                showAnnotations
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {showAnnotations ? '💡 An' : '💡 Aus'}
            </button>
          </div>

          {/* Current Version Info */}
          <div className="text-sm">
            {version === 'v1' ? (
              <span className="text-purple-400">🔥 Story-First</span>
            ) : version === 'v2' ? (
              <span className="text-emerald-400">⚡ Optimiert</span>
            ) : version === 'v3' ? (
              <span className="text-cyan-400">🚀 Komplett</span>
            ) : version === 'v4' ? (
              <span className="text-rose-400">🔗 Connection-First</span>
            ) : version === 'v5' ? (
              <span className="text-amber-400">🔬 Phenomenon Hub</span>
            ) : version === 'v6' ? (
              <span className="text-violet-400">◈ Liminal Archive</span>
            ) : version === 'v7' ? (
              <span className="text-cyan-400">⬡ NEXUS Cinematic</span>
            ) : version === 'v8' ? (
              <span className="text-amber-400 font-serif italic">✧ ARCANA Oracle</span>
            ) : version === 'v9' ? (
              <span className="text-[#d4a574] font-mono">📁 CASE FILE</span>
            ) : version === 'v10' ? (
              <span className="text-[#ffd700] font-mono tracking-wide">🔭 OBSERVATORY</span>
            ) : version === 'v11' ? (
              <span className="text-[#ff2d6a] font-mono tracking-widest animate-pulse">🧠 ULTRATHINK</span>
            ) : version === 'v12' ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d6a] via-[#9d4edd] to-[#00d4ff] font-mono tracking-widest font-bold">🧠⚡ ULTRATHINK COMPLETE</span>
            ) : version === 'v13' ? (
              <span className="text-[#C8B6FF] font-sans tracking-wide">✧ ESSENCE</span>
            ) : version === 'v14' ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff] font-mono tracking-widest font-bold">⬢ COMMAND CENTER</span>
            ) : version === 'v15' ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8c4b8] via-[#f5f0eb] to-[#b8c4e8] font-serif tracking-wide italic">✧ ETHEREAL GLASS</span>
            ) : version === 'v16' ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#8B5CF6] font-mono tracking-widest animate-pulse">◈ LIMINAL ARCHIVE</span>
            ) : version === 'v17' ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8A87C] via-[#9B6DFF] to-[#4ECDC4] font-sans tracking-wide">✧ RESONANZ</span>
            ) : version === 'v18' ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#10B981] font-sans tracking-wide font-semibold">◉ CLARITY</span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F59E0B] font-sans tracking-wide font-bold animate-pulse">◉⁺ CLARITY+</span>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-28" />

      {/* ============================================ */}
      {/* RENDER VERSION                              */}
      {/* ============================================ */}
      {version === 'v1' ? (
        <Version1 showAnnotations={showAnnotations} />
      ) : version === 'v2' ? (
        <Version2 showAnnotations={showAnnotations} />
      ) : version === 'v3' ? (
        <Version3 showAnnotations={showAnnotations} />
      ) : version === 'v4' ? (
        <Version4 showAnnotations={showAnnotations} />
      ) : version === 'v5' ? (
        <Version5 showAnnotations={showAnnotations} />
      ) : version === 'v6' ? (
        <Version6 showAnnotations={showAnnotations} />
      ) : version === 'v7' ? (
        <Version7 showAnnotations={showAnnotations} />
      ) : version === 'v8' ? (
        <Version8 showAnnotations={showAnnotations} />
      ) : version === 'v9' ? (
        <Version9 showAnnotations={showAnnotations} />
      ) : version === 'v10' ? (
        <Version10 showAnnotations={showAnnotations} />
      ) : version === 'v11' ? (
        <Version11 showAnnotations={showAnnotations} />
      ) : version === 'v12' ? (
        <Version12 showAnnotations={showAnnotations} />
      ) : version === 'v13' ? (
        <Version13 showAnnotations={showAnnotations} />
      ) : version === 'v14' ? (
        <Version14 showAnnotations={showAnnotations} />
      ) : version === 'v15' ? (
        <Version15 showAnnotations={showAnnotations} />
      ) : version === 'v16' ? (
        <Version16 showAnnotations={showAnnotations} />
      ) : version === 'v17' ? (
        <Version17 showAnnotations={showAnnotations} />
      ) : version === 'v18' ? (
        <Version18 showAnnotations={showAnnotations} />
      ) : (
        <Version19 showAnnotations={showAnnotations} />
      )}

      {/* ============================================ */}
      {/* COMPARISON TABLE                            */}
      {/* ============================================ */}
      <ComparisonTable currentVersion={version} />
    </div>
  )
}

// ============================================
// ANNOTATION COMPONENT
// ============================================
function Annotation({ children, color = 'amber' }: { children: React.ReactNode; color?: 'amber' | 'purple' | 'emerald' | 'blue' }) {
  const colors = {
    amber: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
    purple: 'bg-purple-500/20 border-purple-500/50 text-purple-200',
    emerald: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
    blue: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  }
  return (
    <div className={`${colors[color]} border rounded-lg p-3 text-sm mb-4 flex items-start gap-2`}>
      <span>💡</span>
      <span>{children}</span>
    </div>
  )
}

// ============================================
// VERSION 1 - ORIGINAL "LAGERFEUER" DESIGN
// ============================================
function Version1({ showAnnotations }: { showAnnotations: boolean }) {
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1920"
            alt="Dark attic"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950" />
        </div>

        <div className="relative h-full flex flex-col justify-end pb-20 px-8 max-w-4xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>V1 Hero:</strong> Fullscreen Image, Titel als Zitat - maximale Immersion.
              Problem: Keine schnelle Übersicht, User muss scrollen um zu verstehen worum es geht.
            </Annotation>
          )}

          <div className="mb-4">
            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 text-sm">
              👤 Shadow Person
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
            „Ich war allein auf dem Dachboden, <br />
            <span className="text-purple-300">als ich die Gestalt sah..."</span>
          </h1>

          <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-8">
            <span>📍 Wien, Österreich</span>
            <span>🕐 23:45 Uhr</span>
            <span>📅 15. November 2019</span>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 w-fit">
            <img
              src="https://i.pravatar.cc/100?img=5"
              className="w-10 h-10 rounded-full border-2 border-purple-500"
              alt="Avatar"
            />
            <div>
              <p className="font-medium">Maria K.</p>
              <p className="text-xs text-gray-400">Level 12 Explorer • 47 Erfahrungen</p>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* STORY SECTION - V1 */}
      <section className="py-20 px-8 max-w-3xl mx-auto">
        {showAnnotations && (
          <Annotation color="purple">
            <strong>V1 Story:</strong> Kompletter Text sofort sichtbar - wie ein Buch lesen.
            Problem: Durchzapper müssen alles überfliegen, keine Quick-Summary.
          </Annotation>
        )}

        <div className="text-xl text-gray-300 space-y-6 leading-[1.9]">
          <p>
            Es war kurz vor Mitternacht. Ich konnte nicht schlafen – zu viele Gedanken.
            Also beschloss ich, auf den Dachboden zu gehen, um alte Fotoalben zu suchen.
          </p>
          <p className="text-white font-medium text-2xl border-l-4 border-purple-500 pl-6 my-8">
            Dann sah ich es. Eine Gestalt. Direkt vor mir.
          </p>
          <p>
            Komplett schwarz. Nicht wie ein Schatten – <em>schwärzer</em> als die Dunkelheit.
            Keine Gesichtszüge, keine Details. Aber ich <strong>wusste</strong>, dass sie mich ansah.
          </p>
        </div>

        {/* V1 Audio Player (FALSCH - wir haben kein Audio!) */}
        {showAnnotations && (
          <Annotation color="amber">
            <strong>⚠️ V1 Problem:</strong> Audio-Player hier ist FALSCH! Im echten System wird Audio
            in Step 1 transkribiert - wir speichern nur den TEXT, nicht das Audio-File.
          </Annotation>
        )}

        <div className="mt-12 p-6 bg-gray-900 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl">🎙️</span>
            <div>
              <p className="font-medium">Audio-Aufnahme</p>
              <p className="text-sm text-gray-500">Maria erzählt die Geschichte selbst</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="h-1 bg-gray-700 rounded-full">
                <div className="h-full w-1/3 bg-purple-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* V1 Photos only */}
        {showAnnotations && (
          <Annotation color="amber">
            <strong>⚠️ V1 Problem:</strong> Zeigt nur "Fotos vom Ort" - aber wir haben auch
            Skizzen, Dokumente, Videos im Submit Flow. Diese fehlen hier komplett!
          </Annotation>
        )}

        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-4">📸 Fotos vom Ort</p>
          <div className="grid grid-cols-3 gap-3">
            <img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400" className="rounded-lg aspect-square object-cover" alt="Location" />
            <img src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400" className="rounded-lg aspect-square object-cover" alt="Location" />
            <img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400" className="rounded-lg aspect-square object-cover" alt="Location" />
          </div>
        </div>
      </section>

      {/* VALIDATION SECTION - V1 */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          {showAnnotations && (
            <Annotation color="amber">
              <strong>⚠️ V1 Problem:</strong> "Basierend auf: Kategorie, Zeitpunkt, Beschreibung, Ort" -
              aber der HAUPTFAKTOR sollte die semantische TEXT-Analyse sein (pgvector embeddings)!
              Die KI versteht den INHALT, nicht nur Metadaten.
            </Annotation>
          )}

          <div
            className="bg-gradient-to-br from-purple-900/50 to-gray-900 rounded-3xl p-8 border border-purple-500/30 mb-12"
            style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)' }}
          >
            <div className="text-center mb-8">
              <p className="text-purple-300 text-lg mb-2">Du bist nicht allein</p>
              <p className="text-5xl font-bold mb-4">247 Menschen</p>
              <p className="text-xl text-gray-400">hatten eine ähnliche Erfahrung</p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Übereinstimmung</span>
                <span className="text-purple-400 font-semibold">78%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Basierend auf: Kategorie, Zeitpunkt, Beschreibung, Ort
              </p>
            </div>
          </div>

          {/* Similar Stories - V1 (ohne Zitate) */}
          <h3 className="text-xl font-semibold mb-6">💬 „Das habe ich auch erlebt"</h3>
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-start gap-4">
                <img src="https://i.pravatar.cc/100?img=12" className="w-12 h-12 rounded-full" alt="User" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Stefan M.</span>
                    <span className="text-xs text-gray-500">• Wien</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">92% Match</span>
                  </div>
                  <p className="text-gray-400">
                    „Bei mir war es im Keller. Exakt dieselbe Beschreibung..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================
// VERSION 2 - OPTIMIZED DESIGN
// ============================================
function Version2({ showAnnotations }: { showAnnotations: boolean }) {
  const [storyExpanded, setStoryExpanded] = useState(false)
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'sketches' | 'docs'>('photos')

  return (
    <>
      {/* HERO SECTION - V2 */}
      <section className="relative min-h-[70vh]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1920"
            alt="Dark attic"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        </div>

        <div className="relative pt-8 pb-12 px-8 max-w-5xl mx-auto">
          {showAnnotations && (
            <Annotation color="emerald">
              <strong>V2 Hero:</strong> Kompakter, zeigt MEHR Infos above-the-fold.
              Tags + Teaser sofort sichtbar für schnelle Einordnung.
            </Annotation>
          )}

          {/* Top Row: Category + Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-purple-500/30 border border-purple-500/50 rounded-full text-purple-300 text-sm font-medium">
              👤 Shadow Person
            </span>
            <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#nachts</span>
            <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#allein</span>
            <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#altesgebäude</span>
            <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#schattengestalt</span>
          </div>

          {/* Title - KI Generated */}
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            Schattengestalt auf dem Dachboden
          </h1>

          {showAnnotations && (
            <Annotation color="blue">
              <strong>KI-generierter Titel:</strong> Im Submit Flow generiert die KI einen beschreibenden
              Titel aus dem Text. Der User kann ihn editieren wenn er möchte.
            </Annotation>
          )}

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
            <span>📍 Wien, Österreich</span>
            <span>🕐 23:45 Uhr</span>
            <span>📅 15. November 2019</span>
            <span className="text-purple-400">👁 1.2k Views</span>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="https://i.pravatar.cc/100?img=5"
              className="w-12 h-12 rounded-full border-2 border-purple-500"
              alt="Avatar"
            />
            <div>
              <p className="font-medium">Maria K. <span className="text-purple-400 text-sm">Level 12</span></p>
              <p className="text-xs text-gray-400">47 Erfahrungen geteilt</p>
            </div>
            <button className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition">
              Folgen
            </button>
          </div>

          {/* TEASER - Quick Summary */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            {showAnnotations && (
              <Annotation color="emerald">
                <strong>V2 Teaser (NEU):</strong> KI-generierte Kurzzusammenfassung für Durchzapper.
                Wer mehr will, klickt "Vollständige Geschichte". So bedienen wir BEIDE User-Typen.
              </Annotation>
            )}

            <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              <span>📝</span> Zusammenfassung
            </p>
            <p className="text-gray-200 leading-relaxed">
              Eine Frau sieht nachts auf dem Dachboden eine schwarze, gesichtslose Gestalt.
              Obwohl keine Gesichtszüge erkennbar sind, hat sie das intensive Gefühl, beobachtet
              zu werden. Die Erscheinung löst sich nach wenigen Sekunden wie Rauch auf.
            </p>
          </div>
        </div>
      </section>

      {/* FULL STORY - V2 (Expandable) */}
      <section className="py-12 px-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="emerald">
            <strong>V2 Story:</strong> Collapsed by default - Teaser reicht für Durchzapper.
            Tiefleser klicken "Mehr lesen" für die vollständige Geschichte.
          </Annotation>
        )}

        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setStoryExpanded(!storyExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition"
          >
            <span className="font-medium flex items-center gap-2">
              📖 Vollständige Geschichte
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${storyExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {storyExpanded && (
            <div className="px-6 pb-6 text-gray-300 space-y-4 leading-relaxed border-t border-gray-800 pt-6">
              <p>
                Es war kurz vor Mitternacht. Ich konnte nicht schlafen – zu viele Gedanken.
                Also beschloss ich, auf den Dachboden zu gehen, um alte Fotoalben zu suchen.
                Vielleicht würde mich das ablenken.
              </p>
              <p>
                Die Holztreppe knarrte unter meinen Füßen. Oben war es stockdunkel, nur das
                schwache Mondlicht fiel durch das kleine Fenster. Ich tastete nach dem
                Lichtschalter...
              </p>
              <p className="text-white font-medium text-xl border-l-4 border-purple-500 pl-4">
                Dann sah ich es. Eine Gestalt. Direkt vor mir.
              </p>
              <p>
                Komplett schwarz. Nicht wie ein Schatten – <em>schwärzer</em> als die Dunkelheit
                um sie herum. Keine Gesichtszüge, keine Details. Aber ich <strong>wusste</strong>,
                dass sie mich ansah. Ich konnte es fühlen.
              </p>
              <p>
                Ich stand wie eingefroren. Mein Herz hämmerte. Dann, nach vielleicht 5 Sekunden,
                löste sich die Gestalt einfach auf. Wie Rauch, der sich verflüchtigt.
              </p>
              <p>
                Ich rannte die Treppe hinunter und habe in dieser Nacht kein Auge mehr zugemacht.
                Bis heute habe ich niemandem davon erzählt. Ich dachte, man würde mich für verrückt halten.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* MEDIA SECTION - V2 (Tabs for all types) */}
      <section className="py-12 px-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="emerald">
            <strong>V2 Anhänge (NEU):</strong> Tabs für ALLE Medientypen aus dem Submit Flow -
            Fotos, Skizzen, Dokumente, Videos. Nicht nur Fotos wie in V1!
          </Annotation>
        )}

        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveMediaTab('photos')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeMediaTab === 'photos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              📷 Fotos (3)
            </button>
            <button
              onClick={() => setActiveMediaTab('sketches')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeMediaTab === 'sketches' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              🎨 Skizzen (1)
            </button>
            <button
              onClick={() => setActiveMediaTab('docs')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeMediaTab === 'docs' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              📄 Dokumente (0)
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeMediaTab === 'photos' && (
              <div className="grid grid-cols-3 gap-3">
                <img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400" className="rounded-lg aspect-square object-cover cursor-pointer hover:scale-105 transition" alt="Location" />
                <img src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400" className="rounded-lg aspect-square object-cover cursor-pointer hover:scale-105 transition" alt="Location" />
                <img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400" className="rounded-lg aspect-square object-cover cursor-pointer hover:scale-105 transition" alt="Location" />
              </div>
            )}
            {activeMediaTab === 'sketches' && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md bg-gray-800 rounded-xl p-4 border-2 border-dashed border-gray-600">
                  <p className="text-center text-gray-500 mb-4">🎨 Skizze der Gestalt</p>
                  {/* Placeholder for sketch */}
                  <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <svg className="w-20 h-20 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        <circle cx="12" cy="10" r="3" opacity="0.5"/>
                        <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" opacity="0.3"/>
                      </svg>
                      <p className="text-sm">[User-Zeichnung]</p>
                      <p className="text-xs mt-1">"Schwarze Silhouette ohne Gesicht"</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Vom User im Submit-Flow gezeichnet
                </p>
              </div>
            )}
            {activeMediaTab === 'docs' && (
              <div className="text-center py-8 text-gray-500">
                <p>Keine Dokumente angehängt</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* VALIDATION SECTION - V2 (Improved) */}
      <section className="py-12 px-8">
        <div className="max-w-4xl mx-auto">
          {showAnnotations && (
            <Annotation color="emerald">
              <strong>V2 Ähnlichkeit (VERBESSERT):</strong> Zeigt jetzt WARUM Erfahrungen ähnlich sind.
              Der TEXT (semantische KI-Analyse) ist der HAUPTFAKTOR, nicht nur Metadaten!
            </Annotation>
          )}

          <div
            className="bg-gradient-to-br from-emerald-900/30 to-gray-900 rounded-3xl p-8 border border-emerald-500/30 mb-8"
            style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)' }}
          >
            <div className="text-center mb-8">
              <p className="text-emerald-300 text-lg mb-2">Du bist nicht allein</p>
              <p className="text-5xl font-bold mb-4">247 Menschen</p>
              <p className="text-xl text-gray-400">beschrieben ähnliche Erlebnisse</p>
            </div>

            {/* Detailed Match Breakdown */}
            <div className="bg-gray-900/70 rounded-xl p-6 space-y-4">
              <p className="text-sm text-gray-400 mb-4">Was macht diese Erfahrungen ähnlich?</p>

              {/* Text Similarity - PRIMARY */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300 flex items-center gap-2">
                    <span className="text-lg">🧠</span> Inhaltliche Übereinstimmung
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">HAUPTFAKTOR</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">82%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[82%] bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  "Schwarze Gestalt ohne Gesichtszüge, Gefühl beobachtet zu werden"
                </p>
              </div>

              {/* Time */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 flex items-center gap-2">
                    <span>🕐</span> Gleicher Zeitraum (nachts)
                  </span>
                  <span className="text-emerald-400">100%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-emerald-500/60 rounded-full" />
                </div>
              </div>

              {/* Location Type */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 flex items-center gap-2">
                    <span>📍</span> Ähnliche Umgebung
                  </span>
                  <span className="text-emerald-400">78%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-emerald-500/60 rounded-full" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Dachboden, Keller, alte Gebäude</p>
              </div>

              {/* Tags */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 flex items-center gap-2">
                    <span>🏷️</span> Gemeinsame Tags
                  </span>
                  <span className="text-emerald-400">65%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-emerald-500/60 rounded-full" />
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-white font-medium">Gesamt-Ähnlichkeit</span>
                  <span className="text-emerald-400 font-bold text-lg">78%</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition">
              Alle 247 ähnlichen Erfahrungen ansehen →
            </button>
          </div>

          {/* Similar Stories with Quotes */}
          <h3 className="text-xl font-semibold mb-6">💬 „Das habe ich auch erlebt"</h3>

          {showAnnotations && (
            <Annotation color="blue">
              <strong>V2 Zitate:</strong> Zeigt WAS an der Erfahrung ähnlich ist -
              konkrete Textpassagen die matchen. Das macht die Verbindung greifbarer!
            </Annotation>
          )}

          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-emerald-500/50 transition">
              <div className="flex items-start gap-4">
                <img src="https://i.pravatar.cc/100?img=12" className="w-12 h-12 rounded-full" alt="User" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-medium">Stefan M.</span>
                    <span className="text-xs text-gray-500">• Wien • vor 3 Monaten</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">92% Match</span>
                  </div>

                  {/* What matched */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-3">
                    <p className="text-xs text-emerald-400 mb-1">🧠 Übereinstimmung gefunden:</p>
                    <p className="text-sm text-gray-300 italic">
                      "...keine Gesichtszüge, aber man <strong className="text-white">WEISS</strong> dass es einen ansieht"
                    </p>
                  </div>

                  <p className="text-gray-400 text-sm">
                    Bei mir war es im Keller. Das Gefühl werde ich nie vergessen - diese
                    absolute Gewissheit, beobachtet zu werden, obwohl nichts zu sehen war...
                  </p>
                  <p className="text-sm text-emerald-400 mt-3 cursor-pointer hover:underline">
                    Vollständige Erfahrung lesen →
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-emerald-500/50 transition">
              <div className="flex items-start gap-4">
                <img src="https://i.pravatar.cc/100?img=23" className="w-12 h-12 rounded-full" alt="User" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-medium">Lisa T.</span>
                    <span className="text-xs text-gray-500">• München • vor 1 Jahr</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">85% Match</span>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-3">
                    <p className="text-xs text-emerald-400 mb-1">🧠 Übereinstimmung gefunden:</p>
                    <p className="text-sm text-gray-300 italic">
                      "...schwarze Gestalt, schwärzer als die Dunkelheit selbst"
                    </p>
                  </div>

                  <p className="text-gray-400 text-sm">
                    Vor 3 Jahren, auch nachts. Ich dachte ich werde verrückt bis ich diese
                    Seite fand. Es ist so erleichternd zu wissen, dass andere das auch kennen.
                  </p>
                  <p className="text-sm text-emerald-400 mt-3 cursor-pointer hover:underline">
                    Vollständige Erfahrung lesen →
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PATTERNS SECTION - V2 */}
      <section className="py-12 px-8 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          {showAnnotations && (
            <Annotation color="emerald">
              <strong>V2 Muster:</strong> Gleiche Daten wie V1, aber mit menschlicher Sprache
              statt wissenschaftlichen Begriffen. "Wann passiert das?" statt "Temporal Analysis".
            </Annotation>
          )}

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span>🔍</span> Muster & Erkenntnisse
                </h3>
                <p className="text-gray-500 mt-1">Was haben ähnliche Erfahrungen gemeinsam?</p>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center group-open:rotate-180 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <span>🕐</span> Wann passiert das?
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Nachts (23-03 Uhr)</span>
                      <span className="text-emerald-400">89%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full">
                      <div className="h-full w-[89%] bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Abends</span>
                      <span className="text-emerald-400">8%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full">
                      <div className="h-full w-[8%] bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <span>🔗</span> Gemeinsame Faktoren
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Allein im Raum</span>
                    <span className="text-emerald-400 font-medium">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Altes Gebäude (&gt;50 Jahre)</span>
                    <span className="text-emerald-400 font-medium">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Emotionaler Stress zuvor</span>
                    <span className="text-emerald-400 font-medium">71%</span>
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* COMMENTS - V2 */}
      <section className="py-12 px-8">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>💬</span> Diskussion
            <span className="text-sm font-normal text-gray-500">23 Kommentare</span>
          </h3>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <textarea
              className="w-full bg-gray-800 rounded-xl p-4 text-gray-300 placeholder-gray-600 border border-gray-700 focus:border-emerald-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Teile deine Gedanken oder stelle eine Frage..."
            />
            <div className="flex justify-end mt-4">
              <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition">
                Kommentieren
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================
// VERSION 3 - COMPLETE EXPERIENCE
// All features: Share, Map, Witness, Badges, CTA
// ============================================
function Version3({ showAnnotations }: { showAnnotations: boolean }) {
  const [storyExpanded, setStoryExpanded] = useState(false)
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'sketches' | 'docs'>('photos')
  const [saved, setSaved] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [meTooClicked, setMeTooClicked] = useState(false)

  return (
    <>
      {/* ============================================ */}
      {/* FLOATING ACTION BAR (Mobile + Desktop)      */}
      {/* ============================================ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-4 py-3 md:hidden">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setMeTooClicked(!meTooClicked)}
            className={`flex flex-col items-center gap-1 ${meTooClicked ? 'text-cyan-400' : 'text-gray-400'}`}
          >
            <span className="text-xl">✋</span>
            <span className="text-xs">Ich auch</span>
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className={`flex flex-col items-center gap-1 ${saved ? 'text-amber-400' : 'text-gray-400'}`}
          >
            <span className="text-xl">{saved ? '★' : '☆'}</span>
            <span className="text-xs">Speichern</span>
          </button>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <span className="text-xl">↗</span>
            <span className="text-xs">Teilen</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xl">💬</span>
            <span className="text-xs">23</span>
          </button>
        </div>
      </div>

      {showAnnotations && (
        <div className="max-w-5xl mx-auto px-8 pt-4">
          <Annotation color="blue">
            <strong>V3 NEU - Mobile Action Bar:</strong> Sticky am unteren Bildschirmrand für schnelle
            Interaktionen: "Ich auch", Speichern, Teilen, Kommentare. Immer erreichbar!
          </Annotation>
        </div>
      )}

      {/* ============================================ */}
      {/* HERO SECTION - V3                           */}
      {/* ============================================ */}
      <section className="relative min-h-[70vh]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1920"
            alt="Dark attic"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        </div>

        <div className="relative pt-8 pb-12 px-8 max-w-5xl mx-auto">
          {/* TOP ROW: Category + Tags + Actions */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-cyan-500/30 border border-cyan-500/50 rounded-full text-cyan-300 text-sm font-medium">
                👤 Shadow Person
              </span>
              <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#nachts</span>
              <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#allein</span>
              <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#altesgebäude</span>
              <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#schattengestalt</span>
            </div>

            {/* DESKTOP ACTION BUTTONS */}
            <div className="hidden md:flex items-center gap-2">
              {showAnnotations && (
                <Annotation color="blue">
                  <strong>V3 NEU:</strong> Share, Save, Report - direkt im Hero!
                </Annotation>
              )}

              {/* Share Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Teilen
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 top-12 bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-2 min-w-[200px] z-50">
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm">
                      <span className="text-green-500">📱</span> WhatsApp
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm">
                      <span className="text-blue-400">🐦</span> Twitter/X
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm">
                      <span className="text-blue-600">📘</span> Facebook
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm">
                      <span className="text-gray-400">🔗</span> Link kopieren
                    </button>
                    <hr className="border-gray-700 my-2" />
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm text-gray-400">
                      <span>{'</>'}</span> Embed Code
                    </button>
                  </div>
                )}
              </div>

              {/* Save/Bookmark Button */}
              <button
                onClick={() => setSaved(!saved)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  saved
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{saved ? '★' : '☆'}</span>
                {saved ? 'Gespeichert' : 'Speichern'}
              </button>

              {/* Report Button (discrete) */}
              <button className="p-2 text-gray-500 hover:text-gray-300 transition" title="Melden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </button>
            </div>
          </div>

          {/* TITLE - KI Generated */}
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            Schattengestalt auf dem Dachboden
          </h1>

          {/* META ROW with Witness Badge */}
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
            <span>📍 Wien, Österreich</span>
            <span>🕐 23:45 Uhr</span>
            <span>📅 15. November 2019</span>
            <span className="text-cyan-400">👁 1.2k Views</span>

            {/* WITNESS BADGE - NEW in V3 */}
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-300 text-xs font-medium flex items-center gap-1">
              👥 2 Zeugen dabei
            </span>
          </div>

          {showAnnotations && (
            <Annotation color="blue">
              <strong>V3 NEU - Zeugen-Badge:</strong> "2 Zeugen dabei" - aus dem Submit-Flow!
              Erhöht die Glaubwürdigkeit sofort. User sehen: Das war nicht nur eine Person.
            </Annotation>
          )}

          {/* AUTHOR with Badges */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="https://i.pravatar.cc/100?img=5"
              className="w-14 h-14 rounded-full border-2 border-cyan-500"
              alt="Avatar"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">Maria K.</p>
                <span className="text-cyan-400 text-sm">Level 12</span>
                {/* BADGES - NEW in V3 */}
                <span className="px-2 py-0.5 bg-purple-500/30 rounded text-purple-300 text-xs">🔮 Seer</span>
                <span className="px-2 py-0.5 bg-amber-500/30 rounded text-amber-300 text-xs">⭐ Trusted</span>
              </div>
              <p className="text-xs text-gray-400">47 Erfahrungen • 89% Glaubwürdigkeit</p>
            </div>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition">
              Folgen
            </button>
          </div>

          {showAnnotations && (
            <Annotation color="blue">
              <strong>V3 NEU - Author Badges:</strong> "Seer", "Trusted" - Gamification sichtbar!
              89% Glaubwürdigkeit zeigt den Reputation-Score.
            </Annotation>
          )}

          {/* TEASER + MINI-MAP GRID */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Teaser - 2/3 */}
            <div className="md:col-span-2 bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <span>📝</span> Zusammenfassung
              </p>
              <p className="text-gray-200 leading-relaxed">
                Eine Frau sieht nachts auf dem Dachboden eine schwarze, gesichtslose Gestalt.
                Obwohl keine Gesichtszüge erkennbar sind, hat sie das intensive Gefühl, beobachtet
                zu werden. Die Erscheinung löst sich nach wenigen Sekunden wie Rauch auf.
              </p>
            </div>

            {/* MINI-MAP - 1/3 - NEW in V3 */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <span>🗺️</span> Ort
              </p>
              <div className="relative aspect-square bg-gray-800 rounded-xl overflow-hidden">
                {/* Placeholder for map */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800">
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
                {/* Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <span className="text-xs">📍</span>
                  </div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mx-auto -mt-1" />
                </div>
                {/* Label */}
                <div className="absolute bottom-2 left-2 right-2 bg-gray-900/90 rounded-lg px-2 py-1 text-xs text-center">
                  Wien, 7. Bezirk
                </div>
              </div>
              <button className="w-full mt-2 text-xs text-cyan-400 hover:text-cyan-300">
                5 weitere Erfahrungen hier →
              </button>
            </div>
          </div>

          {showAnnotations && (
            <Annotation color="blue">
              <strong>V3 NEU - Mini-Map:</strong> Zeigt den Ort visuell!
              "5 weitere Erfahrungen hier" → Location-basierte Discovery.
            </Annotation>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* "ICH AUCH" QUICK CONNECT - V3 NEW           */}
      {/* ============================================ */}
      <section className="py-6 px-8">
        <div className="max-w-4xl mx-auto">
          {showAnnotations && (
            <Annotation color="blue">
              <strong>V3 NEU - "Ich auch" Button:</strong> Schnellste Interaktion!
              Ein Klick verbindet dich mit dieser Erfahrung. Zeigt Community-Größe.
            </Annotation>
          )}

          <div
            className={`rounded-2xl p-6 border transition cursor-pointer ${
              meTooClicked
                ? 'bg-cyan-500/20 border-cyan-500/50'
                : 'bg-gray-900/50 border-gray-800 hover:border-cyan-500/30'
            }`}
            onClick={() => setMeTooClicked(!meTooClicked)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition ${
                  meTooClicked ? 'bg-cyan-500' : 'bg-gray-800'
                }`}>
                  ✋
                </div>
                <div>
                  <p className="font-medium text-lg">
                    {meTooClicked ? 'Du bist verbunden!' : 'Das habe ich auch erlebt'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {meTooClicked
                      ? 'Du erhältst Updates zu ähnlichen Erfahrungen'
                      : 'Verbinde dich mit 247 anderen, die das kennen'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">248</p>
                <p className="text-xs text-gray-500">{meTooClicked ? 'inkl. dir' : 'Personen'}</p>
              </div>
            </div>

            {meTooClicked && (
              <div className="mt-4 pt-4 border-t border-cyan-500/30 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-300 text-sm">
                  🔔 Benachrichtigungen an
                </span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-gray-400 text-sm cursor-pointer hover:bg-gray-700">
                  Eigene Erfahrung teilen →
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FULL STORY - V3 (Same as V2) */}
      <section className="py-8 px-8 max-w-4xl mx-auto">
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setStoryExpanded(!storyExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition"
          >
            <span className="font-medium flex items-center gap-2">
              📖 Vollständige Geschichte
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${storyExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {storyExpanded && (
            <div className="px-6 pb-6 text-gray-300 space-y-4 leading-relaxed border-t border-gray-800 pt-6">
              <p>
                Es war kurz vor Mitternacht. Ich konnte nicht schlafen – zu viele Gedanken.
                Also beschloss ich, auf den Dachboden zu gehen, um alte Fotoalben zu suchen.
                Vielleicht würde mich das ablenken.
              </p>
              <p>
                Die Holztreppe knarrte unter meinen Füßen. Oben war es stockdunkel, nur das
                schwache Mondlicht fiel durch das kleine Fenster. Ich tastete nach dem
                Lichtschalter...
              </p>
              <p className="text-white font-medium text-xl border-l-4 border-cyan-500 pl-4">
                Dann sah ich es. Eine Gestalt. Direkt vor mir.
              </p>
              <p>
                Komplett schwarz. Nicht wie ein Schatten – <em>schwärzer</em> als die Dunkelheit
                um sie herum. Keine Gesichtszüge, keine Details. Aber ich <strong>wusste</strong>,
                dass sie mich ansah. Ich konnte es fühlen.
              </p>
              <p>
                Ich stand wie eingefroren. Mein Herz hämmerte. Dann, nach vielleicht 5 Sekunden,
                löste sich die Gestalt einfach auf. Wie Rauch, der sich verflüchtigt.
              </p>
              <p>
                Ich rannte die Treppe hinunter und habe in dieser Nacht kein Auge mehr zugemacht.
                Bis heute habe ich niemandem davon erzählt. Ich dachte, man würde mich für verrückt halten.
              </p>

              {/* Follow-up Section - NEW in V3 */}
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <p className="text-sm text-cyan-400 mb-2 flex items-center gap-2">
                  <span>🔄</span> Update (3 Monate später)
                </p>
                <p className="text-gray-300 text-sm">
                  "Ich habe mich endlich getraut, meiner Schwester davon zu erzählen.
                  Sie wurde blass - sie hatte vor 10 Jahren genau das Gleiche in diesem Haus erlebt,
                  aber nie darüber gesprochen..."
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {showAnnotations && storyExpanded && (
        <div className="max-w-4xl mx-auto px-8">
          <Annotation color="blue">
            <strong>V3 NEU - Follow-up Updates:</strong> Maria hat 3 Monate später ein Update hinzugefügt!
            Ongoing Stories sind viel spannender und halten User engaged.
          </Annotation>
        </div>
      )}

      {/* MEDIA SECTION - V3 (Same as V2) */}
      <section className="py-8 px-8 max-w-4xl mx-auto">
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveMediaTab('photos')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeMediaTab === 'photos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              📷 Fotos (3)
            </button>
            <button
              onClick={() => setActiveMediaTab('sketches')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeMediaTab === 'sketches' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              🎨 Skizzen (1)
            </button>
            <button
              onClick={() => setActiveMediaTab('docs')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeMediaTab === 'docs' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              📄 Dokumente (0)
            </button>
          </div>

          <div className="p-6">
            {activeMediaTab === 'photos' && (
              <div className="grid grid-cols-3 gap-3">
                <img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400" className="rounded-lg aspect-square object-cover cursor-pointer hover:scale-105 transition" alt="Location" />
                <img src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400" className="rounded-lg aspect-square object-cover cursor-pointer hover:scale-105 transition" alt="Location" />
                <img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400" className="rounded-lg aspect-square object-cover cursor-pointer hover:scale-105 transition" alt="Location" />
              </div>
            )}
            {activeMediaTab === 'sketches' && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md bg-gray-800 rounded-xl p-4 border-2 border-dashed border-gray-600">
                  <p className="text-center text-gray-500 mb-4">🎨 Skizze der Gestalt</p>
                  <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <svg className="w-20 h-20 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        <circle cx="12" cy="10" r="3" opacity="0.5"/>
                        <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" opacity="0.3"/>
                      </svg>
                      <p className="text-sm">[User-Zeichnung]</p>
                      <p className="text-xs mt-1">"Schwarze Silhouette ohne Gesicht"</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeMediaTab === 'docs' && (
              <div className="text-center py-8 text-gray-500">
                <p>Keine Dokumente angehängt</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* VALIDATION SECTION - V3 (Enhanced) */}
      <section className="py-8 px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-gradient-to-br from-cyan-900/30 to-gray-900 rounded-3xl p-8 border border-cyan-500/30 mb-8"
            style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.2)' }}
          >
            <div className="text-center mb-8">
              <p className="text-cyan-300 text-lg mb-2">Du bist nicht allein</p>
              <p className="text-5xl font-bold mb-4">247 Menschen</p>
              <p className="text-xl text-gray-400">beschrieben ähnliche Erlebnisse</p>
            </div>

            {/* Detailed Match Breakdown */}
            <div className="bg-gray-900/70 rounded-xl p-6 space-y-4">
              <p className="text-sm text-gray-400 mb-4">Was macht diese Erfahrungen ähnlich?</p>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300 flex items-center gap-2">
                    <span className="text-lg">🧠</span> Inhaltliche Übereinstimmung
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">HAUPTFAKTOR</span>
                  </span>
                  <span className="text-cyan-400 font-semibold">82%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[82%] bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  "Schwarze Gestalt ohne Gesichtszüge, Gefühl beobachtet zu werden"
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 flex items-center gap-2">
                    <span>🕐</span> Gleicher Zeitraum (nachts)
                  </span>
                  <span className="text-cyan-400">100%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-cyan-500/60 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 flex items-center gap-2">
                    <span>📍</span> Ähnliche Umgebung
                  </span>
                  <span className="text-cyan-400">78%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-cyan-500/60 rounded-full" />
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-white font-medium">Gesamt-Ähnlichkeit</span>
                  <span className="text-cyan-400 font-bold text-lg">78%</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-medium transition">
              Alle 247 ähnlichen Erfahrungen ansehen →
            </button>
          </div>

          {/* Similar Stories */}
          <h3 className="text-xl font-semibold mb-6">💬 „Das habe ich auch erlebt"</h3>

          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-cyan-500/50 transition">
              <div className="flex items-start gap-4">
                <img src="https://i.pravatar.cc/100?img=12" className="w-12 h-12 rounded-full" alt="User" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-medium">Stefan M.</span>
                    <span className="px-2 py-0.5 bg-amber-500/30 rounded text-amber-300 text-xs">⭐ Trusted</span>
                    <span className="text-xs text-gray-500">• Wien • vor 3 Monaten</span>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">92% Match</span>
                  </div>

                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mb-3">
                    <p className="text-xs text-cyan-400 mb-1">🧠 Übereinstimmung gefunden:</p>
                    <p className="text-sm text-gray-300 italic">
                      "...keine Gesichtszüge, aber man <strong className="text-white">WEISS</strong> dass es einen ansieht"
                    </p>
                  </div>

                  <p className="text-gray-400 text-sm">
                    Bei mir war es im Keller. Das Gefühl werde ich nie vergessen...
                  </p>
                  <p className="text-sm text-cyan-400 mt-3 cursor-pointer hover:underline">
                    Vollständige Erfahrung lesen →
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED CATEGORIES - V3 NEW */}
      <section className="py-8 px-8 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          {showAnnotations && (
            <Annotation color="blue">
              <strong>V3 NEU - Verwandte Kategorien:</strong> Exploration erweitern!
              Shadow People → Hat Man, Sleep Paralysis. Rabbit hole für Interessierte.
            </Annotation>
          )}

          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🔗</span> Verwandte Phänomene
          </h3>

          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition flex items-center gap-2">
              <span>🎩</span> Hat Man (89 Berichte)
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition flex items-center gap-2">
              <span>😴</span> Sleep Paralysis Entities (312)
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition flex items-center gap-2">
              <span>👻</span> Apparitions (567)
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition flex items-center gap-2">
              <span>🏚️</span> Haunted Locations Wien (34)
            </button>
          </div>
        </div>
      </section>

      {/* COMMENTS - V3 */}
      <section className="py-8 px-8">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>💬</span> Diskussion
            <span className="text-sm font-normal text-gray-500">23 Kommentare</span>
          </h3>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <textarea
              className="w-full bg-gray-800 rounded-xl p-4 text-gray-300 placeholder-gray-600 border border-gray-700 focus:border-cyan-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Teile deine Gedanken oder stelle eine Frage..."
            />
            <div className="flex justify-end mt-4">
              <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-medium transition">
                Kommentieren
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA - SHARE YOUR STORY - V3 NEW             */}
      {/* ============================================ */}
      <section className="py-16 px-8">
        <div className="max-w-3xl mx-auto">
          {showAnnotations && (
            <Annotation color="blue">
              <strong>V3 NEU - Call-to-Action:</strong> Am Ende der Seite: "Teile DEINE Geschichte"!
              User hat gerade eine emotionale Story gelesen → perfekter Moment für Conversion.
            </Annotation>
          )}

          <div className="bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-3xl p-8 md:p-12 border border-cyan-500/30 text-center">
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Hattest du auch eine unerklärliche Erfahrung?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Du bist nicht allein. Teile deine Geschichte anonym und finde andere,
              die das Gleiche erlebt haben. Es ist Zeit, gehört zu werden.
            </p>
            <button className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-semibold text-lg transition shadow-lg shadow-cyan-500/20">
              Meine Geschichte teilen →
            </button>
            <p className="text-xs text-gray-500 mt-4">
              100% anonym • KI-gestützte Analyse • Verbindung mit ähnlichen Erfahrungen
            </p>
          </div>
        </div>
      </section>

      {/* Spacer for mobile action bar */}
      <div className="h-20 md:hidden" />
    </>
  )
}

// ============================================
// VERSION 4 - CONNECTION-FIRST DESIGN
// The core of XP Share: "Du bist nicht allein"
// Connections BEFORE content
// ============================================
function Version4({ showAnnotations }: { showAnnotations: boolean }) {
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [activeCompareIndex, setActiveCompareIndex] = useState(0)
  const [storyExpanded, setStoryExpanded] = useState(false)

  // Mock similar stories for comparison
  const similarStories = [
    { id: 1, match: 92, author: 'Stefan M.', location: 'Wien, Keller', quote: 'Keine Gesichtszüge, aber man WEISS dass es einen ansieht', time: 'vor 3 Mon.' },
    { id: 2, match: 85, author: 'Lisa T.', location: 'München', quote: 'Schwärzer als die Dunkelheit selbst, wie ein Loch im Raum', time: 'vor 1 Jahr' },
    { id: 3, match: 78, author: 'Max R.', location: 'Berlin', quote: 'Das Gefühl beobachtet zu werden war überwältigend', time: 'vor 6 Mon.' },
    { id: 4, match: 71, author: 'Anna S.', location: 'Hamburg', quote: 'Es löste sich auf wie Rauch, innerhalb von Sekunden', time: 'vor 2 Jahre' },
  ]

  return (
    <>
      {/* ============================================ */}
      {/* HERO: CONNECTION-FIRST                      */}
      {/* "Du bist nicht allein" ABOVE THE FOLD       */}
      {/* ============================================ */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1920"
            alt="Dark attic"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/90 to-gray-950" />
        </div>

        <div className="relative w-full px-8 py-12 max-w-6xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>V4 REVOLUTION - Connection-First:</strong> Das ERSTE was du siehst ist nicht die Story,
              sondern "Du bist einer von 248". Die emotionale Validation kommt VOR dem Content!
            </Annotation>
          )}

          {/* THE BIG NUMBER - Emotional Impact First */}
          <div className="text-center mb-8">
            <p className="text-rose-400 text-lg mb-2 tracking-wide">DU BIST NICHT ALLEIN</p>
            <p className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              248
            </p>
            <p className="text-xl md:text-2xl text-gray-300 mt-2">
              Menschen beschrieben <span className="text-white font-semibold">genau das Gleiche</span>
            </p>
          </div>

          {/* ============================================ */}
          {/* VISUAL NETWORK GRAPH                        */}
          {/* ============================================ */}
          {showAnnotations && (
            <Annotation color="purple">
              <strong>V4 NEU - Visual Network:</strong> Die Verbindungen werden SICHTBAR!
              Diese Story (Mitte) verbunden mit ähnlichen. Klick auf Nodes zeigt Details.
            </Annotation>
          )}

          <div className="relative h-64 md:h-80 mb-8">
            {/* SVG Network Visualization */}
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Connection Lines */}
              <g className="opacity-40">
                {/* Lines from center to outer nodes */}
                <line x1="200" y1="100" x2="80" y2="50" stroke="url(#lineGradient)" strokeWidth="2" />
                <line x1="200" y1="100" x2="320" y2="40" stroke="url(#lineGradient)" strokeWidth="2" />
                <line x1="200" y1="100" x2="60" y2="140" stroke="url(#lineGradient)" strokeWidth="1.5" />
                <line x1="200" y1="100" x2="340" y2="130" stroke="url(#lineGradient)" strokeWidth="1.5" />
                <line x1="200" y1="100" x2="120" y2="170" stroke="url(#lineGradient)" strokeWidth="1" />
                <line x1="200" y1="100" x2="280" y2="175" stroke="url(#lineGradient)" strokeWidth="1" />
                <line x1="200" y1="100" x2="150" y2="30" stroke="url(#lineGradient)" strokeWidth="1" />
                <line x1="200" y1="100" x2="250" y2="25" stroke="url(#lineGradient)" strokeWidth="1" />
                {/* Secondary connections */}
                <line x1="80" y1="50" x2="60" y2="140" stroke="#4a5568" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="320" y1="40" x2="340" y2="130" stroke="#4a5568" strokeWidth="0.5" strokeDasharray="4" />
              </g>

              {/* Gradient Definition */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                </linearGradient>
                <radialGradient id="centerGlow">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Center Glow */}
              <circle cx="200" cy="100" r="50" fill="url(#centerGlow)" />

              {/* Outer Nodes (similar stories) */}
              {[
                { x: 80, y: 50, match: 92, size: 14 },
                { x: 320, y: 40, match: 85, size: 12 },
                { x: 60, y: 140, match: 78, size: 10 },
                { x: 340, y: 130, match: 71, size: 9 },
                { x: 120, y: 170, match: 65, size: 7 },
                { x: 280, y: 175, match: 60, size: 7 },
                { x: 150, y: 30, match: 55, size: 6 },
                { x: 250, y: 25, match: 52, size: 6 },
              ].map((node, i) => (
                <g key={i} className="cursor-pointer" onClick={() => setSelectedNode(selectedNode === i ? null : i)}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill={selectedNode === i ? '#f43f5e' : '#6b7280'}
                    className="transition-all duration-300 hover:fill-rose-400"
                  />
                  {selectedNode === i && (
                    <text x={node.x} y={node.y - node.size - 8} textAnchor="middle" fill="white" fontSize="10">
                      {node.match}% Match
                    </text>
                  )}
                </g>
              ))}

              {/* CENTER NODE (This Story) */}
              <circle cx="200" cy="100" r="24" fill="#f43f5e" className="animate-pulse" style={{ animationDuration: '3s' }} />
              <circle cx="200" cy="100" r="20" fill="#1f2937" />
              <text x="200" y="104" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">DIESE</text>

              {/* Label */}
              <text x="200" y="145" textAnchor="middle" fill="#9ca3af" fontSize="10">
                ● = ähnliche Erfahrung (Größe = Match %)
              </text>
            </svg>

            {/* Selected Node Info Popup */}
            {selectedNode !== null && selectedNode < 4 && (
              <div className="absolute top-4 right-4 bg-gray-800 rounded-xl p-4 border border-rose-500/30 max-w-xs">
                <p className="text-rose-400 text-sm font-medium mb-1">
                  {similarStories[selectedNode].match}% Übereinstimmung
                </p>
                <p className="text-white font-medium">{similarStories[selectedNode].author}</p>
                <p className="text-gray-400 text-sm">{similarStories[selectedNode].location}</p>
                <p className="text-gray-300 text-sm mt-2 italic">"{similarStories[selectedNode].quote.slice(0, 50)}..."</p>
                <button className="mt-2 text-xs text-rose-400 hover:underline">Story lesen →</button>
              </div>
            )}
          </div>

          {/* Story Title (Secondary) */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-3 flex-wrap">
              <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/50 rounded-full text-rose-300 text-sm">
                👤 Shadow Person
              </span>
              <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#nachts</span>
              <span className="px-2 py-1 bg-gray-800/80 rounded-full text-gray-400 text-xs">#allein</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-200">
              Schattengestalt auf dem Dachboden
            </h1>
            <p className="text-gray-500 mt-2">
              Eine von 248 Geschichten • von Maria K. • Wien, Nov 2019
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* COMPARISON CAROUSEL                         */}
      {/* Side-by-side: This Story vs. Similar        */}
      {/* ============================================ */}
      <section className="py-12 px-8 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>V4 NEU - Comparison View:</strong> Zeigt diese Story NEBEN der ähnlichsten.
              User sieht SOFORT was gleich ist. Swipe durch die Top-Matches!
            </Annotation>
          )}

          <h2 className="text-xl font-semibold mb-6 text-center">
            <span className="text-rose-400">Vergleiche</span> mit den ähnlichsten Erfahrungen
          </h2>

          {/* Comparison Selector */}
          <div className="flex justify-center gap-2 mb-6">
            {similarStories.map((story, i) => (
              <button
                key={story.id}
                onClick={() => setActiveCompareIndex(i)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  activeCompareIndex === i
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {story.match}%
              </button>
            ))}
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* THIS STORY */}
            <div className="bg-gray-900 rounded-2xl p-6 border-2 border-rose-500/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-rose-500 rounded text-xs font-bold">DIESE STORY</span>
                <span className="text-gray-500 text-sm">Maria K. • Wien</span>
              </div>
              <div className="space-y-3 text-gray-300">
                <p>"Es war kurz vor Mitternacht... Dann sah ich es."</p>
                <p className="bg-rose-500/10 border-l-4 border-rose-500 pl-3 py-1">
                  "<strong className="text-white">Schwarze Gestalt, keine Gesichtszüge</strong>"
                </p>
                <p className="bg-rose-500/10 border-l-4 border-rose-500 pl-3 py-1">
                  "Ich <strong className="text-white">WUSSTE</strong>, dass sie mich ansah"
                </p>
                <p className="bg-rose-500/10 border-l-4 border-rose-500 pl-3 py-1">
                  "Löste sich auf wie <strong className="text-white">Rauch</strong>"
                </p>
              </div>
            </div>

            {/* SIMILAR STORY */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-gray-700 rounded text-xs font-bold text-rose-400">
                  {similarStories[activeCompareIndex].match}% MATCH
                </span>
                <span className="text-gray-500 text-sm">
                  {similarStories[activeCompareIndex].author} • {similarStories[activeCompareIndex].location}
                </span>
              </div>
              <div className="space-y-3 text-gray-300">
                <p>"Es war mitten in der Nacht, im Keller..."</p>
                <p className="bg-rose-500/10 border-l-4 border-rose-500 pl-3 py-1">
                  "<strong className="text-white">{similarStories[activeCompareIndex].quote}</strong>"
                </p>
                {activeCompareIndex === 0 && (
                  <>
                    <p className="bg-rose-500/10 border-l-4 border-rose-500 pl-3 py-1">
                      "Dunkler als <strong className="text-white">Schwarz</strong>"
                    </p>
                    <p className="bg-rose-500/10 border-l-4 border-rose-500 pl-3 py-1">
                      "Verschwand einfach, wie <strong className="text-white">Nebel</strong>"
                    </p>
                  </>
                )}
              </div>
              <button className="mt-4 text-sm text-rose-400 hover:underline">
                Vollständige Geschichte lesen →
              </button>
            </div>
          </div>

          {/* Match Explanation */}
          <div className="mt-6 bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">
              <span className="text-rose-400 font-medium">🧠 KI-Analyse:</span> Diese Erfahrungen teilen
              <span className="text-white"> "gesichtslose schwarze Gestalt"</span>,
              <span className="text-white"> "Gefühl beobachtet zu werden"</span>, und
              <span className="text-white"> "plötzliches Verschwinden"</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CLUSTER INSIGHTS                            */}
      {/* What do all 248 reports have in common?     */}
      {/* ============================================ */}
      <section className="py-12 px-8">
        <div className="max-w-5xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>V4 NEU - Cluster Insights:</strong> Diese Story im KONTEXT aller 248 Berichte.
              Timeline, Hotspots, gemeinsame Faktoren. Data-driven validation!
            </Annotation>
          )}

          <h2 className="text-xl font-semibold mb-6 text-center">
            Was haben alle <span className="text-rose-400">248 Berichte</span> gemeinsam?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* TIMELINE */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <span>📈</span> Zeitliche Verteilung
              </h3>
              {/* Mini Timeline Chart */}
              <div className="h-24 flex items-end gap-1">
                {[4, 6, 3, 8, 12, 15, 10, 18, 22, 25, 20, 28].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t opacity-70 hover:opacity-100 transition"
                    style={{ height: `${h * 3}%` }}
                    title={`${2012 + i}: ${h} Berichte`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>2012</span>
                <span>2024</span>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                📍 Diese Story: Nov 2019 (Peak-Jahr)
              </p>
            </div>

            {/* HOTSPOT MAP */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <span>🗺️</span> Hotspot-Regionen
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Wien/Österreich</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-[45%] h-full bg-rose-500 rounded-full" />
                    </div>
                    <span className="text-rose-400 text-sm">45</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Berlin/DE</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-[38%] h-full bg-rose-500 rounded-full" />
                    </div>
                    <span className="text-rose-400 text-sm">38</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">München/DE</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-[28%] h-full bg-rose-500 rounded-full" />
                    </div>
                    <span className="text-rose-400 text-sm">28</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                📍 Diese Story: Wien (Hotspot #1)
              </p>
            </div>

            {/* COMMON FACTORS */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <span>🔗</span> Gemeinsame Faktoren
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Nachts (22-04 Uhr)</span>
                    <span className="text-rose-400">89%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div className="w-[89%] h-full bg-rose-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Allein im Raum</span>
                    <span className="text-rose-400">94%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div className="w-[94%] h-full bg-rose-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Altes Gebäude</span>
                    <span className="text-rose-400">67%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div className="w-[67%] h-full bg-rose-500 rounded-full" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                ✓ Diese Story: 3/3 Faktoren
              </p>
            </div>
          </div>

          {/* Explore Cluster CTA */}
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-medium transition">
              🔍 Alle 248 Berichte im "Shadow People" Cluster erkunden
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE STORY (Now Secondary, in Context)       */}
      {/* ============================================ */}
      <section className="py-12 px-8 bg-gray-900/30">
        <div className="max-w-3xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>V4 - Story im Kontext:</strong> Die Story kommt NACH der Validation.
              User weiß bereits: "248 andere hatten das auch". Jetzt erst die Details.
            </Annotation>
          )}

          <div className="text-center mb-6">
            <p className="text-rose-400 text-sm mb-2">#127 von 248 im Shadow People Cluster</p>
            <h2 className="text-2xl font-semibold">Die vollständige Geschichte</h2>
          </div>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {/* Author Header */}
            <div className="p-6 border-b border-gray-800 flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/100?img=5"
                className="w-14 h-14 rounded-full border-2 border-rose-500"
                alt="Avatar"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">Maria K.</p>
                  <span className="text-rose-400 text-sm">Level 12</span>
                  <span className="px-2 py-0.5 bg-amber-500/30 rounded text-amber-300 text-xs">⭐ Trusted</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 rounded text-amber-300 text-xs">👥 2 Zeugen</span>
                </div>
                <p className="text-xs text-gray-400">Wien, Österreich • 15. November 2019, 23:45</p>
              </div>
            </div>

            {/* Teaser always visible */}
            <div className="p-6 border-b border-gray-800 bg-gray-800/30">
              <p className="text-gray-300 leading-relaxed">
                Eine Frau sieht nachts auf dem Dachboden eine schwarze, gesichtslose Gestalt.
                Obwohl keine Gesichtszüge erkennbar sind, hat sie das intensive Gefühl, beobachtet
                zu werden. Die Erscheinung löst sich nach wenigen Sekunden wie Rauch auf.
              </p>
            </div>

            {/* Expandable Full Story */}
            <button
              onClick={() => setStoryExpanded(!storyExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition"
            >
              <span className="font-medium flex items-center gap-2">
                📖 {storyExpanded ? 'Geschichte einklappen' : 'Vollständige Geschichte lesen'}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${storyExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {storyExpanded && (
              <div className="px-6 pb-6 text-gray-300 space-y-4 leading-relaxed border-t border-gray-800 pt-6">
                <p>
                  Es war kurz vor Mitternacht. Ich konnte nicht schlafen – zu viele Gedanken.
                  Also beschloss ich, auf den Dachboden zu gehen, um alte Fotoalben zu suchen.
                </p>
                <p>
                  Die Holztreppe knarrte unter meinen Füßen. Oben war es stockdunkel, nur das
                  schwache Mondlicht fiel durch das kleine Fenster...
                </p>
                <p className="text-white font-medium text-xl border-l-4 border-rose-500 pl-4">
                  Dann sah ich es. Eine Gestalt. Direkt vor mir.
                </p>
                <p>
                  Komplett schwarz. Nicht wie ein Schatten – <em>schwärzer</em> als die Dunkelheit.
                  Ich <strong>wusste</strong>, dass sie mich ansah.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* QUICK ACTIONS BAR                           */}
      {/* ============================================ */}
      <section className="py-8 px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-5 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-medium transition flex items-center gap-2">
              ✋ Das habe ich auch erlebt
            </button>
            <button className="px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition flex items-center gap-2">
              ↗ Teilen
            </button>
            <button className="px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition flex items-center gap-2">
              ☆ Speichern
            </button>
            <button className="px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition flex items-center gap-2">
              💬 23 Kommentare
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA - JOIN THE CLUSTER                      */}
      {/* ============================================ */}
      <section className="py-16 px-8">
        <div className="max-w-3xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>V4 CTA - "Werde Teil des Clusters":</strong> Nicht nur "Teile deine Story",
              sondern: Werde Teil einer GEMEINSCHAFT von 248 Menschen mit ähnlicher Erfahrung.
            </Annotation>
          )}

          <div className="bg-gradient-to-br from-rose-900/50 to-purple-900/50 rounded-3xl p-8 md:p-12 border border-rose-500/30 text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Werde Teil des Clusters
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              248 Menschen haben eine Shadow Person gesehen. Wenn du auch dazugehörst,
              teile deine Geschichte und verbinde dich mit anderen, die das Gleiche erlebt haben.
            </p>

            {/* Visual: Your spot in the network */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full" />
                <div className="w-3 h-3 bg-gray-600 rounded-full" />
                <div className="w-3 h-3 bg-gray-600 rounded-full" />
                <div className="w-4 h-4 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-gray-500 mx-2">←</span>
                <span className="text-rose-400">Dein Platz</span>
              </div>
            </div>

            <button className="px-8 py-4 bg-rose-600 hover:bg-rose-500 rounded-xl font-semibold text-lg transition shadow-lg shadow-rose-500/20">
              Meine Erfahrung teilen →
            </button>
            <p className="text-xs text-gray-500 mt-4">
              100% anonym • KI findet ähnliche Erfahrungen • Werde Teil von 249
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================
// VERSION 5: THE PHENOMENON HUB
// Revolutionary: Phenomenon-centric, not post-centric
// ============================================
function Version5({ showAnnotations }: { showAnnotations: boolean }) {
  const [activeCase, setActiveCase] = useState(127)
  const [expandedStory, setExpandedStory] = useState(false)
  const [activeTheory, setActiveTheory] = useState(0)

  // Evidence cases for the gallery
  const evidenceCases = [
    { id: 123, author: 'Thomas B.', location: 'Salzburg', match: 91, year: 2018 },
    { id: 124, author: 'Julia W.', location: 'Graz', match: 88, year: 2020 },
    { id: 125, author: 'Stefan M.', location: 'Wien', match: 92, year: 2019 },
    { id: 126, author: 'Lisa T.', location: 'München', match: 85, year: 2021 },
    { id: 127, author: 'Maria K.', location: 'Wien', match: 87, year: 2019 },
    { id: 128, author: 'Max R.', location: 'Berlin', match: 78, year: 2022 },
    { id: 129, author: 'Anna S.', location: 'Hamburg', match: 71, year: 2017 },
    { id: 130, author: 'Felix H.', location: 'Köln', match: 83, year: 2023 },
    { id: 131, author: 'Sophie L.', location: 'Zürich', match: 79, year: 2020 },
  ]

  // Research theories
  const theories = [
    { name: 'Hypnagogie', support: 67, source: 'Mavromatis 1987', desc: 'Halluzinationen im Halbschlaf' },
    { name: 'Schlafparalyse', support: 82, source: 'Cheyne 2001', desc: 'Lähmung + Präsenz-Gefühl' },
    { name: 'Gestalt-Archetyp', support: 45, source: 'Jung 1959', desc: 'Kollektives Unbewusstes' },
    { name: 'Elektromagnetisch', support: 23, source: 'Persinger 2001', desc: 'EMF-induzierte Wahrnehmung' },
  ]

  return (
    <>
      {/* ============================================ */}
      {/* PHENOMENON HERO                             */}
      {/* The phenomenon is the star, not the story   */}
      {/* ============================================ */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Atmospheric Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-gray-950 to-purple-950/30" />
          <div className="absolute inset-0 opacity-20">
            {/* Subtle pattern overlay */}
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(251,191,36,0.1)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* Floating silhouettes in background */}
          <div className="absolute top-1/4 left-1/4 w-32 h-48 bg-black/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-24 h-36 bg-black/30 rounded-full blur-2xl" />
        </div>

        <div className="relative w-full px-8 py-16 max-w-6xl mx-auto">
          {showAnnotations && (
            <Annotation color="amber">
              <strong>V5 REVOLUTION - Phenomenon Hub:</strong> Das PHÄNOMEN ist der Star, nicht die einzelne Story!
              Die Seite ist eine lebende Forschungszentrale für alle 248 dokumentierten Fälle.
            </Annotation>
          )}

          {/* Live Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-amber-200">
                <strong>LIVE:</strong> 5 Forscher erkunden gerade dieses Phänomen
              </span>
            </div>
          </div>

          {/* Phenomenon Title */}
          <div className="text-center mb-8">
            <p className="text-amber-400/60 text-sm tracking-[0.3em] uppercase mb-2">Dokumentiertes Phänomen</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                SHADOW PEOPLE
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Gesichtslose, schwarze Gestalten die nachts erscheinen und beobachten.
              Dokumentiert weltweit, über Kulturen hinweg.
            </p>
          </div>

          {/* Key Stats */}
          <div className="flex justify-center gap-6 md:gap-12 flex-wrap mb-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white">248</p>
              <p className="text-amber-400 text-sm">Dokumentierte Fälle</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white">2012</p>
              <p className="text-amber-400 text-sm">Erste Meldung</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white">47</p>
              <p className="text-amber-400 text-sm">Länder</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white">2019</p>
              <p className="text-amber-400 text-sm">Peak Jahr</p>
            </div>
          </div>

          {/* Active Researchers */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/40?img=${i + 10}`}
                    className="w-8 h-8 rounded-full border-2 border-gray-900"
                    alt=""
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm ml-2">+243 Forscher in dieser Community</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* COLLECTIVE INTELLIGENCE                     */}
      {/* AI synthesis from ALL 248 reports           */}
      {/* ============================================ */}
      <section className="py-16 px-8 bg-gradient-to-b from-gray-900/50 to-gray-950">
        <div className="max-w-6xl mx-auto">
          {showAnnotations && (
            <Annotation color="amber">
              <strong>V5 NEU - Collective Intelligence:</strong> KI hat ALLE 248 Berichte analysiert
              und synthetisiert das "typische Erlebnis". Das ist der wahre Wert von XP Share!
            </Annotation>
          )}

          <h2 className="text-2xl font-semibold text-center mb-2">
            <span className="text-amber-400">🧠</span> Kollektive Erkenntnis
          </h2>
          <p className="text-gray-400 text-center mb-8">KI-Synthese aus 248 Berichten</p>

          {/* The Typical Experience - AI Generated */}
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/10 rounded-3xl p-8 border border-amber-500/20 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-300 text-sm font-medium">
                🤖 KI-generiert
              </span>
              <span className="text-gray-500 text-sm">Basierend auf 248 Berichten</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Das typische Shadow People Erlebnis:</h3>
            <blockquote className="text-lg text-gray-300 leading-relaxed border-l-4 border-amber-500 pl-6">
              "Eine Person ist <strong className="text-white">allein</strong> (94% der Fälle), meist <strong className="text-white">nachts zwischen 23:00 und 03:00</strong> (89%).
              Sie bemerkt plötzlich eine <strong className="text-white">humanoide Gestalt</strong> - tiefschwarz, dunkler als die umgebende Dunkelheit.
              <strong className="text-white">Keine erkennbaren Gesichtszüge</strong>, aber das intensive, unerschütterliche Gefühl, <strong className="text-white">beobachtet zu werden</strong>.
              Die Erscheinung bleibt typischerweise <strong className="text-white">3-10 Sekunden</strong> sichtbar, bevor sie sich <strong className="text-white">wie Rauch auflöst</strong> oder
              abrupt verschwindet."
            </blockquote>
          </div>

          {/* Visual Data Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Word Cloud / Common Phrases */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <span>💬</span> Häufigste Beschreibungen
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { word: 'schwarz', size: 'text-2xl', count: 234 },
                  { word: 'beobachtet', size: 'text-xl', count: 198 },
                  { word: 'gesichtslos', size: 'text-xl', count: 187 },
                  { word: 'Schatten', size: 'text-lg', count: 156 },
                  { word: 'verschwunden', size: 'text-lg', count: 142 },
                  { word: 'Rauch', size: 'text-base', count: 89 },
                  { word: 'Ecke', size: 'text-base', count: 78 },
                  { word: 'Tür', size: 'text-sm', count: 67 },
                  { word: 'humanoid', size: 'text-sm', count: 56 },
                ].map((item, i) => (
                  <span
                    key={i}
                    className={`${item.size} text-amber-400/80 hover:text-amber-300 cursor-pointer transition`}
                    title={`${item.count} Erwähnungen`}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <span>🗺️</span> Hotspot-Regionen
              </h3>
              <div className="space-y-3">
                {[
                  { region: 'Österreich', count: 45, pct: 18 },
                  { region: 'Deutschland', count: 89, pct: 36 },
                  { region: 'Schweiz', count: 28, pct: 11 },
                  { region: 'USA', count: 52, pct: 21 },
                  { region: 'UK', count: 34, pct: 14 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm w-24">{item.region}</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-orange-500 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="text-amber-400 text-sm w-8">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <span>📈</span> Zeitliche Entwicklung
              </h3>
              <div className="h-32 flex items-end gap-1">
                {[
                  { year: '12', count: 8 },
                  { year: '13', count: 12 },
                  { year: '14', count: 15 },
                  { year: '15', count: 18 },
                  { year: '16', count: 22 },
                  { year: '17', count: 28 },
                  { year: '18', count: 35 },
                  { year: '19', count: 42 },
                  { year: '20', count: 31 },
                  { year: '21', count: 25 },
                  { year: '22', count: 18 },
                  { year: '23', count: 14 },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t transition-all ${
                        item.year === '19' ? 'bg-amber-500' : 'bg-amber-600/50 hover:bg-amber-500/70'
                      }`}
                      style={{ height: `${item.count * 2.5}%` }}
                      title={`20${item.year}: ${item.count} Berichte`}
                    />
                    <span className="text-[10px] text-gray-500 mt-1">{item.year}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Peak: 2019 (42 Berichte)</p>
            </div>
          </div>

          {/* Common Factors */}
          <div className="mt-6 bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="font-medium mb-4 text-center">Gemeinsame Faktoren in allen 248 Berichten</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { factor: 'Nachts (22-04h)', pct: 89, icon: '🌙' },
                { factor: 'Allein im Raum', pct: 94, icon: '👤' },
                { factor: 'Altes Gebäude', pct: 67, icon: '🏚️' },
                { factor: 'Vor dem Schlafen', pct: 72, icon: '😴' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-2xl font-bold text-amber-400">{item.pct}%</div>
                  <div className="text-sm text-gray-400">{item.factor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* EVIDENCE GALLERY                            */}
      {/* All 248 cases as equal evidence pieces      */}
      {/* ============================================ */}
      <section className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {showAnnotations && (
            <Annotation color="amber">
              <strong>V5 NEU - Evidence Gallery:</strong> Alle 248 Fälle sind GLEICHWERTIG.
              Keine Story ist wichtiger als andere. Du scrollst durch die Beweislage wie ein Forscher.
            </Annotation>
          )}

          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                <span className="text-amber-400">📁</span> Dokumentierte Fälle
              </h2>
              <p className="text-gray-400 text-sm">248 Berichte • Alle gleichwertig</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                <option>Zeit ▾</option>
                <option>Neueste zuerst</option>
                <option>Älteste zuerst</option>
              </select>
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                <option>Region ▾</option>
                <option>Österreich</option>
                <option>Deutschland</option>
                <option>Schweiz</option>
              </select>
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                <option>Match % ▾</option>
                <option>{">"} 90%</option>
                <option>{">"} 80%</option>
                <option>{">"} 70%</option>
              </select>
            </div>
          </div>

          {/* Horizontal Scroll Gallery */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-gray-800">
              {evidenceCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCase(c.id)}
                  className={`flex-shrink-0 w-40 p-4 rounded-xl border-2 transition-all ${
                    activeCase === c.id
                      ? 'bg-amber-500/20 border-amber-500 scale-105'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">Fall #{c.id}</div>
                  <div className="font-medium text-white mb-1">{c.author}</div>
                  <div className="text-xs text-gray-400 mb-2">{c.location} • {c.year}</div>
                  <div className={`text-sm font-medium ${activeCase === c.id ? 'text-amber-400' : 'text-gray-500'}`}>
                    {c.match}% Match
                  </div>
                  {activeCase === c.id && (
                    <div className="mt-2 text-xs text-amber-400 font-medium">▲ AKTIV</div>
                  )}
                </button>
              ))}
            </div>
            {/* Scroll indicators */}
            <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />
          </div>

          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              ← Scrolle um alle 248 Fälle zu sehen • Du liest: <span className="text-amber-400">Fall #{activeCase}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CURRENT CASE DETAIL                         */}
      {/* The story, framed as evidence               */}
      {/* ============================================ */}
      <section className="py-12 px-8 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          {showAnnotations && (
            <Annotation color="amber">
              <strong>V5 - Fall als Beweisstück:</strong> Die Story ist geframed als "Fall #127" -
              ein Beweisstück in einer größeren Untersuchung. Navigation zu anderen Fällen prominent!
            </Annotation>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Metadata Sidebar */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="text-amber-400 text-sm font-medium mb-4">FALL #{activeCase}</div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Dokumentiert von</p>
                  <div className="flex items-center gap-3 mt-2">
                    <img src="https://i.pravatar.cc/60?img=5" className="w-12 h-12 rounded-full" alt="" />
                    <div>
                      <p className="font-medium">Maria K.</p>
                      <p className="text-xs text-gray-400">Level 12 • Trusted</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Ort</span>
                    <span className="text-white text-sm">Wien, Österreich</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Datum</span>
                    <span className="text-white text-sm">15. Nov 2019</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Uhrzeit</span>
                    <span className="text-white text-sm">23:45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Zeugen</span>
                    <span className="text-white text-sm">2 bestätigt</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Dauer</span>
                    <span className="text-white text-sm">~5 Sekunden</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Phänomen-Match</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div className="w-[87%] h-full bg-gradient-to-r from-amber-600 to-orange-500 rounded-full" />
                    </div>
                    <span className="text-amber-400 font-bold">87%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Übereinstimmung mit dem typischen Shadow People Muster
                  </p>
                </div>

                {/* Navigation to other cases */}
                <div className="border-t border-gray-800 pt-4 flex gap-2">
                  <button
                    onClick={() => setActiveCase(Math.max(123, activeCase - 1))}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                  >
                    ← #{activeCase - 1}
                  </button>
                  <button
                    onClick={() => setActiveCase(Math.min(131, activeCase + 1))}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                  >
                    #{activeCase + 1} →
                  </button>
                </div>
              </div>
            </div>

            {/* The Report Content */}
            <div className="md:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-gray-800/30">
                <h3 className="text-xl font-semibold mb-2">Bericht #{activeCase}</h3>
                <p className="text-gray-400">
                  "Schattengestalt auf dem Dachboden"
                </p>
              </div>

              <div className="p-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Es war kurz vor Mitternacht. Ich konnte nicht schlafen – zu viele Gedanken.
                    Also beschloss ich, auf den Dachboden zu gehen, um alte Fotoalben zu suchen.
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Die Holztreppe knarrte unter meinen Füßen. Oben war es stockdunkel, nur das
                    schwache Mondlicht fiel durch das kleine Fenster.
                  </p>

                  {/* Highlighted matching phrases */}
                  <div className="my-6 space-y-3">
                    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <p className="text-white font-medium">
                        "Dann sah ich es. Eine Gestalt. <mark className="bg-amber-500/30 text-white px-1 rounded">Komplett schwarz</mark>."
                      </p>
                      <p className="text-xs text-amber-400 mt-2">↳ Matcht mit 234 anderen Berichten</p>
                    </div>
                    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <p className="text-white font-medium">
                        "Nicht wie ein Schatten – <mark className="bg-amber-500/30 text-white px-1 rounded">schwärzer als die Dunkelheit</mark> selbst."
                      </p>
                      <p className="text-xs text-amber-400 mt-2">↳ Matcht mit 156 anderen Berichten</p>
                    </div>
                    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <p className="text-white font-medium">
                        "Ich <mark className="bg-amber-500/30 text-white px-1 rounded">WUSSTE</mark>, dass sie mich <mark className="bg-amber-500/30 text-white px-1 rounded">ansah</mark>."
                      </p>
                      <p className="text-xs text-amber-400 mt-2">↳ Matcht mit 198 anderen Berichten</p>
                    </div>
                  </div>

                  {expandedStory && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Ich konnte mich nicht bewegen. Wollte schreien, aber kein Laut kam heraus.
                        Die Gestalt stand einfach da, vielleicht zwei Meter entfernt.
                      </p>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Dann, nach vielleicht fünf Sekunden – die sich wie eine Ewigkeit anfühlten –
                        löste sie sich auf. Wie Rauch, der in die Wände sickert.
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        Ich rannte die Treppe hinunter und habe den Dachboden seitdem nicht mehr betreten.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setExpandedStory(!expandedStory)}
                  className="mt-4 text-amber-400 hover:text-amber-300 text-sm flex items-center gap-2"
                >
                  {expandedStory ? '↑ Weniger anzeigen' : '↓ Vollständigen Bericht lesen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* RESEARCH CORNER                             */}
      {/* Theories, Literature, Discussion            */}
      {/* ============================================ */}
      <section className="py-12 px-8">
        <div className="max-w-5xl mx-auto">
          {showAnnotations && (
            <Annotation color="amber">
              <strong>V5 NEU - Research Corner:</strong> Wissenschaftliche Theorien, Literatur,
              Community-Diskussion. XP Share als FORSCHUNGSPLATTFORM, nicht nur Story-Sharing!
            </Annotation>
          )}

          <h2 className="text-xl font-semibold text-center mb-2">
            <span className="text-amber-400">🔬</span> Forschungsbereich
          </h2>
          <p className="text-gray-400 text-center mb-8">Theorien, Literatur & Community-Diskussion</p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Theories */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <span>💡</span> Theorien
              </h3>
              <div className="space-y-3">
                {theories.map((theory, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTheory(i)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      activeTheory === i
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-white">{theory.name}</span>
                      <span className="text-amber-400 text-sm">{theory.support}%</span>
                    </div>
                    <p className="text-xs text-gray-400">{theory.desc}</p>
                    <p className="text-xs text-gray-500 mt-1">Quelle: {theory.source}</p>
                  </button>
                ))}
              </div>
              <button className="mt-4 w-full py-2 border border-dashed border-gray-700 rounded-lg text-sm text-gray-400 hover:border-amber-500 hover:text-amber-400 transition">
                + Eigene Theorie vorschlagen
              </button>
            </div>

            {/* Literature */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <span>📚</span> Wissenschaftliche Literatur
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'The Terror That Comes in the Night', author: 'Hufford, 1982', type: 'Buch' },
                  { title: 'Sleep Paralysis: Night-mares', author: 'Cheyne et al., 2001', type: 'Studie' },
                  { title: 'Shadow People Phenomena', author: 'Adler, 2011', type: 'Paper' },
                  { title: 'Neurological Basis of Presence', author: 'Blanke, 2014', type: 'Studie' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-gray-800 rounded-lg">
                    <p className="font-medium text-white text-sm">{item.title}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{item.author}</span>
                      <span className="text-xs text-amber-400">{item.type}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 border border-dashed border-gray-700 rounded-lg text-sm text-gray-400 hover:border-amber-500 hover:text-amber-400 transition">
                + Ressource hinzufügen
              </button>
            </div>

            {/* Discussion */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <span>💬</span> Community-Diskussion
              </h3>
              <div className="space-y-3">
                {[
                  { user: 'Stefan M.', msg: 'Hat jemand das auch bei Vollmond erlebt?', replies: 12, time: '2h' },
                  { user: 'Lisa T.', msg: 'Zusammenhang mit Schlafmangel?', replies: 8, time: '5h' },
                  { user: 'Max R.', msg: 'Kulturelle Unterschiede in der Beschreibung', replies: 23, time: '1d' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-white text-sm">{item.user}</span>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                    <p className="text-sm text-gray-300">{item.msg}</p>
                    <p className="text-xs text-amber-400 mt-2">💬 {item.replies} Antworten</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition">
                Am Forum teilnehmen →
              </button>
            </div>
          </div>

          {/* Open Questions */}
          <div className="mt-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-2xl p-6 border border-amber-500/20">
            <h3 className="font-medium mb-4 text-center">❓ Offene Forschungsfragen</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Warum fast immer nachts?',
                'Warum keine erkennbaren Gesichter?',
                'Gibt es kulturelle Unterschiede?',
                'Zusammenhang mit Stress/Schlafmangel?',
                'Warum das Gefühl "beobachtet zu werden"?',
                'Warum lösen sie sich "wie Rauch" auf?',
              ].map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-amber-400">•</span>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA: CONTRIBUTE TO PHENOMENON               */}
      {/* Not "share your story" but "contribute"     */}
      {/* ============================================ */}
      <section className="py-16 px-8 bg-gradient-to-b from-gray-950 to-amber-950/20">
        <div className="max-w-3xl mx-auto">
          {showAnnotations && (
            <Annotation color="amber">
              <strong>V5 CTA Revolution:</strong> Nicht "Teile deine Story" (me-centric),
              sondern "Trage zum Verständnis bei" (science-centric). Der User wird zum FORSCHER!
            </Annotation>
          )}

          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔬</div>
            <h2 className="text-3xl font-bold mb-4">
              Zu diesem Phänomen <span className="text-amber-400">beitragen</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Hast du auch eine Shadow Person gesehen? Deine Erfahrung könnte helfen,
              dieses mysteriöse Phänomen besser zu verstehen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button className="p-6 bg-amber-600 hover:bg-amber-500 rounded-2xl transition group">
              <div className="text-2xl mb-2">📝</div>
              <p className="font-semibold">Fall dokumentieren</p>
              <p className="text-sm text-amber-100/70 mt-1">Werde Fall #249</p>
            </button>
            <button className="p-6 bg-gray-800 hover:bg-gray-700 rounded-2xl border border-gray-700 transition">
              <div className="text-2xl mb-2">💡</div>
              <p className="font-semibold">Theorie vorschlagen</p>
              <p className="text-sm text-gray-400 mt-1">Eigene Hypothese teilen</p>
            </button>
            <button className="p-6 bg-gray-800 hover:bg-gray-700 rounded-2xl border border-gray-700 transition">
              <div className="text-2xl mb-2">💬</div>
              <p className="font-semibold">Diskutieren</p>
              <p className="text-sm text-gray-400 mt-1">Im Forum mitreden</p>
            </button>
          </div>

          {/* Visual: Your spot in the research */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 rounded-full border border-amber-500/30">
              <div className="flex -space-x-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-3 h-3 bg-amber-600/50 rounded-full" />
                ))}
              </div>
              <span className="text-gray-400">...</span>
              <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 font-medium">← Dein Platz als #249</span>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              100% anonym • KI-gestützte Analyse • Trage zur Forschung bei
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================
// VERSION 6: LIMINAL ARCHIVE
// Digital Consciousness Portal - Reality-centric design
// Experiences as "fragments" revealing hidden patterns
// ============================================
function Version6({ showAnnotations }: { showAnnotations: boolean }) {
  const [activeFragment, setActiveFragment] = useState(127)
  const [glitchActive, setGlitchActive] = useState(false)
  const [expandedFragment, setExpandedFragment] = useState(false)
  const [activeProtocol, setActiveProtocol] = useState(0)

  // Fragment data
  const fragments = [
    { id: 127, witness: 'Anonym_127', timestamp: '2024-01-15 03:47', correlation: 87, excerpt: 'Ich sah es wieder letzte Nacht. Der gleiche große Schatten in meiner Tür...' },
    { id: 89, witness: 'Nachtwächter_89', timestamp: '2024-01-12 02:23', correlation: 92, excerpt: 'Die Gestalt erschien am Fußende meines Bettes, völlig regungslos...' },
    { id: 234, witness: 'Beobachter_234', timestamp: '2024-01-10 04:15', correlation: 78, excerpt: 'Eine dunkle Masse, die das Licht um sich herum zu absorbieren schien...' },
    { id: 56, witness: 'Wächter_56', timestamp: '2024-01-08 03:02', correlation: 84, excerpt: 'Es stand im Flur, größer als der Türrahmen...' },
    { id: 198, witness: 'Zeuge_198', timestamp: '2024-01-05 02:48', correlation: 71, excerpt: 'Keine Merkmale, nur Dunkelheit in menschlicher Form...' },
    { id: 312, witness: 'Schläfer_312', timestamp: '2024-01-02 03:33', correlation: 89, excerpt: 'Die Präsenz fühlte sich uralt an, als wäre sie schon immer dagewesen...' },
  ]

  const protocols = [
    { name: 'THEORIEN', count: 4, icon: '◇', desc: 'Aktive Hypothesen unter Untersuchung' },
    { name: 'LITERATUR', count: 12, icon: '◈', desc: 'Akademische Arbeiten und historische Aufzeichnungen' },
    { name: 'DISKUSSION', count: 34, icon: '◉', desc: 'Community-Analyse-Threads' },
    { name: 'FELDNOTIZEN', count: 8, icon: '◎', desc: 'Untersuchungsberichte aus erster Hand' },
  ]

  const signalMetrics = [
    { label: 'NACHTAKTIV', value: 73, desc: 'Nächtliches Auftreten' },
    { label: 'SCHATTEN', value: 89, desc: 'Visuelle Manifestation' },
    { label: 'PRÄSENZ', value: 67, desc: 'Sensorische Wahrnehmung' },
    { label: 'PARALYSE', value: 45, desc: 'Körperliche Wirkung' },
  ]

  const activeFragmentData = fragments.find(f => f.id === activeFragment)

  return (
    <>
      {/* ============================================ */}
      {/* SECTION 1: PORTAL HERO                      */}
      {/* ============================================ */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated grain overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-violet-950/30 to-gray-950" />

        {/* Glitch lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-violet-500/30"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
                right: 0,
                transform: `translateX(${Math.sin(i) * 10}px)`,
                animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>V6 PARADIGMA:</strong> XP Share als "Liminal Archive" - ein kollektives Bewusstseinsarchiv
              das Grenzen zwischen bekannter und unbekannter Realität dokumentiert. Jede Experience ist ein FRAGMENT/PORTAL.
            </Annotation>
          )}

          {/* Archive Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full mb-6 font-mono text-xs text-violet-400">
              <span className="animate-pulse">░░░</span>
              <span>LIMINAL ARCHIVE</span>
              <span className="animate-pulse">░░░</span>
            </div>

            <p className="font-mono text-sm text-gray-500 tracking-widest mb-4">
              ZUGRIFF AUF FRAGMENT #{activeFragment}
            </p>
          </div>

          {/* Glitch Visual Area */}
          <div
            className="relative mx-auto mb-8 w-full max-w-md aspect-square rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setGlitchActive(!glitchActive)}
            onMouseEnter={() => setGlitchActive(true)}
            onMouseLeave={() => setGlitchActive(false)}
          >
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-violet-950/50 to-gray-900" />

            {/* Shadow figure visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`relative w-32 h-64 transition-all duration-500 ${glitchActive ? 'scale-105' : ''}`}
              >
                {/* Shadow body */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-transparent rounded-t-full opacity-80" />
                {/* Glitch effect on hover */}
                {glitchActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-900/50 via-transparent to-transparent rounded-t-full animate-pulse" />
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4 h-4 bg-violet-500/50 rounded-full blur-sm animate-ping" />
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-2 h-2 bg-violet-400 rounded-full" />
                  </>
                )}
              </div>
            </div>

            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 92, 246, 0.1) 2px, rgba(139, 92, 246, 0.1) 4px)',
              }}
            />

            {/* Corner markers */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-violet-500/50" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-violet-500/50" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-violet-500/50" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-violet-500/50" />

            {/* Interact hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-mono text-violet-400/50 group-hover:text-violet-400 transition">
              [ INTERAGIEREN ]
            </div>
          </div>

          {/* Phenomenon Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-violet-400 font-mono">REALITÄTSBRUCH:</span>
            <br />
            <span className="text-white">SCHATTENPRÄSENZ</span>
          </h1>

          {/* Archive Stats */}
          <div className="flex items-center justify-center gap-6 text-sm font-mono text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
              <span>248 FRAGMENTE</span>
            </div>
            <div className="text-violet-500">|</div>
            <div>AKTIV: VOR 12 STD</div>
            <div className="text-violet-500">|</div>
            <div className="text-violet-400">SIGNAL: STARK</div>
          </div>

          {/* Enter Archive CTA */}
          <button className="group relative px-8 py-4 bg-violet-600/20 border border-violet-500/50 rounded-lg font-mono text-violet-300 hover:bg-violet-600/30 hover:border-violet-400 transition-all">
            <span className="relative z-10">[ ARCHIV BETRETEN ]</span>
            <div className="absolute inset-0 bg-violet-500/10 rounded-lg blur-xl group-hover:bg-violet-500/20 transition" />
          </button>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: COLLECTIVE SIGNAL                */}
      {/* ============================================ */}
      <section className="py-16 px-8 border-t border-violet-500/20">
        <div className="max-w-4xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>SIGNAL ANALYSIS:</strong> KI-Synthese als "Signalauswertung" framed -
              die kollektive Intelligenz des Archivs destilliert Muster aus 248 Fragmenten.
            </Annotation>
          )}

          <div className="flex items-center gap-3 mb-6">
            <span className="text-violet-400 font-mono text-lg">⟨</span>
            <h2 className="text-xl font-mono text-violet-300 tracking-wide">SIGNALANALYSE</h2>
            <span className="text-violet-400 font-mono text-lg">⟩</span>
          </div>

          {/* AI Synthesis Box */}
          <div className="relative bg-gray-900/50 border border-violet-500/20 rounded-lg p-6 mb-8">
            <div className="absolute top-0 left-4 -translate-y-1/2 px-2 bg-gray-950 text-xs font-mono text-violet-400">
              SYNTHESE // KONFIDENZ: 82%
            </div>

            <blockquote className="text-gray-300 leading-relaxed font-mono text-sm">
              "248 Bewusstseinsfragmente zeigen ein konsistentes Muster: <span className="text-violet-400">periphere Erkennung</span> mit
              Berichten über erste Wahrnehmung durch indirektes Sehen. <span className="text-violet-400">Zeitliche Häufung zwischen 3-4 Uhr</span> deutet auf
              Korrelation mit liminalem Zustand hin. Starke <span className="text-violet-400">emotionale Resonanz mit Trauer, Isolation oder großen Lebensübergängen</span>.
              Physische Manifestation typischerweise beschrieben als <span className="text-violet-400">2-2,5m groß, humanoide Silhouette, fehlende Gesichtszüge</span>."
            </blockquote>

            {/* Confidence meter */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs font-mono text-gray-500">KONFIDENZ</span>
              <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full" style={{ width: '82%' }} />
              </div>
              <span className="text-xs font-mono text-violet-400">82%</span>
            </div>
          </div>

          {/* Signal Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {signalMetrics.map((metric, i) => (
              <div
                key={i}
                className="bg-gray-900/30 border border-dashed border-violet-500/20 rounded-lg p-4 text-center hover:border-violet-500/40 transition"
              >
                <div className="text-3xl font-mono font-bold text-violet-400 mb-1">{metric.value}%</div>
                <div className="text-xs font-mono text-gray-400 tracking-wider">{metric.label}</div>
                <div className="text-xs text-gray-500 mt-1">{metric.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: FRAGMENT MATRIX                  */}
      {/* ============================================ */}
      <section className="py-16 px-8 bg-gray-900/30 border-t border-violet-500/20">
        <div className="max-w-5xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>FRAGMENT MATRIX:</strong> Grid-Darstellung statt Gallery - jedes Fragment ist gleichwertig,
              aber das aktive Fragment ist hervorgehoben. Archiv-Ästhetik mit Correlation Scores.
            </Annotation>
          )}

          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-mono text-violet-300 flex items-center gap-2">
              <span className="text-violet-500">◈</span>
              FRAGMENT-MATRIX
            </h2>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button className="px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded text-violet-300 hover:bg-violet-500/30 transition">
                KORRELATION ↓
              </button>
              <button className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-gray-400 hover:border-violet-500/30 transition">
                ZEITLICH
              </button>
              <button className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-gray-400 hover:border-violet-500/30 transition">
                AKTUELL
              </button>
            </div>
          </div>

          {/* Fragment Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {fragments.map((fragment) => (
              <button
                key={fragment.id}
                onClick={() => setActiveFragment(fragment.id)}
                className={`relative aspect-square rounded-lg border transition-all ${
                  activeFragment === fragment.id
                    ? 'bg-violet-500/20 border-violet-500 scale-105'
                    : 'bg-gray-900/50 border-gray-700 hover:border-violet-500/50'
                }`}
              >
                {/* Fragment ID */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-xs text-gray-500">#{fragment.id}</span>
                  <span className={`text-2xl mt-1 ${activeFragment === fragment.id ? 'text-violet-400' : 'text-gray-600'}`}>
                    {activeFragment === fragment.id ? '◉' : '◎'}
                  </span>
                </div>

                {/* Correlation badge */}
                <div className={`absolute bottom-1 right-1 text-xs font-mono px-1 rounded ${
                  fragment.correlation >= 85 ? 'text-violet-400' : 'text-gray-500'
                }`}>
                  {fragment.correlation}%
                </div>

                {/* Active indicator */}
                {activeFragment === fragment.id && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* More fragments indicator */}
          <div className="mt-4 text-center">
            <button className="text-xs font-mono text-gray-500 hover:text-violet-400 transition">
              + 242 WEITERE FRAGMENTE IM ARCHIV
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: ACTIVE FRAGMENT                  */}
      {/* ============================================ */}
      <section className="py-16 px-8 border-t border-violet-500/20">
        <div className="max-w-4xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>ACTIVE FRAGMENT:</strong> Das ausgewählte Fragment wird als "Witness Report"
              dargestellt - klinisch, dokumentarisch, mit Metadata und Pattern Matches.
            </Annotation>
          )}

          <div className="bg-gray-900/50 border border-violet-500/20 rounded-lg overflow-hidden">
            {/* Fragment Header */}
            <div className="px-6 py-4 border-b border-violet-500/20 flex items-center justify-between">
              <h3 className="font-mono text-violet-300 flex items-center gap-2">
                <span className="text-violet-500">◈</span>
                FRAGMENT #{activeFragmentData?.id}
                <span className="text-xs text-gray-500 ml-2">━━━━━━━━━━━━━━━━━━━━━━━</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-mono text-green-400">VERIFIZIERT</span>
              </div>
            </div>

            {/* Fragment Metadata */}
            <div className="px-6 py-4 border-b border-gray-800 grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-500">ZEUGE:</span>
                <span className="text-gray-300 ml-2">{activeFragmentData?.witness}</span>
              </div>
              <div>
                <span className="text-gray-500">ZEITSTEMPEL:</span>
                <span className="text-gray-300 ml-2">{activeFragmentData?.timestamp} UTC</span>
              </div>
              <div>
                <span className="text-gray-500">ORT:</span>
                <span className="text-violet-400 ml-2">[KOORDINATEN VERSCHLÜSSELT]</span>
              </div>
            </div>

            {/* Fragment Content */}
            <div className="px-6 py-6">
              <div className="bg-gray-950/50 border border-dashed border-gray-700 rounded-lg p-6">
                <p className={`text-gray-300 leading-relaxed ${expandedFragment ? '' : 'line-clamp-3'}`}>
                  "{activeFragmentData?.excerpt} Das Gefühl war überwältigend - nicht genau Angst, aber ein tiefes
                  Gefühl, beobachtet zu werden. Es dauerte vielleicht 30 Sekunden, bevor es in der Dunkelheit verschwand.
                  Als ich auf die Uhr schaute, war es genau 3:47 Uhr. Ich habe drei ähnliche Begegnungen
                  im letzten Monat dokumentiert, immer zwischen 3-4 Uhr, immer in derselben Türöffnung."
                </p>
                <button
                  onClick={() => setExpandedFragment(!expandedFragment)}
                  className="mt-4 text-xs font-mono text-violet-400 hover:text-violet-300 transition"
                >
                  {expandedFragment ? '[ EINKLAPPEN ]' : '[ VOLLSTÄNDIG LESEN ]'}
                </button>
              </div>
            </div>

            {/* Pattern Matches */}
            <div className="px-6 py-4 border-t border-gray-800 bg-violet-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-gray-400">MUSTER-TREFFER:</span>
                  <span className="font-mono text-lg text-violet-400">23 ähnliche Fragmente</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">KORRELATION</span>
                  <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${activeFragmentData?.correlation}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-violet-400">{activeFragmentData?.correlation}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: INVESTIGATION HUB                */}
      {/* ============================================ */}
      <section className="py-16 px-8 bg-gray-900/30 border-t border-violet-500/20">
        <div className="max-w-4xl mx-auto">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>INVESTIGATION PROTOCOLS:</strong> Research Corner als "Investigation Hub" -
              User können Theorien erkunden, Literatur lesen, diskutieren und Field Notes beitragen.
            </Annotation>
          )}

          <h2 className="text-xl font-mono text-violet-300 flex items-center gap-2 mb-8">
            <span className="text-violet-500">◈</span>
            UNTERSUCHUNGSPROTOKOLLE
          </h2>

          {/* Protocol Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {protocols.map((protocol, i) => (
              <button
                key={i}
                onClick={() => setActiveProtocol(i)}
                className={`p-6 rounded-lg border text-left transition-all ${
                  activeProtocol === i
                    ? 'bg-violet-500/10 border-violet-500/50'
                    : 'bg-gray-900/50 border-gray-700 hover:border-violet-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl text-violet-400">{protocol.icon}</span>
                  <span className="font-mono text-xs text-gray-500">{protocol.count} ENTRIES</span>
                </div>
                <h3 className="font-mono text-lg text-white mb-2">{protocol.name}</h3>
                <p className="text-sm text-gray-400">{protocol.desc}</p>

                {/* Loading bar animation */}
                <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeProtocol === i ? 'bg-violet-500 w-full' : 'bg-gray-700 w-0'
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Active Protocol Preview */}
          <div className="bg-gray-950/50 border border-dashed border-violet-500/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-violet-400">{protocols[activeProtocol].icon}</span>
              <span className="font-mono text-sm text-violet-300">{protocols[activeProtocol].name}</span>
              <span className="flex-1 border-t border-dashed border-gray-700 mx-2" />
              <span className="text-xs font-mono text-gray-500">VORSCHAU</span>
            </div>

            {activeProtocol === 0 && (
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-900/50 rounded border border-gray-800">
                  <span className="text-violet-400 font-mono">THEORIE_001:</span>
                  <span className="text-gray-300 ml-2">Schlafparalyse mit hypnagogen Halluzinationen</span>
                  <span className="text-xs text-gray-500 ml-2">(67% Community-Zustimmung)</span>
                </div>
                <div className="p-3 bg-gray-900/50 rounded border border-gray-800">
                  <span className="text-violet-400 font-mono">THEORIE_002:</span>
                  <span className="text-gray-300 ml-2">Elektromagnetische Feldsensitivität</span>
                  <span className="text-xs text-gray-500 ml-2">(23% Community-Zustimmung)</span>
                </div>
              </div>
            )}
            {activeProtocol === 1 && (
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-900/50 rounded border border-gray-800">
                  <span className="text-gray-400">📄</span>
                  <span className="text-violet-400 font-mono ml-2">Cheyne et al. (1999)</span>
                  <span className="text-gray-300 ml-2">"Die Schattenleute: Hypnagoge Erfahrungen"</span>
                </div>
                <div className="p-3 bg-gray-900/50 rounded border border-gray-800">
                  <span className="text-gray-400">📄</span>
                  <span className="text-violet-400 font-mono ml-2">Hufford, D. (2005)</span>
                  <span className="text-gray-300 ml-2">"Schlafparalyse als spirituelle Erfahrung"</span>
                </div>
              </div>
            )}
            {activeProtocol === 2 && (
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-900/50 rounded border border-gray-800">
                  <span className="text-green-400">●</span>
                  <span className="text-gray-300 ml-2">"Sieht jemand anderes sie auch in der Nähe von Spiegeln?"</span>
                  <span className="text-xs text-gray-500 ml-2">— 23 Antworten, vor 2 Std.</span>
                </div>
                <div className="p-3 bg-gray-900/50 rounded border border-gray-800">
                  <span className="text-green-400">●</span>
                  <span className="text-gray-300 ml-2">"Zusammenhang zwischen Trauer und Sichtungen?"</span>
                  <span className="text-xs text-gray-500 ml-2">— 45 Antworten, vor 5 Std.</span>
                </div>
              </div>
            )}
            {activeProtocol === 3 && (
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-900/50 rounded border border-gray-800">
                  <span className="text-yellow-400">◆</span>
                  <span className="text-violet-400 font-mono ml-2">BERICHT_008:</span>
                  <span className="text-gray-300 ml-2">EMF-Messungen während der Begegnung (Wien, AT)</span>
                </div>
                <div className="p-3 bg-gray-900/50 rounded border border-gray-800">
                  <span className="text-yellow-400">◆</span>
                  <span className="text-violet-400 font-mono ml-2">BERICHT_007:</span>
                  <span className="text-gray-300 ml-2">Audioanalyse: Infraschall-Erkennung</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: CONTRIBUTION PORTAL              */}
      {/* ============================================ */}
      <section className="py-20 px-8 border-t border-violet-500/20 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(139, 92, 246, 0.1) 1px, rgba(139, 92, 246, 0.1) 2px)',
            backgroundSize: '100% 4px',
          }} />
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          {showAnnotations && (
            <Annotation color="purple">
              <strong>CONTRIBUTION PORTAL:</strong> CTA als "Fragment Submission" framed -
              User stärken das "Signal" des Archives durch ihre Beiträge. Mysterious, einladend.
            </Annotation>
          )}

          <div className="text-center">
            {/* Portal frame */}
            <div className="inline-block p-8 border border-dashed border-violet-500/30 rounded-lg bg-violet-500/5">
              <div className="font-mono text-xs text-violet-400/50 mb-4 tracking-widest">
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">
                HAST DU DIESES PHÄNOMEN ERLEBT?
              </h2>

              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Dein Fragment verstärkt das Signal. Schließe dich 248 Zeugen an, die diesen Realitätsbruch dokumentieren.
              </p>

              <button className="group relative px-8 py-4 bg-violet-600 hover:bg-violet-500 rounded-lg font-mono text-white transition-all">
                <span className="relative z-10 flex items-center gap-2">
                  <span>[ FRAGMENT EINREICHEN ]</span>
                  <span className="opacity-0 group-hover:opacity-100 transition">→</span>
                </span>
              </button>

              <div className="font-mono text-xs text-violet-400/50 mt-4 tracking-widest">
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
              </div>
            </div>

            {/* Archive position indicator */}
            <div className="mt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-full border border-violet-500/20">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-3 h-3 bg-violet-600/50 rounded-full" />
                  ))}
                </div>
                <span className="text-gray-500 font-mono text-xs">...</span>
                <div className="w-4 h-4 bg-violet-500 rounded-full animate-pulse" />
                <span className="text-violet-400 font-mono text-sm">← DEINE POSITION: #249</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6 font-mono">
              ANONYM • KI-ANALYSIERT • VERSCHLÜSSELTE KOORDINATEN • STÄRKE DAS ARCHIV
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================
// VERSION 7 - "NEXUS" CINEMATIC EXPERIENCE DETAIL
// Dark cinematic style with 4-act storytelling
// ============================================
function Version7({ showAnnotations }: { showAnnotations: boolean }) {
  const [activeConnection, setActiveConnection] = useState<number | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Mock data for the experience
  const experience = {
    id: 'xp-2847',
    title: 'Die Lichter über dem Schwarzwald',
    category: 'ufo',
    date: '2024-01-15',
    time: '03:47',
    location: 'Schwarzwald, Deutschland',
    duration: '12 Minuten',
    story: `Es war eine klare Winternacht. Ich konnte nicht schlafen und stand auf dem Balkon unserer Berghütte. Der Himmel war voller Sterne - so klar wie selten.

Dann bemerkte ich sie. Drei Lichter, die sich in perfekter Formation bewegten. Keine Flugzeuge - zu leise, zu synchron. Sie schwebten etwa 500 Meter über dem Wald, pulsierend in einem sanften Blau.

Plötzlich beschleunigten sie - unmöglich schnell - und verschwanden hinter dem Berg. Das Ganze dauerte vielleicht 12 Minuten, aber es fühlte sich wie eine Ewigkeit an.`,
    emotions: ['Staunen', 'Ehrfurcht', 'Aufregung'],
    attributes: {
      shape: 'Dreieck-Formation',
      color: 'Blaues Pulsieren',
      movement: 'Synchron, dann explosive Beschleunigung',
      sound: 'Absolute Stille',
      witnesses: 1,
    },
    author: {
      name: 'SternWächter_47',
      level: 12,
      badges: 8,
      avatar: '🌟',
    },
    validation: {
      score: 87,
      detail: 92,
      consistency: 85,
      correlation: 84,
    },
  }

  // Similar experiences for the network
  const connections = [
    { id: 1, title: 'Lichter über München', similarity: 92, type: 'vector', attributes: ['Dreieck', 'Nacht', 'Blau'], date: '2024-01-12' },
    { id: 2, title: 'Formation über den Alpen', similarity: 87, type: 'vector', attributes: ['Formation', 'Stille', 'Winter'], date: '2024-01-08' },
    { id: 3, title: 'Das blaue Leuchten', similarity: 78, type: 'attribute', attributes: ['Blau', 'Pulsierend'], date: '2023-12-28' },
    { id: 4, title: 'Schwarzwald-Anomalie', similarity: 95, type: 'geographic', attributes: ['Schwarzwald', 'Nacht'], date: '2023-11-15' },
    { id: 5, title: 'Stille Beobachter', similarity: 71, type: 'attribute', attributes: ['Stille', 'Formation'], date: '2023-10-22' },
    { id: 6, title: 'Winterlichter', similarity: 68, type: 'temporal', attributes: ['Winter', 'Nacht', '3-4 Uhr'], date: '2024-01-14' },
  ]

  // Category-specific colors
  const categoryColors: Record<string, { primary: string; glow: string; bg: string }> = {
    ufo: { primary: 'cyan', glow: 'shadow-cyan-500/50', bg: 'from-cyan-950/50' },
    paranormal: { primary: 'purple', glow: 'shadow-purple-500/50', bg: 'from-purple-950/50' },
    dreams: { primary: 'pink', glow: 'shadow-pink-500/50', bg: 'from-pink-950/50' },
    synchronicity: { primary: 'amber', glow: 'shadow-amber-500/50', bg: 'from-amber-950/50' },
  }
  const colors = categoryColors[experience.category] || categoryColors.ufo

  return (
    <>
      {/* ============================================ */}
      {/* ACT I: THE HOOK - CINEMATIC HERO            */}
      {/* ============================================ */}
      <section className="relative min-h-screen bg-[#0a0a0f] overflow-hidden">
        {showAnnotations && (
          <div className="absolute top-4 left-4 right-4 z-20">
            <Annotation color="blue">
              <strong>ACT I: THE HOOK</strong> - Fullscreen Cinematic Hero. Die Experience ist der Star.
              Category-spezifische Partikel-Animation im Hintergrund. Parallax auf Mausbewegung.
            </Annotation>
          </div>
        )}

        {/* Animated Background - Particle Field */}
        <div className="absolute inset-0">
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-b ${colors.bg} via-transparent to-[#0a0a0f]`} />

          {/* Animated Particles (CSS-based for mockup) */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-${colors.primary}-400 rounded-full opacity-40`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/2 w-40 h-40 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          {/* Category Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-8 ${colors.glow} shadow-lg`}>
            <span className="text-2xl">🛸</span>
            <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">UFO / UAP</span>
          </div>

          {/* Title - Cinematic Typography */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            <span className="block bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              {experience.title}
            </span>
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 mb-12">
            <span className="flex items-center gap-2">
              <span className="text-cyan-500">📍</span>
              {experience.location}
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center gap-2">
              <span className="text-cyan-500">📅</span>
              {new Date(experience.date).toLocaleDateString('de-DE')}
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center gap-2">
              <span className="text-cyan-500">⏱️</span>
              {experience.duration}
            </span>
          </div>

          {/* Author Mini Card */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/50 rounded-full border border-gray-800">
            <span className="text-2xl">{experience.author.avatar}</span>
            <div className="text-left">
              <div className="text-white font-medium">{experience.author.name}</div>
              <div className="text-xs text-gray-500">Level {experience.author.level} • {experience.author.badges} Badges</div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-gray-500 text-sm">Scroll für mehr</span>
            <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ACT II: THE STORY - Progressive Reveal      */}
      {/* ============================================ */}
      <section className="relative bg-[#0a0a0f] py-24 px-6">
        {showAnnotations && (
          <Annotation color="emerald">
            <strong>ACT II: THE STORY</strong> - Progressive Disclosure. Die Geschichte wird Schritt für Schritt
            enthüllt. Cinematische Typografie mit Pull-Quotes. Emotionale Context-Tags am Rand.
          </Annotation>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Story Section */}
          <div className="relative">
            {/* Emotion Sidebar */}
            <div className="absolute -left-24 top-0 hidden xl:flex flex-col gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider mb-2">Emotionen</span>
              {experience.emotions.map((emotion, i) => (
                <span key={i} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm">
                  {emotion}
                </span>
              ))}
            </div>

            {/* Story Text */}
            <article className="prose prose-invert prose-lg max-w-none">
              {experience.story.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-gray-300 leading-relaxed text-lg mb-6 first:text-xl first:text-white">
                  {paragraph}
                </p>
              ))}
            </article>

            {/* Pull Quote */}
            <blockquote className="relative my-12 pl-6 border-l-4 border-cyan-500">
              <p className="text-2xl text-cyan-100 italic font-light">
                "Sie schwebten etwa 500 Meter über dem Wald, pulsierend in einem sanften Blau."
              </p>
              <div className="absolute -left-2 top-0 w-4 h-4 bg-cyan-500 rounded-full animate-pulse" />
            </blockquote>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
              <div className="text-center p-4">
                <div className="text-cyan-400 text-2xl mb-2">△</div>
                <div className="text-white font-medium">{experience.attributes.shape}</div>
                <div className="text-gray-500 text-sm">Form</div>
              </div>
              <div className="text-center p-4">
                <div className="text-cyan-400 text-2xl mb-2">◉</div>
                <div className="text-white font-medium">{experience.attributes.color}</div>
                <div className="text-gray-500 text-sm">Farbe</div>
              </div>
              <div className="text-center p-4">
                <div className="text-cyan-400 text-2xl mb-2">→</div>
                <div className="text-white font-medium text-sm">{experience.attributes.movement}</div>
                <div className="text-gray-500 text-sm">Bewegung</div>
              </div>
              <div className="text-center p-4">
                <div className="text-cyan-400 text-2xl mb-2">◎</div>
                <div className="text-white font-medium">{experience.attributes.sound}</div>
                <div className="text-gray-500 text-sm">Geräusch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ACT III: THE REVELATION - Pattern Network   */}
      {/* ============================================ */}
      <section className="relative bg-[#0a0a0f] py-24 px-6">
        {showAnnotations && (
          <Annotation color="purple">
            <strong>ACT III: THE REVELATION</strong> - Der dramatische Moment. "Du bist nicht allein..."
            Das 3D-ähnliche Netzwerk zeigt Verbindungen. Jeder Node ist klickbar und erklärt WARUM ähnlich.
          </Annotation>
        )}

        {/* Dramatic Transition */}
        <div className="text-center mb-16">
          <p className="text-gray-500 text-lg mb-4 animate-pulse">Du bist nicht allein...</p>
          <div className="text-5xl md:text-7xl font-bold text-white mb-4">
            <span className="text-cyan-400">{connections.length}</span> ähnliche Erfahrungen
          </div>
          <p className="text-gray-400">weltweit dokumentiert</p>
        </div>

        {/* Network Visualization (CSS-based mockup) */}
        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-square max-w-2xl mx-auto">
            {/* Center Node (Current Experience) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-pulse">
                  <span className="text-3xl">🛸</span>
                </div>
                <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-amber-400 font-medium text-sm">DEINE ERFAHRUNG</span>
                </div>
              </div>
            </div>

            {/* Connection Nodes */}
            {connections.map((conn, i) => {
              const angle = (i / connections.length) * 2 * Math.PI - Math.PI / 2
              const radius = 45 // percentage from center
              const x = 50 + radius * Math.cos(angle)
              const y = 50 + radius * Math.sin(angle)

              const typeColors: Record<string, string> = {
                vector: 'bg-purple-500 shadow-purple-500/50',
                attribute: 'bg-green-500 shadow-green-500/50',
                geographic: 'bg-teal-500 shadow-teal-500/50',
                temporal: 'bg-orange-500 shadow-orange-500/50',
              }

              return (
                <div key={conn.id}>
                  {/* Connection Line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                      x1="50%"
                      y1="50%"
                      x2={`${x}%`}
                      y2={`${y}%`}
                      stroke={conn.type === 'vector' ? '#9b59b6' : conn.type === 'geographic' ? '#16a085' : conn.type === 'temporal' ? '#f39c12' : '#2ecc71'}
                      strokeWidth={conn.similarity > 85 ? 3 : 2}
                      strokeOpacity={conn.similarity / 100}
                      strokeDasharray={conn.type === 'attribute' ? '5,5' : 'none'}
                    />
                  </svg>

                  {/* Node */}
                  <button
                    onClick={() => setActiveConnection(activeConnection === conn.id ? null : conn.id)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 z-10"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className={`relative w-12 h-12 ${typeColors[conn.type]} rounded-full flex items-center justify-center shadow-lg cursor-pointer ${activeConnection === conn.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]' : ''}`}>
                      <span className="text-white font-bold text-sm">{conn.similarity}%</span>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-gray-400">Semantisch ähnlich</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-400">Attribut-Match</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full" />
              <span className="text-gray-400">Geografisch nah</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-gray-400">Zeitlich korreliert</span>
            </div>
          </div>
        </div>

        {/* Selected Connection Detail */}
        {activeConnection && (
          <div className="max-w-2xl mx-auto mt-12 p-6 bg-gray-900/80 rounded-2xl border border-gray-700 backdrop-blur-sm">
            {(() => {
              const conn = connections.find(c => c.id === activeConnection)
              if (!conn) return null
              return (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{conn.title}</h3>
                      <p className="text-gray-400 text-sm">{new Date(conn.date).toLocaleDateString('de-DE')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">{conn.similarity}%</div>
                      <div className="text-gray-500 text-sm">Übereinstimmung</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-gray-400 text-sm mb-2">WARUM ÄHNLICH:</div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all"
                            style={{ width: `${conn.similarity}%` }}
                          />
                        </div>
                        <span className="text-cyan-400 font-mono text-sm">{conn.similarity}%</span>
                      </div>
                      <div className="text-gray-500 text-sm capitalize">{conn.type === 'vector' ? 'Semantische Ähnlichkeit' : conn.type === 'geographic' ? 'Geografische Nähe' : conn.type === 'temporal' ? 'Zeitliche Korrelation' : 'Attribut-Übereinstimmung'}</div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm mb-2">GEMEINSAME ATTRIBUTE:</div>
                      <div className="flex flex-wrap gap-2">
                        {conn.attributes.map((attr, i) => (
                          <span key={i} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm">
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition">
                    Erfahrung ansehen →
                  </button>
                </>
              )
            })()}
          </div>
        )}
      </section>

      {/* ============================================ */}
      {/* ACT IV: THE IMPACT - Validation & Community */}
      {/* ============================================ */}
      <section className="relative bg-[#0a0a0f] py-24 px-6">
        {showAnnotations && (
          <Annotation color="amber">
            <strong>ACT IV: THE IMPACT</strong> - Validation Score als visuelles Highlight.
            Ring-Chart Animation. Community-Sektion mit XP Twins und Kommentaren.
          </Annotation>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Validation Score */}
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">Validierungs-Score</h2>

            {/* Animated Ring Chart */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="12"
                />
                {/* Progress Circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${experience.validation.score * 5.53} 553`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white">{experience.validation.score}%</span>
                <span className="text-gray-400 text-sm">Validiert</span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="text-2xl font-bold text-cyan-400">{experience.validation.detail}%</div>
                <div className="text-gray-500 text-sm">Detailgrad</div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="text-2xl font-bold text-cyan-400">{experience.validation.consistency}%</div>
                <div className="text-gray-500 text-sm">Konsistenz</div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="text-2xl font-bold text-cyan-400">{experience.validation.correlation}%</div>
                <div className="text-gray-500 text-sm">Korrelation</div>
              </div>
            </div>
          </div>

          {/* XP Twins Section */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Menschen wie du</h3>
            <div className="flex justify-center -space-x-3">
              {['🌙', '⭐', '🔮', '👁️', '✨'].map((emoji, i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-gray-800 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-xl hover:scale-110 hover:z-10 transition cursor-pointer"
                >
                  {emoji}
                </div>
              ))}
              <div className="w-12 h-12 bg-cyan-600 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-white text-sm font-bold hover:scale-110 hover:z-10 transition cursor-pointer">
                +42
              </div>
            </div>
            <p className="text-center text-gray-500 mt-4">47 Menschen hatten ähnliche Erlebnisse</p>
          </div>

          {/* Comments Preview */}
          <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Diskussion</h3>
              <span className="text-gray-400">12 Kommentare</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-lg">🌌</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">NachtHimmel_23</span>
                    <span className="text-gray-500 text-sm">vor 2 Stunden</span>
                  </div>
                  <p className="text-gray-300">Unglaublich detailliert! Die Beschreibung der synchronen Bewegung klingt genau wie meine Sichtung letztes Jahr.</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-3 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition">
              Alle 12 Kommentare anzeigen
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA SECTION                                  */}
      {/* ============================================ */}
      <section className="relative bg-gradient-to-b from-[#0a0a0f] to-cyan-950/20 py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hattest du auch eine außergewöhnliche Erfahrung?
          </h2>
          <p className="text-gray-400 mb-8">
            Teile sie mit der Community und entdecke Verbindungen zu anderen Erlebnissen.
          </p>
          <button className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-lg transition shadow-lg shadow-cyan-500/25">
            Erfahrung teilen →
          </button>
          <p className="text-gray-500 text-sm mt-4">
            ⬡ NEXUS • KI-gestützte Mustererkennung • Anonyme Teilnahme möglich
          </p>
        </div>
      </section>
    </>
  )
}

// ============================================
// VERSION 8: ARCANA - MYSTICAL ORACLE INTERFACE
// Radikal anders: Kein Scroll, Card-based, Tarot-Metapher
// ============================================
function Version8({ showAnnotations }: { showAnnotations: boolean }) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [activeRune, setActiveRune] = useState<number | null>(null)

  // Mock data - Die Erfahrung als mystische Karte
  const mainCard = {
    numeral: 'XIII',
    title: 'Die Lichter über dem Schwarzwald',
    arcana: 'DER WANDERER',
    suit: 'ÄTHER', // UFO/UAP
    author: 'SternWächter_47',
    date: '15. Januar 2024',
    location: 'Schwarzwald, Deutschland',
    essence: 'Drei Lichter in Formation, pulsierend in sanftem Blau, dann explosive Beschleunigung ins Unbekannte.',
    keywords: ['Triangel', 'Blaues Licht', 'Stille', 'Beschleunigung', 'Ehrfurcht'],
  }

  // Die "Spread" - verbundene Erfahrungen als Karten-Lesung
  const spreadCards = [
    {
      position: 'VERGANGENHEIT',
      numeral: 'VII',
      title: 'Phoenix Lights 1997',
      match: 94,
      element: 'Feuer',
      meaning: 'Kollektive Sichtung, die alles veränderte',
    },
    {
      position: 'KREUZUNG',
      numeral: 'III',
      title: 'Belgische Welle 1990',
      match: 89,
      element: 'Luft',
      meaning: 'Das Dreieck als universelles Symbol',
    },
    {
      position: 'GEGENWART',
      numeral: 'XIII',
      title: 'Deine Erfahrung',
      match: 100,
      element: 'Äther',
      meaning: 'Der Moment der Erkenntnis',
    },
    {
      position: 'EINFLUSS',
      numeral: 'IX',
      title: 'Hessdalen Lichter',
      match: 87,
      element: 'Erde',
      meaning: 'Wiederkehrende Phänomene an heiligen Orten',
    },
    {
      position: 'ZUKUNFT',
      numeral: 'XXI',
      title: 'Die Vereinigung',
      match: 82,
      element: 'Wasser',
      meaning: '47 Seelen teilen dein Schicksal',
    },
  ]

  // Runen für die Attribute
  const runes = [
    { symbol: '△', name: 'URUZ', meaning: 'Formation', value: 'Dreieck' },
    { symbol: '◇', name: 'SOWILO', meaning: 'Licht', value: 'Blaues Pulsieren' },
    { symbol: '○', name: 'ISA', meaning: 'Stille', value: 'Absolute Ruhe' },
    { symbol: '→', name: 'RAIDHO', meaning: 'Reise', value: 'Beschleunigung' },
    { symbol: '∞', name: 'JERA', meaning: 'Zeit', value: '12 Minuten' },
  ]

  // Konstellationen - XP Twins
  const constellation = [
    { name: 'NachtHimmel_23', angle: 0, distance: 120, match: 92 },
    { name: 'Sternenstaub', angle: 45, distance: 100, match: 87 },
    { name: 'Waldgeist', angle: 90, distance: 140, match: 78 },
    { name: 'Lichtsucherin', angle: 135, distance: 90, match: 95 },
    { name: 'Grenzgänger', angle: 180, distance: 110, match: 71 },
    { name: 'Schattenjäger', angle: 225, distance: 130, match: 68 },
    { name: 'Mondwanderer', angle: 270, distance: 85, match: 88 },
    { name: 'Nebelwesen', angle: 315, distance: 105, match: 74 },
  ]

  // Suit Farben
  const suitColors: Record<string, string> = {
    'ÄTHER': 'from-cyan-500 to-blue-600',
    'SCHATTEN': 'from-purple-500 to-violet-700',
    'TRAUM': 'from-pink-500 to-rose-600',
    'GEIST': 'from-amber-500 to-orange-600',
  }

  return (
    <>
      {/* ============================================ */}
      {/* MYSTICAL BACKGROUND - Stars & Fog */}
      {/* ============================================ */}
      <div className="relative min-h-screen bg-[#0a0a12] overflow-hidden">
        {/* Animated Stars Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-200/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Mystical Fog Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-amber-900/10" />

        {/* Golden Border Frame */}
        <div className="absolute inset-4 border border-amber-500/20 rounded-3xl pointer-events-none" />
        <div className="absolute inset-8 border border-amber-500/10 rounded-2xl pointer-events-none" />

        {/* ============================================ */}
        {/* ANNOTATION: Konzept */}
        {/* ============================================ */}
        {showAnnotations && (
          <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8">
            <Annotation color="amber">
              <strong>V8: ARCANA</strong> - Radikal anderes Design! Keine Scroll-Page, sondern interaktives Tarot-Reading.
              Die Erfahrung ist eine mystische Karte mit Runen, Konstellationen und Oracle-Deutung.
              <span className="text-amber-300"> Metapher: Erfahrung als Orakel-Lesung.</span>
            </Annotation>
          </div>
        )}

        {/* ============================================ */}
        {/* SECTION 1: THE MAIN CARD - Central Tarot */}
        {/* ============================================ */}
        <section className="relative z-10 pt-8 pb-16">
          {showAnnotations && (
            <div className="max-w-4xl mx-auto px-4 mb-4">
              <Annotation color="purple">
                <strong>THE CARD</strong> - Die Erfahrung als Tarot-Karte. Keine Hero-Section, sondern eine mystische Karte
                mit Numeral, Arkana-Name und Essenz. Hover für Details. Klick zum "Wenden".
              </Annotation>
            </div>
          )}

          <div className="flex flex-col items-center justify-center px-4">
            {/* Main Tarot Card */}
            <div
              className={`relative cursor-pointer transition-all duration-700 transform-gpu
                ${isRevealed ? 'scale-100' : 'scale-95 hover:scale-100'}
              `}
              onClick={() => setIsRevealed(!isRevealed)}
            >
              {/* Card Glow */}
              <div className={`absolute -inset-4 bg-gradient-to-r ${suitColors[mainCard.suit]} opacity-30 blur-2xl rounded-3xl transition-opacity duration-500 ${isRevealed ? 'opacity-50' : 'opacity-20'}`} />

              {/* Card Frame */}
              <div className="relative w-72 md:w-80 aspect-[2/3] bg-gradient-to-b from-gray-900 via-gray-950 to-black rounded-2xl border-2 border-amber-500/50 shadow-2xl overflow-hidden">

                {/* Ornate Border Pattern */}
                <div className="absolute inset-2 border border-amber-500/30 rounded-xl" />
                <div className="absolute inset-4 border border-amber-500/20 rounded-lg" />

                {/* Top Numeral */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <span className="text-4xl font-serif text-amber-400/80">{mainCard.numeral}</span>
                  <span className="text-xs text-amber-500/60 font-serif tracking-widest">{mainCard.suit}</span>
                </div>

                {/* Center Illustration Area */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Mystical Symbol */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 border-2 border-cyan-400/40 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                      <div className="absolute w-24 h-24 border border-amber-400/30 rotate-45" />
                      <div className="absolute w-16 h-16 border border-purple-400/40 rounded-full" />
                      {/* Triangle in center */}
                      <svg className="absolute w-20 h-20 text-cyan-400/60" viewBox="0 0 100 100">
                        <polygon points="50,15 85,85 15,85" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      {/* Three lights */}
                      <div className="absolute w-3 h-3 bg-cyan-400 rounded-full top-8 left-1/2 -translate-x-1/2 animate-pulse shadow-lg shadow-cyan-400/50" />
                      <div className="absolute w-2.5 h-2.5 bg-cyan-300 rounded-full bottom-6 left-6 animate-pulse shadow-lg shadow-cyan-300/50" style={{ animationDelay: '0.3s' }} />
                      <div className="absolute w-2.5 h-2.5 bg-cyan-300 rounded-full bottom-6 right-6 animate-pulse shadow-lg shadow-cyan-300/50" style={{ animationDelay: '0.6s' }} />
                    </div>
                  </div>
                </div>

                {/* Arcana Name */}
                <div className="absolute bottom-20 left-0 right-0 text-center">
                  <p className="text-amber-400 text-xs tracking-[0.3em] font-serif mb-1">— {mainCard.arcana} —</p>
                </div>

                {/* Bottom: Title */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <h1 className="text-white font-serif text-sm leading-tight">
                    {mainCard.title}
                  </h1>
                  <p className="text-amber-500/60 text-xs mt-1">{mainCard.author}</p>
                </div>

                {/* Corner Ornaments */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-500/40 rounded-tl" />
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-500/40 rounded-tr" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-500/40 rounded-bl" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-500/40 rounded-br" />
              </div>
            </div>

            {/* Card Reveal Details */}
            <div className={`mt-8 max-w-lg text-center transition-all duration-500 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
              <p className="text-amber-100/80 font-serif italic text-lg leading-relaxed">
                "{mainCard.essence}"
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-amber-500/60">
                <span>📍 {mainCard.location}</span>
                <span className="text-amber-500/30">•</span>
                <span>📅 {mainCard.date}</span>
              </div>
            </div>

            {/* Instruction */}
            <p className="mt-6 text-amber-500/40 text-xs tracking-widest animate-pulse">
              — BERÜHRE DIE KARTE UM SIE ZU OFFENBAREN —
            </p>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 2: THE RUNES - Attribute Symbols */}
        {/* ============================================ */}
        <section className="relative z-10 py-16">
          {showAnnotations && (
            <div className="max-w-4xl mx-auto px-4 mb-6">
              <Annotation color="emerald">
                <strong>THE RUNES</strong> - Attribute als mystische Runen. Jedes Symbol repräsentiert einen Aspekt
                der Erfahrung. Hover zeigt die Bedeutung. Ersetzt die typische Attribut-Liste.
              </Annotation>
            </div>
          )}

          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-center text-amber-400/60 text-xs tracking-[0.4em] mb-8 font-serif">
              ✧ DIE RUNEN DER ERFAHRUNG ✧
            </h2>

            <div className="flex justify-center gap-6 md:gap-10 flex-wrap">
              {runes.map((rune, i) => (
                <div
                  key={i}
                  className="group relative cursor-pointer"
                  onMouseEnter={() => setActiveRune(i)}
                  onMouseLeave={() => setActiveRune(null)}
                >
                  {/* Rune Circle */}
                  <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-full border-2 transition-all duration-300
                    flex items-center justify-center
                    ${activeRune === i
                      ? 'border-amber-400 bg-amber-500/20 scale-110'
                      : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-400/60'
                    }
                  `}>
                    <span className={`text-2xl md:text-3xl transition-colors ${activeRune === i ? 'text-amber-300' : 'text-amber-500/60'}`}>
                      {rune.symbol}
                    </span>
                  </div>

                  {/* Rune Name */}
                  <p className="text-center text-amber-500/40 text-xs mt-2 tracking-wider">
                    {rune.name}
                  </p>

                  {/* Tooltip */}
                  <div className={`
                    absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 p-2
                    bg-gray-900/95 border border-amber-500/30 rounded-lg
                    text-center transition-all duration-300 pointer-events-none
                    ${activeRune === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                  `}>
                    <p className="text-amber-400 text-xs font-medium">{rune.meaning}</p>
                    <p className="text-amber-100/70 text-xs mt-1">{rune.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 3: THE SPREAD - Card Reading Layout */}
        {/* ============================================ */}
        <section className="relative z-10 py-16 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent">
          {showAnnotations && (
            <div className="max-w-4xl mx-auto px-4 mb-6">
              <Annotation color="purple">
                <strong>THE SPREAD</strong> - Ähnliche Erfahrungen als Tarot-Lesung! 5-Karten-Spread zeigt
                Vergangenheit, Kreuzung, Gegenwart, Einfluss, Zukunft. Jede Karte ist eine verwandte Erfahrung.
                <span className="text-purple-300"> Klicke auf eine Karte für Details.</span>
              </Annotation>
            </div>
          )}

          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-center text-amber-400/60 text-xs tracking-[0.4em] mb-2 font-serif">
              ✧ DAS MUSTER OFFENBART SICH ✧
            </h2>
            <p className="text-center text-purple-300/60 text-sm mb-12 font-serif italic">
              Du bist nicht allein... Die Karten sprechen von {spreadCards.length - 1} verwandten Schicksalen.
            </p>

            {/* 5-Card Spread Layout */}
            <div className="relative flex justify-center items-center gap-2 md:gap-4 flex-wrap">
              {spreadCards.map((card, i) => (
                <div
                  key={i}
                  className={`
                    relative cursor-pointer transition-all duration-500 transform
                    ${selectedCard === i ? 'scale-110 z-20' : 'hover:scale-105 z-10'}
                    ${i === 2 ? 'md:-translate-y-8' : ''} /* Center card elevated */
                  `}
                  onClick={() => setSelectedCard(selectedCard === i ? null : i)}
                >
                  {/* Card Glow for center */}
                  {i === 2 && (
                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-40 blur-xl rounded-xl" />
                  )}

                  {/* Mini Tarot Card */}
                  <div className={`
                    relative w-24 md:w-28 aspect-[2/3] rounded-xl border-2 overflow-hidden
                    transition-all duration-300
                    ${i === 2
                      ? 'bg-gradient-to-b from-cyan-900/80 to-purple-900/80 border-cyan-400/60'
                      : 'bg-gradient-to-b from-gray-900 to-gray-950 border-amber-500/30 hover:border-amber-400/60'
                    }
                    ${selectedCard === i ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-gray-950' : ''}
                  `}>
                    {/* Position Label */}
                    <div className="absolute top-2 left-0 right-0 text-center">
                      <span className={`text-[9px] tracking-wider ${i === 2 ? 'text-cyan-300' : 'text-amber-500/50'}`}>
                        {card.position}
                      </span>
                    </div>

                    {/* Numeral */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-serif ${i === 2 ? 'text-cyan-300' : 'text-amber-400/60'}`}>
                        {card.numeral}
                      </span>
                    </div>

                    {/* Match Percentage */}
                    <div className={`absolute bottom-8 left-0 right-0 text-center`}>
                      <span className={`text-xs font-bold ${i === 2 ? 'text-cyan-200' : 'text-amber-300'}`}>
                        {card.match}%
                      </span>
                    </div>

                    {/* Element Badge */}
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <span className="text-[8px] text-amber-500/40">{card.element}</span>
                    </div>
                  </div>

                  {/* Expanded Card Details */}
                  {selectedCard === i && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 p-3 bg-gray-900/95 border border-amber-500/30 rounded-xl z-30 text-center">
                      <h4 className="text-amber-300 text-sm font-serif mb-1">{card.title}</h4>
                      <p className="text-amber-100/60 text-xs italic">"{card.meaning}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Connecting Lines (SVG) */}
            <svg className="absolute inset-0 pointer-events-none hidden md:block" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="lineGradientArcana" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="rgb(251, 191, 36)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(251, 191, 36)" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 4: THE ORACLE - AI Interpretation */}
        {/* ============================================ */}
        <section className="relative z-10 py-16">
          {showAnnotations && (
            <div className="max-w-4xl mx-auto px-4 mb-6">
              <Annotation color="blue">
                <strong>THE ORACLE</strong> - Die KI als mystisches Orakel. Statt "AI Analysis" gibt es eine
                "Orakel-Deutung" der Muster. Mystische Sprache, aber echte Insights.
              </Annotation>
            </div>
          )}

          <div className="max-w-2xl mx-auto px-4">
            {/* Oracle Frame */}
            <div className="relative">
              {/* Decorative corners */}
              <div className="absolute -top-4 -left-4 w-12 h-12 border-l-2 border-t-2 border-amber-500/40" />
              <div className="absolute -top-4 -right-4 w-12 h-12 border-r-2 border-t-2 border-amber-500/40" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 border-l-2 border-b-2 border-amber-500/40" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-r-2 border-b-2 border-amber-500/40" />

              <div className="bg-gradient-to-b from-purple-950/50 to-gray-950/80 border border-amber-500/20 rounded-2xl p-8 text-center">
                {/* Oracle Eye */}
                <div className="w-16 h-16 mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-2 border-amber-400/40 rounded-full" />
                  <div className="absolute inset-3 border border-purple-400/40 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl">👁️</span>
                  </div>
                </div>

                <h3 className="text-amber-400 text-xs tracking-[0.4em] mb-4 font-serif">
                  ✧ DAS ORAKEL SPRICHT ✧
                </h3>

                <blockquote className="text-purple-100/90 font-serif italic text-lg leading-relaxed mb-6">
                  "Die Dreiecksformation erscheint als universelles Symbol - ein Archetyp,
                  der sich durch Zeit und Raum manifestiert. Von Phoenix bis zum Schwarzwald,
                  von 1990 bis heute: Das Muster wiederholt sich. Die blaue Lumineszenz
                  deutet auf eine Frequenz hin, die nur wenige wahrnehmen können..."
                </blockquote>

                {/* Confidence as mystical meter */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-amber-500/60 text-xs tracking-wider">KLARHEIT DER VISION</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-lg ${star <= 4 ? 'text-amber-400' : 'text-amber-500/20'}`}>
                        ✧
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-amber-500/40 text-xs">
                  Basierend auf 248 verwandten Fragmenten aus dem kollektiven Archiv
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 5: THE CONSTELLATION - XP Twins Map */}
        {/* ============================================ */}
        <section className="relative z-10 py-16">
          {showAnnotations && (
            <div className="max-w-4xl mx-auto px-4 mb-6">
              <Annotation color="amber">
                <strong>THE CONSTELLATION</strong> - XP Twins als Sternenkonstellation! Deine Erfahrung ist der
                Zentralstern, ähnliche User orbiten drumherum. Visueller als eine Liste. Klicke auf Sterne.
              </Annotation>
            </div>
          )}

          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-center text-amber-400/60 text-xs tracking-[0.4em] mb-8 font-serif">
              ✧ DEINE KONSTELLATION ✧
            </h2>

            {/* Constellation Map */}
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full border border-amber-500/10 rounded-full" />
                <div className="absolute w-3/4 h-3/4 border border-amber-500/10 rounded-full" />
                <div className="absolute w-1/2 h-1/2 border border-amber-500/10 rounded-full" />
                <div className="absolute w-1/4 h-1/4 border border-purple-500/20 rounded-full" />
              </div>

              {/* Center Star (You) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                  <div className="absolute -inset-4 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50">
                    <span className="text-black text-lg">★</span>
                  </div>
                  <p className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-amber-300 text-xs whitespace-nowrap font-serif">
                    DU
                  </p>
                </div>
              </div>

              {/* Orbiting Stars (XP Twins) */}
              {constellation.map((star, i) => {
                const x = Math.cos((star.angle * Math.PI) / 180) * star.distance
                const y = Math.sin((star.angle * Math.PI) / 180) * star.distance
                const size = Math.max(6, Math.min(12, star.match / 10))

                return (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                    }}
                  >
                    {/* Star */}
                    <div
                      className="rounded-full bg-gradient-to-br from-cyan-300 to-purple-400 animate-pulse shadow-lg shadow-cyan-400/30 transition-transform group-hover:scale-150"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900/95 border border-amber-500/30 rounded-lg px-3 py-2 whitespace-nowrap">
                        <p className="text-amber-300 text-xs font-medium">{star.name}</p>
                        <p className="text-cyan-300 text-xs">{star.match}% Resonanz</p>
                      </div>
                    </div>

                    {/* Connection Line to Center */}
                    <svg className="absolute top-1/2 left-1/2 pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity"
                         style={{ width: '200px', height: '200px', transform: 'translate(-50%, -50%)' }}>
                      <line
                        x1="100" y1="100"
                        x2={100 - x} y2={100 - y}
                        stroke="url(#constellationGrad)"
                        strokeWidth="1"
                      />
                      <defs>
                        <linearGradient id="constellationGrad">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 text-center">
              <p className="text-amber-400/60 text-sm font-serif">
                <span className="text-amber-300">47 Seelen</span> teilen deine Konstellation
              </p>
              <p className="text-purple-300/40 text-xs mt-1">
                Größere Sterne = Stärkere Resonanz
              </p>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 6: THE RITUAL - CTA */}
        {/* ============================================ */}
        <section className="relative z-10 py-20">
          <div className="max-w-xl mx-auto px-4 text-center">
            <h2 className="text-amber-400/80 text-xs tracking-[0.4em] mb-4 font-serif">
              ✧ DAS RITUAL FORTSETZEN ✧
            </h2>
            <p className="text-purple-100/70 font-serif italic text-lg mb-8">
              Hast auch du einen Blick hinter den Schleier geworfen?
            </p>

            {/* Mystical CTA Button */}
            <button className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity animate-pulse" />
              <div className="relative px-8 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-full text-black font-serif tracking-wider text-sm hover:from-amber-500 hover:to-amber-500 transition-all">
                ✧ FRAGMENT HINZUFÜGEN ✧
              </div>
            </button>

            <p className="mt-6 text-amber-500/30 text-xs tracking-wider">
              Deine Erfahrung wird Teil des ewigen Archivs
            </p>
          </div>
        </section>

        {/* ============================================ */}
        {/* FOOTER ORNAMENT */}
        {/* ============================================ */}
        <div className="relative z-10 py-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/30" />
            <span className="text-amber-500/40 text-xl">✧</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/30" />
          </div>
          <p className="mt-4 text-amber-500/20 text-xs font-serif tracking-widest">
            ARCANA • ORAKEL DER ERFAHRUNGEN
          </p>
        </div>
      </div>
    </>
  )
}

// ============================================
// VERSION 9 - "CASE FILE" INVESTIGATION DASHBOARD
// X-Files meets FBI Case Board meets True Crime
// ============================================
function Version9({ showAnnotations }: { showAnnotations: boolean }) {
  const [activeTab, setActiveTab] = useState<'narrative' | 'evidence' | 'patterns'>('narrative')
  const [detectiveMode, setDetectiveMode] = useState(true)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null)

  // Mock data for Case File
  const caseData = {
    caseNumber: 'XP-2024-1847',
    title: 'Die Lichter über dem Schwarzwald',
    status: 'ACTIVE',
    lastActivity: '2 Stunden',
    evidenceTier: 4,
    correlationScore: 87,
    similarCases: 248,
    date: '15. Januar 2024',
    time: '23:47 Uhr',
    location: 'Schwarzwald, Deutschland',
    duration: '18 Minuten',
    witnesses: 2,
    author: {
      name: 'SternWächter_47',
      avatar: '👤',
      level: 12,
      contributions: 47,
    },
  }

  const evidenceItems = [
    { type: 'photo', label: 'Foto', icon: '📷', timestamp: '23:47', description: 'Lichter am Himmel' },
    { type: 'sketch', label: 'Skizze', icon: '🎨', timestamp: '01:30', description: 'Dreiecksformation' },
    { type: 'audio', label: 'Audio', icon: '🎤', duration: '2:34', description: 'Summgeräusch' },
  ]

  const witnesses = [
    { name: 'SternWächter_47', role: 'Primärzeuge', verified: true },
    { name: 'Anonymous_12', role: 'Sekundärzeuge', verified: false },
  ]

  const externalLinks = [
    { type: 'news', label: 'Lokale Nachricht', icon: '📰', source: 'Schwarzwälder Bote' },
    { type: 'research', label: 'Forscher-Notiz', icon: '🔬', source: 'Dr. M. Weber' },
  ]

  const timeline = [
    { time: '23:45', type: 'observation', icon: '🔊', text: 'Summgeräusch bemerkt' },
    { time: '23:47', type: 'photo', icon: '📷', text: 'Foto aufgenommen', hasMedia: true },
    { time: '23:52', type: 'sketch', icon: '🎨', text: 'Skizze erstellt (später)', hasMedia: true },
    { time: '00:03', type: 'observation', icon: '👁️', text: 'Lichter beschleunigen & verschwinden' },
    { time: '00:15', type: 'report', icon: '📝', text: 'Erster Bericht eingereicht' },
  ]

  const evidenceStrength = [
    { factor: 'Foto-Evidence', value: 25, color: '#10b981' },
    { factor: 'Skizze', value: 15, color: '#3b82f6' },
    { factor: 'Multiple Zeugen', value: 20, color: '#8b5cf6' },
    { factor: 'Konsistenz', value: 8, color: '#f59e0b' },
  ]

  const correlations = [
    {
      title: 'Phoenix Lights 1997',
      match: 89,
      breakdown: { text: 45, shape: 30, time: 14 },
      location: 'Arizona, USA'
    },
    {
      title: 'Belgian Wave 1990',
      match: 82,
      breakdown: { text: 38, shape: 30, geographic: 14 },
      location: 'Belgien'
    },
    {
      title: 'Hessdalen Lichter',
      match: 78,
      breakdown: { text: 35, pattern: 28, time: 15 },
      location: 'Norwegen'
    },
  ]

  const nearbyCases = [
    { id: 1, distance: '12km', date: 'Dez 2023', match: 92 },
    { id: 2, distance: '34km', date: 'Jan 2024', match: 87 },
    { id: 3, distance: '48km', date: 'Nov 2023', match: 81 },
  ]

  const tierLabels = ['', 'Anekdotisch', 'Dokumentiert', 'Bestätigt', 'Verifiziert', 'Untersucht']
  const tierColors = ['', '#64748b', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

  return (
    <>
      {showAnnotations && (
        <Annotation color="amber">
          <strong>V9 "CASE FILE":</strong> Investigation Dashboard - Der User wird vom passiven Leser zum aktiven Ermittler.
          X-Files/FBI Case File Aesthetic mit 4-Panel Layout, Evidence Board, Score Transparency und Interactive Query Builder.
        </Annotation>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 font-mono" style={{ backgroundColor: '#0d1117' }}>
        {/* ============================================ */}
        {/* CASE FILE HEADER */}
        {/* ============================================ */}
        <header className="mb-6 p-6 rounded-lg border-2" style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
          {/* Top Row: Case Number + Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📁</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#d4a574', color: '#0d1117' }}>
                    CASE FILE
                  </span>
                  <span className="text-[#8b949e] text-sm">#{caseData.caseNumber}</span>
                </div>
                <h1 className="text-xl font-bold mt-1" style={{ color: '#e6edf3' }}>
                  {caseData.title}
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded hover:bg-[#30363d] transition" title="Teilen">
                <span className="text-[#8b949e]">🔗</span>
              </button>
              <button className="p-2 rounded hover:bg-[#30363d] transition" title="Speichern">
                <span className="text-[#8b949e]">⭐</span>
              </button>
              {/* Detective Mode Toggle */}
              <button
                onClick={() => setDetectiveMode(!detectiveMode)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-2 ${
                  detectiveMode
                    ? 'bg-[#d4a574] text-[#0d1117]'
                    : 'bg-[#30363d] text-[#8b949e]'
                }`}
              >
                {detectiveMode ? '🔍 Detective' : '👁️ Reader'}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {/* Evidence Tier */}
            <div className="p-3 rounded" style={{ backgroundColor: '#0d1117' }}>
              <div className="text-xs text-[#8b949e] mb-1">EVIDENCE TIER</div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-sm"
                      style={{
                        backgroundColor: i <= caseData.evidenceTier ? tierColors[caseData.evidenceTier] : '#30363d'
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold" style={{ color: tierColors[caseData.evidenceTier] }}>
                  {tierLabels[caseData.evidenceTier]}
                </span>
              </div>
            </div>

            {/* Correlation Score */}
            <div
              className="p-3 rounded cursor-pointer hover:ring-2 hover:ring-[#d4a574] transition"
              style={{ backgroundColor: '#0d1117' }}
              onClick={() => setShowScoreModal(true)}
            >
              <div className="text-xs text-[#8b949e] mb-1 flex items-center gap-1">
                CORRELATION
                <span className="text-[#d4a574]">ⓘ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={{ color: '#10b981' }}>
                  {caseData.correlationScore}%
                </span>
                <span className="text-xs text-[#8b949e]">
                  {caseData.similarCases} ähnliche Fälle
                </span>
              </div>
            </div>

            {/* Case Status */}
            <div className="p-3 rounded" style={{ backgroundColor: '#0d1117' }}>
              <div className="text-xs text-[#8b949e] mb-1">CASE STATUS</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-sm font-bold text-[#10b981]">{caseData.status}</span>
                <span className="text-xs text-[#8b949e]">• Vor {caseData.lastActivity}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================ */}
        {/* MAIN CONTENT: 2-Column Layout */}
        {/* ============================================ */}
        <div className="grid grid-cols-12 gap-6">
          {/* ============================================ */}
          {/* LEFT COLUMN: EVIDENCE BOARD */}
          {/* ============================================ */}
          <aside className="col-span-4">
            <div className="rounded-lg border-2 overflow-hidden" style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
              {/* Evidence Board Header */}
              <div className="p-4 border-b" style={{ borderColor: '#30363d' }}>
                <div className="flex items-center gap-2">
                  <span>📌</span>
                  <span className="font-bold text-[#e6edf3]">EVIDENCE BOARD</span>
                </div>
              </div>

              {/* Pinned Evidence Items */}
              <div className="p-4">
                {showAnnotations && (
                  <Annotation color="blue">
                    Cork-Board Aesthetic: Evidence als "gepinnte" Items mit visuellen Verbindungen
                  </Annotation>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {evidenceItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedEvidence(item.type)}
                      className={`p-3 rounded border-2 text-left transition hover:scale-105 ${
                        selectedEvidence === item.type
                          ? 'border-[#d4a574] bg-[#d4a574]/10'
                          : 'border-[#30363d] hover:border-[#8b949e]'
                      }`}
                      style={{ backgroundColor: '#0d1117' }}
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs font-bold text-[#e6edf3]">{item.label}</div>
                      <div className="text-xs text-[#8b949e]">{item.description}</div>
                      {item.timestamp && (
                        <div className="text-xs text-[#d4a574] mt-1">{item.timestamp}</div>
                      )}
                      {item.duration && (
                        <div className="text-xs text-[#d4a574] mt-1">{item.duration}</div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Connection Line Visualization */}
                <div className="flex justify-center my-2">
                  <div className="w-px h-8 bg-gradient-to-b from-[#d4a574] to-transparent" />
                </div>

                {/* Witnesses Section */}
                <div className="border-t pt-4" style={{ borderColor: '#30363d' }}>
                  <div className="text-xs text-[#8b949e] mb-2 flex items-center gap-2">
                    <span>👥</span> ZEUGEN ({witnesses.length})
                  </div>
                  {witnesses.map((witness, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b border-[#30363d] last:border-0">
                      <span className="text-lg">👤</span>
                      <div className="flex-1">
                        <div className="text-sm text-[#e6edf3]">{witness.name}</div>
                        <div className="text-xs text-[#8b949e]">{witness.role}</div>
                      </div>
                      {witness.verified && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981]">
                          ✓ Verifiziert
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* External Links */}
                <div className="border-t pt-4 mt-4" style={{ borderColor: '#30363d' }}>
                  <div className="text-xs text-[#8b949e] mb-2 flex items-center gap-2">
                    <span>🔗</span> EXTERNE QUELLEN
                  </div>
                  {externalLinks.map((link, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-2 px-2 rounded hover:bg-[#30363d] cursor-pointer transition"
                    >
                      <span>{link.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm text-[#e6edf3]">{link.label}</div>
                        <div className="text-xs text-[#8b949e]">{link.source}</div>
                      </div>
                      <span className="text-[#8b949e]">→</span>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="border-t pt-4 mt-4" style={{ borderColor: '#30363d' }}>
                  <div className="text-xs text-[#8b949e] mb-2">📋 CASE METADATA</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#8b949e]">Datum:</span>
                      <span className="text-[#e6edf3]">{caseData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8b949e]">Zeit:</span>
                      <span className="text-[#e6edf3]">{caseData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8b949e]">Ort:</span>
                      <span className="text-[#e6edf3]">{caseData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8b949e]">Dauer:</span>
                      <span className="text-[#e6edf3]">{caseData.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ============================================ */}
          {/* RIGHT COLUMN: INVESTIGATION WORKSPACE */}
          {/* ============================================ */}
          <main className="col-span-8">
            <div className="rounded-lg border-2 overflow-hidden" style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
              {/* Tab Navigation */}
              <div className="flex border-b" style={{ borderColor: '#30363d' }}>
                {[
                  { id: 'narrative', label: 'NARRATIVE', icon: '📖' },
                  { id: 'evidence', label: 'EVIDENCE', icon: '🔬' },
                  { id: 'patterns', label: 'PATTERNS', icon: '🔍' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-[#0d1117] text-[#d4a574] border-b-2 border-[#d4a574]'
                        : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#0d1117]'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* ============================================ */}
                {/* TAB: NARRATIVE */}
                {/* ============================================ */}
                {activeTab === 'narrative' && (
                  <div>
                    {showAnnotations && (
                      <Annotation color="purple">
                        Narrative Tab: Story-First View mit Metadata, Pull Quotes und Author Info
                      </Annotation>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-[#8b949e] mb-6">
                      <span>📅 {caseData.date}, {caseData.time}</span>
                      <span>📍 {caseData.location}</span>
                      <span>⏱️ {caseData.duration}</span>
                    </div>

                    {/* Story Text */}
                    <div className="prose prose-invert max-w-none">
                      <p className="text-[#e6edf3] leading-relaxed">
                        Es begann mit einem leisen Summen, das ich zunächst für einen Transformator hielt.
                        Als ich gegen 23:45 Uhr aus dem Fenster meines Hauses im Schwarzwald sah, bemerkte
                        ich drei Lichter in perfekter Dreiecksformation am klaren Nachthimmel.
                      </p>

                      {/* Pull Quote */}
                      <blockquote className="my-6 p-4 rounded-lg border-l-4"
                        style={{ backgroundColor: '#0d1117', borderColor: '#d4a574' }}>
                        <p className="text-lg italic text-[#e6edf3] mb-2">
                          "Die Lichter pulsierten synchron - als würden sie miteinander kommunizieren."
                        </p>
                        <footer className="text-sm text-[#8b949e]">
                          — {caseData.author.name}
                        </footer>
                      </blockquote>

                      <p className="text-[#e6edf3] leading-relaxed">
                        Die Formation blieb etwa 12 Minuten lang stationär, bevor sie ohne jede Vorwarnung
                        mit unglaublicher Geschwindigkeit nach Osten beschleunigte und verschwand.
                        Das Summen hörte im gleichen Moment auf. Ich war nicht allein - mein Nachbar
                        sah die gleiche Erscheinung von seinem Garten aus.
                      </p>
                    </div>

                    {/* Author Card */}
                    <div className="mt-8 p-4 rounded-lg border" style={{ backgroundColor: '#0d1117', borderColor: '#30363d' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#30363d] flex items-center justify-center text-2xl">
                          {caseData.author.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-[#e6edf3]">{caseData.author.name}</div>
                          <div className="text-sm text-[#8b949e]">
                            Level {caseData.author.level} • {caseData.author.contributions} Beiträge
                          </div>
                        </div>
                        <button className="px-3 py-1.5 rounded text-sm bg-[#30363d] text-[#e6edf3] hover:bg-[#3d4451] transition">
                          Folgen
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================ */}
                {/* TAB: EVIDENCE */}
                {/* ============================================ */}
                {activeTab === 'evidence' && (
                  <div>
                    {showAnnotations && (
                      <Annotation color="emerald">
                        Evidence Tab: Chronological Timeline + Evidence Strength Breakdown (NEU in V9!)
                      </Annotation>
                    )}

                    {/* Chronological Timeline */}
                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-[#e6edf3] mb-4 flex items-center gap-2">
                        <span>⏱️</span> CHRONOLOGISCHE EVIDENCE TIMELINE
                      </h3>

                      <div className="relative pl-8 border-l-2" style={{ borderColor: '#30363d' }}>
                        {timeline.map((event, i) => (
                          <div key={i} className="mb-4 relative">
                            {/* Timeline Dot */}
                            <div
                              className="absolute -left-[25px] w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: event.hasMedia ? '#d4a574' : '#30363d' }}
                            >
                              {event.hasMedia && <span className="text-xs">•</span>}
                            </div>

                            {/* Event Card */}
                            <div className={`p-3 rounded-lg ${event.hasMedia ? 'border border-[#d4a574]/30' : ''}`}
                              style={{ backgroundColor: '#0d1117' }}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-[#d4a574]">{event.time}</span>
                                <span>{event.icon}</span>
                              </div>
                              <div className="text-sm text-[#e6edf3]">{event.text}</div>
                              {event.hasMedia && (
                                <div className="mt-2 text-xs text-[#8b949e] flex items-center gap-1">
                                  <span>📎</span> Media verfügbar
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evidence Strength Meter */}
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: '#0d1117', borderColor: '#30363d' }}>
                      <h3 className="text-sm font-bold text-[#e6edf3] mb-4 flex items-center gap-2">
                        <span>📊</span> EVIDENCE STRENGTH BREAKDOWN
                      </h3>

                      {/* Total Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#8b949e]">Gesamt-Stärke</span>
                          <span className="font-bold" style={{ color: '#10b981' }}>
                            {evidenceStrength.reduce((a, b) => a + b.value, 0)}%
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-[#30363d] overflow-hidden flex">
                          {evidenceStrength.map((item, i) => (
                            <div
                              key={i}
                              className="h-full"
                              style={{
                                width: `${item.value}%`,
                                backgroundColor: item.color
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Breakdown List */}
                      <div className="space-y-2">
                        {evidenceStrength.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                            <span className="flex-1 text-[#8b949e]">{item.factor}</span>
                            <span className="font-mono" style={{ color: item.color }}>+{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================ */}
                {/* TAB: PATTERNS */}
                {/* ============================================ */}
                {activeTab === 'patterns' && (
                  <div>
                    {showAnnotations && (
                      <Annotation color="amber">
                        Patterns Tab: Interactive Query Builder + Correlation Breakdown mit voller Transparenz (NEU in V9!)
                      </Annotation>
                    )}

                    {/* Query Builder */}
                    {detectiveMode && (
                      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#0d1117', borderColor: '#d4a574' }}>
                        <h3 className="text-sm font-bold text-[#d4a574] mb-3 flex items-center gap-2">
                          <span>🔍</span> PATTERN QUERY BUILDER
                        </h3>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <select className="px-3 py-1.5 rounded text-sm bg-[#30363d] text-[#e6edf3] border border-[#30363d]">
                            <option>Shape: Triangle</option>
                            <option>Shape: Sphere</option>
                            <option>Shape: Disc</option>
                          </select>
                          <span className="text-[#8b949e] self-center">AND</span>
                          <select className="px-3 py-1.5 rounded text-sm bg-[#30363d] text-[#e6edf3] border border-[#30363d]">
                            <option>Time: Night</option>
                            <option>Time: Day</option>
                            <option>Time: Twilight</option>
                          </select>
                          <span className="text-[#8b949e] self-center">AND</span>
                          <select className="px-3 py-1.5 rounded text-sm bg-[#30363d] text-[#e6edf3] border border-[#30363d]">
                            <option>Region: Europe</option>
                            <option>Region: North America</option>
                            <option>Region: Global</option>
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <button className="px-4 py-2 rounded text-sm bg-[#d4a574] text-[#0d1117] font-bold hover:bg-[#e6c9a8] transition">
                            🔍 Suchen
                          </button>
                          <button className="px-4 py-2 rounded text-sm bg-[#30363d] text-[#8b949e] hover:bg-[#3d4451] transition">
                            Reset
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Correlation Breakdown */}
                    <div>
                      <h3 className="text-sm font-bold text-[#e6edf3] mb-4 flex items-center gap-2">
                        <span>📊</span> CORRELATION BREAKDOWN
                      </h3>

                      <div className="space-y-4">
                        {correlations.map((item, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-lg border hover:border-[#d4a574] transition cursor-pointer"
                            style={{ backgroundColor: '#0d1117', borderColor: '#30363d' }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-bold text-[#e6edf3]">{item.title}</div>
                                <div className="text-xs text-[#8b949e]">{item.location}</div>
                              </div>
                              <div className="text-2xl font-bold" style={{ color: item.match >= 85 ? '#10b981' : '#f59e0b' }}>
                                {item.match}%
                              </div>
                            </div>

                            {/* Match Breakdown */}
                            {detectiveMode && (
                              <div className="mt-3 pt-3 border-t border-[#30363d]">
                                <div className="text-xs text-[#8b949e] mb-2">WHY THIS MATCH:</div>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(item.breakdown).map(([key, value]) => (
                                    <span
                                      key={key}
                                      className="px-2 py-1 rounded text-xs"
                                      style={{ backgroundColor: '#30363d', color: '#e6edf3' }}
                                    >
                                      {key}: {value}%
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <button className="w-full mt-4 py-3 rounded-lg text-sm text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition border border-[#30363d]">
                        Mehr Korrelationen laden...
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================ */}
            {/* CORRELATION ENGINE (Bottom Panel) */}
            {/* ============================================ */}
            <div className="mt-6 rounded-lg border-2 overflow-hidden" style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
              <div className="p-4 border-b" style={{ borderColor: '#30363d' }}>
                <div className="flex items-center gap-2">
                  <span>🗺️</span>
                  <span className="font-bold text-[#e6edf3]">SPATIAL-TEMPORAL CORRELATION</span>
                </div>
              </div>

              <div className="p-4">
                {showAnnotations && (
                  <Annotation color="emerald">
                    Correlation Engine: Zeigt geografische und zeitliche Cluster-Muster (Neu in V9!)
                  </Annotation>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Map View (Simplified) */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0d1117' }}>
                    <div className="text-xs text-[#8b949e] mb-2">MAP VIEW</div>
                    <div className="aspect-video rounded-lg flex items-center justify-center relative"
                      style={{ backgroundColor: '#1a2332' }}>
                      {/* Simplified Map Visualization */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          {/* Your Case */}
                          <div className="w-4 h-4 rounded-full bg-[#ef4444] animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          <div className="w-4 h-4 rounded-full bg-[#ef4444] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                          {/* Similar Cases */}
                          {nearbyCases.map((c, i) => {
                            const angle = (i * 120) * Math.PI / 180
                            const distance = 40 + (i * 15)
                            return (
                              <div
                                key={i}
                                className="w-3 h-3 rounded-full bg-[#f59e0b] absolute"
                                style={{
                                  top: `calc(50% + ${Math.sin(angle) * distance}px)`,
                                  left: `calc(50% + ${Math.cos(angle) * distance}px)`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              />
                            )
                          })}

                          {/* Radius Circle */}
                          <div className="w-32 h-32 rounded-full border border-dashed border-[#8b949e]/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="absolute bottom-2 left-2 text-xs">
                        <div className="flex items-center gap-1 text-[#8b949e]">
                          <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Your Case
                        </div>
                        <div className="flex items-center gap-1 text-[#8b949e]">
                          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Similar ({nearbyCases.length})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline View */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0d1117' }}>
                    <div className="text-xs text-[#8b949e] mb-2">TIMELINE VIEW</div>
                    <div className="space-y-2">
                      {['Nov', 'Dez', 'Jan'].map((month, i) => (
                        <div key={month} className="flex items-center gap-2">
                          <span className="text-xs text-[#8b949e] w-8">{month}</span>
                          <div className="flex-1 h-6 rounded relative" style={{ backgroundColor: '#1a2332' }}>
                            {/* Your case marker in January */}
                            {month === 'Jan' && (
                              <div className="w-3 h-3 rounded-full bg-[#ef4444] absolute top-1/2 -translate-y-1/2"
                                style={{ left: '50%' }} />
                            )}
                            {/* Similar cases */}
                            {nearbyCases
                              .filter(c => c.date.includes(month))
                              .map((c, j) => (
                                <div
                                  key={j}
                                  className="w-2 h-2 rounded-full bg-[#f59e0b] absolute top-1/2 -translate-y-1/2"
                                  style={{ left: `${20 + j * 25}%` }}
                                />
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cluster Insight */}
                <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#10b981/10', border: '1px solid #10b981' }}>
                  <span className="text-[#10b981]">💡 Cluster-Erkennung:</span>
                  <span className="text-[#e6edf3] ml-2">
                    3 ähnliche Sichtungen innerhalb von 50km in den letzten 6 Monaten gefunden.
                    Möglicher Pattern-Cluster.
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* ============================================ */}
        {/* SCORE TRANSPARENCY MODAL */}
        {/* ============================================ */}
        {showScoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowScoreModal(false)}>
            <div
              className="max-w-md w-full mx-4 p-6 rounded-lg border-2"
              style={{ backgroundColor: '#161b22', borderColor: '#d4a574' }}
              onClick={e => e.stopPropagation()}
            >
              {showAnnotations && (
                <Annotation color="amber">
                  Score Transparency Modal: Zeigt exakt WARUM der Match-Score so ist (Komplett NEU in V9!)
                </Annotation>
              )}

              <h3 className="text-lg font-bold text-[#e6edf3] mb-4 flex items-center gap-2">
                <span>🔍</span> WHY {caseData.correlationScore}% MATCH?
              </h3>

              <div className="space-y-4">
                {/* Text Similarity */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#8b949e]">Text Similarity</span>
                    <span className="text-[#10b981]">45%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#30363d] overflow-hidden">
                    <div className="h-full bg-[#10b981]" style={{ width: '45%' }} />
                  </div>
                  <div className="text-xs text-[#8b949e] mt-1">
                    Keywords: "triangle", "lights", "silent", "hovering"
                  </div>
                </div>

                {/* Attribute Match */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#8b949e]">Attribute Match</span>
                    <span className="text-[#3b82f6]">30%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#30363d] overflow-hidden">
                    <div className="h-full bg-[#3b82f6]" style={{ width: '30%' }} />
                  </div>
                  <div className="text-xs text-[#8b949e] mt-1">
                    Shape, Time of Day, Duration
                  </div>
                </div>

                {/* Geographic */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#8b949e]">Geographic</span>
                    <span className="text-[#8b5cf6]">12%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#30363d] overflow-hidden">
                    <div className="h-full bg-[#8b5cf6]" style={{ width: '12%' }} />
                  </div>
                  <div className="text-xs text-[#8b949e] mt-1">
                    Same region (Europe)
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#30363d] flex gap-2">
                <button className="flex-1 py-2 rounded text-sm bg-[#30363d] text-[#8b949e] hover:bg-[#3d4451] transition">
                  📊 Details anzeigen
                </button>
                <button className="flex-1 py-2 rounded text-sm bg-[#30363d] text-[#8b949e] hover:bg-[#3d4451] transition">
                  ⚙️ Präferenzen
                </button>
              </div>

              <button
                onClick={() => setShowScoreModal(false)}
                className="w-full mt-4 py-2 rounded text-sm bg-[#d4a574] text-[#0d1117] font-bold hover:bg-[#e6c9a8] transition"
              >
                Schließen
              </button>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* FOOTER */}
        {/* ============================================ */}
        <footer className="mt-8 text-center py-6 border-t" style={{ borderColor: '#30363d' }}>
          <div className="flex items-center justify-center gap-4 text-[#8b949e] text-sm">
            <span>📁</span>
            <span className="font-mono">CASE FILE #{caseData.caseNumber}</span>
            <span>•</span>
            <span>XP-SHARE INVESTIGATION SYSTEM</span>
            <span>📁</span>
          </div>
        </footer>
      </div>
    </>
  )
}

// ============================================
// VERSION 10: OBSERVATORY - Kosmische Sternwarte
// "Du bist ein kosmischer Beobachter, der Anomalien
// am Himmel der Realität dokumentiert"
// ============================================
function Version10({ showAnnotations }: { showAnnotations: boolean }) {
  const [telescopeMode, setTelescopeMode] = useState(false)
  const [hoveredStar, setHoveredStar] = useState<string | null>(null)
  const [expandedNarrative, setExpandedNarrative] = useState(false)

  // Sample data for the Observatory
  const observation = {
    id: 'OBS-2024-1847',
    title: 'Die Lichter über dem Schwarzwald',
    magnitude: 3.7,
    magnitudeLabel: 'Bright',
    status: 'confirmed',
    constellation: 'Triangle Formation',
    constellationMembers: 12,
    date: '2024-01-15',
    time: '23:47:12 UTC',
    duration: '18 minutes',
    lat: '48.2082° N',
    lng: '8.0847° E',
    altitude: '847m',
    region: 'Schwarzwald, DE',
    narrative: `Es begann mit einem leisen Summen, das ich zunächst für einen Transformator hielt. Als ich durch das Fenster blickte, sah ich drei orangefarbene Lichter in perfekter Dreiecksformation über den Baumwipfeln schweben. Sie bewegten sich synchron und völlig geräuschlos - das ursprüngliche Summen war verstummt. Die Lichter pulsierten sanft, als würden sie miteinander kommunizieren. Nach etwa 18 Minuten beschleunigten sie plötzlich und verschwanden in Sekundenbruchteilen am Horizont.`,
    observer: {
      name: 'SternWächter_47',
      level: 'Experienced',
      observations: 47,
    },
    evidence: ['photo', 'sketch', 'audio'],
  }

  // Similar observations for constellation
  const constellationStars = [
    { id: '1', name: 'Phoenix Lights \'97', magnitude: 4.8, match: 89, date: 'Mar 1997', shape: 'Triangle', duration: '106 min' },
    { id: '2', name: 'Belgian Wave \'90', magnitude: 4.2, match: 82, date: 'Nov 1990', shape: 'Triangle', duration: '75 min' },
    { id: '3', name: 'Local 2023', magnitude: 3.1, match: 72, date: 'Oct 2023', shape: 'Triangle', duration: '12 min' },
    { id: '4', name: 'Local 2024', magnitude: 2.8, match: 67, date: 'Feb 2024', shape: 'Triangle', duration: '8 min' },
  ]

  // Magnitude to stars helper
  const getMagnitudeStars = (mag: number) => {
    if (mag >= 4.5) return { stars: '★★★★★', label: 'Brilliant' }
    if (mag >= 4.0) return { stars: '★★★★☆', label: 'Bright' }
    if (mag >= 3.0) return { stars: '★★★☆☆', label: 'Visible' }
    if (mag >= 2.0) return { stars: '★★☆☆☆', label: 'Dim' }
    return { stars: '★☆☆☆☆', label: 'Faint' }
  }

  const magInfo = getMagnitudeStars(observation.magnitude)

  // Convert lat/lng to celestial coordinates (aesthetic conversion)
  const toCelestial = (lat: string, lng: string) => {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    const ra = Math.abs(lngNum / 15).toFixed(0)
    const raMin = ((Math.abs(lngNum) % 15) * 4).toFixed(0)
    const dec = latNum >= 0 ? `+${latNum.toFixed(0)}°` : `${latNum.toFixed(0)}°`
    return { ra: `${ra}h ${raMin}m`, dec }
  }

  const celestial = toCelestial(observation.lat, observation.lng)

  return (
    <>
      {/* Observatory Background - Deep Space */}
      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0a0a1a 0%, #12122a 50%, #0a0a1a 100%)',
        }}
      >
        {/* Animated Star Field Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Static stars */}
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px #ffd700, 0 0 40px rgba(255,215,0,0.4); }
            50% { box-shadow: 0 0 30px #ffd700, 0 0 60px rgba(255,215,0,0.6); }
          }
          @keyframes line-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>

        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">

          {/* ============================================ */}
          {/* OBSERVATORY HEADER */}
          {/* ============================================ */}
          <header
            className="rounded-2xl p-6 mb-6 border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(18,18,42,0.9) 0%, rgba(10,10,26,0.95) 100%)',
              borderColor: 'rgba(255,215,0,0.2)',
              boxShadow: '0 0 30px rgba(255,215,0,0.1)',
            }}
          >
            {/* Header glow effect */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #ffd700, transparent)',
                boxShadow: '0 0 20px #ffd700',
              }}
            />

            {/* Top row: ID + Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔭</span>
                <span
                  className="font-mono text-lg tracking-wider"
                  style={{ color: '#ffd700' }}
                >
                  OBSERVATION #{observation.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition border"
                  style={{
                    borderColor: 'rgba(255,215,0,0.3)',
                    color: '#ffd700',
                  }}
                >
                  Share
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition border"
                  style={{
                    borderColor: 'rgba(255,215,0,0.3)',
                    color: '#ffd700',
                  }}
                >
                  Bookmark
                </button>
              </div>
            </div>

            {/* Title */}
            <h1
              className="text-3xl font-bold mb-6"
              style={{ color: '#f0f0ff' }}
            >
              "{observation.title}"
            </h1>

            {/* Annotation */}
            {showAnnotations && (
              <Annotation color="amber">
                🔭 <strong>OBSERVATORY HEADER:</strong> Das kosmische Äquivalent zu einer "ID Card".
                Observation Number Format: OBS-[Jahr]-[Sequential ID].
                Die goldene Linie oben symbolisiert einen Lichtstrahl vom Teleskop.
              </Annotation>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {/* Magnitude */}
              <div
                className="p-4 rounded-xl text-center border"
                style={{
                  background: 'rgba(255,215,0,0.05)',
                  borderColor: 'rgba(255,215,0,0.2)',
                }}
              >
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#8888aa' }}>
                  Magnitude
                </div>
                <div
                  className="text-2xl mb-1"
                  style={{ color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
                >
                  {magInfo.stars}
                </div>
                <div className="text-sm font-mono" style={{ color: '#f0f0ff' }}>
                  {observation.magnitude.toFixed(1)} - "{magInfo.label}"
                </div>
              </div>

              {/* Constellation */}
              <div
                className="p-4 rounded-xl text-center border"
                style={{
                  background: 'rgba(157,78,221,0.05)',
                  borderColor: 'rgba(157,78,221,0.2)',
                }}
              >
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#8888aa' }}>
                  Constellation
                </div>
                <div className="text-2xl mb-1" style={{ color: '#9d4edd' }}>
                  △
                </div>
                <div className="text-sm font-mono" style={{ color: '#f0f0ff' }}>
                  {observation.constellation}
                </div>
                <div className="text-xs mt-1" style={{ color: '#8888aa' }}>
                  {observation.constellationMembers} members
                </div>
              </div>

              {/* Status */}
              <div
                className="p-4 rounded-xl text-center border"
                style={{
                  background: 'rgba(0,255,247,0.05)',
                  borderColor: 'rgba(0,255,247,0.2)',
                }}
              >
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#8888aa' }}>
                  Observation Status
                </div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    background: 'rgba(0,255,247,0.1)',
                    color: '#00fff7',
                    border: '1px solid rgba(0,255,247,0.3)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#00fff7] animate-pulse" />
                  CONFIRMED
                </div>
              </div>
            </div>

            {/* Annotation for Magnitude */}
            {showAnnotations && (
              <Annotation color="purple">
                ⭐ <strong>MAGNITUDE SYSTEM:</strong> Einzigartig für V10! Helligkeit = Validierungsstärke.
                <br/>★☆☆☆☆ Faint (1.0-2.0) = Solo report | ★★★★★ Brilliant (4.5-5.0) = Expert verified
                <br/>Inspiriert von astronomischer Magnitude-Skala.
              </Annotation>
            )}
          </header>

          {/* ============================================ */}
          {/* STAR FIELD VIEW (Interactive Canvas) */}
          {/* ============================================ */}
          <section
            className="rounded-2xl p-6 mb-6 border relative overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(18,18,42,0.9) 0%, rgba(10,10,26,0.95) 70%)',
              borderColor: 'rgba(255,215,0,0.2)',
              minHeight: '400px',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#f0f0ff' }}>
                <span>🌌</span> Star Field View
              </h2>
              <button
                onClick={() => setTelescopeMode(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.1) 100%)',
                  borderColor: 'rgba(255,215,0,0.3)',
                  border: '1px solid rgba(255,215,0,0.3)',
                  color: '#ffd700',
                }}
              >
                🔭 Telescope Mode
              </button>
            </div>

            {/* Annotation */}
            {showAnnotations && (
              <Annotation color="amber">
                🌌 <strong>STAR FIELD VIEW:</strong> Das Herzstück von V10!
                Deine Sichtung ist der große, pulsierende Stern in der Mitte.
                Ähnliche Experiences bilden Konstellationen mit SVG-Verbindungslinien.
                Hover über Sterne für Preview, Click für Navigation.
              </Annotation>
            )}

            {/* Interactive Star Field */}
            <div className="relative h-[300px] mt-4">
              {/* Background gradient */}
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(157,78,221,0.1) 0%, transparent 60%)',
                }}
              />

              {/* SVG Constellation Lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                {/* Lines from focal star to constellation members */}
                <line
                  x1="50%" y1="50%" x2="25%" y2="25%"
                  stroke="rgba(255,215,0,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  style={{ animation: 'line-pulse 3s ease-in-out infinite' }}
                />
                <line
                  x1="50%" y1="50%" x2="75%" y2="30%"
                  stroke="rgba(255,215,0,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  style={{ animation: 'line-pulse 3s ease-in-out infinite', animationDelay: '0.5s' }}
                />
                <line
                  x1="50%" y1="50%" x2="30%" y2="75%"
                  stroke="rgba(255,215,0,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  style={{ animation: 'line-pulse 3s ease-in-out infinite', animationDelay: '1s' }}
                />
                <line
                  x1="50%" y1="50%" x2="70%" y2="70%"
                  stroke="rgba(255,215,0,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  style={{ animation: 'line-pulse 3s ease-in-out infinite', animationDelay: '1.5s' }}
                />
                {/* Connecting constellation members */}
                <line
                  x1="25%" y1="25%" x2="75%" y2="30%"
                  stroke="rgba(157,78,221,0.4)"
                  strokeWidth="1"
                />
                <line
                  x1="30%" y1="75%" x2="70%" y2="70%"
                  stroke="rgba(157,78,221,0.4)"
                  strokeWidth="1"
                />
              </svg>

              {/* Focal Star (Current Experience) */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #ffd700 0%, #ffaa00 50%, transparent 70%)',
                  boxShadow: '0 0 30px #ffd700, 0 0 60px rgba(255,215,0,0.5)',
                  animation: 'pulse-glow 2s ease-in-out infinite, float 4s ease-in-out infinite',
                }}
                onMouseEnter={() => setHoveredStar('focal')}
                onMouseLeave={() => setHoveredStar(null)}
              >
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  ★
                </div>
              </div>

              {/* Hover tooltip for focal star */}
              {hoveredStar === 'focal' && (
                <div
                  className="absolute left-1/2 top-[30%] -translate-x-1/2 p-3 rounded-lg z-20"
                  style={{
                    background: 'rgba(18,18,42,0.95)',
                    border: '1px solid rgba(255,215,0,0.3)',
                    boxShadow: '0 0 20px rgba(255,215,0,0.2)',
                  }}
                >
                  <div className="text-sm font-bold" style={{ color: '#ffd700' }}>
                    YOUR OBSERVATION
                  </div>
                  <div className="text-xs" style={{ color: '#f0f0ff' }}>
                    {observation.title}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#8888aa' }}>
                    Magnitude: {observation.magnitude.toFixed(1)}
                  </div>
                </div>
              )}

              {/* Constellation Stars */}
              {constellationStars.map((star, idx) => {
                const positions = [
                  { left: '25%', top: '25%' },
                  { left: '75%', top: '30%' },
                  { left: '30%', top: '75%' },
                  { left: '70%', top: '70%' },
                ]
                const pos = positions[idx]
                const size = 20 + (star.magnitude * 5)
                const brightness = 0.3 + (star.magnitude / 5) * 0.7

                return (
                  <div
                    key={star.id}
                    className="absolute cursor-pointer z-10 transition-transform hover:scale-125"
                    style={{
                      left: pos.left,
                      top: pos.top,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseEnter={() => setHoveredStar(star.id)}
                    onMouseLeave={() => setHoveredStar(null)}
                  >
                    <div
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(255,255,255,${brightness}) 0%, rgba(255,215,0,${brightness * 0.5}) 50%, transparent 70%)`,
                        boxShadow: `0 0 ${size/2}px rgba(255,215,0,${brightness * 0.5})`,
                      }}
                    />
                    {/* Hover tooltip */}
                    {hoveredStar === star.id && (
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-lg whitespace-nowrap z-30"
                        style={{
                          background: 'rgba(18,18,42,0.95)',
                          border: '1px solid rgba(255,215,0,0.3)',
                        }}
                      >
                        <div className="text-xs font-bold" style={{ color: '#f0f0ff' }}>
                          {star.name}
                        </div>
                        <div className="text-xs" style={{ color: '#ffd700' }}>
                          Match: {star.match}%
                        </div>
                        <div className="text-xs" style={{ color: '#8888aa' }}>
                          Mag: {star.magnitude.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Distant background stars */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={`distant-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: '3px',
                    height: '3px',
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    background: 'rgba(255,255,255,0.4)',
                    opacity: 0.3 + Math.random() * 0.3,
                  }}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs" style={{ color: '#8888aa' }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ background: '#ffd700', boxShadow: '0 0 10px #ffd700' }} />
                <span>Your Observation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.7)' }} />
                <span>Similar (Constellation)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
                <span>Other Observations</span>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* TWO-COLUMN LAYOUT: Log + Constellation Data */}
          {/* ============================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ============================================ */}
            {/* OBSERVATION LOG (Left Panel) */}
            {/* ============================================ */}
            <section
              className="rounded-2xl p-6 border"
              style={{
                background: 'linear-gradient(180deg, rgba(18,18,42,0.9) 0%, rgba(10,10,26,0.95) 100%)',
                borderColor: 'rgba(255,215,0,0.2)',
              }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: '#f0f0ff' }}>
                <span>📋</span> Observation Log
              </h2>

              {showAnnotations && (
                <Annotation color="emerald">
                  📋 <strong>OBSERVATION LOG:</strong> Die Story wird als wissenschaftliches Protokoll präsentiert.
                  Temporal Data, Spatial Data (mit Celestial Coordinates!), Narrative, Observer Profile.
                  Inspiriert von echten astronomischen Beobachtungsprotokollen.
                </Annotation>
              )}

              {/* Temporal Data */}
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: '#ffd700' }}>
                  Temporal Data
                </h3>
                <div className="space-y-1 text-sm font-mono" style={{ color: '#f0f0ff' }}>
                  <div className="flex items-center gap-2">
                    <span>📅</span> Date: {observation.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🕐</span> Time: {observation.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏱️</span> Duration: {observation.duration}
                  </div>
                </div>
              </div>

              {/* Spatial Data */}
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: '#ffd700' }}>
                  Spatial Data
                </h3>
                <div className="space-y-1 text-sm font-mono" style={{ color: '#f0f0ff' }}>
                  <div className="flex items-center gap-2">
                    <span>📍</span> Lat: {observation.lat}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📍</span> Lng: {observation.lng}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🏔️</span> Alt: {observation.altitude}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🌍</span> Region: {observation.region}
                  </div>
                </div>
                {/* Celestial Coordinates */}
                <div
                  className="mt-2 p-2 rounded-lg text-xs font-mono text-center"
                  style={{
                    background: 'rgba(157,78,221,0.1)',
                    border: '1px solid rgba(157,78,221,0.2)',
                    color: '#9d4edd',
                  }}
                >
                  RA: {celestial.ra} | Dec: {celestial.dec}
                </div>
              </div>

              {/* Observation Narrative */}
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: '#ffd700' }}>
                  Observation Narrative
                </h3>
                <div
                  className="p-3 rounded-lg text-sm leading-relaxed"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    color: '#f0f0ff',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  "{expandedNarrative ? observation.narrative : observation.narrative.slice(0, 150) + '...'}"
                  <button
                    onClick={() => setExpandedNarrative(!expandedNarrative)}
                    className="block mt-2 text-xs hover:underline"
                    style={{ color: '#ffd700' }}
                  >
                    {expandedNarrative ? '↑ Collapse' : '↓ Read full observation'}
                  </button>
                </div>
              </div>

              {/* Observer */}
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: '#ffd700' }}>
                  Observer
                </h3>
                <div
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    background: 'rgba(255,215,0,0.05)',
                    border: '1px solid rgba(255,215,0,0.1)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)',
                    }}
                  >
                    🔭
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: '#f0f0ff' }}>
                      {observation.observer.name}
                    </div>
                    <div className="text-xs" style={{ color: '#8888aa' }}>
                      Observer Level: {observation.observer.level} • {observation.observer.observations} observations
                    </div>
                  </div>
                </div>
              </div>

              {/* Attached Evidence */}
              <div>
                <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: '#ffd700' }}>
                  Attached Evidence
                </h3>
                <div className="flex gap-2">
                  {observation.evidence.includes('photo') && (
                    <div
                      className="px-3 py-2 rounded-lg text-sm cursor-pointer hover:opacity-80 transition"
                      style={{
                        background: 'rgba(0,255,247,0.1)',
                        border: '1px solid rgba(0,255,247,0.2)',
                        color: '#00fff7',
                      }}
                    >
                      📷 Photo
                    </div>
                  )}
                  {observation.evidence.includes('sketch') && (
                    <div
                      className="px-3 py-2 rounded-lg text-sm cursor-pointer hover:opacity-80 transition"
                      style={{
                        background: 'rgba(157,78,221,0.1)',
                        border: '1px solid rgba(157,78,221,0.2)',
                        color: '#9d4edd',
                      }}
                    >
                      🎨 Sketch
                    </div>
                  )}
                  {observation.evidence.includes('audio') && (
                    <div
                      className="px-3 py-2 rounded-lg text-sm cursor-pointer hover:opacity-80 transition"
                      style={{
                        background: 'rgba(255,215,0,0.1)',
                        border: '1px solid rgba(255,215,0,0.2)',
                        color: '#ffd700',
                      }}
                    >
                      🎤 Audio
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ============================================ */}
            {/* CONSTELLATION DATA (Right Panel) */}
            {/* ============================================ */}
            <section
              className="rounded-2xl p-6 border"
              style={{
                background: 'linear-gradient(180deg, rgba(18,18,42,0.9) 0%, rgba(10,10,26,0.95) 100%)',
                borderColor: 'rgba(157,78,221,0.2)',
              }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: '#f0f0ff' }}>
                <span>⭐</span> Constellation: "{observation.constellation}"
              </h2>

              {showAnnotations && (
                <Annotation color="purple">
                  ⭐ <strong>CONSTELLATION DATA:</strong> Warum du Teil dieses Musters bist!
                  Ähnliche Experiences bilden "Sternbilder". Hier siehst du Stats,
                  Similarity Breakdown und kannst zu anderen Konstellationen navigieren.
                </Annotation>
              )}

              {/* Mini constellation visualization */}
              <div
                className="h-[100px] mb-4 flex items-center justify-center relative"
                style={{
                  background: 'rgba(157,78,221,0.05)',
                  borderRadius: '12px',
                }}
              >
                <svg width="120" height="80" viewBox="0 0 120 80">
                  {/* Triangle constellation */}
                  <circle cx="60" cy="15" r="6" fill="#ffd700" />
                  <circle cx="30" cy="65" r="5" fill="rgba(255,255,255,0.7)" />
                  <circle cx="90" cy="65" r="5" fill="rgba(255,255,255,0.7)" />
                  <line x1="60" y1="15" x2="30" y2="65" stroke="rgba(157,78,221,0.5)" strokeWidth="1" />
                  <line x1="60" y1="15" x2="90" y2="65" stroke="rgba(157,78,221,0.5)" strokeWidth="1" />
                  <line x1="30" y1="65" x2="90" y2="65" stroke="rgba(157,78,221,0.5)" strokeWidth="1" />
                </svg>
                <div
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono"
                  style={{ color: '#9d4edd' }}
                >
                  △ Triangle Formation
                </div>
              </div>

              {/* Constellation Stats */}
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: '#9d4edd' }}>
                  Constellation Stats
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ color: '#8888aa' }}>Members:</span>
                    <span className="ml-2 font-mono" style={{ color: '#f0f0ff' }}>{observation.constellationMembers}</span>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ color: '#8888aa' }}>Span:</span>
                    <span className="ml-2 font-mono" style={{ color: '#f0f0ff' }}>6 months</span>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ color: '#8888aa' }}>Peak:</span>
                    <span className="ml-2 font-mono" style={{ color: '#f0f0ff' }}>Jan 2024</span>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ color: '#8888aa' }}>Avg. Mag:</span>
                    <span className="ml-2 font-mono" style={{ color: '#ffd700' }}>3.2</span>
                  </div>
                </div>
              </div>

              {/* Why You're In This Constellation */}
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: '#9d4edd' }}>
                  Why You're In This Constellation
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#f0f0ff' }}>Shape Match</span>
                      <span style={{ color: '#ffd700' }}>78%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: '78%', background: '#ffd700' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#f0f0ff' }}>Time Pattern</span>
                      <span style={{ color: '#9d4edd' }}>62%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: '62%', background: '#9d4edd' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#f0f0ff' }}>Location</span>
                      <span style={{ color: '#00fff7' }}>48%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: '48%', background: '#00fff7' }} />
                    </div>
                  </div>
                </div>
                <div
                  className="mt-3 p-2 rounded-lg text-center text-sm font-medium"
                  style={{
                    background: 'rgba(255,215,0,0.1)',
                    border: '1px solid rgba(255,215,0,0.2)',
                    color: '#ffd700',
                  }}
                >
                  Combined Similarity: 67%
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  className="w-full py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
                  style={{
                    background: 'rgba(157,78,221,0.2)',
                    border: '1px solid rgba(157,78,221,0.3)',
                    color: '#9d4edd',
                  }}
                >
                  View all constellation members →
                </button>
                <button
                  className="w-full py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
                  style={{
                    background: 'rgba(0,255,247,0.1)',
                    border: '1px solid rgba(0,255,247,0.2)',
                    color: '#00fff7',
                  }}
                >
                  Explore other constellations →
                </button>
              </div>
            </section>
          </div>

          {/* ============================================ */}
          {/* TELESCOPE MODE MODAL */}
          {/* ============================================ */}
          {telescopeMode && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.9)' }}
            >
              <div
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 border"
                style={{
                  background: 'linear-gradient(180deg, #12122a 0%, #0a0a1a 100%)',
                  borderColor: 'rgba(255,215,0,0.3)',
                  boxShadow: '0 0 60px rgba(255,215,0,0.2)',
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#ffd700' }}>
                    🔭 TELESCOPE MODE: {observation.constellation}
                  </h2>
                  <button
                    onClick={() => setTelescopeMode(false)}
                    className="text-2xl hover:opacity-70 transition"
                    style={{ color: '#ffd700' }}
                  >
                    ×
                  </button>
                </div>

                {showAnnotations && (
                  <Annotation color="amber">
                    🔭 <strong>TELESCOPE MODE:</strong> Zoom-in für Detail-Analyse!
                    Hier siehst du die genauen Matches mit Prozentangaben und
                    eine Vergleichstabelle aller Constellation Members.
                  </Annotation>
                )}

                {/* Zoomed Star Field */}
                <div
                  className="relative h-[250px] mb-6 rounded-xl overflow-hidden"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(157,78,221,0.2) 0%, rgba(10,10,26,1) 70%)',
                  }}
                >
                  <svg className="absolute inset-0 w-full h-full">
                    {/* Zoomed constellation lines with match percentages */}
                    <line x1="50%" y1="70%" x2="20%" y2="20%" stroke="rgba(255,215,0,0.5)" strokeWidth="2" />
                    <line x1="50%" y1="70%" x2="80%" y2="25%" stroke="rgba(255,215,0,0.5)" strokeWidth="2" />
                    <line x1="50%" y1="70%" x2="25%" y2="80%" stroke="rgba(255,215,0,0.4)" strokeWidth="2" />
                    <line x1="50%" y1="70%" x2="75%" y2="85%" stroke="rgba(255,215,0,0.4)" strokeWidth="2" />

                    {/* Match percentage labels */}
                    <text x="35%" y="45%" fill="#ffd700" fontSize="12" fontFamily="monospace">89%</text>
                    <text x="65%" y="48%" fill="#ffd700" fontSize="12" fontFamily="monospace">82%</text>
                    <text x="35%" y="78%" fill="#ffd700" fontSize="12" fontFamily="monospace">72%</text>
                    <text x="65%" y="80%" fill="#ffd700" fontSize="12" fontFamily="monospace">67%</text>
                  </svg>

                  {/* Stars */}
                  <div
                    className="absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle, #ffd700 0%, #ffaa00 50%, transparent 70%)',
                      boxShadow: '0 0 40px #ffd700',
                    }}
                  >
                    <span className="text-black text-xs font-bold">YOU</span>
                  </div>
                  <div
                    className="absolute left-[20%] top-[20%] w-10 h-10 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.5) 50%, transparent 70%)',
                      boxShadow: '0 0 20px rgba(255,215,0,0.5)',
                      color: '#0a0a1a',
                      fontWeight: 'bold',
                    }}
                  >
                    PHX
                  </div>
                  <div
                    className="absolute left-[80%] top-[25%] w-9 h-9 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0.4) 50%, transparent 70%)',
                      boxShadow: '0 0 15px rgba(255,215,0,0.4)',
                      color: '#0a0a1a',
                      fontWeight: 'bold',
                    }}
                  >
                    BEL
                  </div>
                  <div
                    className="absolute left-[25%] top-[80%] w-7 h-7 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
                    }}
                  />
                  <div
                    className="absolute left-[75%] top-[85%] w-6 h-6 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
                    }}
                  />
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,215,0,0.2)' }}>
                        <th className="py-2 px-3 text-left" style={{ color: '#ffd700' }}>Observation</th>
                        <th className="py-2 px-3 text-left" style={{ color: '#ffd700' }}>Date</th>
                        <th className="py-2 px-3 text-left" style={{ color: '#ffd700' }}>Shape</th>
                        <th className="py-2 px-3 text-left" style={{ color: '#ffd700' }}>Duration</th>
                        <th className="py-2 px-3 text-left" style={{ color: '#ffd700' }}>Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: 'rgba(255,215,0,0.1)' }}>
                        <td className="py-2 px-3 font-bold" style={{ color: '#ffd700' }}>Your Observation</td>
                        <td className="py-2 px-3" style={{ color: '#f0f0ff' }}>Jan 2024</td>
                        <td className="py-2 px-3" style={{ color: '#f0f0ff' }}>Triangle</td>
                        <td className="py-2 px-3" style={{ color: '#f0f0ff' }}>18 min</td>
                        <td className="py-2 px-3" style={{ color: '#8888aa' }}>-</td>
                      </tr>
                      {constellationStars.map((star) => (
                        <tr key={star.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td className="py-2 px-3" style={{ color: '#f0f0ff' }}>{star.name}</td>
                          <td className="py-2 px-3" style={{ color: '#8888aa' }}>{star.date}</td>
                          <td className="py-2 px-3" style={{ color: '#8888aa' }}>{star.shape}</td>
                          <td className="py-2 px-3" style={{ color: '#8888aa' }}>{star.duration}</td>
                          <td className="py-2 px-3 font-bold" style={{ color: '#ffd700' }}>{star.match}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => setTelescopeMode(false)}
                  className="mt-6 w-full py-3 rounded-lg text-sm font-medium transition hover:opacity-80"
                  style={{
                    background: 'rgba(255,215,0,0.2)',
                    border: '1px solid rgba(255,215,0,0.3)',
                    color: '#ffd700',
                  }}
                >
                  Exit Telescope Mode ×
                </button>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* FOOTER */}
          {/* ============================================ */}
          <footer
            className="mt-8 text-center py-6 rounded-xl border"
            style={{
              background: 'rgba(18,18,42,0.5)',
              borderColor: 'rgba(255,215,0,0.1)',
            }}
          >
            <div className="flex items-center justify-center gap-4 text-sm" style={{ color: '#8888aa' }}>
              <span>🔭</span>
              <span className="font-mono" style={{ color: '#ffd700' }}>
                OBSERVATION #{observation.id}
              </span>
              <span>•</span>
              <span>XP-SHARE OBSERVATORY</span>
              <span>🌌</span>
            </div>
            <div className="mt-2 text-xs" style={{ color: '#444466' }}>
              "We are all observers of the cosmic anomaly that is reality"
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

// ============================================
// VERSION 11 - ULTRATHINK (NEURAL-BRUTALIST)
// The interface that "thinks with you" - exposed cognitive architecture
// ============================================
function Version11({ showAnnotations }: { showAnnotations: boolean }) {
  const [processingState, setProcessingState] = useState<'raw' | 'analyzing' | 'understood'>('understood')
  const [activeSynapse, setActiveSynapse] = useState<number | null>(null)
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null)
  const [neuralPulse, setNeuralPulse] = useState(true)

  // Experience data in "neural" format
  const neuralData = {
    id: 'THOUGHT-2024-X847',
    rawInput: 'Schwarze Gestalt im Schlafzimmer',
    processedTitle: 'SCHATTENGESTALT // SCHLAFPARALYSE',
    cognitiveLoad: 94,
    patternMatch: 87,
    validationStrength: 78,
    timestamp: '2024-01-15T03:47:00Z',
    location: { lat: 48.2082, lng: 16.3738, decoded: 'WIEN // AT' },
    narrative: `Ich wachte auf und konnte mich nicht bewegen. Am Fußende des Bettes stand eine dunkle Gestalt – keine erkennbaren Gesichtszüge, nur pure Schwärze die das Licht zu absorbieren schien. Das Gefühl absoluter Präsenz war überwältigend. Nach etwa 30 Sekunden löste sich die Lähmung und die Gestalt verschwand nicht – sie war einfach nicht mehr da.`,
    emotionalSignature: [
      { id: 'terror', intensity: 95, color: '#ff2d6a' },
      { id: 'paralysis', intensity: 88, color: '#00d4ff' },
      { id: 'presence', intensity: 92, color: '#ffc800' },
      { id: 'dissolution', intensity: 45, color: '#9d4edd' },
    ],
    synapticConnections: [
      { id: 1, label: 'Schlafparalyse-Cluster', strength: 94, nodes: 234 },
      { id: 2, label: 'Schattengestalten', strength: 87, nodes: 156 },
      { id: 3, label: 'Nacht-Erfahrungen', strength: 76, nodes: 891 },
      { id: 4, label: 'Präsenz-Gefühl', strength: 82, nodes: 445 },
      { id: 5, label: 'Wien-Region', strength: 45, nodes: 67 },
    ],
    thoughtFragments: [
      { text: 'schwarze Gestalt', weight: 0.95, type: 'entity' },
      { text: 'konnte mich nicht bewegen', weight: 0.92, type: 'state' },
      { text: 'Fußende des Bettes', weight: 0.78, type: 'location' },
      { text: 'keine Gesichtszüge', weight: 0.85, type: 'attribute' },
      { text: 'absoluter Präsenz', weight: 0.89, type: 'sensation' },
      { text: 'Licht absorbieren', weight: 0.72, type: 'phenomenon' },
    ],
    neuralTimeline: [
      { phase: 'INPUT', time: 0, label: 'Erfahrung eingegeben' },
      { phase: 'TOKENIZE', time: 150, label: 'Text fragmentiert' },
      { phase: 'EMBED', time: 340, label: 'Semantik extrahiert' },
      { phase: 'MATCH', time: 890, label: 'Pattern gefunden' },
      { phase: 'CLUSTER', time: 1200, label: 'Vernetzt' },
      { phase: 'VALIDATE', time: 1450, label: 'Validiert' },
    ],
    witnesses: 0,
    mediaAttached: true,
    contributor: {
      handle: '@neural_witness_47',
      trustScore: 0.89,
      contributions: 12,
    }
  }

  const thoughtClusters = [
    { id: 'alpha', name: 'PRIMÄR-CLUSTER', experiences: 234, color: '#ff2d6a', x: 30, y: 25 },
    { id: 'beta', name: 'SEKUNDÄR-CLUSTER', experiences: 156, color: '#00d4ff', x: 65, y: 35 },
    { id: 'gamma', name: 'TERTIÄR-CLUSTER', experiences: 891, color: '#ffc800', x: 45, y: 70 },
  ]

  return (
    <>
      {/* NEURAL BACKGROUND - Animated synaptic field */}
      <style jsx>{`
        @keyframes synapse-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes neural-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        @keyframes glitch-text {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, 2px); }
          80% { transform: translate(1px, -2px); }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes dendrite-grow {
          0% { stroke-dasharray: 0 100; }
          100% { stroke-dasharray: 100 0; }
        }
        @keyframes thought-emerge {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .neural-grid {
          background-image:
            linear-gradient(rgba(255,45,106,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,45,106,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .synapse-line {
          animation: neural-flow 2s linear infinite;
          stroke-dasharray: 5 5;
        }
        .glitch-hover:hover {
          animation: glitch-text 0.3s ease-in-out;
        }
        .thought-fragment {
          animation: thought-emerge 0.5s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-[#0d0d0d] neural-grid relative overflow-hidden">
        {/* Scan line effect */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(transparent 50%, rgba(0,212,255,0.02) 50%)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* Floating neural particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#ff2d6a', '#00d4ff', '#ffc800'][i % 3],
                opacity: Math.random() * 0.5 + 0.2,
                animation: `synapse-pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-20">

          {showAnnotations && (
            <Annotation color="purple">
              <strong>V11 ULTRATHINK:</strong> Neural-Brutalist Design. Die Page "denkt mit" -
              sichtbare kognitive Architektur, pulsing synaptic connections, processing states.
              Exposed structure statt polished surfaces. JetBrains Mono + Space Mono für tech-authenticity.
            </Annotation>
          )}

          {/* ============================================ */}
          {/* NEURAL HEADER - Processing State Indicator */}
          {/* ============================================ */}
          <header className="mb-8 border-b border-[#ff2d6a]/20 pb-6">
            <div className="flex items-start justify-between gap-6">
              {/* Left: ID & Status */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[#ff2d6a] font-mono text-xs tracking-[0.3em] opacity-60">
                    THOUGHT://
                  </span>
                  <span className="font-mono text-[#f0f0f0] text-sm glitch-hover">
                    {neuralData.id}
                  </span>
                </div>
                <h1 className="font-mono text-3xl md:text-4xl font-bold text-[#f0f0f0] tracking-tight">
                  {neuralData.processedTitle.split(' // ').map((part, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-[#00d4ff] mx-2">//</span>}
                      <span className={i === 0 ? 'text-[#ff2d6a]' : 'text-[#f0f0f0]'}>{part}</span>
                    </span>
                  ))}
                </h1>
                <div className="flex items-center gap-4 mt-3 text-xs font-mono text-[#f0f0f0]/50">
                  <span>{neuralData.location.decoded}</span>
                  <span className="text-[#ff2d6a]">|</span>
                  <span>{new Date(neuralData.timestamp).toLocaleDateString('de-AT')}</span>
                  <span className="text-[#ff2d6a]">|</span>
                  <span className="text-[#00d4ff]">@{neuralData.contributor.handle.replace('@', '')}</span>
                </div>
              </div>

              {/* Right: Processing State */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  {['raw', 'analyzing', 'understood'].map((state) => (
                    <button
                      key={state}
                      onClick={() => setProcessingState(state as typeof processingState)}
                      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-all ${
                        processingState === state
                          ? state === 'raw'
                            ? 'bg-[#ff2d6a]/20 border-[#ff2d6a] text-[#ff2d6a]'
                            : state === 'analyzing'
                            ? 'bg-[#ffc800]/20 border-[#ffc800] text-[#ffc800] animate-pulse'
                            : 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]'
                          : 'border-[#f0f0f0]/20 text-[#f0f0f0]/40 hover:border-[#f0f0f0]/40'
                      }`}
                    >
                      {state === 'raw' ? '◇ RAW' : state === 'analyzing' ? '◈ PROCESSING' : '◆ UNDERSTOOD'}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-mono text-[#f0f0f0]/30">
                  COGNITIVE_STATE: {processingState.toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* ============================================ */}
          {/* MAIN GRID - Asymmetric Neural Layout */}
          {/* ============================================ */}
          <div className="grid grid-cols-12 gap-4">

            {/* LEFT COLUMN: Thought Fragments + Narrative */}
            <div className="col-span-12 lg:col-span-4 space-y-4">

              {/* Thought Fragments Panel */}
              <div className="bg-[#0d0d0d] border border-[#ff2d6a]/30 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-xs text-[#ff2d6a] tracking-[0.2em]">
                    THOUGHT_FRAGMENTS
                  </h2>
                  <span className="text-[10px] font-mono text-[#f0f0f0]/30">
                    {neuralData.thoughtFragments.length} EXTRACTED
                  </span>
                </div>
                <div className="space-y-2">
                  {neuralData.thoughtFragments.map((fragment, i) => (
                    <div
                      key={i}
                      className="thought-fragment flex items-center gap-3 p-2 border-l-2 hover:bg-[#ff2d6a]/5 transition-colors cursor-pointer"
                      style={{
                        borderColor: fragment.type === 'entity' ? '#ff2d6a'
                          : fragment.type === 'state' ? '#00d4ff'
                          : fragment.type === 'sensation' ? '#ffc800'
                          : '#9d4edd',
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{
                          backgroundColor: fragment.type === 'entity' ? '#ff2d6a'
                            : fragment.type === 'state' ? '#00d4ff'
                            : fragment.type === 'sensation' ? '#ffc800'
                            : '#9d4edd'
                        }}
                      />
                      <span className="font-mono text-sm text-[#f0f0f0]">{fragment.text}</span>
                      <span className="ml-auto font-mono text-xs text-[#f0f0f0]/30">
                        {(fragment.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotional Signature */}
              <div className="bg-[#0d0d0d] border border-[#00d4ff]/30 p-4">
                <h2 className="font-mono text-xs text-[#00d4ff] tracking-[0.2em] mb-4">
                  EMOTIONAL_SIGNATURE
                </h2>
                <div className="space-y-3">
                  {neuralData.emotionalSignature.map((emotion) => (
                    <div key={emotion.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-[#f0f0f0]/70 uppercase">
                          {emotion.id}
                        </span>
                        <span className="font-mono text-xs" style={{ color: emotion.color }}>
                          {emotion.intensity}%
                        </span>
                      </div>
                      <div className="h-1 bg-[#f0f0f0]/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${emotion.intensity}%`,
                            backgroundColor: emotion.color,
                            boxShadow: `0 0 10px ${emotion.color}66`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: Neural Narrative + Visualization */}
            <div className="col-span-12 lg:col-span-5 space-y-4">

              {/* Narrative Block */}
              <div className="bg-[#0d0d0d] border border-[#f0f0f0]/10 p-6 relative">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#ff2d6a]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#ff2d6a]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#ff2d6a]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#ff2d6a]" />

                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-xs text-[#ff2d6a] tracking-[0.2em]">NARRATIVE://</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#ff2d6a]/50 to-transparent" />
                </div>

                <p className="font-mono text-sm leading-relaxed text-[#f0f0f0]/90">
                  {processingState === 'raw' ? (
                    <span className="opacity-50">{neuralData.rawInput}</span>
                  ) : (
                    neuralData.narrative
                  )}
                </p>

                {processingState === 'understood' && (
                  <div className="mt-4 pt-4 border-t border-[#f0f0f0]/10">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-mono text-2xl text-[#ff2d6a]">{neuralData.cognitiveLoad}%</div>
                        <div className="font-mono text-[10px] text-[#f0f0f0]/40 tracking-wider">COGNITIVE_LOAD</div>
                      </div>
                      <div>
                        <div className="font-mono text-2xl text-[#00d4ff]">{neuralData.patternMatch}%</div>
                        <div className="font-mono text-[10px] text-[#f0f0f0]/40 tracking-wider">PATTERN_MATCH</div>
                      </div>
                      <div>
                        <div className="font-mono text-2xl text-[#ffc800]">{neuralData.validationStrength}%</div>
                        <div className="font-mono text-[10px] text-[#f0f0f0]/40 tracking-wider">VALIDATION</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Neural Network Visualization */}
              <div className="bg-[#0d0d0d] border border-[#ffc800]/30 p-4 relative overflow-hidden" style={{ height: '280px' }}>
                <h2 className="font-mono text-xs text-[#ffc800] tracking-[0.2em] mb-2">
                  SYNAPTIC_NETWORK
                </h2>

                <svg className="absolute inset-0 w-full h-full" style={{ top: '40px' }}>
                  {/* Connection lines */}
                  <defs>
                    <linearGradient id="synapse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff2d6a" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ffc800" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  {/* Central node connections */}
                  {thoughtClusters.map((cluster, i) => (
                    <g key={cluster.id}>
                      <line
                        x1="50%"
                        y1="50%"
                        x2={`${cluster.x}%`}
                        y2={`${cluster.y}%`}
                        stroke={cluster.color}
                        strokeWidth={activeSynapse === i ? 3 : 1}
                        className="synapse-line"
                        opacity={activeSynapse === i ? 1 : 0.3}
                      />
                    </g>
                  ))}

                  {/* Central experience node */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="12"
                    fill="#ff2d6a"
                    className={neuralPulse ? 'animate-pulse' : ''}
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="20"
                    fill="none"
                    stroke="#ff2d6a"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                </svg>

                {/* Cluster nodes */}
                {thoughtClusters.map((cluster, i) => (
                  <div
                    key={cluster.id}
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{
                      left: `${cluster.x}%`,
                      top: `calc(${cluster.y}% + 40px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onMouseEnter={() => setActiveSynapse(i)}
                    onMouseLeave={() => setActiveSynapse(null)}
                    onClick={() => setExpandedCluster(expandedCluster === cluster.id ? null : cluster.id)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                      style={{
                        borderColor: cluster.color,
                        backgroundColor: activeSynapse === i ? `${cluster.color}33` : 'transparent',
                        boxShadow: activeSynapse === i ? `0 0 20px ${cluster.color}66` : 'none'
                      }}
                    >
                      <span className="font-mono text-xs" style={{ color: cluster.color }}>
                        {cluster.experiences}
                      </span>
                    </div>
                    {activeSynapse === i && (
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="font-mono text-[10px] px-2 py-1 bg-[#0d0d0d] border" style={{ borderColor: cluster.color, color: cluster.color }}>
                          {cluster.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Synaptic Connections + Timeline */}
            <div className="col-span-12 lg:col-span-3 space-y-4">

              {/* Synaptic Connections */}
              <div className="bg-[#0d0d0d] border border-[#9d4edd]/30 p-4">
                <h2 className="font-mono text-xs text-[#9d4edd] tracking-[0.2em] mb-4">
                  SYNAPTIC_LINKS
                </h2>
                <div className="space-y-2">
                  {neuralData.synapticConnections.map((conn) => (
                    <div
                      key={conn.id}
                      className="group p-2 border border-[#f0f0f0]/10 hover:border-[#9d4edd]/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#f0f0f0]/70 group-hover:text-[#f0f0f0]">
                          {conn.label}
                        </span>
                        <span className="font-mono text-[10px] text-[#9d4edd]">
                          {conn.strength}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-0.5 bg-[#f0f0f0]/10 overflow-hidden">
                          <div
                            className="h-full bg-[#9d4edd] transition-all duration-500"
                            style={{ width: `${conn.strength}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-[#f0f0f0]/30">
                          {conn.nodes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Timeline */}
              <div className="bg-[#0d0d0d] border border-[#f0f0f0]/20 p-4">
                <h2 className="font-mono text-xs text-[#f0f0f0]/50 tracking-[0.2em] mb-4">
                  PROCESS_TIMELINE
                </h2>
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-[#ff2d6a] via-[#00d4ff] to-[#ffc800]" />
                  <div className="space-y-3 pl-6">
                    {neuralData.neuralTimeline.map((step, i) => (
                      <div key={step.phase} className="relative">
                        <div
                          className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2"
                          style={{
                            borderColor: i < 2 ? '#ff2d6a' : i < 4 ? '#00d4ff' : '#ffc800',
                            backgroundColor: processingState === 'understood' || i <= 2 ? (i < 2 ? '#ff2d6a' : i < 4 ? '#00d4ff' : '#ffc800') : 'transparent'
                          }}
                        />
                        <div className="font-mono text-[10px] text-[#f0f0f0]/30 tracking-wider">
                          {step.phase}
                        </div>
                        <div className="font-mono text-xs text-[#f0f0f0]/70">
                          {step.label}
                        </div>
                        <div className="font-mono text-[10px] text-[#f0f0f0]/20">
                          +{step.time}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contributor Info */}
              <div className="bg-[#0d0d0d] border border-[#00d4ff]/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff2d6a] to-[#00d4ff] flex items-center justify-center">
                    <span className="font-mono text-xs text-[#0d0d0d] font-bold">
                      {neuralData.contributor.handle.charAt(1).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-mono text-sm text-[#f0f0f0]">
                      {neuralData.contributor.handle}
                    </div>
                    <div className="font-mono text-[10px] text-[#f0f0f0]/40">
                      TRUST: {(neuralData.contributor.trustScore * 100).toFixed(0)}% | {neuralData.contributor.contributions} CONTRIB
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* FOOTER - Neural Metrics */}
          {/* ============================================ */}
          <footer className="mt-8 pt-6 border-t border-[#f0f0f0]/10">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-[#f0f0f0]/30">
                <span className="text-[#ff2d6a]">ULTRATHINK</span> v11.0 // NEURAL-BRUTALIST INTERFACE
              </div>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 border border-[#ff2d6a]/50 font-mono text-xs text-[#ff2d6a] hover:bg-[#ff2d6a]/10 transition-colors">
                  ◇ SHARE THOUGHT
                </button>
                <button className="px-4 py-2 bg-[#ff2d6a] font-mono text-xs text-[#0d0d0d] hover:bg-[#ff5a8a] transition-colors">
                  ◆ CONNECT SYNAPSE
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

// ============================================
// VERSION 12 - ULTRATHINK COMPLETE (FULL NEURAL INTERFACE)
// All 60+ features as interactive neural modules
// ============================================
function Version12({ showAnnotations }: { showAnnotations: boolean }) {
  const [processingState, setProcessingState] = useState<'raw' | 'analyzing' | 'understood'>('understood')
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [activeSynapse, setActiveSynapse] = useState<number | null>(null)
  const [processStream, setProcessStream] = useState([
    { time: '15:47:23', module: 'PATTERN_ENGINE', message: '3 new cluster matches identified', color: '#ff2d6a' },
    { time: '15:47:24', module: 'VALIDATION_CORE', message: 'Trust score recalculated: 87%', color: '#00d4ff' },
    { time: '15:47:25', module: 'GEO_NEURAL', message: 'Location verified: WIEN // AT', color: '#ffc800' },
    { time: '15:47:26', module: 'SIMILAR_FINDER', message: '12 related thoughts discovered', color: '#9d4edd' },
    { time: '15:47:27', module: 'XP_CORTEX', message: '+50 XP awarded for pattern contribution', color: '#00ff88' },
  ])

  // Complete neural data with all features
  const neuralData = {
    id: 'THOUGHT-2024-X847',
    rawInput: 'Schwarze Gestalt im Schlafzimmer',
    processedTitle: 'SCHATTENGESTALT // SCHLAFPARALYSE',
    cognitiveLoad: 94,
    patternMatch: 87,
    validationStrength: 78,
    timestamp: '2024-01-15T03:47:00Z',
    location: { lat: 48.2082, lng: 16.3738, decoded: 'WIEN // AT' },
    narrative: `Ich wachte auf und konnte mich nicht bewegen. Am Fußende des Bettes stand eine dunkle Gestalt – keine erkennbaren Gesichtszüge, nur pure Schwärze die das Licht zu absorbieren schien. Das Gefühl absoluter Präsenz war überwältigend. Nach etwa 30 Sekunden löste sich die Lähmung und die Gestalt verschwand nicht – sie war einfach nicht mehr da.`,
    emotionalSignature: [
      { id: 'terror', intensity: 95, color: '#ff2d6a' },
      { id: 'paralysis', intensity: 88, color: '#00d4ff' },
      { id: 'presence', intensity: 92, color: '#ffc800' },
      { id: 'dissolution', intensity: 45, color: '#9d4edd' },
    ],
    synapticConnections: [
      { id: 1, label: 'Schlafparalyse-Cluster', strength: 94, nodes: 234 },
      { id: 2, label: 'Schattengestalten', strength: 87, nodes: 156 },
      { id: 3, label: 'Nacht-Erfahrungen', strength: 76, nodes: 891 },
      { id: 4, label: 'Präsenz-Gefühl', strength: 82, nodes: 445 },
      { id: 5, label: 'Wien-Region', strength: 45, nodes: 67 },
    ],
    thoughtFragments: [
      { text: 'schwarze Gestalt', weight: 0.95, type: 'entity' },
      { text: 'konnte mich nicht bewegen', weight: 0.92, type: 'state' },
      { text: 'Fußende des Bettes', weight: 0.78, type: 'location' },
      { text: 'keine Gesichtszüge', weight: 0.85, type: 'attribute' },
      { text: 'absoluter Präsenz', weight: 0.89, type: 'sensation' },
      { text: 'Licht absorbieren', weight: 0.72, type: 'phenomenon' },
    ],
    // Media data
    media: { photos: 3, videos: 1, audio: 1, links: 2, docs: 0 },
    // Community data
    witnesses: 3,
    comments: 8,
    likes: 47,
    // Gamification
    xp: 450,
    level: 7,
    badges: ['🌙 Nachtwächter', '👁️ Visionär', '⚡ Pionier'],
    // Pattern data
    similarCount: 12,
    clusterMatch: 87,
    // Contribution
    contributionScore: 94,
    noveltyScore: 78,
    communityValue: 86,
    contributor: {
      handle: '@neural_witness_47',
      trustScore: 0.89,
      contributions: 12,
      level: 7,
    }
  }

  // Neural modules configuration
  const neuralModules = [
    { id: 'MEDIA_PROCESSOR', icon: '📷', label: 'MEDIA', value: `${neuralData.media.photos + neuralData.media.videos + neuralData.media.audio}`, color: '#ff2d6a', status: 'active' },
    { id: 'GEO_NEURAL', icon: '🗺️', label: 'LOCATION', value: 'WIEN', color: '#ffc800', status: 'active' },
    { id: 'PATTERN_ENGINE', icon: '🔮', label: 'PATTERN', value: `${neuralData.patternMatch}%`, color: '#9d4edd', status: 'processing' },
    { id: 'WITNESS_CORTEX', icon: '👥', label: 'WITNESS', value: `${neuralData.witnesses}`, color: '#00d4ff', status: 'active' },
    { id: 'IMPACT_ANALYZER', icon: '🎯', label: 'IMPACT', value: `${neuralData.contributionScore}%`, color: '#00ff88', status: 'active' },
    { id: 'TIMELINE_CORTEX', icon: '⏱️', label: 'TIME', value: '03:47', color: '#ff8c00', status: 'active' },
    { id: 'SIMILAR_FINDER', icon: '🔗', label: 'SIMILAR', value: `${neuralData.similarCount}`, color: '#ff2d6a', status: 'active' },
    { id: 'XP_CORTEX', icon: '⚡', label: 'XP', value: `${neuralData.xp}`, color: '#ffc800', status: 'active' },
    { id: 'COMMENTS_SYNAPSE', icon: '💬', label: 'DISCUSS', value: `${neuralData.comments}`, color: '#00d4ff', status: 'active' },
    { id: 'VALIDATE_ENGINE', icon: '✓', label: 'TRUST', value: `${neuralData.validationStrength}%`, color: '#00ff88', status: 'active' },
  ]

  const thoughtClusters = [
    { id: 'alpha', name: 'PRIMÄR-CLUSTER', experiences: 234, color: '#ff2d6a', x: 20, y: 30 },
    { id: 'beta', name: 'SEKUNDÄR-CLUSTER', experiences: 156, color: '#00d4ff', x: 75, y: 25 },
    { id: 'gamma', name: 'TERTIÄR-CLUSTER', experiences: 891, color: '#ffc800', x: 50, y: 75 },
    { id: 'delta', name: 'QUARTÄR-CLUSTER', experiences: 445, color: '#9d4edd', x: 85, y: 70 },
  ]

  return (
    <>
      {/* NEURAL BACKGROUND & ANIMATIONS */}
      <style jsx>{`
        @keyframes synapse-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes neural-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        @keyframes module-pulse {
          0%, 100% { border-color: rgba(255,45,106,0.3); box-shadow: none; }
          50% { border-color: rgba(255,45,106,0.8); box-shadow: 0 0 15px rgba(255,45,106,0.3); }
        }
        @keyframes stream-enter {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes glitch-text {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, 2px); }
          80% { transform: translate(1px, -2px); }
        }
        @keyframes data-process {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes thought-emerge {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes expand-module {
          0% { opacity: 0; max-height: 0; }
          100% { opacity: 1; max-height: 400px; }
        }
        .neural-grid {
          background-image:
            linear-gradient(rgba(255,45,106,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .module-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .module-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px var(--module-color);
        }
        .module-card.active {
          animation: module-pulse 2s ease-in-out infinite;
        }
        .synapse-line {
          animation: neural-flow 2s linear infinite;
          stroke-dasharray: 5 5;
        }
        .glitch-hover:hover {
          animation: glitch-text 0.3s ease-in-out;
        }
        .stream-entry {
          animation: stream-enter 0.3s ease-out forwards;
        }
        .processing-bar {
          background: linear-gradient(90deg, transparent 0%, var(--color) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: data-process 1.5s linear infinite;
        }
        .thought-fragment {
          animation: thought-emerge 0.5s ease-out forwards;
        }
        .expanded-module {
          animation: expand-module 0.3s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-[#0d0d0d] neural-grid relative overflow-hidden">
        {/* Scan line effect */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(transparent 50%, rgba(0,212,255,0.015) 50%)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* Floating neural particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#ff2d6a', '#00d4ff', '#ffc800', '#9d4edd', '#00ff88'][i % 5],
                opacity: Math.random() * 0.5 + 0.2,
                animation: `synapse-pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-20">

          {showAnnotations && (
            <Annotation color="purple">
              <strong>V12 ULTRATHINK COMPLETE:</strong> Die ultimative Neural-Brutalist Page mit ALLEN 60+ Features als interaktive Module.
              Jedes Feature ist als klickbares "Neural Module" dargestellt. PROCESS_STREAM zeigt Live-Aktivität.
              Erweiterung von V11 mit vollständiger Feature-Integration und Module-Expansion.
            </Annotation>
          )}

          {/* ============================================ */}
          {/* NEURAL HEADER - Enhanced from V11 */}
          {/* ============================================ */}
          <header className="mb-6 border-b border-[#ff2d6a]/20 pb-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              {/* Left: ID & Status */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d6a] to-[#00d4ff] font-mono text-xs tracking-[0.3em]">
                    THOUGHT://
                  </span>
                  <span className="font-mono text-[#f0f0f0] text-sm glitch-hover">
                    {neuralData.id}
                  </span>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#00ff88]/20 to-[#00ff88]/10 border border-[#00ff88]/50 rounded text-[10px] font-mono text-[#00ff88]">
                    COMPLETE
                  </span>
                </div>
                <h1 className="font-mono text-2xl md:text-4xl font-bold text-[#f0f0f0] tracking-tight">
                  {neuralData.processedTitle.split(' // ').map((part, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d6a] to-[#00d4ff] mx-2">//</span>}
                      <span className={i === 0 ? 'text-[#ff2d6a]' : 'text-[#f0f0f0]'}>{part}</span>
                    </span>
                  ))}
                </h1>
                <div className="flex items-center gap-4 mt-3 text-xs font-mono text-[#f0f0f0]/50 flex-wrap">
                  <span className="text-[#ffc800]">📍 {neuralData.location.decoded}</span>
                  <span className="text-[#ff2d6a]">|</span>
                  <span>📅 {new Date(neuralData.timestamp).toLocaleDateString('de-AT')}</span>
                  <span className="text-[#ff2d6a]">|</span>
                  <span className="text-[#00d4ff]">@{neuralData.contributor.handle.replace('@', '')}</span>
                  <span className="text-[#ff2d6a]">|</span>
                  <span className="text-[#ffc800]">⚡ Lvl {neuralData.contributor.level}</span>
                </div>
              </div>

              {/* Right: Processing State + Quick Stats */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2">
                  {['raw', 'analyzing', 'understood'].map((state) => (
                    <button
                      key={state}
                      onClick={() => setProcessingState(state as typeof processingState)}
                      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-all ${
                        processingState === state
                          ? state === 'raw'
                            ? 'bg-[#ff2d6a]/20 border-[#ff2d6a] text-[#ff2d6a]'
                            : state === 'analyzing'
                            ? 'bg-[#ffc800]/20 border-[#ffc800] text-[#ffc800] animate-pulse'
                            : 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]'
                          : 'border-[#f0f0f0]/20 text-[#f0f0f0]/40 hover:border-[#f0f0f0]/40'
                      }`}
                    >
                      {state === 'raw' ? '◇ RAW' : state === 'analyzing' ? '◈ PROCESSING' : '◆ UNDERSTOOD'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-[#ff2d6a]">❤️ {neuralData.likes}</span>
                  <span className="text-[#00d4ff]">💬 {neuralData.comments}</span>
                  <span className="text-[#ffc800]">⚡ {neuralData.xp} XP</span>
                </div>
              </div>
            </div>
          </header>

          {/* ============================================ */}
          {/* MAIN GRID - 3 Column Layout */}
          {/* ============================================ */}
          <div className="grid grid-cols-12 gap-4">

            {/* LEFT COLUMN: Thought Fragments + Emotional Signature */}
            <div className="col-span-12 lg:col-span-3 space-y-4">

              {/* Thought Fragments Panel */}
              <div className="bg-[#0d0d0d] border border-[#ff2d6a]/30 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-xs text-[#ff2d6a] tracking-[0.2em]">
                    THOUGHT_FRAGMENTS
                  </h2>
                  <span className="text-[10px] font-mono text-[#f0f0f0]/30">
                    {neuralData.thoughtFragments.length} EXTRACTED
                  </span>
                </div>
                <div className="space-y-2">
                  {neuralData.thoughtFragments.map((fragment, i) => (
                    <div
                      key={i}
                      className="thought-fragment flex items-center gap-3 p-2 border-l-2 hover:bg-[#ff2d6a]/5 transition-colors cursor-pointer"
                      style={{
                        borderColor: fragment.type === 'entity' ? '#ff2d6a'
                          : fragment.type === 'state' ? '#00d4ff'
                          : fragment.type === 'sensation' ? '#ffc800'
                          : '#9d4edd',
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      <span className="font-mono text-xs text-[#f0f0f0]">{fragment.text}</span>
                      <span className="ml-auto font-mono text-[10px] text-[#f0f0f0]/30">
                        {(fragment.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotional Signature */}
              <div className="bg-[#0d0d0d] border border-[#00d4ff]/30 p-4">
                <h2 className="font-mono text-xs text-[#00d4ff] tracking-[0.2em] mb-4">
                  EMOTIONAL_SIGNATURE
                </h2>
                <div className="space-y-3">
                  {neuralData.emotionalSignature.map((emotion) => (
                    <div key={emotion.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-[#f0f0f0]/70 uppercase">
                          {emotion.id}
                        </span>
                        <span className="font-mono text-[10px]" style={{ color: emotion.color }}>
                          {emotion.intensity}%
                        </span>
                      </div>
                      <div className="h-1 bg-[#f0f0f0]/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${emotion.intensity}%`,
                            backgroundColor: emotion.color,
                            boxShadow: `0 0 10px ${emotion.color}66`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges Display */}
              <div className="bg-[#0d0d0d] border border-[#ffc800]/30 p-4">
                <h2 className="font-mono text-xs text-[#ffc800] tracking-[0.2em] mb-3">
                  BADGES_EARNED
                </h2>
                <div className="flex flex-wrap gap-2">
                  {neuralData.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#ffc800]/10 border border-[#ffc800]/30 rounded text-[10px] font-mono text-[#ffc800]"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: Narrative + Neural Modules Grid */}
            <div className="col-span-12 lg:col-span-6 space-y-4">

              {/* Narrative Block */}
              <div className="bg-[#0d0d0d] border border-[#f0f0f0]/10 p-6 relative">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#ff2d6a]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00d4ff]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#00d4ff]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#ff2d6a]" />

                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-xs text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d6a] to-[#00d4ff] tracking-[0.2em]">NARRATIVE_CORE://</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#ff2d6a]/50 via-[#9d4edd]/30 to-[#00d4ff]/50" />
                </div>

                <p className="font-mono text-sm leading-relaxed text-[#f0f0f0]/90">
                  {processingState === 'raw' ? (
                    <span className="opacity-50">{neuralData.rawInput}</span>
                  ) : (
                    neuralData.narrative
                  )}
                </p>

                {processingState === 'understood' && (
                  <div className="mt-4 pt-4 border-t border-[#f0f0f0]/10">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-mono text-xl text-[#ff2d6a]">{neuralData.cognitiveLoad}%</div>
                        <div className="font-mono text-[9px] text-[#f0f0f0]/40 tracking-wider">COGNITIVE_LOAD</div>
                      </div>
                      <div>
                        <div className="font-mono text-xl text-[#00d4ff]">{neuralData.patternMatch}%</div>
                        <div className="font-mono text-[9px] text-[#f0f0f0]/40 tracking-wider">PATTERN_MATCH</div>
                      </div>
                      <div>
                        <div className="font-mono text-xl text-[#ffc800]">{neuralData.validationStrength}%</div>
                        <div className="font-mono text-[9px] text-[#f0f0f0]/40 tracking-wider">VALIDATION</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================ */}
              {/* NEURAL MODULES GRID - The heart of V12 */}
              {/* ============================================ */}
              <div className="bg-[#0d0d0d]/50 border border-[#9d4edd]/30 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-xs text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d6a] to-[#00d4ff] tracking-[0.2em]">
                    NEURAL_MODULES_GRID
                  </h2>
                  <span className="text-[10px] font-mono text-[#f0f0f0]/30">
                    {neuralModules.length} ACTIVE MODULES
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {neuralModules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                      className={`module-card p-3 border rounded-lg text-center transition-all cursor-pointer ${
                        expandedModule === module.id ? 'ring-2' : ''
                      } ${module.status === 'processing' ? 'active' : ''}`}
                      style={{
                        borderColor: `${module.color}44`,
                        backgroundColor: expandedModule === module.id ? `${module.color}15` : 'transparent',
                        '--module-color': `${module.color}44`,
                        ringColor: module.color,
                      } as React.CSSProperties}
                    >
                      <div className="text-lg mb-1">{module.icon}</div>
                      <div className="font-mono text-[9px] text-[#f0f0f0]/50 tracking-wider mb-1">{module.label}</div>
                      <div className="font-mono text-sm font-bold" style={{ color: module.color }}>{module.value}</div>
                      {module.status === 'processing' && (
                        <div
                          className="h-0.5 mt-2 rounded processing-bar"
                          style={{ '--color': module.color } as React.CSSProperties}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Expanded Module View */}
                {expandedModule && (
                  <div className="expanded-module mt-4 p-4 border border-[#f0f0f0]/10 rounded-lg bg-[#0d0d0d]">
                    {expandedModule === 'MEDIA_PROCESSOR' && (
                      <div>
                        <h3 className="font-mono text-xs text-[#ff2d6a] mb-3">MEDIA_PROCESSOR://</h3>
                        <div className="flex gap-3 mb-3">
                          <span className="px-2 py-1 bg-[#ff2d6a]/10 border border-[#ff2d6a]/30 rounded text-xs font-mono text-[#ff2d6a]">📷 Photos: {neuralData.media.photos}</span>
                          <span className="px-2 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded text-xs font-mono text-[#00d4ff]">🎬 Videos: {neuralData.media.videos}</span>
                          <span className="px-2 py-1 bg-[#ffc800]/10 border border-[#ffc800]/30 rounded text-xs font-mono text-[#ffc800]">🎤 Audio: {neuralData.media.audio}</span>
                          <span className="px-2 py-1 bg-[#9d4edd]/10 border border-[#9d4edd]/30 rounded text-xs font-mono text-[#9d4edd]">🔗 Links: {neuralData.media.links}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square bg-gradient-to-br from-[#ff2d6a]/20 to-[#00d4ff]/20 rounded border border-[#f0f0f0]/10 flex items-center justify-center">
                              <span className="text-2xl opacity-50">📷</span>
                            </div>
                          ))}
                          <div className="aspect-square bg-gradient-to-br from-[#ffc800]/20 to-[#9d4edd]/20 rounded border border-[#f0f0f0]/10 flex items-center justify-center">
                            <span className="text-2xl opacity-50">🎬</span>
                          </div>
                        </div>
                        <div className="mt-3 text-[10px] font-mono text-[#f0f0f0]/40">
                          PROCESSING_STATE: ◆ READY | ANALYZED: 5/5 items | EXTRACTED: faces, text, geo
                        </div>
                      </div>
                    )}
                    {expandedModule === 'XP_CORTEX' && (
                      <div>
                        <h3 className="font-mono text-xs text-[#ffc800] mb-3">XP_CORTEX://</h3>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-center">
                            <div className="font-mono text-3xl text-[#ffc800]">⚡ {neuralData.xp}</div>
                            <div className="font-mono text-[10px] text-[#f0f0f0]/40">TOTAL XP</div>
                          </div>
                          <div className="text-center">
                            <div className="font-mono text-2xl text-[#00ff88]">Lvl {neuralData.level}</div>
                            <div className="font-mono text-[10px] text-[#f0f0f0]/40">CURRENT LEVEL</div>
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-[#f0f0f0]/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#ffc800] to-[#00ff88]" style={{ width: '65%' }} />
                            </div>
                            <div className="font-mono text-[10px] text-[#f0f0f0]/40 mt-1">65% to next level</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {neuralData.badges.map((badge, i) => (
                            <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-[#ffc800]/20 to-[#00ff88]/20 border border-[#ffc800]/40 rounded-lg text-xs font-mono text-[#ffc800]">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {expandedModule === 'PATTERN_ENGINE' && (
                      <div>
                        <h3 className="font-mono text-xs text-[#9d4edd] mb-3">PATTERN_ENGINE://</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-[#9d4edd]/10 rounded border border-[#9d4edd]/30">
                            <div className="font-mono text-xl text-[#9d4edd]">{neuralData.clusterMatch}%</div>
                            <div className="font-mono text-[9px] text-[#f0f0f0]/40">CLUSTER_MATCH</div>
                          </div>
                          <div className="text-center p-3 bg-[#ff2d6a]/10 rounded border border-[#ff2d6a]/30">
                            <div className="font-mono text-xl text-[#ff2d6a]">{neuralData.similarCount}</div>
                            <div className="font-mono text-[9px] text-[#f0f0f0]/40">SIMILAR_FOUND</div>
                          </div>
                          <div className="text-center p-3 bg-[#00d4ff]/10 rounded border border-[#00d4ff]/30">
                            <div className="font-mono text-xl text-[#00d4ff]">5</div>
                            <div className="font-mono text-[9px] text-[#f0f0f0]/40">CLUSTERS</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {neuralData.synapticConnections.slice(0, 3).map((conn) => (
                            <div key={conn.id} className="flex items-center gap-3 p-2 bg-[#f0f0f0]/5 rounded">
                              <div className="w-2 h-2 rounded-full bg-[#9d4edd]" />
                              <span className="font-mono text-xs text-[#f0f0f0]/70 flex-1">{conn.label}</span>
                              <span className="font-mono text-xs text-[#9d4edd]">{conn.strength}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {expandedModule === 'COMMENTS_SYNAPSE' && (
                      <div>
                        <h3 className="font-mono text-xs text-[#00d4ff] mb-3">COMMENTS_SYNAPSE://</h3>
                        <div className="space-y-3">
                          {[
                            { user: '@shadow_hunter', text: 'Ähnliches erlebt in Wien, März 2023...', time: '2h ago' },
                            { user: '@neural_witness_12', text: 'Klassisches Schlafparalyse-Pattern!', time: '4h ago' },
                            { user: '@xp_researcher', text: 'Hat jemand die Frequenz-Daten analysiert?', time: '6h ago' },
                          ].map((comment, i) => (
                            <div key={i} className="p-2 bg-[#00d4ff]/5 border-l-2 border-[#00d4ff]/50 rounded-r">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-[10px] text-[#00d4ff]">{comment.user}</span>
                                <span className="font-mono text-[9px] text-[#f0f0f0]/30">{comment.time}</span>
                              </div>
                              <p className="font-mono text-xs text-[#f0f0f0]/70">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                        <button className="mt-3 w-full py-2 border border-[#00d4ff]/30 rounded font-mono text-xs text-[#00d4ff] hover:bg-[#00d4ff]/10 transition">
                          VIEW ALL {neuralData.comments} COMMENTS →
                        </button>
                      </div>
                    )}
                    {expandedModule === 'GEO_NEURAL' && (
                      <div>
                        <h3 className="font-mono text-xs text-[#ffc800] mb-3">GEO_NEURAL://</h3>
                        <div className="aspect-video bg-gradient-to-br from-[#ffc800]/10 to-[#00d4ff]/10 rounded border border-[#ffc800]/30 flex items-center justify-center mb-3">
                          <div className="text-center">
                            <span className="text-4xl">🗺️</span>
                            <div className="font-mono text-xs text-[#ffc800] mt-2">{neuralData.location.decoded}</div>
                            <div className="font-mono text-[10px] text-[#f0f0f0]/40 mt-1">
                              {neuralData.location.lat.toFixed(4)}°N, {neuralData.location.lng.toFixed(4)}°E
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-[#ffc800]/10 border border-[#ffc800]/30 rounded text-[10px] font-mono text-[#ffc800]">67 nearby experiences</span>
                          <span className="px-2 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded text-[10px] font-mono text-[#00d4ff]">5 km radius</span>
                        </div>
                      </div>
                    )}
                    {expandedModule === 'IMPACT_ANALYZER' && (
                      <div>
                        <h3 className="font-mono text-xs text-[#00ff88] mb-3">IMPACT_ANALYZER://</h3>
                        <div className="space-y-3">
                          {[
                            { label: 'CONTRIBUTION_SCORE', value: neuralData.contributionScore, color: '#00ff88' },
                            { label: 'NOVELTY_SCORE', value: neuralData.noveltyScore, color: '#ff2d6a' },
                            { label: 'COMMUNITY_VALUE', value: neuralData.communityValue, color: '#00d4ff' },
                          ].map((metric) => (
                            <div key={metric.label}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[10px] text-[#f0f0f0]/50">{metric.label}</span>
                                <span className="font-mono text-sm" style={{ color: metric.color }}>{metric.value}%</span>
                              </div>
                              <div className="h-1.5 bg-[#f0f0f0]/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!['MEDIA_PROCESSOR', 'XP_CORTEX', 'PATTERN_ENGINE', 'COMMENTS_SYNAPSE', 'GEO_NEURAL', 'IMPACT_ANALYZER'].includes(expandedModule) && (
                      <div className="text-center py-4">
                        <span className="font-mono text-xs text-[#f0f0f0]/40">
                          {expandedModule}:// Module details loading...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Synaptic Network + Process Stream */}
            <div className="col-span-12 lg:col-span-3 space-y-4">

              {/* Synaptic Connections */}
              <div className="bg-[#0d0d0d] border border-[#9d4edd]/30 p-4">
                <h2 className="font-mono text-xs text-[#9d4edd] tracking-[0.2em] mb-4">
                  SYNAPTIC_LINKS
                </h2>
                <div className="space-y-2">
                  {neuralData.synapticConnections.map((conn) => (
                    <div
                      key={conn.id}
                      className="group p-2 border border-[#f0f0f0]/10 hover:border-[#9d4edd]/50 transition-all cursor-pointer rounded"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#f0f0f0]/70 group-hover:text-[#f0f0f0]">
                          {conn.label}
                        </span>
                        <span className="font-mono text-[10px] text-[#9d4edd]">
                          {conn.strength}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-0.5 bg-[#f0f0f0]/10 overflow-hidden rounded">
                          <div
                            className="h-full bg-[#9d4edd] transition-all duration-500"
                            style={{ width: `${conn.strength}%` }}
                          />
                        </div>
                        <span className="font-mono text-[9px] text-[#f0f0f0]/30">
                          {conn.nodes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synaptic Network Visualization */}
              <div className="bg-[#0d0d0d] border border-[#ffc800]/30 p-4 relative overflow-hidden" style={{ height: '200px' }}>
                <h2 className="font-mono text-xs text-[#ffc800] tracking-[0.2em] mb-2">
                  SYNAPTIC_NETWORK
                </h2>

                <svg className="absolute inset-0 w-full h-full" style={{ top: '30px' }}>
                  {/* Connection lines */}
                  {thoughtClusters.map((cluster, i) => (
                    <line
                      key={cluster.id}
                      x1="50%"
                      y1="50%"
                      x2={`${cluster.x}%`}
                      y2={`${cluster.y}%`}
                      stroke={cluster.color}
                      strokeWidth={activeSynapse === i ? 2 : 1}
                      className="synapse-line"
                      opacity={activeSynapse === i ? 1 : 0.3}
                    />
                  ))}

                  {/* Central node */}
                  <circle cx="50%" cy="50%" r="8" fill="#ff2d6a" className="animate-pulse" />
                  <circle cx="50%" cy="50%" r="14" fill="none" stroke="#ff2d6a" strokeWidth="1" opacity="0.3" />
                </svg>

                {/* Cluster nodes */}
                {thoughtClusters.map((cluster, i) => (
                  <div
                    key={cluster.id}
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{
                      left: `${cluster.x}%`,
                      top: `calc(${cluster.y}% + 30px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onMouseEnter={() => setActiveSynapse(i)}
                    onMouseLeave={() => setActiveSynapse(null)}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center border transition-all"
                      style={{
                        borderColor: cluster.color,
                        backgroundColor: activeSynapse === i ? `${cluster.color}33` : 'transparent',
                        boxShadow: activeSynapse === i ? `0 0 15px ${cluster.color}66` : 'none'
                      }}
                    >
                      <span className="font-mono text-[8px]" style={{ color: cluster.color }}>
                        {cluster.experiences}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Process Stream - Live Feed */}
              <div className="bg-[#0d0d0d] border border-[#00ff88]/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-mono text-xs text-[#00ff88] tracking-[0.2em]">
                    PROCESS_STREAM
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {processStream.map((entry, i) => (
                    <div
                      key={i}
                      className="stream-entry text-[9px] font-mono p-1.5 bg-[#f0f0f0]/5 rounded"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <span className="text-[#f0f0f0]/40">[{entry.time}]</span>{' '}
                      <span style={{ color: entry.color }}>{entry.module}</span>{' '}
                      <span className="text-[#f0f0f0]/60">→ {entry.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributor Info */}
              <div className="bg-[#0d0d0d] border border-[#00d4ff]/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff2d6a] via-[#9d4edd] to-[#00d4ff] flex items-center justify-center">
                    <span className="font-mono text-xs text-white font-bold">
                      {neuralData.contributor.handle.charAt(1).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-sm text-[#f0f0f0]">
                      {neuralData.contributor.handle}
                    </div>
                    <div className="font-mono text-[9px] text-[#f0f0f0]/40">
                      TRUST: {(neuralData.contributor.trustScore * 100).toFixed(0)}% | {neuralData.contributor.contributions} CONTRIB | Lvl {neuralData.contributor.level}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* FOOTER - Neural Complete */}
          {/* ============================================ */}
          <footer className="mt-8 pt-6 border-t border-[#f0f0f0]/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="font-mono text-xs text-[#f0f0f0]/30">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d6a] to-[#00d4ff]">ULTRATHINK</span> v12.0 // COMPLETE NEURAL INTERFACE // {neuralModules.length} MODULES ACTIVE
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-[#ff2d6a]/50 font-mono text-xs text-[#ff2d6a] hover:bg-[#ff2d6a]/10 transition-colors rounded">
                  ◇ SHARE_THOUGHT
                </button>
                <button className="px-4 py-2 border border-[#9d4edd]/50 font-mono text-xs text-[#9d4edd] hover:bg-[#9d4edd]/10 transition-colors rounded">
                  ◈ EXPORT_NEURAL
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-[#ff2d6a] to-[#00d4ff] font-mono text-xs text-white hover:opacity-90 transition-opacity rounded">
                  ◆ CONNECT_SYNAPSE
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

// ============================================
// VERSION 13 - ESSENCE (Minimalist State-of-the-Art)
// ============================================
function Version13({ showAnnotations }: { showAnnotations: boolean }) {
  const [activeTab, setActiveTab] = useState<'similar' | 'patterns' | 'media' | 'impact' | 'community'>('similar')
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null)
  const [storyExpanded, setStoryExpanded] = useState(false)
  const [likeCount, setLikeCount] = useState(47)
  const [isLiked, setIsLiked] = useState(false)

  // Mock data
  const experience = {
    id: 'XP-2024-1847',
    title: 'Schattengestalt bei Schlafparalyse',
    story: 'Es war genau 3:47 Uhr, als ich aufwachte und mich nicht bewegen konnte. In der Ecke meines Zimmers stand eine Gestalt – eine Silhouette, die kein Licht reflektierte. Sie bewegte sich nicht, aber ich spürte ihre Präsenz wie einen Druck auf meiner Brust. Nach etwa zwei Minuten, die sich wie Stunden anfühlten, löste sich die Gestalt einfach auf, als hätte sie nie existiert. Ich lag noch eine Stunde wach, zu erschrocken um die Augen zu schließen. Am nächsten Morgen fand ich im Forum einen Thread mit fast identischen Berichten – alle zwischen 3 und 4 Uhr nachts.',
    author: { name: 'Maria S.', avatar: '👤', level: 12, xp: 2450 },
    location: 'Wien, Österreich',
    time: '03:47',
    date: 'Nov 2024',
    category: 'Schlafparalyse',
    mediaCount: { photos: 3, videos: 1, audio: 1, links: 2, docs: 0 },
    similarCount: 15,
    witnessCount: 3,
    commentCount: 8,
    patternMatch: 87,
    badges: [
      { name: 'First Share', icon: '🌟' },
      { name: 'Pattern Finder', icon: '🔗' },
    ],
  }

  const similarExperiences = [
    { id: 1, title: 'Dunkle Gestalt am Bettrand', match: 87, author: 'Thomas K.', category: 'Schlafparalyse' },
    { id: 2, title: 'Schattenmann im Türrahmen', match: 82, author: 'Lisa M.', category: 'Schlafparalyse' },
    { id: 3, title: 'Paralysiert mit Präsenz', match: 76, author: 'Stefan R.', category: 'Schlafparalyse' },
  ]

  const accordionItems = [
    { id: 'witnesses', label: 'Zeugen', count: 3 },
    { id: 'qa', label: 'Q&A Antworten', count: 5 },
    { id: 'events', label: 'Externe Ereignisse', count: 2 },
    { id: 'tags', label: 'Tags & Kategorien', count: 4 },
    { id: 'validation', label: 'Validierung', count: null },
  ]

  return (
    <>
      {/* CSS Variables & Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .v13-fade-in { animation: fadeIn 0.3s ease-out; }
        .v13-slide-up { animation: slideUp 0.3s ease-out; }
      `}</style>

      <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
        {/* Minimal Header */}
        <header
          className="sticky top-28 z-40 px-6 py-4 flex items-center justify-between border-b"
          style={{
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center gap-4">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ background: '#141414' }}
            >
              <span className="text-[#F0F0F0]">←</span>
            </button>
            <h1
              className="text-lg font-semibold truncate max-w-md"
              style={{ color: '#F0F0F0' }}
            >
              {experience.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsLiked(!isLiked); setLikeCount(isLiked ? likeCount - 1 : likeCount + 1) }}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isLiked ? 'rgba(200, 182, 255, 0.2)' : '#141414',
              }}
            >
              <span style={{ color: isLiked ? '#C8B6FF' : 'rgba(255,255,255,0.7)' }}>
                {isLiked ? '♥' : '♡'}
              </span>
            </button>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ background: '#141414' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>↗</span>
            </button>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ background: '#141414' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>•••</span>
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">
          {/* Annotation */}
          {showAnnotations && (
            <div className="mb-6 p-4 rounded-xl border" style={{ background: 'rgba(200, 182, 255, 0.1)', borderColor: 'rgba(200, 182, 255, 0.3)' }}>
              <p className="text-sm" style={{ color: '#C8B6FF' }}>
                ✧ <strong>V13 ESSENCE</strong> - Minimalist, State-of-the-Art. Progressive Disclosure: 60+ Features intelligent strukturiert.
                Inspiriert von Linear, Apple, Notion. Dark Mode + Digital Lavender Accent.
              </p>
            </div>
          )}

          {/* Bento Grid: Hero + Author */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-6 v13-slide-up">
            {/* Hero Image */}
            <div
              className="relative aspect-video rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">Hero Image</p>
                </div>
              </div>
              {/* Category Badge */}
              <div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(200, 182, 255, 0.2)', color: '#C8B6FF' }}
              >
                {experience.category}
              </div>
            </div>

            {/* Author Card */}
            <div
              className="p-6 rounded-2xl border"
              style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3"
                  style={{ background: 'rgba(200, 182, 255, 0.2)' }}
                >
                  {experience.author.avatar}
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#F0F0F0' }}>{experience.author.name}</h3>
                <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Level {experience.author.level}</p>

                {/* XP Progress */}
                <div className="w-full mb-4">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: '65%', background: '#C8B6FF' }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{experience.author.xp} XP</p>
                </div>

                {/* Badges */}
                <div className="flex gap-2">
                  {experience.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      {badge.icon} {badge.name}
                    </span>
                  ))}
                </div>

                <button
                  className="w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: '#C8B6FF', color: '#0A0A0A' }}
                >
                  Folgen
                </button>
              </div>
            </div>
          </div>

          {/* Story Block */}
          <div
            className="p-6 rounded-2xl border mb-6 v13-slide-up"
            style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)', animationDelay: '0.1s' }}
          >
            <p
              className="text-base leading-relaxed"
              style={{
                color: 'rgba(255,255,255,0.9)',
                display: '-webkit-box',
                WebkitLineClamp: storyExpanded ? 'unset' : 4,
                WebkitBoxOrient: 'vertical',
                overflow: storyExpanded ? 'visible' : 'hidden',
              }}
            >
              {experience.story}
            </p>
            {experience.story.length > 200 && (
              <button
                onClick={() => setStoryExpanded(!storyExpanded)}
                className="mt-3 text-sm font-medium transition-colors"
                style={{ color: '#C8B6FF' }}
              >
                {storyExpanded ? 'Weniger anzeigen ↑' : 'Mehr lesen ↓'}
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-3 mb-8 v13-slide-up" style={{ animationDelay: '0.15s' }}>
            <div
              className="px-4 py-2.5 rounded-full flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#1a1a1a]"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>📍</span>
              <span style={{ color: '#F0F0F0' }} className="text-sm">{experience.location}</span>
            </div>
            <div
              className="px-4 py-2.5 rounded-full flex items-center gap-2"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>🕐</span>
              <span style={{ color: '#F0F0F0' }} className="text-sm">{experience.time}</span>
            </div>
            <div
              className="px-4 py-2.5 rounded-full flex items-center gap-2"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>📅</span>
              <span style={{ color: '#F0F0F0' }} className="text-sm">{experience.date}</span>
            </div>
            <div
              className="px-4 py-2.5 rounded-full flex items-center gap-2"
              style={{ background: 'rgba(200, 182, 255, 0.15)', border: '1px solid rgba(200, 182, 255, 0.3)' }}
            >
              <span style={{ color: '#C8B6FF' }} className="text-sm font-medium">{experience.patternMatch}% Match</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mb-8" style={{ background: 'rgba(255,255,255,0.1)' }} />

          {/* Explore Section */}
          <section className="mb-8">
            <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Explore
            </h2>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: '#141414' }}>
              {[
                { id: 'similar', label: 'Ähnliche', count: experience.similarCount },
                { id: 'patterns', label: 'Muster', count: null },
                { id: 'media', label: 'Medien', count: experience.mediaCount.photos + experience.mediaCount.videos },
                { id: 'impact', label: 'Impact', count: null },
                { id: 'community', label: 'Community', count: experience.commentCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    background: activeTab === tab.id ? '#C8B6FF' : 'transparent',
                    color: activeTab === tab.id ? '#0A0A0A' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {tab.label}
                  {tab.count && (
                    <span
                      className="ml-1.5 text-xs"
                      style={{ opacity: activeTab === tab.id ? 0.7 : 0.5 }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="v13-fade-in">
              {activeTab === 'similar' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarExperiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-xl border cursor-pointer transition-all hover:border-[#C8B6FF]/30"
                      style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ background: 'rgba(200, 182, 255, 0.2)', color: '#C8B6FF' }}
                        >
                          {exp.match}%
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }} className="text-xs">{exp.category}</span>
                      </div>
                      <h4 className="font-medium mb-2 line-clamp-2" style={{ color: '#F0F0F0' }}>{exp.title}</h4>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>von {exp.author}</p>
                    </div>
                  ))}
                  <div
                    className="p-4 rounded-xl border flex items-center justify-center cursor-pointer transition-all hover:border-[#C8B6FF]/30"
                    style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>+ {experience.similarCount - 3} weitere</span>
                  </div>
                </div>
              )}

              {activeTab === 'patterns' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div
                    className="p-6 rounded-xl border aspect-video flex items-center justify-center"
                    style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🗺️</span>
                      <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">Geographic Heatmap</p>
                    </div>
                  </div>
                  <div
                    className="p-6 rounded-xl border aspect-video flex items-center justify-center"
                    style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📊</span>
                      <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">Timeline Chart</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(experience.mediaCount.photos)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <span className="text-3xl">📷</span>
                    </div>
                  ))}
                  {experience.mediaCount.videos > 0 && (
                    <div
                      className="aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <span className="text-3xl">🎬</span>
                    </div>
                  )}
                  {experience.mediaCount.audio > 0 && (
                    <div
                      className="aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <span className="text-3xl">🎙️</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'impact' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* XP Card */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <h4 className="font-medium mb-4" style={{ color: '#F0F0F0' }}>Experience Points</h4>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#C8B6FF' }}>+125 XP</div>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>für diesen Beitrag erhalten</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Erstes Teilen</span>
                        <span style={{ color: '#10B981' }}>+50 XP</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Pattern Match</span>
                        <span style={{ color: '#10B981' }}>+50 XP</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Community Engagement</span>
                        <span style={{ color: '#10B981' }}>+25 XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Contribution Score */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <h4 className="font-medium mb-4" style={{ color: '#F0F0F0' }}>Contribution Score</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Detailtiefe</span>
                          <span style={{ color: '#F0F0F0' }}>92%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: '92%', background: '#C8B6FF' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Pattern-Relevanz</span>
                          <span style={{ color: '#F0F0F0' }}>87%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: '87%', background: '#C8B6FF' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Validierung</span>
                          <span style={{ color: '#F0F0F0' }}>78%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: '78%', background: '#C8B6FF' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'community' && (
                <div className="space-y-4">
                  {/* Comments Preview */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border"
                      style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ background: 'rgba(200, 182, 255, 0.2)' }}
                        >
                          👤
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm" style={{ color: '#F0F0F0' }}>User {i}</span>
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>vor {i} Stunde{i > 1 ? 'n' : ''}</span>
                          </div>
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            Das klingt sehr ähnlich zu meiner Erfahrung letzte Woche...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: '#141414', color: '#C8B6FF', border: '1px solid rgba(200, 182, 255, 0.3)' }}
                  >
                    Alle {experience.commentCount} Kommentare anzeigen
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Details Section (Accordion) */}
          <section className="mb-8">
            <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Details
            </h2>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ background: '#141414', borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              {accordionItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{ borderTop: index > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
                >
                  <button
                    onClick={() => setExpandedAccordion(expandedAccordion === item.id ? null : item.id)}
                    className="w-full px-5 py-4 flex items-center justify-between transition-colors hover:bg-[#1a1a1a]"
                  >
                    <span className="font-medium" style={{ color: '#F0F0F0' }}>
                      {item.label}
                      {item.count && (
                        <span className="ml-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>({item.count})</span>
                      )}
                    </span>
                    <span
                      className="transition-transform duration-200"
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        transform: expandedAccordion === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▼
                    </span>
                  </button>
                  {expandedAccordion === item.id && (
                    <div
                      className="px-5 pb-4 v13-fade-in"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      <p className="text-sm">
                        {item.id === 'witnesses' && '3 Zeugen haben diese Erfahrung bestätigt.'}
                        {item.id === 'qa' && '5 Fragen wurden beantwortet.'}
                        {item.id === 'events' && 'Neumond, klarer Himmel, 12°C'}
                        {item.id === 'tags' && 'Schlafparalyse, Schattengestalt, Nacht, Wien'}
                        {item.id === 'validation' && 'Trust Score: 87% basierend auf Pattern-Matching und Community-Feedback.'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Minimal Footer */}
        <footer
          className="px-6 py-6 flex items-center justify-between border-t"
          style={{ background: '#0A0A0A', borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            XP-Share • Essence v13.0
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ background: '#141414', color: 'rgba(255,255,255,0.7)' }}
            >
              Report
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ background: '#C8B6FF', color: '#0A0A0A' }}
            >
              Export
            </button>
          </div>
        </footer>
      </div>
    </>
  )
}

// ============================================
// VERSION 14 - COMMAND CENTER (3-Column ULTRATHINK)
// ============================================
function Version14({ showAnnotations }: { showAnnotations: boolean }) {
  const [activeSection, setActiveSection] = useState<'overview' | 'evidence' | 'patterns' | 'timeline' | 'community' | 'impact'>('overview')
  const [storyExpanded, setStoryExpanded] = useState(false)
  const [likeCount, setLikeCount] = useState(47)
  const [isLiked, setIsLiked] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null)

  // Mock data
  const experience = {
    id: 'XP-2024-1847',
    title: 'Schattengestalt bei Schlafparalyse',
    story: 'Es war genau 3:47 Uhr, als ich aufwachte und mich nicht bewegen konnte. In der Ecke meines Zimmers stand eine Gestalt – eine Silhouette, die kein Licht reflektierte. Sie bewegte sich nicht, aber ich spürte ihre Präsenz wie einen Druck auf meiner Brust. Nach etwa zwei Minuten, die sich wie Stunden anfühlten, löste sich die Gestalt einfach auf, als hätte sie nie existiert. Ich lag noch eine Stunde wach, zu erschrocken um die Augen zu schließen. Am nächsten Morgen fand ich im Forum einen Thread mit fast identischen Berichten – alle zwischen 3 und 4 Uhr nachts.',
    author: { name: 'Maria S.', avatar: '👤', level: 12, xp: 2450, badges: ['🌟', '🔗', '👁️'] },
    location: 'Wien, Österreich',
    time: '03:47',
    date: 'Nov 2024',
    category: 'Schlafparalyse',
    patternMatch: 87,
    mediaCount: { photos: 3, videos: 1, audio: 1, links: 2, docs: 0 },
    similarCount: 15,
    witnessCount: 3,
    commentCount: 8,
  }

  const similarExperiences = [
    { id: 1, title: 'Dunkle Gestalt im Türrahmen', match: 87, author: 'Thomas K.', time: '03:22' },
    { id: 2, title: 'Schatten am Bettende', match: 82, author: 'Lisa M.', time: '03:51' },
    { id: 3, title: 'Schwarze Silhouette', match: 76, author: 'Max P.', time: '04:05' },
    { id: 4, title: 'Präsenz im Dunkeln', match: 71, author: 'Anna R.', time: '03:33' },
  ]

  const witnesses = [
    { name: 'Partner', relation: 'Mitbewohner', verified: true },
    { name: 'Anna K.', relation: 'Schwester', verified: true },
    { name: 'Dr. Weber', relation: 'Therapeut', verified: false },
  ]

  const liveActivity = [
    { type: 'view', user: 'Anonymous', time: '2 min ago' },
    { type: 'comment', user: 'Tom R.', time: '5 min ago', text: 'Genau so...' },
    { type: 'pattern', system: true, time: '12 min ago', text: '+3 Matches gefunden' },
    { type: 'like', user: 'Sarah M.', time: '18 min ago' },
  ]

  const navItems = [
    { id: 'overview', label: 'Übersicht', icon: '◈' },
    { id: 'evidence', label: 'Evidenz', icon: '📁', count: 7 },
    { id: 'patterns', label: 'Muster', icon: '🔗', count: 15 },
    { id: 'timeline', label: 'Zeitachse', icon: '⏱' },
    { id: 'community', label: 'Community', icon: '👥', count: 11 },
    { id: 'impact', label: 'Impact', icon: '⚡' },
  ]

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 136, 0.3); }
          50% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.6); }
        }
        @keyframes data-stream {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .glow-green { animation: pulse-glow 2s ease-in-out infinite; }
        .data-stream {
          background: linear-gradient(90deg, transparent, rgba(0,255,136,0.1), transparent);
          background-size: 200% 100%;
          animation: data-stream 3s linear infinite;
        }
        .slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1117 50%, #0a0a0a 100%)' }}>

        {/* Annotation Box */}
        {showAnnotations && (
          <div className="mx-4 mb-4 p-4 rounded-xl border" style={{ background: 'rgba(0, 255, 136, 0.05)', borderColor: 'rgba(0, 255, 136, 0.3)' }}>
            <p className="text-sm" style={{ color: '#00ff88' }}>
              ⬢ <strong>V14 COMMAND CENTER</strong> - 3-Spalten Layout für maximale Übersicht. LEFT: Navigation & Author. CENTER: Content & Media.
              RIGHT: AI Analysis & Live Activity. Alle 60+ Features strukturiert zugänglich.
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* NEURAL COMMAND BAR (Sticky Header)                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <header
          className="sticky top-28 z-40 px-4 py-3 border-b flex items-center justify-between gap-4"
          style={{
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 255, 136, 0.2)'
          }}
        >
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
              style={{ background: '#141414', borderColor: 'rgba(0, 255, 136, 0.3)' }}>
              <span className="text-[#00ff88]">←</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: 'rgba(0, 255, 136, 0.6)' }}>CASE://</span>
                <span className="font-mono text-sm font-bold" style={{ color: '#00ff88' }}>{experience.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold glow-green"
                  style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88' }}>
                  ● LIVE
                </span>
              </div>
              <h1 className="text-white font-semibold text-sm truncate max-w-md">{experience.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search patterns..."
                className="w-48 px-3 py-1.5 rounded-lg text-xs font-mono border"
                style={{ background: '#141414', borderColor: 'rgba(0, 255, 136, 0.2)', color: 'white' }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00ff88]/50">⌘K</span>
            </div>

            {/* Actions */}
            <button
              onClick={() => { setIsLiked(!isLiked); setLikeCount(isLiked ? likeCount - 1 : likeCount + 1) }}
              className="px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all"
              style={{
                background: isLiked ? 'rgba(255, 45, 106, 0.2)' : '#141414',
                borderColor: isLiked ? '#ff2d6a' : 'rgba(255,255,255,0.1)'
              }}
            >
              <span>{isLiked ? '♥' : '♡'}</span>
              <span className="text-xs font-mono">{likeCount}</span>
            </button>
            <button className="px-3 py-1.5 rounded-lg border" style={{ background: '#141414', borderColor: 'rgba(255,255,255,0.1)' }}>
              <span>↗</span>
            </button>
            <button className="px-3 py-1.5 rounded-lg border" style={{ background: '#141414', borderColor: 'rgba(255,255,255,0.1)' }}>
              <span>⚙</span>
            </button>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 3-COLUMN LAYOUT                                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex gap-0" style={{ minHeight: 'calc(100vh - 180px)' }}>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN - Navigation & Author (280px)                       */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <aside
            className="w-[280px] flex-shrink-0 border-r p-4 overflow-y-auto"
            style={{ borderColor: 'rgba(0, 255, 136, 0.1)', background: 'rgba(0, 0, 0, 0.3)' }}
          >
            {/* Author Card */}
            <div className="mb-6 p-4 rounded-xl border" style={{ background: '#141414', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2"
                  style={{ background: 'linear-gradient(135deg, #00ff88, #00d4ff)', borderColor: '#00ff88' }}>
                  {experience.author.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{experience.author.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: '#00ff88' }}>LVL {experience.author.level}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>•</span>
                    <span className="text-xs font-mono" style={{ color: '#00d4ff' }}>{experience.author.xp} XP</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {experience.author.badges.map((badge, i) => (
                  <span key={i} className="w-6 h-6 rounded flex items-center justify-center text-sm"
                    style={{ background: 'rgba(0, 255, 136, 0.1)' }}>{badge}</span>
                ))}
              </div>
              <button className="w-full py-2 rounded-lg text-xs font-mono border transition-all hover:bg-[#00ff88]/10"
                style={{ borderColor: 'rgba(0, 255, 136, 0.3)', color: '#00ff88' }}>
                ◈ VIEW PROFILE
              </button>
            </div>

            {/* Navigation */}
            <div className="mb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(0, 255, 136, 0.5)' }}>
                ═══ NAVIGATION ═══
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as typeof activeSection)}
                    className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center justify-between transition-all ${
                      activeSection === item.id ? 'slide-in' : ''
                    }`}
                    style={{
                      background: activeSection === item.id ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                      borderLeft: activeSection === item.id ? '3px solid #00ff88' : '3px solid transparent'
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className={`text-sm ${activeSection === item.id ? 'text-[#00ff88] font-semibold' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </span>
                    {item.count && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88' }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="mb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(0, 255, 136, 0.5)' }}>
                ═══ QUICK STATS ═══
              </p>
              <div className="space-y-2">
                {[
                  { icon: '📍', label: 'Location', value: experience.location },
                  { icon: '🕐', label: 'Time', value: experience.time },
                  { icon: '📅', label: 'Date', value: experience.date },
                  { icon: '🎯', label: 'Match', value: `${experience.patternMatch}%` },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(0, 255, 136, 0.05)' }}>
                    <span className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{stat.icon}</span> {stat.label}
                    </span>
                    <span className="text-sm font-mono text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(0, 255, 136, 0.5)' }}>
                ═══ ACTIONS ═══
              </p>
              <div className="space-y-2">
                {['Report', 'Export', 'Share', 'Edit'].map((action) => (
                  <button key={action} className="w-full px-3 py-2 rounded-lg text-left text-sm border transition-all hover:bg-white/5"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* CENTER COLUMN - Main Content (flex-1)                           */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto p-6">

            {/* Hero Image */}
            <div className="relative mb-6 rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(0, 255, 136, 0.2)' }}>
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🌙</div>
                  <p className="text-gray-500 text-sm">Hero Image / Video</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88' }}>
                    {experience.category}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(0, 212, 255, 0.2)', color: '#00d4ff' }}>
                    {experience.patternMatch}% MATCH
                  </span>
                </div>
              </div>
            </div>

            {/* Story Block */}
            <div className="mb-6 p-6 rounded-xl border" style={{ background: '#141414', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#00ff88]">◈</span>
                <h2 className="text-lg font-semibold text-white">THE STORY</h2>
              </div>
              <p className={`text-gray-300 leading-relaxed ${!storyExpanded ? 'line-clamp-4' : ''}`}>
                {experience.story}
              </p>
              <button
                onClick={() => setStoryExpanded(!storyExpanded)}
                className="mt-3 text-sm font-mono transition-colors"
                style={{ color: '#00ff88' }}
              >
                {storyExpanded ? '↑ Show less' : '↓ Read more'}
              </button>
            </div>

            {/* Media Gallery */}
            <div className="mb-6 p-6 rounded-xl border" style={{ background: '#141414', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#00ff88]">📁</span>
                  <h2 className="text-lg font-semibold text-white">MEDIA GALLERY</h2>
                </div>
                <div className="flex gap-2">
                  {[
                    { icon: '📷', count: experience.mediaCount.photos, label: 'Photos' },
                    { icon: '🎥', count: experience.mediaCount.videos, label: 'Videos' },
                    { icon: '🎤', count: experience.mediaCount.audio, label: 'Audio' },
                    { icon: '📎', count: experience.mediaCount.links, label: 'Links' },
                  ].map((m, i) => m.count > 0 && (
                    <span key={i} className="px-2 py-1 rounded text-xs font-mono flex items-center gap-1"
                      style={{ background: 'rgba(0, 255, 136, 0.1)' }}>
                      {m.icon} {m.count}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedMedia(i)}
                    className="aspect-square rounded-lg cursor-pointer transition-all hover:scale-105 flex items-center justify-center"
                    style={{ background: 'rgba(0, 255, 136, 0.1)', border: selectedMedia === i ? '2px solid #00ff88' : '2px solid transparent' }}
                  >
                    <span className="text-2xl opacity-50">{i <= 3 ? '📷' : i === 4 ? '🎥' : i === 5 ? '🎤' : '📎'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern Analysis */}
            <div className="mb-6 p-6 rounded-xl border" style={{ background: '#141414', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#00ff88]">🔗</span>
                <h2 className="text-lg font-semibold text-white">PATTERN ANALYSIS</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Timeline Chart */}
                <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.05)' }}>
                  <p className="text-xs font-mono mb-3" style={{ color: '#00ff88' }}>TIMELINE DISTRIBUTION</p>
                  <div className="h-32 flex items-end gap-1">
                    {[20, 45, 80, 95, 70, 40, 25, 15, 10, 5, 3, 2].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${h}%`, background: i === 3 ? '#00ff88' : 'rgba(0, 255, 136, 0.3)' }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                  </div>
                </div>
                {/* Geographic Map */}
                <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 212, 255, 0.05)' }}>
                  <p className="text-xs font-mono mb-3" style={{ color: '#00d4ff' }}>GEOGRAPHIC HOTSPOTS</p>
                  <div className="h-32 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 212, 255, 0.1)' }}>
                    <span className="text-4xl">🗺️</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 text-center">Europe • 847 reports</p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="p-6 rounded-xl border" style={{ background: '#141414', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#00ff88]">💬</span>
                  <h2 className="text-lg font-semibold text-white">COMMENTS ({experience.commentCount})</h2>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-xs font-mono" style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88' }}>
                  + Add Comment
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { user: 'Tom R.', text: 'Hatte exakt das gleiche Erlebnis letzte Woche!', time: '2h ago' },
                  { user: 'Lisa K.', text: 'Die Uhrzeit ist interessant - bei mir auch immer zwischen 3-4 Uhr.', time: '5h ago' },
                  { user: 'Max B.', text: 'Gibt es wissenschaftliche Erklärungen dafür?', time: '1d ago' },
                ].map((comment, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-white">{comment.user}</span>
                      <span className="text-[10px] text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-400">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN - AI & Live Activity (320px)                       */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <aside
            className="w-[320px] flex-shrink-0 border-l p-4 overflow-y-auto"
            style={{ borderColor: 'rgba(0, 255, 136, 0.1)', background: 'rgba(0, 0, 0, 0.3)' }}
          >
            {/* AI Synthesis */}
            <div className="mb-6 p-4 rounded-xl border data-stream" style={{ background: '#141414', borderColor: 'rgba(0, 255, 136, 0.3)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🧠</span>
                <h3 className="font-mono text-sm font-bold" style={{ color: '#00ff88' }}>AI SYNTHESIS</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                "Typisches <span style={{ color: '#00ff88' }}>Schlafparalyse-Muster</span> mit visueller Manifestation.
                87% Übereinstimmung mit dem <span style={{ color: '#00d4ff' }}>Shadow People Cluster</span>.
                Zeitliche Korrelation mit REM-Phase (03:00-04:00)."
              </p>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 rounded text-[10px] font-mono" style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88' }}>
                  HIGH CONFIDENCE
                </span>
              </div>
            </div>

            {/* Similar Experiences */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-sm font-bold" style={{ color: '#00ff88' }}>SIMILAR ({experience.similarCount})</h3>
                <button className="text-xs" style={{ color: '#00ff88' }}>View all →</button>
              </div>
              <div className="space-y-2">
                {similarExperiences.map((exp) => (
                  <div key={exp.id} className="p-3 rounded-lg border cursor-pointer transition-all hover:border-[#00ff88]/50"
                    style={{ background: '#141414', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium truncate">{exp.title}</p>
                        <p className="text-[10px] text-gray-500">{exp.author} • {exp.time}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                        style={{ background: exp.match > 80 ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 212, 255, 0.2)',
                                 color: exp.match > 80 ? '#00ff88' : '#00d4ff' }}>
                        {exp.match}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Witnesses */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-sm font-bold" style={{ color: '#00ff88' }}>WITNESSES ({experience.witnessCount})</h3>
                <button className="text-xs" style={{ color: '#00ff88' }}>+ Invite</button>
              </div>
              <div className="space-y-2">
                {witnesses.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: 'rgba(0, 255, 136, 0.2)' }}>👤</div>
                      <div>
                        <p className="text-sm text-white">{w.name}</p>
                        <p className="text-[10px] text-gray-500">{w.relation}</p>
                      </div>
                    </div>
                    {w.verified && (
                      <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88' }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
                <h3 className="font-mono text-sm font-bold" style={{ color: '#00ff88' }}>LIVE ACTIVITY</h3>
              </div>
              <div className="space-y-2">
                {liveActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg text-xs"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span className="mt-0.5">
                      {activity.type === 'view' ? '👁️' : activity.type === 'comment' ? '💬' : activity.type === 'pattern' ? '🔗' : '♥'}
                    </span>
                    <div className="flex-1">
                      <span className="text-gray-400">
                        {activity.system ? 'System' : activity.user}
                      </span>
                      {activity.text && <span className="text-gray-500"> • {activity.text}</span>}
                      <span className="text-gray-600 ml-2">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* XP Impact */}
            <div className="p-4 rounded-xl border" style={{ background: '#141414', borderColor: 'rgba(255, 0, 255, 0.3)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚡</span>
                <h3 className="font-mono text-sm font-bold" style={{ color: '#ff00ff' }}>XP IMPACT</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255, 0, 255, 0.1)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#ff00ff' }}>+250</p>
                  <p className="text-[10px] text-gray-500">XP EARNED</p>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.1)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#00ff88' }}>2</p>
                  <p className="text-[10px] text-gray-500">BADGES</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span style={{ color: '#ff00ff' }}>Level 12</span>
                  <span className="text-gray-500">550/1000 XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 0, 255, 0.2)' }}>
                  <div className="h-full rounded-full" style={{ width: '55%', background: 'linear-gradient(90deg, #ff00ff, #00ff88)' }}></div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* NEURAL FOOTER                                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <footer className="border-t px-6 py-4 flex items-center justify-between"
          style={{ background: 'rgba(10, 10, 10, 0.95)', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono" style={{ color: 'rgba(0, 255, 136, 0.5)' }}>XP-SHARE</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
            <span className="text-xs font-mono" style={{ color: 'rgba(0, 255, 136, 0.5)' }}>COMMAND CENTER v14.0</span>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg text-xs font-mono border transition-all hover:bg-[#00ff88]/10"
              style={{ borderColor: 'rgba(0, 255, 136, 0.3)', color: '#00ff88' }}>
              ◈ EXPORT DATA
            </button>
            <button className="px-4 py-2 rounded-lg text-xs font-mono transition-all"
              style={{ background: 'linear-gradient(135deg, #00ff88, #00d4ff)', color: 'black' }}>
              ⬢ ADD TO CLUSTER
            </button>
          </div>
        </footer>
      </div>
    </>
  )
}

// ============================================
// VERSION 15 - ETHEREAL GLASS (Editorial Glassmorphism)
// Premium, verträumt, editorial - wie ein High-End Magazine
// ============================================
function Version15({ showAnnotations }: { showAnnotations: boolean }) {
  const [storyExpanded, setStoryExpanded] = useState(false)
  const [likeCount, setLikeCount] = useState(47)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<'resonance' | 'echoes' | 'fragments' | 'constellation'>('resonance')

  return (
    <>
      {/* Google Fonts - Playfair Display + DM Sans */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
      `}</style>

      <style jsx>{`
        .v15-container {
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          --glass-hover: rgba(255, 255, 255, 0.06);
          --rose-gold: #e8c4b8;
          --lavender: #b8c4e8;
          --warm-white: #f5f0eb;
          --midnight: #0f0f23;
          --midnight-light: #1a1a2e;
          font-family: 'DM Sans', sans-serif;
        }

        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
          background: var(--glass-hover);
          border-color: rgba(232, 196, 184, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 20px 60px -10px rgba(232, 196, 184, 0.15);
        }

        .editorial-title {
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .editorial-italic {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 400;
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            var(--rose-gold) 0%,
            var(--warm-white) 25%,
            var(--lavender) 50%,
            var(--warm-white) 75%,
            var(--rose-gold) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 6s linear infinite;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }
        .delay-5 { animation-delay: 0.5s; opacity: 0; }

        .tab-indicator {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .noise-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.015;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: 1;
        }
      `}</style>

      <div className="v15-container min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 50%, #0f0f23 100%)' }}>
        {/* Noise texture overlay */}
        <div className="noise-overlay" />

        {/* Floating orbs for atmosphere */}
        <div className="floating-orb" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(232,196,184,0.3) 0%, transparent 70%)', top: '-200px', right: '-200px' }} />
        <div className="floating-orb" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(184,196,232,0.25) 0%, transparent 70%)', bottom: '10%', left: '-150px', animationDelay: '-4s' }} />
        <div className="floating-orb" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(245,240,235,0.15) 0%, transparent 70%)', top: '40%', right: '10%', animationDelay: '-2s' }} />

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

          {/* Hero Section */}
          <header className="mb-16 fade-up delay-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 mb-8" style={{ color: 'rgba(245,240,235,0.5)' }}>
              <span className="text-sm tracking-wider uppercase">Experiences</span>
              <span style={{ color: 'var(--rose-gold)' }}>→</span>
              <span className="text-sm tracking-wider uppercase">Sleep Phenomena</span>
              <span style={{ color: 'var(--rose-gold)' }}>→</span>
              <span className="text-sm" style={{ color: 'var(--rose-gold)' }}>Case #1847</span>
            </div>

            {/* Title Block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <h1 className="editorial-title text-5xl md:text-6xl lg:text-7xl mb-6" style={{ color: 'var(--warm-white)' }}>
                  Die Schattengestalt bei der<br />
                  <span className="editorial-italic shimmer-text">Schlafparalyse</span>
                </h1>
                <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'rgba(245,240,235,0.7)' }}>
                  Eine nächtliche Begegnung an der Schwelle zwischen Wachen und Schlafen,
                  die Fragen über die Natur der Realität aufwirft.
                </p>
              </div>

              {/* Author Card - Floating */}
              <div className="glass-card p-6 relative">
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full" style={{ background: 'var(--rose-gold)', opacity: 0.6 }} />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--rose-gold)' }}>
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, var(--rose-gold) 0%, var(--lavender) 100%)' }} />
                  </div>
                  <div>
                    <p className="font-medium text-lg" style={{ color: 'var(--warm-white)' }}>Maria S.</p>
                    <p className="text-sm" style={{ color: 'var(--rose-gold)' }}>Level 12 · Dreamwalker</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(232,196,184,0.15)', color: 'var(--rose-gold)' }}>
                    47 Experiences
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(184,196,232,0.15)', color: 'var(--lavender)' }}>
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Image */}
          <div className="glass-card overflow-hidden mb-12 fade-up delay-2">
            <div className="aspect-[21/9] relative" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a2e 100%)' }}>
              {/* Placeholder for hero image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full" style={{
                    background: 'radial-gradient(circle, rgba(232,196,184,0.3) 0%, transparent 70%)',
                    boxShadow: '0 0 100px 50px rgba(232,196,184,0.1)'
                  }} />
                  <p className="editorial-italic text-2xl" style={{ color: 'rgba(245,240,235,0.3)' }}>
                    "Between sleeping and waking..."
                  </p>
                </div>
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(15,15,35,0.8) 100%)' }} />
            </div>

            {/* Quick stats bar */}
            <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--rose-gold)' }}>◐</span>
                  <span className="text-sm" style={{ color: 'rgba(245,240,235,0.7)' }}>Nov 15, 2024 · 3:47 AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--lavender)' }}>◉</span>
                  <span className="text-sm" style={{ color: 'rgba(245,240,235,0.7)' }}>Wien, Österreich</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setIsLiked(!isLiked); setLikeCount(isLiked ? likeCount - 1 : likeCount + 1) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                  style={{
                    background: isLiked ? 'rgba(232,196,184,0.2)' : 'transparent',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <span style={{ color: isLiked ? 'var(--rose-gold)' : 'rgba(245,240,235,0.5)' }}>
                    {isLiked ? '♥' : '♡'}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--warm-white)' }}>{likeCount}</span>
                </button>
                <button className="px-4 py-2 rounded-full text-sm" style={{ border: '1px solid var(--glass-border)', color: 'rgba(245,240,235,0.7)' }}>
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <section className="glass-card p-8 md:p-12 mb-12 fade-up delay-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, var(--rose-gold), var(--lavender))' }} />
              <h2 className="editorial-title text-2xl" style={{ color: 'var(--warm-white)' }}>The Experience</h2>
            </div>

            <div className="prose max-w-none" style={{ color: 'rgba(245,240,235,0.85)' }}>
              <p className="text-lg leading-relaxed mb-6 editorial-italic" style={{ color: 'var(--rose-gold)', fontSize: '1.25rem' }}>
                "Es war 3:47 Uhr, als ich plötzlich aufwachte..."
              </p>

              <p className="leading-relaxed mb-4">
                Ich konnte mich nicht bewegen. Mein Körper lag wie versteinert im Bett, während mein Geist hellwach war.
                Das Zimmer war in ein seltsames, bläuliches Licht getaucht, obwohl die Vorhänge geschlossen waren.
              </p>

              {storyExpanded && (
                <>
                  <p className="leading-relaxed mb-4">
                    Dann sah ich sie – eine Gestalt am Fußende meines Bettes. Sie war humanoid, aber nicht menschlich.
                    Größer als ein normaler Mensch, mit Konturen die sich in der Dunkelheit aufzulösen schienen.
                    Ich wollte schreien, aber kein Laut kam über meine Lippen.
                  </p>
                  <p className="leading-relaxed mb-4">
                    Die Figur bewegte sich langsam näher. Ich konnte ein leises Summen hören, tief und vibrierend,
                    als ob die Luft selbst zu schwingen begann. Die Temperatur im Raum schien zu fallen.
                  </p>
                  <p className="leading-relaxed">
                    Nach einer Ewigkeit – es könnten Sekunden oder Minuten gewesen sein – verschwand die Gestalt
                    einfach. Mein Körper entspannte sich, und ich konnte wieder atmen. Das Licht normalisierte sich.
                    Ich war schweißgebadet und mein Herz raste noch Minuten danach.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setStoryExpanded(!storyExpanded)}
              className="mt-6 flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'var(--rose-gold)' }}
            >
              <span>{storyExpanded ? 'Show less' : 'Continue reading'}</span>
              <span className="transition-transform" style={{ transform: storyExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>↓</span>
            </button>
          </section>

          {/* Tab Navigation */}
          <div className="glass-card p-2 mb-8 fade-up delay-4">
            <div className="flex gap-2">
              {[
                { id: 'resonance', label: 'Resonance', icon: '◎' },
                { id: 'echoes', label: 'Echoes', icon: '≋' },
                { id: 'fragments', label: 'Fragments', icon: '◇' },
                { id: 'constellation', label: 'Constellation', icon: '✧' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: activeTab === tab.id ? 'rgba(232,196,184,0.15)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--rose-gold)' : 'rgba(245,240,235,0.5)'
                  }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 fade-up delay-5">
            {activeTab === 'resonance' && (
              <>
                {/* Similar Experiences */}
                {[
                  { title: 'Die Wächterin am Fenster', match: 94, author: 'Thomas K.', date: 'Oct 2024' },
                  { title: 'Paralysed at Dawn', match: 89, author: 'Sarah M.', date: 'Sep 2024' },
                  { title: 'Der stumme Besucher', match: 87, author: 'Felix R.', date: 'Nov 2024' },
                  { title: 'Between Worlds', match: 82, author: 'Anna L.', date: 'Aug 2024' },
                  { title: 'Schatten ohne Quelle', match: 79, author: 'Michael B.', date: 'Oct 2024' },
                  { title: 'The Presence', match: 76, author: 'Laura W.', date: 'Jul 2024' }
                ].map((exp, i) => (
                  <div key={i} className="glass-card p-6 group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-full" style={{
                        background: `linear-gradient(135deg, rgba(232,196,184,${0.3 - i * 0.03}) 0%, rgba(184,196,232,${0.3 - i * 0.03}) 100%)`
                      }} />
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                        background: 'rgba(232,196,184,0.15)',
                        color: 'var(--rose-gold)'
                      }}>
                        {exp.match}% Match
                      </span>
                    </div>
                    <h3 className="editorial-title text-lg mb-2 group-hover:text-[#e8c4b8] transition-colors" style={{ color: 'var(--warm-white)' }}>
                      {exp.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'rgba(245,240,235,0.5)' }}>
                      by {exp.author} · {exp.date}
                    </p>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'echoes' && (
              <>
                {/* Media Gallery */}
                <div className="glass-card p-4 col-span-full">
                  <p className="text-center py-12 editorial-italic" style={{ color: 'rgba(245,240,235,0.5)' }}>
                    "No media fragments captured for this experience"
                  </p>
                </div>
              </>
            )}

            {activeTab === 'fragments' && (
              <>
                {/* Details Accordion Style */}
                <div className="col-span-full space-y-4">
                  {[
                    { label: 'Witnesses', count: 0, icon: '◈' },
                    { label: 'Q&A Responses', count: 5, icon: '◇' },
                    { label: 'External Events', count: 3, icon: '◐' },
                    { label: 'Tags & Categories', count: 8, icon: '◉' }
                  ].map((item, i) => (
                    <div key={i} className="glass-card p-4 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span style={{ color: 'var(--rose-gold)' }}>{item.icon}</span>
                        <span style={{ color: 'var(--warm-white)' }}>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(184,196,232,0.15)', color: 'var(--lavender)' }}>
                          {item.count}
                        </span>
                        <span style={{ color: 'rgba(245,240,235,0.5)' }}>→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'constellation' && (
              <>
                {/* Pattern Analysis */}
                <div className="glass-card p-6 col-span-full">
                  <h3 className="editorial-title text-xl mb-6" style={{ color: 'var(--warm-white)' }}>Pattern Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Similar Cases', value: '248', trend: '+12%' },
                      { label: 'Time Cluster', value: '3-4 AM', trend: '67%' },
                      { label: 'Sleep Phase', value: 'REM', trend: 'typical' },
                      { label: 'Duration', value: '~2 min', trend: 'avg' }
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="editorial-title text-2xl mb-1" style={{ color: 'var(--rose-gold)' }}>{stat.value}</p>
                        <p className="text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>{stat.label}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--lavender)' }}>{stat.trend}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* AI Synthesis Card */}
          <div className="glass-card p-8 mb-12" style={{ borderColor: 'rgba(232,196,184,0.2)' }}>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(232,196,184,0.2) 0%, rgba(184,196,232,0.2) 100%)',
                border: '1px solid rgba(232,196,184,0.3)'
              }}>
                <span className="text-2xl" style={{ color: 'var(--rose-gold)' }}>✧</span>
              </div>
              <div className="flex-1">
                <h3 className="editorial-title text-xl mb-3" style={{ color: 'var(--warm-white)' }}>AI Synthesis</h3>
                <p className="leading-relaxed" style={{ color: 'rgba(245,240,235,0.8)' }}>
                  This experience shows classic hallmarks of <span style={{ color: 'var(--rose-gold)' }}>hypnagogic paralysis</span> with
                  shadow entity perception. The 3:47 AM timing correlates with the <span style={{ color: 'var(--lavender)' }}>second REM cycle</span>,
                  when such experiences are most commonly reported. The described figure matches the "Hat Man" archetype
                  documented in 67% of similar cases.
                </p>
                <div className="mt-4 flex gap-3">
                  <span className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(232,196,184,0.15)', color: 'var(--rose-gold)' }}>
                    High Correlation
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(184,196,232,0.15)', color: 'var(--lavender)' }}>
                    248 Similar Cases
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center py-12" style={{ color: 'rgba(245,240,235,0.4)' }}>
            <p className="editorial-italic text-sm mb-2">XP-Share · Ethereal Glass v15.0</p>
            <p className="text-xs">Where experiences find resonance</p>
          </footer>

        </div>

        {showAnnotations && (
          <div className="fixed bottom-4 right-4 glass-card p-4 max-w-xs z-50" style={{ background: 'rgba(15,15,35,0.95)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--rose-gold)' }}>✧ V15 ETHEREAL GLASS</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(245,240,235,0.7)' }}>
              Editorial Glassmorphism - Premium magazine aesthetics mit schwebendem Glass-UI.
              Playfair Display + DM Sans. Rose Gold / Lavender Palette.
              Floating orbs für Atmosphäre, Tab-Navigation für Progressive Disclosure.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

// ============================================
// VERSION 16: LIMINAL ARCHIVE - "THE CLASSIFIED RECORD"
// ============================================
function Version16({ showAnnotations }: { showAnnotations: boolean }) {
  const [activeTab, setActiveTab] = useState<'matches' | 'evidence' | 'witnesses' | 'discuss' | 'export'>('matches')
  const [isExpanded, setIsExpanded] = useState(false)

  // V16 Color Palette
  const colors = {
    bg: '#0D0D12',
    surface: '#15151D',
    surfaceAlt: '#1A1A24',
    borderViolet: 'rgba(139, 92, 246, 0.15)',
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    tertiary: '#EC4899',
    warning: '#F59E0B',
    text: '#E0E0E6',
    textSecondary: 'rgba(224, 224, 230, 0.7)',
    textTertiary: 'rgba(224, 224, 230, 0.5)',
  }

  return (
    <>
      {/* CSS Variables and Animations */}
      <style jsx>{`
        @keyframes glitch {
          0%, 100% { opacity: 1; transform: translateX(0); }
          92% { opacity: 1; }
          93% { opacity: 0.8; transform: translateX(-2px); }
          94% { opacity: 0.9; transform: translateX(2px); }
          95% { opacity: 1; transform: translateX(0); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .liminal-bg {
          background: ${colors.bg};
        }
        .liminal-surface {
          background: ${colors.surface};
          border: 1px solid ${colors.borderViolet};
        }
        .liminal-glow {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }
        .scanlines::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 92, 246, 0.03) 2px,
            rgba(139, 92, 246, 0.03) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
        .glitch-text {
          animation: glitch 8s infinite;
        }
        .corner-bracket::before,
        .corner-bracket::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: ${colors.primary};
          border-style: solid;
        }
        .corner-bracket::before {
          top: -1px;
          left: -1px;
          border-width: 2px 0 0 2px;
        }
        .corner-bracket::after {
          bottom: -1px;
          right: -1px;
          border-width: 0 2px 2px 0;
        }
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.05;
        }
      `}</style>

      <div className="min-h-screen liminal-bg relative overflow-hidden" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Scanlines overlay */}
        <div className="absolute inset-0 scanlines pointer-events-none" />

        {/* ============================================ */}
        {/* CLASSIFIED HEADER                           */}
        {/* ============================================ */}
        <div className="relative z-10 border-b" style={{ borderColor: colors.borderViolet, background: colors.surface }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Case ID */}
            <div className="flex items-center gap-4">
              <div className="glitch-text" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span style={{ color: colors.textTertiary, fontSize: '11px', letterSpacing: '0.1em' }}>CASE://</span>
                <span style={{ color: colors.primary, fontSize: '11px', letterSpacing: '0.1em' }}>XP-2024-1127-A</span>
              </div>
              <div className="px-2 py-0.5 rounded text-xs" style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px dashed rgba(245, 158, 11, 0.5)',
                color: colors.warning,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.05em'
              }}>
                ACCESS LEVEL: PUBLIC
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded transition-all hover:bg-white/5" style={{ color: colors.textSecondary }}>
                <span style={{ fontSize: '16px' }}>♡</span>
                <span className="ml-1 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>89</span>
              </button>
              <button className="p-2 rounded transition-all hover:bg-white/5" style={{ color: colors.secondary }}>
                ↗
              </button>
              <button className="p-2 rounded transition-all hover:bg-white/5" style={{ color: colors.textSecondary }}>
                ⋯
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* MAIN SPLIT VIEW                             */}
        {/* ============================================ */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT PANEL: STORY */}
            <div className="space-y-4">
              {/* Hero Image with Glitch */}
              <div className="relative liminal-surface rounded-lg overflow-hidden corner-bracket">
                <div className="aspect-video relative">
                  <div className="absolute inset-0" style={{
                    background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceAlt} 50%, ${colors.surface} 100%)`
                  }}>
                    {/* Simulated image placeholder with glitch effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2" style={{ color: colors.primary, opacity: 0.3 }}>◈</div>
                        <p style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.1em' }}>
                          [VISUAL EVIDENCE REDACTED]
                        </p>
                      </div>
                    </div>
                    {/* Glitch lines */}
                    <div className="absolute top-1/4 left-0 right-0 h-px opacity-30" style={{ background: colors.secondary }} />
                    <div className="absolute top-2/3 left-0 right-0 h-px opacity-20" style={{ background: colors.tertiary }} />
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold" style={{
                    background: 'rgba(139, 92, 246, 0.9)',
                    color: 'white',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.05em'
                  }}>
                    ◈ UFO / AERIAL
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded text-xs" style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.6)',
                    color: colors.warning,
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    [VERIFIED]
                  </div>
                </div>
              </div>

              {/* Author Dossier */}
              <div className="liminal-surface rounded-lg p-4 relative corner-bracket">
                <p className="text-xs mb-3" style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
                  ── AUTHOR DOSSIER ──
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
                    background: `linear-gradient(135deg, ${colors.primary}33, ${colors.secondary}33)`,
                    border: `1px solid ${colors.borderViolet}`
                  }}>
                    <span style={{ color: colors.primary, fontSize: '20px' }}>◈</span>
                  </div>
                  <div>
                    <p style={{ color: colors.text, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>Agent_M</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: colors.secondary }}>Level 12</span>
                      <span style={{ color: colors.warning }}>★★★★☆</span>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="px-2 py-0.5 rounded text-xs" style={{
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      color: colors.secondary,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      TRUSTED
                    </div>
                    <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>47 reports filed</p>
                  </div>
                </div>
              </div>

              {/* Incident Log */}
              <div className="liminal-surface rounded-lg p-4 relative corner-bracket">
                <p className="text-xs mb-3" style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
                  ── INCIDENT LOG ──
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span style={{ color: colors.secondary }}>📅</span>
                    <div>
                      <p className="text-xs" style={{ color: colors.textTertiary }}>Date</p>
                      <p className="text-sm" style={{ color: colors.text, fontFamily: "'JetBrains Mono', monospace" }}>2024-11-15 03:47</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: colors.secondary }}>📍</span>
                    <div>
                      <p className="text-xs" style={{ color: colors.textTertiary }}>Location</p>
                      <p className="text-sm" style={{ color: colors.text, fontFamily: "'JetBrains Mono', monospace" }}>BODENSEE, DE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: colors.secondary }}>⏱</span>
                    <div>
                      <p className="text-xs" style={{ color: colors.textTertiary }}>Duration</p>
                      <p className="text-sm" style={{ color: colors.text, fontFamily: "'JetBrains Mono', monospace" }}>4 min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: colors.secondary }}>👁</span>
                    <div>
                      <p className="text-xs" style={{ color: colors.textTertiary }}>Shape</p>
                      <p className="text-sm" style={{ color: colors.text, fontFamily: "'JetBrains Mono', monospace" }}>TRIANGULAR</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimony */}
              <div className="liminal-surface rounded-lg p-4 relative corner-bracket">
                <p className="text-xs mb-3" style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
                  ── TESTIMONY ──
                </p>
                <div className="relative" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  <p className={`leading-relaxed ${!isExpanded ? 'line-clamp-4' : ''}`} style={{ color: colors.text, fontSize: '15px', lineHeight: 1.7 }}>
                    "Es war 3:47 Uhr als ich durch ein seltsames Summen aufwachte. Das Licht, das durch mein Fenster drang,
                    war nicht das Mondlicht, das ich erwartet hatte. Es war ein pulsierendes, bläulich-weißes Leuchten,
                    das in einem rhythmischen Muster an- und ausging. Als ich zum Fenster ging, sah ich ein dreieckiges Objekt,
                    das völlig lautlos über dem See schwebte..."
                  </p>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 flex items-center gap-2 transition-all hover:gap-3"
                    style={{ color: colors.secondary, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
                  >
                    {isExpanded ? '▲ COLLAPSE RECORD' : '▼ EXPAND FULL RECORD'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: PATTERN ANALYSIS */}
            <div className="space-y-4">
              {/* Correlation Matrix */}
              <div className="liminal-surface rounded-lg p-4 relative corner-bracket liminal-glow">
                <p className="text-xs mb-3" style={{ color: colors.primary, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
                  ◈ CORRELATION MATRIX
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* Visual matrix representation */}
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-6 rounded" style={{
                      background: i % 3 === 0 ? `linear-gradient(90deg, ${colors.primary}66, ${colors.primary}22)`
                        : i % 2 === 0 ? `linear-gradient(90deg, ${colors.secondary}44, ${colors.secondary}11)`
                        : colors.surfaceAlt
                    }} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold" style={{ color: colors.primary, fontFamily: "'JetBrains Mono', monospace" }}>12</p>
                    <p className="text-xs" style={{ color: colors.textTertiary }}>Similar Cases</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: colors.secondary, fontFamily: "'JetBrains Mono', monospace" }}>8</p>
                    <p className="text-xs" style={{ color: colors.textTertiary }}>Nearby</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: colors.warning, fontFamily: "'JetBrains Mono', monospace" }}>ACTIVE</p>
                    <p className="text-xs" style={{ color: colors.textTertiary }}>Time Cluster</p>
                  </div>
                </div>
              </div>

              {/* Geographic Spread */}
              <div className="liminal-surface rounded-lg p-4 relative corner-bracket">
                <p className="text-xs mb-3" style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
                  ── GEOGRAPHIC SPREAD ──
                </p>
                <div className="h-40 rounded relative" style={{ background: colors.surfaceAlt }}>
                  {/* Simulated map with dots */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Map points */}
                      <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full animate-pulse" style={{ background: colors.primary }} />
                      <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full" style={{ background: colors.secondary }} />
                      <div className="absolute top-1/4 left-1/2 w-2 h-2 rounded-full" style={{ background: colors.secondary }} />
                      <div className="absolute top-2/3 left-2/3 w-2 h-2 rounded-full" style={{ background: colors.secondary }} />
                      <div className="absolute top-1/2 left-3/4 w-2 h-2 rounded-full" style={{ background: colors.secondary }} />
                      {/* Center indicator */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 rounded-full border-2 animate-ping" style={{ borderColor: colors.primary, opacity: 0.5 }} />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs" style={{
                    background: 'rgba(0,0,0,0.7)',
                    color: colors.textSecondary,
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    [INTERACTIVE MAP]
                  </div>
                </div>
              </div>

              {/* Temporal Analysis */}
              <div className="liminal-surface rounded-lg p-4 relative corner-bracket">
                <p className="text-xs mb-3" style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
                  ── TEMPORAL ANALYSIS ──
                </p>
                <div className="h-16 flex items-end gap-1">
                  {/* Bar chart */}
                  {[20, 35, 55, 80, 100, 75, 45, 25, 15].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t transition-all" style={{
                      height: `${h}%`,
                      background: i === 4 ? colors.primary : `${colors.secondary}66`
                    }} />
                  ))}
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace" }}>
                  Peak: 03:00-04:00 UTC
                </p>
              </div>

              {/* External Factors */}
              <div className="liminal-surface rounded-lg p-4 relative corner-bracket">
                <p className="text-xs mb-3" style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
                  ── EXTERNAL FACTORS ──
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded" style={{ background: colors.surfaceAlt }}>
                    <div className="flex items-center gap-2">
                      <span>☀️</span>
                      <span className="text-sm" style={{ color: colors.text }}>Solar Activity</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs" style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: colors.warning,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>Kp=4 ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded" style={{ background: colors.surfaceAlt }}>
                    <div className="flex items-center gap-2">
                      <span>🌙</span>
                      <span className="text-sm" style={{ color: colors.text }}>Lunar Phase</span>
                    </div>
                    <span className="text-sm" style={{ color: colors.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>Waning 67%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded" style={{ background: colors.surfaceAlt }}>
                    <div className="flex items-center gap-2">
                      <span>🌡️</span>
                      <span className="text-sm" style={{ color: colors.text }}>Weather</span>
                    </div>
                    <span className="text-sm" style={{ color: colors.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>8°C Clear</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* TAB NAVIGATION                              */}
          {/* ============================================ */}
          <div className="mt-8">
            <div className="flex gap-1 border-b" style={{ borderColor: colors.borderViolet }}>
              {[
                { id: 'matches', label: 'MATCHES', count: 12 },
                { id: 'evidence', label: 'EVIDENCE', count: 4 },
                { id: 'witnesses', label: 'WITNESSES', count: 2 },
                { id: 'discuss', label: 'DISCUSS', count: 23 },
                { id: 'export', label: 'EXPORT' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="px-4 py-3 text-xs transition-all relative"
                  style={{
                    color: activeTab === tab.id ? colors.primary : colors.textSecondary,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.05em',
                    background: activeTab === tab.id ? `${colors.primary}11` : 'transparent'
                  }}
                >
                  {tab.label}
                  {tab.count && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px]" style={{
                      background: activeTab === tab.id ? `${colors.primary}33` : colors.surfaceAlt,
                      color: activeTab === tab.id ? colors.primary : colors.textTertiary
                    }}>
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: colors.primary }} />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content: Matches */}
            <div className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { id: '#42', match: 94, label: 'Triangle / Bodensee' },
                  { id: '#89', match: 87, label: 'Silent hover / Alps' },
                  { id: '#17', match: 82, label: 'Pulsing lights / Bavaria' },
                ].map((case_, i) => (
                  <div key={i} className="liminal-surface rounded-lg p-4 relative corner-bracket hover:liminal-glow transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace" }}>
                        CASE {case_.id}
                      </span>
                      <span className="text-lg font-bold" style={{ color: colors.primary, fontFamily: "'JetBrains Mono', monospace" }}>
                        {case_.match}%
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: colors.text }}>{case_.label}</p>
                    <p className="text-xs mt-2" style={{ color: colors.textTertiary }}>Nov 2024</p>
                  </div>
                ))}
                <div className="liminal-surface rounded-lg p-4 flex items-center justify-center text-center cursor-pointer hover:liminal-glow transition-all">
                  <div>
                    <p className="text-2xl mb-1" style={{ color: colors.primary }}>+9</p>
                    <p className="text-xs" style={{ color: colors.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>MORE MATCHES</p>
                    <p className="text-xs mt-1" style={{ color: colors.secondary }}>[VIEW ALL →]</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* ARCHIVE FOOTER                              */}
        {/* ============================================ */}
        <div className="border-t py-4" style={{ borderColor: colors.borderViolet, background: colors.surface }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs" style={{ color: colors.textTertiary, fontFamily: "'JetBrains Mono', monospace" }}>
              <span>▓▓▓</span>
              <span>XP-SHARE LIMINAL ARCHIVE v16.0</span>
              <span>▓▓▓</span>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded text-xs transition-all" style={{
                background: colors.surfaceAlt,
                color: colors.textSecondary,
                fontFamily: "'JetBrains Mono', monospace",
                border: `1px solid ${colors.borderViolet}`
              }}>
                REPORT ANOMALY
              </button>
              <button className="px-4 py-2 rounded text-xs transition-all" style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                color: 'white',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                EXPORT DOSSIER
              </button>
            </div>
          </div>
        </div>

        {/* Annotation Box */}
        {showAnnotations && (
          <div className="fixed bottom-4 right-4 p-4 max-w-xs z-50 rounded-lg" style={{
            background: 'rgba(13,13,18,0.95)',
            border: `1px solid ${colors.borderViolet}`,
            boxShadow: `0 0 30px ${colors.primary}33`
          }}>
            <p className="text-xs mb-2" style={{ color: colors.primary, fontFamily: "'JetBrains Mono', monospace" }}>◈ V16 LIMINAL ARCHIVE</p>
            <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
              Secret Archive aesthetic - X-Files vibes mit Split-View Layout.
              JetBrains Mono + IBM Plex Sans. Violet/Cyan Palette.
              Glitch effects, scanlines, classified stamps für Mystery.
              User sind ANALYST - investigating the unknown.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

// ============================================
// VERSION 17: RESONANZ - "Du bist nicht allein"
// ============================================
function Version17({ showAnnotations }: { showAnnotations: boolean }) {
  const [isResonanzVisible, setIsResonanzVisible] = useState(false)
  const [activePatternTab, setActivePatternTab] = useState<'temporal' | 'geographic' | 'correlations'>('temporal')
  const [isPatternDrawerOpen, setIsPatternDrawerOpen] = useState(false)

  // V17 RESONANZ Color Palette
  const colors = {
    void: '#0C0A1D',           // Tiefes Indigo-Schwarz
    surface: '#12101F',         // Leicht erhöhte Oberfläche
    elevated: '#1A1729',        // Karten, Modals
    emberWarmth: '#E8A87C',     // Warmes Gold/Orange - Menschlichkeit
    phenomenonTeal: '#4ECDC4',  // Türkis - Wissenschaft/Daten
    veilPurple: '#9B6DFF',      // Violett - Mysterium
    auroraGreen: '#7BE495',     // Grün - Validierung/Positiv
    textPrimary: '#E8E4F0',
    textSecondary: 'rgba(232, 228, 240, 0.7)',
    textMuted: 'rgba(232, 228, 240, 0.5)',
  }

  // Simulate resonance reveal after "reading" the story
  useEffect(() => {
    const timer = setTimeout(() => setIsResonanzVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* V17 Custom Styles */}
      <style jsx global>{`
        @keyframes resonance-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(155, 109, 255, 0.3), 0 0 40px rgba(155, 109, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(155, 109, 255, 0.5), 0 0 60px rgba(155, 109, 255, 0.2);
          }
        }

        @keyframes breathing {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes star-twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes aurora-flow {
          0% { transform: translateX(-100%) rotate(-5deg); }
          100% { transform: translateX(100%) rotate(5deg); }
        }

        .resonance-ring {
          animation: resonance-pulse 3s ease-in-out infinite;
        }

        .atmosphere-breathing {
          animation: breathing 4s ease-in-out infinite;
        }

        .star {
          animation: star-twinkle 3s ease-in-out infinite;
        }

        .aurora {
          animation: aurora-flow 15s linear infinite;
        }

        .emotional-highlight {
          background: linear-gradient(90deg, transparent, rgba(155, 109, 255, 0.2), transparent);
          border-left: 2px solid ${colors.veilPurple};
          padding-left: 12px;
          margin: 16px 0;
        }
      `}</style>

      <div
        className="max-w-4xl mx-auto px-4 pb-20 relative"
        style={{ backgroundColor: colors.void }}
      >
        {/* ============================================ */}
        {/* ATMOSPHERE LAYER - UFO Stars */}
        {/* ============================================ */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="star absolute rounded-full"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                backgroundColor: i % 3 === 0 ? colors.veilPurple : i % 3 === 1 ? colors.phenomenonTeal : '#fff',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                opacity: 0.3,
              }}
            />
          ))}
        </div>

        {/* Content Container */}
        <div className="relative z-10">

          {showAnnotations && (
            <Annotation color="purple">
              <strong>V17 RESONANZ:</strong> Emotionale Reise in 3 Phasen - Immersion → Erkenntnis → Verbindung.
              Story-First mit Pattern Prominent. "Du bist nicht allein mit deiner Erfahrung."
            </Annotation>
          )}

          {/* ============================================ */}
          {/* PHASE 1: IMMERSION - Hero + Story */}
          {/* ============================================ */}

          {/* Hero Image with Atmosphere Overlay */}
          <div className="relative rounded-2xl overflow-hidden mb-8" style={{ aspectRatio: '16/9' }}>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${colors.void} 0%, #1a1040 50%, ${colors.void} 100%)`,
              }}
            >
              {/* Placeholder for image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">🌌</div>
              </div>
            </div>

            {/* Atmosphere Overlay */}
            <div
              className="absolute inset-0 atmosphere-breathing"
              style={{
                background: `radial-gradient(ellipse at center, transparent 0%, ${colors.void}88 70%, ${colors.void} 100%)`,
              }}
            />

            {/* Category Badge + Title on Hero */}
            <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: `linear-gradient(transparent, ${colors.void})` }}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${colors.phenomenonTeal}20`, color: colors.phenomenonTeal, border: `1px solid ${colors.phenomenonTeal}40` }}
                >
                  🛸 UFO Sichtung
                </span>
                <span className="text-sm" style={{ color: colors.textMuted }}>•</span>
                <span className="text-sm" style={{ color: colors.textMuted }}>📍 Konstanz, DE</span>
                <span className="text-sm" style={{ color: colors.textMuted }}>•</span>
                <span className="text-sm" style={{ color: colors.textMuted }}>15. Nov 2024</span>
              </div>
              <h1
                className="text-3xl font-bold"
                style={{ color: colors.textPrimary, fontFamily: 'Space Grotesk, sans-serif' }}
              >
                "Das Licht über dem Bodensee"
              </h1>
            </div>
          </div>

          {/* Author Card + Quick Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Author Card */}
            <div
              className="p-4 rounded-xl flex items-center gap-4"
              style={{ backgroundColor: colors.surface, border: `1px solid ${colors.veilPurple}20` }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: colors.elevated, border: `2px solid ${colors.emberWarmth}` }}
              >
                👤
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: colors.textPrimary }}>Max S.</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: `${colors.auroraGreen}20`, color: colors.auroraGreen }}
                  >
                    Level 12
                  </span>
                </div>
                <p className="text-sm" style={{ color: colors.textMuted }}>Mitglied seit 2023 • 47 Erfahrungen</p>
              </div>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: `${colors.veilPurple}20`,
                  color: colors.veilPurple,
                  border: `1px solid ${colors.veilPurple}40`
                }}
              >
                Folgen
              </button>
            </div>

            {/* Quick Context */}
            <div
              className="p-4 rounded-xl grid grid-cols-2 gap-3"
              style={{ backgroundColor: colors.surface, border: `1px solid ${colors.phenomenonTeal}20` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱</span>
                <div>
                  <p className="text-xs" style={{ color: colors.textMuted }}>Lesezeit</p>
                  <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>4 Minuten</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">👁</span>
                <div>
                  <p className="text-xs" style={{ color: colors.textMuted }}>Form</p>
                  <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>Dreieckig</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🕐</span>
                <div>
                  <p className="text-xs" style={{ color: colors.textMuted }}>Dauer</p>
                  <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>4 Minuten</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-xs" style={{ color: colors.textMuted }}>Bewertung</p>
                  <p className="text-sm font-medium" style={{ color: colors.emberWarmth }}>4.2/5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px mb-8"
            style={{ background: `linear-gradient(90deg, transparent, ${colors.veilPurple}40, transparent)` }}
          />

          {showAnnotations && (
            <Annotation color="amber">
              <strong>STORY READER:</strong> Die Geschichte steht im Mittelpunkt. Emotionale Highlights werden
              hervorgehoben. Inline-Media integriert. Der User "erlebt" die Erfahrung.
            </Annotation>
          )}

          {/* ============================================ */}
          {/* STORY CONTENT with Emotional Highlights */}
          {/* ============================================ */}
          <div className="mb-12">
            <article
              className="prose prose-invert max-w-none"
              style={{ color: colors.textSecondary, lineHeight: 1.8 }}
            >
              <p className="text-lg leading-relaxed">
                Es war 3:47 Uhr morgens, als ich durch ein seltsames Summen geweckt wurde.
                Das Licht, das durch mein Fenster fiel, war nicht normal - es pulsierte in
                einem hypnotischen Rhythmus, der mich sofort in seinen Bann zog.
              </p>

              {/* Emotional Highlight */}
              <div className="emotional-highlight my-6 py-3">
                <p className="text-lg italic" style={{ color: colors.emberWarmth }}>
                  "In diesem Moment wusste ich: Das hier ist real. Ich bin nicht verrückt.
                  Ich sehe etwas, das nicht von dieser Welt ist."
                </p>
              </div>

              <p className="text-lg leading-relaxed">
                Ich stand langsam auf und ging zum Fenster. Über dem See schwebte ein
                dreieckiges Objekt - vielleicht 50 Meter über dem Wasser. Drei helle
                Lichter an den Ecken, eines in der Mitte, das in einem sanften Blau pulsierte.
              </p>

              {/* Inline Image Placeholder */}
              <div
                className="my-8 rounded-xl overflow-hidden"
                style={{ backgroundColor: colors.elevated, border: `1px solid ${colors.veilPurple}20` }}
              >
                <div className="aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>Foto: Das Licht von meinem Fenster</p>
                  </div>
                </div>
              </div>

              <p className="text-lg leading-relaxed">
                Die Stille war ohrenbetäubend. Kein Wind, keine Vögel, selbst das
                normalerweise konstante Rauschen des Sees war verstummt. Nur dieses
                leise Summen, das durch meinen ganzen Körper zu vibrieren schien.
              </p>

              {/* Another Emotional Highlight */}
              <div className="emotional-highlight my-6 py-3">
                <p className="text-lg italic" style={{ color: colors.emberWarmth }}>
                  "Nach etwa vier Minuten bewegte sich das Objekt. Nicht wie ein Flugzeug
                  oder Hubschrauber - es schoss einfach davon. Von 0 auf unglaublich in
                  einem Wimpernschlag."
                </p>
              </div>

              <p className="text-lg leading-relaxed">
                Seitdem habe ich jede Nacht zum Himmel geschaut. Manchmal frage ich mich,
                ob sie auch zu mir zurückschauen.
              </p>
            </article>
          </div>

          {/* Divider */}
          <div
            className="h-px mb-8"
            style={{ background: `linear-gradient(90deg, transparent, ${colors.veilPurple}40, transparent)` }}
          />

          {/* ============================================ */}
          {/* PHASE 2: ERKENNTNIS - Resonanz Card */}
          {/* ============================================ */}

          {showAnnotations && (
            <Annotation color="emerald">
              <strong>RESONANZ-RING:</strong> Das visuelle Kernelement. Pulsiert sanft und zeigt:
              "Du bist nicht allein". Emotionale Sprache statt technischer Daten.
            </Annotation>
          )}

          <div
            className={`rounded-2xl p-8 mb-8 transition-all duration-1000 ${isResonanzVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{
              backgroundColor: colors.surface,
              border: `2px solid ${colors.veilPurple}40`,
            }}
          >
            {/* Resonance Ring Effect */}
            <div
              className="resonance-ring rounded-xl p-6 mb-6"
              style={{
                backgroundColor: `${colors.veilPurple}10`,
                border: `1px solid ${colors.veilPurple}30`,
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">✧</div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: colors.textPrimary, fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  247 Menschen teilen dieses Gefühl
                </h3>
                <p style={{ color: colors.textSecondary }}>
                  Du bist nicht allein mit deiner Erfahrung
                </p>
              </div>
            </div>

            {/* Avatar Stack + Quote */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-3">
                {['👤', '👩', '👨', '👧', '🧑'].map((avatar, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
                    style={{
                      backgroundColor: colors.elevated,
                      borderColor: colors.surface,
                      zIndex: 5 - i
                    }}
                  >
                    {avatar}
                  </div>
                ))}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2"
                  style={{
                    backgroundColor: colors.veilPurple,
                    color: '#fff',
                    borderColor: colors.surface,
                  }}
                >
                  +242
                </div>
              </div>
              <p className="italic text-sm" style={{ color: colors.textMuted }}>
                "Ich hatte genau das gleiche Gefühl - als wäre die Zeit stehengeblieben..."
              </p>
            </div>

            {/* Twins Carousel */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3" style={{ color: colors.textMuted }}>
                Eure Erfahrungen überschneiden sich:
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { title: '"Das Summen"', matches: 7, excerpt: 'Auch ich hörte dieses vibrierende Geräusch...' },
                  { title: '"Auch 3:47 AM"', matches: 6, excerpt: 'Exakt die gleiche Uhrzeit, November 2024...' },
                  { title: '"Das Licht"', matches: 5, excerpt: 'Blau pulsierend, hypnotisch...' },
                ].map((twin, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: colors.elevated,
                      border: `1px solid ${colors.veilPurple}20`,
                    }}
                  >
                    <h5 className="font-semibold mb-1" style={{ color: colors.emberWarmth }}>{twin.title}</h5>
                    <p className="text-xs mb-2 line-clamp-2" style={{ color: colors.textMuted }}>{twin.excerpt}</p>
                    <div className="flex items-center gap-1">
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ backgroundColor: `${colors.phenomenonTeal}20`, color: colors.phenomenonTeal }}
                      >
                        {twin.matches} Übereinstimmungen
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              className="w-full py-3 rounded-xl font-medium transition-all hover:scale-[1.01]"
              style={{
                background: `linear-gradient(90deg, ${colors.veilPurple}, ${colors.phenomenonTeal})`,
                color: '#fff',
              }}
            >
              Alle 247 Verbindungen entdecken →
            </button>
          </div>

          {/* ============================================ */}
          {/* PATTERN DRAWER (Expandable) */}
          {/* ============================================ */}

          {showAnnotations && (
            <Annotation color="blue">
              <strong>PATTERN DRAWER:</strong> Detaillierte Daten für interessierte User.
              Default collapsed - auf Wunsch expandierbar. Nicht überwältigend.
            </Annotation>
          )}

          <div
            className="rounded-xl overflow-hidden mb-8"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.phenomenonTeal}20` }}
          >
            <button
              onClick={() => setIsPatternDrawerOpen(!isPatternDrawerOpen)}
              className="w-full p-4 flex items-center justify-between"
              style={{ color: colors.textPrimary }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📊</span>
                <span className="font-medium">Pattern-Details</span>
              </div>
              <span className="text-xl">{isPatternDrawerOpen ? '▲' : '▼'}</span>
            </button>

            {isPatternDrawerOpen && (
              <div className="p-4 pt-0">
                {/* Pattern Tabs */}
                <div className="flex gap-2 mb-4">
                  {[
                    { id: 'temporal', label: 'Zeitliche Muster', icon: '🕐' },
                    { id: 'geographic', label: 'Geografisch', icon: '🗺' },
                    { id: 'correlations', label: 'Korrelationen', icon: '🔗' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePatternTab(tab.id as typeof activePatternTab)}
                      className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                      style={{
                        backgroundColor: activePatternTab === tab.id ? `${colors.phenomenonTeal}20` : colors.elevated,
                        color: activePatternTab === tab.id ? colors.phenomenonTeal : colors.textMuted,
                        border: activePatternTab === tab.id ? `1px solid ${colors.phenomenonTeal}40` : '1px solid transparent',
                      }}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: colors.elevated }}
                >
                  {activePatternTab === 'temporal' && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📈</span>
                        <span style={{ color: colors.textPrimary }}>Zeitcluster: 03:00-04:00 (Peak)</span>
                      </div>
                      {/* Simple Timeline Visualization */}
                      <div className="h-16 flex items-end gap-1">
                        {[2, 3, 5, 8, 12, 15, 12, 8, 5, 3, 2, 1].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t"
                            style={{
                              height: `${height * 4}px`,
                              backgroundColor: i === 5 ? colors.veilPurple : `${colors.phenomenonTeal}60`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs" style={{ color: colors.textMuted }}>
                        <span>00:00</span>
                        <span>03:47</span>
                        <span>06:00</span>
                      </div>
                    </div>
                  )}

                  {activePatternTab === 'geographic' && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📍</span>
                        <span style={{ color: colors.textPrimary }}>8 Sichtungen im Umkreis von 50km</span>
                      </div>
                      {/* Map Placeholder */}
                      <div
                        className="h-40 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <span className="text-4xl">🗺</span>
                      </div>
                    </div>
                  )}

                  {activePatternTab === 'correlations' && (
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span style={{ color: colors.textSecondary }}>☀️ Sonnensturm</span>
                          <span style={{ color: colors.emberWarmth }}>Kp=4 (AKTIV)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ color: colors.textSecondary }}>🌙 Mondphase</span>
                          <span style={{ color: colors.textPrimary }}>Abnehmend 67%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ color: colors.textSecondary }}>🌡 Wetter</span>
                          <span style={{ color: colors.textPrimary }}>8°C, Klar</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* MEDIA GALLERY (if present) */}
          {/* ============================================ */}
          <div
            className="rounded-xl p-4 mb-8"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.veilPurple}20` }}
          >
            <h3 className="font-medium mb-4" style={{ color: colors.textPrimary }}>Medien (4)</h3>
            <div className="grid grid-cols-4 gap-3">
              {['📷', '📷', '🎵', '✏️'].map((media, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all hover:scale-105"
                  style={{ backgroundColor: colors.elevated }}
                >
                  {media}
                </div>
              ))}
            </div>
          </div>

          {/* ============================================ */}
          {/* PHASE 3: VERBINDUNG - Comments + CTA */}
          {/* ============================================ */}

          {showAnnotations && (
            <Annotation color="purple">
              <strong>VERBINDUNG:</strong> Community-Engagement und Call-to-Action.
              "Hast du etwas Ähnliches erlebt?" - Einladung zum Teilen.
            </Annotation>
          )}

          {/* Comments Preview */}
          <div
            className="rounded-xl p-4 mb-8"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.emberWarmth}20` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium" style={{ color: colors.textPrimary }}>Kommentare (23)</h3>
              <button
                className="text-sm"
                style={{ color: colors.veilPurple }}
              >
                Alle anzeigen →
              </button>
            </div>

            {/* Sample Comment */}
            <div className="flex gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.elevated }}
              >
                👩
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm" style={{ color: colors.textPrimary }}>Sarah K.</span>
                  <span className="text-xs" style={{ color: colors.textMuted }}>vor 2 Stunden</span>
                </div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  "Das erinnert mich so sehr an meine eigene Erfahrung letzten Monat. Das Summen... ich kann es bis heute nicht vergessen."
                </p>
              </div>
            </div>
          </div>

          {/* Share Your Experience CTA */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: `linear-gradient(135deg, ${colors.veilPurple}20, ${colors.phenomenonTeal}20)`,
              border: `1px solid ${colors.veilPurple}30`,
            }}
          >
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: colors.textPrimary, fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Hast du etwas Ähnliches erlebt?
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Deine Geschichte könnte anderen helfen, sich weniger allein zu fühlen.
            </p>
            <button
              className="px-8 py-4 rounded-xl font-medium text-lg transition-all hover:scale-105"
              style={{
                background: `linear-gradient(90deg, ${colors.emberWarmth}, ${colors.veilPurple})`,
                color: '#fff',
              }}
            >
              ✧ Erfahrung teilen
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

// ============================================
// VERSION 18 - CLARITY: Instant Comprehension Design
// ============================================
function Version18({ showAnnotations }: { showAnnotations: boolean }) {
  // Color scheme
  const colors = {
    primary: '#8B5CF6',      // Violet-500
    validation: '#10B981',   // Emerald-500
    aiAccent: '#06B6D4',     // Cyan-500
    background: '#0F0F1A',
    cardBg: '#1a1a2e',
    border: '#2d2d44',
  }

  return (
    <>
      {/* ============================================ */}
      {/* SECTION 1: HERO WITH STATS BAR              */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="purple">
            <strong>V18 Hero "Instant Comprehension":</strong> Stats-Bar OBEN = User weiß sofort wie relevant/beliebt der Eintrag ist.
            Kein Fullscreen-Image das zum Scrollen zwingt.
          </Annotation>
        )}

        {/* Stats Bar - TOP */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          <span className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center gap-2">
            👤 Shadow Person
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="text-lg">👁</span> 2,487 Views
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="text-lg">💬</span> 47 Kommentare
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="text-lg">🔗</span> 247 ähnliche Einträge
          </span>
        </div>

        {/* Title as Hero Quote */}
        <div className="relative mb-8">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
          <h1 className="text-3xl md:text-4xl font-light leading-tight pl-4">
            „Ich war allein auf dem Dachboden, <br />
            <span className="text-purple-400">als ich die Gestalt sah..."</span>
          </h1>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-6">
          <span className="flex items-center gap-1.5">
            <span>📍</span> Wien, Österreich
          </span>
          <span className="flex items-center gap-1.5">
            <span>🕐</span> 23:45 Uhr
          </span>
          <span className="flex items-center gap-1.5">
            <span>📅</span> 15. November 2019
          </span>
        </div>

        {/* Author Block with Follow */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/100?img=5"
              className="w-12 h-12 rounded-full border-2 border-purple-500"
              alt="Avatar"
            />
            <div>
              <p className="font-medium">Maria K.</p>
              <p className="text-sm text-gray-400">Level 12 Explorer • 47 Erfahrungen</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition">
            + Follow
          </button>
        </div>

        {/* Media Pills */}
        {showAnnotations && (
          <Annotation color="blue">
            <strong>Media-Pills:</strong> Sofort sehen was verfügbar ist - Fotos, Audio, Skizzen, Links.
            Clickable zum jeweiligen Bereich scrollen.
          </Annotation>
        )}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm flex items-center gap-2 cursor-pointer hover:border-purple-500 transition">
            📷 3 Fotos
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm flex items-center gap-2 cursor-pointer hover:border-purple-500 transition">
            🎙 Audio
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm flex items-center gap-2 cursor-pointer hover:border-purple-500 transition">
            🔗 2 Links
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm flex items-center gap-2 cursor-pointer hover:border-purple-500 transition">
            ✏️ Skizze
          </span>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: AI SUMMARY (TL;DR)               */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="blue">
            <strong>AI-Zusammenfassung:</strong> 85% der User lesen nicht den vollen Text.
            TL;DR VOR dem Volltext - mit AI-Marker (Cyan Border).
          </Annotation>
        )}

        <div className="relative rounded-xl overflow-hidden">
          {/* Cyan gradient border */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30 p-[1px]">
            <div className="w-full h-full rounded-xl bg-[#0F0F1A]" />
          </div>

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                ✨ KI-Zusammenfassung
              </h3>
              <button className="text-gray-500 hover:text-gray-300 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4">
              Maria berichtet von einer nächtlichen Begegnung mit einer schattenartigen Gestalt auf ihrem Dachboden.
              Die Erscheinung war schwärzer als die Dunkelheit, ohne erkennbare Gesichtszüge, aber mit dem
              intensiven Gefühl beobachtet zu werden. Nach ca. 5 Sekunden löste sie sich auf.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 text-xs">Shadow Person</span>
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 text-xs">Beobachtungsgefühl</span>
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 text-xs">Nachtzeit</span>
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 text-xs">Alte Gebäude</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: FULL STORY                       */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-medium">Die vollständige Geschichte</h3>
            <button className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Einklappen
            </button>
          </div>

          <div className="p-6 space-y-4 text-gray-300 leading-relaxed">
            <p>
              Es war kurz vor Mitternacht. Ich konnte nicht schlafen – zu viele Gedanken.
              Also beschloss ich, auf den Dachboden zu gehen, um alte Fotoalben zu suchen.
              Vielleicht würde mich das ablenken.
            </p>
            <p>
              Die Holztreppe knarrte unter meinen Füßen. Oben war es stockdunkel, nur das
              schwache Mondlicht fiel durch das kleine Fenster. Ich tastete nach dem
              Lichtschalter...
            </p>

            {/* Pull Quote */}
            <div className="my-6 pl-6 border-l-4 border-purple-500">
              <p className="text-xl text-white font-medium">
                „Dann sah ich es. Eine Gestalt. Direkt vor mir."
              </p>
            </div>

            <p>
              Komplett schwarz. Nicht wie ein Schatten – <em>schwärzer</em> als die Dunkelheit
              um sie herum. Keine Gesichtszüge, keine Details. Aber ich <strong>wusste</strong>,
              dass sie mich ansah. Ich konnte es fühlen.
            </p>
            <p>
              Ich stand wie eingefroren. Mein Herz hämmerte. Dann, nach vielleicht 5 Sekunden,
              löste sich die Gestalt einfach auf. Wie Rauch, der sich verflüchtigt.
            </p>
            <p>
              Ich rannte die Treppe hinunter und habe in dieser Nacht kein Auge mehr zugemacht.
              Bis heute habe ich niemandem davon erzählt. Ich dachte, man würde mich für verrückt halten.
            </p>

            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>📅 Ereignis: 15. Nov 2019, 23:45</span>
              <span>📝 Geteilt: 20. März 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: MEDIA GALLERY                    */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/10">
            <h3 className="font-medium">Anhänge</h3>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-white/10">
            <button className="px-4 py-3 text-sm font-medium text-purple-400 border-b-2 border-purple-500">
              📷 Fotos (3)
            </button>
            <button className="px-4 py-3 text-sm text-gray-400 hover:text-white transition">
              🎙 Audio
            </button>
            <button className="px-4 py-3 text-sm text-gray-400 hover:text-white transition">
              ✏️ Skizzen
            </button>
            <button className="px-4 py-3 text-sm text-gray-400 hover:text-white transition">
              🔗 Links (2)
            </button>
          </div>

          {/* Photos Grid */}
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <img
                src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400"
                className="rounded-lg aspect-square object-cover hover:scale-105 transition cursor-pointer"
                alt="Foto 1"
              />
              <img
                src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400"
                className="rounded-lg aspect-square object-cover hover:scale-105 transition cursor-pointer"
                alt="Foto 2"
              />
              <img
                src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400"
                className="rounded-lg aspect-square object-cover hover:scale-105 transition cursor-pointer"
                alt="Foto 3"
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">Dachboden, aufgenommen am 16.11.2019</p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: VALIDATION HERO                  */}
      {/* ============================================ */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="emerald">
            <strong>Validation Hero "Du bist nicht allein":</strong> Der emotionale Kern der Plattform.
            Prominent, nicht in Tabs versteckt. Die große Zahl validiert das Erlebnis.
          </Annotation>
        )}

        {/* Main Validation Card */}
        <div
          className="relative rounded-2xl overflow-hidden mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
            boxShadow: '0 0 60px rgba(139, 92, 246, 0.2)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl border border-purple-500/30" />

          <div className="relative p-8 text-center">
            <p className="text-sm text-purple-300 mb-2 tracking-wider">✧ VERBINDUNGEN ✧</p>

            <div className="py-8">
              <p className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                247 Menschen
              </p>
              <p className="text-xl text-gray-300">hatten ähnliche Erfahrungen</p>
            </div>

            {/* Match Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Durchschnittliche Übereinstimmung</span>
                <span className="text-emerald-400 font-medium">78%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-500"
                  style={{ width: '78%' }}
                />
              </div>
            </div>

            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 font-medium transition">
              Alle ähnlichen Erfahrungen ansehen →
            </button>
          </div>
        </div>

        {/* Similar Experience Cards */}
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span>💬</span> „Das habe ich auch erlebt"
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-emerald-500/50 transition cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                92% Match
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3 line-clamp-3">
              „Im Keller, exakt dieselbe Beschreibung – keine Gesichtszüge,
              aber man <strong className="text-white">WEISS</strong> dass es einen ansieht..."
            </p>
            <div className="flex items-center gap-2">
              <img src="https://i.pravatar.cc/100?img=12" className="w-6 h-6 rounded-full" alt="" />
              <span className="text-sm text-gray-400">Stefan M.</span>
              <span className="text-xs text-gray-500">• Wien</span>
            </div>
            <p className="text-sm text-purple-400 mt-2 opacity-0 group-hover:opacity-100 transition">
              Mehr lesen →
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-emerald-500/50 transition cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                85% Match
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3 line-clamp-3">
              „Vor 3 Jahren, auch nachts. Ich dachte ich werde verrückt bis ich diese
              Seite fand. Es ist so erleichternd zu wissen..."
            </p>
            <div className="flex items-center gap-2">
              <img src="https://i.pravatar.cc/100?img=23" className="w-6 h-6 rounded-full" alt="" />
              <span className="text-sm text-gray-400">Lisa T.</span>
              <span className="text-xs text-gray-500">• München</span>
            </div>
            <p className="text-sm text-purple-400 mt-2 opacity-0 group-hover:opacity-100 transition">
              Mehr lesen →
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-yellow-500/50 transition cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                71% Match
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3 line-clamp-3">
              „Meine war nicht komplett schwarz, sondern hatte so einen grauen Schimmer.
              Aber das Gefühl – identisch."
            </p>
            <div className="flex items-center gap-2">
              <img src="https://i.pravatar.cc/100?img=33" className="w-6 h-6 rounded-full" alt="" />
              <span className="text-sm text-gray-400">Thomas R.</span>
              <span className="text-xs text-gray-500">• Salzburg</span>
            </div>
            <p className="text-sm text-purple-400 mt-2 opacity-0 group-hover:opacity-100 transition">
              Mehr lesen →
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: PATTERN INSIGHTS                 */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="amber">
            <strong>Pattern Insights:</strong> Die wissenschaftliche Dimension.
            Muster-Daten machen die Plattform wertvoll. Inline, nicht in Tabs versteckt.
          </Annotation>
        )}

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <span>💡</span> Insights zu diesem Muster
          </h3>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition">
            Mehr →
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Temporal Card */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>🕐</span> ZEITLICH
            </h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Nachts (23-03 Uhr)</span>
                  <span className="text-purple-400">89%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[89%] bg-purple-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Abends</span>
                  <span className="text-purple-400">8%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[8%] bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Geographic Card */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>📍</span> GEOGRAFISCH
            </h4>
            <div className="h-24 bg-gray-800/50 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
              {/* Simple map indicator */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-purple-400 rounded-full" />
                <div className="absolute top-2/5 left-2/3 w-2 h-2 bg-purple-400 rounded-full" />
              </div>
              <span className="text-xs text-gray-500">Mini-Map</span>
            </div>
            <p className="text-xs text-gray-400">
              Häufig in <strong className="text-white">DACH-Region</strong>
            </p>
          </div>

          {/* Factors Card */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>🔗</span> FAKTOREN
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Allein im Raum</span>
                <span className="text-sm font-medium text-emerald-400">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Altes Gebäude</span>
                <span className="text-sm font-medium text-emerald-400">67%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Unter Stress</span>
                <span className="text-sm font-medium text-emerald-400">71%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Insight */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
          <p className="text-sm text-amber-200">
            📊 <strong>Pattern-Analyse:</strong> „Shadow Person Sichtungen korrelieren stark mit
            Schlafentzug und älteren Gebäuden. 89% der Berichte stammen aus den Nachtstunden."
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: ACTION BAR                       */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="purple">
            <strong>"Das hatte ich auch!" CTA:</strong> Der Wachstums-Motor der Plattform.
            Prominent, erklärt den Wert des Teilens. Öffnet Submission-Flow mit pre-filled Category.
          </Annotation>
        )}

        {/* Main CTA Card */}
        <div
          className="rounded-2xl p-8 mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <div className="text-3xl mb-4">🙋</div>
          <h3 className="text-xl font-medium mb-2">Das hatte ich auch!</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Teile deine ähnliche Erfahrung und hilf dabei,
            dieses Phänomen besser zu verstehen.
          </p>
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-medium text-lg transition hover:scale-105">
            Meine Erfahrung teilen →
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition">
            <span>❤️</span> 234
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition">
            <span>🔖</span> Speichern
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition">
            <span>↗️</span> Teilen
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:text-white transition">
            <span>⚠️</span> Melden
          </button>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 8: COMMENTS                         */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto mb-20">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
          <span>💬</span> Diskussion
          <span className="text-sm font-normal text-gray-500">(47 Kommentare)</span>
        </h3>

        {/* Expert Comment */}
        <div
          className="rounded-xl p-6 mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(30, 30, 40, 1) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <div className="flex items-start gap-4">
            <img
              src="https://i.pravatar.cc/100?img=60"
              className="w-12 h-12 rounded-full border-2 border-amber-500"
              alt=""
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-medium">Dr. Michael Hoffmann</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center gap-1">
                  ⭐ Verifizierter Experte
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">Parapsychologie-Forscher • Universität Freiburg</p>
              <p className="text-gray-300 leading-relaxed">
                Diese Beschreibung passt exakt zum Phänomen der „Shadow People", das seit den
                1990ern systematisch dokumentiert wird. Besonders interessant ist die Konsistenz
                der Beschreibungen: Das „Wissen" um die Beobachtung ohne visuelle Hinweise wird
                in über 80% der Berichte erwähnt.
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <button className="text-gray-500 hover:text-white transition">↳ 12 Antworten</button>
                <button className="text-gray-500 hover:text-white transition">👍 45</button>
              </div>
            </div>
          </div>
        </div>

        {/* Regular Comment */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 mb-4">
          <div className="flex items-start gap-4">
            <img
              src="https://i.pravatar.cc/100?img=44"
              className="w-10 h-10 rounded-full"
              alt=""
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Anna B.</span>
                <span className="text-xs text-gray-500">• vor 2 Stunden</span>
              </div>
              <p className="text-gray-300">
                Danke dass du das geteilt hast. Ich hatte sowas ähnliches als Kind und
                hab mich nie getraut es jemandem zu erzählen. 💜
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <button className="text-gray-500 hover:text-white transition">Antworten</button>
                <button className="text-gray-500 hover:text-white transition">👍 8</button>
              </div>
            </div>
          </div>
        </div>

        {/* Load More */}
        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition text-sm">
          Weitere Kommentare laden...
        </button>

        {/* Comment Input */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 mt-6">
          <p className="font-medium mb-4">Deine Gedanken?</p>
          <textarea
            className="w-full bg-gray-800 rounded-xl p-4 text-gray-300 placeholder-gray-600 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
            rows={3}
            placeholder="Schreibe einen Kommentar..."
          />
          <div className="flex justify-end mt-4">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition">
              Kommentieren
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================
// VERSION 19 - CLARITY+: Enhanced with Credibility, Timeline, Micro-Reactions
// ============================================
function Version19({ showAnnotations }: { showAnnotations: boolean }) {
  const [readProgress, setReadProgress] = useState(0)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [reactions, setReactions] = useState({ goosebumps: 89, relatable: 134, interesting: 67, skeptical: 12 })
  const [animatedStats, setAnimatedStats] = useState({ views: 0, comments: 0, similar: 0 })

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const total = document.body.scrollHeight - window.innerHeight
      setReadProgress(Math.min(100, (scrolled / total) * 100))
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animate stats on mount
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setAnimatedStats({
        views: Math.floor(2487 * easeOut),
        comments: Math.floor(47 * easeOut),
        similar: Math.floor(247 * easeOut),
      })
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  // Simulate audio progress
  useEffect(() => {
    if (audioPlaying) {
      const timer = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setAudioPlaying(false)
            return 0
          }
          return prev + (0.5 * playbackSpeed)
        })
      }, 100)
      return () => clearInterval(timer)
    }
  }, [audioPlaying, playbackSpeed])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleReaction = (type: keyof typeof reactions) => {
    setReactions(prev => ({ ...prev, [type]: prev[type] + 1 }))
  }

  return (
    <>
      {/* ============================================ */}
      {/* READING PROGRESS BAR (Fixed)                */}
      {/* ============================================ */}
      <div className="fixed top-28 left-0 right-0 z-40 h-1 bg-gray-800/50">
        <div
          className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F59E0B] transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* ============================================ */}
      {/* SECTION 1: HERO WITH CREDIBILITY SCORE      */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="purple">
            <strong>V19 Hero:</strong> Stats zählen animiert hoch. Media-Pills sind klickbar.
          </Annotation>
        )}

        {/* Stats Bar - TOP with animated counts */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          <span className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center gap-2">
            👤 Shadow Person
          </span>
          <span className="flex items-center gap-1.5 text-gray-400 tabular-nums">
            <span className="text-lg">👁</span> {animatedStats.views.toLocaleString()} Views
          </span>
          <span className="flex items-center gap-1.5 text-gray-400 tabular-nums">
            <span className="text-lg">💬</span> {animatedStats.comments} Kommentare
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium tabular-nums">
            <span className="text-lg">🔗</span> {animatedStats.similar} ähnliche Einträge
          </span>
        </div>

        {/* Title as Hero Quote */}
        <div className="relative mb-6">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-amber-500 rounded-full" />
          <h1 className="text-3xl md:text-4xl font-light leading-tight pl-4">
            „Ich war allein auf dem Dachboden, <br />
            <span className="text-purple-400">als ich die Gestalt sah..."</span>
          </h1>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-6">
          <span className="flex items-center gap-1.5">
            <span>📍</span> Wien, Österreich
          </span>
          <span className="flex items-center gap-1.5">
            <span>🕐</span> 23:45 Uhr
          </span>
          <span className="flex items-center gap-1.5">
            <span>📅</span> 15. November 2019
          </span>
        </div>

        {/* Author Block with Follow */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/100?img=5"
              className="w-12 h-12 rounded-full border-2 border-purple-500"
              alt="Avatar"
            />
            <div>
              <p className="font-medium">Maria K.</p>
              <p className="text-sm text-gray-400">Level 12 Explorer • 47 Erfahrungen</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition">
            + Follow
          </button>
        </div>

        {/* Media Pills - CLICKABLE */}
        {showAnnotations && (
          <Annotation color="blue">
            <strong>Klickbare Media-Pills:</strong> Smooth-scroll zum jeweiligen Bereich.
          </Annotation>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => scrollToSection('media-gallery')}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm flex items-center gap-2 cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition"
          >
            📷 3 Fotos ↓
          </button>
          <button
            onClick={() => setShowAudioPlayer(true)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm flex items-center gap-2 cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition"
          >
            🎙 Audio ↓
          </button>
          <button
            onClick={() => scrollToSection('media-gallery')}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm flex items-center gap-2 cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition"
          >
            🔗 2 Links ↓
          </button>
          <button
            onClick={() => scrollToSection('media-gallery')}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm flex items-center gap-2 cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition"
          >
            ✏️ Skizze ↓
          </button>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: AI SUMMARY + AUDIO PLAYER        */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="blue">
            <strong>AI-Summary + Audio Player:</strong> NEU: KI-Narrator liest die Geschichte vor.
            Collapsible Player mit Speed Control.
          </Annotation>
        )}

        <div className="relative rounded-xl overflow-hidden">
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/30 via-pink-500/20 to-amber-500/30 p-[1px]">
            <div className="w-full h-full rounded-xl bg-[#0F0F1A]" />
          </div>

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                ✨ KI-Zusammenfassung
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                  className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1.5 transition ${
                    showAudioPlayer
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  🔊 Anhören
                </button>
                <button className="text-gray-500 hover:text-gray-300 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4">
              Maria berichtet von einer nächtlichen Begegnung mit einer schattenartigen Gestalt auf ihrem Dachboden.
              Die Erscheinung war schwärzer als die Dunkelheit, ohne erkennbare Gesichtszüge, aber mit dem
              intensiven Gefühl beobachtet zu werden. Nach ca. 5 Sekunden löste sie sich auf.
            </p>

            {/* AUDIO PLAYER - NEU! */}
            {showAudioPlayer && (
              <div className="mb-4 p-4 rounded-xl bg-gray-900/80 border border-pink-500/30">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAudioPlaying(!audioPlaying)}
                    className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-400 flex items-center justify-center transition"
                  >
                    {audioPlaying ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 tabular-nums w-10">
                        {Math.floor(audioProgress * 1.54 / 60)}:{String(Math.floor(audioProgress * 1.54 % 60)).padStart(2, '0')}
                      </span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-amber-500 rounded-full transition-all"
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums w-10">2:34</span>
                    </div>
                    <p className="text-xs text-gray-500">Diese Geschichte wird von einer KI vorgelesen</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="text-gray-500 hover:text-white transition p-1">🔊</button>
                    <button
                      onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1)}
                      className="px-2 py-1 rounded bg-gray-800 text-xs text-gray-400 hover:text-white transition"
                    >
                      {playbackSpeed}x
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 text-xs">Shadow Person</span>
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 text-xs">Beobachtungsgefühl</span>
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 text-xs">Nachtzeit</span>
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 text-xs">Alte Gebäude</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: FULL STORY (V19)                 */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-medium">Die vollständige Geschichte</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAudioPlayer(true)}
                className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20"
              >
                🔊 Anhören
              </button>
              <button className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Einklappen
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 text-gray-300 leading-relaxed">
            <p>
              Es war kurz vor Mitternacht. Ich konnte nicht schlafen – zu viele Gedanken.
              Also beschloss ich, auf den Dachboden zu gehen, um alte Fotoalben zu suchen.
              Vielleicht würde mich das ablenken.
            </p>
            <p>
              Die Holztreppe knarrte unter meinen Füßen. Oben war es stockdunkel, nur das
              schwache Mondlicht fiel durch das kleine Fenster. Ich tastete nach dem
              Lichtschalter...
            </p>

            {/* Pull Quote */}
            <div className="my-6 pl-6 border-l-4 border-pink-500">
              <p className="text-xl text-white font-medium">
                „Dann sah ich es. Eine Gestalt. Direkt vor mir."
              </p>
            </div>

            <p>
              Komplett schwarz. Nicht wie ein Schatten – <em>schwärzer</em> als die Dunkelheit
              um sie herum. Keine Gesichtszüge, keine Details. Aber ich <strong>wusste</strong>,
              dass sie mich ansah. Ich konnte es fühlen.
            </p>
            <p>
              Ich stand wie eingefroren. Mein Herz hämmerte. Dann, nach vielleicht 5 Sekunden,
              löste sich die Gestalt einfach auf. Wie Rauch, der sich verflüchtigt.
            </p>
            <p>
              Ich rannte die Treppe hinunter und habe in dieser Nacht kein Auge mehr zugemacht.
              Bis heute habe ich niemandem davon erzählt. Ich dachte, man würde mich für verrückt halten.
            </p>

            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>📅 Ereignis: 15. Nov 2019, 23:45</span>
              <span>📝 Geteilt: 20. März 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: MEDIA GALLERY                    */}
      {/* ============================================ */}
      <section id="media-gallery" className="px-6 py-8 max-w-4xl mx-auto">
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-white/10">
            <h3 className="font-medium">Anhänge</h3>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-white/10">
            <button className="px-4 py-3 text-sm font-medium text-pink-400 border-b-2 border-pink-500">
              📷 Fotos (3)
            </button>
            <button className="px-4 py-3 text-sm text-gray-400 hover:text-white transition">
              🎙 Audio
            </button>
            <button className="px-4 py-3 text-sm text-gray-400 hover:text-white transition">
              ✏️ Skizzen
            </button>
            <button className="px-4 py-3 text-sm text-gray-400 hover:text-white transition">
              🔗 Links (2)
            </button>
          </div>

          {/* Photos Grid */}
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <img
                src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400"
                className="rounded-lg aspect-square object-cover hover:scale-105 transition cursor-pointer"
                alt="Foto 1"
              />
              <img
                src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400"
                className="rounded-lg aspect-square object-cover hover:scale-105 transition cursor-pointer"
                alt="Foto 2"
              />
              <img
                src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400"
                className="rounded-lg aspect-square object-cover hover:scale-105 transition cursor-pointer"
                alt="Foto 3"
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">Dachboden, aufgenommen am 16.11.2019</p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: VALIDATION + MICRO-REACTIONS     */}
      {/* ============================================ */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="emerald">
            <strong>Validation + Micro-Reactions:</strong> NEU: Quick-Reactions ohne Kommentar.
            Match-Cards zeigen explizit GLEICH/ANDERS.
          </Annotation>
        )}

        {/* Main Validation Card */}
        <div
          className="relative rounded-2xl overflow-hidden mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(245, 158, 11, 0.05) 100%)',
            boxShadow: '0 0 60px rgba(236, 72, 153, 0.2)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl border border-pink-500/30" />

          <div className="relative p-8 text-center">
            <p className="text-sm text-pink-300 mb-2 tracking-wider">✧ VERBINDUNGEN ✧</p>

            <div className="py-8">
              <p className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                247 Menschen
              </p>
              <p className="text-xl text-gray-300">hatten ähnliche Erfahrungen</p>
            </div>

            {/* Match Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Durchschnittliche Übereinstimmung</span>
                <span className="text-emerald-400 font-medium">78%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"
                  style={{ width: '78%' }}
                />
              </div>
            </div>

            {/* MICRO-REACTIONS - NEU! */}
            <div className="mb-6 p-4 rounded-xl bg-black/30 border border-white/10">
              <p className="text-sm text-gray-400 mb-3">Wie reagierst du auf diese Geschichte?</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleReaction('goosebumps')}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition flex items-center gap-2"
                >
                  😱 Gänsehaut! <span className="text-xs opacity-70">{reactions.goosebumps}</span>
                </button>
                <button
                  onClick={() => handleReaction('relatable')}
                  className="px-4 py-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/30 transition flex items-center gap-2"
                >
                  🤝 Kenne ich! <span className="text-xs opacity-70">{reactions.relatable}</span>
                </button>
                <button
                  onClick={() => handleReaction('interesting')}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-2"
                >
                  🔬 Interessant <span className="text-xs opacity-70">{reactions.interesting}</span>
                </button>
                <button
                  onClick={() => handleReaction('skeptical')}
                  className="px-4 py-2 rounded-lg bg-gray-500/20 border border-gray-500/40 text-gray-300 hover:bg-gray-500/30 transition flex items-center gap-2"
                >
                  ❓ Skeptisch <span className="text-xs opacity-70">{reactions.skeptical}</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">{Object.values(reactions).reduce((a, b) => a + b, 0)} Reaktionen</p>
            </div>

            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:via-pink-500 hover:to-amber-500 font-medium transition">
              Alle ähnlichen Erfahrungen ansehen →
            </button>
          </div>
        </div>

        {/* Similar Experience Cards with DIFF */}
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span>💬</span> „Das habe ich auch erlebt"
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Card 1 - with DIFF */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-emerald-500/50 transition cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                92% Match
              </span>
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/100?img=12" className="w-6 h-6 rounded-full" alt="" />
                <span className="text-sm text-gray-400">Stefan M.</span>
                <span className="text-xs text-gray-500">• Wien</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              „Im Keller, exakt dieselbe Beschreibung – keine Gesichtszüge,
              aber man <strong className="text-white">WEISS</strong> dass es einen ansieht..."
            </p>
            {/* DIFF Section - NEU! */}
            <div className="pt-3 border-t border-white/10 space-y-1">
              <p className="text-xs text-emerald-400">✓ GLEICH: Nachtzeit, Schatten-Gestalt, Alleinsein, "Wissen"</p>
              <p className="text-xs text-amber-400">✗ ANDERS: Ort (Keller vs Dachboden)</p>
            </div>
            <p className="text-sm text-pink-400 mt-3 opacity-0 group-hover:opacity-100 transition">
              Mehr lesen →
            </p>
          </div>

          {/* Card 2 - with DIFF */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-emerald-500/50 transition cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                85% Match
              </span>
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/100?img=23" className="w-6 h-6 rounded-full" alt="" />
                <span className="text-sm text-gray-400">Lisa T.</span>
                <span className="text-xs text-gray-500">• München</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              „Vor 3 Jahren, auch nachts. Ich dachte ich werde verrückt bis ich diese
              Seite fand. Es ist so erleichternd zu wissen..."
            </p>
            {/* DIFF Section - NEU! */}
            <div className="pt-3 border-t border-white/10 space-y-1">
              <p className="text-xs text-emerald-400">✓ GLEICH: Nachtzeit, Beobachtungsgefühl, Angst</p>
              <p className="text-xs text-amber-400">✗ ANDERS: Keine visuelle Form, nur Präsenz</p>
            </div>
            <p className="text-sm text-pink-400 mt-3 opacity-0 group-hover:opacity-100 transition">
              Mehr lesen →
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: PATTERN INSIGHTS                 */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="amber">
            <strong>Pattern Insights:</strong> Wissenschaftliche Dimension.
            Muster-Daten machen die Plattform wertvoll.
          </Annotation>
        )}

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <span>💡</span> Insights zu diesem Muster
          </h3>
          <button className="text-sm text-pink-400 hover:text-pink-300 transition">
            Mehr →
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Temporal Card */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>🕐</span> ZEITLICH
            </h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Nachts (23-03 Uhr)</span>
                  <span className="text-purple-400">89%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[89%] bg-purple-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Abends</span>
                  <span className="text-purple-400">8%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[8%] bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Geographic Card */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>📍</span> GEOGRAFISCH
            </h4>
            <div className="h-24 bg-gray-800/50 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-pink-500 rounded-full animate-pulse" />
                <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-pink-400 rounded-full" />
                <div className="absolute top-2/5 left-2/3 w-2 h-2 bg-pink-400 rounded-full" />
              </div>
              <span className="text-xs text-gray-500">Mini-Map</span>
            </div>
            <p className="text-xs text-gray-400">
              Häufig in <strong className="text-white">DACH-Region</strong>
            </p>
          </div>

          {/* Factors Card */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>🔗</span> FAKTOREN
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Allein im Raum</span>
                <span className="text-sm font-medium text-emerald-400">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Altes Gebäude</span>
                <span className="text-sm font-medium text-emerald-400">67%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Unter Stress</span>
                <span className="text-sm font-medium text-emerald-400">71%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Insight */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
          <p className="text-sm text-amber-200">
            📊 <strong>Pattern-Analyse:</strong> „Shadow Person Sichtungen korrelieren stark mit
            Schlafentzug und älteren Gebäuden. 89% der Berichte stammen aus den Nachtstunden."
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: ACTION BAR + NEXT STEPS          */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {showAnnotations && (
          <Annotation color="purple">
            <strong>"Next Steps" Guidance:</strong> NEU: 4 Optionen was der User als nächstes tun kann.
            Verhindert "Was jetzt?" Moment nach dem Lesen.
          </Annotation>
        )}

        {/* Main CTA Card */}
        <div
          className="rounded-2xl p-8 mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.15) 50%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
          }}
        >
          <div className="text-3xl mb-4">🙋</div>
          <h3 className="text-xl font-medium mb-2">Das hatte ich auch!</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Teile deine ähnliche Erfahrung und hilf dabei,
            dieses Phänomen besser zu verstehen.
          </p>
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:via-pink-500 hover:to-amber-500 font-medium text-lg transition hover:scale-105">
            Meine Erfahrung teilen →
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition">
            <span>❤️</span> 234
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition">
            <span>🔖</span> Speichern
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition">
            <span>↗️</span> Teilen
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:text-white transition">
            <span>⚠️</span> Melden
          </button>
        </div>

      </section>

      {/* ============================================ */}
      {/* SECTION 8: COMMENTS                         */}
      {/* ============================================ */}
      <section className="px-6 py-8 max-w-4xl mx-auto mb-20">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
          <span>💬</span> Diskussion
          <span className="text-sm font-normal text-gray-500">(47 Kommentare)</span>
        </h3>

        {/* Expert Comment */}
        <div
          className="rounded-xl p-6 mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(30, 30, 40, 1) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <div className="flex items-start gap-4">
            <img
              src="https://i.pravatar.cc/100?img=60"
              className="w-12 h-12 rounded-full border-2 border-amber-500"
              alt=""
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-medium">Dr. Michael Hoffmann</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center gap-1">
                  ⭐ Verifizierter Experte
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">Parapsychologie-Forscher • Universität Freiburg</p>
              <p className="text-gray-300 leading-relaxed">
                Diese Beschreibung passt exakt zum Phänomen der „Shadow People", das seit den
                1990ern systematisch dokumentiert wird. Besonders interessant ist die Konsistenz
                der Beschreibungen: Das „Wissen" um die Beobachtung ohne visuelle Hinweise wird
                in über 80% der Berichte erwähnt.
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <button className="text-gray-500 hover:text-white transition">↳ 12 Antworten</button>
                <button className="text-gray-500 hover:text-white transition">👍 45</button>
              </div>
            </div>
          </div>
        </div>

        {/* Regular Comment */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 mb-4">
          <div className="flex items-start gap-4">
            <img
              src="https://i.pravatar.cc/100?img=44"
              className="w-10 h-10 rounded-full"
              alt=""
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Anna B.</span>
                <span className="text-xs text-gray-500">• vor 2 Stunden</span>
              </div>
              <p className="text-gray-300">
                Danke dass du das geteilt hast. Ich hatte sowas ähnliches als Kind und
                hab mich nie getraut es jemandem zu erzählen. 💜
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <button className="text-gray-500 hover:text-white transition">Antworten</button>
                <button className="text-gray-500 hover:text-white transition">👍 8</button>
              </div>
            </div>
          </div>
        </div>

        {/* Load More */}
        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition text-sm">
          Weitere Kommentare laden...
        </button>

        {/* Comment Input */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 mt-6">
          <p className="font-medium mb-4">Deine Gedanken?</p>
          <textarea
            className="w-full bg-gray-800 rounded-xl p-4 text-gray-300 placeholder-gray-600 border border-gray-700 focus:border-pink-500 focus:outline-none resize-none"
            rows={3}
            placeholder="Schreibe einen Kommentar..."
          />
          <div className="flex justify-end mt-4">
            <button className="px-6 py-2 bg-pink-600 hover:bg-pink-500 rounded-xl font-medium transition">
              Kommentieren
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================
// COMPARISON TABLE
// ============================================
function ComparisonTable({ currentVersion }: { currentVersion: 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8' | 'v9' | 'v10' | 'v11' | 'v12' | 'v13' | 'v14' | 'v15' | 'v16' | 'v17' | 'v18' | 'v19' }) {
  const comparisons = [
    {
      aspect: '🎯 Kernfokus',
      v1: 'Story (immersiv)',
      v2: 'Story (strukturiert)',
      v3: 'Story + Features',
      v4: 'Verbindungen zuerst',
      v5: 'Phänomen zuerst',
      v6: '◈ LIMINAL ARCHIVE',
      v7: '⬡ NEXUS CINEMATIC',
      v8: '✧ ARCANA ORACLE',
      v9: '📁 INVESTIGATION',
      v10: '🔭 OBSERVATION',
      v11: '🧠 COGNITION',
      v12: '🧠⚡ FULL NEURAL',
      v13: '✧ ESSENCE (Klarheit)',
      v14: '⬢ COMMAND CENTER',
      v15: '✧ ETHEREAL GLASS',
      v16: '◈ LIMINAL ARCHIVE (Mystery)',
      v17: '✧ RESONANZ (Emotional)',
      v18: '◉ CLARITY (Instant Info)',
      v19: '◉⁺ CLARITY+ (Trust+Guide)',
      best: 'v19',
    },
    {
      aspect: 'Protagonist',
      v1: 'Die Story',
      v2: 'Die Story',
      v3: 'Die Story',
      v4: 'Die Story + Netzwerk',
      v5: 'Das Phänomen',
      v6: 'Die REALITÄT (Portal)',
      v7: 'DIE ERFAHRUNG (Film)',
      v8: 'DAS SCHICKSAL (Karte)',
      v9: 'DER USER (Ermittler)',
      v10: 'DER KOSMOS (Beobachter)',
      v11: 'DAS SYSTEM (Denker)',
      v12: 'ALLE SYSTEME (Komplett)',
      v13: 'DER INHALT (puristisch)',
      v14: 'DAS TEAM (3-Column)',
      v15: 'DIE RESONANZ (Editorial)',
      v16: 'DER FALL (Case File)',
      v17: 'DIE VERBINDUNG (Twins)',
      v18: 'DIE INFO (Instant)',
      v19: 'DIE VERTRAUEN (Guidance)',
      best: 'v19',
    },
    {
      aspect: 'Above-the-Fold',
      v1: 'Titel + Hero Image',
      v2: 'Tags + Teaser',
      v3: 'Tags + Teaser + Map',
      v4: '"248 Menschen" + Graph',
      v5: '"SHADOW PEOPLE" + Stats',
      v6: 'REALITY BREACH + Glitch',
      v7: '3D HERO + Parallax',
      v8: 'TAROT KARTE (Interaktiv)',
      v9: 'CASE FILE HEADER',
      v10: 'STAR FIELD + MAGNITUDE',
      v11: 'NEURAL HEADER + STATES',
      v12: 'NEURAL + MODULE GRID',
      v13: 'HERO + STORY only',
      v14: '3-COLUMN OVERVIEW',
      v15: 'EDITORIAL HERO + Glass',
      v16: 'SPLIT: Story + Patterns',
      v17: 'HERO + STORY + RESONANZ',
      v18: 'STATS-BAR + AI-SUMMARY',
      v19: 'PROGRESS + CREDIBILITY + AUDIO',
      best: 'v19',
    },
    {
      aspect: 'KI-Synthese',
      v1: '❌',
      v2: 'Teaser',
      v3: 'Teaser',
      v4: 'Match-Erklärung',
      v5: '"Typisches Erlebnis"',
      v6: 'SIGNAL ANALYSIS',
      v7: 'WHY SIMILAR Cards',
      v8: 'ORAKEL-DEUTUNG',
      v9: 'SCORE TRANSPARENCY',
      v10: 'CONSTELLATION INSIGHT',
      v11: 'COGNITIVE PROCESSING',
      v12: 'PROCESS STREAM LIVE',
      v13: 'Progressive Discovery',
      v14: 'AI SYNTHESIS Panel',
      v15: 'FLOATING SYNTHESIS Card',
      v16: 'CORRELATION MATRIX',
      v17: 'EMOTIONALE SPRACHE',
      v18: 'TL;DR CARD (prominent)',
      v19: 'TL;DR + AUDIO PLAYER',
      best: 'v19',
    },
    {
      aspect: 'Evidence Gallery',
      v1: '❌',
      v2: '❌',
      v3: 'Liste unten',
      v4: 'Nodes im Netzwerk',
      v5: 'Horizontaler Scroll',
      v6: 'FRAGMENT MATRIX',
      v7: 'PATTERN NETWORK',
      v8: '5-CARD SPREAD (Tarot)',
      v9: 'EVIDENCE BOARD (Pins)',
      v10: 'OBSERVATION LOG',
      v11: 'THOUGHT FRAGMENTS',
      v12: 'EXPANDABLE MODULES',
      v13: 'TAB: Media',
      v14: 'MEDIA GALLERY Grid',
      v15: 'TAB: Echoes (Fragments)',
      v16: 'TAB: Evidence (Classified)',
      v17: 'INLINE + TAB: Medien',
      v18: 'MEDIA-PILLS + TABS',
      v19: 'CLICKABLE MEDIA-PILLS',
      best: 'v19',
    },
    {
      aspect: 'Story Framing',
      v1: 'Meine Geschichte',
      v2: 'Meine Geschichte',
      v3: 'Meine Geschichte',
      v4: 'Eine von 248',
      v5: '"Fall #127" (Evidence)',
      v6: '"FRAGMENT #127"',
      v7: '4-ACT STORYTELLING',
      v8: 'ARKANA XIII (Mystisch)',
      v9: 'CASE #XP-2024-1847',
      v10: 'OBS-2024-1847 (Astro)',
      v11: 'THOUGHT-2024-X847',
      v12: 'THOUGHT:// X847 (System)',
      v13: 'Clean Typography',
      v14: 'THE STORY Block',
      v15: 'GLASS CARD Story',
      v16: 'INCIDENT LOG (Terminal)',
      v17: 'EMOTIONAL HIGHLIGHTS',
      v18: 'AI-SUMMARY + PULL-QUOTES',
      v19: 'AI-SUMMARY + TIMELINE',
      best: 'v19',
    },
    {
      aspect: 'Research Corner',
      v1: '❌',
      v2: '❌',
      v3: '❌',
      v4: '❌',
      v5: 'Theorien, Literatur',
      v6: 'INVESTIGATION PROTOCOLS',
      v7: 'REVELATION Section',
      v8: 'RUNEN + ORACLE',
      v9: 'PATTERN QUERY BUILDER',
      v10: 'TELESCOPE MODE',
      v11: 'SYNAPTIC NETWORK',
      v12: 'SYNAPTIC 3D + CLUSTERS',
      v13: 'TAB: Patterns',
      v14: 'PATTERN ANALYSIS Grid',
      v15: 'TAB: Constellation',
      v16: 'RIGHT PANEL: Analysis',
      v17: 'PATTERN DRAWER (Expandable)',
      v18: 'INLINE INSIGHT-CARDS',
      v19: 'DIFF-CARDS (GLEICH/ANDERS)',
      best: 'v19',
    },
    {
      aspect: 'User-Rolle',
      v1: 'Story-Teller',
      v2: 'Story-Teller',
      v3: 'Community-Member',
      v4: 'Teil des Clusters',
      v5: 'Citizen Scientist',
      v6: 'ARCHIVE CONTRIBUTOR',
      v7: 'XP TWIN (Protagonist)',
      v8: 'SEHER (Constellation)',
      v9: 'DETECTIVE (Ermittler)',
      v10: 'OBSERVER (Astronom)',
      v11: 'NEURAL WITNESS',
      v12: 'SYSTEM OPERATOR',
      v13: 'READER (fokussiert)',
      v14: 'COMMANDER (Überblick)',
      v15: 'DREAMER (Premium)',
      v16: 'ANALYST (Investigator)',
      v17: 'RESONATOR (Verbinder)',
      v18: 'BROWSER (Schnell-Info)',
      v19: 'NAVIGATOR (Geführt)',
      best: 'v19',
    },
    {
      aspect: 'CTA Messaging',
      v1: '❌',
      v2: '❌',
      v3: '"Teile deine Story"',
      v4: '"Werde Teil des Clusters"',
      v5: '"Zu Phänomen beitragen"',
      v6: '"SUBMIT FRAGMENT"',
      v7: '"ENTDECKE NETZWERK"',
      v8: '"FRAGMENT HINZUFÜGEN"',
      v9: '"INVESTIGATE" Mode',
      v10: '"EXPLORE CONSTELLATION"',
      v11: '"CONNECT SYNAPSE"',
      v12: '"ACTIVATE MODULE"',
      v13: '"Explore"',
      v14: '"ADD TO CLUSTER"',
      v15: '"Find Resonance"',
      v16: '"INVESTIGATE"',
      v17: '"Hast du Ähnliches erlebt?"',
      v18: '"Das hatte ich auch!" (Prominent)',
      v19: 'NEXT STEPS GUIDANCE',
      best: 'v19',
    },
    {
      aspect: 'Emotionale Wirkung',
      v1: '⭐⭐⭐ (Immersion)',
      v2: '⭐⭐',
      v3: '⭐⭐',
      v4: '⭐⭐⭐⭐ (Validation)',
      v5: '⭐⭐⭐⭐ (Purpose)',
      v6: '⭐⭐⭐⭐⭐ (MYSTERY)',
      v7: '⭐⭐⭐⭐⭐⭐ (CINEMATIC)',
      v8: '⭐⭐⭐⭐⭐⭐⭐ (MYSTISCH)',
      v9: '⭐⭐⭐⭐⭐⭐⭐⭐ (AGENCY)',
      v10: '⭐⭐⭐⭐⭐⭐⭐⭐⭐ (WONDER)',
      v11: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (AWARENESS)',
      v12: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (FULL POWER)',
      v13: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (CLARITY)',
      v14: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (CONTROL)',
      v15: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (ETHEREAL)',
      v16: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (MYSTERY+INTRIGUE)',
      v17: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (RESONANZ+WÄRME)',
      v18: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (INSTANT+CLARITY)',
      v19: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (TRUST+GUIDANCE)',
      best: 'v19',
    },
    {
      aspect: 'Data Visualization',
      v1: '❌',
      v2: '❌',
      v3: 'Minimal',
      v4: 'Timeline, Hotspots',
      v5: 'Word Cloud, Charts',
      v6: 'Correlation Matrix',
      v7: 'NETWORK GRAPH',
      v8: 'CONSTELLATION MAP',
      v9: 'SPATIAL-TEMPORAL MAP',
      v10: 'STAR FIELD CANVAS',
      v11: 'SYNAPTIC NETWORK SVG',
      v12: 'NEURAL GRID + 3D NETWORK',
      v13: 'Minimal Charts',
      v14: 'Timeline + Map Grid',
      v15: 'TAB Pattern Stats',
      v16: 'GLITCH CHARTS',
      v17: 'PROGRESSIVE DRAWER',
      v18: 'INLINE PROGRESS BARS',
      v19: 'READING PROGRESS + TIMELINE',
      best: 'v19',
    },
    {
      aspect: 'Visual Language',
      v1: 'Warm, immersiv',
      v2: 'Neutral, clean',
      v3: 'Strukturiert',
      v4: 'Network-centric',
      v5: 'Scientific, amber',
      v6: 'LIMINAL, Glitch, Violet',
      v7: 'CINEMATIC, Cyan/Gold',
      v8: 'MYSTISCH, Gold/Purple',
      v9: 'FBI CASE FILE, Gold/Navy',
      v10: 'COSMIC, Gold/Purple/Cyan',
      v11: 'NEURAL-BRUTALIST, Pink/Cyan',
      v12: 'FULL NEURAL, Pink/Cyan/Purple',
      v13: 'MINIMAL, Muted Lavender',
      v14: 'ULTRATHINK Green/Cyan',
      v15: 'GLASSMORPHISM Rose/Lavender',
      v16: 'CLASSIFIED / X-FILES',
      v17: 'INDIGO-PURPLE, Warm/Teal',
      v18: 'GRADIENT Purple/Cyan/Emerald',
      v19: 'GRADIENT Pink/Amber/Purple',
      best: 'v19',
    },
    {
      aspect: 'Metapher',
      v1: 'Lagerfeuer',
      v2: 'Blog Post',
      v3: 'Feature-rich Page',
      v4: 'Social Network',
      v5: 'Research Lab',
      v6: 'FORBIDDEN ARCHIVE',
      v7: 'NETFLIX für XP',
      v8: 'TAROT READING',
      v9: 'FBI CASE FILE',
      v10: 'STERNWARTE (Observatory)',
      v11: 'COGNITIVE INTERFACE',
      v12: 'NEURAL OPERATING SYSTEM',
      v13: 'Apple Product Page',
      v14: 'MISSION CONTROL',
      v15: 'PREMIUM MAGAZINE',
      v16: 'SECRET ARCHIVE',
      v17: 'TWINS COMMUNITY',
      v18: 'TWITTER/REDDIT für XP',
      v19: 'TRUSTED GUIDE für XP',
      best: 'v19',
    },
  ]

  const getVersionColor = (v: 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8' | 'v9' | 'v10' | 'v11' | 'v12' | 'v13' | 'v14' | 'v15' | 'v16' | 'v17' | 'v18' | 'v19') => {
    if (v === 'v1') return 'text-purple-400'
    if (v === 'v2') return 'text-emerald-400'
    if (v === 'v3') return 'text-cyan-400'
    if (v === 'v4') return 'text-rose-400'
    if (v === 'v5') return 'text-amber-400'
    if (v === 'v6') return 'text-violet-400'
    if (v === 'v7') return 'text-cyan-400'
    if (v === 'v8') return 'text-amber-400'
    if (v === 'v9') return 'text-[#d4a574]'
    if (v === 'v10') return 'text-[#ffd700]'
    if (v === 'v11') return 'text-[#ff2d6a]'
    if (v === 'v12') return 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d6a] via-[#9d4edd] to-[#00d4ff]'
    if (v === 'v13') return 'text-[#C8B6FF]'
    if (v === 'v14') return 'text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff]'
    if (v === 'v15') return 'text-transparent bg-clip-text bg-gradient-to-r from-[#e8c4b8] via-[#f5f0eb] to-[#b8c4e8]'
    if (v === 'v16') return 'text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#8B5CF6]'
    if (v === 'v17') return 'text-transparent bg-clip-text bg-gradient-to-r from-[#E8A87C] via-[#9B6DFF] to-[#4ECDC4]'
    if (v === 'v18') return 'text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#10B981]'
    return 'text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F59E0B]'
  }

  const getVersionName = (v: 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8' | 'v9' | 'v10' | 'v11' | 'v12' | 'v13' | 'v14' | 'v15' | 'v16' | 'v17' | 'v18' | 'v19') => {
    if (v === 'v1') return 'V1 - Lagerfeuer'
    if (v === 'v2') return 'V2 - Optimiert'
    if (v === 'v3') return 'V3 - Komplett'
    if (v === 'v4') return 'V4 - Connection-First'
    if (v === 'v5') return 'V5 - Phenomenon Hub'
    if (v === 'v6') return 'V6 - Liminal Archive'
    if (v === 'v7') return 'V7 - NEXUS Cinematic'
    if (v === 'v8') return 'V8 - ARCANA Oracle'
    if (v === 'v9') return 'V9 - CASE FILE'
    if (v === 'v10') return 'V10 - OBSERVATORY'
    if (v === 'v11') return 'V11 - ULTRATHINK'
    if (v === 'v12') return 'V12 - ULTRATHINK COMPLETE'
    if (v === 'v13') return 'V13 - ESSENCE'
    if (v === 'v14') return 'V14 - COMMAND CENTER'
    if (v === 'v15') return 'V15 - ETHEREAL GLASS'
    if (v === 'v16') return 'V16 - LIMINAL ARCHIVE'
    if (v === 'v17') return 'V17 - RESONANZ'
    if (v === 'v18') return 'V18 - CLARITY'
    return 'V19 - CLARITY+'
  }

  return (
    <section className="py-20 px-8 bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">Feature-Vergleich</h2>
        <p className="text-gray-500 text-center mb-8">
          Aktuell ausgewählt: <span className={getVersionColor(currentVersion)}>
            {getVersionName(currentVersion)}
          </span>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-2 text-gray-400 font-medium">Aspekt</th>
                <th className="text-left py-3 px-2 text-purple-400 font-medium">V1</th>
                <th className="text-left py-3 px-2 text-emerald-400 font-medium">V2</th>
                <th className="text-left py-3 px-2 text-cyan-400 font-medium">V3</th>
                <th className="text-left py-3 px-2 text-rose-400 font-medium">V4</th>
                <th className="text-left py-3 px-2 text-amber-400 font-medium">V5</th>
                <th className="text-left py-3 px-2 text-violet-400 font-medium">V6</th>
                <th className="text-left py-3 px-2 text-cyan-400 font-medium">V7</th>
                <th className="text-left py-3 px-2 text-amber-400 font-medium">V8 ✧</th>
                <th className="text-left py-3 px-2 text-[#d4a574] font-medium">V9 📁</th>
                <th className="text-left py-3 px-2 text-[#ffd700] font-medium">V10 🔭</th>
                <th className="text-left py-3 px-2 text-[#ff2d6a] font-medium">V11 🧠</th>
                <th className="text-left py-3 px-2 font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#ff2d6a] via-[#9d4edd] to-[#00d4ff]">V12 🧠⚡</th>
                <th className="text-left py-3 px-2 text-[#C8B6FF] font-medium">V13 ✧</th>
                <th className="text-left py-3 px-2 font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff]">V14 ⬢</th>
                <th className="text-left py-3 px-2 font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#e8c4b8] via-[#f5f0eb] to-[#b8c4e8]">V15 ✧</th>
                <th className="text-left py-3 px-2 font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#8B5CF6]">V16 ◈</th>
                <th className="text-left py-3 px-2 font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#E8A87C] via-[#9B6DFF] to-[#4ECDC4]">V17 ✧</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-2 px-2 text-white font-medium">{row.aspect}</td>
                  <td className={`py-2 px-2 ${currentVersion === 'v1' ? 'bg-purple-500/10' : ''}`}>
                    {row.v1}
                    {row.best === 'v1' && <span className="ml-1 text-purple-400">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v2' ? 'bg-emerald-500/10' : ''}`}>
                    {row.v2}
                    {row.best === 'v2' && <span className="ml-1 text-emerald-400">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v3' ? 'bg-cyan-500/10' : ''}`}>
                    {row.v3}
                    {row.best === 'v3' && <span className="ml-1 text-cyan-400">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v4' ? 'bg-rose-500/10' : ''}`}>
                    {row.v4}
                    {row.best === 'v4' && <span className="ml-1 text-rose-400">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v5' ? 'bg-amber-500/10' : ''}`}>
                    {row.v5}
                    {row.best === 'v5' && <span className="ml-1 text-amber-400">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v6' ? 'bg-violet-500/10' : ''}`}>
                    {row.v6}
                    {row.best === 'v6' && <span className="ml-1 text-violet-400">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v7' ? 'bg-cyan-500/10' : ''}`}>
                    {row.v7}
                    {row.best === 'v7' && <span className="ml-1 text-cyan-400">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v8' ? 'bg-amber-500/10' : ''}`}>
                    {row.v8}
                    {row.best === 'v8' && <span className="ml-1 text-amber-400">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v9' ? 'bg-[#d4a574]/10' : ''}`}>
                    {row.v9}
                    {row.best === 'v9' && <span className="ml-1 text-[#d4a574]">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v10' ? 'bg-[#ffd700]/10' : ''}`}>
                    {row.v10}
                    {row.best === 'v10' && <span className="ml-1 text-[#ffd700]">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v11' ? 'bg-[#ff2d6a]/10' : ''}`}>
                    {row.v11}
                    {row.best === 'v11' && <span className="ml-1 text-[#ff2d6a]">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v12' ? 'bg-gradient-to-r from-[#ff2d6a]/10 via-[#9d4edd]/10 to-[#00d4ff]/10' : ''}`}>
                    {row.v12}
                    {row.best === 'v12' && <span className="ml-1 text-[#9d4edd]">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v13' ? 'bg-[#C8B6FF]/10' : ''}`}>
                    {row.v13}
                    {row.best === 'v13' && <span className="ml-1 text-[#C8B6FF]">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v14' ? 'bg-gradient-to-r from-[#00ff88]/10 via-[#00d4ff]/10 to-[#ff00ff]/10' : ''}`}>
                    {row.v14}
                    {row.best === 'v14' && <span className="ml-1 text-[#00ff88]">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v15' ? 'bg-gradient-to-r from-[#e8c4b8]/10 via-[#f5f0eb]/10 to-[#b8c4e8]/10' : ''}`}>
                    {row.v15}
                    {row.best === 'v15' && <span className="ml-1 text-[#e8c4b8]">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v16' ? 'bg-gradient-to-r from-[#8B5CF6]/10 via-[#06B6D4]/10 to-[#8B5CF6]/10' : ''}`}>
                    {row.v16}
                    {row.best === 'v16' && <span className="ml-1 text-[#8B5CF6]">✓</span>}
                  </td>
                  <td className={`py-2 px-2 ${currentVersion === 'v17' ? 'bg-gradient-to-r from-[#E8A87C]/10 via-[#9B6DFF]/10 to-[#4ECDC4]/10' : ''}`}>
                    {row.v17}
                    {row.best === 'v17' && <span className="ml-1 text-[#9B6DFF]">✓</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-[#8B5CF6]/10 via-[#06B6D4]/10 to-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-2xl shadow-lg shadow-[#8B5CF6]/20 relative overflow-hidden">
          {/* Scanline overlay effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 92, 246, 0.1) 2px, rgba(139, 92, 246, 0.1) 4px)' }} />
          <p className="text-gray-300 text-center relative z-10">
            ◈ <strong className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#8B5CF6]">V16 Design-Philosophie:</strong> XP Share als <span className="text-white italic font-mono">SECRET ARCHIVE</span> -
            <span className="text-[#8B5CF6]"> Liminal Space Ästhetik</span> für <span className="text-white">Mystery + Intrigue</span>. Split-View: <span className="text-[#06B6D4]">Story links, Pattern rechts</span>.
            <span className="text-white font-mono"> JetBrains Mono</span> + IBM Plex Sans | <span className="text-[#8B5CF6]">Glitch Effects</span> + Classified Stamps.
            User sind <span className="text-[#06B6D4]">ANALYST</span> - X-Files vibes, investigating the unknown.
          </p>
        </div>

        {/* Design Philosophy Summary */}
        <div className="mt-6 grid grid-cols-4 gap-2" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
          <div className="bg-purple-500/10 rounded-xl p-2 text-center border border-purple-500/30">
            <p className="text-purple-400 font-bold text-xs">V1</p>
            <p className="text-[10px] text-gray-400">Story → Emotion</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-2 text-center border border-emerald-500/30">
            <p className="text-emerald-400 font-bold text-xs">V2</p>
            <p className="text-[10px] text-gray-400">Story → Funktion</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-2 text-center border border-cyan-500/30">
            <p className="text-cyan-400 font-bold text-xs">V3</p>
            <p className="text-[10px] text-gray-400">Story → Features</p>
          </div>
          <div className="bg-rose-500/10 rounded-xl p-2 text-center border border-rose-500/30">
            <p className="text-rose-400 font-bold text-xs">V4</p>
            <p className="text-[10px] text-gray-400">Connection → Story</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-2 text-center border border-amber-500/30">
            <p className="text-amber-400 font-bold text-xs">V5</p>
            <p className="text-[10px] text-gray-400">Phenomenon → Data</p>
          </div>
          <div className="bg-violet-500/10 rounded-xl p-2 text-center border border-violet-500/30">
            <p className="text-violet-400 font-bold text-xs">V6</p>
            <p className="text-[10px] text-gray-400">Reality → Fragment</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-2 text-center border border-cyan-500/30">
            <p className="text-cyan-400 font-bold text-xs">V7</p>
            <p className="text-[10px] text-gray-400">Experience → Film</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-2 text-center border border-amber-500/30">
            <p className="text-amber-400 font-bold text-xs">V8 ✧</p>
            <p className="text-[10px] text-amber-300 font-serif">Schicksal → Orakel</p>
          </div>
          <div className="bg-[#d4a574]/10 rounded-xl p-2 text-center border border-[#d4a574]/30">
            <p className="text-[#d4a574] font-bold text-xs">V9 📁</p>
            <p className="text-[10px] text-[#e6c9a8] font-mono">Case → Ermittler</p>
          </div>
          <div className="bg-[#ffd700]/10 rounded-xl p-2 text-center border border-[#ffd700]/30">
            <p className="text-[#ffd700] font-bold text-xs">V10 🔭</p>
            <p className="text-[10px] text-[#ffd700] font-mono">Kosmos → Beobachter</p>
          </div>
          <div className="bg-[#ff2d6a]/10 rounded-xl p-2 text-center border border-[#ff2d6a]/30">
            <p className="text-[#ff2d6a] font-bold text-xs">V11 🧠</p>
            <p className="text-[10px] text-[#ff2d6a] font-mono">Denken → Verstehen</p>
          </div>
          <div className="bg-gradient-to-br from-[#ff2d6a]/20 via-[#9d4edd]/20 to-[#00d4ff]/20 rounded-xl p-2 text-center border border-[#9d4edd]/60 shadow-lg shadow-[#9d4edd]/20">
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff2d6a] via-[#9d4edd] to-[#00d4ff] font-bold text-xs">V12 🧠⚡</p>
            <p className="text-[10px] text-[#9d4edd] font-mono">System → Komplett</p>
          </div>
          <div className="bg-[#C8B6FF]/10 rounded-xl p-2 text-center border border-[#C8B6FF]/50">
            <p className="text-[#C8B6FF] font-bold text-xs">V13 ✧</p>
            <p className="text-[10px] text-[#C8B6FF]">Less → Clarity</p>
          </div>
          <div className="bg-gradient-to-br from-[#00ff88]/20 via-[#00d4ff]/20 to-[#ff00ff]/20 rounded-xl p-2 text-center border border-[#00ff88]/60 shadow-lg shadow-[#00ff88]/20">
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff] font-bold text-xs">V14 ⬢</p>
            <p className="text-[10px] text-[#00ff88] font-mono">3-Col → Control</p>
          </div>
          <div className="bg-gradient-to-br from-[#e8c4b8]/20 via-[#f5f0eb]/20 to-[#b8c4e8]/20 rounded-xl p-2 text-center border border-[#e8c4b8]/60 shadow-lg shadow-[#e8c4b8]/20">
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#e8c4b8] via-[#f5f0eb] to-[#b8c4e8] font-bold text-xs font-serif italic">V15 ✧</p>
            <p className="text-[10px] text-[#e8c4b8] font-serif">Glass → Ethereal</p>
          </div>
          <div className="bg-gradient-to-br from-[#8B5CF6]/20 via-[#06B6D4]/20 to-[#8B5CF6]/20 rounded-xl p-2 text-center border border-[#8B5CF6]/60 shadow-lg shadow-[#8B5CF6]/30 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.2) 2px, rgba(6, 182, 212, 0.2) 4px)' }} />
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#06B6D4] to-[#8B5CF6] font-bold text-xs font-mono relative z-10">V16 ◈</p>
            <p className="text-[10px] text-[#06B6D4] font-mono relative z-10">Archive → Mystery</p>
          </div>
          <div className="bg-gradient-to-br from-[#E8A87C]/20 via-[#9B6DFF]/20 to-[#4ECDC4]/20 rounded-xl p-2 text-center border border-[#9B6DFF]/60 shadow-lg shadow-[#9B6DFF]/30 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(155, 109, 255, 0.3), transparent)' }} />
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#E8A87C] via-[#9B6DFF] to-[#4ECDC4] font-bold text-xs relative z-10">V17 ✧</p>
            <p className="text-[10px] text-[#9B6DFF] relative z-10">Resonanz → Wärme</p>
          </div>
        </div>
      </div>
    </section>
  )
}
