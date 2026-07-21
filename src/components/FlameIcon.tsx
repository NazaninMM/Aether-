export default function FlameIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.2)} viewBox="0 0 11 13" fill="none" style={{ verticalAlign: 'middle', flexShrink: 0 }}>
      <path d="M5.5 1C5.5 1 8.5 4 8.5 6.8C8.5 9 7.2 10.5 5.5 10.5C3.8 10.5 2.5 9 2.5 6.8C2.5 5.5 3.3 4.2 3.3 4.2C3.3 4.2 3.7 5.5 4.2 6C4.6 6.4 5 6.1 5 5.2C5 3.5 5.5 1 5.5 1Z" stroke="var(--amber)" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5.5 7.5C5.5 7.5 6.5 8 6.5 9C6.5 9.8 6 10.5 5.5 10.5C5 10.5 4.5 9.8 4.5 9C4.5 8 5.5 7.5 5.5 7.5Z" stroke="var(--amber)" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  )
}
