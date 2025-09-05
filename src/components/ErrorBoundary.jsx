// src/components/ErrorBoundary.jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props){ super(props); this.state = { hasError: false, err: null } }
  static getDerivedStateFromError(err){ return { hasError: true, err } }
  componentDidCatch(err, info){ console.error('[ErrorBoundary]', err, info) }
  render(){
    if (!this.state.hasError) return this.props.children
    return (
      <div className="p-6 m-6 border rounded bg-red-50 text-red-700">
        <h2 className="font-semibold mb-2">Ocorreu um erro na aplicação</h2>
        <pre className="text-xs overflow-auto">{String(this.state.err)}</pre>
      </div>
    )
  }
}
