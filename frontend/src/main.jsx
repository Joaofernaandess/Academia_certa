import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';

registerSW({
  onNeedRefresh() {
    console.log('Nova atualização disponível.');
  },
  onOfflineReady() {
    console.log('O aplicativo está pronto para uso offline.');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
