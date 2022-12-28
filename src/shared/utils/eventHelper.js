import { isPlainObject, asArray, isText } from './functions'

const badgeDefault = 'background-color:default;color:default;border-radius:default;'
const badgeGrayStyle = 'background-color:gray;color:white;border-radius:4px;padding:0 4px 0 4px;'
const badgePrimaryStyle = 'background-color:blue;color:white;border-radius:4px;padding:0 4px 0 4px;'
const badgeDangerStyle = 'background-color:red;color:white;border-radius:4px;padding:0 4px 0 4px;'
const badgeWarningStyle =
  'background-color:yellow;color:black;border-radius:4px;padding:0 4px 0 4px;'

// on emit 스타일 이벤트 헬퍼
class StandardEventClass {
  listeners = {}
  traceDebug = false

  constructor(events) {
    if (isPlainObject(events)) {
      for (const key in events) {
        this.on(key, events[key])
      }
    }

    // trace debug
    let _traceDebug = this.traceDebug
    Object.defineProperty(this, 'traceDebug', {
      enumerable: false,
      get() {
        return _traceDebug
      },
      set(aTraceDebug) {
        const enabled = Boolean(aTraceDebug)
        if (enabled) {
          console.log(`enabled traceDebug => %c${aTraceDebug}`, badgeGrayStyle, this)
          _traceDebug = aTraceDebug
        } else {
          console.log(`disabled traceDebug => ${_traceDebug}`)
          _traceDebug = false
        }
      },
    })
  }
  clone() {
    return new StandardEventClass(this.listeners)
  }
  on(key, eventFns) {
    const { listeners, traceDebug } = this
    const addTargets = asArray(eventFns)

    if (!listeners[key]) listeners[key] = []

    addTargets.forEach((fn) => {
      if (typeof fn === 'function') {
        listeners[key] = [...listeners[key], fn]
      } else {
        throw new Error('Event listener는 반드시 function 이여야 합니다.', key, eventFns)
      }
    })

    if (traceDebug) {
      console.log(
        `%c${traceDebug}%c %con%c ${key} +[${addTargets.length}] =[${listeners[key].length}]`,
        badgeGrayStyle,
        badgeDefault,
        badgePrimaryStyle,
        badgeDefault,
      )
    }

    return this
  }
  off(key, eventFns) {
    const { listeners, traceDebug } = this
    const removeTargets = asArray(eventFns)

    removeTargets.forEach((fn) => {
      if (typeof fn === 'function') {
        const beforeOffLength = traceDebug && listeners[key] ? listeners[key].length : 0

        if (listeners[key]) {
          listeners[key] = listeners[key].filter((event) => event !== fn)
        }

        if (traceDebug) {
          const afterOffLength = listeners[key] ? listeners[key].length : 0
          const removeFnsLength = removeTargets.length
          const removedLength = beforeOffLength - afterOffLength
          console.log(
            `%c${traceDebug}%c %coff%c ${key} before[${beforeOffLength}] payload[${removeFnsLength}] removed[${removedLength}] =[${afterOffLength}]`,
            badgeGrayStyle,
            badgeDefault,
            badgeDangerStyle,
            badgeDefault,
          )
        }
      } else {
        throw new Error('Event listener는 반드시 function 이여야 합니다.', key, eventFns)
      }
    })
    return this
  }
  once(key, eventFns) {
    const self = this
    const wrapFns = asArray(eventFns)
      .map((fn) => {
        if (typeof fn !== 'function') {
          return undefined
        }
        return function wrapFn() {
          fn()
          self.off(key, fn)
        }
      })
      .filter(Boolean)
    self.on(key, wrapFns)
    return self
  }
  watch(key, eventFns) {
    const self = this
    const targetFns = asArray(eventFns)
    targetFns.forEach((eventFn) => {
      self.on(eventFn)
    })
    return function unwatch() {
      targetFns.forEach((eventFn) => {
        self.off(key, eventFn)
      })
      return targetFns
    }
  }
  // watches([[]])
  watches(eventEntries) {
    const self = this
    const targetEntries = eventEntries
      .map((entry) => {
        if (!Array.isArray(entry)) {
          return null
        }
        if (typeof entry[0] !== 'string' || typeof entry[1] !== 'function') {
          return null
        }
        return [entry[0], entry[1]]
      })
      .filter(Boolean)

    targetEntries.forEach(([key, eventFn]) => self.on(key, eventFn))

    return function unwatch() {
      targetEntries.forEach(([key, eventFn]) => self.off(key, eventFn))
      return targetEntries
    }
  }
  emit(key, ...values) {
    const { listeners, traceDebug } = this
    const targets = asArray(listeners[key])

    if (traceDebug) {
      console.log(
        `%c${traceDebug}%c %cemit%c ${key} listener[${targets.length}]`,
        badgeGrayStyle,
        badgeDefault,
        badgeWarningStyle,
        badgeDefault,
        asArray(values),
      )
    }

    const result = targets.map((fn) => fn(...values))
    return result
  }
  // emit 처리중 에러가 발생할 경우 에러를 throw 하지 않고 배열에 에러 객체를 직접 담습니다
  safeEmit(key, ...values) {
    const { listeners, traceDebug } = this
    const targets = asArray(listeners[key])

    if (traceDebug) {
      console.log(
        `%c${traceDebug}%c %cemit%c ${key} listener[${targets.length}]`,
        badgeGrayStyle,
        badgeDefault,
        badgeWarningStyle,
        badgeDefault,
        asArray(values),
      )
    }

    return targets.map((fn) => {
      try {
        return fn(...values)
      } catch (error) {
        console.error(error)
        return error
      }
    })
  }
  trigger(key, values) {
    const { listeners, traceDebug } = this
    const targets = asArray(listeners[key])

    if (traceDebug) {
      console.log(
        `%c${traceDebug}%c %ctrigger%c ${key} listener[${targets.length}]`,
        badgeGrayStyle,
        badgeDefault,
        badgeWarningStyle,
        badgeDefault,
        asArray(values),
      )
    }

    const parameters = asArray(values)
    const result = targets.map((fn) => fn(...parameters))
    return result
  }
  getListeners(key) {
    if (!isText(key)) {
      return []
    }
    return asArray(this.listeners[key]).slice(0)
  }
  offEvents(key) {
    const { listeners, traceDebug } = this

    if (typeof key === 'string' && listeners[key]) {
      const beforeOffLength = traceDebug && listeners[key] ? listeners[key].length : 0

      listeners[key] = []

      if (traceDebug) {
        console.log(
          `%c${traceDebug}%c %coffEvents%c ${key} removed[${beforeOffLength}] =[0]`,
          badgeGrayStyle,
          badgeDefault,
          badgeDangerStyle,
          badgeDefault,
        )
      }
    }
  }
  cleanListeners() {
    const { listeners } = this
    const cleanedListeners = {}
    for (const key in listeners) {
      this.offEvents(key)
    }
    this.listeners = cleanedListeners
    return this
  }
  destroy() {
    this.listeners = null
    return null
  }
}

class TopicEventClass {

  event = null

  constructor(options) {
    const setup = options === 'function' ? options : options?.setup
    const evnet = new StandardEventClass()

    if (typeof setup === 'function') {
      const destroyHandler = setup(this)
      if (typeof destroyHandler === 'function') {
        event.once('destroy', () => destroyHandler)
      }
    }

    this.event = evnet
  }
  addListener(handler) {
    this.event.on('subject', handler)
  }
  removeListener(handler) {
    this.event.off('subject', handler)
  }
  emit(value) {
    return this.event.emit('subject', value)
  }
  destroy() {
    this.event.emit('destroy')
    this.event.cleanListeners()
  }
}
export const StandardEvent = StandardEventClass
export const TopicEvent = TopicEventClass
export const standardEvent = (...params) => new StandardEventClass(...params)
export const topicEvent = (...params) => new TopicEventClass(...params)
export default standardEvent
