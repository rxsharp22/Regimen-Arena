export default function ConfirmButton({ disabled, onClick, label = 'Place Order', loading = false }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg text-sm font-semibold border border-[#4a9ead]/50 text-[#4a9ead] bg-[#4a9ead]/15 hover:bg-[#4a9ead]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
        loading ? 'alert-pulse' : ''
      }`}
    >
      {loading ? 'Processing…' : label}
    </button>
  )
}
