export default defineNuxtRouteMiddleware(async () => {
  // ensure user resolved
  await getCurrentUser();
  return true;
});
