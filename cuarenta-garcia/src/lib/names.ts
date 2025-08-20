export const ALLOWED_NAMES = [
  'Ilona','Nilton','Maria','Emilio','Andres','Michael','Amanda'
] as const
export type AllowedName = typeof ALLOWED_NAMES[number]

export const DEFAULT_PARTNERS: Array<[AllowedName, AllowedName]> = [
  ['Andres','Emilio'],
  ['Nilton','Amanda'],
  ['Maria','Ilona']
]

export const ADMIN_NAME: AllowedName = 'Nilton'
