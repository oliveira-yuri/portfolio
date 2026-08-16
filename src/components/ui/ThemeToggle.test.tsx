import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('tem rótulo acessível traduzido', () => {
    render(<ThemeToggle locale="pt" />)
    expect(screen.getByRole('button', { name: 'Alternar tema' })).toBeInTheDocument()
  })

  it('liga o tema escuro e registra a escolha', async () => {
    render(<ThemeToggle locale="pt" />)
    await userEvent.click(screen.getByRole('button', { name: 'Alternar tema' }))

    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('volta para o tema claro no segundo clique', async () => {
    render(<ThemeToggle locale="pt" />)
    const botao = screen.getByRole('button', { name: 'Alternar tema' })

    await userEvent.click(botao)
    await userEvent.click(botao)

    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('comunica o estado por aria-pressed', async () => {
    render(<ThemeToggle locale="pt" />)
    const botao = screen.getByRole('button', { name: 'Alternar tema' })

    expect(botao).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(botao)
    expect(botao).toHaveAttribute('aria-pressed', 'true')
  })

  it('mantém aria-pressed e a classe em <html> sincronizados mesmo se localStorage falhar', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('armazenamento indisponível')
    })

    try {
      render(<ThemeToggle locale="pt" />)
      const botao = screen.getByRole('button', { name: 'Alternar tema' })

      await userEvent.click(botao)

      expect(document.documentElement).toHaveClass('dark')
      expect(botao).toHaveAttribute('aria-pressed', 'true')
    } finally {
      setItemSpy.mockRestore()
    }
  })
})
