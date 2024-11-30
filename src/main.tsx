import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import GithubCorner from './components/GithubCorner'

const root = document.getElementById('app')

if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GithubCorner />
    <App />
  </React.StrictMode>,
)
