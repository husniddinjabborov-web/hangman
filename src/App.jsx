import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import American from './components/American';
import British from './components/British';
import Banner from './assets/banner.jpg'
import './App.scss'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <main id="home">
              <article id="content">
                <div id="text">
                  <h1>Hangman</h1>
                  <p>So‘zlarni taxmin qiling va til o‘rganishda yangi bosqichga o‘ting! Hangman sizga lug‘at boyligini oshirishda yordam beradi. O‘yin davomida o‘z bilimlaringizni sinang va yangilang. Bilim olish hech qachon bu qadar zavqli bo‘lmagan!</p>
                  <ul className="actions">
                    <li>
                      <Link to="/american">American English</Link>
                    </li>
                    <li>
                      <Link to="/british">British English</Link>
                    </li>
                  </ul>
                </div>
                <div id="image">
                  <img src={Banner} alt="Hangman Image" />
                </div>
                <nav id='nav'>
                  <a href="https://telegra.ph/Hangman-saytini-ishlatish-qollanmasi-01-21#/">Ishlatish qo'llanmasi</a>
                </nav>
              </article>
            </main>
          </>
        } />
        <Route path="/american/*" element={<American />} />
        <Route path="/british/*" element={<British />} />
      </Routes>
    </Router>
  );
}

export default App;


