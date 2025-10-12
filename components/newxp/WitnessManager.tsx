'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { Users, X, Mail, Link as LinkIcon, Search, Loader2 } from 'lucide-react'

export const WitnessManager = () => {
  const { detectedWitnesses, confirmedWitnesses, confirmWitness } = useNewXPStore()
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Zeugen
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          + Hinzufügen
        </button>
      </div>

      {/* Detected Witnesses */}
      <AnimatePresence>
        {detectedWitnesses.filter(w => !w.confirmed).map((witness) => (
          <motion.div
            key={witness.name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-xs text-blue-900 mb-2">
              💬 "{witness.name}" im Text erkannt
            </p>
            <button
              onClick={() => {
                confirmWitness(witness.name)
                setShowModal(true)
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Als Zeuge hinzufügen →
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Confirmed Witnesses */}
      {confirmedWitnesses.length === 0 ? (
        <p className="text-xs text-gray-500">Noch keine Zeugen hinzugefügt</p>
      ) : (
        <div className="space-y-2">
          {confirmedWitnesses.map((witness) => (
            <WitnessChip key={witness.id} witness={witness} />
          ))}
        </div>
      )}

      {/* Add Witness Modal */}
      <AnimatePresence>
        {showModal && <AddWitnessModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}

// ========================================
// WITNESS CHIP
// ========================================

const WitnessChip = ({ witness }: { witness: any }) => {
  const { removeWitness } = useNewXPStore()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-between p-2 bg-gray-100 rounded-lg group"
    >
      <div className="flex items-center gap-2">
        {witness.avatar ? (
          <img
            src={witness.avatar}
            alt={witness.name}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="w-3 h-3 text-gray-600" />
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-gray-900">
            {witness.name || witness.username}
          </p>
          {witness.email && (
            <p className="text-xs text-gray-500">{witness.email}</p>
          )}
          {witness.status === 'pending' && (
            <p className="text-xs text-orange-600">Einladung gesendet</p>
          )}
        </div>
      </div>
      <button
        onClick={() => removeWitness(witness.id)}
        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
      >
        <X className="w-3 h-3 text-red-600" />
      </button>
    </motion.div>
  )
}

// ========================================
// ADD WITNESS MODAL
// ========================================

const AddWitnessModal = ({ onClose }: { onClose: () => void }) => {
  const [tab, setTab] = useState<'search' | 'email' | 'link'>('search')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Zeuge hinzufügen</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              tab === 'search'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="w-4 h-4" />
            Suchen
            {tab === 'search' && (
              <motion.div
                layoutId="modalTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setTab('email')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              tab === 'email'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
            {tab === 'email' && (
              <motion.div
                layoutId="modalTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setTab('link')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              tab === 'link'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Link
            {tab === 'link' && (
              <motion.div
                layoutId="modalTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tab === 'search' && <SearchTab onClose={onClose} />}
          {tab === 'email' && <EmailTab onClose={onClose} />}
          {tab === 'link' && <LinkTab onClose={onClose} />}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ========================================
// SEARCH TAB
// ========================================

const SearchTab = ({ onClose }: { onClose: () => void }) => {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { addWitness } = useNewXPStore()

  const handleSearch = async () => {
    if (!search.trim()) return

    setIsSearching(true)
    // TODO: Implement actual search
    setTimeout(() => {
      setResults([
        {
          id: '1',
          username: 'maria_schmidt',
          name: 'Maria Schmidt',
          avatar: null,
        },
      ])
      setIsSearching(false)
    }, 500)
  }

  const handleAdd = (user: any) => {
    addWitness({
      id: Math.random().toString(36).substring(7),
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      inviteType: 'platform',
      status: 'confirmed',
    })
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Username suchen..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleAdd(user)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
              <span className="text-sm text-blue-600 font-medium">+ Add</span>
            </button>
          ))}
        </div>
      ) : search ? (
        <p className="text-center text-sm text-gray-500 py-8">
          Keine Ergebnisse gefunden
        </p>
      ) : null}
    </div>
  )
}

// ========================================
// EMAIL TAB
// ========================================

const EmailTab = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const { addWitness } = useNewXPStore()

  const handleSend = () => {
    if (!email.trim()) return

    addWitness({
      id: Math.random().toString(36).substring(7),
      name: name || email,
      email,
      inviteType: 'email',
      status: 'pending',
    })

    // TODO: Send actual email invite
    alert(`Einladung gesendet an ${email}`)
    onClose()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email-Adresse *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="maria@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Maria Schmidt"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          💡 Diese Person erhält eine Einladung zur Plattform und kann deine
          Experience bestätigen.
        </p>
      </div>

      <button
        onClick={handleSend}
        disabled={!email.trim()}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Einladung senden
      </button>
    </div>
  )
}

// ========================================
// LINK TAB
// ========================================

const LinkTab = ({ onClose }: { onClose: () => void }) => {
  const [generatedLink, setGeneratedLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { generateInviteLink } = useNewXPStore()

  const handleGenerate = async () => {
    setIsGenerating(true)
    const link = await generateInviteLink()
    setGeneratedLink(link)
    setIsGenerating(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink)
    alert('Link kopiert!')
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Erstelle einen Link, den du per WhatsApp, Telegram, etc. teilen kannst.
      </p>

      {!generatedLink ? (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generiere...
            </>
          ) : (
            <>
              <LinkIcon className="w-5 h-5" />
              Link generieren
            </>
          )}
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              📋
            </button>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
              WhatsApp
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-400 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
              Telegram
            </button>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              💡 Jeder mit diesem Link kann sich als Zeuge registrieren (7 Tage gültig)
            </p>
          </div>
        </>
      )}
    </div>
  )
}
