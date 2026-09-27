// Integer-grid artwork keeps these small desktop icons crisp at 16px and 32px.
export default function PixelIcon({ type, size = 16 }) {
  const icons = {
    notepad: <><path fill="#535b68" d="M3 1h9v2h2v12H3z" /><path fill="#fffef0" d="M4 2h7v3h2v9H4z" /><path fill="#8bb5d9" d="M4 2h7v2H4zM5 6h6v1H5zM5 8h6v1H5zM5 10h6v1H5zM5 12h4v1H5z" /></>,
    explorer: <><path fill="#806022" d="M1 3h6v2h8v9H1z" /><path fill="#ffe695" d="M2 4h4v2h8v7H2z" /><path fill="#c49a38" d="M1 7h14v7H1z" /><path fill="#f7d968" d="M2 8h12v5H2z" /><path fill="#fff0a5" d="M2 8h12v1H2z" /></>,
    chat: <><path fill="#214778" d="M1 2h11v8H7v3H5v-3H1z" /><path fill="#d6efff" d="M2 3h9v6H6v2H5V9H2z" /><path fill="#5a8eb9" d="M7 7h8v7h-2v2h-2v-2H7z" /><path fill="#fff" d="M8 8h6v5h-2v1h-1v-1H8z" /><path fill="#507ba6" d="M3 4h6v1H3zM3 6h4v1H3z" /></>,
    bread: <><path fill="#70421b" d="M4 1h8v1h2v2h1v5h-2v6H3V9H1V4h1V2h2z" /><path fill="#d69b48" d="M4 2h8v1h2v5h-2v6H4V8H2V4h1V3h1z" /><path fill="#ffdfa0" d="M5 3h6v1h2v3h-2v6H5V7H3V4h2z" /><path fill="#fff0c1" d="M5 3h6v1H5zM4 4h1v3H4z" /></>,
    power: <><path fill="#792b24" d="M2 1h12v14H2z" /><path fill="#d75a43" d="M3 2h10v12H3z" /><path fill="#f08c68" d="M3 2h10v2H3z" /><path fill="#fff6df" d="M7 3h2v5H7zM5 6h1v1H5zM4 7h1v4H4zM5 11h1v1H5zM6 12h4v1H6zM10 11h1v1h-1zM11 7h1v4h-1zM10 6h1v1h-1z" /></>,
    volume: <><path fill="#3b4657" d="M1 6h3l4-4v12l-4-4H1z" /><path fill="#d7dce0" d="M2 7h3V6h1V5h1v7H6v-1H5V9H2z" /><path fill="#fff" d="M10 5h1v6h-1zM12 3h1v2h-1zM13 5h1v6h-1zM12 11h1v2h-1z" /></>,
    network: <><path fill="#384c65" d="M0 2h10v8H0zM7 7h9v7H7z" /><path fill="#9de1ff" d="M1 3h8v5H1zM8 8h7v4H8z" /><path fill="#3689c5" d="M2 5h6v2H2zM9 10h5v1H9z" /><path fill="#d9dce1" d="M1 9h8v1H1zM3 10h3v1H3zM2 11h5v1H2zM8 13h7v1H8zM10 14h3v1h-3z" /></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', imageRendering: 'pixelated' }}>{icons[type === 'thesis' ? 'notepad' : type] || icons.notepad}</svg>
}
