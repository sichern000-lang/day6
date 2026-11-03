import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { BG, buildTerrainGeometry, heightAt, toWorld } from '../lib/islandTerrain'
import { buildProps } from '../lib/islandProps'

// 낮은 폴리곤 3D 제주 섬. 돌려 보고 확대하고, 핀을 누르면 onPick(key) 로 알려 줌.
// pins: [{ key, kind: 'story' | 'place', x, y, name, sub, drawing? }]  (x, y 는 Story Map 과 같은 지도 좌표)
const INK = '#1d2616'
const HOME = { pos: new THREE.Vector3(0, 300, 540), target: new THREE.Vector3(0, 0, 4) }
const ease = (t) => 1 - Math.pow(1 - t, 3)
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// 핀 그림(원형 배지)을 캔버스로 그려 스프라이트 질감으로 씀
function badge(pin, state) {
  const S = 160, c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')
  const on = state === 'on', hot = state === 'hot'
  g.lineWidth = 4; g.strokeStyle = INK
  if (pin.kind === 'story') {
    g.beginPath(); g.arc(S / 2, S / 2, 40, 0, Math.PI * 2)
    g.fillStyle = on ? INK : '#cfe0ec'; g.fill(); g.stroke()
  } else {
    g.beginPath(); g.arc(S / 2, S / 2, 62, 0, Math.PI * 2)
    g.fillStyle = on ? '#cfe0ec' : hot ? '#f4f8f5' : '#fbfdfb'; g.fill(); g.stroke()
    if (pin.drawing) {
      g.save(); g.translate(S / 2 - 38, S / 2 - 38); g.scale(76 / 200, 76 / 200)
      g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = INK
      try { g.stroke(new Path2D(pin.drawing)) } catch { /* 그림 경로가 잘못돼도 배지만 보이게 */ }
      g.restore()
    } else { g.beginPath(); g.arc(S / 2, S / 2, 8, 0, Math.PI * 2); g.fillStyle = INK; g.fill() }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const IslandScene = forwardRef(function IslandScene({ pins, selectedKey, onPick, onHover, autoRotate }, ref) {
  const mount = useRef(null)
  const api = useRef({})
  const cb = useRef({})
  cb.current = { onPick, onHover }

  useImperativeHandle(ref, () => ({ reset: () => api.current.reset?.() }), [])

  // ── 장면은 한 번만 만들고, 핀·선택·자동 회전은 아래 효과에서 바꿔 줌 ──
  useEffect(() => {
    const el = mount.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }) } catch { cb.current.onHover?.({ error: true }); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(BG, 950, 1900)
    const camera = new THREE.PerspectiveCamera(34, 1, 10, 3000)
    let fitK = 1, moved = false                                   // 화면이 좁을수록(가로로 짧을수록) 멀리서 보여 섬 전체가 들어오게 함
    const homePos = () => HOME.target.clone().addScaledVector(HOME.pos.clone().sub(HOME.target), fitK)
    camera.position.copy(homePos())
    const controls = new OrbitControls(camera, renderer.domElement)
    Object.assign(controls, { enableDamping: true, dampingFactor: 0.07, enablePan: false, minDistance: 230, maxDistance: 1000, minPolarAngle: 0.25, maxPolarAngle: 1.3, autoRotateSpeed: 0.35, rotateSpeed: 0.6, zoomSpeed: 0.7 })
    controls.target.copy(HOME.target)

    // 빛: 차가운 하늘빛 + 한쪽에서 비치는 햇빛 → 평평한 면마다 명암이 생겨 폴리곤이 살아남
    scene.add(new THREE.HemisphereLight('#f4f8f6', '#aebfa8', 1.15))
    const sun = new THREE.DirectionalLight('#ffffff', 1.55)
    sun.position.set(-260, 420, 180)
    scene.add(sun)

    const world = new THREE.Group()
    scene.add(world)
    const land = new THREE.Mesh(buildTerrainGeometry(), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, metalness: 0, transparent: true }))
    world.add(land)

    // 바다: 반투명한 면 — 아래 해저의 푸른 그라데이션이 비쳐서 얕은 물처럼 보임
    const fade = document.createElement('canvas'); fade.width = fade.height = 256
    const fg = fade.getContext('2d'), gr = fg.createRadialGradient(128, 128, 20, 128, 128, 128)
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.62, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
    fg.fillStyle = gr; fg.fillRect(0, 0, 256, 256)
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(940, 560), new THREE.MeshBasicMaterial({ color: '#cfe2ee', transparent: true, opacity: 0.6, alphaMap: new THREE.CanvasTexture(fade), depthWrite: false }))
    sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.25, 0)
    world.add(sea)

    const props = buildProps({ animate: !reduce() })                  // 해녀·한라봉·흑돼지·돌하르방·올레길 여행자 같은 작은 친구들
    world.add(props.root)

    // ── 핀 ──
    const pinGroup = new THREE.Group()
    world.add(pinGroup)
    let items = [], hover = null, selected = null, introT = reduce() ? 1 : 0
    const textures = new Map()
    const texFor = (it, state) => {
      const k = `${it.pin.key}|${state}|${it.pin.drawing?.length ?? 0}`
      if (!textures.has(k)) textures.set(k, badge(it.pin, state))
      return textures.get(k)
    }
    const style = (it) => {
      const state = it.pin.key === selected ? 'on' : it.pin.key === hover ? 'hot' : 'off'
      it.sprite.material.map = texFor(it, state)
      it.sprite.material.needsUpdate = true
      const base = it.pin.kind === 'story' ? 17 : 27
      it.base = base * (state === 'on' ? 1.22 : state === 'hot' ? 1.12 : 1)
    }
    api.current.setPins = (list) => {
      pinGroup.clear(); items = []
      for (const pin of list) {
        const w = toWorld(pin.x, pin.y)
        const h = Math.max(1, heightAt(pin.x, pin.y))
        const top = h + (pin.kind === 'story' ? 24 : 30)
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false }))
        sprite.position.set(w.x, top, w.z); sprite.renderOrder = 10
        const stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(w.x, h, w.z), new THREE.Vector3(w.x, top - 9, w.z)]), new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.45 }))
        const foot = new THREE.Mesh(new THREE.CircleGeometry(2.6, 20), new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.55 }))
        foot.rotation.x = -Math.PI / 2; foot.position.set(w.x, h + 0.4, w.z)
        pinGroup.add(sprite, stem, foot)
        const it = { pin, sprite, base: 20, world: new THREE.Vector3(w.x, top, w.z) }
        style(it); items.push(it)
      }
    }
    api.current.setSelected = (key) => {
      selected = key; items.forEach(style)
      const it = items.find((i) => i.pin.key === key)
      if (it) glide = { from: controls.target.clone(), to: new THREE.Vector3(it.world.x * 0.85, 8, it.world.z * 0.85), t: 0 }
    }
    api.current.setAuto = (on) => { controls.autoRotate = on }
    let glide = null, tween = null
    api.current.reset = () => { moved = false; tween = { p0: camera.position.clone(), t0: controls.target.clone(), t: 0 }; glide = null }

    // ── 크기 · 입력 ──
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
      fitK = Math.min(3.4, Math.max(1, 2.5 / camera.aspect))
      scene.fog.near = 950 * fitK; scene.fog.far = 1900 * fitK; controls.maxDistance = 1000 * fitK     // 멀리서 볼수록 안개·최대 거리도 함께 늘려 섬이 흐려지지 않게
      if (!moved && !tween) camera.position.copy(homePos())
    }
    const ro = new ResizeObserver(resize); ro.observe(el); resize()

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2()
    // 핀을 먼저 찾고, 없으면 작은 친구들(눌러서 설명을 볼 수 있는 것)을 찾음
    const pick = (e) => {
      const r = renderer.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hits = ray.intersectObjects(items.map((i) => i.sprite))
      if (hits.length) { const it = items.find((i) => i.sprite === hits[0].object); return { key: it.pin.key, pin: it.pin, world: it.world } }
      const ph = ray.intersectObjects(props.interactive, true)
      if (ph.length) {
        let o = ph[0].object
        while (o && !o.userData.prop) o = o.parent
        if (o) { const w = new THREE.Vector3(); o.getWorldPosition(w); return { key: `prop:${o.userData.prop}`, prop: o.userData.prop, world: w.add(new THREE.Vector3(0, 26 * o.scale.y * world.scale.y, 0)), ground: w } }
      }
      return null
    }
    const screenOf = (v) => {
      const p = v.clone().project(camera), r = renderer.domElement.getBoundingClientRect()
      return { x: (p.x * 0.5 + 0.5) * r.width, y: (-p.y * 0.5 + 0.5) * r.height }
    }
    let down = null, idle
    const onMove = (e) => {
      if (e.buttons) return
      const it = pick(e)
      const key = it?.key ?? null
      renderer.domElement.style.cursor = it ? 'pointer' : 'grab'
      if (key !== hover) { hover = key; items.forEach(style) }
      cb.current.onHover?.(it ? { key, pin: it.pin ?? null, prop: it.prop ?? null, ...screenOf(it.world) } : null)
    }
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY } }
    const onUp = (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return
      const it = pick(e)
      if (!it) return
      if (it.prop) glide = { from: controls.target.clone(), to: new THREE.Vector3(it.ground.x * 0.85, 8, it.ground.z * 0.85), t: 0 }
      cb.current.onPick?.(it.key)
    }
    const onLeave = () => { hover = null; items.forEach(style); cb.current.onHover?.(null) }
    const dom = renderer.domElement
    dom.addEventListener('pointermove', onMove); dom.addEventListener('pointerdown', onDown); dom.addEventListener('pointerup', onUp); dom.addEventListener('pointerleave', onLeave)
    // 사용자가 만지는 동안은 자동 회전을 멈추고, 가만히 두면 다시 돎
    let wantAuto = true
    const stopAuto = () => { moved = true; clearTimeout(idle); controls.autoRotate = false }
    const resumeAuto = () => { clearTimeout(idle); idle = setTimeout(() => { controls.autoRotate = wantAuto }, 4500) }
    controls.addEventListener('start', stopAuto); controls.addEventListener('end', resumeAuto)
    api.current.setAuto = (on) => { wantAuto = on; controls.autoRotate = on }

    // ── 그리기 ──
    const clock = new THREE.Clock()
    let raf
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, clock.getDelta())
      if (introT < 1) { introT = Math.min(1, introT + dt / 1.7); world.scale.y = 0.02 + 0.98 * ease(introT) }
      if (glide) { glide.t = Math.min(1, glide.t + dt / 0.9); controls.target.lerpVectors(glide.from, glide.to, ease(glide.t)); if (glide.t >= 1) glide = null }
      if (tween) {
        tween.t = Math.min(1, tween.t + dt / 0.9)
        camera.position.lerpVectors(tween.p0, homePos(), ease(tween.t)); controls.target.lerpVectors(tween.t0, HOME.target, ease(tween.t))
        if (tween.t >= 1) tween = null
      }
      for (const it of items) {                                    // 핀은 섬이 솟은 뒤에 떠오르고, 멀리서도 같은 크기로 보이게 거리에 맞춰 조절
        const dist = camera.position.distanceTo(it.sprite.position)
        const s = it.base * (dist / 560) * Math.min(1, Math.max(0, (introT - 0.55) / 0.45))
        it.sprite.scale.set(s, s, 1)
      }
      props.update(clock.elapsedTime, dt)
      controls.update()
      renderer.render(scene, camera)
    }
    loop()
    resumeAuto(); controls.autoRotate = !reduce()
    wantAuto = !reduce()
    api.current.screenOf = screenOf
    api.current.items = () => items

    return () => {
      cancelAnimationFrame(raf); clearTimeout(idle); ro.disconnect()
      dom.removeEventListener('pointermove', onMove); dom.removeEventListener('pointerdown', onDown); dom.removeEventListener('pointerup', onUp); dom.removeEventListener('pointerleave', onLeave)
      controls.dispose()
      scene.traverse((o) => { o.geometry?.dispose?.(); const m = o.material; if (m) { (Array.isArray(m) ? m : [m]).forEach((x) => { x.map?.dispose?.(); x.alphaMap?.dispose?.(); x.dispose() }) } })
      textures.forEach((t) => t.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => { api.current.setPins?.(pins) }, [pins])
  useEffect(() => { api.current.setSelected?.(selectedKey) }, [selectedKey, pins])
  useEffect(() => { api.current.setAuto?.(autoRotate && !reduce()) }, [autoRotate])

  return <div className="island-canvas" ref={mount} />
})

export default IslandScene
