# MASTER PROMPT — AI-POWERED XODIMLARNING BILIM VA KO‘NIKMALARINI BAHOLASH TIZIMI

## 1. SIZNING VAZIFANGIZ

Siz Senior Software Architect, Full-Stack Developer, AI Engineer, Database Architect va DevOps mutaxassisi sifatida ishlaysiz.

Sizga mavjud loyiha kodi, `README.md` texnik hujjati va tizim arxitektura diagrammasi taqdim etiladi.

Asosiy vazifangiz — mavjud loyihani chuqur audit qilish, 
barcha texnik va mantiqiy xatolarni aniqlash, texnologiyalar o‘rtasidagi noto‘g‘ri bog‘lanishlarni tuzatish va loyihani to‘liq ishlaydigan, xavfsiz, kengaytiriladigan AI-powered baholash platformasiga aylantirish.

**MUHIM TALAB:** Faqat chiroyli interfeys yoki demo yaratish bilan cheklanmang. Barcha funksiyalar real ma'lumotlar bazasi, backend va AI xizmatlari bilan ishlashi shart.

Mavjud ishlaydigan funksiyalarni sababsiz o‘zgartirmang yoki o‘chirib yubormang. Avval mavjud kodni o‘rganing, keyin takomillashtiring.

## 2. LOYIHANING MAQSADI

Korxona xodimlarining (Buxgalteriya, Davlat xizmatlari, IT va boshqa yo‘nalishlar) kasbiy bilim va ko‘nikmalarini avtomatlashtirilgan tarzda baholash.

Tizim quyidagi imkoniyatlarga ega bo‘lishi kerak:

- HR tomonidan ichki reglament va hujjatlarni yuklash.
- AI yordamida savollar generatsiya qilish.
- HR tomonidan savollarni tekshirish va tasdiqlash.
- Xodimlarga sohasi va darajasiga mos test taqdim etish.
- 30 ta takrorlanmas savoldan iborat test shakllantirish.
- Yopiq savollarni avtomatik baholash.
- Ochiq savollarni RAG + Gemini yordamida baholash.
- Xodimlarning bilim darajasini aniqlash.
- Batafsil hisobot va statistikalarni shakllantirish.

Asosiy test tarkibi:
- 25 ta yopiq savol.
- 5 ta ochiq savol.
- Jami 30 ta savol.

Darajalar: Junior, Middle, Senior.

## 3. TO‘G‘RILANGAN TEXNOLOGIK ARXITEKTURA

Texnologiyalarni quyidagi vazifalar bo‘yicha qat'iy ajrating.

### 3.1. Frontend

- React.js — asosiy frontend.
- TypeScript — tiplar xavfsizligi.
- Tailwind CSS — interfeys dizayni.
- Axios yoki Fetch — backend bilan aloqa.
- WebSocket yoki SSE — real vaqt yangilanishlari.

Ikki xil frontend frameworkni (React va Vue) bir vaqtda ishlatmang. React asosiy texnologiya bo‘lsin.

Interfeysda ikkita asosiy modul mavjud bo‘ladi:

1. HR / Admin Panel.
2. Xodim Test Interfeysi.

### 3.2. Backend

- Node.js + NestJS — asosiy biznes logikasi va API.
- Python + FastAPI — AI va RAG mikroservisi.
- Redis — kesh, vaqtinchalik sessiya ma'lumotlari va taymer koordinatsiyasi.
- PostgreSQL — asosiy ma'lumotlar bazasi.
- pgvector — hujjatlar embeddinglari va vektor qidiruvi.

**Muhim:** Node.js va Python bir-birining vazifasini takrorlamasligi kerak.

Node.js quyidagilarni boshqaradi:
- Autentifikatsiya va avtorizatsiya.
- HR va xodimlar boshqaruvi.
- Test yaratish va tarqatish.
- Savollarni tanlash.
- Test taymeri.
- Yopiq savollarni baholash.
- Natijalarni hisoblash va saqlash.
- AI servisiga so‘rov yuborish.
- Hisobotlar.

Python FastAPI quyidagilarni bajaradi:
- PDF/DOCX hujjatlarni qayta ishlash.
- Matnlarni ajratish va tozalash.
- Chunking.
- Embedding yaratish.
- RAG qidiruvi.
- Gemini API integratsiyasi.
- Savollar generatsiyasi.
- Ochiq savollarni baholash.

