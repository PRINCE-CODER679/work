import './chrome.css';

export function BlueprintGrid({ loud = false }) {
  return <div aria-hidden="true" className={`bp-grid ${loud ? 'is-loud' : ''}`} />;
}

