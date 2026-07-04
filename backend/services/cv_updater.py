from .llm_client import LLMClient

SYSTEM_PROMPT = (
    "You are an interview coach and resume expert. "
    "Write in a professional, concise, evidence-based tone. "
    "Return markdown only."
)


async def generate_tailored_cv(
    client: LLMClient,
    job_description: str,
    applicant_background: str,
    refine_instruction: str | None = None,
) -> str:
    prompt = f"""
Job Description:
{job_description}

Candidate Background:
{applicant_background}

Task:
1. Tailor the CV to align with the role.
2. Highlight matching achievements and skills.
3. Reorder content to prioritize relevance.
4. Suggest a short 'Gap Notes' section for missing items.
5. Keep claims faithful to candidate background.

{f'Refine instruction: {refine_instruction}' if refine_instruction else ''}
""".strip()

    fallback = f"""# Tailored CV (Draft)

## Professional Summary
Candidate profile has been aligned to role priorities in the job description.

## Core Skills
- Skills matched from candidate background and job description

## Experience Highlights
- Reframed achievements to emphasize role alignment

## Gap Notes
- Add certifications or project examples matching required skills from the job description.
"""

    return await client.generate_text(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=prompt,
        fallback=fallback,
    )
