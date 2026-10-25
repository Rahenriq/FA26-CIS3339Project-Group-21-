import { createApp, markRaw } from "vue";
import router from "./router";
import App from "./App.vue";
import "./index.css";
import Toast from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";
//state management library
import { createPinia } from 'pinia'
import { useLoggedInUserStore } from './store/loggedInUser'
import { setUnauthorizedHandler } from './api/api'

const app = createApp(App);

//create a pinia root store
const pinia = createPinia();
//pinia should be able to use router - has to be setup as plugin
pinia.use(({ store }) => {
  store.$router = markRaw(router)
});

//add pinia object to our instance
app.use(pinia)
// used claude to help us format the code for F4 (to restore the session on page refresh)//
const userStore = useLoggedInUserStore(pinia)
userStore.restoreSession()
app.use(router); //claude helped moved the router for formatting and running purposed

// F2: when the axios interceptor sees a 401, clear Pinia state and go to /login
setUnauthorizedHandler(() => {
  userStore.clearSession()
  router.push('/login')
})
const options = {
  position: 'bottom-right'
};
app.use(Toast, options);
app.mount("#app");
