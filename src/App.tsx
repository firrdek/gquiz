import { useEffect, useState } from 'react';
import StartPage from './StartPage';
import CityQuiz from './CityQuiz';

function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const h = hash.toLowerCase();

  // Route to CityQuiz on #cityquiz or #share=...
  if (h === '#cityquiz' || hash.startsWith('#share=')) {
    return <CityQuiz />;
  }

  return <StartPage />;
}

export default App;
