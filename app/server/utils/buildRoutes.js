module.exports = (appConfig, server, express) =>
  Object.keys(appConfig.Components).forEach(key => {
    if (appConfig.Components[key].Routes) {
      const routesPath = `../../${key.toLowerCase()}/routes`
      const componentRoutes = require(routesPath)
      Object.keys(componentRoutes).forEach(rk => {
        const router = express.Router()
        // build up routes
        if (componentRoutes[rk].get) {
          Object.keys(componentRoutes[rk].get).forEach(gk => {
            router.get(gk, componentRoutes[rk].get[gk])
            // console.log('Get', gk, componentRoutes[rk].get[gk])
          })
        }
        if (componentRoutes[rk].head) {
          Object.keys(componentRoutes[rk].head).forEach(hk => {
            router.head(hk, componentRoutes[rk].head[hk])
            // console.log('Head', hk, componentRoutes[rk].head[hk])
          })
        }
        if (componentRoutes[rk].post) {
          Object.keys(componentRoutes[rk].post).forEach(pok => {
            router.post(pok, componentRoutes[rk].post[pok])
            // console.log('Post', pok, componentRoutes[rk].post[pok])
          })
        }
        if (componentRoutes[rk].put) {
          Object.keys(componentRoutes[rk].put).forEach(puk => {
            router.put(puk, componentRoutes[rk].post[puk])
            // console.log('Put', puk, componentRoutes[rk].post[puk])
          })
        }
        if (componentRoutes[rk].patch) {
          Object.keys(componentRoutes[rk].patch).forEach(pak => {
            router.patch(pak, componentRoutes[rk].patch[pak])
            // console.log('Patch', pak, componentRoutes[rk].patch[pak])
          })
        }
        if (componentRoutes[rk].delete) {
          Object.keys(componentRoutes[rk].delete).forEach(dk => {
            router.delete(dk, componentRoutes[rk].delete[dk])
            // console.log('Delete', dk, componentRoutes[rk].delete[dk])
          })
        }
        // add routes w/ middleware to server
        if (componentRoutes[rk].middleware) {
          server.use(rk, componentRoutes[rk].middleware, router)
        } else server.use(rk, router)
      })
    }
  })
