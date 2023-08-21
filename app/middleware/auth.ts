export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser();

  if (!user) {
    return ({
      name: 'auth',
      query: {
        redirect: to.fullPath,
      },
    });
  }
})
