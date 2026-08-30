<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-2'">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar'

const $q = useQuasar()
</script>
