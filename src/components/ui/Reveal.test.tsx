import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from '@/components/ui/Reveal'

type ObserverCallback = (entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  static instances: MockIntersectionObserver[] = []

  constructor(private readonly callback: ObserverCallback) {
    MockIntersectionObserver.instances.push(this)
  }

  disconnect = vi.fn()
  observe = vi.fn()
  unobserve = vi.fn()
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting }])
  }
}

describe('Reveal', () => {
  afterEach(() => {
    MockIntersectionObserver.instances = []
    vi.unstubAllGlobals()
  })

  it('mostra o conteúdo mesmo sem IntersectionObserver (JS sem suporte, ou quebrado)', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    render(
      <Reveal>
        <p>Conteúdo sempre visível</p>
      </Reveal>,
    )

    expect(screen.getByText('Conteúdo sempre visível')).toBeInTheDocument()
    const wrapper = screen.getByText('Conteúdo sempre visível').parentElement
    expect(wrapper?.className).not.toContain('opacity-0')
    expect(wrapper?.className).toContain('opacity-100')
  })

  describe('com IntersectionObserver disponível', () => {
    beforeEach(() => {
      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    })

    it('só aplica o estilo escondido depois que o próprio JS confirma que vai poder revelar', () => {
      render(
        <Reveal>
          <p>Seção observada</p>
        </Reveal>,
      )

      const wrapper = screen.getByText('Seção observada').parentElement
      expect(wrapper?.className).toContain('opacity-0')
      expect(MockIntersectionObserver.instances).toHaveLength(1)
      expect(MockIntersectionObserver.instances[0]?.observe).toHaveBeenCalled()
    })

    it('revela e desconecta o observer quando o elemento entra na tela, uma única vez', () => {
      render(
        <Reveal>
          <p>Seção observada</p>
        </Reveal>,
      )

      const observer = MockIntersectionObserver.instances[0]
      act(() => observer?.trigger(true))

      const wrapper = screen.getByText('Seção observada').parentElement
      expect(wrapper?.className).toContain('opacity-100')
      expect(wrapper?.className).not.toContain('opacity-0')
      expect(observer?.disconnect).toHaveBeenCalledTimes(1)
    })

    it('desconecta o observer ao desmontar', () => {
      const { unmount } = render(
        <Reveal>
          <p>Seção observada</p>
        </Reveal>,
      )

      const observer = MockIntersectionObserver.instances[0]
      unmount()

      expect(observer?.disconnect).toHaveBeenCalledTimes(1)
    })
  })
})
