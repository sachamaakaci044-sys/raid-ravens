// Corbeau en gros pixel art : chaque "1" du tableau = un bloc plein.
// Volontairement peu de détails, gros blocs, silhouette lisible.
const GRID = [
  '00011000011000',
  '00111100111100',
  '01111111111110',
  '11111111111111',
  '11111111111111',
  '00111111111100',
  '00011111111000',
  '00001111110000',
  '00001111110000',
  '00011111111000',
  '00110000001100',
]

export default function Logo({ size = 34 }) {
  const cols = GRID[0].length
  const rows = GRID.length
  const cell = 100 / cols

  return (
    <svg width={size} height={size} viewBox={`0 0 100 ${(100 / cols) * rows}`} shapeRendering="crispEdges">
      <defs>
        <linearGradient id="ravenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e4c9ff" />
          <stop offset="100%" stopColor="#a13bff" />
        </linearGradient>
      </defs>
      {GRID.map((row, y) =>
        row.split('').map((c, x) =>
          c === '1' ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell + 0.5} height={cell + 0.5} fill="url(#ravenGrad)" />
          ) : null
        )
      )}
    </svg>
  )
}
