import { useState } from 'react'
import DrugCardGrid from './DrugCardGrid'
import ConfirmButton from './ConfirmButton'
import { isDalbavancinEligible } from '../simulation/boneDeep'
import { resolveDecisionPointForSimulation } from '../simulation/boneDeep/regimenPresentation'

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

  const resolvedDecisionPoint = resolveDecisionPointForSimulation(decisionPoint, simulation)
  const isMulti = resolvedDecisionPoint.type === 'multi_select'
  const options = filterSimulationOptions(resolvedDecisionPoint.options, simulation)

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

    if (option.show_oral_stepdown && resolvedDecisionPoint.oral_stepdown_sub_decision && !pendingOral) {
      setPendingOral(true)
      return
    }

    if (pendingOral) {
      const subOption = resolvedDecisionPoint.oral_stepdown_sub_decision.options.find(
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
          {resolvedDecisionPoint.prompt}
        </p>
        {resolvedDecisionPoint.instruction && (
          <p className="text-sm text-[#8b9cb3] mt-2 leading-relaxed">
            {resolvedDecisionPoint.instruction}
          </p>
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
            {resolvedDecisionPoint.oral_stepdown_sub_decision.prompt}
          </p>
          <DrugCardGrid
            options={resolvedDecisionPoint.oral_stepdown_sub_decision.options}
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
