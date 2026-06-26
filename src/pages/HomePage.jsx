import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import InboxSection from '../components/InboxSection'
import MusicSection from '../components/MusicSection'
import WhySection from '../components/WhySection'
import LetterDetail from '../components/LetterDetail'
import { LETTERS, SONGS } from '../data/siteData'
import '../styles/HomePage.css'

const tabs = [
  { id: 'inbox', label: '💌 Inbox', icon: '💌' },
  { id: 'from-you', label: '💜 Your Letters', icon: '💜' },
  { id: 'music', label: '🎵 Music', icon: '🎵' },
  { id: 'why', label: '💝 Why', icon: '💝' },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [letters, setLetters] = useState([])
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLetter, setSelectedLetter] = useState(null)

  useEffect(() => {
    setLetters(LETTERS)
    setSongs(SONGS)
    setLoading(false)
  }, [])

  return (
    <>
      {selectedLetter && (
        <LetterDetail letter={selectedLetter} onBack={() => setSelectedLetter(null)} />
      )}
      <motion.div
        className="home-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
      <div className="home-container">
        <motion.header
          className="home-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>💌 Welcome Home</h1>
          <button
            onClick={() => {
              localStorage.removeItem('authenticated')
              window.location.reload()
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </motion.header>

        <nav className="home-nav">
          {tabs.map((tab, i) => (
            <motion.button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </nav>

        <motion.div
          className="home-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          key={activeTab}
        >
          {!loading ? (
            <>
              {activeTab === 'inbox' && <InboxSection letters={letters} onLetterClick={setSelectedLetter} />}
              {activeTab === 'from-you' && <InboxSection letters={letters} isFromJodi={true} onLetterClick={setSelectedLetter} />}
              {activeTab === 'music' && <MusicSection songs={songs} />}
              {activeTab === 'why' && <WhySection />}
            </>
          ) : (
            <div className="loading">Loading...</div>
          )}
        </motion.div>
      </div>
      </motion.div>
    </>
  )
}
