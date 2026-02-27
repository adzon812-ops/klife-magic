'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Cloud, Sky, Stars, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// =============================================
// FLOATING ISLAND
// =============================================
function FloatingIsland() {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.05
  })

  return (
    <group ref={ref} position={[0, -1.5, 0]}>
      {/* Main rock body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 1.8, 1.2, 12, 1, false]} />
        <meshStandardMaterial
          color="#5a4a3a"
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      {/* Bottom tapered rock */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[1.8, 0.3, 1.5, 12, 1, false]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.95} />
      </mesh>
      {/* Green forest top */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[2.8, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial
          color="#2d6a4f"
          roughness={0.8}
          metalness={0.05}
          envMapIntensity={0.5}
        />
      </mesh>
      {/* Forest detail bumps */}
      {Array.from({ length: 15 }, (_, i) => {
        const angle = (i / 15) * Math.PI * 2
        const r = 1.2 + Math.random() * 0.8
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * r,
              0.9 + Math.random() * 0.6,
              Math.sin(angle) * r
            ]}
          >
            <sphereGeometry args={[0.3 + Math.random() * 0.4, 8, 6]} />
            <meshStandardMaterial
              color={`hsl(${140 + Math.random() * 30}, ${50 + Math.random() * 20}%, ${28 + Math.random() * 12}%)`}
              roughness={0.85}
            />
          </mesh>
        )
      })}
      {/* Waterfall particle stream (simplified) */}
      <WaterfallStream />
    </group>
  )
}

function WaterfallStream() {
  const ref = useRef()
  const count = 60
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 2.3 + Math.random() * 0.1
      pos[i * 3 + 1] = -1.5 + Math.random() * 3
      pos[i * 3 + 2] = Math.random() * 0.1
    }
    return pos
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 0.03
      if (pos[i * 3 + 1] < -1.8) {
        pos[i * 3 + 1] = 1.0
        pos[i * 3] = 2.3 + Math.random() * 0.1
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

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
        color="#a8d8f0"
        size={0.06}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

// =============================================
// VOLUMETRIC SUN (shader-based glow)
// =============================================
function VolumetricSun() {
  const sunRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (sunRef.current) {
      sunRef.current.material.opacity = 0.9 + Math.sin(t * 1.5) * 0.05
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.08)
      glowRef.current.material.opacity = 0.12 + Math.sin(t * 0.8) * 0.04
    }
  })

  return (
    <group position={[8, 6, -20]}>
      {/* Core sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#fff5c8" transparent opacity={0.95} />
      </mesh>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color="#f4d03f" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      {/* Ray planes */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]}>
          <planeGeometry args={[0.08, 18]} />
          <meshBasicMaterial
            color="#f4d03f"
            transparent
            opacity={0.06}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// =============================================
