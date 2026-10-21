<p lang="en" dir="ltr">For English installation instructions, <a href="INSTALL.en.md">click here</a>.</p>

# تثبيت نسخة DeepSeek Harness RTL الداعمة للعربية

## للمحترفين: الأوامر المختصرة

بعد تثبيت Git وDocker مع Compose:

```bash
git clone https://github.com/tegolley/deepseek-harness-rtl-arabic.git
cd deepseek-harness-rtl-arabic
bash docker/build-arabic-demo.sh
docker compose -f compose.arabic-demo.yml up -d
docker compose -f compose.arabic-demo.yml logs --tail=30 dsh-arabic-demo
```

افتح رابط `dsh web:` الظاهر في السجل على جهاز Docker. [انتقل إلى خطوات التثبيت من المصدر](#التثبيت-من-المصدر) إذا أردت تشغيلها دون حاوية.

## للمبتدئين: شرح كل خطوة

## 1. المتطلبات

- للتجربة المعزولة: Git وDocker مع إضافة Compose، ومساحة بناء إضافية فوق حجم الصورة الذي قارب `5.5GB` في التجربة.
- للتثبيت من المصدر: Node.js بإصدار `24`، و`Corepack`، وGit.
- منفذ `49251` متاح لتجربة Docker، أو المنفذ الافتراضي `3080` للتشغيل من المصدر.

نفذ الأوامر التالية من **جذر النسخة** بعد تنزيلها من مستودعها على GitHub.

## 2. بناء نسخة Docker النظيفة

```bash
bash docker/build-arabic-demo.sh
```

يبني الملف المشروع من المصدر الموجود في هذه النسخة، ويثبت الاعتمادات بالقفل `pnpm-lock.yaml`، ثم يبني ملفات التطبيق. يمرر رقم Commit للبناء دون نسخ مجلد `.git` أو إعدادات المستخدم أو مفاتيح API إلى الصورة.

## 3. تشغيل العرض

```bash
docker compose -f compose.arabic-demo.yml up -d
docker compose -f compose.arabic-demo.yml ps
docker compose -f compose.arabic-demo.yml logs --tail=30 dsh-arabic-demo
```

افتح رابط `dsh web:` المطبوع في السجل. الرابط يحتوي رمز دخول خاص بهذه العملية. يعمل العرض على `http://127.0.0.1:49251/` على جهاز Docker نفسه فقط. إذا كان Docker يعمل على جهاز بعيد، استخدم نفق SSH محلياً ثم افتح الرابط على جهازك:

```bash
ssh -L 49251:127.0.0.1:49251 USER@HOST
```

استبدل `USER` و`HOST` ببيانات جهازك. لا تضع رابط الدخول أو مفاتيح API في بلاغات GitHub أو لقطات الشاشة.

## 4. التحقق من دعم العربية

1. تأكد أن حالة الحاوية `running` في نتيجة `docker compose ps`.
2. افتح رابط الدخول وتأكد من ظهور واجهة المحادثة.
3. اكتب في مربع المحادثة مثالاً مثل `السعر 123 ريال واسم المنتج Model X`، وتأكد أن موضع الكتابة واتجاهها مريحان.
4. للحصول على رد فعلي، أضف إعداد نموذج من داخل إعدادات الواجهة وفق [دليل المشروع الأصلي](../../packages/bundle/web-app/README.md). تحتاج حينها إلى مفتاح النموذج الذي تختاره، ولا تضع قيمته في المستودع.

وجود واجهة تعمل لا يثبت اتصال أي نموذج. فحص الرد يتطلب إعداد نموذج صالح.

## 5. إيقاف العرض

```bash
docker compose -f compose.arabic-demo.yml down
```

يبقى تخزين التجربة محفوظاً في وحدة Docker منفصلة، حتى تستطيع تشغيلها لاحقاً. لا تستخدم خيار حذف وحدات التخزين إذا أردت الاحتفاظ بإعداداتك.

## التثبيت من المصدر

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm run build:artifacts
corepack pnpm dsh web
```

يعرض التشغيل المحلي واجهة الويب عادة على `http://127.0.0.1:3080/`، ويطبع رابط الدخول. لتحقق سريع من إضافة العربية:

```bash
corepack pnpm exec vitest run packages/client/ui-arabic-support/tests
corepack pnpm run build:check
```

## عند صدور تحديث رسمي

راجع طلب الدمج الذي ينشئه `upstream-sync.yml`، وانتظر اكتمال `arabic-support-ci.yml`. إذا ظهر تعارض أو تغيرت بنية واجهة الويب، راجع حزمة `packages/client/ui-arabic-support` واختبرها قبل الدمج. بعد اعتماد التحديث، أعد بناء حاوية العرض بالأوامر الواردة في الخطوتين الثانية والثالثة.
