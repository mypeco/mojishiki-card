import { useState, useEffect } from 'react'
import {
  getUsers, createUser, deleteUser, getUserData, saveUserData,
  getDevice, setDevice, badgeKey, migrateFromIndexedDB,
} from './store.js'
import { getUnit, getLevel } from './units/index.js'
import { ProfileScreen } from './components/ProfileScreen.jsx'
import { HomeScreen } from './components/HomeScreen.jsx'
import { UnitScreen } from './components/UnitScreen.jsx'
import { GameScreen } from './components/GameScreen.jsx'
import { ResultScreen } from './components/ResultScreen.jsx'
import { RecordScreen } from './components/RecordScreen.jsx'
import { SettingsSheet } from './components/SettingsSheet.jsx'

// 画面: PROFILE(あなたの おなまえは？)→ HOME(単元)→ UNIT(レベル)→ GAME → RESULT
//       HOME から RECORD(きろく)・せってい
export default function App() {
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState('PROFILE')
  const [users, setUsers] = useState([])
  const [user, setUser] = useState(null)
  const [data, setData] = useState(null)
  const [device, setDeviceState] = useState(getDevice)
  const [unitId, setUnitId] = useState(null)
  const [config, setConfig] = useState(null) // { unit, level, modeType, retryList, sourceId, key }
  const [result, setResult] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    migrateFromIndexedDB().finally(() => { setUsers([...getUsers()]); setReady(true) })
  }, [])

  // うごきの 設定を html に 反映する(index.css の .no-motion)
  useEffect(() => {
    document.documentElement.classList.toggle('no-motion', !device.motion)
  }, [device.motion])

  const updateDevice = (patch) => {
    setDevice(patch)
    setDeviceState(getDevice())
  }

  const updateData = (fn) => {
    setData(prev => {
      const next = fn(prev)
      saveUserData(user.id, next)
      return next
    })
  }

  const selectUser = (u) => {
    setUser(u)
    setData(getUserData(u.id))
    setScreen('HOME')
  }

  const startLevel = (unit, level, retryList = null, sourceId = null) => {
    setConfig({ unit, level, modeType: data.modeType, retryList, sourceId, key: Date.now() })
    if (!retryList) updateData(d => ({ ...d, last: { unit, level } }))
    setScreen('GAME')
  }

  const handleFinish = (res) => {
    const accuracy = Math.round((res.firstTry / res.total) * 100)
    const base = { ...res, modeType: config.modeType, accuracy, isRetry: !!config.retryList }
    // 解き直しは きろくを ふやさず、もとの きろくに「→100」の しるしを つける
    if (config.retryList) {
      if (config.sourceId != null) {
        updateData(d => ({ ...d, history: d.history.map(h => (h.id === config.sourceId ? { ...h, retried: true } : h)) }))
      }
      setResult({ ...base, stamp: null, prev: null })
      setScreen('RESULT')
      return
    }
    let stamp = '👍'
    if (config.modeType === 'flash') stamp = '⚡'
    else if (accuracy === 100) stamp = '💮'
    else if (accuracy >= 80) stamp = '🎉'
    const prev = [...data.history].reverse().find(h => h.unit === config.unit && h.level === config.level && h.modeType === config.modeType) ?? null
    const rec = {
      id: `r_${Date.now().toString(36)}`, date: Date.now(),
      unit: config.unit, level: config.level, modeType: config.modeType,
      timeStr: (res.timeMs / 1000).toFixed(1), accuracy, stamp,
      firstTry: res.firstTry, total: res.total,
    }
    const key = badgeKey(config.unit, config.level)
    updateData(d => ({
      ...d,
      history: [...d.history, rec],
      // テンキーで ぜんぶ 1かいめで せいかい なら 💮
      badges: config.modeType === 'tenkey' && accuracy === 100 ? { ...d.badges, [key]: '💮' } : d.badges,
    }))
    setResult({ ...base, stamp, prev, recId: rec.id })
    setScreen('RESULT')
  }

  const deleteRecord = (id) => {
    if (!confirm('この きろくを けしますか？')) return
    updateData(d => ({ ...d, history: d.history.filter(h => h.id !== id) }))
  }

  const deleteAllRecords = () => {
    if (!confirm(`${user.name} さんの きろくを ぜんぶ けしますか？\nもとに もどせません。`)) return
    updateData(d => ({ ...d, history: [], badges: {} }))
  }

  if (!ready) return <div className="h-[100dvh] bg-cream" />

  const unit = unitId && getUnit(unitId)
  const gameUnit = config && getUnit(config.unit)
  const gameLevel = config && getLevel(gameUnit, config.level)

  let body = null
  if (screen === 'PROFILE' || !user) {
    body = (
      <ProfileScreen users={users}
        onSelect={selectUser}
        onCreate={(fields) => { const u = createUser(fields); setUsers([...getUsers()]); selectUser(u) }}
        onDelete={(id) => { deleteUser(id); setUsers([...getUsers()]) }} />
    )
  } else if (screen === 'HOME') {
    body = (
      <HomeScreen user={user} data={data}
        onOpenUnit={(id) => { setUnitId(id); setScreen('UNIT') }}
        onStart={(u, l) => { setUnitId(u); startLevel(u, l) }}
        onOpenRecord={() => setScreen('RECORD')}
        onOpenSettings={() => setShowSettings(true)}
        onSwitchUser={() => { setUsers([...getUsers()]); setScreen('PROFILE') }} />
    )
  } else if (screen === 'UNIT' && unit) {
    body = (
      <UnitScreen unit={unit} data={data}
        onBack={() => setScreen('HOME')}
        onStart={startLevel}
        onChangeMode={(m) => updateData(d => ({ ...d, modeType: m }))} />
    )
  } else if (screen === 'GAME' && config) {
    body = (
      <GameScreen key={config.key} unit={gameUnit} level={gameLevel} config={config} device={device}
        onExit={() => setScreen('UNIT')}
        onFinish={handleFinish} />
    )
  } else if (screen === 'RESULT' && result) {
    const sourceId = config.retryList ? config.sourceId : result.recId
    body = (
      <ResultScreen unit={gameUnit} level={gameLevel} result={result} prev={result.prev} device={device}
        onRetry={() => startLevel(config.unit, config.level)}
        onRetryWrong={() => startLevel(config.unit, config.level, result.wrongList, sourceId)}
        onBack={() => setScreen('UNIT')} />
    )
  } else if (screen === 'RECORD') {
    body = (
      <RecordScreen user={user} data={data}
        onBack={() => setScreen('HOME')}
        onDelete={deleteRecord}
        onDeleteAll={deleteAllRecords} />
    )
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-cream text-ink">
      {body}
      {showSettings && <SettingsSheet device={device} onChange={updateDevice} onClose={() => setShowSettings(false)} />}
    </div>
  )
}
