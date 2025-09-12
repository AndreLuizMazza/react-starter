// src/components/ErrorBoundary.jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, err: null }
  static getDerivedStateFromError(err) { return { hasError: true, err } }
  componentDidCatch(err, info) { console.error('[ErrorBoundary]', err, info) }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto max-w-3xl p-6">
          <h1 className="text-xl font-semibold mb-2">Algo deu errado 😬</h1>
          <p className="text-zinc-600 mb-4">Recarregue a página ou tente novamente em instantes.</p>
          <pre className="text-xs bg-zinc-100 p-3 rounded">{String(this.state.err)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
