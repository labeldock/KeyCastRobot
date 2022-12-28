
<script lang="ts" setup>
import { inject, ref, onBeforeMount, onBeforeUnmount } from 'vue';
import { symbolTopicClipboard, symbolRefCurrentText } from '~/providers/KeyCaptureProvider.vue';
import { symbolTopicTypeWrite } from '../providers/RobotProvider.vue';

const topicClipboard = inject(symbolTopicClipboard)
const currentText = inject(symbolRefCurrentText)
const topicTypoWrite = inject(symbolTopicTypeWrite)
const textarea = ref(null)

if(topicClipboard){
  function handleChangeClipboard (event){
    console.log("change?! detected", event)
  }
  onBeforeMount(()=>{
    topicClipboard.addListener(handleChangeClipboard)
  })
  onBeforeUnmount(()=>{
    topicClipboard.removeListener(handleChangeClipboard)
  })
}

function handlePaste (){
  textarea.value.focus()
  if(topicTypoWrite){
    Promise.race(topicTypoWrite.emit({ type: "typeString", value: currentText.value })).then(()=>{
      console.log("type end")
    })
  }
}

</script>
<template>
  <div>
    <h2>Clipboared</h2>
    <div class="capture-view">
      {{ currentText }}
    </div>
    <div>
      <button @click="handlePaste()">paste</button>
    </div>
    <textarea name="" id="" cols="30" rows="10" ref="textarea"></textarea>
  </div>
</template>
