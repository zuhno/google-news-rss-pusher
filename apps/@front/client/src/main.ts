import "@/assets/scss/main.scss";
import "primeicons/primeicons.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import GoogleSignInPlugin from "vue3-google-signin";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

const queryClient = new QueryClient();

app.use(router);
app.use(pinia);
app.use(VueQueryPlugin, { queryClient });
app.use(GoogleSignInPlugin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});

app.mount("#app");
