import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import ResetButton from './ResetButton'

interface ColorWheelProps {
  label: string
  offset: { x: number; y: number } // -1 to 1 range
  onChange: (offset: { x: number; y: number }) => void
  onReset?: () => void
}

export default function ColorWheel({
  label,
  offset,
  onChange,
  onReset
}: ColorWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const size = 140

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1f2937) // gray-800
    sceneRef.current = scene

    // Camera (orthographic for 2D)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    })
    renderer.setSize(size, size)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer

    return () => {
      renderer.dispose()
    }
  }, [])

  // Render color wheel and handle
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return

    const scene = sceneRef.current
    const camera = cameraRef.current
    const renderer = rendererRef.current

    // Clear previous objects
    while (scene.children.length > 0) {
      scene.remove(scene.children[0])
    }

    // Create color wheel using a ring of colored segments
    const segments = 64
    const angleStep = (Math.PI * 2) / segments
    const innerRadius = 0.7
    const outerRadius = 0.95

    for (let i = 0; i < segments; i++) {
      const angle1 = i * angleStep
      const angle2 = (i + 1) * angleStep
      const hue = i / segments

      // Create ring segment (quad made of two triangles)
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        // Triangle 1
        Math.cos(angle1) * innerRadius,
        Math.sin(angle1) * innerRadius,
        0,
        Math.cos(angle1) * outerRadius,
        Math.sin(angle1) * outerRadius,
        0,
        Math.cos(angle2) * outerRadius,
        Math.sin(angle2) * outerRadius,
        0,
        // Triangle 2
        Math.cos(angle1) * innerRadius,
        Math.sin(angle1) * innerRadius,
        0,
        Math.cos(angle2) * outerRadius,
        Math.sin(angle2) * outerRadius,
        0,
        Math.cos(angle2) * innerRadius,
        Math.sin(angle2) * innerRadius,
        0
      ])
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

      const color = new THREE.Color().setHSL(hue, 1, 0.5)
      const material = new THREE.MeshBasicMaterial({ color })
      const segment = new THREE.Mesh(geometry, material)
      scene.add(segment)
    }

    // Add dark circle in the center
    const centerGeometry = new THREE.CircleGeometry(0.7, 32)
    const centerMaterial = new THREE.MeshBasicMaterial({ color: 0x1f2937 })
    const centerCircle = new THREE.Mesh(centerGeometry, centerMaterial)
    centerCircle.position.z = 0.01
    scene.add(centerCircle)

    // Add draggable handle
    const handleGeometry = new THREE.CircleGeometry(0.08, 32)
    const handleMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6
    })
    const handle = new THREE.Mesh(handleGeometry, handleMaterial)
    handle.position.set(offset.x * 0.6, offset.y * 0.6, 0.02)
    scene.add(handle)

    // Add white stroke for handle
    const handleStrokeGeometry = new THREE.RingGeometry(0.08, 0.1, 32)
    const handleStrokeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    })
    const handleStroke = new THREE.Mesh(
      handleStrokeGeometry,
      handleStrokeMaterial
    )
    handleStroke.position.set(offset.x * 0.6, offset.y * 0.6, 0.02)
    scene.add(handleStroke)

    // Add border
    const borderGeometry = new THREE.RingGeometry(0.95, 1, 64)
    const borderMaterial = new THREE.MeshBasicMaterial({ color: 0x4b5563 })
    const border = new THREE.Mesh(borderGeometry, borderMaterial)
    scene.add(border)

    renderer.render(scene, camera)
  }, [offset, isDragging])

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

    // Check if clicking near the handle
    const handleX = offset.x * 0.6
    const handleY = offset.y * 0.6
    const dist = Math.sqrt((x - handleX) ** 2 + (y - handleY) ** 2)

    if (dist < 0.15) {
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    let x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    let y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

    // Constrain to center circle (radius 0.7 in scene coordinates)
    const dist = Math.sqrt(x * x + y * y)
    if (dist > 0.7) {
      x = (x / dist) * 0.7
      y = (y / dist) * 0.7
    }

    // Convert from scene coordinates (-0.7 to 0.7) to normalized (-1 to 1)
    onChange({
      x: x / 0.6,
      y: y / 0.6
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div ref={containerRef}>
      <div className='flex justify-between mb-1'>
        <div className='flex items-center gap-1'>
          <label className='text-xs font-medium text-gray-700'>{label}</label>
          {onReset && <ResetButton onReset={onReset} />}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className='border border-gray-300 rounded cursor-pointer'
        style={{ display: 'block', width: '120px', height: '120px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}
