'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { ProgressBar } from '../shared/ProgressBar'
import { NavigationButtons } from '../shared/NavigationButtons'
import { Globe, UserCheck, Lock, Users, Mail, Link as LinkIcon, Send, X } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
}

export const PrivacyWitnesses = () => {
  const {
    privacyLevel,
    witnesses,
    inviteLinks,
    currentStep,
    setPrivacy,
    addWitness,
    removeWitness,
    generateInviteLink,
    submit,
    prevStep,
  } = useSubmitStore()

  const [witnessEmail, setWitnessEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const privacyOptions = [
    {
      value: 'public' as const,
      icon: <Globe className="w-6 h-6" />,
      title: 'Öffentlich',
      description: 'Alle können sehen wer du bist',
      color: 'blue',
    },
    {
      value: 'anonymous' as const,
      icon: <UserCheck className="w-6 h-6" />,
      title: 'Anonym',
      description: 'Verifiziert, aber ohne deinen Namen (Empfohlen)',
      color: 'purple',
    },
    {
      value: 'private' as const,
      icon: <Lock className="w-6 h-6" />,
      title: 'Privat',
      description: 'Nur du kannst es sehen',
      color: 'gray',
    },
  ]

  const handleSendEmailInvite = () => {
    if (witnessEmail) {
      // TODO: API call to send email invite
      console.log('Send email invite to:', witnessEmail)
      setWitnessEmail('')
    }
  }

  const handleGenerateLink = async () => {
    const link = await generateInviteLink()
    // Copy to clipboard
    navigator.clipboard.writeText(link)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await submit()
    setIsSubmitting(false)
  }

  const getPrivacyColor = (value: string) => {
    const option = privacyOptions.find((o) => o.value === value)
    return option?.color || 'gray'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} showCompletionMessage={true} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔒 Wer darf deine Erfahrung sehen?
          </h1>
          <p className="text-gray-600">Wähle deine Privatsphäre-Einstellung</p>
        </motion.div>

        {/* Privacy Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {privacyOptions.map((option, index) => {
              const isSelected = privacyLevel === option.value
              const colorClasses = {
                blue: 'border-blue-500 bg-blue-50 text-blue-700',
                purple: 'border-purple-500 bg-purple-50 text-purple-700',
                gray: 'border-gray-500 bg-gray-50 text-gray-700',
              }

              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPrivacy(option.value)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? colorClasses[option.color as keyof typeof colorClasses]
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`mb-3 ${isSelected ? '' : 'text-gray-400'}`}>{option.icon}</div>
                  <h3 className="text-lg font-semibold mb-1">{option.title}</h3>
                  <p className={`text-sm ${isSelected ? 'opacity-90' : 'text-gray-500'}`}>
                    {option.description}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Witnesses Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Gab es Zeugen?</h2>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>

          {/* Existing Witnesses */}
          {witnesses.length > 0 && (
            <div className="mb-4 space-y-2">
              {witnesses.map((witness) => (
                <div
                  key={witness.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {witness.avatar ? (
                      <img
                        src={witness.avatar}
                        alt={witness.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{witness.username}</p>
                      {witness.email && <p className="text-sm text-gray-500">{witness.email}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => removeWitness(witness.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Email Invite */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={witnessEmail}
                  onChange={(e) => setWitnessEmail(e.target.value)}
                  placeholder="Email-Adresse eines Zeugen..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleSendEmailInvite}
                disabled={!witnessEmail}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Einladen
              </button>
            </div>

            {/* Generate Link */}
            <button
              onClick={handleGenerateLink}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <LinkIcon className="w-5 h-5" />
              <span>Einladungslink generieren</span>
            </button>

            {/* Generated Links */}
            {inviteLinks.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Generierte Links:</p>
                {inviteLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <code className="flex-1 text-sm text-green-700 truncate">{link.url}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(link.url)}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Kopieren
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <NavigationButtons
          onBack={prevStep}
          onNext={handleSubmit}
          nextLabel="Veröffentlichen"
          nextIcon={<Send className="w-5 h-5" />}
          isNextLoading={isSubmitting}
          nextVariant="success"
        />
      </motion.div>
    </div>
  )
}
