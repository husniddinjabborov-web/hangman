import { Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Hangman from './British/Hangman';
import Learned from './British/Learned';
import Flashcard from './British/Flashcard';
import '../styled/British.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

function American() {
  const [learnedGroups, setLearnedGroups] = useState([]);
  const [flashcardGroups, setFlashcardGroups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const storedLearnedGroups = localStorage.getItem('learned-british');
    const storedFlashcardGroups = localStorage.getItem('flashcard-british');
    if (storedLearnedGroups) {
      setLearnedGroups(JSON.parse(storedLearnedGroups));
    }
    if (storedFlashcardGroups) {
      setFlashcardGroups(JSON.parse(storedFlashcardGroups));
    }
  }, []);


  return (
    <header className="british">
      <nav>
        <ul>
          <li>
            <a href="../">
            HANGMAN
            </a>
          </li>
        </ul>
        <div className="menu-container">
          <button className="menu-toggle" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faBars} />
          </button>
          <ul className={`menu ${isOpen ? "open" : ""}`}>
            <li>
              <Link to="/british/hangman">Hangman</Link>
            </li>
            <li>
              <Link to="/british/learned">Learned</Link>
            </li>
            <li>
              <Link to="/british/flashcard">Flashcard</Link>
            </li>
          </ul>
        </div>
      </nav>
      <Routes>
        <Route index element={<Hangman />} />
        <Route path="hangman" element={<Hangman />} />
        <Route path="learned" element={<Learned learnedGroups={learnedGroups} />} />
        <Route path="flashcard" element={<Flashcard flashcardGroups={flashcardGroups} />} />
      </Routes>
    </header>
  );
}

export default American;
