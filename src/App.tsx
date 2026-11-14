import StartPage from './StartPage';
import CityQuiz from './CityQuiz';

function App() {
  const hash = window.location.hash.toLowerCase();

  // Route to CityQuiz on #cityquiz or #share=...
  if (hash === '#cityquiz' || window.location.hash.startsWith('#share=')) {
    return <CityQuiz />;
  }

  return <StartPage />;
}

export default App;
