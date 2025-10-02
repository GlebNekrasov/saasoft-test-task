import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Account, AccountData } from './types'

export const useAccountsStore = defineStore(
  'accounts',
  () => {
    const accounts = ref<Account[]>([])
    const newAccountId = computed(() => {
      if (accounts.value.length === 0) {
        return 1
      }

      const maxId = Math.max(...accounts.value.map((account) => account.id))
      return maxId + 1
    })

    function isLoginExist(data: AccountData, id: number | null) {
      if (accounts.value.length === 0) {
        return false
      }

      const existedAccount = accounts.value.find((account) => {
        return account.data.login === data.login && account.data.recordType === data.recordType
      })

      if (existedAccount && existedAccount.id !== id) {
        return true
      }

      return false
    }

    function isAccountDataValid(
      data: AccountData,
      id: number | null,
    ): { isValid: boolean; errorMessage: string } {
      if (!data.login || (data.recordType === 'Локальная' && !data.password)) {
        return {
          isValid: false,
          errorMessage: 'Заполнены не все обязательные поля',
        }
      }

      if (isLoginExist(data, id)) {
        return {
          isValid: false,
          errorMessage: 'Такой логин уже существует',
        }
      }

      return {
        isValid: true,
        errorMessage: '',
      }
    }

    function getAccountIndexById(id: number) {
      return accounts.value.findIndex((account) => {
        return account.id === id
      })
    }

    function addAccount(data: AccountData) {
      const { isValid, errorMessage } = isAccountDataValid(data, null)
      if (!isValid) {
        throw new Error(errorMessage)
      }

      const newAccount = {
        id: newAccountId.value,
        data,
      }
      accounts.value.push(newAccount)
    }

    function removeAccount(id: number) {
      const removedAccountIndex = getAccountIndexById(id)
      if (removedAccountIndex === -1) {
        throw new Error('Такая учетная запись не найдена')
      }
      accounts.value.splice(removedAccountIndex, 1)
    }

    function updateAccount(data: AccountData, id: number) {
      const { isValid, errorMessage } = isAccountDataValid(data, id)
      if (!isValid) {
        throw new Error(errorMessage)
      }

      const updatedAccountIndex = getAccountIndexById(id)

      if (updatedAccountIndex === -1) {
        throw new Error('Такая учетная запись не найдена')
      }

      accounts.value[updatedAccountIndex].data = {
        login: data.login,
        password: data.password,
        recordType: data.recordType,
        tags: data.tags,
      }
    }

    return { accounts, addAccount, removeAccount, updateAccount }
  },
  {
    persist: true,
  },
)
