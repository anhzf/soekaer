export default defineNuxtPlugin(() => {
  const firebaseApp = useNuxtApp().$firebaseApp;
  console.log('Has firebase App', !!firebaseApp);
})
