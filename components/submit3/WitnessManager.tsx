'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Users, Mail, X, UserPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Witness {
  name: string
  email?: string
  invite: boolean
  detectedFromText: boolean
}

interface WitnessManagerProps {
  witnesses: Witness[]
  onAdd: (witness: Witness) => void
  onRemove: (index: number) => void
}

export function WitnessManager({ witnesses, onAdd, onRemove }: WitnessManagerProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sendInvite, setSendInvite] = useState(true)

  const handleAdd = () => {
    if (name.trim()) {
      onAdd({
        name: name.trim(),
        email: email.trim() || undefined,
        invite: sendInvite && !!email.trim(),
        detectedFromText: false,
      })
      setName('')
      setEmail('')
      setSendInvite(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Witness Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-500" />
            Add Witness
          </CardTitle>
          <CardDescription>
            Add people who were present during your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="witness-name">Name *</Label>
            <Input
              id="witness-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Witness name"
            />
          </div>

          <div>
            <Label htmlFor="witness-email">Email (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="witness-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="email@example.com"
              />
            </div>
            {email && (
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="send-invite"
                  checked={sendInvite}
                  onCheckedChange={setSendInvite}
                />
                <Label htmlFor="send-invite" className="text-sm cursor-pointer">
                  Send invitation to verify
                </Label>
              </div>
            )}
          </div>

          <Button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="w-full"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Witness
          </Button>
        </CardContent>
      </Card>

      {/* Witness List */}
      {witnesses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Witnesses ({witnesses.length})
          </h3>

          <AnimatePresence mode="popLayout">
            {witnesses.map((witness, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                layout
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold truncate">{witness.name}</p>
                            {witness.detectedFromText && (
                              <Badge variant="secondary" className="text-xs">
                                AI Detected
                              </Badge>
                            )}
                          </div>

                          {witness.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{witness.email}</span>
                            </div>
                          )}

                          {witness.invite && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Invitation will be sent
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {witnesses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No witnesses added yet
        </div>
      )}
    </div>
  )
}
