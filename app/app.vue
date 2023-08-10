<script lang="ts">
import '@material/web/all';
import { setAdapter } from '@anhzf-soekaer/shared/models';
import { Timestamp } from 'firebase/firestore';

setAdapter({
  dateTimeFromDate: (date) => Timestamp.fromDate(date),
  dateTimeToDate: (date) => date.toDate(),
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
