import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Fundamentals from '../components/Fundamentals'
import React from 'react'

// Mocking fetch
global.fetch = vi.fn()

describe('Fundamentals Bileşeni', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Yükleme durumunu göstermelidir', () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    
    render(<Fundamentals ticker="THYAO" />)
    const loadingUI = document.querySelector('.animate-pulse')
    expect(loadingUI).not.toBeNull()
  })

  it('Verileri başarıyla render etmelidir', async () => {
    const mockData = {
      trailingPE: 5.5,
      marketCap: 1000000000,
      priceToBook: 1.2,
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    render(<Fundamentals ticker="THYAO" />)

    await waitFor(() => {
      expect(screen.getByText('F/K Oranı')).toBeDefined()
      expect(screen.getByText('5,5')).toBeDefined()
    })
  })

  it('Hata durumunu yönetmelidir', async () => {
    (global.fetch as any).mockRejectedValue(new Error('API Hatası'))

    render(<Fundamentals ticker="THYAO" />)

    await waitFor(() => {
      expect(screen.getByText(/Temel veriler yüklenemedi/)).toBeDefined()
    })
  })
})
