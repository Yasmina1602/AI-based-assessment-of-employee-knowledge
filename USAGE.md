# Xodimlar Bilimini Baholash Tizimi — Qo'llanma va Ishga Tushirish

## 1. Tizim Arxitekturasi va Komponentlar

1. **Frontend (React.js + TypeScript + Tailwind CSS)**:
   - Manzil: `http://localhost:3000`
   - HR / Admin Paneli va Xodim Test Interfeysi
   - Anti-Cheat himoya moduli (Tab almashish, devtools, copy/paste bloklash)
   - Server bilan sinxronlangan qat'iy taymer

2. **Backend (Node.js + NestJS + TypeScript)**:
   - Manzil: `http://localhost:4000`
   - Baza: PostgreSQL 18 (`employee_assessment_db`)
   - Autentifikatsiya: JWT + Role-based Access Control (`admin` va `xodim`)
   - Test sessiyalari boshqaruvi, audit jurnali va Anti-cheat nazorati

3. **AI Mikroservis (Python 3.11 + FastAPI + pgvector + Gemini API)**:
   - Manzil: `http://localhost:8001`
   - Modellarning Fallback zanjiri:
     `gemini-3.6-flash` -> `gemini-3.1-flash-lite` -> `gemini-3.5-flash-lite` -> `gemini-3.8-flash` -> `gemini-flash-latest` -> `gemma-4-26b` -> `gemma-4-31b`
   - Embeddings: `gemini-embedding-001` (768 o'lchamli vektorlar)
   - RAG Qidiruv: Kosinus o'xshashlik orqali me'yoriy hujjatlardan eng mos bo'laklarni topish
   - Prompt Injection Shield: Xodim javobidagi har qanday AI manipulyatsiya urinishlarini zararsizlantirish

---

## 2. Standart Foydalanuvchi Hisoblari (Kirish ma'lumotlari)

Tizim birinchi marta ishga tushganda quyidagi hisoblar avtomatik shakllantirilgan:

| Rol | Login | Parol | Huquqlar |
|---|---|---|---|
| **HR / Admin** | `admin` | `admin123` | Bo'limlar, test sozlamalari, hujjat yuklash, "Yangilash" (AI o'qitish), savollar banki, hisobotlar |
| **Xodim** | `xodim` | `xodim123` | O'z bo'limi bo'yicha test topshirish, taymer, natijalar va AI tahlilini ko'rish |

*(Login sahifasida bir marta bosish orqali tezkor demo kirish tugmalari ham mavjud).*

---

## 3. Asosiy Funksiyalardan Foydalanish

### 3.1. Bo'limlar va Test Parametrlarini Sozlash
1. Admin sifatida kiring (`admin` / `admin123`).
2. **"Bo'limlar"** sahifasiga o'ting.
3. Yangi bo'lim yarating yoki mavjudini tahrirlang:
   - Test vaqti (masalan, 30 daqiqa).
   - Yopiq savollar soni (masalan, 25 ta).
   - Ochiq savollar soni (masalan, 5 ta).
   - O'tish bali (masalan, 60%).

### 3.2. Hujjat Yuklash va "Yangilash" (Modelni O'qitish)
1. **"Hujjatlar"** sahifasiga o'ting.
2. PDF, DOCX yoki TXT formatidagi korxona reglamentini yuklang.
3. Hujjat yonidagi **"Yangilash (O'rganish)"** tugmasini bosing:
   - AI modeli matnni bo'laklarga ajratadi.
   - Vektor embeddinglarini hisoblab, PostgreSQL bazasiga saqlaydi.
   - Shu hujjat mazmunidan kelib chiqib, yopiq (4 ta variantli) va ochiq savollarni avtomatik shakllantiradi.

### 3.3. Savollar Banki
1. **"Savollar"** sahifasida AI generatsiya qilgan barcha savollar paydo bo'ladi.
2. Admin ularni tasdiqlashi, rad etishi yoki o'chirishi mumkin.
3. Shuningdek, qo'lda yangi savol qo'shish imkoni mavjud.

### 3.4. Xodim Test Topshirishi va Anti-Cheat Nazorati
1. Xodim sifatida kiring (`xodim` / `xodim123`).
2. Bo'limni tanlab, **"Testni Boshlash"** tugmasini bosing.
3. **Anti-Cheat Faol:**
   - Agar xodim boshqa tabga yoki dasturga o'tsa, ekranda ogohlantirish chiqadi va hodisa qayd etiladi.
   - 3 ta ogohlantirishdan so'ng test avtomatik ravishda bekor qilinadi.
   - Matnni ko'chirish (`copy/paste`) va o'ng tugma bloklangan.
4. Xodim javoblarini belgilaydi (yopiq savollar) va yozadi (ochiq savollar).
5. **"Yakunlash"** tugmasi bosilganda:
   - Yopiq savollar avtomatik deterministik tekshiriladi.
   - Ochiq savollar Python AI xizmati orqali RAG bazasidan solishtirilib, 1-5 ball shkalasida baholanadi.
   - Natija sahifasida kuchli va zaif tomonlar, tavsiyalar to'liq ko'rsatiladi.

---

## 4. Servislarni Boshqarish

- Bir klik bilan barcha servislarni ishga tushirish uchun: `start_all.bat`
- Yoki Docker orqali: `docker-compose up -d --build`

