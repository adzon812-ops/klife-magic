'use client'
import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'

// Product geometry builder (procedural, no external model needed)
function ProductBottle({ productId, color, accentColor, isHovered, isActive }) {
  const ref = useRef()
  const labelRef = useRef()

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    if (isActive) {
      ref.current.rotation.y += 0.015
    } else if (isHovered) {
      ref.current.rotation.y = Math.sin(t * 0.8) * 0.3
    } else {
      ref.current.rotation.y += (0 - ref.current.rotation.y) * 0.05
    }
  })

  const config = {
    bubble: {
      bodyColor: '#a8d8f0',
      capColor: '#ffffff',
      shapeType: 'pouch', // refill pouch
      scale: [1, 1, 0.4],
    },
    fresh: {
      bodyColor: '#c9a8e0',
      capColor: '#f5e6ff',
      shapeType: 'pouch',
      scale: [1, 1, 0.4],
    },
    cleastar: {
      bodyColor: '#a8e6cf',
      capColor: '#ffffff',
      shapeType: 'pump',
      scale: [0.7, 1, 0.7],
    },
  }[productId] || {}

  return (
    <group ref={ref}>
      {config.shapeType === 'pouch' ? (
        <PouchShape color={config.bodyColor} capColor={config.capColor} />
      ) : (
        <PumpBottle color={config.bodyColor} capColor={config.capColor} />
      )}
    </group>
  )
}

// Refill pouch shape
function PouchShape({ color, capColor }) {
  return (
    <group>
      {/* Main pouch body */}
      <mesh castShadow>
        <boxGeometry args={[1.4, 2, 0.55]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.0}
          transmission={0.3}
          thickness={0.5}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.35, 16]} />
        <meshStandardMaterial color={capColor} roughness={0.3} />
      </mesh>
      {/* Cap lid */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.18, 0.15, 0.2, 16]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Label area */}
      <mesh position={[0, -0.1, 0.28]}>
        <boxGeometry args={[1.1, 1.3, 0.01]} />
        <meshStandardMaterial color={color} roughness={0.5} opacity={0.6} transparent />
      </mesh>
      {/* Subtle bottom crease */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[1.35, 0.18, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Specular highlight */}
      <mesh position={[-0.3, 0.3, 0.29]}>
        <planeGeometry args={[0.2, 0.6]} />
        <meshBasicMaterial color="white" transparent opacity={0.12} />
      </mesh>
    </group>
  )
}

// Pump bottle shape (K-CLEASTAR)
function PumpBottle({ color, capColor }) {
  return (
    <group>
      {/* Main bottle body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.55, 0.6, 2.2, 24]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.05}
          metalness={0.05}
          transmission={0.7}
          thickness={1}
          transparent
          opacity={0.88}
        />
      </mesh>
      {/* Pump neck */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.5, 16]} />
        <meshStandardMaterial color={capColor} roughness={0.25} />
      </mesh>
      {/* Pump head */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.25, 16]} />
        <meshStandardMaterial color={capColor} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Nozzle */}
      <mesh position={[0.3, 1.62, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.45, 12]} />
        <meshStandardMaterial color={capColor} roughness={0.3} />
      </mesh>
      {/* Label */}
      <mesh position={[0, -0.1, 0.56]}>
        <boxGeometry args={[0.9, 1.4, 0.01]} />
        <meshStandardMaterial color="white" transparent opacity={0.15} />
      </mesh>
      {/* Highlight strip */}
      <mesh position={[-0.25, 0, 0.57]}>
        <planeGeometry args={[0.12, 1.8]} />
        <meshBasicMaterial color="white" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

// =============================================
// SINGLE PRODUCT CANVAS
// =============================================
function ProductScene({ productId, isHovered, isActive }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={1.5} color="#fff5c8" castShadow />
      <directionalLight position={[-3, 3, -2]} intensity={0.4} color="#c8e6f5" />
      <pointLight position={[0, -1, 2]} intensity={0.3} color="#a8e6cf" />

      <Environment preset="dawn" />

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
        <ProductBottle
          productId={productId}
          isHovered={isHovered}
          isActive={isActive}
        />
      </Float>

      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.3}
        scale={4}
        blur={2}
        far={3}
        color="#1a3a5c"
      />

      {/* Magical particles around active product */}
      {isActive && <ProductParticles productId={productId} />}
    </>
  )
}

function ProductParticles({ productId }) {
  const ref = useRef()
  const count = 30

  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const r = 1.2 + Math.random() * 0.5
    positions[i * 3] = Math.cos(angle) * r
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3
    positions[i * 3 + 2] = Math.sin(angle) * r
    phases[i] = Math.random() * Math.PI * 2
  }

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + t * 0.5
      const r = 1.2 + Math.sin(t * 1.5 + phases[i]) * 0.3
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = Math.sin(t * 0.8 + phases[i]) * 1.5
      pos[i * 3 + 2] = Math.sin(angle) * r
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  const particleColors = {
    bubble: '#a8d8f0',
    fresh: '#c9a8e0',
    cleastar: '#a8e6cf',
  }

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={particleColors[productId] || '#ffffff'}
        size={0.05}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

// =============================================
// EXPORTED COMPONENT
// =============================================
export default function ProductCanvas({ productId, isHovered, isActive, className }) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4], fov: 40, near: 0.1, far: 50 }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      className={className}
    >
      <Suspense fallback={null}>
        <ProductScene
          productId={productId}
          isHovered={isHovered}
          isActive={isActive}
        />
      </Suspense>
    </Canvas>
  )
}
