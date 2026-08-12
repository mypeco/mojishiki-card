import { useState } from 'react'
import {
  db, getUserSettings, saveUserSettings,
  getHistory, addHistoryRecord, updateHistoryRecord, deleteHistoryRecord, clearHistoryByUser,
  getBadges, saveBadge, clearBadgesByUser,
} from './db.js'
import { QUESTION_COUNT } from './data.js'
import { ProfileSelect } from './components/ProfileSelect.jsx'
import { LevelSelect } from './components/LevelSelect.jsx'
import { GameScreen } from './components/GameScreen.jsx'
import { ResultScreen } from './components/ResultScreen.jsx'
import { RecordPage } from './components/RecordPage.jsx'

export default function App() {
  const [screen, setScreen] = useState('PROFILE')
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState({ isSoundEnabled: true, modeType: 'tenkey' })
  const [history, setHistory] = useState([])
  const [badges, setBadges] = useState({})
  const [config, setConfig] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  const handleSelectUser = async (selectedUser) => {
    const [s, hist, bdgs] = await Promise.all([
      getUserSettings(selectedUser.id),
      getHistory(selectedUser.id),
      getBadges(selectedUser.id),
    ])
    const badgeMap = {}
    bdgs.forEach(b => { badgeMap[b.level] = b.stamp })
    setUser(selectedUser)
    setSettings(s)
    setHistory(hist)
    setBadges(badgeMap)
    setScreen('LEVELS')
  }

  const handleUpdateSettings = async (newSettings) => {
    setSettings(newSettings)
    if (user) await saveUserSettings(user.id, newSettings)
  }

  const startLevel = (level, retryList = null, sourceId = null) => {
    setConfig({ level, modeType: settings.modeType ?? 'tenkey', count: QUESTION_COUNT, retryList, sourceId })
    setScreen('GAME')
  }

  const handleFinish = async (res) => {
    const accuracy = Math.max(0, Math.round(((res.total - res.mistakeCount) / res.total) * 100))
    // 解き直しは記録を追加せず、元の記録に「→100」の印を付けるだけ
    if (config.retryList) {
      if (config.sourceId != null) {
        await updateHistoryRecord(config.sourceId, { retried: true })
        setHistory(prev => prev.map(h => h.id === config.sourceId ? { ...h, retried: true } : h))
      }
      setLastResult({ ...res, accuracy })
      setScreen('RESULT')
      return
    }
    let stamp = '👍'
    if (config.modeType === 'flash') stamp = '⚡'
    else if (accuracy === 100) stamp = '💮'
    else if (accuracy >= 80) stamp = '🎉'
    const rec = {
      id: Date.now(), date: Date.now(),
      level: config.level, modeType: config.modeType,
      timeStr: (res.timeMs / 1000).toFixed(1),
      accuracy, stamp,
      wrongList: res.wrongList,
    }
    await addHistoryRecord(user.id, rec)
    setHistory(prev => [...prev, rec])
    // 通常出題のテンキーで100%ならバッジ獲得
    if (config.modeType === 'tenkey' && accuracy === 100 && !badges[config.level]) {
      await saveBadge(user.id, config.level, '💮')
      setBadges(prev => ({ ...prev, [config.level]: '💮' }))
    }
    setLastResult({ ...res, ...rec })
    setScreen('RESULT')
  }

  const handleDeleteRecord = async (id) => {
    if (!confirm('この記録を削除しますか？')) return
    await deleteHistoryRecord(id)
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  const handleDeleteAll = async () => {
    if (!confirm('全部の記録を削除しますか？')) return
    await clearHistoryByUser(user.id)
    await clearBadgesByUser(user.id)
    setHistory([])
    setBadges({})
  }

  const counts = {}
  for (const h of history) {
    counts[h.level] = (counts[h.level] ?? 0) + 1
  }

  const wrapper = (children) => (
    <div style={{ width: '100vw', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white', position: 'relative' }}>
      {children}
    </div>
  )

  if (screen === 'PROFILE') return wrapper(
    <ProfileSelect db={db} onSelect={handleSelectUser} />
  )

  if (screen === 'LEVELS') return wrapper(
    <LevelSelect
      user={user}
      settings={settings}
      onUpdateSettings={handleUpdateSettings}
      badges={badges}
      counts={counts}
      onStart={startLevel}
      onOpenRecord={() => setScreen('RECORD')}
      onBack={() => setScreen('PROFILE')}
    />
  )

  if (screen === 'RECORD') return wrapper(
    <RecordPage
      user={user}
      history={history}
      badges={badges}
      onDelete={handleDeleteRecord}
      onDeleteAll={handleDeleteAll}
      onBack={() => setScreen('LEVELS')}
    />
  )

  if (screen === 'GAME') return wrapper(
    <GameScreen
      key={Date.now()}
      config={config}
      settings={settings}
      onExit={() => setScreen('LEVELS')}
      onFinish={handleFinish}
    />
  )

  if (screen === 'RESULT' && lastResult) return wrapper(
    <ResultScreen
      result={lastResult}
      modeType={config.modeType}
      settings={settings}
      onRetry={() => startLevel(config.level)}
      onHome={() => setScreen('LEVELS')}
      onRetryChallenge={
        lastResult.wrongList?.length > 0
          ? () => {
              const uniq = []
              const seen = new Set()
              for (const w of lastResult.wrongList) {
                if (!seen.has(w.text)) { seen.add(w.text); uniq.push(w) }
              }
              // 解き直しの解き直しでも、印を付ける先は元の記録のまま
              startLevel(config.level, uniq, config.retryList ? config.sourceId : lastResult.id)
            }
          : null
      }
    />
  )

  return null
}
