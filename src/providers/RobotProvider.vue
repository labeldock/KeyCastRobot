<script lang="ts">
import { defineComponent } from "vue"
export const symbolTopicTypeWrite = Symbol("topicTypeWrite")
export default defineComponent({})
</script>
<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, provide } from "vue"
import { topicEvent } from "~/shared/utils/eventHelper"
const robot = window.require('@jitsi/robotjs')
const event = topicEvent()
import { requestIPCAsync } from "~/shared/rendererSupport.js"

function handleTypeWrite({ type, value }){
  if (type === "typeString") {
    console.log("request =", value)
    requestIPCAsync("mainTypeWrite", value)
  }
}

onBeforeMount(()=>{
  event.addListener(handleTypeWrite)
})

onBeforeUnmount(()=>{
  event.destroy()
})

provide(symbolTopicTypeWrite, event)
</script>

<template>
  <slot />
</template>
