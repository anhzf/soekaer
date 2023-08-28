import { UseTimeAgoMessages, UseTimeAgoUnitNamesDefault, formatTimeAgo } from '@vueuse/core';

export const displayItemName = (item: string) => {
  const { data } = useAppSettings();
  const products = data.value?.products ?? {};
  return products[item]?.displayName ?? item;
}

const timeAgoMessages: UseTimeAgoMessages<UseTimeAgoUnitNamesDefault> = {
  justNow: 'baru saja',
  past: n => n.match(/\d/) ? `${n} lalu` : n,
  future: n => n.match(/\d/) ? `dalam ${n}` : n,
  month: (n, past) => n === 1
    ? past
      ? 'bulan kemarin'
      : 'bulan besok'
    : `${n} bulan`,
  year: (n, past) => n === 1
    ? past
      ? 'tahun kemarin'
      : 'tahun besok'
    : `${n} tahun`,
  day: (n, past) => n === 1
    ? past
      ? 'kemarin'
      : 'besok'
    : `${n} hari`,
  week: (n, past) => n === 1
    ? past
      ? 'pekan kemarin'
      : 'pekan besok'
    : `${n} pekan`,
  hour: n => `${n} jam`,
  minute: n => `${n} menit`,
  second: n => `${n} detik`,
  invalid: '',
}

export const displayTransactionTime = (date: Date) => {
  // if up to a week then display using formatTimeAgo, then display using localeDateString
  if (date > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)) {
    return formatTimeAgo(date, { messages: timeAgoMessages });
  } else {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}

export const hidePhoneNumberText = (phoneNumber: string) => phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');

