// Config values can be plain, or {value, sample:true} for placeholders.
export const val = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v);
export const isSample = (v) => !!(v && typeof v === 'object' && v.sample);
