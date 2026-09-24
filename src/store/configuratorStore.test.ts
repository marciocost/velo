import { describe, it, expect } from 'vitest'
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  CarConfiguration
} from './configuratorStore'

describe('configuratorStore', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate base price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: []
      }
      expect(calculateTotalPrice(config)).toBe(40000)
    })

    it('should calculate price with sport wheels', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: []
      }
      expect(calculateTotalPrice(config)).toBe(42000)
    })

    it('should calculate price with optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park']
      }
      expect(calculateTotalPrice(config)).toBe(45500)
    })

    it('should calculate price with all optionals and sport wheels', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor']
      }
      expect(calculateTotalPrice(config)).toBe(52500)
    })
  })

  describe('calculateInstallment', () => {
    it('should calculate installment correctly (12x with 2% monthly compound interest)', () => {
      expect(calculateInstallment(40000)).toBe(3782.38)
    })
  })

  describe('formatPrice', () => {
    it('should format price to BRL currency correctly', () => {
      const formatted = formatPrice(40000)
      expect(formatted).toMatch(/R\$\s*40\.000,00/)
    })
  })
})
