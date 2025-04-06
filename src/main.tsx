
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StoreProvider } from './contexts/StoreContext.tsx'
import { CourierProvider } from './contexts/CourierContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <StoreProvider>
      <CourierProvider>
        <App />
      </CourierProvider>
    </StoreProvider>
  </AuthProvider>
);
