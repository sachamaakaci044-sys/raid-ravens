const METIERS = [
  { key: 'mineur_lvl', label: 'Mineur', color: '#eab308' },
  { key: 'farmer_lvl', label: 'Farmer', color: '#3ddc84' },
  { key: 'hunter_lvl', label: 'Hunter', color: '#a48fe0' },
  { key: 'alchimiste_lvl', label: 'Alchimiste', color: '#3dc9dc' },
]

export default function MemberCard({ member }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-panel2 border border-border rounded-lg px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-accentdim flex items-center justify-center text-xs font-bold shrink-0">
          {member.pseudo.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{member.pseudo}</div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {METIERS.map(m => (
              <span
                key={m.key}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: m.color + '22', color: m.color, border: `1px solid ${m.color}55` }}
              >
                {m.label} {member[m.key] ?? 1}
              </span>
            ))}
          </div>
        </div>
      </div>
      <span className="text-[11px] px-2 py-1 rounded-full border border-border text-slate-400 shrink-0">{member.grade}</span>
    </div>
  )
}
