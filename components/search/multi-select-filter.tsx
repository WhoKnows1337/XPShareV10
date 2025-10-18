'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface MultiSelectOption {
  value: string
  label: string
  icon?: string
  count?: number
}

interface MultiSelectFilterProps {
  options: MultiSelectOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  emptyText?: string
  maxDisplay?: number
  allowCustom?: boolean // For tags - allow adding custom values
}

export function MultiSelectFilter({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
  emptyText = 'No options found.',
  maxDisplay = 3,
  allowCustom = false,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const handleSelect = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]
    onChange(newValues)
  }

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value))
  }

  const handleAddCustom = () => {
    if (customInput.trim() && !selectedValues.includes(customInput.trim())) {
      onChange([...selectedValues, customInput.trim()])
      setCustomInput('')
    }
  }

  const displayedValues = selectedValues.slice(0, maxDisplay)
  const remainingCount = selectedValues.length - maxDisplay

  return (
    <div className="w-full space-y-2">
      {/* Selected Chips */}
      <AnimatePresence mode="popLayout">
        {selectedValues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {displayedValues.map((value) => {
              const option = options.find((o) => o.value === value)
              return (
                <motion.div
                  key={value}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                    {option?.icon && <span>{option.icon}</span>}
                    <span className="text-xs">
                      {option?.label || value}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemove(value)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </motion.div>
              )
            })}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingCount} more
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="text-sm text-muted-foreground truncate">
              {selectedValues.length === 0
                ? placeholder
                : `${selectedValues.length} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  <span className="flex-1">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({option.count})
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Custom Input for Tags */}
            {allowCustom && (
              <div className="border-t p-2 flex gap-2">
                <Input
                  placeholder="Add custom tag..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustom()
                    }
                  }}
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleAddCustom}
                  disabled={!customInput.trim()}
                  className="h-8"
                >
                  Add
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