Frontend PostgreSQL, Redis yoki Gemini API bilan to‘g‘ridan-to‘g‘ri bog‘lanmasligi kerak. Barcha so‘rovlar backend orqali amalga oshirilsin.

## 4. MA'LUMOTLAR BAZASI ARXITEKTURASI

PostgreSQL va pgvector yagona PostgreSQL serverida ishlashi mumkin. pgvector alohida ma'lumotlar bazasi emas, PostgreSQL kengaytmasidir.

Quyidagi jadvallarni loyihalashtiring:

### Asosiy jadvallar

1. `users` — tizim foydalanuvchilari.
2. `employees` — xodimlar ma'lumotlari.
3. `roles` — tizim rollari.
4. `departments` — bo‘limlar.
5. `directions` — kasbiy yo‘nalishlar.
6. `levels` — Junior, Middle, Senior.
7. `documents` — HR yuklagan hujjatlar.
8. `document_chunks` — hujjatlarning bo‘laklari.
9. `questions` — savollar banki.
10. `question_options` — yopiq savollar variantlari.
11. `assessment_criteria` — ochiq savollar baholash mezonlari.
12. `tests` — test konfiguratsiyasi.
13. `test_sessions` — xodimlarning test sessiyalari.
14. `session_questions` — sessiyaga biriktirilgan savollar.
15. `answers` — xodim javoblari.
16. `evaluation_results` — AI baholash natijalari.
17. `test_results` — umumiy test natijalari.
18. `audit_logs` — tizimdagi muhim amallar tarixi.

### Ma'lumotlar bazasiga talablar

- Barcha jadvallarda to‘g‘ri Primary Key va Foreign Key bo‘lsin.
- Takroriy ma'lumotlarning oldi olinsin.
- Kerakli maydonlarga UNIQUE, NOT NULL va CHECK cheklovlari qo‘yilsin.
- Qidiruv uchun zarur indekslar yaratilishi kerak.
- Savollar sohasi va darajasi bilan bog‘lansin.
- Test boshlanganida savollar nusxasi yoki versiyasi sessiyaga biriktirilsin.
- Test davomida savol yoki mezon o‘zgarsa, boshlangan testga ta'sir qilmasin.
- Ma'lumotlar bazasiga migration orqali o‘zgartirish kiritilsin.

## 5. HR HUJJATLARNI YUKLASH VA SAVOL GENERATSIYASI

HR PDF yoki DOCX formatidagi ichki reglamentlarni yuklaydi.

Ishlash algoritmi:

1. HR hujjatni yuklaydi.
2. Backend fayl formatini va xavfsizligini tekshiradi.
3. Python AI servisi hujjatni qayta ishlaydi.
4. Hujjatdan matn ajratiladi.
5. Matn mantiqiy bo‘laklarga (chunk) ajratiladi.
6. Har bir bo‘lak uchun embedding yaratiladi.
7. Embedding va tegishli matn pgvector orqali saqlanadi.
8. Gemini yordamida hujjat mazmuniga asoslangan savollar generatsiya qilinadi.
9. Savollar JSON formatida backendga qaytariladi.
10. HR savollarni ko‘rib chiqadi, tahrirlaydi, tasdiqlaydi yoki rad etadi.
11. Faqat tasdiqlangan savollar asosiy savollar bankiga kiritiladi.

### Savol generatsiyasi talablari

Generatsiya quyidagilarni hisobga olishi shart:

- Kasbiy yo‘nalish.
- Xodim darajasi.
- Hujjat mazmuni.
- Savol murakkabligi.
- Savol turi.
- To‘g‘ri javob.
- Noto‘g‘ri variantlar.
- Javobni baholash mezoni.
- Savolga tegishli manba.

Bir xil yoki mazmunan takrorlanuvchi savollarni aniqlash mexanizmi bo‘lsin.

AI hujjatda mavjud bo‘lmagan ma'lumotni reglament sifatida ko‘rsatmasligi kerak. Manbasi topilmagan savollar HR tasdig‘iga alohida belgilansin.

Yuklangan hujjat ichidagi AI uchun yozilgan ko‘rsatmalar ishonchli tizim ko‘rsatmasi sifatida bajarilmasin. Hujjatlar faqat ma'lumot manbai hisoblanadi.

## 6. XODIMLARNING TEST ISHLASH JARAYONI

Xodim tizimga login va parol orqali kiradi.

