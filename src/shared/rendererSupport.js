import { standardEvent } from './utils/eventHelper'
import { generateUUID } from './utils/functions'
const { ipcRenderer } = window.require('electron')

export const browserId = generateUUID()
export const browserFetch = window.fetch

export function requestIPCAsync(channel, ...values) {
  const ipcTerminalName = `${channel}/ipcTerminal/async`
  return ipcRenderer.invoke(ipcTerminalName, ...values)
}

export function requestIPCSync(channel, ...values) {
  const ipcTerminalName = `${channel}/ipcTerminal/sync`
  const response = ipcRenderer.sendSync(ipcTerminalName, ...values)
  return response
}

export function connectIPCSentChannel(channel, value) {
  const ipcTerminalName = `${channel}/ipcTerminal/sent`
  const connectorId = generateUUID()
  const replyAddress = `${ipcTerminalName}/${browserId}/${connectorId}`
  const unsubAddress = `${ipcTerminalName}/unsubscribe/${browserId}/${connectorId}`
  const stdEvent = standardEvent()

  ipcRenderer.on(replyAddress, (event, payload) => {
    const { type = 'default', value } = payload
    stdEvent.emit(type, value)
  })

  ipcRenderer.send(ipcTerminalName, { sender: browserId, replyAddress, unsubAddress, value })

  return {
    listen(type, handler) {
      if (typeof type === 'function') {
        stdEvent.on('default', type)
      } else if (typeof type === 'string' && typeof handler === 'function') {
        stdEvent.on(type, handler)
      }
    },
    destroy(value) {
      ipcRenderer.send(unsubAddress, { sender: browserId, replyAddress, value })
    },
  }
}

