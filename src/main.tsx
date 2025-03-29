
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StoreProvider } from './contexts/StoreContext.tsx'
import { CourierProvider } from './contexts/CourierContext.tsx'

createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <CourierProvider>
      <App />
    </CourierProvider>
  </StoreProvider>
);
