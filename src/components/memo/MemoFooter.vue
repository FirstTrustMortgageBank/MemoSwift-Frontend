<template>
  <div class="memo-footer">

    <!-- Signatory Row -->
    <div class="signatory-row">
      <div class="signatory" v-for="(sig, i) in fields.signatories" :key="'sig-' + i">
        <input
          v-model="sig.name"
          class="footer-input footer-input--bold"
          placeholder="Name"
          @input="emitUpdate"
        />
        <input
          v-model="sig.role"
          class="footer-input"
          placeholder="Role / Department"
          @input="emitUpdate"
        />
      </div>
    </div>

    <!-- Opex/Capex Section -->
    <div class="opex-section">
      <div class="opex-title">Opex/Capex</div>

      <!-- Row 1: Monthly Budget | Expense to Date | Balance -->
      <div class="opex-grid">
        <div class="opex-cell">
          <div class="opex-label">Monthly Budget ₦</div>
          <input v-model="fields.monthlyBudget" class="opex-input" @input="emitUpdate" />
        </div>
        <div class="opex-cell">
          <div class="opex-label">Expense to Date ₦</div>
          <input v-model="fields.monthlyExpense" class="opex-input" @input="emitUpdate" />
        </div>
        <div class="opex-cell">
          <div class="opex-label">Balance ₦</div>
          <input v-model="fields.monthlyBalance" class="opex-input" @input="emitUpdate" />
        </div>
      </div>

      <!-- Row 2: Annual Budget | Expense to Date | Balance -->
      <div class="opex-grid">
        <div class="opex-cell">
          <div class="opex-label">Annual Budget ₦</div>
          <input v-model="fields.annualBudget" class="opex-input" @input="emitUpdate" />
        </div>
        <div class="opex-cell">
          <div class="opex-label">Expense to Date ₦</div>
          <input v-model="fields.annualExpense" class="opex-input" @input="emitUpdate" />
        </div>
        <div class="opex-cell">
          <div class="opex-label">Balance ₦</div>
          <input v-model="fields.annualBalance" class="opex-input" @input="emitUpdate" />
        </div>
      </div>

      <!-- Row 3: FINCON | Signature | Date -->
      <div class="opex-grid">
        <div class="opex-cell">
          <div class="opex-label">FINCON</div>
          <input v-model="fields.fincon" class="opex-input" @input="emitUpdate" />
        </div>
        <div class="opex-cell">
          <div class="opex-label">Signature</div>
          <input v-model="fields.signature" class="opex-input" @input="emitUpdate" />
        </div>
        <div class="opex-cell">
          <div class="opex-label">Date</div>
          <input v-model="fields.finconDate" type="date" class="opex-input" @input="emitUpdate" />
        </div>
      </div>

      <!-- Comments -->
      <div class="opex-comments-row">
        <div class="opex-label">Comments</div>
        <input v-model="fields.comments" class="opex-input opex-input--wide" @input="emitUpdate" />
      </div>
    </div>

    <!-- Concurrence Section -->
    <div class="concurrence-section">
      <div class="concurrence-title">Concurrence:</div>

      <div class="signoff-block" v-for="(person, i) in fields.concurrence" :key="'c' + i">
        <div class="signoff-name-line">
          <input
            v-model="person.name"
            class="footer-input footer-input--bold signoff-name-input"
            placeholder="Name"
            @input="emitUpdate"
          />
          <span class="signoff-line"></span>
          <button class="remove-btn" @click="removeConcurrence(i)" title="Remove">✕</button>
        </div>
        <input
          v-model="person.role"
          class="footer-input signoff-role-input"
          placeholder="Role / Department"
          @input="emitUpdate"
        />
      </div>

      <button class="add-btn" @click="addConcurrence">+ Add Concurrence</button>
    </div>

    <!-- Approved By Section -->
    <div class="approved-section">
      <div class="concurrence-title">Approved By:</div>

      <div class="signoff-block" v-for="(person, i) in fields.approvedBy" :key="'a' + i">
        <div class="signoff-name-line">
          <input
            v-model="person.name"
            class="footer-input footer-input--bold signoff-name-input"
            placeholder="Name"
            @input="emitUpdate"
          />
          <span class="signoff-line"></span>
          <button class="remove-btn" @click="removeApprover(i)" title="Remove">✕</button>
        </div>
        <input
          v-model="person.role"
          class="footer-input signoff-role-input"
          placeholder="Role / Title"
          @input="emitUpdate"
        />
      </div>

      <button class="add-btn" @click="addApprover">+ Add Approver</button>
    </div>

  </div>
