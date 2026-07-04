import { CustomerDashboard } from './components/Dashboard';
import { NotificationCenter } from './components/NotificationCenter';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Alessandro Customer Portal</h1>
        <p>Your Gateway to Exclusive Deals</p>
      </header>
      <NotificationCenter />
      <CustomerDashboard />
    </div>
  );
}

export default App;
