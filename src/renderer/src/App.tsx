import { AppShell } from '@renderer/components/app/AppShell'

/**
 * Thin wrapper so the root file stays small and readable.
 */
function App(): React.JSX.Element {
  return <AppShell />
}

export default App

