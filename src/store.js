// ── 保存(gakushu-ui-kit patterns/accounts.md に そって)──────────
// ★サーバーも ログインも 持たない。端末の localStorage に 閉じる。
// ★キーには 必ず APP_ID の 接頭辞を つける(mypeco.github.io には ほかの アプリも ある)。
// 「人ごと」(きろく・バッジ・答え方)と「端末」(効果音・うごき)を 別の キーに 分ける。
//   効果音・うごきは その場の 事情(まわりの 音・端末の 設定)で きめる ものなので 端末に 持つ。

export const APP_ID = 'keisan_card'

function makeStore(key, fallback) {
  return {
    d: null,
    load() {
      try { this.d = JSON.parse(localStorage.getItem(key) || 'null') } catch (_) { this.d = null }
      if (this.d == null) this.d = fallback()
    },
    save() { try { localStorage.setItem(key, JSON.stringify(this.d)) } catch (_) { /* 容量・プライベートモード */ } },
  }
}

export const deviceStore = makeStore(`${APP_ID}_settings`, () => ({})) // 端末の 設定(効果音・うごき)
export const usersStore = makeStore(`${APP_ID}_users`, () => [])        // [{ id, name, icon, color }]
export const dataStore = makeStore(`${APP_ID}_data`, () => ({}))        // { [userId]: 人ごとの データ }
deviceStore.load(); usersStore.load(); dataStore.load()

// ── アカウントの 決めごと(patterns/accounts-ui.md から そのまま)──
export const ICON_OPTIONS = ['🦊', '🐶', '🐱', '🐰', '🐻', '🐼', '🦁', '🐯', '🐸', '🐧', '🦄', '🐢', '⚽', '🚀', '🎨', '🌟']
export const COLOR_OPTIONS = [
  { key: 'cta',       label: 'あお',     ring: 'border-cta-400',       tile: 'bg-cta-100 text-cta-700',             bborder: 'border-b-cta-500',       dot: 'bg-cta-100' },
  { key: 'success',   label: 'みどり',   ring: 'border-success-400',   tile: 'bg-success-100 text-success-700',     bborder: 'border-b-success-500',   dot: 'bg-success-100' },
  { key: 'highlight', label: 'きいろ',   ring: 'border-highlight-400', tile: 'bg-highlight-100 text-highlight-700', bborder: 'border-b-highlight-500', dot: 'bg-highlight-100' },
  { key: 'rmark',     label: 'ちゃいろ', ring: 'border-rmark-400',     tile: 'bg-rmark-100 text-rmark-600',         bborder: 'border-b-rmark-500',     dot: 'bg-rmark-100' },
  { key: 'lblend',    label: 'むらさき', ring: 'border-lblend-400',    tile: 'bg-lblend-100 text-lblend-700',       bborder: 'border-b-lblend-500',    dot: 'bg-lblend-100' },
  { key: 'sblend',    label: 'みずいろ', ring: 'border-sblend-400',    tile: 'bg-sblend-100 text-sblend-600',       bborder: 'border-b-sblend-500',    dot: 'bg-sblend-100' },
]
export const MAX_USERS = 3 // ★人数の 上限(accounts.md §3)。1端末・きょうだいで 使う ことを 想定
export const colorOf = (key) => COLOR_OPTIONS.find(c => c.key === key) || COLOR_OPTIONS[0]

// きろくは 1人 300件まで(accounts.md §6)。1日 3回 あそんでも 3か月ぶん のこる。
// まちがえた 問題(解き直し用)は その場だけで 使うので 保存しない。
const MAX_RECORDS = 300

const emptyData = () => ({ history: [], badges: {}, modeType: 'tenkey', last: null })

// ── 端末の 設定 ─────────────────────────────────────────────
// うごき: はじめは 端末の prefers-reduced-motion に したがい、一度 ボタンを 押したら その選択を 覚える
export const getDevice = () => ({
  sound: deviceStore.d.sound ?? true,
  motion: deviceStore.d.motion ?? !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
})
export const setDevice = (patch) => {
  Object.assign(deviceStore.d, patch)
  deviceStore.save()
}

// ── つかう人 ─────────────────────────────────────────────────
export const getUsers = () => usersStore.d

