import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-phqp87lxx4mebcga.us.auth0.com"
      clientId="69r7D9TqMH2wK4UuTTCyX9xd3CpewWZ4"
      authorizationParams={{
        audience: "https://dev-phqp87lxx4mebcga.us.auth0.com/api/v2/",
        redirect_uri: window.location.origin
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)