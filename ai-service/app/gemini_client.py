import httpx
import json
import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("gemini_client")

BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.timeout = httpx.Timeout(45.0, connect=10.0)

    async def get_embedding(self, text: str) -> List[float]:
        """
        Generates 768-dim embedding vector using gemini-embedding-001.
        """
        url = f"{BASE_URL}/models/{settings.EMBEDDING_MODEL}:embedContent?key={self.api_key}"
        payload = {
            "model": f"models/{settings.EMBEDDING_MODEL}",
            "content": {
                "parts": [{"text": text[:2048]}]  # truncate safe chunk
            }
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            res = await client.post(url, json=payload)
            if res.status_code != 200:
                logger.error(f"Embedding error ({res.status_code}): {res.text}")
                res.raise_for_status()
            data = res.json()
            return data["embedding"]["values"]

    async def generate_text_with_fallback(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        json_output: bool = False,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Executes text generation using the priority fallback list:
        gemini-3.8-flash -> gemini-3.6-flash -> gemini-3.1-flash-lite -> gemini-3.5-flash-lite -> gemini-flash-latest -> gemma
        Returns dict with:
        {
            "text": str,
            "model_used": str,
            "usage": dict
        }
        """
        contents = [{"parts": [{"text": prompt}]}]
        generation_config = {
            "temperature": temperature,
            "maxOutputTokens": 4096
        }
        if json_output:
            generation_config["responseMimeType"] = "application/json"

        last_error = None
        for model_name in settings.FALLBACK_MODELS:
            url = f"{BASE_URL}/models/{model_name}:generateContent?key={self.api_key}"
            
            payload: Dict[str, Any] = {
                "contents": contents,
                "generationConfig": generation_config
            }
            if system_instruction:
                payload["systemInstruction"] = {
                    "parts": [{"text": system_instruction}]
                }

            # If model is flash with thinking capability, disable or set 0 thinking budget for fast latency
            if "3.8" in model_name or "3.6" in model_name:
                payload["generationConfig"]["thinkingConfig"] = {"thinkingBudget": 0}

            try:
                logger.info(f"Attempting Gemini generation with model: {model_name}...")
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    res = await client.post(url, json=payload)
                    
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            # Concatenate text parts (ignoring thoughts if separate)
                            text_parts = [p.get("text", "") for p in parts if "text" in p]
                            full_text = "".join(text_parts).strip()
                            logger.info(f"Successfully generated response with model {model_name}")
                            return {
                                "text": full_text,
                                "model_used": model_name,
                                "usage": data.get("usageMetadata", {})
                            }
                    
                    # If 429 (rate limit) or 404 (deprecated) or 503 (busy), log and try next model
                    logger.warning(
                        f"Model {model_name} returned status {res.status_code}: {res.text[:200]}. "
                        f"Falling back to next model..."
                    )
                    last_error = f"Model {model_name} HTTP {res.status_code}: {res.text[:200]}"
            except Exception as e:
                logger.warning(f"Error calling model {model_name}: {e}. Falling back...")
                last_error = str(e)
                continue

        # If all models in the fallback chain fail
        logger.error(f"All fallback models failed! Last error: {last_error}")
        raise RuntimeError(f"Gemini generation failed on all models: {last_error}")

gemini_client = GeminiClient()
