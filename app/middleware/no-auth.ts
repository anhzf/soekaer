export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser();
  return !user;
});
