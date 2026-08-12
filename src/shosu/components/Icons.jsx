const I = ({ children, className, onClick }) => (
  <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>{children}</svg>
)

export const HomeIcon      = p => <I {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></I>
export const TrashIcon     = p => <I {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></I>
export const Volume2Icon   = p => <I {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></I>
export const VolumeXIcon   = p => <I {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" x2="17" y1="9" y2="15"/><line x1="17" x2="23" y1="9" y2="15"/></I>
export const ArrowLeftIcon = p => <I {...p}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></I>
export const SparklesIcon  = p => <I {...p}><path d="M5 3v4M3 5h4M6.343 6.343l2.829 2.829M14 3v4M12 5h4M17.657 6.343l-2.829 2.829M5 21v-4M3 19h4M6.343 17.657l2.829-2.829M14 21v-4M12 19h4M17.657 17.657l-2.829-2.829"/></I>
export const EditIcon      = p => <I {...p}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></I>
export const XIcon         = p => <I {...p}><path d="M6 18L18 6M6 6l12 12"/></I>
