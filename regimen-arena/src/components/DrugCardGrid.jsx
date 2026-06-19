import DrugCard from './DrugCard'

export default function DrugCardGrid({ options, selectedId, selectedIds, onSelect, multiSelect }) {
  if (!options?.length) {
    return <p className="text-sm text-[#8b9cb3] italic">No options available.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((option) => (
        <DrugCard
          key={option.id}
          option={option}
          selected={multiSelect ? selectedIds.includes(option.id) : selectedId === option.id}
          onSelect={onSelect}
          multiSelect={multiSelect}
        />
      ))}
    </div>
  )
}
