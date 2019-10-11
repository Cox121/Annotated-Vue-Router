/* @flow */

export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
  // queue beforeRouteLeave、beforeEach、beforeRouteUpdate、定义在路由上的beforeEnter、  钩子
  // fn base.js中的 iterator 函数
  const step = index => {
    if (index >= queue.length) {
      cb()
    } else {
      if (queue[index]) {
        fn(queue[index], () => {
          step(index + 1)
        })
      } else {
        step(index + 1)
      }
    }
  }
  step(0)
}
