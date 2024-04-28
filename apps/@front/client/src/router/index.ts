import { createRouter, createWebHistory } from "vue-router";

import DashboardView from "@/views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/feed",
      name: "feed",
      component: () => import("@/views/FeedView.vue"),
    },
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
