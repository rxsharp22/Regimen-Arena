const CHIP_STYLES = {
  MRSA: 'border-[#8c4ecf]/40 bg-[#8c4ecf]/10 text-[#c9a8f0]',
  MSSA: 'border-[#d9b548]/40 bg-[#d9b548]/10 text-[#e8d48a]',
  Strep: 'border-[#4a9ead]/35 bg-[#4a9ead]/8 text-[#9ed4de]',
  default: 'border-[#344559] bg-[#1a222d] text-[#b8c5d6]',
}

export default function CoverageChip({ label }) {
  const style = CHIP_STYLES[label] ?? CHIP_STYLES.default
  return (
    <span
      className={`inline-flex items-center text-[9px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded border ${style}`}
    >
      {label}
    </span>
  )
}