</template>

<script setup>
import { reactive, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update', 'update:modelValue'])

// Default structure with proper signatories array
const defaultFields = () => ({
  signatories: [
    { name: 'Name', role: 'Role' },
    { name: 'Name', role: 'Role' }
  ],
  monthlyBudget:  '',
  monthlyExpense: '',
  monthlyBalance: '',
  annualBudget:   '',
  annualExpense:  '',
  annualBalance:  '',
  fincon:         '',
  signature:      '',
  finconDate:     '',
  comments:       '',
  concurrence: [
    { name: 'Michael Olubunmi Asalu', role: 'Group Head, General Services' },
    { name: 'John Odey',              role: 'Executive Director, General Services' },
  ],
  approvedBy: [
    { name: 'Korede Adedayo', role: 'Managing Director/CEO' },
  ],
})

// Helper function to deeply merge saved data with defaults
const merge = (saved) => {
  const def = defaultFields()
  
  // If no saved data, return defaults
  if (!saved || Object.keys(saved).length === 0) {
    return JSON.parse(JSON.stringify(def))
  }
  
  // Helper to ensure arrays are properly merged
  const mergeArray = (savedArr, defaultArr) => {
    if (!savedArr || !Array.isArray(savedArr) || savedArr.length === 0) {
      return JSON.parse(JSON.stringify(defaultArr))
    }
    // Deep clone the saved array to preserve all properties
    return savedArr.map(item => ({
      name: item.name || '',
      role: item.role || ''
    }))
  }
  
  return {
    signatories: mergeArray(saved.signatories, def.signatories),
    concurrence: mergeArray(saved.concurrence, def.concurrence),
    approvedBy: mergeArray(saved.approvedBy, def.approvedBy),
    // String fields
    monthlyBudget: saved.monthlyBudget !== undefined ? saved.monthlyBudget : def.monthlyBudget,
    monthlyExpense: saved.monthlyExpense !== undefined ? saved.monthlyExpense : def.monthlyExpense,
    monthlyBalance: saved.monthlyBalance !== undefined ? saved.monthlyBalance : def.monthlyBalance,
    annualBudget: saved.annualBudget !== undefined ? saved.annualBudget : def.annualBudget,
    annualExpense: saved.annualExpense !== undefined ? saved.annualExpense : def.annualExpense,
    annualBalance: saved.annualBalance !== undefined ? saved.annualBalance : def.annualBalance,
    fincon: saved.fincon !== undefined ? saved.fincon : def.fincon,
    signature: saved.signature !== undefined ? saved.signature : def.signature,
    finconDate: saved.finconDate !== undefined ? saved.finconDate : def.finconDate,
    comments: saved.comments !== undefined ? saved.comments : def.comments,
  }
}

const fields = reactive(merge(props.modelValue))

// Watch for external updates from parent (e.g., when loading a memo)
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      const merged = merge(newVal)
      
      // Update signatories
      fields.signatories = merged.signatories
      
      // Update concurrence
      fields.concurrence = merged.concurrence
      
      // Update approvedBy
      fields.approvedBy = merged.approvedBy
      
      // Update string fields
      fields.monthlyBudget = merged.monthlyBudget
      fields.monthlyExpense = merged.monthlyExpense
      fields.monthlyBalance = merged.monthlyBalance
      fields.annualBudget = merged.annualBudget
      fields.annualExpense = merged.annualExpense
      fields.annualBalance = merged.annualBalance
      fields.fincon = merged.fincon
      fields.signature = merged.signature
      fields.finconDate = merged.finconDate
      fields.comments = merged.comments
    }
  },
  { deep: true, immediate: true }
)

