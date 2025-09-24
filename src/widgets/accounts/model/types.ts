export type Tag = {
  text: string
}

export type RecordType = 'LDAP' | 'Локальная'

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