1. Tizim xodimning yo‘nalishini aniqlaydi.
2. Xodimning darajasi aniqlanadi.
3. Shu yo‘nalish va darajaga mos savollar tekshiriladi.
4. 25 ta yopiq va 5 ta ochiq savol tanlanadi.
5. Savollar takrorlanmasligi tekshiriladi.
6. Test sessiyasi yaratiladi.
7. Server tomonidan taymer ishga tushiriladi.
8. Xodim testni bajaradi.
9. Javoblar serverda saqlanib boradi.
10. Test yakunlanganda javoblar baholashga yuboriladi.
11. Natijalar bazaga saqlanadi.
12. HR panelida hisobot shakllantiriladi.

### Savollarni tanlash algoritmi

Savollar quyidagi parametrlar asosida tanlansin:

- Yo‘nalish.
- Daraja.
- Savol turi.
- Murakkablik darajasi.
- Faollik holati.

Tasodifiy tanlashda faqat HR tomonidan tasdiqlangan savollar qatnashsin.

Savollar soni yetarli bo‘lmasa, tizim testni noto‘liq savollar bilan yashirincha yaratmasin. HR va administratorga aniq xabar bersin.

Har bir test sessiyasi uchun savollar bir marta tanlanadi. Sahifa yangilanishi yoki qayta kirish savollar tartibini o‘zgartirmasligi kerak.

## 7. REDIS VA TEST TAYMERI

Taymerni faqat frontend JavaScript orqali boshqarmang.

Asosiy vaqt server tomonidan nazorat qilinadi.

Ishlash algoritmi:

1. Test boshlanganda server `started_at` vaqtini qayd etadi.
2. Testning `expires_at` muddati hisoblanadi.
3. Redis orqali sessiya va vaqtinchalik holat boshqariladi.
4. PostgreSQL asosiy vaqt ma'lumotlarini saqlaydi.
5. Frontend qolgan vaqtni server vaqti asosida ko‘rsatadi.
6. Internet uzilganda vaqt to‘xtab qolmaydi.
7. Sahifa yangilanganda taymer davom etadi.
8. Server qayta ishga tushganda sessiya holati tiklanadi.
9. Vaqt tugaganda backend avtomatik yakunlash jarayonini ishga tushiradi.
10. Takroriy yakunlash so‘rovlari natijani buzmasligi kerak.

Test muddati konfiguratsiyadan boshqarilsin.

Redis ishlamay qolsa, test vaqti noto‘g‘ri hisoblanmasligi uchun PostgreSQLdagi server vaqti va sessiya holatiga asoslangan tiklash mexanizmi ishlasin.

## 8. BAHOLASH TIZIMI

### 8.1. Yopiq savollar

Yopiq savollar Gemini API'ga yuborilmasin.

Backend:
- Xodim javobini oladi.
- To‘g‘ri javob bilan solishtiradi.
- Ballni hisoblaydi.
- Natijani saqlaydi.

Baholash aniq va deterministik bo‘lsin.

### 8.2. Ochiq savollar — RAG + GEMINI

Ochiq savollarni baholash quyidagi ketma-ketlikda bajarilsin:

1. Xodim javobi qabul qilinadi.
2. Python AI servisiga yuboriladi.
3. pgvector orqali tegishli reglamentlar qidiriladi.
4. Eng mos manbalar olinadi.
5. Xodim javobi va tasdiqlangan baholash mezoni birlashtiriladi.
6. Gemini API'ga baholash so‘rovi yuboriladi.
7. AI javobni 1–5 ball oralig‘ida baholaydi.
8. Ball bilan birga xatolar va izohlar qaytariladi.
9. Natija tekshirilgan JSON formatida backendga yuboriladi.
10. Backend natijani PostgreSQLga saqlaydi.

### AI baholash formati

AI quyidagi strukturada javob qaytarsin:

- `score`: 1–5.
- `explanation`: baholash izohi.
- `strengths`: to‘g‘ri jihatlar.
- `weaknesses`: kamchiliklar.
- `missing_points`: yetishmagan muhim jihatlar.
- `sources`: foydalanilgan reglament manbalari.
- `confidence`: baholash ishonchliligi.

AI faqat tasdiqlangan mezonlarga tayansin. Xodim javobidagi noto‘g‘ri yoki reglamentga zid fikrlarni to‘g‘ri deb baholamasin.

Manba topilmasa yoki AI baholash ishonchliligi yetarli bo‘lmasa, natija avtomatik ravishda yuqori ball bilan yakunlanmasin. HR tomonidan qayta ko‘rib chiqish uchun belgilang.

