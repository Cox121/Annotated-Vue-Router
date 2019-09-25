import View from './components/view'
import Link from './components/link'

export let _Vue

//在使用Vue.use挂载vue-router时会被调用
export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    // 在每个组件的beforeCreate生命周期执行
    beforeCreate () {
      if (isDef(this.$options.router)) {
        //组件选项里定义了router选项，说明这个组件一定是根路由组件
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this) //在这里调用router的初始化方法
        /*
        defineReactive (
          obj: Object,
          key: string,
          val: any,
          customSetter?: ?Function,
          shallow?: boolean
        )
        */
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        //对于子组件而言，其根路由组件始终与父元素的根路由组件相同
        //由于vue组件的树状结构，这样可以保证所有组件的根路由组件指向挂载了router实例的那个组件
        //这样可以实现无论在哪个组件内都可以操纵路由
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  //将this._routerRoot._router 和 this._routerRoot._route的值代理到 $router 和 $route
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  //组测vue-router的内置组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
