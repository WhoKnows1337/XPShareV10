'use client'

import { useState } from 'react'
import { DynamicQuestion } from '@/lib/types/admin-questions'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QuestionPreview } from './question-preview'
import { X, Monitor, Smartphone, ChevronLeft, ChevronRight, RotateCcw, Timer, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FullscreenPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: DynamicQuestion[]
  categoryName: string
}

export function FullscreenPreviewDialog({
  open,
  onOpenChange,
  questions,
  categoryName,
}: FullscreenPreviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop')
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({})
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [testUser, setTestUser] = useState<string>('default')

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Record time for current question
      const now = Date.now()
      const timeSpent = Math.round((now - startTime) / 1000)
      setQuestionTimes({ ...questionTimes, [currentIndex]: timeSpent })
      setStartTime(now)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setStartTime(Date.now())
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setStartTime(Date.now())
    setQuestionTimes({})
    setAnswers({})
  }

  const handleTestUserChange = (userType: string) => {
    setTestUser(userType)
    handleReset()
  }

  const testUserProfiles = {
    default: { name: 'Default User', desc: 'Standard test' },
    new: { name: 'New User', desc: 'First-time visitor, might skip more' },
    returning: { name: 'Returning User', desc: 'Familiar with flow, answers faster' },
    detailed: { name: 'Detailed User', desc: 'Takes time, answers everything' },
    quick: { name: 'Quick User', desc: 'Skips frequently, fast navigation' },
  }

  const totalTime = Object.values(questionTimes).reduce((sum, time) => sum + time, 0)
  const avgTime = totalTime / Math.max(Object.keys(questionTimes).length, 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              🔍 Preview: {categoryName}
            </h2>
            <Badge>{currentIndex + 1} / {questions.length}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Test-User: {testUserProfiles[testUser as keyof typeof testUserProfiles]?.name || 'Default'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Select Test User Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(testUserProfiles).map(([key, profile]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => handleTestUserChange(key)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{profile.name}</span>
                      <span className="text-xs text-muted-foreground">{profile.desc}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={deviceMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceMode('desktop')}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={deviceMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceMode('mobile')}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
          <div className="flex gap-8 h-full">
            {/* Preview Area */}
            <div className="flex-1 flex items-center justify-center">
              <div
                className={`bg-white rounded-lg shadow-xl p-8 transition-all ${
                  deviceMode === 'mobile' ? 'max-w-md w-full' : 'max-w-3xl w-full'
                }`}
              >
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Step {currentIndex + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Question Preview */}
                {currentQuestion && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {categoryName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        💡 All questions are optional - skip any you prefer not to answer
                      </p>
                    </div>

                    <QuestionPreview
                      question={currentQuestion}
                      value={answers[currentIndex]}
                      onChange={(value) =>
                        setAnswers({ ...answers, [currentIndex]: value })
                      }
                    />

                    {/* Navigation */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleNext}
                      >
                        Skip
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={currentIndex === questions.length - 1}
                        className="flex-1"
                      >
                        {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                        {currentIndex !== questions.length - 1 && (
                          <ChevronRight className="h-4 w-4 ml-2" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Testing Tools Sidebar */}
            <Card className="w-80 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Testing Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timer Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Time:</span>
                    <span className="font-semibold">{avgTime.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Time:</span>
                    <span className="font-semibold">{totalTime}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Questions Viewed:</span>
                    <span className="font-semibold">
                      {Object.keys(questionTimes).length} / {questions.length}
                    </span>
                  </div>
                </div>

                {/* Answer Stats */}
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm font-medium">Answer Status:</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Answered:</span>
                    <span className="font-semibold text-green-600">
                      {Object.keys(answers).filter(k => (answers as any)[k] != null).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Skipped:</span>
                    <span className="font-semibold text-orange-500">
                      {Object.keys(questionTimes).length - Object.keys(answers).filter(k => (answers as any)[k] != null).length}
                    </span>
                  </div>
                </div>

                {/* Question Details */}
                {Object.keys(questionTimes).length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-medium">Question Details:</p>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {Object.entries(questionTimes).map(([idx, time]) => {
                        const idxNum = parseInt(idx)
                        const hasAnswer = answers[idxNum] != null
                        return (
                          <div key={idx} className="flex items-center justify-between text-sm rounded-md bg-muted/50 px-2 py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Q{idxNum + 1}:</span>
                              {hasAnswer ? (
                                <span className="text-green-600 text-xs">✓ Answered</span>
                              ) : (
                                <span className="text-orange-500 text-xs">⚠️ Skipped</span>
                              )}
                            </div>
                            <span className={time > 10 ? 'text-orange-500 font-medium' : 'text-muted-foreground'}>
                              {time}s
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    💡 This is an interactive preview. Navigate through questions to test the flow and measure response times.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
