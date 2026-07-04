import { useState } from 'react';
import './App.css';
import { InputPage } from './pages/InputPage';
import { ResultPage } from './pages/ResultPage';
import type { AnalyzeRequest, AnalyzeResponse, QAItem } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

const EMPTY_RESULT: AnalyzeResponse = {
  tailored_cv: '',
  questions: [],
};

function App() {
  const [result, setResult] = useState<AnalyzeResponse>(EMPTY_RESULT);
  const [requestPayload, setRequestPayload] = useState<AnalyzeRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const runAnalysis = async (payload: AnalyzeRequest) => {
    setRequestPayload(payload);
    setLoading(true);
    setError('');
    setStatusMessage('Preparing request...');
    setResult(EMPTY_RESULT);

    try {
      const response = await fetch(`${API_BASE}/api/analyze/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        throw new Error('Unable to analyze profile.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let localResult: AnalyzeResponse = { tailored_cv: '', questions: [] };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const event = JSON.parse(line) as {
            type: string;
            message?: string;
            tailored_cv?: string;
            questions?: QAItem[];
          };

          if (event.type === 'status') {
            setStatusMessage(event.message ?? 'Working...');
          }
          if (event.type === 'tailored_cv' && event.tailored_cv) {
            localResult = { ...localResult, tailored_cv: event.tailored_cv };
            setResult({ ...localResult });
            setStatusMessage('CV generated. Preparing interview Q&A...');
          }
          if (event.type === 'questions' && event.questions) {
            localResult = { ...localResult, questions: event.questions };
            setResult({ ...localResult });
            setStatusMessage('Interview Q&A generated.');
          }
          if (event.type === 'done') {
            setStatusMessage('Completed.');
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!requestPayload) {
      return;
    }
    await runAnalysis(requestPayload);
  };

  const hasResult = Boolean(result.tailored_cv || result.questions.length);

  return (
    <main className="container">
      <h1>Interview Helper</h1>
      <p className="subtitle">
        Tailor a CV and generate likely interview questions with best-match answers.
      </p>

      {error ? <p className="error">{error}</p> : null}

      {!hasResult || loading ? (
        <InputPage loading={loading} onSubmit={runAnalysis} />
      ) : (
        <ResultPage
          result={result}
          loading={loading}
          statusMessage={statusMessage}
          onBack={() => {
            setResult(EMPTY_RESULT);
            setStatusMessage('');
            setError('');
          }}
          onRegenerate={handleRegenerate}
        />
      )}

      {loading ? <div className="skeleton" aria-label="loading" /> : null}
    </main>
  );
}

export default App;
