import json
import os
from typing import Any

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()


class LLMClient:
    def __init__(self) -> None:
        self._api_key = os.getenv("OPENAI_API_KEY")
        self._model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self._client = AsyncOpenAI(api_key=self._api_key) if self._api_key else None

    @property
    def configured(self) -> bool:
        return self._client is not None

    async def generate_text(self, system_prompt: str, user_prompt: str, fallback: str) -> str:
        if not self._client:
            return fallback

        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        text = (response.choices[0].message.content or "").strip()
        return text or fallback

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback: dict[str, Any],
    ) -> dict[str, Any]:
        if not self._client:
            return fallback

        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
        output_text = (response.choices[0].message.content or "").strip()
        if not output_text:
            return fallback

        try:
            return json.loads(output_text)
        except json.JSONDecodeError:
            return fallback
