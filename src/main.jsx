import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/archivo/standard.css';
import '@fontsource-variable/inter-tight';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import './styles/global.css';
import { detectTier, detectWebGL } from './utils/device';
import { isTouch, prefersReducedMotion } from './animations/motion';
import { app } from './utils/store';
import App from './App';

// Seed runtime capability flags once before first component mount
app.webgl = detectWebGL();
app.tier = detectTier();
app.touch = isTouch();
app.reducedMotion = prefersReducedMotion();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