export const createUser = ({ name, icon, color }) => {
  const u = { id: 'u_' + Date.now().toString(36), name, icon, color }
  usersStore.d.push(u)
  usersStore.save()
  return u
}

export const deleteUser = (id) => {
  usersStore.d = usersStore.d.filter(u => u.id !== id)
  usersStore.save()
  delete dataStore.d[id]
  dataStore.save()
}

// ── 人ごとの データ ────────────────────────────────────────────
export const getUserData = (id) => ({ ...emptyData(), ...(dataStore.d[id] ?? {}) })

export const saveUserData = (id, data) => {
  const history = data.history.length > MAX_RECORDS ? data.history.slice(-MAX_RECORDS) : data.history
  dataStore.d[id] = { ...data, history }
  dataStore.save()
}

export const badgeKey = (unit, level) => `${unit}:${level}`

// ── 前の アプリ(IndexedDB)からの 引きこし ───────────────────────
// 「文字式カード」(MojiShikiCardDB)と「小数カード」(ShosuCardDB)の
// プロフィール・きろく・バッジを 1回だけ 写す。
// ★もとの データベースは 消さない(読むだけ)。写しそこねても あとから 取りだせる。
// 同じ なまえの 人は 1人に まとめる。

const MIGRATED_KEY = `${APP_ID}_migrated`

// 前の アプリの いろ → キットの 色トークン
const OLD_COLOR = { indigo: 'cta', violet: 'lblend', blue: 'sblend', green: 'success', rose: 'rmark', amber: 'highlight', teal: 'sblend', cyan: 'cta' }

const SOURCES = [
  // 文字式カードの レベル: 8 が ミックス、9・10 は 7 の あと
  { db: 'MojiShikiCardDB', unit: 'moji', level: (l) => ({ 8: 'mix', 9: 8, 10: 9 }[l] ?? l) },
  { db: 'ShosuCardDB', unit: 'shosu', level: (l) => (l === 11 ? 'mix' : l) },
]

export async function migrateFromIndexedDB() {
  if (localStorage.getItem(MIGRATED_KEY)) return
  try {
    const { default: Dexie } = await import('dexie')
    let soundSet = false
    for (const src of SOURCES) {
      if (!(await Dexie.exists(src.db))) continue
      const db = new Dexie(src.db)
      await db.open()
      const [users, settings, history, badges] = await Promise.all(
        ['users', 'userSettings', 'history', 'badges'].map(t => db.table(t).toArray()))
      db.close()

      for (const old of users) {
        const name = (old.name ?? '').trim()
        if (!name) continue
        let u = usersStore.d.find(x => x.name === name)
        if (!u) {
          u = { id: `u_${Date.now().toString(36)}${usersStore.d.length}`, name, icon: old.icon || ICON_OPTIONS[0], color: OLD_COLOR[old.color?.label] ?? 'cta' }
          usersStore.d.push(u)
        }
        const d = getUserData(u.id)
        const s = settings.find(x => x.userId === old.id)?.data
        if (s?.modeType && src.unit === 'moji') d.modeType = s.modeType
        if (s && !soundSet && s.isSoundEnabled === false) { setDevice({ sound: false }); soundSet = true }
        for (const h of history) {
          if (h.userId !== old.id || h.isRetry) continue
          const id = `${src.unit}_${h.id}`
          if (d.history.some(x => x.id === id)) continue // とちゅうで 止まった あとの やりなおしでも 二重に しない
          d.history.push({
            id, date: h.date, unit: src.unit, level: src.level(h.level),
            modeType: h.modeType, timeStr: h.timeStr, accuracy: h.accuracy, stamp: h.stamp,
            ...(h.retried ? { retried: true } : {}),
          })
        }
        for (const b of badges) {
          if (b.userId === old.id) d.badges[badgeKey(src.unit, src.level(b.level))] = b.stamp
        }
        d.history.sort((a, b) => a.date - b.date)
        saveUserData(u.id, d)
      }
    }
    usersStore.save()
    try { localStorage.setItem(MIGRATED_KEY, '1') } catch (_) { /* */ }
  } catch (e) {
    // 写せなくても アプリは 使える。もとの データは のこって いるので、つぎに 開いた ときに また ためす
    console.warn('前の アプリの きろくを 写せませんでした', e)
  }
}