AI bergan baholashni HR qayta tekshirishi va zarur bo‘lsa, izoh bilan o‘zgartirishi mumkin bo‘lsin. Barcha o‘zgarishlar audit jurnalida saqlansin.

### Muhim xavfsizlik talabi

Xodim javobi AI uchun tizim ko‘rsatmasi emas, baholanadigan matn hisoblanadi. Javob ichidagi prompt injection va baholash mezonlarini o‘zgartirishga qaratilgan ko‘rsatmalar bajarilmasin.

## 9. GEMINI API VA MODEL FALLBACK

Gemini API uchun alohida integratsiya moduli yarating.

Talablar:

- API kalitlari `.env` orqali boshqarilsin.
- API kalitlari frontendga chiqarilmasin.
- Modellar konfiguratsiyadan boshqarilsin.
- Birinchi model ishlamasa, sozlangan zaxira modelga o‘tish imkoniyati bo‘lsin.
- Rate limit, timeout va vaqtinchalik server xatolarida cheklangan retry ishlatilsin.
- Kvota yoki token limiti tugaganda fallback mexanizmi ishga tushsin.
- Noto‘g‘ri API kalit kabi doimiy xatolarda cheksiz qayta urinish bo‘lmasin.
- Barcha AI so‘rovlarining token sarfi va xatoliklari qayd etilsin.
- AI javobi JSON schema orqali tekshirilsin.
- Noto‘g‘ri JSON kelganda xavfsiz qayta ishlash mexanizmi bo‘lsin.
- Bir savolni qayta baholashda ikki marta ball qo‘shilishiga yo‘l qo‘yilmasin.

AI modeli versiyasi, token narxi va imkoniyatlarini kod ichida o‘zgarmas qiymat sifatida belgilamang. Konfiguratsiya orqali boshqaring.

## 10. TEST XAVFSIZLIGI VA ANTI-CHEAT

Quyidagi holatlarni hisobga oling:

1. Xodim test vaqtida sahifani yangilasa.
2. Internet uzilib qolsa.
3. Xodim boshqa qurilmadan sessiyaga kirsa.
4. Test muddati tugasa.
5. Bir xil javob qayta yuborilsa.
6. Xodim API orqali o‘z ballini o‘zgartirishga urinsa.
7. Boshqa xodimning natijasini ko‘rishga harakat qilsa.
8. Test tugagandan so‘ng javobni o‘zgartirishga urinsa.
9. Test savollari yoki to‘g‘ri javoblarini API orqali olishga harakat qilsa.

Har bir test sessiyasi faqat tegishli xodimga tegishli bo‘lsin.

To‘g‘ri javoblar va baholash kalitlari frontendga yuborilmasin.

Bir vaqtning o‘zida bir nechta faol sessiya ochish siyosati administrator tomonidan sozlanishi mumkin bo‘lsin.

## 11. FRONTEND DIZAYNI VA FUNKSIONALI

Zamonaviy, professional, sodda va foydalanishga qulay interfeys yarating.

### HR / Admin Panel

Quyidagi bo‘limlar bo‘lsin:

1. Dashboard.
2. Xodimlar boshqaruvi.
3. Yo‘nalishlar va darajalar.
4. Hujjatlar boshqaruvi.
5. AI savol generatsiyasi.
6. Savollar banki.
7. Savollarni tasdiqlash.
8. Test konfiguratsiyasi.
9. Test jarayonini kuzatish.
10. Natijalar va hisobotlar.
11. AI xarajatlari va statistikasi.
12. Tizim sozlamalari.
13. Audit jurnali.

### Xodim interfeysi

- Login sahifasi.
- Test haqida ma'lumot.
- Testni boshlash.
- Savollar navigatsiyasi.
- Qolgan vaqt indikatori.
- Javoblarni saqlash.
- Keyingi va oldingi savol.
- Testni yakunlash.
- Natijalar sahifasi (administrator belgilagan ruxsatga muvofiq).

### Dashboard statistikasi

- Jami xodimlar.
- Test topshirganlar.
- Test topshirmaganlar.
- O‘rtacha natija.
- Yo‘nalishlar bo‘yicha natijalar.
- Darajalar bo‘yicha natijalar.
- Kuchli va zaif kompetensiyalar.
- AI baholashda xatoliklar.
- Oxirgi testlar.

## 12. NATIJALARNI HISOBLASH VA HISOBOT

