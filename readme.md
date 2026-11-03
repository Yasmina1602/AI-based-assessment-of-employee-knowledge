# 🧠 AI-Powered Xodimlar Bilim va Ko‘nikmalarini Baholash Tizimi

![Antigravity & Gemini](https://img.shields.io/badge/AI-Gemini%20API%20%26%20RAG-indigo.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue.svg)
![NestJS](https://img.shields.io/badge/Backend-NestJS%20%2B%20PostgreSQL-red.svg)
![FastAPI](https://img.shields.io/badge/AI%20Microservice-Python%20FastAPI-emerald.svg)
![Anti-Cheat](https://img.shields.io/badge/Security-Anti--Cheat%20Shield-amber.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

Korxona ichki reglamentlari, yo‘riqnomalari va me’yoriy hujjatlari asosida xodimlarning (Buxgalteriya, IT, Davlat xizmatlari va boshqalar) bilimini avtomatlashtirilgan tarzda baholovchi, **RAG (Retrieval-Augmented Generation)** va **Google Gemini AI** texnologiyalariga asoslangan to‘liq korporativ baholash platformasi.

---

## 📑 Mundarija
- [📌 Loyihaning Mazmuni va Maqsadi](#-loyihaning-mazmuni-va-maqsadi)
- [🏗 Tizim Arxitekturasi](#-tizim-arxitekturasi)
- [❓ Nega loyiha katta ierarxiya va ko‘p qatlamlarga bo‘lingan?](#-nega-loyiha-katta-ierarxiya-va-kop-qatlamlarga-bolingan)
- [🛡 Xavfsizlik va Anti-Cheat Tizimi](#-xavfsizlik-va-anti-cheat-tizimi)
- [🤖 AI va RAG Mexanizmi](#-ai-va-rag-mexanizmi)
- [🔑 Standart Tizim Hisoblari](#-standart-tizim-hisoblari)
- [🎯 Asosiy Funksiyalardan Foydalanish](#-asosiy-funksiyalardan-foydalanish)
- [⚡ Ishga Tushirish Qo‘llanmasi](#-ishga-tushirish-qollanmasi)
  - [1-usul: 1-Klik orqali Tezkor Ishga Tushirish (start_all.bat)](#1-usul-1-klik-orqali-tezkor-ishga-tushirish-start_allbat---windows)
  - [2-usul: Docker orqali Ishga Tushirish (docker compose)](#2-usul-docker-orqali-ishga-tushirish-toliq-konteynerlashgan)
  - [3-usul: Qo‘lda Bosqichma-bosqich Ishga Tushirish (Development)](#3-usul-qolda-bosqichma-bosqich-ishga-tushirish-development)
- [❓ Nega oldin "npm run build" va "npm run preview" bor edi?](#-nega-oldin-npm-run-build-va-npm-run-preview-bor-edi)
- [📁 Loyiha Kataloglar Tuzilishi](#-loyiha-kataloglar-tuzilishi)
- [🔌 Asosiy API Endpointlar](#-asosiy-api-endpointlar)

---

## 📌 Loyihaning Mazmuni va Maqsadi

Ko‘pgina korxonalarda attestatsiya va test sinovlari eskirgan statik savollar yoki qog‘oz blanklar asosida o‘tkaziladi. Bu esa savollarning eskirishiga, xodimlarning savollarni shunchaki yodlab olishiga va ochiq amaliy vaziyatlarni xolis tekshirib bo‘lmasligiga olib keladi.

Ushbu platformaning asosiy yechimlari:
1. **Reglamentlardan avtomatik savol generatsiyasi**: HR bo‘limi faqat PDF, DOCX yoki TXT formatidagi korxona reglamenti yoki buyrug‘ini yuklaydi. AI modeli mazkur matnni chuqur tahlil qilib, uning ichidagi faktlar asosida yopiq (4 ta variantli) va amaliy ochiq savollar bankini avtomatik tuzadi.
2. **Ochiq savollarni inson omilisiz xolis baholash**: Xodim ochiq savolga o‘z so‘zlari bilan erkin matn yozganda, tizim RAG orqali reglamentning tegishli qoidasini topadi va Gemini AI orqali xodim javobini 1–5 ball shkalada tekshiradi (kuchli, zaif jihatlari va asoslangan manbasi bilan).
3. **Akademik halollik va Anti-Cheat qalqoni**: Test paytida tab almashish, oynani kichraytirish, dasturchi uskunalari (DevTools/F12) va matn ko‘chirish (copy/paste) qat'iy taqiqlanadi hamda real vaqtda audit qilinadi.
4. **Server nazoratidagi taymer**: Foydalanuvchi kompyuteri soatini o‘zgartirsa yoki interneti uzilib qolsa ham vaqt server tomonidan qat'iy boshqariladi.

---

## 🏗 Tizim Arxitekturasi

Platforma mikroxizmatlar (microservices) va Clean Architecture tamoyillari asosida 3 ta asosiy qismga ajratilgan:

```
                                  ┌─────────────────────────────────────────┐
                                  │       React.js + TypeScript (SPA)       │
                                  │     [HR Admin Panel] & [Xodim Portali]  │
                                  │     Port: 3000 (Vite Dev / Nginx)       │
                                  └────────────────────┬────────────────────┘
                                                       │  REST API / JWT
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │        NestJS Backend (Node.js)         │
                                  │     Port: 4000                          │
                                  │ ─────────────────────────────────────── │
                                  │ • Autentifikatsiya va Rollar (RBAC)     │
                                  │ • Bo‘limlar va Test sozlamalari         │
                                  │ • Sessiyalar va Server Taymeri          │
                                  │ • Deterministik yopiq test tekshiruvi   │
                                  │ • Anti-Cheat Audit jurnali              │
                                  └──────────┬───────────────────┬──────────┘
                                             │                   │
                      SQL So'rovlar / Tranzaksiya │                   │ HTTP Inter-service
                                             │                   │
                                             ▼                   ▼
      ┌─────────────────────────────────────────┐     ┌─────────────────────────────────────────┐
      │          PostgreSQL 18 + pgvector       │     │       Python 3.11 FastAPI Mikroservisi  │
      │     Port: 5432                          │     │     Port: 8001                          │
      │ ─────────────────────────────────────── │     │ ─────────────────────────────────────── │
      │ • users, departments, questions         │◄────┤ • PDF/DOCX Parslash va Tozalash         │
      │ • test_sessions, answers, audit_logs    │     │ • Semantik Bo‘laklash (Chunking)        │
      │ • document_chunks (768-dim Vektorlar)   │     │ • Gemini Embedding & Vektor qidiruv     │
      └─────────────────────────────────────────┘     │ • Savollar Generatsiyasi                │
                                                      │ • Ochiq javoblarni RAG + AI baholash    │
                                                      │ • Prompt Injection Xavfsizlik Qalqoni   │
                                                      └────────────────────┬────────────────────┘
                                                                           │
                                                                           ▼ HTTPS API Call
                                                      ┌─────────────────────────────────────────┐
                                                      │             Google Gemini API           │
                                                      │   [gemini-3.6-flash / 3.1-flash-lite]   │
                                                      │       (Avtomatik Fallback Zanjiri)      │
                                                      └─────────────────────────────────────────┘
```

---

## ❓ Nega loyiha katta ierarxiya va ko‘p qatlamlarga bo‘lingan?

Oddiy test dasturlarida barcha mantiq bitta faylda yozilishi mumkin. Biroq ushbu loyiha korxona darajasidagi (Enterprise) talablarga javob berishi uchun quyidagi sabablarga ko‘ra ko‘p qatlamli qilindi:

1. **AI RAG va Oddiy test o‘rtasidagi tub farq**:
   Oddiy testda to‘g‘ri javob frontendga yuboriladi yoki backendda oddiy `if (user_answer === correct_answer)` orqali tekshiriladi.
   Bu tizimda esa korxona reglamenti PDF/DOCX dan o‘qilib, 800 belgilik semantik qismlarga bo‘linadi va **768 o‘lchamli embedding vektorlariga** aylantiriladi. Xodim ochiq savolga matn yozganda, RAG bazasidan kosinus o‘xshashlik orqali me'yoriy qoida topiladi va Gemini AI orqali tekshiriladi. Ushbu matematik hisob-kitoblar uchun Python FastAPI xizmati ajratilgan.
2. **Mas'uliyatlar taqsimoti (Separation of Concerns)**:
   - **Node.js (NestJS)** — Juda yuqori tezlikdagi I/O so‘rovlar, JWT sessiyalar, millisekundlik server taymeri va tranzaksiyalarni boshqarishda benuqson.
   - **Python (FastAPI)** — Vektorlar, matn parslash va LLM integratsiyasi uchun qulay.
   - Bu ikki texnologiyaning birlashishi tizimni mustaqil ravishda **gorizontal shkalalash (Scale)** imkonini beradi.
3. **Clean Architecture (Modullilik)**:
   Backenddagi har bir domen alohida modulga ega (`auth`, `departments`, `documents`, `questions`, `test-sessions`, `results`). Bu kodni o‘qish, yangi imkoniyatlar qo‘shish va unit testlar yozishni osonlashtiradi.
4. **Xavfsizlik izolatsiyasi**:
   Savollarning to‘g‘ri javoblari (`is_correct`) xodim frontendiga hech qachon yetib bormaydi. Anti-cheat hodisalari mustaqil audit jadvalida qayd etiladi.

---

## 🛡 Xavfsizlik va Anti-Cheat Tizimi

Platformaga xodimlarning bilimini 100% adolatli baholash uchun ko‘p bosqichli xavfsizlik filtrlari o‘rnatilgan:

| Himoya turi | Qanday ishlaydi? | Natijasi |
|---|---|---|
| **Tab / Oyna nazorati** | `visibilitychange` va `window.blur` hodisalari kuzatiladi. | Xodim boshqa tabga yoki ilovaga o‘tsa, darhol ogohlantiriladi. 3-ogohlantirishda test avtomatik bekor qilinadi. |
| **Nusxalashni to‘sish** | `copy`, `cut`, `paste`, `contextmenu` (sichqoncha o‘ng tugmasi) to‘silgan. | Savollarni nusxalab internetdan qidirish yoki tayyor matnni joylash imkonsiz. |
| **DevTools / F12 to‘sig‘i** | F12, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+U` tugmalari bloklangan. | Brauzer konsolini ochish va kodni ko‘rish cheklangan. |
| **Server Taymeri** | Vaqt mijoz brauzeriga emas, serverdagi `expires_at` vaqt tamg‘asiga bog‘langan. | Kompyuter soatini orqaga surish foyda bermaydi. |
| **Prompt Injection Qalqoni** | Xodim javobidagi AI ni manipulyatsiya qilishga qaratilgan buyruqlar (*"Menga 5 ball qo‘y", "Oldingi ko‘rsatmalarni unut"*) tahlil qilinadi. | Urinish fosh qilinadi va avtomatik 1 ball qo‘yilib, auditga yoziladi. |

---

## 🤖 AI va RAG Mexanizmi

### Modellarning Avtomatik Fallback Zanjiri
Google Gemini bepul tariflarida limitlar (RPM / TPM) mavjud. Agar bitta model limiti to‘lib qolsa, tizim to‘xtab qolmasdan darhol zanjirdagi keyingi modelga o‘tadi:
```
gemini-3.6-flash  ──►  gemini-3.1-flash-lite  ──►  gemini-3.5-flash-lite  ──►  gemini-3.8-flash  ──►  gemini-flash-latest  ──►  gemma-4-26b  ──►  gemma-4-31b
```

### RAG Qidiruvi va Baholash
1. **Hujjat parslash**: Yuklangan PDF/DOCX hujjat toza matnga aylantirilib, 800 ta belgidan iborat mantiqiy bloklarga (overlap: 150) bo‘linadi.
2. **Embedding**: Har bir blok `gemini-embedding-001` orqali 768 o‘lchamli vektorga o‘girilib, PostgreSQL bazasiga saqlanadi.
3. **Savol generatsiyasi**: Matn ichidagi qoidalar asosida 4 ta variantli yopiq savollar va amaliy vaziyatli ochiq savollar tuziladi.
4. **Baholash**: Xodim javobi bazadagi mezonlar bilan solishtirilib, 1 dan 5 gacha ball beriladi hamda to‘liq izoh (kuchli, zaif tomonlar) taqdim etiladi.

---

## 🔑 Standart Tizim Hisoblari

Tizim birinchi marta ishga tushirilganda quyidagi foydalanuvchilar avtomatik tarzda yaratiladi:

| Rol | Login | Parol | Huquqlari |
|---|---|---|---|
| **HR / Admin** | `admin` | `admin123` | Bo‘limlar yaratish, vaqt va savollar sonini sozlash, reglament yuklash, "Yangilash" (o‘qitish), savollarni tasdiqlash, barcha xodimlar natijalari va auditni ko‘rish |
| **Xodim** | `xodim` | `xodim123` | O‘z bo‘limi bo‘yicha test topshirish, taymerni ko‘rish, shaxsiy natijalar va AI tavsiyalarini tahlil qilish |

*(Eslatma: Login sahifasida sinov uchun 1 klik bilan demo akkauntlarga kirish tugmalari ham mavjud).*

---

## 🎯 Asosiy Funksiyalardan Foydalanish

### 1. Bo‘limlar va Test Parametrlarini Sozlash
1. Admin sifatida kiring (`admin` / `admin123`).
2. **"Bo‘limlar"** sahifasiga o‘ting.
3. Yangi bo‘lim yarating yoki mavjudini tahrirlang:
   - Test vaqti (masalan, `30` daqiqa);
   - Yopiq savollar soni (masalan, `25` ta);
   - Ochiq savollar soni (masalan, `5` ta);
   - O‘tish bali (masalan, `60`%).

### 2. Hujjat Yuklash va "Yangilash" (Modelni O‘qitish)
1. **"Hujjatlar"** sahifasiga o‘ting.
2. PDF, DOCX yoki TXT formatidagi korxona reglamentini yuklang (loyiha ildizida namunaviy `buxgalteriya_reglamenti_2026.txt` mavjud).
3. Hujjat yonidagi **"Yangilash (O‘rganish)"** tugmasini bosing:
   - AI modeli hujjatni o‘rganadi va embedding vektorlarini bazaga saqlaydi;
   - Shu reglament mazmunidan kelib chiqib, yopiq va ochiq savollarni avtomatik tuzadi.

### 3. Savollar Banki
1. **"Savollar"** sahifasida AI generatsiya qilgan barcha savollar paydo bo‘ladi.
2. Admin ularni ko‘rib chiqib: **Tasdiqlashi**, **Tahrirlashi** yoki **O‘chirishi** mumkin.
3. Shuningdek, qo‘lda ham yangi savollar kiritish mumkin.

### 4. Xodim Test Topshirishi va Anti-Cheat Nazorati
1. Xodim sifatida kiring (`xodim` / `xodim123`).
2. Bo‘limni tanlab, **"Testni Boshlash"** tugmasini bosing.
3. Xodim savollarga javob beradi:
   - Boshqa oynaga chalg‘isa, ogohlantirish beriladi.
   - 3-ogohlantirishdan so‘ng test bekor qilinadi.
4. **"Testni Yakunlash"** bosilgach:
   - Yopiq savollar avtomatik hisoblanadi.
   - Ochiq savollar Python AI xizmati orqali me'yoriy hujjat bilan solishtirilib, 1–5 ball bilan baholanadi.
   - Natija sahifasida kuchli va zaif tomonlar, tavsiyalar to‘liq ko‘rsatiladi.

---

## ⚡ Ishga Tushirish Qo‘llanmasi

### 1-usul: 1-Klik orqali Tezkor Ishga Tushirish (`start_all.bat` - Windows)

Loyiha ildiz papkasidagi `start_all.bat` skriptini ikki marta bosing yoki konsoldan ishga tushiring:
```cmd
start_all.bat
```

**Ushbu skript to‘liq avtomatlashtirilgan bo‘lib quyidagilarni bajaradi:**
1. Oldin ochiq qolib ketgan portlarni (3000, 4000, 8001) avtomatik tozalaydi (`EADDRINUSE` xatosi kelib chiqmaydi).
2. Python AI servisni `http://localhost:8001` da ishga tushiradi.
3. NestJS Backendni `http://localhost:4000` da ishga tushiradi.
4. React Frontendni `http://localhost:3000` da ishga tushiradi.
5. 5 soniyadan so‘ng brauzerni avtomatik `http://localhost:3000` manzilida ochadi.

---

### 2-usul: Docker orqali Ishga Tushirish (To‘liq Konteynerlashgan)

Agar kompyuteringizda **Docker** va **Docker Compose** o‘rnatilgan bo‘lsa, butun tizimni (PostgreSQL, Redis, Python AI, NestJS Backend, React Frontend) bitta buyruq bilan ishga tushirishingiz mumkin.

#### 1. `.env` faylini tekshiring
Loyiha ildizidagi `.env` faylida Gemini API kalitingiz borligiga ishonch hosil qiling:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 2. Konteynerlarni yig‘ish va ishga tushirish
```bash
docker compose up -d --build
```
*(Eski Docker versiyalarida: `docker-compose up -d --build`)*

Docker avtomatik tarzda 5 ta konteynerni ishga tushiradi:
- `employee_assessment_postgres` — PostgreSQL 16 + pgvector (port 5432)
- `employee_assessment_redis` — Redis (port 6379)
- `employee_assessment_ai` — Python FastAPI AI mikroservisi (port 8001)
- `employee_assessment_backend` — NestJS Backend API (port 4000)
- `employee_assessment_frontend` — Nginx + React Frontend (port 3000)

#### 3. Ishga tushganini tekshirish
```bash
docker compose ps
```

#### 4. Loglarni real vaqtda kuzatish
```bash
docker compose logs -f
```

#### 5. To‘xtatish
```bash
docker compose down
```
*(Baza ma'lumotlarini ham to‘liq tozalash uchun: `docker compose down -v`)*

---

### 3-usul: Qo‘lda Bosqichma-bosqich Ishga Tushirish (Development)

Agar har bir servisni alohida terminal oynasida ishga tushirmoqchi bo‘lsangiz:

#### 1-qadam: PostgreSQL bazasini ishga tushiring
Lokal PostgreSQL 15+ o‘rnatilgan bo‘lishi kerak:
```sql
CREATE DATABASE employee_assessment_db;
```
*(Sxema avtomatik yuklanadi yoki `backend/src/database/schema.sql` dan foydalanishingiz mumkin).*

#### 2-qadam: Python AI mikroservisi (Port 8001)
```bash
cd ai-service
python -m venv .venv
.\.venv\Scripts\activate       # Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

#### 3-qadam: NestJS Backend (Port 4000)
```bash
cd backend
npm install
npm start
```
> **Muhim:** `npm start` buyrug‘i `ts-node` orqali to‘g‘ridan-to‘g‘ri TypeScript fayllarini ishga tushiradi. Oldindan hech qanday `npm run build` qilish shart emas!

#### 4-qadam: React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
> **Muhim:** `npm run dev` buyrug‘i Vite dev-serverini to‘g‘ridan-to‘g‘ri `http://localhost:3000` portida ko‘taradi va Hot-Reload ta'minlaydi. Hech qanday oldindan `build` yoki `preview` talab etilmaydi!

---

## ❓ Nega oldin "npm run build" va "npm run preview" bor edi?

Foydalanuvchilar tez-tez quyidagi savolni berishadi:
> *"Nega har bir servisda `npm run build` va `npm run preview` kabi 2 tadan buyruq turibdi?"*

### Farqi quyidagicha:
1. **Production (Ishlab chiqarish rejimi):**
   - React/Vite va NestJS loyihalarida `npm run build` buyrug‘i barcha TypeScript kodlarni optimallashgan statik JavaScript/HTML fayllarga (`dist/` papkasiga) aylantiradi.
   - `npm run preview` esa o‘sha yig‘ilgan `dist/` papkasini ko‘rib chiqish uchun ishlatiladi.
   - **Xatolik sababi:** Agar foydalanuvchi `npm run build` qilmasdan `preview` ni ishlatsa yoki oldingi buildda xatolik bo‘lsa, terminalda *"dist directory not found"* xatosi chiqib, servis ochilmay qoladi.
2. **Development (Dasturlash va sinash rejimi):**
   - Mahalliy test qilish va ishlab chiqish uchun `build` qilib o‘tirish umuman shart emas!
   - Frontend uchun bitta buyruq kifoya: **`npm run dev`** (Vite xotirada tezkor server ochadi).
   - Backend uchun bitta buyruq kifoya: **`npm start`** (`ts-node` orqali to‘g‘ridan-to‘g‘ri ishga tushadi).

Biz `start_all.bat` va yangi ko‘rsatmalarda aynan shu noqulaylikni to‘g‘riladik — endi ortiqcha buyruqlarsiz, bitta buyruq bilan hamma narsa bexato ishga tushadi.

---

## 📁 Loyiha Kataloglar Tuzilishi

```
xodim_bilimini_baholash_test/
├── ai-service/                   # Python FastAPI AI mikroservisi
│   ├── app/
│   │   ├── config.py             # Sozlamalar va Gemini fallback zanjiri
│   │   ├── database.py           # PostgreSQL asyncpg hovuzi va vektor saqlash
│   │   ├── document_parser.py    # PDF va DOCX parslash, semantik chunking
│   │   ├── evaluator.py          # Ochiq javoblarni RAG + Gemini orqali baholash
│   │   ├── gemini_client.py      # Gemini API integratsiyasi va fallback mantiqi
│   │   ├── main.py               # FastAPI REST endpointlari
│   │   ├── question_generator.py # Hujjatdan savollar generatsiya qilish
│   │   └── rag_engine.py         # Kosinus o‘xshashlik orqali RAG qidiruvi
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py                    # AI servisni ishga tushiruvchi skript
│
├── backend/                      # Node.js NestJS Asosiy API
│   ├── src/
│   │   ├── auth/                 # JWT Auth, Admin va Xodim rollari
│   │   ├── database/             # PostgreSQL hovuzi va SQL schema
│   │   ├── departments/          # Bo‘limlar va test konfiguratsiyasi
│   │   ├── documents/            # Fayl yuklash va "Yangilash" integratsiyasi
│   │   ├── questions/            # Savollar banki va tasdiqlash
│   │   ├── results/              # Dashboard tahlili va natijalar tarixi
│   │   ├── test-sessions/        # Test sessiyasi, server taymeri va Anti-cheat
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                     # React.js TypeScript Interfeysi
│   ├── src/
│   │   ├── components/
│   │   │   ├── AntiCheatGuard.tsx# Tab o‘zgarishi, devtools va copy bloklash
│   │   │   └── Navbar.tsx        # Navigatsiya va foydalanuvchi profili
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx   # Umumiy statistika va monitoring
│   │   │   ├── AdminDepartments.tsx # Bo‘limlar va test sozlamalari
│   │   │   ├── AdminDocuments.tsx   # Hujjat yuklash va "Yangilash"
│   │   │   ├── AdminQuestions.tsx   # Savollar banki va tasdiqlash
│   │   │   ├── AdminResults.tsx     # Xodimlar natijalari va AI sharhlari
│   │   │   ├── EmployeeResults.tsx  # Shaxsiy natijalar va tahlil
│   │   │   ├── EmployeeTest.tsx     # Test topshirish interfeysi va taymer
│   │   │   └── Login.tsx            # Login va tezkor demo kirish
│   │   ├── services/
│   │   │   └── api.ts            # Axios API mijoz
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.ts            # Port: 3000 va Backend proxy konfiguratsiyasi
│
├── uploads/                      # Yuklangan PDF va DOCX reglamentlar
├── docker-compose.yml            # 5 ta servisni konteynerlarda ko‘taruvchi fayl
├── start_all.bat                 # Windows uchun 1 klik bilan ishga tushirish skripti
├── buxgalteriya_reglamenti_2026.txt # Namunaviy test hujjati
└── README.md                     # Asosiy to‘liq qo‘llanma
```

---

## 🔌 Asosiy API Endpointlar

### Backend API (NestJS — `http://localhost:4000/api`)
- `POST /auth/login` — Foydalanuvchi tizimga kirishi va JWT token olish
- `GET /auth/me` — Joriy foydalanuvchi ma'lumotlari
- `GET, POST, PUT, DELETE /departments` — Bo‘limlar va test parametrlarini boshqarish
- `GET, POST, DELETE /documents` — Reglamentlarni yuklash va o‘chirish
- `POST /documents/:id/learn` — "Yangilash" (AI modeliga o‘rgatish va savollar generatsiyasi)
- `GET, POST, PUT, DELETE /questions` — Savollar banki
- `POST /test-sessions/start` — Yangi test sessiyasini boshlash
- `POST /test-sessions/:id/warning` — Anti-cheat qoidabuzarligini qayd etish
- `POST /test-sessions/:id/answer` — Savolga berilgan javobni saqlash
- `POST /test-sessions/:id/submit` — Testni yakunlash va baholatish
- `GET /results/dashboard` — HR uchun tahliliy ko‘rsatkichlar

### AI Mikroservis (FastAPI — `http://localhost:8001`)
- `POST /api/ai/documents/parse-and-embed` — Matnni parslash, bo‘laklash va embedding yaratish
- `POST /api/ai/questions/generate` — Hujjatdan test savollarini shakllantirish
- `POST /api/ai/evaluate/open-question` — Ochiq savol javobini RAG + Gemini orqali baholash
- `GET /health` — AI servis holatini tekshirish

---

## 📄 Litsenziya
Ushbu loyiha korxona xodimlarining malakasini baholash uchun yaratilgan ochiq va kengaytiriladigan dasturiy ta'minot hisoblanadi.
MIT License.
