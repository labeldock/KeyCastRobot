<script lang="ts">
import { defineComponent } from "vue"
export const symbolTopicClipboard = Symbol("topicClipboard")
export const symbolRefCurrentText = Symbol("refCurrentText")
export default defineComponent({})
</script>
<script lang="ts" setup>
import { shallowRef, onBeforeMount, onBeforeUnmount, provide } from "vue"
import { topicEvent } from "~/shared/utils/eventHelper"
import { connectIPCSentChannel } from "~/shared/rendererSupport.js"

const event = topicEvent()
const currentText = shallowRef('')
const ipcClipnoardChange = shallowRef(null)

onBeforeMount(()=>{
  ipcClipnoardChange.value = connectIPCSentChannel("clipboardChange")
  ipcClipnoardChange.value.listen((text)=>{
    currentText.value = text
    event.emit({ type: 'change', text })
  })
})

onBeforeUnmount(()=>{
  if(ipcClipnoardChange.value){
    ipcClipnoardChange.value.destroy()
    ipcClipnoardChange.value = null
  }
  event.destroy()
})
provide(symbolTopicClipboard, event)
provide(symbolRefCurrentText, currentText)
</script>
<template>
  <slot />
</template>
