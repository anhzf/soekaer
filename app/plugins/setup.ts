import { setAdapter } from '@anhzf-soekaer/shared/models';
import '@material/web/elevation/elevation';
import '@material/web/icon/icon';
import '@material/web/ripple/ripple';
import '@material/web/progress/circular-progress';
import { Timestamp, doc } from 'firebase/firestore';

export default defineNuxtPlugin(async () => {
  setAdapter({
    dateTimeFromDate: (date) => Timestamp.fromDate(date),
    dateTimeToDate: (date) => date.toDate(),
    toReference: (path) => doc(useFirestore(), path),
  });
});
