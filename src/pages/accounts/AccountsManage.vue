<template>
  <div class="accounts-manage">
    <div class="accounts-manage__header">
      <TypographyTitle :level="3">Учетные записи</TypographyTitle>
      <Button><PlusOutlined /></Button>
    </div>
    <div class="accounts-manage__body">
      <AccountsTable />
    </div>
  </div>
</template>

<script setup lang="ts">
import AccountsTable from '@/widgets/accounts/ui/AccountsTable.vue'
import { Button, TypographyTitle } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
</script>

<style scoped lang="less">
.accounts-manage {
  &__header {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
}
</style>
