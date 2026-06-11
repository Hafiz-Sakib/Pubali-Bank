import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // This is a client-side banking SPA — disable SSR for all routes.
    // Auth pages, dashboard, cards etc. all rely on localStorage which is
    // unavailable during server rendering. SSR is not needed for a secured app.
    defaultSsr: false,
  });

  return router;
};
