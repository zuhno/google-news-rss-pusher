import "@/assets/scss/main.scss";
import "primeicons/primeicons.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import vue3GoogleLogin from "vue3-google-login";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

const queryClient = new QueryClient();

app.use(router);
app.use(pinia);
app.use(VueQueryPlugin, { queryClient });
app.use(vue3GoogleLogin, {
  clientId: "TODO: CLIENT ID OBTAINED FROM GOOGLE API CONSOLE",
});

app.mount("#app");
