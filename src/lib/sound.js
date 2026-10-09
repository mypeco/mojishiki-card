// 効果音(Web Audio。音の ファイルは 持たない)
// ★まちがいの 音は「下がる 音」に しない。やわらかい 単音に とどめる
//   (gakushu-ui-kit a11y/README.md「聴覚」)。
class SoundService {
  constructor() { this.ctx = null }

  _resume() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) this.ctx = new AC()
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  _note(freq, startTime, duration, volume = 0.08) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, startTime)
    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(startTime); osc.stop(startTime + duration)
  }

  tap() {
    const ctx = this._resume(); if (!ctx) return
    this._note(400, ctx.currentTime, 0.05, 0.06)
  }

  correct() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    this._note(660, t, 0.3)
    this._note(1320, t + 0.1, 0.4)
  }

  // まちがい・もうひといき: 低めの やわらかい 単音 1つ
  soft() {
    const ctx = this._resume(); if (!ctx) return
    this._note(330, ctx.currentTime, 0.18, 0.05)
  }

  finish() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    ;[523, 659, 784, 1047].forEach((f, i) => this._note(f, t + i * 0.12, i === 3 ? 0.4 : 0.15))
  }
}

export const sound = new SoundService()
