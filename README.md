# Interviewing Helper

Interviewing Helper is a web app that helps job seekers prepare for interviews by:

- Tailoring a CV to a target job description
- Generating likely interview questions
- Drafting best-match answers grounded in the applicant background

## Tech Stack

- Backend: FastAPI + OpenAI SDK
- Frontend: React + TypeScript + Vite
- Containerization: Docker Compose

## Project Structure

- `/backend` FastAPI API and LLM services
- `/frontend` React app
- `/docker-compose.yml` local multi-service setup

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set OPENAI_API_KEY in .env
uvicorn main:app --reload
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL` if your backend is not on `http://localhost:8000`.

## Docker Compose

```bash
docker compose up --build
```

## API Endpoints

- `POST /api/tailor-cv` → tailored CV markdown
- `POST /api/generate-qa` → interview question/answer list
- `POST /api/analyze` → combined response
- `POST /api/analyze/stream` → NDJSON progressive response for UI streaming

### Request Body

```json
{
  "job_description": "...",
  "applicant_background": "...",
  "refine_instruction": "optional"
}
```
