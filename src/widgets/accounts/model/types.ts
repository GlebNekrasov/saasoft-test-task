export type Tag = {
  text: string
}

export const RECORD_TYPE_VALUES = ['LDAP', 'Локальная'] as const
export type RecordType = (typeof RECORD_TYPE_VALUES)[number]

export type Account = {
  id: number
  data: AccountData
}

export type AccountData = {
  login: string
  password: string | null
  recordType: RecordType
  tags: Tag[]
}
