import * as THREE from 'three'
import { characterModel } from './islandProps'

// 캐릭터 고르기 화면의 작은 그림: 3D 모델을 한 번씩 찍어서 이미지로 만들어 둠 (섬에 나오는 모양과 똑같이 보임)
const TYPES = ['pig', 'tangerine', 'horse', 'cat', 'man', 'woman']
let cache = null
export function characterPreviews() {
  if (cache) return cache
  const size = 220
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(size, size); renderer.setPixelRatio(1)
  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight('#f4f8f6', '#aebfa8', 1.2))
  const sun = new THREE.DirectionalLight('#ffffff', 1.5); sun.position.set(-40, 80, 60); scene.add(sun)
  const cam = new THREE.PerspectiveCamera(30, 1, 1, 500)
  cache = {}
  for (const t of TYPES) {
    const m = characterModel(t)
    m.rotation.y = -0.5                                       // 살짝 비스듬히
    scene.add(m)
    const box = new THREE.Box3().setFromObject(m), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3())
    const d = Math.max(s.x, s.y, s.z) * 2.4
    cam.position.set(c.x + d * 0.35, c.y + d * 0.18, c.z + d * 0.9); cam.lookAt(c)
    renderer.render(scene, cam)
    cache[t] = renderer.domElement.toDataURL('image/png')
    scene.remove(m)
  }
  renderer.dispose()
  return cache
}
