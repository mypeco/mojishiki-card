// せってい(端末ごと): 効果音・うごき・ならう 学年
// 音・うごきに 敏感な 子の ために、それぞれ 別に オフに できる(patterns/components.md §9)。
// 学年の しるしは「下の 学年の を やって いる」と 感じる 子も いる ので、出さない ことも できる。
import { Sheet, PrimaryButton, Toggle } from './ui.jsx'
import { SettingsIcon } from './Icons.jsx'

export const SettingsSheet = ({ device, onChange, onClose }) => (
  <Sheet title="せってい" titleIcon={<SettingsIcon className="w-6 h-6 text-ink/70" />} onClose={onClose}
    footer={<PrimaryButton className="w-full" onClick={onClose}>とじる</PrimaryButton>}>
    <div className="divide-y-2 divide-ink/5">
      <Toggle label="こうかおん" note="キーを 押した とき・せいかいの とき などの 音"
        checked={device.sound} onChange={v => onChange({ sound: v })} />
      <Toggle label="うごき" note="カードが ゆれる・出てくる ときの うごき"
        checked={device.motion} onChange={v => onChange({ motion: v })} />
      <Toggle label="ならう 学年" note="レッスンに「小3」などの しるしを 出す"
        checked={device.grade} onChange={v => onChange({ grade: v })} />
    </div>
    <p className="text-xs font-bold text-ink/70 mt-3">この 端末だけの せってい です。</p>
  </Sheet>
)
