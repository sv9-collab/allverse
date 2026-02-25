import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function Orb({ cpuLoad }) {
    const meshRef = useRef()
    const innerRef = useRef()

    useFrame((state, delta) => {
        if (!meshRef.current || !innerRef.current) return
        meshRef.current.rotation.x += delta * 0.2
        meshRef.current.rotation.y += delta * 0.3
        innerRef.current.rotation.z -= delta * 0.4

        const scale = 1 + (cpuLoad / 100) * 0.5
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    })

    return (
        <group>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[2, 2]} />
                <meshPhongMaterial color="#00f2ff" wireframe transparent opacity={0.3} emissive="#00f2ff" emissiveIntensity={0.5} />
            </mesh>
            <mesh ref={innerRef}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshPhongMaterial color="#7000ff" transparent opacity={0.6} emissive="#7000ff" emissiveIntensity={1} />
            </mesh>
            <pointLight position={[5, 5, 5]} intensity={2} color="#00f2ff" />
        </group>
    )
}

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false } }
    static getDerivedStateFromError() { return { hasError: true } }
    render() { return this.state.hasError ? null : this.props.children }
}

export default function Hypercore({ cpuLoad = 40 }) {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <ErrorBoundary>
                <Suspense fallback={null}>
                    <Canvas gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}>
                        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                        <ambientLight intensity={0.2} />
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <Orb cpuLoad={cpuLoad} />
                        </Float>
                    </Canvas>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}
