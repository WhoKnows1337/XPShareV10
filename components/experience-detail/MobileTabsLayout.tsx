'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FileText, Users, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileTabsLayoutProps {
  mainContent: React.ReactNode
  relatedSidebar: React.ReactNode
  patternSidebar: React.ReactNode
}

export function MobileTabsLayout({
  mainContent,
  relatedSidebar,
  patternSidebar,
}: MobileTabsLayoutProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'related' | 'patterns'>('content')
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleTabChange = (value: string) => {
    const tab = value as 'content' | 'related' | 'patterns'
    setActiveTab(tab)

    // Open sheet for sidebar tabs
    if (tab === 'related' || tab === 'patterns') {
      setSheetOpen(true)
    } else {
      setSheetOpen(false)
    }
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setActiveTab('content')
  }

  return (
    <div className="lg:hidden">
      {/* Main Content Area */}
      <div className="min-h-screen pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-6"
            >
              {mainContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Sheet for Sidebars */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-2xl"
          onInteractOutside={handleSheetClose}
        >
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                {activeTab === 'related' && (
                  <>
                    <Users className="w-5 h-5" />
                    Related & Author
                  </>
                )}
                {activeTab === 'patterns' && (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Patterns & Insights
                  </>
                )}
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSheetClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto h-[calc(100%-4rem)] pb-6">
            <AnimatePresence mode="wait">
              {activeTab === 'related' && (
                <motion.div
                  key="related"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {relatedSidebar}
                </motion.div>
              )}
              {activeTab === 'patterns' && (
                <motion.div
                  key="patterns"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {patternSidebar}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>

      {/* Fixed Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t shadow-lg">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full h-16 rounded-none bg-transparent grid grid-cols-3">
            <TabsTrigger
              value="content"
              className="flex-col gap-1 h-full data-[state=active]:bg-primary/10"
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Content</span>
            </TabsTrigger>
            <TabsTrigger
              value="related"
              className="flex-col gap-1 h-full data-[state=active]:bg-primary/10"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Related</span>
            </TabsTrigger>
            <TabsTrigger
              value="patterns"
              className="flex-col gap-1 h-full data-[state=active]:bg-primary/10"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs">Patterns</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
