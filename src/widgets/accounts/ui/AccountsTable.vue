<template>
  <div class="accounts-table">
    <Table
      :columns="columns"
      :data-source="rows"
      :row-key="getRowKey"
      :pagination="false"
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'tags'">
          <Textarea
            :value="getCurrentTags(record as AccountRow)"
            :auto-size="{ minRows: 1, maxRows: 6 }"
            :maxlength="50"
            size="small"
            @blur="onTagsBlur($event, record as AccountRow)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'recordType'">
          <Select
            class="accounts-table__select"
            size="small"
            :options="recordTypeOptions"
            :value="getCurrentRecordType(record as AccountRow)"
            @change="(value) => onRecordTypeChange(value as RecordType, record as AccountRow)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'login'">
          <Input
            :value="getCurrentLogin(record as AccountRow)"
            :maxlength="50"
            size="small"
            :status="
              record.id == null && draftErrors.login
                ? 'error'
                : editedRecordsErrors.get(record.id)?.isLoginEroor
                  ? 'error'
                  : ''
            "
            @blur="onLoginBlur($event, record as AccountRow)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'password'">
          <InputPassword
            :value="getCurrentPassword(record as AccountRow)"
            :maxlength="50"
            size="small"
            :status="
              record.id == null && draftErrors.password
                ? 'error'
                : editedRecordsErrors.get(record.id)?.isPasswordError
                  ? 'error'
                  : ''
            "
            @blur="onPasswordBlur($event, record as AccountRow)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'actions'">
          <DeleteOutlined
            :style="{ fontSize: '16px', color: 'red' }"
            @click="onRemove(record.id)"
          />
        </template>
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'
import { Table, Input, Select, message, InputPassword, Textarea } from 'ant-design-vue'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { useAccountsStore } from '@/widgets/accounts/model/accounts'
import type { AccountData, Tag as AccountTag, RecordType } from '@/widgets/accounts/model/types'
import { RECORD_TYPE_VALUES } from '@/widgets/accounts/model/types'

type AccountRow = {
  id: number | null
  data: AccountData
}

type AccountEditErrors = {
  isLoginEroor: boolean
  isPasswordError: boolean
}

const accountsStore = useAccountsStore()

const editedRecordsData = ref<Map<number, AccountData>>(new Map())
const editedRecordsErrors = ref<Map<number, AccountEditErrors>>(new Map())
const draftRows = ref<AccountRow[]>([])
const draftErrors = ref<{ login: boolean; password: boolean }>({
  login: false,
  password: false,
})

const rows = computed<AccountRow[]>(function () {
  const persisted = accountsStore.accounts.map<AccountRow>(function (account) {
    return {
      id: account.id,
      data: account.data,
    }
  })
  return persisted.concat(draftRows.value)
})

const recordTypeOptions = RECORD_TYPE_VALUES.map((value) => {
  return { value, label: value }
})

const columns = computed<TableColumnsType<AccountRow>>(function () {
  return [
    { title: 'Метки', dataIndex: 'tags', key: 'tags', width: 200 },
    { title: 'Тип записи', dataIndex: 'recordType', key: 'recordType', width: 140 },
    {
      title: 'Логин',
      dataIndex: 'login',
      key: 'login',
      customCell: function (record: AccountRow) {
        return getCurrentRecordType(record) === 'LDAP' ? { colSpan: 2 } : { colSpan: 1 }
      },
      width: 200,
    },
    {
      title: 'Пароль',
      dataIndex: 'password',
      key: 'password',
      customCell: function (record: AccountRow) {
        return getCurrentRecordType(record) === 'LDAP' ? { colSpan: 0 } : { colSpan: 1 }
      },
      width: 200,
    },
    { title: '', dataIndex: 'actions', key: 'actions', width: 40 },
  ]
})

function getRowKey(record: AccountRow) {
  return record.id ?? 'draft'
}

function getCurrentTags(record: AccountRow): string {
  const tags =
    record.id != null && editedRecordsData.value.has(record.id)
      ? editedRecordsData.value.get(record.id)!.tags
      : record.data.tags
  return formatTags(tags)
}

function getCurrentRecordType(record: AccountRow): AccountData['recordType'] {
  return record.id != null && editedRecordsData.value.has(record.id)
    ? editedRecordsData.value.get(record.id)!.recordType
    : record.data.recordType
}

function getCurrentLogin(record: AccountRow): AccountData['login'] {
  return record.id != null && editedRecordsData.value.has(record.id)
    ? editedRecordsData.value.get(record.id)!.login
    : record.data.login
}

function getCurrentPassword(record: AccountRow) {
  return record.id != null && editedRecordsData.value.has(record.id)
    ? editedRecordsData.value.get(record.id)!.password || ''
    : record.data.password || ''
}

function validateEditedRecord(id: number) {
  const editedRecord = editedRecordsData.value.get(id)
  if (!editedRecord) {
    return false
  }
  const isLocal = editedRecord.recordType === 'Локальная'
  const isLoginEroor = editedRecord.login.trim().length === 0
  const isPasswordError =
    isLocal && (!editedRecord.password || editedRecord.password.trim().length === 0)

  if (!isLoginEroor && !isPasswordError) {
    editedRecordsErrors.value.delete(id)
    return true
  }

  editedRecordsErrors.value.set(id, { isLoginEroor, isPasswordError })
  return false
}

