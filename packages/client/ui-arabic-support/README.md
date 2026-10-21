---
description: "Content-aware Arabic and RTL presentation for the DeepSeek Harness Web client."
kind: "package-reference"
---

# Arabic support

This browser plugin adds direction handling to Arabic and mixed Arabic/Latin content. It covers the composer, user bubbles, assistant Markdown paragraphs and lists, code fences, question cards, and plan review. It also restores literal Arabic price prose when the Markdown math parser pairs two currency signs into a KaTeX span.

The plugin changes presentation only. It has no model, server, telemetry, or account integration. It does not translate the interface.

## Use this package

The Web bundle registers the package in `cordis.patch.yml`. A custom bundle needs its own row and a workspace dependency on this package. The browser entrypoint installs a debounced observer because chat text streams after the initial render. Selectors target stable data attributes and semantic classes where available. CSS module class suffixes are used only for existing surfaces that expose no stable attribute.

Direction is derived per text block. Arabic-leading text and mixed text with at least as many Arabic as Latin letters read right to left. English-only text remains left to right. Native `dir` attributes already supplied by a future upstream component take precedence over this plugin.

## Model Experience

None. This package never changes prompts or model requests.

### KV Cache effect

None.

## Known limitations

The Markdown renderer currently exposes no block-direction slot, so the browser plugin adjusts mounted DOM nodes after rendering. A change to upstream Markdown or question-card markup may require selector maintenance. The automated upstream sync workflow runs the tests and opens a reviewable pull request; it does not force a merge when upstream changes conflict.
