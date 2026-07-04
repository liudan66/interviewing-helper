import asyncio
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import AnalyzeRequest, AnalyzeResponse, GenerateQAResponse, QAItem, TailorCVResponse
from services.cv_updater import generate_tailored_cv
from services.llm_client import LLMClient
from services.qa_generator import generate_interview_qa

app = FastAPI(title="Interview Helper API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_client = LLMClient()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/tailor-cv", response_model=TailorCVResponse)
async def tailor_cv(request: AnalyzeRequest) -> TailorCVResponse:
    tailored_cv = await generate_tailored_cv(
        llm_client,
        request.job_description,
        request.applicant_background,
        request.refine_instruction,
    )
    return TailorCVResponse(tailored_cv=tailored_cv)


@app.post("/api/generate-qa", response_model=GenerateQAResponse)
async def generate_qa(request: AnalyzeRequest) -> GenerateQAResponse:
    questions = await generate_interview_qa(
        llm_client,
        request.job_description,
        request.applicant_background,
        request.refine_instruction,
    )
    return GenerateQAResponse(questions=[QAItem(**item) for item in questions])


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    tailored_cv, questions = await asyncio.gather(
        generate_tailored_cv(
            llm_client,
            request.job_description,
            request.applicant_background,
            request.refine_instruction,
        ),
        generate_interview_qa(
            llm_client,
            request.job_description,
            request.applicant_background,
            request.refine_instruction,
        ),
    )
    return AnalyzeResponse(tailored_cv=tailored_cv, questions=[QAItem(**item) for item in questions])


@app.post("/api/analyze/stream")
async def analyze_stream(request: AnalyzeRequest) -> StreamingResponse:
    async def event_stream():
        yield json.dumps({"type": "status", "message": "Starting analysis"}) + "\n"

        cv_task = asyncio.create_task(
            generate_tailored_cv(
                llm_client,
                request.job_description,
                request.applicant_background,
                request.refine_instruction,
            )
        )
        qa_task = asyncio.create_task(
            generate_interview_qa(
                llm_client,
                request.job_description,
                request.applicant_background,
                request.refine_instruction,
            )
        )

        tailored_cv = await cv_task
        yield json.dumps({"type": "tailored_cv", "tailored_cv": tailored_cv}) + "\n"

        questions = await qa_task
        yield json.dumps({"type": "questions", "questions": questions}) + "\n"

        yield json.dumps({"type": "done"}) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")
