import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './components/Dashboard';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
