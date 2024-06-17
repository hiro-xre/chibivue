import { VNode, VNodeProps, createVNode } from "./vnode"

export function h(
  type: string,
  props: VNodeProps,
  children: (VNode | string)[],
) {
  createVNode(type, props, children)
}
