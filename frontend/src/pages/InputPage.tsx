import { useState } from 'react';
import type { AnalyzeRequest } from '../types';

type InputPageProps = {
  loading: boolean;
  onSubmit: (payload: AnalyzeRequest) => Promise<void>;
};

const MIN_LENGTH = 30;

export function InputPage({ loading, onSubmit }: InputPageProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [background, setBackground] = useState('');
  const [refineInstruction, setRefineInstruction] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (jobDescription.trim().length < MIN_LENGTH || background.trim().length < MIN_LENGTH) {
      setError(`Please provide at least ${MIN_LENGTH} characters for both fields.`);
      return;
    }

    setError('');
    await onSubmit({
      job_description: jobDescription.trim(),
      applicant_background: background.trim(),
      refine_instruction: refineInstruction.trim() || undefined,
    });
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <label>
        Job Description
        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the target job description..."
          rows={10}
          required
        />
      </label>

      <label>
        Applicant Background / CV
        <textarea
          value={background}
          onChange={(event) => setBackground(event.target.value)}
          placeholder="Paste the applicant's current CV or profile..."
          rows={10}
          required
        />
      </label>

      <label>
        Optional refine instruction
        <input
          value={refineInstruction}
          onChange={(event) => setRefineInstruction(event.target.value)}
          placeholder="e.g. Focus on product leadership achievements"
          type="text"
        />
      </label>

      {error ? <p className="error">{error}</p> : null}

      <button type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Generate Tailored CV + Interview Q&A'}
      </button>
    </form>
  );
}
