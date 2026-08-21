/** `plan` namespace dictionaries (the composer plan chip's copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'chip.on.aria': 'plan mode 已开启，按下关闭',
  'chip.on.title': 'plan mode 已开启 — 点击关闭（/plan off）',
  'chip.off.aria': 'plan mode 已关闭，按下开启',
  'chip.off.title': 'plan mode 已关闭 — 点击开启（/plan）',
} satisfies Record<string, string>

/** The plan namespace key union. */
export type PlanKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'chip.on.aria': 'Plan mode on, press to turn off',
  'chip.on.title': 'Plan mode on — click to turn off (/plan off)',
  'chip.off.aria': 'Plan mode off, press to turn on',
  'chip.off.title': 'Plan mode off — click to turn on (/plan)',
} satisfies Record<PlanKey, string>

/** pt-BR dictionary, checked complete against the zh key set. */
export const pt = {
  'chip.on.aria': 'Modo de plano ativado, pressione para desativar',
  'chip.on.title': 'Modo de plano ativado — clique para desativar (/plan off)',
  'chip.off.aria': 'Modo de plano desativado, pressione para ativar',
  'chip.off.title': 'Modo de plano desativado — clique para ativar (/plan)',
} satisfies Record<PlanKey, string>
