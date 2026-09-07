/** Shared form-control styling so every modal/panel reads consistently. */

export const fieldLabelClass =
  "mb-1 block text-xs font-bold uppercase tracking-wide text-charcoal-600";

export const inputClass =
  "focus-ring min-h-12 w-full rounded-lg border border-input bg-card px-3 text-base placeholder:text-charcoal-400";

export const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[position:right_0.75rem_center] bg-no-repeat pr-10`;

export const textareaClass = `${inputClass} min-h-28 py-2`;

export const errorTextClass = "mt-1 text-sm font-medium text-danger";
