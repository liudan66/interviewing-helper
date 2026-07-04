from .llm_client import LLMClient

SYSTEM_PROMPT = (
    "You are an interview coach. "
    "Write in a professional, concise, evidence-based tone."
)


async def generate_interview_qa(
    client: LLMClient,
    job_description: str,
    applicant_background: str,
    refine_instruction: str | None = None,
) -> list[dict[str, str]]:
    prompt = f"""
Job Description:
{job_description}

Candidate Background:
{applicant_background}

Task:
1. Generate 10 interview questions likely for this role.
2. Cover behavioral, technical, and situational questions.
3. Provide best-match answers grounded in candidate background.
4. Use STAR structure for behavioral responses where appropriate.
5. Return strict JSON object: {{"questions": [{{"question": "...", "answer": "..."}}]}}

{f'Refine instruction: {refine_instruction}' if refine_instruction else ''}
""".strip()

    fallback = {
        "questions": [
            {
                "question": "Tell me about yourself and why you are a fit for this role.",
                "answer": "Summarize your most relevant achievements and connect them directly to the job requirements.",
            },
            {
                "question": "Describe a challenging project and your impact.",
                "answer": "Use STAR: explain the context, your ownership, actions, and measurable outcomes.",
            },
        ]
    }

    payload = await client.generate_json(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=prompt,
        fallback=fallback,
    )

    questions = payload.get("questions", [])
    validated: list[dict[str, str]] = []
    for item in questions:
        if not isinstance(item, dict):
            continue
        question = str(item.get("question", "")).strip()
        answer = str(item.get("answer", "")).strip()
        if question and answer:
            validated.append({"question": question, "answer": answer})

    return validated or fallback["questions"]
