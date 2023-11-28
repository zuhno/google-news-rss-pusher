import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/real-estate",
      name: "real-estate",
      component: () => import("../views/FeedRealEstateView.vue"),
    },
    {
      path: "/blockchain",
      name: "blockchain",
      component: () => import("../views/FeedBlockchainView.vue"),
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("../views/SlackAuthView.vue"),
    },
  ],
});

export default router;
