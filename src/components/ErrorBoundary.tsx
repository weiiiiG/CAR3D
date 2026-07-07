import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: any) { console.error('Caught:', error, info) }
  render() {
    if (this.state.error) return <div style={{ padding: 40, color: 'red', fontFamily: 'monospace' }}>{this.state.error.message}</div>
    return this.props.children
  }
}
