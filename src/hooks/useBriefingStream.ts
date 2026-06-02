import { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api'
import { SSE_EVENT } from '../constants/briefing'
import type {
  BriefingFailedEvent,
  BriefingPartialDoneEvent,
  BriefingProgressEvent,
  BriefingTerminalEvent,
} from '../types/briefing'
import { createBriefingStreamToken } from '../api/briefings'

type StreamState = 'idle' | 'connecting' | 'open' | 'closed' | 'failed'

type UseBriefingStreamOptions = {
  briefingId: number
  onProgress?: (event: BriefingProgressEvent) => void
  onDone?: (event: BriefingTerminalEvent) => void
}

export function useBriefingStream({
  briefingId,
  onProgress,
  onDone,
}: UseBriefingStreamOptions) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const [state, setState] = useState<StreamState>('idle')

  const close = useCallback(() => {
    eventSourceRef.current?.close()
    eventSourceRef.current = null
    setState('closed')
  }, [])

  const connect = useCallback(async () => {
    close()
    setState('connecting')

    const { streamToken } = await createBriefingStreamToken(briefingId)
    const streamPath = API_ENDPOINTS.briefings.stream(briefingId, streamToken)
    const eventSource = new EventSource(`${API_BASE_URL}${streamPath}`)

    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setState('open')
    }

    eventSource.onerror = () => {
      setState('failed')
      close()
    }

    eventSource.addEventListener(SSE_EVENT.progress, (message) => {
      onProgress?.(parseSsePayload<BriefingProgressEvent>(message))
    })

    eventSource.addEventListener(SSE_EVENT.done, (message) => {
      onDone?.(parseSsePayload<BriefingTerminalEvent>(message))
      close()
    })

    eventSource.addEventListener(SSE_EVENT.partialDone, (message) => {
      onDone?.(parseSsePayload<BriefingPartialDoneEvent>(message))
      close()
    })

    eventSource.addEventListener(SSE_EVENT.failed, (message) => {
      onDone?.(parseSsePayload<BriefingFailedEvent>(message))
      close()
    })
  }, [briefingId, close, onDone, onProgress])

  useEffect(() => close, [close])

  return {
    state,
    connect,
    close,
  }
}

function parseSsePayload<T>(message: MessageEvent<string>) {
  return JSON.parse(message.data) as T
}