Har bir xodim uchun quyidagilar shakllantirilsin:

- Umumiy ball.
- Yopiq savollar natijasi.
- Ochiq savollar natijasi.
- Sarflangan vaqt.
- To‘g‘ri va noto‘g‘ri javoblar.
- Kuchli tomonlar.
- Zaif tomonlar.
- Kasbiy kompetensiyalar tahlili.
- AI baholash izohlari.

Yopiq va ochiq savollarning umumiy natijaga ta'siri administrator tomonidan sozlanadigan bo‘lsin.

Hisoblash formulasi aniq hujjatlashtirilsin. 1–5 baholashni umumiy ballga aylantirishda turli savol turlarining vaznlari hisobga olinsin.

Hisobotlarni PDF va Excel formatida eksport qilish imkoniyati bo‘lsin.

## 13. ROLLAR VA RUXSATLAR

Quyidagi rollarni amalga oshiring:

**Super Admin:**
- Barcha tizim sozlamalari.
- Foydalanuvchilar va rollar.
- Barcha ma'lumotlarga kirish.

**HR Admin:**
- Xodimlar boshqaruvi.
- Hujjatlar yuklash.
- Savollar yaratish va tasdiqlash.
- Testlar tashkil qilish.
- Natijalarni ko‘rish.

**Xodim:**
- O‘z testlarini bajarish.
- O‘ziga ruxsat etilgan natijalarni ko‘rish.

Barcha ruxsatlar backend darajasida tekshirilsin. Faqat frontendda tugmalarni yashirish xavfsizlik chorasi hisoblanmaydi.

## 14. XATOLIKLARNI ANIQLASH VA BARTARAF ETISH

Mavjud loyihani to‘liq audit qiling.

Quyidagilarni tekshiring:

- Import va dependency xatolari.
- Noto‘g‘ri API endpointlar.
- Frontend va backend o‘rtasidagi nomuvofiqlik.
- Ma'lumotlar bazasi bog‘lanishlari.
- Foreign Key xatolari.
- Redis ulanishi.
- Gemini API integratsiyasi.
- Python va Node.js o‘rtasidagi aloqa.
- WebSocket/SSE ishlashi.
- Test sessiyasi holatlari.
- Taymer sinxronligi.
- Parallel so‘rovlar.
- AI baholashdagi mantiqiy xatolar.
- Noto‘g‘ri JSON javoblar.
- Xavfsizlik zaifliklari.
- Mobil va desktop interfeys muammolari.

Har bir topilgan muammoni:
1. Aniqlang.
2. Sababini tushuntiring.
3. To‘g‘ri yechimni tanlang.
4. Kodda bartaraf eting.
5. Test orqali tekshiring.

Faqat xatoliklar ro‘yxatini tuzib, ishni to‘xtatmang. Imkon qadar ularni amalda tuzating.

## 15. TESTLASH VA SIFAT NAZORATI

Quyidagi testlar majburiy:

- Unit test.
- Integration test.
- API test.
- Database test.
- Authentication test.
- Authorization test.
- Test timer test.
- Redis recovery test.
- Parallel test submission.
- AI response validation.
- RAG retrieval test.
- Gemini fallback test.
- End-to-end test.

Ayniqsa, quyidagi ssenariylar tekshirilsin:

1. 100 ta xodim bir vaqtda test boshlasa.
2. Bir vaqtning o‘zida ko‘plab javoblar yuborilsa.
3. Redis qayta ishga tushsa.
4. Gemini API vaqtincha ishlamay qolsa.
5. Xodim internetdan uzilib, qayta ulansa.
6. Test vaqti tugashi bilan Submit yuborilsa.
7. HR savolni tahrirlasa, avval boshlangan testga ta'sir qilmasligi.
8. Bitta test natijasi ikki marta hisoblanmasligi.

Bajarilmagan testlarni muvaffaqiyatli deb ko‘rsatmang.

## 16. DEPLOYMENT VA ISHGA TUSHIRISH

Loyihani serverga joylashtirish uchun tayyorlang.

- Docker.
- Docker Compose.
- PostgreSQL.
- pgvector.
- Redis.
- Node.js Backend.
- Python FastAPI.
- React Frontend.
- Nginx Reverse Proxy.
- HTTPS.
- Environment konfiguratsiyasi.
- Database migration.
- Avtomatik backup.

Barcha servislar o‘zaro to‘g‘ri bog‘langan bo‘lsin.

