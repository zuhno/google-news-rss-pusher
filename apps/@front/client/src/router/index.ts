import { createRouter, createWebHistory } from "vue-router";

import { feedRoute } from "@/constants";
import DashboardView from "@/views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
    },
    // feed routes
    ...Object.values(feedRoute.linkMap).map((link) => ({
      path: link.path,
      name: link.path.replace("/", ""),
      component: link.component,
    })),
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/components/layout/PassThrough.vue"),
      children: [
        {
          path: "slack",
          component: () => import("@/views/AuthSlackView.vue"),
        },
      ],
    },
  ],
});

export default router;
