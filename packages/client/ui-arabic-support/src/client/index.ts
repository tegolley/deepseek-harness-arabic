import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { installArabicSupport } from './presentation.ts'

/** Browser-only presentation behavior. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => installArabicSupport(document), 'ui-arabic-support: presentation')
}
