import "@/assets/scss/main.scss";
import "primeicons/primeicons.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import GoogleSignInPlugin from "vue3-google-signin";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();
const vuetify = createVuetify({
  components,
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 3 } },
});

app.use(router);
app.use(pinia);
app.use(VueQueryPlugin, { queryClient });
app.use(vuetify);
app.use(GoogleSignInPlugin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});

app.mount("#app");
