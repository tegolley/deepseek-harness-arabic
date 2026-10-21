/** DOM bridge for content-derived direction where the client has no RTL slot. */
const MARKDOWN = '[class*="_markdown_"]'
const PROSE = 'p,li,h1,h2,h3,h4,h5,h6,blockquote,td,th,dd'
const QUESTION_PROSE = 'h2,[class*="eyebrow"],[class*="optionCopy"],[class*="optionLabel"],[class*="description"],[class*="badge"],[class*="detail"]'
const TEX_ANNOTATION = 'annotation[encoding="application/x-tex"]'
const OWNED = 'data-arabic-support'
const LITERAL = 'data-arabic-support-literal'
const HIDDEN = 'data-arabic-support-hidden'
const STYLE_ID = 'dsh-arabic-support-style'
const ARABIC = /[\u0600-\u06ff]/g
const LATIN = /[A-Za-z]/g
const FIRST_STRONG = /[A-Za-z\u0600-\u06ff]/
const ARABIC_ONE = /[\u0600-\u06ff]/
const TEX_SYNTAX = /[\\^_={}]/

/** Choose one base direction for a mixed text block, even when a Latin label leads it. */
export function blockDirection(text: string): 'rtl' | 'ltr' {
  const arabic = text.match(ARABIC)?.length ?? 0
  if (arabic === 0) return 'ltr'
  const first = text.match(FIRST_STRONG)?.[0]
  if (first !== undefined && ARABIC_ONE.test(first)) return 'rtl'
  // The first strong character was Latin, so this match cannot be empty.
  return arabic >= text.match(LATIN)!.length ? 'rtl' : 'ltr'
}

function setDirection(node: Element, direction: 'rtl' | 'ltr', isolate = false, align = false): void {
  if (node.hasAttribute(OWNED) && node.getAttribute('dir') !== node.getAttribute(OWNED)) {
    node.removeAttribute(OWNED)
    const style = (node as HTMLElement).style
    style.removeProperty('unicode-bidi')
    style.removeProperty('text-align')
    return
  }
  if (node.hasAttribute('dir') && !node.hasAttribute(OWNED)) return
  if (node.getAttribute('dir') !== direction) node.setAttribute('dir', direction)
  if (node.getAttribute(OWNED) !== direction) node.setAttribute(OWNED, direction)
  const style = (node as HTMLElement).style
  if (isolate && direction === 'rtl') {
    style.setProperty('unicode-bidi', 'isolate', 'important')
  } else if (style.getPropertyValue('unicode-bidi') !== '') {
    style.removeProperty('unicode-bidi')
  }
  if (align && direction === 'rtl') {
    style.setProperty('text-align', 'start', 'important')
  } else if (align && style.getPropertyValue('text-align') !== '') {
    style.removeProperty('text-align')
  }
}

function restoreCurrency(document: Document): void {
  for (const literal of document.querySelectorAll(`[${LITERAL}]`)) {
    if (!literal.nextElementSibling?.matches(`span.katex[${HIDDEN}]`)) literal.remove()
  }
  for (const katex of document.querySelectorAll(`${MARKDOWN} span.katex`)) {
    const annotation = katex.querySelector(TEX_ANNOTATION)
    if (annotation === null) continue
    const source = annotation.textContent!
    if (!ARABIC_ONE.test(source) || TEX_SYNTAX.test(source)) continue
    if (katex.previousElementSibling?.hasAttribute(LITERAL)) continue
    const literal = document.createElement('span')
    const display = katex.parentElement!.classList.contains('katex-display')
    literal.setAttribute(LITERAL, '')
    literal.textContent = `${display ? '$$' : '$'}${source}${display ? '$$' : '$'}`
    katex.setAttribute(HIDDEN, '')
    katex.parentNode!.insertBefore(literal, katex)
  }
}

/** One idempotent pass over mounted presentation surfaces. */
export function applyArabicSupport(document: Document): void {
  for (const bubble of document.querySelectorAll('[data-chat-flow-kind="user"] [class*="bubble"], [data-chat-flow-kind="steering"] [class*="bubble"]')) {
    if (!bubble.hasAttribute('dir')) {
      bubble.setAttribute('dir', 'auto')
      bubble.setAttribute(OWNED, '')
    }
  }

  for (const root of document.querySelectorAll(MARKDOWN)) {
    for (const block of root.querySelectorAll(PROSE)) {
      if (block.closest('.md-code-block') !== null) continue
      setDirection(block, blockDirection(block.textContent!), true)
    }
    for (const list of root.querySelectorAll('ul,ol')) {
      setDirection(list, blockDirection(list.textContent!))
    }
  }

  for (const box of document.querySelectorAll('.md-code-block')) {
    const code = box.querySelector('pre')
    if (code === null) continue
    const direction = blockDirection(code.textContent!)
    setDirection(box, direction)
    setDirection(code, direction, true)
  }

  for (const card of document.querySelectorAll('[data-question-key] > section')) {
    const title = card.querySelector('h2')
    setDirection(card, blockDirection((title ?? card).textContent!))
    for (const block of card.querySelectorAll(QUESTION_PROSE)) {
      setDirection(block, blockDirection(block.textContent!), true, true)
    }
  }

  for (const card of document.querySelectorAll('[data-plan-review-key] > section')) {
    setDirection(card, blockDirection(card.getAttribute('aria-label') ?? card.querySelector('h3')?.textContent ?? card.textContent!))
    for (const block of card.querySelectorAll('h3,p')) {
      setDirection(block, blockDirection(block.textContent!), true, true)
    }
  }

  for (const editor of document.querySelectorAll('[data-composer-input]')) {
    const direction = blockDirection(editor.textContent!)
    setDirection(editor, direction, true, true)
  }

  restoreCurrency(document)
}

/** Watch streamed text and new rows, then release everything on plugin disposal. */
export function installArabicSupport(document: Document): () => void {
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `${MARKDOWN} ul,${MARKDOWN} ol{padding-left:0;padding-right:0;padding-inline-start:18px}` +
    `${MARKDOWN} :is(ul,ol) ol{padding-inline-start:0}` +
    `[${HIDDEN}],[${LITERAL}]+.katex{display:none!important}`
  document.head.appendChild(style)

  let timer: ReturnType<typeof setTimeout> | undefined
  const schedule = (): void => {
    if (timer !== undefined) return
    timer = setTimeout(() => {
      timer = undefined
      applyArabicSupport(document)
    }, 250)
  }
  const observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, characterData: true, subtree: true })
  applyArabicSupport(document)
  return () => {
    observer.disconnect()
    if (timer !== undefined) clearTimeout(timer)
    style.remove()
    for (const literal of document.querySelectorAll(`[${LITERAL}]`)) literal.remove()
    for (const hidden of document.querySelectorAll(`[${HIDDEN}]`)) hidden.removeAttribute(HIDDEN)
    for (const node of document.querySelectorAll(`[${OWNED}]`)) {
      node.removeAttribute('dir')
      node.removeAttribute(OWNED)
      const inline = (node as HTMLElement).style
      inline.removeProperty('unicode-bidi')
      inline.removeProperty('text-align')
    }
  }
}
