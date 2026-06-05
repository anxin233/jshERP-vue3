import JModal from './JModal'
import JFormContainer from './JFormContainer.vue'
import JPopup from './JPopup.vue'

export default {
  install(app) {
    app.component('JFormContainer', JFormContainer)
    app.component(JModal.name, JModal)
    app.component(JPopup.name, JPopup)
  }
}
