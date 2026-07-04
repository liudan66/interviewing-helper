import type { QAItem } from '../types';

type QAPanelProps = {
  questions: QAItem[];
};

export function QAPanel({ questions }: QAPanelProps) {
  if (!questions.length) {
    return <p>No interview questions generated yet.</p>;
  }

  return (
    <section className="qa-list">
      {questions.map((item, index) => (
        <details key={`${item.question}-${index}`}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}
