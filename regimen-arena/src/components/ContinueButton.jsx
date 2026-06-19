export default function ContinueButton({ onClick, isFinal }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-[#3d9a6e]/50 text-[#3d9a6e] bg-[#3d9a6e]/15 hover:bg-[#3d9a6e]/25 transition-colors"
    >
      {isFinal ? 'View Results' : 'Continue'}
    </button>
  )
}
