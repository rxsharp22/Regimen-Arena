export default function MonitoringFlag({ label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border border-[#c9a227]/35 bg-[#c9a227]/8 text-[#e8d48a]">
      <span className="text-[#c9a227]" aria-hidden>
        ⚠
      </span>
      {label}
    </span>
  )
}