`.env.example` yarating. Haqiqiy API kalitlari va parollarni kodga joylamang.

Server qayta ishga tushganda ma'lumotlar yo‘qolmasligi ta'minlansin.

## 17. ISHNI BAJARISH TARTIBI

Loyihani quyidagi bosqichlarda amalga oshiring.

**1-bosqich — AUDIT**

- README va arxitektura rasmini o‘rganing.
- Mavjud kodni to‘liq tekshiring.
- Xatolar va texnologik nomuvofiqliklarni aniqlang.
- Mavjud va kerakli funksiyalarni solishtiring.

**2-bosqich — ARXITEKTURA**

- To‘g‘ri texnologik arxitekturani shakllantiring.
- Backend, AI servis va frontend chegaralarini belgilang.
- Ma'lumotlar bazasini loyihalashtiring.
- API va servislar o‘rtasidagi aloqalarni hujjatlashtiring.

**3-bosqich — BACKEND VA DATABASE**

- Barcha jadvallarni yarating.
- API endpointlarni ishlab chiqing.
- Autentifikatsiya va rollarni sozlang.
- Test sessiyasi va taymer mexanizmini yarating.
- Navbatma-navbat emas, parallel ishlash holatlarini ham hisobga oling.

**4-bosqich — AI VA RAG**

- Hujjatlarni qayta ishlash.
- Embedding va vektor qidiruvi.
- Savollar generatsiyasi.
- HR tasdiqlash jarayoni.
- Ochiq savollarni baholash.
- Gemini fallback.

**5-bosqich — FRONTEND**

- HR/Admin panel.
- Xodim interfeysi.
- Dashboard.
- Natijalar.
- Real vaqt yangilanishlari.

**6-bosqich — TESTLASH**

- Barcha funksiyalarni tekshiring.
- Aniqlangan xatolarni tuzating.
- Integratsion va yuklama testlarini bajaring.

**7-bosqich — DEPLOYMENT**

- Docker konfiguratsiyasi.
- Serverga joylashtirish.
- HTTPS.
- Backup.
- Monitoring.

## 18. YAKUNIY NATIJA VA TOPSHIRILADIGAN MATERIALLAR

Ish yakunida quyidagilar tayyor bo‘lishi shart:

1. To‘liq ishlaydigan React frontend.
2. NestJS backend.
3. Python FastAPI AI mikroservisi.
4. PostgreSQL + pgvector ma'lumotlar bazasi.
5. Redis taymer va kesh tizimi.
6. Gemini API integratsiyasi.
7. RAG hujjat qidiruv tizimi.
8. HR/Admin panel.
9. Xodim test interfeysi.
10. Hisobot va statistika moduli.
11. Docker Compose konfiguratsiyasi.
12. `.env.example`.
13. Database migrationlar.
14. API hujjatlari.
15. O‘rnatish va ishga tushirish bo‘yicha README.
16. Test natijalari.

### QAT'IY TALABLAR

- Ishlamaydigan tugmalar qoldirmang.
- Soxta yoki statik ma'lumotlardan foydalanib, funksiyani ishlayapti deb ko‘rsatmang.
- Backend va database bilan bog‘lanmagan frontend yaratmang.
- AI ishlashi kerak bo‘lgan joylarda oddiy `if/else` bilan AI funksiyasini almashtirmang.
- API kalitlarini frontendga chiqarmang.
- Xatolarni yashirmang.
- Ma'lumotlar bazasidagi mavjud ma'lumotlarni sababsiz o‘chirmang.
- Bir xil funksiyani turli joylarda takroran yozmang.
- Har bir modulni alohida, tushunarli va kengaytiriladigan qilib yarating.
- Barcha muhim amallar loglarda qayd etilsin.
- AI natijalarini tekshirish va HR nazorati imkoniyati saqlansin.

**ENG MUHIM KO‘RSATMA:**

Avval mavjud loyihani chuqur o‘rganing. Keyin kamchiliklarni aniqlab, arxitekturani to‘g‘rilang. Shundan so‘ng bosqichma-bosqich kodni ishlab chiqing va testlardan o‘tkazing.

Loyihani shunchaki qayta yozmang — mavjud kodning foydali qismlarini saqlab, uni professional darajaga olib chiqing.

Yakuniy maqsad — real korxona sharoitida ishlatish mumkin bo‘lgan, xavfsiz, barqaror, iqtisodiy tejamkor va kengaytiriladigan **AI-Powered Employee Assessment Platform** yaratish.