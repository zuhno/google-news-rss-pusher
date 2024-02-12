export const linkMap: {
  [categoryId: number]: { label: string; path: string; component: () => Promise<any> };
} = {
  1: {
    label: "부동산",
    path: "/real-estate",
    component: () => import("@/views/FeedRealEstateView.vue"),
  },
  2: {
    label: "블록체인",
    path: "/blockchain",
    component: () => import("@/views/FeedBlockchainView.vue"),
  },
  3: {
    label: "스타트업",
    path: "/startup",
    component: () => import("@/views/FeedStartupView.vue"),
  },
  4: {
    label: "AI",
    path: "/ai",
    component: () => import("@/views/FeedAiView.vue"),
  },
};