function updateEditedRecord(id: number) {
  try {
    const editedRecord = editedRecordsData.value.get(id)
    if (!editedRecord || !validateEditedRecord(id)) {
      message.error('Заполнены не все обязательные поля')
      return
    }
    accountsStore.updateAccount(editedRecord, id)
    editedRecordsData.value.delete(id)
    message.success('Учетная запись обновлена')
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Не удалось обновить учетную запись')
  }
}

function formatTags(tags: AccountTag[]): string {
  return tags
    .map((t) => {
      return t.text
    })
    .join('; ')
}

function parseTags(input: string): AccountTag[] {
  return input
    .split(';')
    .map((s) => {
      return s.trim()
    })
    .filter((s) => {
      return s.length > 0
    })
    .map((text) => {
      return { text }
    })
}

function onTagsBlur(e: Event, record: AccountRow) {
  const target = e.target as HTMLTextAreaElement
  const input = target.value
  const newTags = parseTags(input)
  if (record.id == null) {
    record.data.tags = newTags
    saveDraft(record)
    return
  }

  const currentEditedRecord = editedRecordsData.value.get(record.id)
  const newSerializedTags = formatTags(newTags)
  if (!currentEditedRecord) {
    const oldSerializedTags = formatTags(record.data.tags)
    if (newSerializedTags === oldSerializedTags) return
    editedRecordsData.value.set(record.id, {
      login: record.data.login,
      password: record.data.password,
      recordType: record.data.recordType,
      tags: newTags,
    })
  }
  if (currentEditedRecord) {
    const oldSerializedTags = formatTags(currentEditedRecord.tags)
    if (newSerializedTags === oldSerializedTags) return
    currentEditedRecord.tags = newTags
  }
  updateEditedRecord(record.id)
}

function onRecordTypeChange(value: RecordType, record: AccountRow) {
  if (record.id == null) {
    record.data.recordType = value
    if (value === 'LDAP') record.data.password = null
    saveDraft(record)
    return
  }
  const currentEditedRecord = editedRecordsData.value.get(record.id)
  if (!currentEditedRecord) {
    editedRecordsData.value.set(record.id, {
      login: record.data.login,
      password: value === 'LDAP' ? null : record.data.password,
      recordType: value,
      tags: record.data.tags,
    })
  } else {
    currentEditedRecord.recordType = value
    if (value === 'LDAP') currentEditedRecord.password = null
  }
  updateEditedRecord(record.id)
}

function onLoginBlur(e: Event, record: AccountRow) {
  const target = e.target as HTMLInputElement
  const newLogin = target.value
  if (record.id == null) {
    record.data.login = newLogin
    saveDraft(record)
    return
  }
  const currentEditedRecord = editedRecordsData.value.get(record.id)
  if (!currentEditedRecord) {
    if (newLogin === record.data.login) return
    editedRecordsData.value.set(record.id, {
      login: newLogin,
      password: record.data.password,
      recordType: record.data.recordType,
      tags: record.data.tags,
    })
  }
  if (currentEditedRecord) {
    if (newLogin === currentEditedRecord.login) return
    currentEditedRecord.login = newLogin
  }
  updateEditedRecord(record.id)
}

function onPasswordBlur(e: Event, record: AccountRow) {
  const target = e.target as HTMLInputElement
  const newPassword = target.value.length === 0 ? null : target.value
  if (record.id == null) {
    record.data.password = newPassword
    saveDraft(record)
    return
  }
  const currentEditedRecord = editedRecordsData.value.get(record.id)
  if (!currentEditedRecord) {
    if (newPassword === record.data.password) return
    editedRecordsData.value.set(record.id, {
      login: record.data.login,
      password: newPassword,
      recordType: record.data.recordType,
      tags: record.data.tags,
    })
  }
  if (currentEditedRecord) {
    if (newPassword === currentEditedRecord.password) return
    currentEditedRecord.password = newPassword
  }
  updateEditedRecord(record.id)
}

function onRemove(id: number | null) {
  if (id === null) {
    clearDraft()
    return
  }
  try {
    accountsStore.removeAccount(id)
    message.success('Учетная запись удалена')
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Не удалось удалить')
  }
}

function validateDraft(r: AccountRow): boolean {
  const isLocal = r.data.recordType === 'Локальная'
  draftErrors.value.login = r.data.login.trim().length === 0
  draftErrors.value.password = isLocal && (!r.data.password || r.data.password.trim().length === 0)
  const ok = !draftErrors.value.login && !draftErrors.value.password
  if (!ok) message.error('Заполнены не все обязательные поля')
  return ok
}

function saveDraft(r: AccountRow) {
  if (r.id != null) return
  if (!validateDraft(r)) return
  try {
    accountsStore.addAccount({
      login: r.data.login,
      password: r.data.recordType === 'Локальная' ? r.data.password : null,
      recordType: r.data.recordType,
      tags: r.data.tags,
    })
    clearDraft()
    message.success('Учетная запись сохранена')
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Не удалось сохранить учетную запись')
  }
}

function clearDraft() {
  draftRows.value = []
  draftErrors.value.login = false
  draftErrors.value.password = false
}

function addDraftRow(): void {
  if (draftRows.value.length > 0) {
    message.warning('Можно добавить только одну новую учетную запись')
    return
  }
  draftRows.value.push({
    id: null,
    data: {
      tags: [],
      recordType: 'Локальная',
      login: '',
      password: null,
    },
  })
}

defineExpose({ addDraftRow })
</script>

<style scoped lang="less">
.accounts-table {
  &__tags {
    max-width: 100%;
  }

  :deep(.ant-select) {
    min-width: 120px;
    width: 100%;
  }
}
</style>
