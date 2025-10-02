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

export type AccountDataKey = keyof AccountData

export const ACCOUNT_DATA_LOGIN_KEY = 'login' as const satisfies AccountDataKey
export const ACCOUNT_DATA_PASSWORD_KEY = 'password' as const satisfies AccountDataKey
export const ACCOUNT_DATA_RECORD_TYPE_KEY = 'recordType' as const satisfies AccountDataKey
export const ACCOUNT_DATA_TAGS_KEY = 'tags' as const satisfies AccountDataKey
