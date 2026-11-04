# 🧠 Xodim Reyting AI — Xodimlar Bilim va Ko‘nikmalarini Baholash Platformasi

![AI](https://img.shields.io/badge/AI-Google%20Gemini%20%26%20RAG-indigo.svg)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript%20%2B%20TailwindCSS-blue.svg)
![Backend](https://img.shields.io/badge/Backend-NestJS%20%2B%20PostgreSQL-red.svg)
![AI Service](https://img.shields.io/badge/AI%20Microservice-Python%20FastAPI-emerald.svg)
![Security](https://img.shields.io/badge/Security-Qoidabuzarlik%20Nazorati%20(Anti--Cheat)-amber.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

Korxona ichki reglamentlari, yo‘riqnomalari va me’yoriy hujjatlari asosida xodimlarning (Buxgalteriya, IT, Davlat xizmatlari va boshqa bo‘limlar) bilim va malakasini avtomatlashtirilgan tarzda baholovchi, **RAG (Retrieval-Augmented Generation)** va **Google Gemini AI** texnologiyalariga asoslangan zamonaviy korporativ platforma.

Tizim xodimlar bilimini shunchaki quruq test orqali emas, balki real vaziyatli amaliy savollarga berilgan erkin matnli javoblarni me'yoriy hujjatlar bilan solishtirib tekshiradi va xodimlarning umumiy korporativ **Reytingi hamda o‘rinlarini (1-o‘rin, 2-o‘rin...)** shakllantiradi.

---

## 📑 Mundarija
- [📌 Loyihaning Asosiy Imkoniyatlari](#-loyihaning-asosiy-imkoniyatlari)
- [🏗 Tizim Arxitekturasi](#-tizim-arxitekturasi)
- [🗄 Ma'lumotlar Bazasi (PostgreSQL) va Rollar](#-malumotlar-bazasi-postgresql-va-rollar)
- [🔑 Standart Tizim Hisoblari](#-standart-tizim-hisoblari)
- [🔄 Loyihaning Ishlash Tartibi (Workflow)](#-loyihaning-ishlash-tartibi-workflow)
- [🛡 Qoidabuzarliklar (Anti-Cheat) Nazorati](#-qoidabuzarliklar-anti-cheat-nazorati)
- [🤖 RAG va AI Generatsiya Mexanizmi](#-rag-va-ai-generatsiya-mexanizmi)
- [⚡ Loyihani Ishga Tushirish](#-loyihani-ishga-tushirish)
  - [1-usul: 1-Klik orqali Ishga Tushirish (start_all.bat)](#1-usul-1-klik-orqali-ishga-tushirish-start_allbat---windows)
  - [2-usul: Qo‘lda Bosqichma-bosqich Ishga Tushirish (Development)](#2-usul-qolda-bosqichma-bosqich-ishga-tushirish-development)
  - [3-usul: Docker orqali Ishga Tushirish](#3-usul-docker-orqali-ishga-tushirish-docker-compose)
- [📁 Kataloglar Tuzilishi](#-kataloglar-tuzilishi)
- [🔌 Asosiy API Endpointlar](#-asosiy-api-endpointlar)

---

## 📌 Loyihaning Asosiy Imkoniyatlari

1. **Hujjatlardan Avtomatik 30 ta Savol Generatsiyasi**:
   - HR Admin faqat korxona hujjati (PDF, DOCX yoki TXT)ni yuklaydi.
   - AI modeli matnni o‘rganib, uning asosida **30 ta yangi savol** tuzadi:
     - **25 ta yopiq savol** (4 ta variantli: A, B, C, D, har birida to‘g‘ri javob va izoh);
     - **5 ta ochiq vaziyatli savol** (amaliy holat, namunaviy to‘g‘ri javob, baholash mezonlari va asosiy kalit nuqtalar).
2. **Tejamkor va Inkremental RAG O‘qitish**:
   - Har bir yangi yuklangan hujjat faqat o‘zi uchun bo‘laklanadi va embedding qilinadi.
   - Boshqa eski hujjatlar qayta o‘qitilmaydi va qimmatli tokenlar tejaladi.
3. **Hujjatlarni Ko‘rish va O‘qish Imkoniyati**:
   - Adminlar panelida yuklangan har qanday hujjatni brauzer ichida to‘liq ochib o‘qish (matn preview) va asl nusxasini yuklab olish imkoniyati mavjud.
4. **Ochiq Savollarni Xolis AI Baholashi**:
   - Xodim ochiq savolga o‘z so‘zlari bilan matn yozganda, RAG bazadan tegishli qoida topiladi va Gemini AI orqali 1–5 ball shkalasida (kuchli/zaif tomonlari va asoslangan manbasi bilan) xolis baholanadi.
5. **Xodimlar Reytingi va O‘rinlar**:
   - Xodimlarga mavhum "Darajalar" (Junior/Middle) emas, balki ishlagan testlarining natijasi va to‘plagan ballariga qarab real **o‘rinlar (1-o‘rin, 2-o‘rin...)** va korporativ reyting beriladi.
6. **Qoidabuzarliklar Monitoringi (Anti-Cheat)**:
   - Test paytida tab almashtirish, oynadan chiqish, dasturchi uskunalari (F12) yoki nusxalashga urinish darhol qayd etiladi.
   - Qilingan barcha qoidabuzarlik turlari test natijalari sahifasida aniq va batafsil ko‘rsatiladi.
7. **Parollarni Ko‘rish ("Ko‘zcha" belgisi)**:
   - Kirish sahifasida va administratorlar panelida parolni ko‘rish va yashirish qulayligi yaratilgan.
8. **Tungi va Kunduzgi Rejim (Dark/Light mode)**:
   - Tungi rejimda barcha variantlar, tugmalar va matnlar yuqori kontrastli, ko‘rimli va chiroyli dizaynda ishlaydi.

---

## 🏗 Tizim Arxitekturasi

Platforma 3 ta mustaqil mikroxizmatdan iborat:

```
┌────────────────────────────────────────────────────────┐
│              React.js + TypeScript (SPA)               │
│         [Superadmin] / [HR Admin] / [Xodim]            │
│         Port: 3000 (Vite / Tailwind CSS)               │
└───────────────────────────┬────────────────────────────┘
                            │ REST API / JWT
                            ▼
┌────────────────────────────────────────────────────────┐
│               NestJS Backend (Node.js)                 │
│               Port: 4000                               │
│ ────────────────────────────────────────────────────── │
│ • Autentifikatsiya va RBAC rollar (superadmin/admin/xodim)
│ • Bo‘limlar, reglamentlar va savollar banki            │
│ • Server nazoratidagi test taymeri                     │
│ • Yopiq testlarni tekshirish va sessiyalarni boshqarish │
│ • Qoidabuzarliklar audit jurnali                       │
└─────────────┬────────────────────────────┬─────────────┘
              │ SQL So'rovlar              │ HTTP Inter-service
              ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  PostgreSQL 15+ Bazasi   │  │ Python FastAPI Servisi   │
│  Port: 5432              │  │ Port: 8001               │
│ ──────────────────────── │  │ ──────────────────────── │
│ • users, roles           │  │ • PDF/DOCX matn parslash │
│ • departments, documents │  │ • Semantik chunking      │
│ • document_chunks (768d) │  │ • Gemini embedding      │
│ • questions, options     │  │ • 30 ta savol generatsiya│
│ • test_sessions, results │  │ • RAG + Ochiq javob baho │
│ • session_audit_logs     │  └────────────┬─────────────┘
└──────────────────────────┘               │
                                           ▼ HTTPS
                              ┌──────────────────────────┐
                              │    Google Gemini API     │
                              │ [3.6-flash / 3.1-lite]   │
                              │ (Fallback zanjiri bilan) │
                              └──────────────────────────┘
```

---

## 🗄 Ma'lumotlar Bazasi (PostgreSQL) va Rollar

Tizimda rollar mustaqil jadval (`roles`) orqali boshqariladi:
- **`superadmin`** (Super Administrator) — Barcha huquqlarga ega. Yangi adminlarni qo‘shish, tahrirlash, login va parollarini o‘zgartirish huquqi faqat superadminga berilgan.
- **`admin`** (HR Administrator) — Bo‘limlar yaratish, hujjat yuklash, AI modeliga o‘qitish, savollarni tasdiqlash va xodimlar natijalarini kuzatish.
- **`xodim`** (Xodim) — O‘z bo‘limi bo‘yicha test topshirish, test natijalari, tahlillari va o‘z reytingini ko‘rish.

---

## 🔑 Standart Tizim Hisoblari

Baza birinchi marta ishga tushganda quyidagi foydalanuvchilar avtomatik yaratiladi:

| Rol | Login | Parol | Ruxsat doirasi |
|---|---|---|---|
| **Superadmin** | `superadmin` | `admin123` | Barcha huquqlar: Adminlarni qo‘shish/tahrirlash, xodimlar login-parollarini boshqarish, bo‘limlar, hujjatlar, savollar va natijalar |
| **HR Admin** | `admin` | `admin123` | Bo‘limlar sozlash, reglament yuklash va o‘qitish, savollar banki, xodimlar natijalari |
| **Xodim** | `xodim` | `admin123` | Test topshirish, shaxsiy reyting va natijalar tahlili |

---

## 🔄 Loyihaning Ishlash Tartibi (Workflow)

Platformaning to‘liq ishlash davri 6 ta asosiy bosqichdan iborat:

### 1-bosqich: Administrator va Xodimlarni Biriktirish
- **Superadmin** tizimga kiradi (`superadmin` / `admin123`).
- **"Adminlar & Xodimlar"** sahifasiga o‘tib, yangi HR administratorlarni yoki bo‘lim xodimlarini kiritadi.
- Xohlagan vaqtda har qanday admin yoki xodimning logini, ismi va parolini tahrirlashi mumkin (ko‘zcha belgisi orqali parolni tekshirsa bo‘ladi).

### 2-bosqich: Bo‘lim va Test Parametrlarini Sozlash
- **HR Admin** (`admin` / `admin123`) **"Bo‘limlar"** bo‘limiga o‘tadi.
- Yangi bo‘lim (masalan, *Buxgalteriya*, *IT*, *Yuridik*) yaratadi yoki mavjudlarini tahrirlaydi:
  - Test davomiyligi (masalan, `30` daqiqa);
  - Yopiq test savollari soni (`25` ta);
  - Ochiq vaziyatli savollar soni (`5` ta);
  - O‘tish bali (`60`%).
- Ushbu bo‘limga xodimlarni biriktiradi.

### 3-bosqich: Normativ Hujjat Yuklash va Modelga O‘qitish
- **"Hujjatlar"** sahifasiga o‘tiladi.
- Kerakli bo‘lim tanlanib, PDF, DOCX yoki TXT ko‘rinishidagi ichki reglament yuklanadi.
- **"Yangilash (Modelga O‘qitish)"** tugmasi bosiladi:
  - Python AI mikroservisi hujjat matnini tozalaydi va 800 belgilik semantik qismlarga bo‘ladi;
  - `gemini-embedding-001` orqali 768 o‘lchamli vektorlar hisoblanib, bazaga yoziladi;
  - Gemini AI hujjat asosida roppa-rosa **30 ta savol** (25 ta test + 5 ta amaliy) tuzib beradi.
- **Tejamkorlik**: Yangi hujjat qo‘shilganda eski hujjatlar qayta hisoblanmaydi, faqat yangi hujjat o‘rganiladi.
- Admin **"Ko‘rish"** tugmasini bosib hujjat matnini brauzerda o‘qishi yoki faylni yuklab olishi mumkin.

### 4-bosqich: Savollar Bankini Tasdiqlash
- **"Savollar"** sahifasida AI yaratgan 30 ta savol paydo bo‘ladi.
- Admin savollarni ko‘rib chiqib:
  - Keraklisini tasdiqlaydi (`Tasdiqlangan` maqomiga o‘tadi);
  - Xohlasa savol matni yoki variantlarini tahrirlaydi;
  - Zarur bo‘lsa o‘zi ham qo‘lda qo‘shimcha savol kiritadi.

### 5-bosqich: Xodim Test Topshirishi va Qoidabuzarlik Nazorati
- **Xodim** o‘z logini bilan tizimga kiradi.
- O‘z bo‘limi bo‘yicha **"Testni Boshlash"** tugmasini bosadi.
- Server nazoratidagi orqaga hisoblovchi taymer ishga tushadi:
  - 25 ta yopiq test savollari (A, B, C, D);
  - 5 ta amaliy ochiq savol (erkin matn yozish maydoni bilan).
- Test davomida qat'iy nazorat olib boriladi:
  - Xodim boshqa tabga yoki dasturga o‘tsa — ogohlantirish beriladi;
  - Nusxalash (Ctrl+C, Ctrl+V) yoki sichqoncha o‘ng tugmasi bloklanadi;
  - F12 (DevTools) ochishga urinishlar to‘siladi;
  - 3 ta qoidabuzarlikdan so‘ng test avtomatik bekor qilinadi.

### 6-bosqich: Baholash, Reyting va Natijalar Tahlili
- Xodim testni topshirgach:
  - 25 ta yopiq savol bir zumda deterministik hisoblanadi;
  - 5 ta ochiq savol matni Python AI xizmatiga yuboriladi, RAG orqali me'yoriy qoidalar solishtirilib, 1–5 ball bilan baholanadi;
  - Har bir ochiq javob bo‘yicha AI kuchli tomonlar, kamchiliklar va tavsiyalarni yozib beradi.
- Natijalar sahifasida:
  - Umumiy to‘plangan ball va foiz;
  - Xodimning bo‘limdagi **O‘rni (1-o‘rin, 2-o‘rin...)** va umumiy Reytingi;
  - Qilingan qoidabuzarliklar ro‘yxati (qaysi vaqtda qanday qoidabuzarlik sodir etilgani);
  - HR Admin panelidagi umumiy **"Natijalar & Reyting"** jadvaliga avtomatik qo‘shiladi.

---

## 🛡 Qoidabuzarliklar (Anti-Cheat) Nazorati

| Qoidabuzarlik turi | Aniqlash mexanizmi | Oqibati |
|---|---|---|
| **Tab / Oyna almashtirish** | `document.hidden`, `window.blur` | Ekranda darhol qizil ogohlantirish chiqadi va auditga yoziladi |
| **Nusxalash (Copy/Paste)** | `copy`, `cut`, `paste` to‘sig‘i | Savolni internetdan qidirish yoki tayyor matn joylash imkonsiz |
| **Dasturchi vositalari (F12)** | `F12`, `Ctrl+Shift+I`, `Ctrl+U` | Kodni ochish va to‘g‘ri javoblarni ko‘rish to‘silgan |
| **3 ta qoidabuzarlik** | Hodisalar hisoblagichi | 3-marta buzilganda test avtomatik to‘xtatiladi va 0 ball beriladi |
| **Server taymeri** | `expires_at` vaqt tamg‘asi | Kompyuter soatini o‘zgartirish yoki internetni uzish vaqtni cho‘za olmaydi |

---

## 🤖 RAG va AI Generatsiya Mexanizmi

### Avtomatik Fallback Zanjiri
Google Gemini API bepul limitlari tugab qolishining oldini olish uchun fallback mexanizmi joriy etilgan:
```
gemini-3.6-flash ──► gemini-3.1-flash-lite ──► gemini-3.5-flash-lite ──► gemini-3.8-flash ──► gemini-flash-latest
```

### RAG Qidiruvi
1. Hujjat semantik 800 ta belgidan iborat bloklarga ajratiladi.
2. Har bir blok `gemini-embedding-001` orqali 768 o‘lchamli vektorga o‘giriladi.
3. Xodim ochiq savolga javob yozganda, uning javobi ham vektorga aylantirilib, PostgreSQL-dagi eng yaqin semantik qoidalar (Kosinus o‘xshashlik) topiladi va AI ga kontekst sifatida uzatiladi.

---

## ⚡ Loyihani Ishga Tushirish

### Talablar
- **Node.js**: v18+ yoki v20+
- **Python**: 3.10+ yoki 3.11+
- **PostgreSQL**: 15+ yoki 18+ (lokal o‘rnatilgan va 5432 portda ishlayotgan bo‘lishi kerak)
- **Google Gemini API Key** (bepul olish mumkin: [Google AI Studio](https://aistudio.google.com/))

---

### 1-usul: 1-Klik orqali Ishga Tushirish (`start_all.bat` - Windows)

Loyiha ildizidagi `start_all.bat` faylini ikki marta bosing yoki terminalda ishga tushiring:
```cmd
start_all.bat
```

**Ushbu skript avtomatik tarzda:**
1. Eski band bo‘lgan portlarni (3000, 4000, 8001) tozalaydi;
2. Python AI servisni `http://localhost:8001` da ishga tushiradi;
3. NestJS Backendni `http://localhost:4000` da ishga tushiradi;
4. React Frontendni `http://localhost:3000` da ishga tushiradi;
5. Brauzerni avtomatik ochadi.

---

### 2-usul: Qo‘lda Bosqichma-bosqich Ishga Tushirish (Development)

Agar har bir servisni alohida terminal oynasida ko‘rib ishga tushirmoqchi bo‘lsangiz:

#### 1-qadam: PostgreSQL Bazasini Yaratish
PostgreSQL terminalida (`psql`) yoki pgAdmin orqali:
```sql
CREATE DATABASE employee_assessment_db;
```
*(Backend ishga tushganda barcha jadvallar, rollar va standart foydalanuvchilar avtomatik yaratiladi).*

#### 2-qadam: Python AI Mikroservisi (Port 8001)
Yangi terminal oching:
```bash
cd ai-service
python -m venv .venv
.\.venv\Scripts\activate       # Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
python run.py
```
*(AI mikroxizmati `http://127.0.0.1:8001` manzilida ishlaydi).*

#### 3-qadam: NestJS Backend API (Port 4000)
Yangi terminal oching:
```bash
cd backend
npm install
npm run build
node dist/main.js             # yoki test rejimida: npm start
```
*(Backend `http://localhost:4000` manzilida ishlaydi).*

#### 4-qadam: React Frontend (Port 3000)
Yangi terminal oching:
```bash
cd frontend
npm install
npm run dev
```
*(Frontend `http://localhost:3000` manzilida ochiladi).*

Brauzeringizda **`http://localhost:3000`** manziliga kiring!

---

### 3-usul: Docker orqali Ishga Tushirish (`docker compose`)

Agar kompyuteringizda Docker o‘rnatilgan bo‘lsa:
```bash
docker compose up -d --build
```
Konteynerlar holatini tekshirish:
```bash
docker compose ps
```
To‘xtatish:
```bash
docker compose down
```

---

## 📁 Kataloglar Tuzilishi

```
xodim_bilimini_baholash_test/
├── ai-service/                   # Python FastAPI AI mikroservisi
│   ├── app/
│   │   ├── config.py             # Sozlamalar va Gemini fallback zanjiri
│   │   ├── database.py           # PostgreSQL asyncpg hovuzi va vektor saqlash
│   │   ├── document_parser.py    # PDF va DOCX parslash, semantik chunking
│   │   ├── evaluator.py          # Ochiq javoblarni RAG + Gemini orqali baholash
│   │   ├── gemini_client.py      # Gemini API integratsiyasi (8k token limit)
│   │   ├── main.py               # FastAPI REST endpointlari
│   │   ├── question_generator.py # Hujjatdan 30 ta savol generatsiya qilish
│   │   └── rag_engine.py         # Kosinus o‘xshashlik orqali RAG qidiruvi
│   ├── requirements.txt
│   └── run.py                    # AI servisni ishga tushiruvchi skript
│
├── backend/                      # Node.js NestJS Asosiy API
│   ├── src/
│   │   ├── auth/                 # JWT Auth, Rollar (superadmin, admin, xodim)
│   │   ├── database/             # PostgreSQL hovuzi va SQL sxema
│   │   ├── departments/          # Bo‘limlar va test parametrlarini sozlash
│   │   ├── documents/            # Fayl yuklash, ko‘rish va "Yangilash"
│   │   ├── questions/            # Savollar banki, tasdiqlash va tahrirlash
│   │   ├── results/              # Xodimlar natijalari, tahlil va reyting
│   │   ├── test-sessions/        # Test sessiyasi, server taymeri va Anti-cheat
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
│
├── frontend/                     # React.js TypeScript Interfeysi
│   ├── src/
│   │   ├── components/
│   │   │   ├── AntiCheatGuard.tsx# Qoidabuzarliklarni kuzatuvchi qalqon
│   │   │   └── Navbar.tsx        # Navigatsiya, profil va tungi rejim tugmasi
│   │   ├── pages/
│   │   │   ├── AdminAdmins.tsx      # Superadmin: Adminlar & Xodimlarni boshqarish
│   │   │   ├── AdminDashboard.tsx   # Statistika va monitoring
│   │   │   ├── AdminDepartments.tsx # Bo‘limlar va xodimlarni biriktirish
│   │   │   ├── AdminDocuments.tsx   # Hujjat yuklash, ko‘rish va o‘qitish
│   │   │   ├── AdminQuestions.tsx   # Savollar banki
│   │   │   ├── AdminResults.tsx     # Xodimlar reytingi va natijalari
│   │   │   ├── EmployeeResults.tsx  # Shaxsiy natija va AI tavsiyalari
│   │   │   ├── EmployeeTest.tsx     # Test topshirish, taymer va qoidabuzarlik
│   │   │   └── Login.tsx            # Login oynasi va ko‘zcha belgisi
│   │   ├── services/
│   │   │   └── api.ts            # Axios API mijoz
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vite.config.ts
│
├── uploads/                      # Yuklangan PDF va DOCX reglamentlar
├── start_all.bat                 # Windows uchun 1-klikda ishga tushirish skripti
├── start_all.ps1                 # PowerShell skripti
├── buxgalteriya_reglamenti_2026.txt # Sinov uchun namunaviy reglament
└── README.md                     # To‘liq qo‘llanma
```

---

## 🔌 Asosiy API Endpointlar

### Backend API (NestJS — `http://localhost:4000/api`)
- `POST /api/auth/login` — Tizimga kirish (`username` yoki `login` va `password`)
- `GET /api/auth/profile` — Joriy foydalanuvchi ma'lumotlari
- `GET, POST, PUT, DELETE /api/auth/admins` — Administratorlarni boshqarish (Faqat Superadmin)
- `GET, POST, PUT, DELETE /api/auth/users` — Xodimlarni boshqarish va parollarini yangilash
- `GET, POST, PUT, DELETE /api/departments` — Bo‘limlar va test parametrlarini boshqarish
- `GET, POST, DELETE /api/documents` — Reglamentlarni yuklash va ro‘yxatini olish
- `GET /api/documents/:id/content` — Hujjat matnini to‘liq o‘qish (preview)
- `GET /api/documents/:id/file` — Asl faylni yuklab olish
- `POST /api/documents/:id/sync` — AI modeliga o‘qitish va 30 ta savol tuzish
- `GET, POST, PATCH, DELETE /api/questions` — Savollar bankini boshqarish va tasdiqlash
- `POST /api/test-sessions/start` — Test sessiyasini boshlash
- `POST /api/test-sessions/:id/answer` — Savol javobini saqlash
- `POST /api/test-sessions/:id/anti-cheat-event` — Qoidabuzarlikni qayd etish
- `POST /api/test-sessions/:id/submit` — Testni yakunlash va baholatish
- `GET /api/results/dashboard` — Tahliliy dashboard ko‘rsatkichlari
- `GET /api/results/leaderboard` — Xodimlarning o‘rinlari va umumiy reytingi

### AI Mikroservis (FastAPI — `http://localhost:8001`)
- `POST /api/documents/process` — PDF/DOCX matnini parslash, embedding qilish va 30 ta savol tuzish
- `POST /api/documents/generate-questions` — Berilgan matndan 30 ta savol shakllantirish
- `POST /api/evaluate` — Ochiq savol javobini RAG + Gemini orqali baholash
- `GET /health` — AI xizmat holatini tekshirish

---

## 📄 Litsenziya
Ushbu loyiha korxona xodimlarining bilim va ko‘nikmalarini adolatli, xolis va zamonaviy AI texnologiyalari yordamida baholash uchun yaratilgan.
MIT License.
