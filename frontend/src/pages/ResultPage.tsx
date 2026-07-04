import { useState } from 'react';
import { CVPanel } from '../components/CVPanel';
import { QAPanel } from '../components/QAPanel';
import type { AnalyzeResponse } from '../types';

type ResultPageProps = {
  result: AnalyzeResponse;
  loading: boolean;
  statusMessage: string;
  onBack: () => void;
  onRegenerate: () => Promise<void>;
};

export function ResultPage({ result, loading, statusMessage, onBack, onRegenerate }: ResultPageProps) {
  const [tab, setTab] = useState<'cv' | 'qa'>('cv');

  return (
    <section className="result-page">
      <div className="result-toolbar">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <button type="button" onClick={() => void onRegenerate()} disabled={loading}>
          {loading ? 'Regenerating...' : 'Refine'}
        </button>
      </div>

      {statusMessage ? <p className="status">{statusMessage}</p> : null}

      <div className="tabs">
        <button type="button" className={tab === 'cv' ? 'active' : ''} onClick={() => setTab('cv')}>
          Tailored CV
        </button>
        <button type="button" className={tab === 'qa' ? 'active' : ''} onClick={() => setTab('qa')}>
          Interview Q&A
        </button>
      </div>

      {tab === 'cv' ? <CVPanel content={result.tailored_cv} /> : <QAPanel questions={result.questions} />}
    </section>
  );
}
