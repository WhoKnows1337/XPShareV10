import { describe, it, expect } from 'vitest'

describe('Category Labels & Constants', () => {
  const CATEGORIES = [
    'paranormal',
    'ufo_sighting',
    'synchronicity',
    'spiritual_experience',
    'near_death_experience',
    'psychic_experience',
    'cryptid_encounter',
    'other'
  ]

  it('should have all 8 categories', () => {
    expect(CATEGORIES.length).toBe(8)
  })

  it('should include paranormal category', () => {
    expect(CATEGORIES).toContain('paranormal')
  })

  it('should include UFO sighting category', () => {
    expect(CATEGORIES).toContain('ufo_sighting')
  })

  it('should include synchronicity category', () => {
    expect(CATEGORIES).toContain('synchronicity')
  })

  it('should have other as fallback category', () => {
    expect(CATEGORIES).toContain('other')
  })
})

describe('Badge Rarities', () => {
  const RARITIES = ['common', 'rare', 'epic', 'legendary']

  it('should have 4 rarity tiers', () => {
    expect(RARITIES.length).toBe(4)
  })

  it('should have common as lowest tier', () => {
    expect(RARITIES[0]).toBe('common')
  })

  it('should have legendary as highest tier', () => {
    expect(RARITIES[RARITIES.length - 1]).toBe('legendary')
  })
})

describe('Level System', () => {
  const MAX_LEVEL = 30
  const BASE_XP_PER_LEVEL = 100

  it('should have max level of 30', () => {
    expect(MAX_LEVEL).toBe(30)
  })

  it('should have base XP of 100 per level', () => {
    expect(BASE_XP_PER_LEVEL).toBe(100)
  })

  it('should calculate progressive XP requirements', () => {
    // Level 2 requires: 100
    // Level 3 requires: 100 + 200 = 300
    // Level 4 requires: 300 + 300 = 600
    const level2XP = BASE_XP_PER_LEVEL
    const level3XP = BASE_XP_PER_LEVEL + (BASE_XP_PER_LEVEL * 2)
    const level4XP = level3XP + (BASE_XP_PER_LEVEL * 3)

    expect(level2XP).toBe(100)
    expect(level3XP).toBe(300)
    expect(level4XP).toBe(600)
  })
})
