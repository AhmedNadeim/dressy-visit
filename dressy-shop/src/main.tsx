import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga4';
import './index.css';
import './i18n';
import App from './App.tsx';

ReactGA.initialize('G-VZ6B9NHD74');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
