import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createVuetify } from "vuetify";

const vuetify = createVuetify();

const app = createApp(App);

app.use(vuetify);
app.use(router);

app.mount("#app");
