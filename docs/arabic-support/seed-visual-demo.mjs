import { Context } from '@deepseek-ai/cordis'
import { createMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import { SESSION_FORMAT_VERSION, Session, SessionId } from '@deepseek-ai/dsh-session'
import * as JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'

const id = SessionId(process.argv[2] ?? 'rtl-visual-demo')
const root = process.env.DSH_SESSION_ROOT ?? '/data/sessions'
const cwd = process.env.DSH_DEMO_CWD ?? '/root'
const createdAt = Date.now() - 60_000
const session = Session.create(id)

session.append('turn/start', { turn: 1 })
const user = session.append('user/message', createUserMessage({
  content: [{ type: 'text', text: 'اكتب مثالاً قصيراً بالعربية والإنجليزية عن Model X. اذكر السعر 123 ريال، الإصدار Pro 2، والنسبة 45%.' }],
  source: { kind: 'user' },
}), { surfaceOp: 'append' })
session.append('session/title', {
  title: 'تجربة RTL وArabic مع الأرقام',
  messageSeqs: [user.seq],
  source: { kind: 'fallback' },
})
session.append('step/start', { turn: 1, step: 1 })
session.append('assistant/message', {
  stream: [],
  turn: 1,
  step: 1,
  message: createMessage({
    role: 'assistant',
    content: [{
      type: 'text',
      text: [
        '## مثال عربي وإنجليزي',
        '',
        'الجهاز Model X بإصدار Pro 2 سعره 123 ريال، ونسبة الأداء 45%.',
        '',
        '- الاسم: Model X',
        '- السعر: 123 ريال',
        '- الحالة: Available',
        '',
        'English: Model X Pro 2 costs 123 SAR and reaches 45% performance.',
      ].join('\n'),
    }],
    source: { kind: 'model', provider: 'fixture', model: 'fixture' },
  }),
}, { surfaceOp: 'append' })
session.append('step/end', { turn: 1, step: 1 })
session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })

const context = new Context()
try {
  await context.plugin(JsonlSessionPersistence, { root })
  const handle = await context.sessionPersistence.create({
    version: SESSION_FORMAT_VERSION,
    id,
    createdAt,
    isSeeded: false,
    cwd,
    delegationDepth: 0,
  })
  await handle.append(session.snapshotEvents())
  await handle.close()
  console.log(`Seeded visual-only session: ${id}`)
} finally {
  await context.fiber.dispose()
}
