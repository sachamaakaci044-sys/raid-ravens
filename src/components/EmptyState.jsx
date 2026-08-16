export default function EmptyState({ icon = '◎', title, text, actionLabel, onAction }) {
  return (
    <div className="border border-border rounded-xl bg-panel2 py-14 flex flex-col items-center text-center px-6">
      <div className="w-12 h-12 rounded-full bg-accentdim/40 flex items-center justify-center text-xl mb-4">{icon}</div>
      <div className="font-bold tracking-wide mb-1">{title}</div>
      <div className="text-sm text-slate-500 max-w-sm">{text}</div>
      {actionLabel && (
        <button onClick={onAction} className="mt-5 bg-accentdim border border-accent/60 text-white text-sm px-4 py-2 rounded-md hover:bg-accent hover:text-bg transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
