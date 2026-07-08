type PromptBarProps = {
  prompt: string;
  status: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
};

export function PromptBar({
  prompt,
  status,
  onPromptChange,
  onGenerate,
}: PromptBarProps) {
  return (
    <header className="prompt-bar">
      <div>
        <p className="eyebrow">AI Real-Time Canva</p>
        <h1>Collaborative canvas generation</h1>
      </div>

      <div className="prompt-controls">
        <span className="status-pill">{status}</span>
        <input
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Describe shapes to generate"
        />
        <button type="button" onClick={onGenerate}>
          Generate
        </button>
      </div>
    </header>
  );
}
