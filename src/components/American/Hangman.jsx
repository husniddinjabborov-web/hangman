import { useEffect, useState } from 'react';
import data from '../../data/American.json'
import '../../styled/Hangman.scss'

function Hangman() {
  const [items, setItems] = useState([]);
  const [guesses, setGuesses] = useState({});
  const [wrongGuesses, setWrongGuesses] = useState({});
  const [currentGuess, setCurrentGuess] = useState({});
  const [attemptsLeft, setAttemptsLeft] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [learnedGroups, setLearnedGroups] = useState([]);
  const [flashcardGroups, setFlashcardGroups] = useState([]);
  const [totalErrors, setTotalErrors] = useState(0);

  useEffect(() => {
    const storedLearnedGroups = localStorage.getItem('learned-american');
    const storedFlashcardGroups = localStorage.getItem('flashcard-american');
    if (storedLearnedGroups) {
      setLearnedGroups(JSON.parse(storedLearnedGroups));
    }
    if (storedFlashcardGroups) {
      setFlashcardGroups(JSON.parse(storedFlashcardGroups));
    }
    const storedData = localStorage.getItem('hangman-american');
    if (!storedData) {
      localStorage.setItem('hangman-american', JSON.stringify(data));
    }
    const parsedData = JSON.parse(localStorage.getItem('hangman-american'));
    setItems(parsedData);

    const initialGuesses = parsedData.reduce((acc, group, groupIndex) => {
      group.forEach((item, itemIndex) => {
        acc[`${groupIndex}-${itemIndex}`] = '_'.repeat(item.text2.length);
      });
      return acc;
    }, {});

    const initialWrongGuesses = parsedData.reduce((acc, group, groupIndex) => {
      group.forEach((item, itemIndex) => {
        acc[`${groupIndex}-${itemIndex}`] = [];
      });
      return acc;
    }, {});

    const initialAttemptsLeft = parsedData.reduce((acc, group, groupIndex) => {
      group.forEach((item, itemIndex) => {
        acc[`${groupIndex}-${itemIndex}`] = 8;
      });
      return acc;
    }, {});

    const initialCurrentGuess = parsedData.reduce((acc, group, groupIndex) => {
      group.forEach((item, itemIndex) => {
        acc[`${groupIndex}-${itemIndex}`] = '';
      });
      return acc;
    }, {});

    setGuesses(initialGuesses);
    setWrongGuesses(initialWrongGuesses);
    setAttemptsLeft(initialAttemptsLeft);
    setCurrentGuess(initialCurrentGuess);
  }, []);

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleGuess = (groupIndex, itemIndex) => {
    const key = `${groupIndex}-${itemIndex}`;
    const letter = currentGuess[key];
    const currentWord = items[groupIndex][itemIndex].text2.toLowerCase();
    const currentGuessState = guesses[key];
    const currentWrongGuesses = wrongGuesses[key];
    const currentAttempts = attemptsLeft[key];

    if (currentAttempts > 0) {
      if (currentWord.includes(letter.toLowerCase())) {
        let updatedGuess = '';
        for (let i = 0; i < currentWord.length; i++) {
          if (currentWord[i] === letter.toLowerCase()) {
            updatedGuess += currentWord[i];
          } else {
            updatedGuess += currentGuessState[i];
          }
        }
        setGuesses((prev) => ({
          ...prev,
          [key]: updatedGuess,
        }));

        if (!updatedGuess.includes('_')) {
          setItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems[groupIndex] = updatedItems[groupIndex].map((item) => ({
              ...item,
              score: item.score + 25,
            }));
            return updatedItems;
          });
        }
      } else if (!currentWrongGuesses.includes(letter.toLowerCase())) {
        setWrongGuesses((prev) => ({
          ...prev,
          [key]: [...prev[key], letter.toLowerCase()],
        }));
        setAttemptsLeft((prev) => ({
          ...prev,
          [key]: prev[key] - 1,
        }));

        if (currentAttempts - 1 === 0) {
          setTotalErrors((prev) => prev + 1);
          if (totalErrors + 1 >= 16) {
            // alert('O‘yin tugadi! Juda ko‘p xato.');
            setGameStarted(false);
          }
        }

        if (currentAttempts - 1 === 0) {
          setItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems[groupIndex] = updatedItems[groupIndex].map((item) => ({
              ...item,
              score: item.score - 25,
            }));
            return updatedItems;
          });
        }
      }

      setCurrentGuess((prev) => ({
        ...prev,
        [key]: '',
      }));
    }
  };

  const handleSubmit = (e, groupIndex, itemIndex) => {
    e.preventDefault();
    handleGuess(groupIndex, itemIndex);
  };

  const formatGuess = (guess) => {
    return guess.split('').join(' ');
  };

  const handleVoiceInput = (groupIndex, itemIndex) => {
    const key = `${groupIndex}-${itemIndex}`;
    const currentWord = items[groupIndex][itemIndex].text2.toLowerCase();

    if (!('webkitSpeechRecognition' in window)) {
      alert('Sizning brauzeringiz ovozli kirishni qo‘llab-quvvatlamaydi.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.start();
    recognition.onresult = (event) => {
      const spokenWord = event.results[0][0].transcript.toLowerCase();

      if (spokenWord === currentWord) {
        setGuesses((prev) => ({
          ...prev,
          [key]: currentWord,
        }));

        setItems((prevItems) => {
          const updatedItems = [...prevItems];
          updatedItems[groupIndex] = updatedItems[groupIndex].map((item) => ({
            ...item,
            score: item.score + 25,
          }));
          return updatedItems;
        });
      } else {
        setWrongGuesses((prev) => ({
          ...prev,
          [key]: [...prev[key], spokenWord],
        }));
        setAttemptsLeft((prev) => ({
          ...prev,
          [key]: prev[key] - 1,
        }));

        if (attemptsLeft[key] - 1 === 0) {
          setTotalErrors((prev) => prev + 1);
          if (totalErrors + 1 >= 16) {
            // alert('O‘yin tugadi! Juda ko‘p xato.');
            setGameStarted(false);
          }
        }

        if (attemptsLeft[key] - 1 === 0) {
          setItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems[groupIndex] = updatedItems[groupIndex].map((item) => ({
              ...item,
              score: item.score - 25,
            }));
            return updatedItems;
          });
        }
      }
    };

    recognition.onerror = () => {
      // alert('Ovoz tanib olishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
    };
  };


  const handleStartGame = () => {
    const initialGuesses = items.reduce((acc, group, groupIndex) => {
      group.forEach((item, itemIndex) => {
        acc[`${groupIndex}-${itemIndex}`] = '_'.repeat(item.text2.length);
      });
      return acc;
    }, {});

    const initialWrongGuesses = items.reduce((acc, group, groupIndex) => {
      group.forEach((item, itemIndex) => {
        acc[`${groupIndex}-${itemIndex}`] = [];
      });
      return acc;
    }, {});

    const initialAttemptsLeft = items.reduce((acc, group, groupIndex) => {
      group.forEach((item, itemIndex) => {
        acc[`${groupIndex}-${itemIndex}`] = 8;
      });
      return acc;
    }, {});

    const initialCurrentGuess = items.reduce((acc, group, groupIndex) => {
      group.forEach((item, itemIndex) => {
        acc[`${groupIndex}-${itemIndex}`] = '';
      });
      return acc;
    }, {});

    setGuesses(initialGuesses);
    setWrongGuesses(initialWrongGuesses);
    setAttemptsLeft(initialAttemptsLeft);
    setCurrentGuess(initialCurrentGuess);
    setCurrentGroupIndex(0);
    setGameStarted(true);
    setTotalErrors(0)
  };

  const handleNextGroup = () => {
    if (currentGroupIndex < items.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    } else {
      setGameStarted(false);
    }

    const completedGroup = items[currentGroupIndex].find((item) => item.score === 100);
    const netCompletedGroup = items[currentGroupIndex].find((item) => item.score === -100);
    if (completedGroup) {
      const updatedItems = items.filter((_, index) => index !== currentGroupIndex);
      setItems(updatedItems);

      const newLearnedGroups = [...learnedGroups, [items[currentGroupIndex][0]]];
      setLearnedGroups(newLearnedGroups);

      localStorage.setItem('learned-american', JSON.stringify(newLearnedGroups));
      localStorage.setItem('hangman-american', JSON.stringify(updatedItems));

      if (currentGroupIndex < updatedItems.length) {
        const initialGuesses = items.reduce((acc, group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            acc[`${groupIndex}-${itemIndex}`] = '_'.repeat(item.text2.length);
          });
          return acc;
        }, {});

        const initialWrongGuesses = items.reduce((acc, group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            acc[`${groupIndex}-${itemIndex}`] = [];
          });
          return acc;
        }, {});

        const initialAttemptsLeft = items.reduce((acc, group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            acc[`${groupIndex}-${itemIndex}`] = 8;
          });
          return acc;
        }, {});

        const initialCurrentGuess = items.reduce((acc, group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            acc[`${groupIndex}-${itemIndex}`] = '';
          });
          return acc;
        }, {});

        setCurrentGroupIndex(currentGroupIndex);
        setGuesses(initialGuesses);
        setWrongGuesses(initialWrongGuesses);
        setAttemptsLeft(initialAttemptsLeft);
        setCurrentGuess(initialCurrentGuess);
      }
    }
    if (netCompletedGroup) {
      const updatedItems = items.filter((_, index) => index !== currentGroupIndex);
      setItems(updatedItems);

      const newFlashcardGroups = [...flashcardGroups, items[currentGroupIndex]];
      setFlashcardGroups(newFlashcardGroups);

      localStorage.setItem('flashcard-american', JSON.stringify(newFlashcardGroups));
      localStorage.setItem('hangman-american', JSON.stringify(updatedItems));

      if (currentGroupIndex < updatedItems.length) {
        const initialGuesses = items.reduce((acc, group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            acc[`${groupIndex}-${itemIndex}`] = '_'.repeat(item.text2.length);
          });
          return acc;
        }, {});

        const initialWrongGuesses = items.reduce((acc, group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            acc[`${groupIndex}-${itemIndex}`] = [];
          });
          return acc;
        }, {});

        const initialAttemptsLeft = items.reduce((acc, group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            acc[`${groupIndex}-${itemIndex}`] = 8;
          });
          return acc;
        }, {});

        const initialCurrentGuess = items.reduce((acc, group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            acc[`${groupIndex}-${itemIndex}`] = '';
          });
          return acc;
        }, {});

        setCurrentGroupIndex(currentGroupIndex);
        setGuesses(initialGuesses);
        setWrongGuesses(initialWrongGuesses);
        setAttemptsLeft(initialAttemptsLeft);
        setCurrentGuess(initialCurrentGuess);
      }
    }

    if (!completedGroup && !netCompletedGroup) {
      localStorage.setItem('hangman-american', JSON.stringify(items));
    }
  };

  const handleCloseGame = () => {
    setGameStarted(false);

    const completedGroup = items[currentGroupIndex].find((item) => item.score === 100);
    const netCompletedGroup = items[currentGroupIndex].find((item) => item.score === -100);

    if (completedGroup) {
      const updatedItems = items.filter((_, index) => index !== currentGroupIndex);
      setItems(updatedItems);

      const newLearnedGroups = [...learnedGroups, [items[currentGroupIndex][0]]];
      setLearnedGroups(newLearnedGroups);
      localStorage.setItem('learned-american', JSON.stringify(newLearnedGroups));

      localStorage.setItem('hangman-american', JSON.stringify(updatedItems));
    }

    if (netCompletedGroup) {
      const updatedItems = items.filter((_, index) => index !== currentGroupIndex);
      setItems(updatedItems);

      const newFlashcardGroups = [...flashcardGroups, items[currentGroupIndex]];
      setFlashcardGroups(newFlashcardGroups);
      localStorage.setItem('flashcard-american', JSON.stringify(newFlashcardGroups));

      localStorage.setItem('hangman-american', JSON.stringify(updatedItems));
    }

    if (!completedGroup && !netCompletedGroup) {
      localStorage.setItem('hangman-american', JSON.stringify(items));
    }
  };

  const getDisplayIndex = () => {
    const storedData = JSON.parse(localStorage.getItem('hangman-american'));
    const score = storedData[currentGroupIndex]?.[0]?.score || 0;

    if (score === 0) return 0;
    if (score === 25 || score === -25) return 1;
    if (score === 50 || score === -50) return 2;
    if (score === 75 || score === -75) return 3;

    return 0;
  };


  return (
    <main className='hangman'>
      {items.length === 0 ? (
        <p style={{ color: 'red', textAlign: 'center' }}>Hozircha hech qanday guruh mavjud emas.</p>
      ) : !gameStarted ? (
        <button onClick={handleStartGame}>Hangman O'yinini O'ynash</button>
      ) : (
        <>
          <div className='card' key={currentGroupIndex}>
            <h2>Lug'at {currentGroupIndex + 1}</h2>
            <ul>
              {items[currentGroupIndex].map((item, itemIndex) => {
                const displayIndex = getDisplayIndex();
                if (itemIndex !== displayIndex) return null;

                const key = `${currentGroupIndex}-${itemIndex}`;
                const isGameOver = attemptsLeft[key] === 0;
                const isGameWon = !guesses[key].includes('_');
                return (
                  <li
                    key={itemIndex}
                    style={{ border: '1px solid black', padding: '10px', margin: '5px' }}
                  >
                    {itemIndex === 2 ? (
                      <>
                        <p>{item.text1}</p>

                        {!isGameOver ? (
                          <p className='hangman-voice'>
                            <span>
                            {guesses[key]}
                            </span>
                            <button
                              onClick={() => handleVoiceInput(currentGroupIndex, itemIndex)}
                              style={{ display: isGameOver || isGameWon ? 'none' : 'inline-block' }}
                            >
                              🎤 Gapiring
                            </button>
                          </p>
                        ) : (
                          <p>
                            
                            <span>{item.text2}</span>
                            
                            <button
                              onClick={() => handleVoiceInput(currentGroupIndex, itemIndex)}
                              style={{ display: isGameOver || isGameWon ? 'none' : 'inline-block' }}
                              disabled={isGameOver || isGameWon}
                            >
                              🎤 Gapiring
                            </button>
                          </p>
                        )}
                        <p className='hangman-learned'>O'rganildi: {item.score}%</p>
                        <p>Qolgan imkoniyatlar: {attemptsLeft[key]}</p>
                        <p>Xatolar: {totalErrors}</p>
                        {isGameOver && <p>Xato qildingiz!</p>}
                        {isGameWon && <p>To'g'ri topdingiz!</p>}
                      </>
                    ) : (
                      <>
                        <p>
                          {itemIndex === 3 ? (
                            <>
                              <button style={{display: 'inline'}} onClick={() => speakText(item.text1)}>Play</button>
                              <span> ni bosib eshting. Eshtib bo'lgach tarjimasini yozing.</span>
                            </>
                          ) : (
                            <>{item.text1} ning tarjimasi nima?</>
                          )}
                        </p>
                        {!isGameOver ? (
                          <p>{formatGuess(guesses[key])}</p>
                        ) : (
                          <p>{item.text2}</p>
                        )}
                        {!isGameOver && !isGameWon && (
                          <form onSubmit={(e) => handleSubmit(e, currentGroupIndex, itemIndex)}>
                            <input
                              type="text"
                              maxLength="1"
                              value={currentGuess[key] || ''}
                              onChange={(e) =>
                                setCurrentGuess((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                            />
                            <button type="submit">Yuborish</button>
                          </form>
                        )}
                        {isGameOver && <p>Xato qildingiz!</p>}
                        {isGameWon && <p>To'g'ri topdingiz!</p>}
                        <p>O'rganildi: {item.score}%</p>
                        <p>
                          Xato harflar: {wrongGuesses[key].join(', ') || 'Yo‘q'}
                        </p>
                        <p>Qolgan imkoniyatlar: {attemptsLeft[key]}ta</p>
                        <p>Xatolar: {totalErrors}/16</p>
                      </>
                    )}
                    <div className="hangmang-buttons">
                      <button onClick={handleNextGroup}
                        disabled={!isGameWon && !isGameOver}
                      >Next</button>
                      <button onClick={handleCloseGame}>Close</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </main>
  );


}

export default Hangman;
