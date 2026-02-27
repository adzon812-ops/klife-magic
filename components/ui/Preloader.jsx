'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader({ onComplete }) {
  const canvasRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  // Particle logo animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // Create particles that form "K-LIFE" text
    const particles = []
    const PARTICLE_COUNT = 120

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2
      const r = 60 + Math.random() * 100
      particles.push({
        x: cx + Math.cos(angle) * r * 3,
        y: cy + Math.sin(angle) * r * 3,
        targetX: cx + Math.cos(angle) * r,
        targetY: cy + Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random(),
        hue: 140 + Math.random() * 80,
        speed: 0.03 + Math.random() * 0.04,
      })
    }

    let animId
    let startTime = Date.now()

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150)
      grad.addColorStop(0, 'rgba(168, 230, 207, 0.08)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += (p.targetX - p.x) * p.speed
        p.y += (p.targetY - p.y) * p.speed

        const elapsed = (Date.now() - startTime) / 1000
        p.opacity = Math.min(1, elapsed * 0.5) * (0.4 + Math.sin(elapsed * 2 + p.hue) * 0.3)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 75%, ${p.opacity})`
        ctx.fill()

        // Connections
        particles.forEach((other) => {
          const d = Math.hypot(p.x - other.x, p.y - other.y)
          if (d < 30) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `hsla(${p.hue}, 70%, 75%, ${(1 - d / 30) * 0.15})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animId)
  }, [])

  // Progress simulation
  useEffect(() => {
    const steps = [15, 35, 55, 70, 85, 95, 100]
    let i = 0
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i])
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setVisible(false)
          setTimeout(onComplete, 900)
        }, 400)
      }
    }, 300)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="preloader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <canvas
            ref={canvasRef}
            className="preloader-canvas"
            style={{ width: '100%', height: '100%' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="preloader-logo">
              K<span style={{ color: '#a8e6cf' }}>—</span>LIFE
            </div>
          </motion.div>

          <motion.div
            className="preloader-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            The Magic of Purity
          </motion.div>

          <div className="preloader-progress">
            <div
              className="preloader-progress-bar"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>

          <motion.div
            className="preloader-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.8 }}
            style={{ fontSize: '0.58rem' }}
          >
            {progress < 100 ? `LOADING ${progress}%` : 'WELCOME'}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
