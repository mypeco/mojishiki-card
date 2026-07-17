import Dexie from 'dexie'

export const db = new Dexie('MojiShikiCardDB')
db.version(1).stores({
  users:        '++id, profileId',
  userSettings: '++id, &userId',
  history:      '++id, userId, date',
  badges:       '++id, userId, [userId+level]',
})

const DEFAULT_SETTINGS = { isSoundEnabled: true, modeType: 'tenkey' }

export async function getUserSettings(userId) {
  const rec = await db.userSettings.where({ userId }).first()
  return rec ? { ...DEFAULT_SETTINGS, ...rec.data } : { ...DEFAULT_SETTINGS }
}

export async function saveUserSettings(userId, data) {
  const existing = await db.userSettings.where({ userId }).first()
  if (existing) await db.userSettings.update(existing.id, { data })
  else await db.userSettings.add({ userId, data })
}

export async function getHistory(userId) {
  return db.history.where({ userId }).sortBy('date')
}

export async function addHistoryRecord(userId, record) {
  return db.history.add({ userId, ...record })
}

export async function deleteHistoryRecord(id) {
  return db.history.delete(id)
}

export async function clearHistoryByUser(userId) {
  return db.history.where({ userId }).delete()
}

export async function getBadges(userId) {
  return db.badges.where({ userId }).toArray()
}

export async function saveBadge(userId, level, stamp) {
  const existing = await db.badges.where('[userId+level]').equals([userId, level]).first()
  if (existing) await db.badges.update(existing.id, { stamp, earnedAt: Date.now() })
  else await db.badges.add({ userId, level, stamp, earnedAt: Date.now() })
}

export async function clearBadgesByUser(userId) {
  return db.badges.where({ userId }).delete()
}

export async function deleteUserData(userId) {
  await db.users.delete(userId)
  await db.userSettings.where({ userId }).delete()
  await db.history.where({ userId }).delete()
  await db.badges.where({ userId }).delete()
}
