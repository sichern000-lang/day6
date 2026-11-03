import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { BG, buildTerrainGeometry, groundDistance, heightAt, toWorld } from '../lib/islandTerrain'
import { buildProps, characterModel, CHAR_HEIGHT } from '../lib/islandProps'

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

const IslandScene = forwardRef(function IslandScene({ pins, selectedKey, onPick, onHover, autoRotate, characters, placing, onPlace }, ref) {
  const mount = useRef(null)
  const api = useRef({})
  const cb = useRef({})
  cb.current = { onPick, onHover, onPlace }

  useImperativeHandle(ref, () => ({ reset: () => api.current.reset?.(), snapshot: (o) => api.current.snapshot?.(o) }), [])

  // ── 장면은 한 번만 만들고, 핀·선택·자동 회전은 아래 효과에서 바꿔 줌 ──
  useEffect(() => {
    const el = mount.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }) } catch { cb.current.onHover?.({ error: true }); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 2))   // 폰은 화면 밀도가 높아서 낮춰 그려야 부드럽게 돔
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

    // ── 내 캐릭터 + 말풍선 + 놓을 자리 표시 ──
    const charGroup = new THREE.Group(); world.add(charGroup)
    let chars = []                                                                    // { data, obj, top(로컬 높이), el(말풍선) }
    const ring = new THREE.Mesh(new THREE.RingGeometry(7, 9, 28), new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthTest: false }))
    ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.renderOrder = 9; world.add(ring)
    api.current.setChars = (list) => {
      chars.forEach((c) => c.el.remove()); charGroup.clear(); chars = []
      for (const d of list) {
        const obj = characterModel(d.type), w = toWorld(d.x, d.y)
        obj.position.set(w.x, Math.max(0.8, heightAt(d.x, d.y)), w.z); obj.userData.char = d.id
        charGroup.add(obj)
        const el = document.createElement('div'); el.className = 'island-bubble'; el.textContent = d.msg || ''
        el.style.display = d.msg ? '' : 'none'
        el.dataset.id = d.id; el.addEventListener('click', () => cb.current.onPick?.(`char:${d.id}`))
        el.style.pointerEvents = 'auto'; el.style.cursor = 'pointer'
        el.addEventListener('pointerdown', (e) => e.stopPropagation())
        el.style.transform = 'translate(-9999px, -9999px)'
        mount.current.appendChild(el)
        chars.push({ data: d, obj, top: (CHAR_HEIGHT[d.type] ?? 18) * 1.35 + 5, el, yaw: 0 })
      }
    }
    const topOf = (c) => c.obj.localToWorld(new THREE.Vector3(0, c.top, 0))
    let placingOn = false
    api.current.setPlacing = (on) => { placingOn = on; ring.visible = false; renderer.domElement.style.cursor = on ? 'crosshair' : 'grab' }
    const land_ = () => land

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
      const ch = ray.intersectObjects(chars.map((c) => c.obj), true)
      if (ch.length) {
        let o = ch[0].object
        while (o && o.userData.char === undefined) o = o.parent
        const c = chars.find((x) => x.obj === o)
        if (c) { const w = new THREE.Vector3(); c.obj.getWorldPosition(w); return { key: `char:${c.data.id}`, char: c.data.id, world: topOf(c), ground: w } }
      }
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
    const landPoint = (e) => {                                                   // 화면 위치 → 땅 위의 지도 좌표 (바다면 null)
      const r = renderer.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const h = ray.intersectObject(land_())[0]
      if (!h) return null
      const x = h.point.x + 400, y = h.point.z + 200
      return { x, y, point: h.point, onLand: groundDistance(x, y) >= 6 }
    }
    const onMove = (e) => {
      if (placingOn) {
        const lp = landPoint(e)
        ring.visible = !!lp?.onLand
        if (lp?.onLand) ring.position.set(lp.point.x, lp.point.y + 0.8, lp.point.z)
        return
      }
      if (e.buttons) return
      const it = pick(e)
      const key = it?.key ?? null
      renderer.domElement.style.cursor = it ? 'pointer' : 'grab'
      if (key !== hover) { hover = key; items.forEach(style) }
      cb.current.onHover?.(it ? { key, pin: it.pin ?? null, prop: it.prop ?? null, char: it.char ?? null, ...screenOf(it.world) } : null)
    }
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY } }
    const onUp = (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return
      if (placingOn) {
        const lp = landPoint(e)
        cb.current.onPlace?.(lp?.onLand ? { x: lp.x, y: lp.y } : { error: 'sea' })
        return
      }
      const it = pick(e)
      if (!it) return
      if (it.prop || it.char) glide = { from: controls.target.clone(), to: new THREE.Vector3(it.ground.x * 0.85, 8, it.ground.z * 0.85), t: 0 }
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
      {
        const r = renderer.domElement
        for (const c of chars) {
          const wp = c.obj.getWorldPosition(new THREE.Vector3())
          const want = Math.atan2(-(camera.position.z - wp.z), camera.position.x - wp.x)       // 카메라 쪽을 바라봄
          let d = want - c.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); c.yaw += d * Math.min(1, dt * 4)
          c.obj.rotation.y = c.yaw
          if (!reduce()) c.obj.position.y = Math.max(0.8, heightAt(c.data.x, c.data.y)) + Math.abs(Math.sin(clock.elapsedTime * 3 + c.data.x)) * 0.8
          const p = topOf(c).project(camera)
          c.el.style.transform = p.z < 1 ? `translate(${((p.x * 0.5 + 0.5) * r.clientWidth).toFixed(1)}px, ${((-p.y * 0.5 + 0.5) * r.clientHeight).toFixed(1)}px) translate(-50%, -100%)` : 'translate(-9999px, -9999px)'
        }
      }
      controls.update()
      renderer.render(scene, camera)
    }
    loop()
    resumeAuto(); controls.autoRotate = !reduce()
    wantAuto = !reduce()
    // 사진: 인스타그램에 올리기 좋은 4:5 세로 그림. 지금 보는 방향 그대로, 섬 전체와 말풍선이 들어가게 찍음
    api.current.snapshot = async ({ w = 1080, h = 1350, footer = 'Jeju Story Archive', sub = '' } = {}) => {
      const keep = { size: renderer.getSize(new THREE.Vector2()), pr: renderer.getPixelRatio(), aspect: camera.aspect, pos: camera.position.clone(), fog: [scene.fog.near, scene.fog.far], fov: camera.fov }
      renderer.setPixelRatio(1); renderer.setSize(w, h, false)
      camera.aspect = w / h
      const k = Math.min(3.4, Math.max(1, (2.5 / camera.aspect) * 0.56))
      const dir = camera.position.clone().sub(controls.target).normalize()
      camera.position.copy(controls.target).addScaledVector(dir, 614 * k * 0.92)
      scene.fog.near = 950 * k; scene.fog.far = 1900 * k
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
      const out = document.createElement('canvas'); out.width = w; out.height = h
      const g = out.getContext('2d')
      g.fillStyle = BG; g.fillRect(0, 0, w, h)
      g.drawImage(renderer.domElement, 0, 0, w, h)
      // 말풍선 (화면 위의 HTML 이라 사진에는 직접 그려 넣음)
      g.textAlign = 'center'; g.textBaseline = 'middle'
      for (const c of chars) {
        if (!c.data.msg) continue
        const p = topOf(c).project(camera)
        if (p.z >= 1) continue
        const x = (p.x * 0.5 + 0.5) * w, y = (-p.y * 0.5 + 0.5) * h - 14
        g.font = '600 34px "Pretendard", sans-serif'
        const tw = Math.min(520, g.measureText(c.data.msg).width), bw = tw + 44, bh = 64
        g.fillStyle = '#ffffff'; g.strokeStyle = INK; g.lineWidth = 3
        g.beginPath(); g.roundRect(x - bw / 2, y - bh, bw, bh, 22); g.fill(); g.stroke()
        g.beginPath(); g.moveTo(x - 10, y - 1); g.lineTo(x, y + 14); g.lineTo(x + 10, y - 1); g.closePath(); g.fillStyle = '#ffffff'; g.fill()
        g.fillStyle = INK; g.fillText(c.data.msg, x, y - bh / 2, 520)
      }
      g.fillStyle = INK; g.font = '400 54px "Instrument Serif", "Gowun Batang", serif'; g.fillText(footer, w / 2, h - 86)
      if (sub) { g.fillStyle = '#67776a'; g.font = '400 28px "Pretendard", sans-serif'; g.fillText(sub, w / 2, h - 40) }
      // 원래 상태로 되돌림
      renderer.setPixelRatio(keep.pr); renderer.setSize(keep.size.x, keep.size.y, false)
      camera.aspect = keep.aspect; camera.position.copy(keep.pos); scene.fog.near = keep.fog[0]; scene.fog.far = keep.fog[1]
      camera.updateProjectionMatrix(); renderer.render(scene, camera)
      return new Promise((res) => out.toBlob(res, 'image/png'))
    }
    api.current.screenOf = screenOf
    api.current.items = () => items

    return () => {
      cancelAnimationFrame(raf); clearTimeout(idle); ro.disconnect(); chars.forEach((c) => c.el.remove())
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
  useEffect(() => { api.current.setChars?.(characters ?? []) }, [characters])
  useEffect(() => { api.current.setPlacing?.(!!placing) }, [placing])

  return <div className="island-canvas" ref={mount} />
})

export default IslandScene
