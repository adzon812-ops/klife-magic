'use client'
import { useEffect, useRef, useState } from 'react'

let audioCtx = null
let masterGain = null
let isInitialized = false

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    masterGain = audioCtx.createGain()
    masterGain.gain.value = 0
    masterGain.connect(audioCtx.destination)
  }
  return { audioCtx, masterGain }
}

// Generate gentle ambient drone
function createAmbientDrone() {
  const { audioCtx, masterGain } = getAudioContext()
  const nodes = []

  // Ethereal pad: stacked sine waves
  const freqs = [220, 277.18, 329.63, 440, 523.25]
  freqs.forEach((freq, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    const filter = audioCtx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0.035 / (i + 1)
    filter.type = 'lowpass'
    filter.frequency.value = 1200 - i * 100

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)
    osc.start()

    // Slow vibrato
    const lfo = audioCtx.createOscillator()
    const lfoGain = audioCtx.createGain()
    lfo.frequency.value = 0.15 + i * 0.05
    lfoGain.gain.value = freq * 0.003
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start()

    nodes.push(osc, lfo)
  })

  // Simulated birdsong: random high-pitched blips
  function scheduleBird() {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    const baseFreq = 2000 + Math.random() * 2000
    osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioCtx.currentTime + 0.1)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, audioCtx.currentTime + 0.2)
    gain.gain.setValueAtTime(0, audioCtx.currentTime)
    gain.gain.linearRampToValueAtTime(0.025, audioCtx.currentTime + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25)
    osc.type = 'sine'
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.3)
    setTimeout(scheduleBird, 2000 + Math.random() * 5000)
  }

  setTimeout(scheduleBird, 3000)

  return nodes
}

// Whoosh sound on hover
export function playWhoosh() {
  if (!isInitialized) return
  try {
    const { audioCtx, masterGain } = getAudioContext()
    const bufferSize = audioCtx.sampleRate * 0.25
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.3
    }
    const source = audioCtx.createBufferSource()
    const filter = audioCtx.createBiquadFilter()
    const gain = audioCtx.createGain()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 0.5
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25)
    source.buffer = buffer
    source.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)
    source.start()
  } catch (e) {}
}

// Chime on click
export function playChime() {
  if (!isInitialized) return
  try {
    const { audioCtx, masterGain } = getAudioContext()
    const freqs = [659.25, 880, 1108.73]
    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + i * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.08 + 1.2)
      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(audioCtx.currentTime + i * 0.08)
      osc.stop(audioCtx.currentTime + i * 0.08 + 1.3)
    })
  } catch (e) {}
}

// =============================================
// AUDIO CONTROL BUTTON
// =============================================
export function AudioControl() {
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)
  const droneRef = useRef(null)

  function initAudio() {
    if (started) return
    const { masterGain } = getAudioContext()
    isInitialized = true
    droneRef.current = createAmbientDrone()
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 3)
    setStarted(true)
  }

  function toggleMute() {
    if (!started) {
      initAudio()
      return
    }
    const { masterGain } = getAudioContext()
    if (muted) {
      masterGain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.5)
    } else {
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5)
    }
    setMuted(!muted)
  }

  return (
    <button
      className={`audio-control ${muted || !started ? 'muted' : ''}`}
      onClick={toggleMute}
      title={started ? (muted ? 'Unmute' : 'Mute') : 'Enable Sound'}
      aria-label="Audio control"
    >
      <div className="audio-bars">
        <div className="audio-bar" />
        <div className="audio-bar" />
        <div className="audio-bar" />
        <div className="audio-bar" />
      </div>
    </button>
  )
}

export default AudioControl
