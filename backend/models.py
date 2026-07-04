from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    job_description: str = Field(..., min_length=30, description="Target job description")
    applicant_background: str = Field(..., min_length=30, description="Candidate background/CV text")
    refine_instruction: str | None = Field(
        default=None,
        description="Optional follow-up instruction for regeneration",
    )


class TailorCVResponse(BaseModel):
    tailored_cv: str


class QAItem(BaseModel):
    question: str
    answer: str


class GenerateQAResponse(BaseModel):
    questions: list[QAItem]


class AnalyzeResponse(BaseModel):
    tailored_cv: str
    questions: list[QAItem]
