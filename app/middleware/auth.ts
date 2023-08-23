export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser();

  if (to.meta.skipAuth === true) return true;

  // if (to.meta.noAuth === true && user) return ({
  //   name: 'index'
  // });

  if (!user) {
    return ({
      name: 'auth',
      query: {
        redirect: to.fullPath,
      },
    });
  }
})
