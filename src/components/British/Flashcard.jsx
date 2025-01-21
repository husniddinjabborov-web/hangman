import { useState, useEffect } from 'react';
import '../../styled/Flashcard.scss'

function Flashcard({ flashcardGroups }) {
  const [filterDegree, setFilterDegree] = useState('All');
  const [flippedCards, setFlippedCards] = useState({});
  const [localFlashcards, setLocalFlashcards] = useState([]);
  const [timers, setTimers] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('All');


  useEffect(() => {
    const flashcards = JSON.parse(localStorage.getItem('flashcard-british')) || flashcardGroups;
    setLocalFlashcards(flashcards);

  }, [flashcardGroups]);

  const updateLocalStorage = (updatedFlashcards) => {
    localStorage.setItem('flashcard-british', JSON.stringify(updatedFlashcards));
    setLocalFlashcards(updatedFlashcards);
  };

  const updateLearnedGroups = (groupIndex) => {
    const learnedGroups = JSON.parse(localStorage.getItem('learned-british')) || [];
    const group = localFlashcards[groupIndex];
    const firstCard = { ...group[0], score: 100 };
    const firstCardArray = [firstCard];

    if (!learnedGroups.some((g) => JSON.stringify(g) === JSON.stringify(firstCardArray))) {
      learnedGroups.push(firstCardArray);
      localStorage.setItem('learned-british', JSON.stringify(learnedGroups));
    }
  };

  useEffect(() => {
    const savedTimers = JSON.parse(localStorage.getItem("timers-british")) || {};
    const updatedTimers = {};

    Object.keys(savedTimers).forEach((cardKey) => {
      const startTime = savedTimers[cardKey];
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remainingTime = 60 - elapsed;

      if (remainingTime > 0) {
        updatedTimers[cardKey] = remainingTime;
      } else {
        delete savedTimers[cardKey];
      }
    });

    setTimers(updatedTimers);
    localStorage.setItem("timers-british", JSON.stringify(savedTimers));

    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };

        Object.keys(newTimers).forEach((key) => {
          if (newTimers[key] > 0) {
            newTimers[key] -= 1;
          } else {
            delete newTimers[key];
            setFlippedCards((prev) => {
              const updatedFlipped = { ...prev };
              delete updatedFlipped[key];
              return updatedFlipped;
            });
          }
        });

        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFlip = (groupIndex, cardIndex, inputText) => {
    const updatedFlashcards = [...localFlashcards];
    const group = updatedFlashcards[groupIndex];
    const card = group[cardIndex];

    const isCorrect = inputText.toLowerCase() === card.text2.toLowerCase();
    setFeedbackMessage(isCorrect ? "To'g'ri javob berdingiz!" : "Xato javob berdingiz.");
    const scoreChange = isCorrect ? 1 : -1;

    group.forEach((crd) => {
      crd.score += scoreChange;
      if (crd.score > 0) crd.score = 0;
      if (crd.score < -100) crd.score = -100;
    });

    if (group.every((crd) => crd.score === 0)) {
      updateLearnedGroups(groupIndex);
      updatedFlashcards.splice(groupIndex, 1);
    }

    updateLocalStorage(updatedFlashcards);

    const cardKey = `${groupIndex}-${cardIndex}`;
    const startTime = Date.now();

    const newTimers = { ...timers, [cardKey]: 60 };
    setTimers(newTimers);

    localStorage.setItem("timers-british", JSON.stringify({ ...JSON.parse(localStorage.getItem("timers-british") || "{}"), [cardKey]: startTime }));
  };

  const handleFilterChange = (degree) => {
    setFilterDegree(degree);
    setSelectedLevel(degree);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeechRecognition = (groupIndex, cardIndex) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-GB';
    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();
      handleFlip(groupIndex, cardIndex, spokenText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
  };


  const filteredGroups = localFlashcards.map((group) =>
    group.filter((item) => filterDegree === 'All' || item.degree === filterDegree)
  );




  return (
    <div className='flashcards'>
      <footer className="navbar">
        <button
          onClick={() => handleFilterChange('All')}
          style={{ backgroundColor: selectedLevel === 'All' ? 'gray' : '#f39c12' }}
        >
          Barchasi
        </button>
        <button
          onClick={() => handleFilterChange('A1')}
          style={{ backgroundColor: selectedLevel === 'A1' ? 'gray' : '#e74c3c' }}
        >
          A1
        </button>
        <button
          onClick={() => handleFilterChange('A2')}
          style={{ backgroundColor: selectedLevel === 'A2' ? 'gray' : '#f1c40f' }}
        >
          A2
        </button>
        <button
          onClick={() => handleFilterChange('B1')}
          style={{ backgroundColor: selectedLevel === 'B1' ? 'gray' : '#3498db' }}
        >
          B1
        </button>
        <button
          onClick={() => handleFilterChange('B2')}
          style={{ backgroundColor: selectedLevel === 'B2' ? 'gray' : '#2ecc71' }}
        >
          B2
        </button>
        <button
          onClick={() => handleFilterChange('C1')}
          style={{ backgroundColor: selectedLevel === 'C1' ? 'gray' : '#9b59b6' }}
        >
          C1
        </button>
        <button
          onClick={() => handleFilterChange('C2')}
          style={{ backgroundColor: selectedLevel === 'C2' ? 'gray' : '#1abc9c' }}
        >
          C2
        </button>
      </footer>

      {filteredGroups.length === 0 || filteredGroups.every(group => group.length === 0) ? (
        <p>Hozircha bu bo'lim bo'sh.</p>
      ) : (
        <main className="card-container">
          {filteredGroups.map((group, groupIndex) => (
            group.map((item, cardIndex) => {
              const cardKey = `${groupIndex}-${cardIndex}`;
              const isFlipped = flippedCards[cardKey] || timers[cardKey];

              const isVisible =
                (item.score >= -100 && item.score < -95 && cardIndex === 0) ||
                (item.score >= -95 && item.score < -90 && cardIndex === 1) ||
                (item.score >= -90 && item.score < -85 && cardIndex === 2) ||
                (item.score >= -85 && item.score < 80 && cardIndex === 3) ||
                (item.score >= -80 && item.score < -75 && cardIndex === 0) ||
                (item.score >= -75 && item.score < -70 && cardIndex === 1) ||
                (item.score >= -70 && item.score < -65 && cardIndex === 2) ||
                (item.score >= -65 && item.score < 60 && cardIndex === 3) ||
                (item.score >= -60 && item.score < -55 && cardIndex === 0) ||
                (item.score >= -55 && item.score < -50 && cardIndex === 1) ||
                (item.score >= -50 && item.score < -45 && cardIndex === 2) ||
                (item.score >= -45 && item.score < 40 && cardIndex === 3) ||
                (item.score >= -40 && item.score < -35 && cardIndex === 0) ||
                (item.score >= -35 && item.score < -30 && cardIndex === 1) ||
                (item.score >= -30 && item.score < -25 && cardIndex === 2) ||
                (item.score >= -25 && item.score < 20 && cardIndex === 3) ||
                (item.score >= -20 && item.score < -15 && cardIndex === 0) ||
                (item.score >= -15 && item.score < -10 && cardIndex === 1) ||
                (item.score >= -10 && item.score < -5 && cardIndex === 2) ||
                (item.score >= -5 && item.score < 0 && cardIndex === 3);

              return (
                <div className={`card ${isFlipped ? 'flipped' : ''}`} key={cardKey}
                  style={{ display: isVisible ? 'block' : 'none' }}
                >
                  {!isFlipped ? (
                    <div className="card-front">
                      {cardIndex === 3 ? (
                        <p><button onClick={() => speakText(item.text1)}>Play</button></p>
                      ) : (
                        <p>{item.text1}</p>
                      )}

                      {cardIndex !== 2 ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const inputText = e.target.elements[0].value.trim();
                            handleFlip(groupIndex, cardIndex, inputText);
                          }}
                        >
                          <input type="text" placeholder="Nimadir yozing..." required />
                          <button type="submit">Yuborish</button>
                        </form>
                      ) : (
                        <button onClick={() => handleSpeechRecognition(groupIndex, cardIndex)}>
                          Gapirish
                        </button>
                      )}
                      <p>O'rganildi: {item.score + 100}%</p>
                    </div>
                  ) : (
                    <div className="card-back">
                      <p>{item.text2}</p>
                      <p>O'rganildi: {item.score + 100}%</p>
                      <p>{timers[cardKey] || 0} soniya qoldi</p>
                      {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </main>
      )}
    </div>
  );
}

export default Flashcard;