// BIRD FLOCKING (Boids)
// =============================================
function BoidsBirds({ count = 40 }) {
  const ref = useRef()

  const boids = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        Math.random() * 10 + 2,
        (Math.random() - 0.5) * 30
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.05
      ),
    }))
  }, [count])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    boids.forEach((boid, i) => {
      // Simple boids: separation, alignment, cohesion
      const sep = new THREE.Vector3()
      const ali = new THREE.Vector3()
      const coh = new THREE.Vector3()
      let sepCount = 0, aliCount = 0, cohCount = 0

      boids.forEach((other, j) => {
        if (i === j) return
        const d = boid.pos.distanceTo(other.pos)
        if (d < 2.5) {
          sep.addScaledVector(boid.pos.clone().sub(other.pos).normalize(), 1 / d)
          sepCount++
        }
        if (d < 5) {
          ali.add(other.vel)
          aliCount++
          coh.add(other.pos)
          cohCount++
        }
      })

      if (sepCount > 0) sep.divideScalar(sepCount).normalize().multiplyScalar(0.003)
      if (aliCount > 0) ali.divideScalar(aliCount).normalize().multiplyScalar(0.001)
      if (cohCount > 0) {
        coh.divideScalar(cohCount)
        coh.sub(boid.pos).normalize().multiplyScalar(0.0008)
      }

      boid.vel.add(sep).add(ali).add(coh)
      // Speed limit
      const speed = boid.vel.length()
      if (speed > 0.08) boid.vel.normalize().multiplyScalar(0.08)
      if (speed < 0.02) boid.vel.normalize().multiplyScalar(0.02)

      boid.pos.add(boid.vel)

      // Boundary wrap
      if (boid.pos.x > 25) boid.pos.x = -25
      if (boid.pos.x < -25) boid.pos.x = 25
      if (boid.pos.y > 18) boid.pos.y = 4
      if (boid.pos.y < 0) boid.pos.y = 10
      if (boid.pos.z > 20) boid.pos.z = -20
      if (boid.pos.z < -20) boid.pos.z = 20

      // Apply to instanced mesh
      dummy.position.copy(boid.pos)
      dummy.lookAt(boid.pos.clone().add(boid.vel))
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      {/* Simple bird shape: two small planes */}
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array([
            0, 0, 0,    0.15, 0.06, 0,   0, 0, 0.4,
            0, 0, 0,   -0.15, 0.06, 0,   0, 0, 0.4,
          ])}
          count={6}
          itemSize={3}
        />
      </bufferGeometry>
      <meshBasicMaterial color="#1a2a3a" transparent opacity={0.7} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

// =============================================
// AMBIENT PARTICLES (Dust motes)
// =============================================
function DustMotes({ count = 200 }) {
  const ref = useRef()

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
      vel[i * 3] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 1] = Math.random() * 0.003 + 0.001
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002
    }
    return [pos, vel]
  }, [])

  useFrame(() => {
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3]
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      pos[i * 3 + 2] += velocities[i * 3 + 2]
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -8
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

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
        color="#f4d03f"
        size={0.025}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}

// =============================================
// BACKGROUND CLOUDS
// =============================================
function SceneClouds() {
  return (
    <>
      <Cloud position={[-12, 4, -18]} speed={0.15} opacity={0.5} scale={2.5} />
      <Cloud position={[10, 6, -22]} speed={0.1} opacity={0.4} scale={3} />
      <Cloud position={[-5, 8, -30]} speed={0.08} opacity={0.3} scale={4} />
      <Cloud position={[18, 3, -15]} speed={0.12} opacity={0.45} scale={2} />
      <Cloud position={[0, 10, -40]} speed={0.06} opacity={0.25} scale={5} />
    </>
  )
}

// =============================================
// CAMERA PARALLAX
// =============================================
function CameraParallax({ scrollProgress }) {
  const { camera } = useThree()

  useFrame((state) => {
    // Mouse parallax
    const x = state.mouse.x * 1.5
    const y = state.mouse.y * 0.8
    camera.position.x += (x - camera.position.x) * 0.02
    camera.position.y += (y + 1 - camera.position.y) * 0.02
    // Scroll: camera moves down into scene
    camera.position.z = 12 - scrollProgress * 6
    camera.lookAt(0, -1 + scrollProgress * 1, 0)
  })
  return null
}

// =============================================
// MAIN SKY SCENE
// =============================================
export default function SkyScene({ scrollProgress = 0 }) {
  return (
    <Canvas
      camera={{ position: [0, 1, 12], fov: 55, near: 0.1, far: 200 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#d4e8f5" />
      <directionalLight
        position={[8, 10, 5]}
        intensity={1.8}
        color="#fff5c8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#7bc67e" />
      <hemisphereLight skyColor="#c8e6f5" groundColor="#2d6a4f" intensity={0.6} />

      {/* Sky gradient */}
      <Sky
        distance={450000}
        sunPosition={[8, 2, -10]}
        inclination={0.48}
        azimuth={0.25}
        turbidity={4}
        rayleigh={0.8}
        mieCoefficient={0.005}
        mieDirectionalG={0.7}
      />

      {/* Stars (subtle) */}
      <Stars radius={80} depth={30} count={800} factor={2} saturation={0.3} fade speed={0.5} />

      {/* Scene elements */}
      <SceneClouds />
      <VolumetricSun />
      <FloatingIsland />
      <BoidsBirds count={35} />
      <DustMotes count={150} />

      {/* Camera control */}
      <CameraParallax scrollProgress={scrollProgress} />

      {/* Fog */}
      <fog attach="fog" args={['#c8dff5', 40, 120]} />
    </Canvas>
  )
}
