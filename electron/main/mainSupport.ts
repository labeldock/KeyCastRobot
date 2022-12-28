import { ipcMain } from 'electron'
export function openIPCResponseAsync(channel, handler) {
  const ipcTerminalName = `${channel}/ipcTerminal/async`
  ipcMain.handle(ipcTerminalName, async (event, ...values) => {
    return await handler(...values)
  })
}

export function openIPCResponseSync(channel, handler) {
  const ipcTerminalName = `${channel}/ipcTerminal/sync`
  ipcMain.on(ipcTerminalName, (event, ...values) => {
    const sendValue = handler(...values)
    event.returnValue = sendValue
  })
}

export function openIPCSentChennel(channel, handler) {
  const ipcTerminalName = `${channel}/ipcTerminal/sent`

  function handleIPCChannel(event, payload) {
    const { sender, value, replyAddress, unsubAddress } = payload

    ipcMain.once(unsubAddress, (event, payload) => {
      ipcMain.off(handleIPCChannel)
      if (typeof unsubscribeAction === 'function') {
        unsubscribeAction(payload)
      }
    })

    function callback(sentValue, type = 'default') {
      event.reply(replyAddress, {
        value: sentValue,
        type,
      })
    }
    let unsubscribeAction = handler(value, callback)
  }
  ipcMain.on(ipcTerminalName, handleIPCChannel)
}
