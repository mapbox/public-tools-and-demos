import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import ResetButton from './components/ResetButton'
import type { Point } from './utils/colorUtils'

function buildCurve(points: Point[], aspectRatio: number) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p.x * aspectRatio, p.y, 0))
  )
  curve.curveType = 'catmullrom'
  curve.tension = 0.5
  return curve
}

interface ColorCurveProps {
  color: string
  label: string
  points: Point[]
  onChange: (points: Point[]) => void
  onReset?: () => void
}

export default function ColorCurve({
  color,
  label,
  points,
  onChange,
  onReset
}: ColorCurveProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedMidpointIndex, setDraggedMidpointIndex] = useState<
    number | null
  >(null)
  const [aspectRatio, setAspectRatio] = useState(1)

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = 120

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1f2937) // gray-800
    sceneRef.current = scene

    // Camera (orthographic for 2D)
    const ratio = width / height
    const camera = new THREE.OrthographicCamera(0, ratio, 1, 0, 0.1, 10)
    camera.position.z = 1
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer

    setAspectRatio(ratio)

    // Resize observer to handle container width changes
    const observer = new ResizeObserver((entries) => {
      const newWidth = entries[0].contentRect.width
      if (!newWidth || !rendererRef.current || !cameraRef.current) return
      const newRatio = newWidth / height
      rendererRef.current.setSize(newWidth, height)
      cameraRef.current.right = newRatio
      cameraRef.current.updateProjectionMatrix()
      setAspectRatio(newRatio)
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      renderer.dispose()
    }
  }, [])

  // Render curve and points
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return

    const scene = sceneRef.current
    const camera = cameraRef.current
    const renderer = rendererRef.current

    scene.clear()

    const curve = buildCurve(points, aspectRatio)

    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)),
        new THREE.LineBasicMaterial({ color })
      )
    )

    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x374151,
      transparent: true,
      opacity: 0.3
    })
    for (let i = 0; i <= 4; i++) {
      const y = i * 0.25
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, y, -0.1),
            new THREE.Vector3(aspectRatio, y, -0.1)
          ]),
          gridMaterial
        )
      )
      const x = i * 0.25 * aspectRatio
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, 0, -0.1),
            new THREE.Vector3(x, 1, -0.1)
          ]),
          gridMaterial
        )
      )
    }

    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(aspectRatio, 0, 0),
          new THREE.Vector3(aspectRatio, 1, 0),
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 0, 0)
        ]),
        new THREE.LineBasicMaterial({ color: 0x4b5563 })
      )
    )

    for (let i = 0; i < points.length - 1; i++) {
      const curvePoint = curve.getPointAt((i + 0.5) / (points.length - 1))
      const midCircle = new THREE.Mesh(
        new THREE.CircleGeometry(0.024, 16),
        new THREE.MeshBasicMaterial({
          color: draggedMidpointIndex === i ? 0xffffff : 0x1f2937,
          transparent: true,
          opacity: draggedMidpointIndex === i ? 1 : 0.5
        })
      )
      midCircle.position.set(curvePoint.x, curvePoint.y, 0.09)
      scene.add(midCircle)

      const midStroke = new THREE.Mesh(
        new THREE.RingGeometry(0.024, 0.03, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      )
      midStroke.position.set(curvePoint.x, curvePoint.y, 0.09)
      scene.add(midStroke)
    }

    points.forEach((point, index) => {
      const circle = new THREE.Mesh(
        new THREE.CircleGeometry(0.04, 32),
        new THREE.MeshBasicMaterial({
          color: draggedIndex === index ? 0xffffff : color
        })
      )
      circle.position.set(point.x * aspectRatio, point.y, 0.1)
      scene.add(circle)

      const stroke = new THREE.Mesh(
        new THREE.RingGeometry(0.04, 0.05, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      )
      stroke.position.set(point.x * aspectRatio, point.y, 0.1)
      scene.add(stroke)
    })

    renderer.render(scene, camera)
  }, [points, color, draggedIndex, draggedMidpointIndex, aspectRatio])

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left) / rect.width
    const y = 1 - (e.clientY - rect.top) / rect.height // Flip Y

    const curve = buildCurve(points, aspectRatio)

    for (let i = 0; i < points.length - 1; i++) {
      const curvePoint = curve.getPointAt((i + 0.5) / (points.length - 1))
      const dist = Math.sqrt(
        (curvePoint.x / aspectRatio - x) ** 2 + (curvePoint.y - y) ** 2
      )
      if (dist < 0.06) {
        setDraggedMidpointIndex(i)
        // Insert new point at the midpoint
        const newPoints = [...points]
        newPoints.splice(i + 1, 0, {
          x: curvePoint.x / aspectRatio,
          y: curvePoint.y
        })
        onChange(newPoints)
        setDraggedIndex(i + 1)
        return
      }
    }

    // Find closest control point
    let closestIndex = 0
    let closestDist = Infinity
    points.forEach((point, index) => {
      const dist = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2)
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = index
      }
    })

    if (closestDist < 0.1) {
      setDraggedIndex(closestIndex)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedIndex === null) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))

    // Constrain X to be between adjacent points
    const minX = draggedIndex > 0 ? points[draggedIndex - 1].x + 0.001 : 0
    const maxX =
      draggedIndex < points.length - 1 ? points[draggedIndex + 1].x - 0.001 : 1
    const constrainedX = Math.max(minX, Math.min(maxX, x))

    const newPoints = [...points]
    newPoints[draggedIndex] = { x: constrainedX, y }
    onChange(newPoints)
  }

  const handleMouseUp = () => {
    setDraggedIndex(null)
    setDraggedMidpointIndex(null)
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
        className='border border-gray-300 rounded cursor-pointer w-full'
        style={{ display: 'block', height: '120px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}
