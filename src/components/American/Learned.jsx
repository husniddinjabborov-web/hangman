import { useState, useEffect } from 'react';
import '../../styled/Learned.scss';

function Learned() {
  const [learnedGroups, setLearnedGroups] = useState([]);
  const [filterDegree, setFilterDegree] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    const storedLearnedGroups = JSON.parse(localStorage.getItem('learned-american')) || [];
    setLearnedGroups(storedLearnedGroups);
  }, []);

  const handleFilterChange = (degree) => {
    setFilterDegree(degree);
    setSelectedLevel(degree);
  };

  const filteredGroups = learnedGroups.map((group) =>
    group.filter((item) => filterDegree === 'All' || item.degree === filterDegree)
  );

  return (
    <div className='learned'>
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
      <main className="card-container">
        {filteredGroups.length === 0 || filteredGroups.every(group => group.length === 0) ? (
          <p>Hozircha bu bo'lim bo'sh.</p>
        ) : (
          filteredGroups.map((group, index) => (
            group.length > 0 && (
              <div className='card' key={index}>
                {group.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <p>{item.text1} - {item.text2}</p>
                  </div>
                ))}
              </div>
            )
          ))
        )}
      </main>
    </div>
  );
}

export default Learned;
