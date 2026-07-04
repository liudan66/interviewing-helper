import { marked } from 'marked';

type CVPanelProps = {
  content: string;
};

export function CVPanel({ content }: CVPanelProps) {
  const html = marked.parse(content || 'No CV content generated yet.');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tailored-cv.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <div className="panel-actions">
        <button type="button" onClick={handleCopy} disabled={!content}>
          Copy CV
        </button>
        <button type="button" onClick={handleDownload} disabled={!content}>
          Download CV
        </button>
      </div>
      <article className="markdown" dangerouslySetInnerHTML={{ __html: String(html) }} />
    </section>
  );
}
