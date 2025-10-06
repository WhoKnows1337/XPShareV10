import { describe, it, expect } from 'vitest'

describe('XP-Share Testing Suite', () => {
  describe('Basic Math', () => {
    it('should perform basic addition', () => {
      expect(1 + 1).toBe(2)
    })

    it('should perform basic multiplication', () => {
      expect(2 * 3).toBe(6)
    })
  })

  describe('String Operations', () => {
    it('should concatenate strings', () => {
      expect('XP' + '-Share').toBe('XP-Share')
    })

    it('should check string length', () => {
      expect('XP-Share'.length).toBe(8)
    })
  })

  describe('Array Operations', () => {
    it('should create arrays', () => {
      const badges = ['First Post', 'Explorer', 'Seeker']
      expect(badges.length).toBe(3)
    })

    it('should filter arrays', () => {
      const numbers = [1, 2, 3, 4, 5]
      const evenNumbers = numbers.filter(n => n % 2 === 0)
      expect(evenNumbers).toEqual([2, 4])
    })
  })

  describe('Object Operations', () => {
    it('should create objects', () => {
      const user = { name: 'Test User', level: 1, xp: 0 }
      expect(user.level).toBe(1)
    })

    it('should access nested properties', () => {
      const profile = {
        user: { username: 'tester' },
        stats: { xp: 100 }
      }
      expect(profile.stats.xp).toBe(100)
    })
  })
})
