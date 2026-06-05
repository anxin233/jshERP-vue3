<template>
  <div class="main">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component ref="routeComponent" :is="Component" v-if="keepAlive" />
      </keep-alive>
      <component ref="routeComponent" :is="Component" v-if="!keepAlive" />
    </router-view>
  </div>
</template>

<script>
  export default {
    name: "RouteView",
    computed: {
      keepAlive () {
        return this.$route.meta.keepAlive
      }
    },
    methods: {
      getRouteComponent () {
        return Array.isArray(this.$refs.routeComponent)
          ? this.$refs.routeComponent[0]
          : this.$refs.routeComponent
      }
    }
  }
</script>
