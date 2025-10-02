<template>
  <div class="accounts-manage">
    <div class="accounts-manage__header">
      <TypographyTitle :level="4">Учетные записи</TypographyTitle>
      <Button @click="accountsTableRef?.addDraftRow()" size="small"><PlusOutlined /></Button>
    </div>
    <div class="accounts-manage__body">
      <div class="accounts-manage__body-hint">
        <QuestionCircleOutlined class="accounts-manage__body-hint-icon" />
        <TypographyText>
          Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
        </TypographyText>
      </div>
      <AccountsTable ref="accountsTableRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import AccountsTable from '@/widgets/accounts/ui/AccountsTable.vue'
import { Button, TypographyText, TypographyTitle } from 'ant-design-vue'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'

const accountsTableRef = useTemplateRef('accountsTableRef')
</script>

<style scoped lang="less">
.accounts-manage {
  &__header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__body {
    display: grid;
    grid-template-columns: repeat(1, minmax(min-content, max-content));
    grid-template-rows: repeat(2, auto);
  }

  &__body-hint {
    display: flex;
    gap: 8px;
    padding: 4px 8px;
    margin-bottom: 8px;
    background-color: lightgray;
    border-radius: 4px;

    &-icon {
      padding-top: 4px;
    }
  }
}
</style>
