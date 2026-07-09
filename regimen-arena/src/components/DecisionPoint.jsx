import { useState } from 'react'
import DrugCardGrid from './DrugCardGrid'
import ConfirmButton from './ConfirmButton'
import { filterDp2Options } from '../utils/decisions'
import { isDalbavancinEligible } from '../simulation/boneDeep'

function filterSimulationOptions(options, simulation) {
  return options.filter((opt) => {
    if (!opt.requires_simulation_flag) return true
    if (opt.requires_simulation_flag === 'dalbavancinOffered') {
      return isDalbavancinEligible(simulation)
    }
    return Boolean(simulation?.[opt.requires_simulation_flag])
  })
}

export default function DecisionPoint({
  decisionPoint,
  activeDrugs,
  simulation,
  onConfirm,
  disabled,
  isProcessing = false,
}) {
  const [selectedId, setSelectedId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [oralSelectedId, setOralSelectedId] = useState(null)
  const [pendingOral, setPendingOral] = useState(false)

  if (!decisionPoint) return null

  const isMulti = decisionPoint.type === 'multi_select'
  const baseOptions =
    decisionPoint.id === 'dp_02_dose_reassessment'
      ? filterDp2Options(decisionPoint.options, activeDrugs)
      : decisionPoint.options

  const options = filterSimulationOptions(baseOptions, simulation)

  const handleSelect = (id) => {
    if (disabled) return
    if (isMulti) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      )
    } else {
      setSelectedId(id)
      setPendingOral(false)
      setOralSelectedId(null)
    }
  }

  const handleConfirm = () => {
    if (disabled) return

    if (isMulti) {
      if (selectedIds.length === 0) return
      onConfirm({ selectedIds }, null)
      return
    }

    const option = options.find((o) => o.id === selectedId)
    if (!option) return

    if (option.show_oral_stepdown && decisionPoint.oral_stepdown_sub_decision && !pendingOral) {
      setPendingOral(true)
      return
    }

    if (pendingOral) {
      const subOption = decisionPoint.oral_stepdown_sub_decision.options.find(
        (o) => o.id === oralSelectedId
      )
      if (!subOption) return
      onConfirm(option, subOption)
      return
    }

    onConfirm(option, null)
  }

  const canConfirm = isMulti
    ? selectedIds.length > 0
    : pendingOral
      ? oralSelectedId !== null
      : selectedId !== null

  return (
    <section className="mt-6 space-y-4 rounded-xl border border-[#2a3544] bg-[#151c26] p-4 sm:p-5">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-[#4a9ead] font-semibold mb-3">
          Clinical Decision
        </h3>
        <p className="text-base sm:text-lg font-medium text-[#e8edf4] leading-snug">
          {decisionPoint.prompt}
        </p>
        {decisionPoint.instruction && (
          <p className="text-sm text-[#8b9cb3] mt-2 leading-relaxed">{decisionPoint.instruction}</p>
        )}
        {decisionPoint.note && (
          <p className="text-sm text-[#8b9cb3] mt-2 italic leading-relaxed">{decisionPoint.note}</p>
        )}
      </div>

      {!pendingOral ? (
        <DrugCardGrid
          options={options}
          selectedId={selectedId}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          multiSelect={isMulti}
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#b8c5d6] font-medium">
            {decisionPoint.oral_stepdown_sub_decision.prompt}
          </p>
          <DrugCardGrid
            options={decisionPoint.oral_stepdown_sub_decision.options}
            selectedId={oralSelectedId}
            selectedIds={[]}
            onSelect={setOralSelectedId}
            multiSelect={false}
          />
        </div>
      )}

      {!disabled && (
        <div className="pt-2">
          <ConfirmButton
            disabled={!canConfirm}
            loading={isProcessing}
            onClick={handleConfirm}
            label={pendingOral ? 'Select Oral Agent' : 'Place Order'}
          />
        </div>
      )}
    </section>
  )
}