// Emit updates to parent component
const emitUpdate = () => {
  // Create a clean copy of the fields
  const cleanFields = {
    signatories: fields.signatories.map(s => ({
      name: s.name || '',
      role: s.role || ''
    })),
    concurrence: fields.concurrence.map(c => ({
      name: c.name || '',
      role: c.role || ''
    })),
    approvedBy: fields.approvedBy.map(a => ({
      name: a.name || '',
      role: a.role || ''
    })),
    monthlyBudget: fields.monthlyBudget || '',
    monthlyExpense: fields.monthlyExpense || '',
    monthlyBalance: fields.monthlyBalance || '',
    annualBudget: fields.annualBudget || '',
    annualExpense: fields.annualExpense || '',
    annualBalance: fields.annualBalance || '',
    fincon: fields.fincon || '',
    signature: fields.signature || '',
    finconDate: fields.finconDate || '',
    comments: fields.comments || '',
  }
  
  emit('update', cleanFields)
  emit('update:modelValue', cleanFields)
}

// Helper function to auto-calculate balances
const calculateBalances = () => {
  // Calculate monthly balance
  if (fields.monthlyBudget && fields.monthlyExpense) {
    const budget = parseFloat(fields.monthlyBudget.replace(/,/g, '')) || 0
    const expense = parseFloat(fields.monthlyExpense.replace(/,/g, '')) || 0
    fields.monthlyBalance = (budget - expense).toString()
  }
  
  // Calculate annual balance
  if (fields.annualBudget && fields.annualExpense) {
    const budget = parseFloat(fields.annualBudget.replace(/,/g, '')) || 0
    const expense = parseFloat(fields.annualExpense.replace(/,/g, '')) || 0
    fields.annualBalance = (budget - expense).toString()
  }
  
  emitUpdate()
}

// Add debounced version for balance calculation
let balanceTimeout
const debouncedCalculateBalances = () => {
  clearTimeout(balanceTimeout)
  balanceTimeout = setTimeout(() => {
    calculateBalances()
  }, 500)
}

// Watch budget and expense fields to auto-calculate balances
watch([() => fields.monthlyBudget, () => fields.monthlyExpense], () => {
  debouncedCalculateBalances()
})

watch([() => fields.annualBudget, () => fields.annualExpense], () => {
  debouncedCalculateBalances()
})

const addConcurrence = () => { 
  fields.concurrence.push({ name: '', role: '' })
  emitUpdate()
}

const removeConcurrence = (i) => { 
  fields.concurrence.splice(i, 1)
  emitUpdate()
}

const addApprover = () => { 
  fields.approvedBy.push({ name: '', role: '' })
  emitUpdate()
}

const removeApprover = (i) => { 
  fields.approvedBy.splice(i, 1)
  emitUpdate()
}

// Expose methods for parent component if needed
defineExpose({
  calculateBalances,
  getFields: () => {
    const fieldsCopy = { ...fields }
    fieldsCopy.signatories = [...fields.signatories]
    fieldsCopy.concurrence = [...fields.concurrence]
    fieldsCopy.approvedBy = [...fields.approvedBy]
    return fieldsCopy
  },
  resetToDefaults: () => {
    const defaults = defaultFields()
    fields.signatories = defaults.signatories.map(s => ({ ...s }))
    fields.concurrence = defaults.concurrence.map(c => ({ ...c }))
    fields.approvedBy = defaults.approvedBy.map(a => ({ ...a }))
    fields.monthlyBudget = defaults.monthlyBudget
    fields.monthlyExpense = defaults.monthlyExpense
    fields.monthlyBalance = defaults.monthlyBalance
    fields.annualBudget = defaults.annualBudget
    fields.annualExpense = defaults.annualExpense
    fields.annualBalance = defaults.annualBalance
    fields.fincon = defaults.fincon
    fields.signature = defaults.signature
    fields.finconDate = defaults.finconDate
    fields.comments = defaults.comments
    emitUpdate()
  }
})
</script>

<style scoped>
.memo-footer {
  font-family: 'Century Gothic', Calibri, Arial, sans-serif;
  font-size: 11pt;
  color: #000;
  padding: 0;
  margin-top: 2rem;
}

