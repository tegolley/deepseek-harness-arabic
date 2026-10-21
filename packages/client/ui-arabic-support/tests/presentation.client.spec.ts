// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { apply as applyHost } from '../src/index.ts'
import { apply as applyBrowser } from '../src/client/index.ts'
import { applyArabicSupport, blockDirection, installArabicSupport } from '../src/client/presentation.ts'

afterEach(() => { document.body.replaceChildren(); document.head.querySelector('#dsh-arabic-support-style')?.remove() })

describe('Arabic presentation', () => {
  it('mounts the browser effect and keeps the host entry inert', () => {
    expect(applyHost()).toBeUndefined()
    let dispose: (() => void) | undefined
    applyBrowser({ effect: (mount: () => () => void) => { dispose = mount() } } as unknown as Parameters<typeof applyBrowser>[0])
    expect(document.getElementById('dsh-arabic-support-style')).not.toBeNull()
    dispose?.()
    expect(document.getElementById('dsh-arabic-support-style')).toBeNull()
  })

  it('keeps English blocks LTR and gives Arabic-leading and mixed blocks one RTL base', () => {
    expect(blockDirection('English text')).toBe('ltr')
    expect(blockDirection('مرحبا 123')).toBe('rtl')
    expect(blockDirection('1 مرحبا')).toBe('rtl')
    expect(blockDirection('DSH هو المشغّل العربي')).toBe('rtl')
    expect(blockDirection('English quotation مرحبا')).toBe('ltr')
  })

  it('sets direction on composer, user bubble, markdown, list, and code without changing English code', () => {
    document.body.innerHTML = `
      <div data-composer-input>مرحبا ABC</div>
      <div data-chat-flow-kind="user"><div class="hash_userRow"><div class="hash_bubble">مرحبا</div></div></div>
      <div data-chat-flow-kind="steering"><div class="hash_bubble" dir="ltr">Native direction</div></div>
      <div class="hash_markdown_1"><p>DSH هو المشغّل العربي</p><ul><li>نقطة 1</li></ul>
        <div class="md-code-block"><div class="banner"><p>Copy</p></div><pre>مرحبا 123</pre></div>
        <div class="md-code-block"><pre>const x = 1</pre></div>
        <div class="md-code-block">Loading</div>
      </div>`
    applyArabicSupport(document)
    applyArabicSupport(document)
    expect(document.querySelector('[data-composer-input]')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelector('[class*="bubble"]')?.getAttribute('dir')).toBe('auto')
    expect(document.querySelector('p')?.getAttribute('dir')).toBe('rtl')
    expect((document.querySelector('p') as HTMLElement).style.getPropertyPriority('unicode-bidi')).toBe('important')
    expect(document.querySelector('ul')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelector('.md-code-block')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelector('.md-code-block pre')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelectorAll('.md-code-block')[1]?.getAttribute('dir')).toBe('ltr')
    expect(document.querySelectorAll('[class*="bubble"]')[1]?.getAttribute('dir')).toBe('ltr')
    const editor = document.querySelector('[data-composer-input]') as HTMLElement
    editor.textContent = 'English draft'
    applyArabicSupport(document)
    expect(editor.getAttribute('dir')).toBe('ltr')
    expect(editor.style.getPropertyValue('text-align')).toBe('')
  })

  it('updates streamed text and honors a native direction supplied upstream', async () => {
    document.body.innerHTML = '<div class="hash_markdown_1"><p>D</p><p dir="ltr">مرحبا</p></div>'
    const dispose = installArabicSupport(document)
    const paragraph = document.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('dir')).toBe('ltr')
    paragraph.textContent = 'DSH هو المشغّل العربي'
    await new Promise(resolve => setTimeout(resolve, 290))
    expect(paragraph.getAttribute('dir')).toBe('rtl')
    expect(document.querySelectorAll('p')[1]?.getAttribute('dir')).toBe('ltr')
    paragraph.textContent = 'English again'
    await new Promise(resolve => setTimeout(resolve, 290))
    expect(paragraph.getAttribute('dir')).toBe('ltr')
    expect(paragraph.style.getPropertyValue('unicode-bidi')).toBe('')
    paragraph.setAttribute('dir', 'auto')
    applyArabicSupport(document)
    expect(paragraph.getAttribute('dir')).toBe('auto')
    expect(paragraph.hasAttribute('data-arabic-support')).toBe(false)
    paragraph.textContent = 'مرحبا'
    dispose()
    expect(paragraph.getAttribute('dir')).toBe('auto')
  })

  it('coalesces rapid mutations and cancels a pending pass on disposal', async () => {
    document.body.innerHTML = '<div data-composer-input>Draft</div>'
    const dispose = installArabicSupport(document)
    const editor = document.querySelector('[data-composer-input]') as HTMLElement
    editor.textContent = 'مرحبا'
    await Promise.resolve()
    editor.textContent = 'مرحبا مرة ثانية'
    await Promise.resolve()
    dispose()
    expect(document.head.querySelector('#dsh-arabic-support-style')).toBeNull()
    expect(editor.hasAttribute('dir')).toBe(false)
  })

  it('mirrors Arabic question and plan text while preserving English options', () => {
    document.body.innerHTML = `
      <div data-question-key="q"><section><h2>اختر الإجابة</h2><div class="x_optionLabel">خيار عربي</div><div class="x_optionLabel">English</div></section></div>
      <div data-question-key="q2"><section>سؤال بلا عنوان</section></div>
      <div data-plan-review-key="p"><section aria-label="هل توافق على الخطة؟"><h3>Plan 1</h3><p>خطة العمل</p></section></div>
      <div data-plan-review-key="p2"><section><h3>خطة ثانية</h3></section></div>
      <div data-plan-review-key="p3"><section>خطة ثالثة</section></div>`
    applyArabicSupport(document)
    expect(document.querySelector('[data-question-key] > section')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelectorAll('[class*="optionLabel"]')[0]?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelectorAll('[class*="optionLabel"]')[1]?.getAttribute('dir')).toBe('ltr')
    expect(document.querySelector('[data-plan-review-key] > section')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelector('[data-plan-review-key] p')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelector('[data-question-key="q2"] > section')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelector('[data-plan-review-key="p2"] > section')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelector('[data-plan-review-key="p3"] > section')?.getAttribute('dir')).toBe('rtl')
  })

  it('restores literal Arabic price prose only once and leaves real TeX intact', () => {
    document.body.innerHTML = `<div class="hash_markdown_1">
      <span class="katex"><annotation encoding="application/x-tex"> بالشهر، وDSH بحصة 60</annotation></span>
      <span class="katex"><annotation encoding="application/x-tex">\\text{سعر}=60</annotation></span>
      <span class="katex"></span>
      <span class="katex"><annotation encoding="application/x-tex">بالشهر</annotation></span>
      <span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">السعر 50</annotation></span></span>
    </div>`
    applyArabicSupport(document)
    applyArabicSupport(document)
    expect(document.querySelectorAll('[data-arabic-support-literal]')).toHaveLength(3)
    expect(document.querySelector('[data-arabic-support-literal]')?.textContent).toBe('$ بالشهر، وDSH بحصة 60$')
    expect(document.querySelectorAll('[data-arabic-support-hidden]')).toHaveLength(3)
    expect(document.querySelector('.katex-display [data-arabic-support-literal]')?.textContent).toBe('$$السعر 50$$')
    document.querySelector('.katex')?.remove()
    applyArabicSupport(document)
    expect(document.querySelectorAll('[data-arabic-support-literal]')).toHaveLength(2)
    const dispose = installArabicSupport(document)
    dispose()
    expect(document.querySelectorAll('[data-arabic-support-literal]')).toHaveLength(0)
    expect(document.querySelectorAll('[data-arabic-support-hidden]')).toHaveLength(0)
  })
})
