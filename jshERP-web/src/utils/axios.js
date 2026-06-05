const VueAxios = {
    vm: {},
    // eslint-disable-next-line no-unused-vars
    install(app, router = {}, instance) {
        if (this.installed) {
            return;
        }
        this.installed = true;

        if (!instance) {
            // eslint-disable-next-line no-console
            console.error('You have to install axios');
            return;
        }

        app.axios = instance;

        Object.defineProperties(app.config.globalProperties, {
            axios: {
                get: function get() {
                    return instance;
                }
            },
            $http: {
                get: function get() {
                    return instance;
                }
            }
        });
    }
};

export {
    VueAxios,
    // eslint-disable-next-line no-undef
    //instance as axios
}
