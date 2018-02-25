import Vue from "vue";
import ElementUI from "element-ui";

import App from "./App";
import router from "./router";
if (!process.env.IS_WEB) Vue.use(require("vue-electron"));

Vue.config.productionTip = false;

Vue.use(ElementUI);
import "element-ui/lib/theme-chalk/index.css";

/* eslint-disable no-new */
new Vue({
    components: {App},
    router,
    template: "<App/>"
}).$mount("#app");
