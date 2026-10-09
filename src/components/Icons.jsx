// アイコンは すべて インラインSVG(外部の アイコンライブラリを CDN から 読まない)。
// パスは lucide(ISC License)と、gakushu-ui-kit patterns/accounts-ui.md の もの。
const I = ({ children, className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
)

export const SparklesIcon = (p) => <I {...p}><path d="M9.9 2.6 12 8l5.4 2.1L12 12.2 9.9 17.6 7.8 12.2 2.4 10.1 7.8 8z" /><path d="M18 3v4" /><path d="M20 5h-4" /></I>
export const PlusIcon = (p) => <I {...p}><path d="M12 5v14" /><path d="M5 12h14" /></I>
export const ArrowRightIcon = (p) => <I {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></I>
export const ArrowLeftIcon = (p) => <I {...p}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></I>
export const TrashIcon = (p) => <I {...p}><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></I>
export const XIcon = (p) => <I {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></I>
export const SettingsIcon = (p) => <I {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></I>
export const ChartIcon = (p) => <I {...p}><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></I>
export const DeleteIcon = (p) => <I {...p}><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" /><path d="m18 9-6 6" /><path d="m12 9 6 6" /></I>
export const LightbulbIcon = (p) => <I {...p}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></I>
export const CheckIcon = (p) => <I {...p}><path d="M20 6 9 17l-5-5" /></I>
export const PlayIcon = (p) => <I {...p}><polygon points="6 3 20 12 6 21 6 3" /></I>
export const RotateIcon = (p) => <I {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></I>

// 分数キーの しるし(□ の 上に □。分数の 形 そのもの)
export const FracKeyIcon = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="7" y="2" width="10" height="7" rx="1.5" />
    <path d="M4 12h16" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="7" y="15" width="10" height="7" rx="1.5" />
  </svg>
)