/* ── Shared editable input base ── */
.footer-input {
  border: none;
  border-bottom: 1px dashed #bbb;
  border-radius: 0;
  background: transparent;
  font-family: inherit;
  font-size: 11pt;
  color: #000;
  padding: 0.1rem 0.2rem;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}
.footer-input:focus {
  border-bottom-color: #465fff;
}
.footer-input--bold {
  font-weight: 700;
}

/* ── Signatory Row ── */
.signatory-row {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.5rem;
}
.signatory {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

/* ── Opex/Capex ── */
.opex-section { 
  margin-bottom: 2rem; 
  border-top: 1px solid #000;
  padding-top: 0.75rem;
}
.opex-title {
  font-weight: 700;
  font-size: 11pt;
  text-decoration: underline;
  margin-bottom: 0.75rem;
}
.opex-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem 1rem;
  margin-bottom: 0.75rem;
}
.opex-cell { 
  display: flex; 
  flex-direction: column; 
  gap: 0.2rem; 
}
.opex-label { 
  font-size: 10pt; 
  color: #000; 
  white-space: nowrap; 
  font-weight: 500;
}
.opex-input {
  border: 1px solid #000;
  border-radius: 2px;
  padding: 0.3rem 0.4rem;
  font-size: 10pt;
  font-family: inherit;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
  height: 1.75rem;
  outline: none;
  transition: all 0.2s;
}
.opex-input:focus {
  border-color: #465fff;
  box-shadow: 0 0 0 2px rgba(70, 95, 255, 0.15);
}
.opex-comments-row { 
  display: flex; 
  flex-direction: column; 
  gap: 0.2rem; 
  margin-top: 0.25rem; 
}
.opex-input--wide { 
  width: 100%; 
}

/* ── Concurrence & Approved By ── */
.concurrence-section,
.approved-section { 
  margin-bottom: 1.5rem; 
  border-top: 1px solid #ddd;
  padding-top: 0.75rem;
}
.concurrence-title { 
  font-weight: 700; 
  font-size: 11pt; 
  margin-bottom: 0.75rem; 
}
.signoff-block { 
  margin-bottom: 1rem; 
}
.signoff-name-line { 
  display: flex; 
  align-items: flex-end; 
  gap: 0.5rem; 
}
.signoff-name-input { 
  max-width: 250px; 
  flex-shrink: 0; 
}
.signoff-line {
  flex: 1;
  border-bottom: 1px solid #000;
  min-width: 80px;
  margin-bottom: 3px;
}
.signoff-role-input { 
  margin-top: 0.15rem; 
  font-size: 11pt; 
  max-width: 300px;
}

/* ── Add / Remove buttons ── */
.add-btn {
  background: none;
  border: 1px dashed #999;
  border-radius: 0.375rem;
  color: #555;
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  margin-top: 0.25rem;
  transition: all 0.15s;
}
.add-btn:hover { 
  border-color: #465fff; 
  color: #465fff; 
  background: rgba(70, 95, 255, 0.04); 
}
.remove-btn {
  background: none;
  border: none;
  color: #bbb;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s;
}
.remove-btn:hover { 
  color: #c62828; 
}

/* ── Print: clean up editing chrome ── */
@media print {
  .opex-input { 
    border: none; 
    border-bottom: 1px solid #000; 
    background: transparent; 
    padding: 0; 
  }
  .footer-input { 
    border-bottom: 1px solid #000; 
  }
  .add-btn, .remove-btn { 
    display: none; 
  }
  .opex-grid {
    break-inside: avoid;
  }
  .signoff-block {
    break-inside: avoid;
  }
}

/* ── Dark mode support ── */
@media (prefers-color-scheme: dark) {
  .memo-footer {
    color: #e0e0e0;
  }
  .footer-input {
    color: #e0e0e0;
    border-bottom-color: #666;
  }
  .opex-input {
    background: #2d2d2d;
    border-color: #666;
    color: #e0e0e0;
  }
  .opex-label {
    color: #e0e0e0;
  }
  .signoff-line {
    border-bottom-color: #666;
  }
}
</style>