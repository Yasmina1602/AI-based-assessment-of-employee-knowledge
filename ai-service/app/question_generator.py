import json
import logging
from typing import List, Dict, Any
from app.gemini_client import gemini_client

logger = logging.getLogger("question_generator")

class QuestionGenerator:
    @classmethod
    async def generate_questions_from_document(
        cls,
        document_text: str,
        department_name: str,
        closed_count: int = 25,
        open_count: int = 5,
        level: str = "Middle"
    ) -> Dict[str, Any]:
        """
        Generates both closed (multiple-choice) and open questions based STRICTLY on the document text.
        Default: 25 closed questions + 5 open questions = 30 total questions.
        """
        # Trim document text to fit context cleanly
        truncated_text = document_text[:18000]
        total_count = closed_count + open_count

        prompt = f"""
Siz korxonaning yuqori malakali HR va imtihon komissiyasi a'zosisiz.
Quyida berilgan ichki me'yoriy hujjat (reglament) asosida xodimlarning bilimini baholash uchun test savollari tuzishingiz kerak.

BO'LIM: {department_name}
DARAJA: {level}
JAMI SAVOLLAR SONI: {total_count} ta ({closed_count} ta yopiq va {open_count} ta ochiq savollar) tuzilishi SHART!
YOPILGAN (TEST) SAVOLLAR SONI: {closed_count} ta (A, B, C, D variantlari bilan, har birida 1 ta to'g'ri javob)
OCHIQ (VAZIYATLI) SAVOLLAR SONI: {open_count} ta (amaliy vaziyat va yozma javob talab etuvchi)

QAT'IY QOIDALAR:
1. Savollar FAQAT va FAQAT ushbu hujjat mazmuniga tayanishi shart. Hujjatda aytilmagan narsalar haqida savol tuzmang.
2. Har bir yopiq savolda 4 ta variant (A, B, C, D) bo'lsin, faqat bittasi to'g'ri bo'lsin.
3. Variantlar o'rtasida chalkashlik bo'lmasin, to'g'ri javob aniq belgilansin.
4. Ochiq savollar uchun baholash mezonlari (criteria), namunaviy to'g'ri javob (sample_answer) va xodim javobida bo'lishi kerak bo'lgan asosiy nuqtalar (key_points) ko'rsatilsin.
5. Yopiq savollar soni aynan {closed_count} ta, ochiq savollar soni aynan {open_count} ta bo'lsin (jami {total_count} ta).
6. Javobingizni FAQAT quyidagi JSON formatida qaytaring, boshqa hech qanday so'z yoki matn qo'shmang!

JSON FORMATI:
{{
  "closed_questions": [
    {{
      "question": "Savol matni...",
      "options": [
        {{"text": "Variant A", "is_correct": false}},
        {{"text": "Variant B", "is_correct": true}},
        {{"text": "Variant C", "is_correct": false}},
        {{"text": "Variant D", "is_correct": false}}
      ],
      "explanation": "Nima uchun ushbu javob to'g'riligi va hujjatdagi manba...",
      "level": "{level}",
      "difficulty": "medium"
    }}
  ],
  "open_questions": [
    {{
      "question": "Ochiq savol matni...",
      "evaluation_criteria": "Baholash mezonlari (1-5 ball shkalasi uchun)...",
      "sample_answer": "Namunaviy to'g'ri javob...",
      "key_points": [
        "1-muhim nuqta",
        "2-muhim nuqta",
        "3-muhim nuqta"
      ],
      "level": "{level}",
      "difficulty": "hard"
    }}
  ]
}}

HUJJAT MATNI:
\"\"\"
{truncated_text}
\"\"\"
"""
        system_instruction = "Siz xodimlar bilimini baholash tizimi uchun test savollari generatorisiz. Faqat ko'rsatilgan JSON formatida javob qaytaring."

        result = await gemini_client.generate_text_with_fallback(
            prompt=prompt,
            system_instruction=system_instruction,
            json_output=True,
            temperature=0.3
        )

        raw_text = result["text"]
        # Parse JSON
        try:
            clean_text = raw_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()

            start_idx = clean_text.find("{")
            end_idx = clean_text.rfind("}")
            if start_idx != -1 and end_idx != -1:
                clean_text = clean_text[start_idx:end_idx + 1]

            parsed = json.loads(clean_text)
            parsed["model_used"] = result["model_used"]
            return parsed
        except Exception as e:
            logger.error(f"Failed to parse generated questions JSON: {e}\nRaw output: {raw_text[:500]}")
            # Safe fallback structure
            return {
                "closed_questions": [],
                "open_questions": [],
                "error": f"JSON parse error: {str(e)}",
                "model_used": result.get("model_used", "")
            }

question_generator = QuestionGenerator()

