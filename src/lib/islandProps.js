import * as THREE from 'three'
import { groundDistance, heightAt, toWorld } from './islandTerrain'
import { project } from './stories'
import { rng } from './rng'

// 섬 위와 바다 위의 작은 친구들: 해녀, 한라봉 밭, 흑돼지, 돌하르방, 조랑말, 올레길을 걷는 여행자와 표지판, 배, 돌고래, 갈매기, 구름.
// 모두 낮은 폴리곤 도형을 이어 붙인 장난감 같은 모양이고, 색은 사이트 팔레트(세이지·연한 파랑)에 포인트로 주황·검정만 씀.
const C = { ink: '#1d2616', stone: '#80867c', stoneDark: '#666c63', orange: '#e28f4f', skin: '#f2dccb', wood: '#8a7058', leaf: '#5d7a54', leafLight: '#7a9a6c',
  pig: '#30352f', pigSnout: '#4e524d', pony: '#a07a5a', ponyMane: '#3a2f27', blue: '#4f8fc0', jacket: '#7fa7c4', pack: '#d97b5f', white: '#f7faf7', hull: '#f1f5f1', dolphin: '#86a3b8' }
const mats = {}
const M = (c) => (mats[c] ||= new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 1, metalness: 0 }))
const mesh = (geo, color, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, M(color)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); return m }
const sph = (r, d = 1) => new THREE.IcosahedronGeometry(r, d)
const cyl = (rt, rb, h, seg = 7) => new THREE.CylinderGeometry(rt, rb, h, seg)
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d)

// 위경도 → 땅 위 / 바다 위 자리 (섬 모양에 맞게 안쪽·바깥쪽으로 밀어서 확인)
const CENTER = project(33.3617, 126.5292)
function place(lat, lng, want, margin) {
  let { x, y } = project(lat, lng)
  for (let i = 0; i < 80; i++) {
    const d = groundDistance(x, y)
    if (want === 'land' ? d >= margin : d <= -margin) break
    const dx = x - CENTER.x, dy = y - CENTER.y, n = Math.hypot(dx, dy) || 1, k = want === 'land' ? -3 : 3
    x += (dx / n) * k; y += (dy / n) * k
  }
  const w = toWorld(x, y)
  return { x: w.x, z: w.z, y: want === 'land' ? Math.max(0.5, heightAt(x, y)) : 0.25, mx: x, my: y }
}

// ── 모양 만들기 ──
function haenyeo() {
  const g = new THREE.Group()
  g.add(mesh(sph(4.4), C.skin, 0, 5.4, 0))                                                       // 머리
  g.add(mesh(new THREE.SphereGeometry(4.7, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), C.ink, 0, 5.6, 0)) // 검은 모자
  g.add(mesh(box(5.4, 1.5, 1.2), C.blue, 0, 5.1, 3.6))                                           // 물안경
  g.add(mesh(cyl(3.6, 4.2, 4, 8), C.ink, 0, 0.6, 0))                                             // 검은 물옷 (몸은 물에 잠김)
  const arm = mesh(cyl(1, 1.1, 6, 6), C.ink, 4.8, 3.6, 0); arm.rotation.z = -0.6; g.add(arm)
  g.add(mesh(sph(1.2), C.skin, 6.5, 6.5, 0))
  const tewak = new THREE.Group()                                                                  // 테왁 (주황 부표)
  tewak.add(mesh(sph(4.6), C.orange, 0, 1.2, 0, 1, 0.72, 1))
  tewak.add(mesh(new THREE.TorusGeometry(3.4, 0.45, 5, 10), C.ink, 0, 0.4, 0, 1, 1, 1))
  tewak.children[1].rotation.x = Math.PI / 2
  tewak.position.set(-9, 0, 2)
  g.add(tewak)
  g.userData.bob = true
  return g
}
function hallabongTree() {
  const g = new THREE.Group()
  g.add(mesh(cyl(0.9, 1.3, 5, 6), C.wood, 0, 2.5, 0))
  g.add(mesh(sph(6.2, 0), C.leaf, 0, 9, 0))
  g.add(mesh(sph(4.2, 0), C.leafLight, 2.2, 11.6, -1))
  for (const [x, y, z] of [[4.6, 8.6, 2.4], [-4.2, 9.6, 3.2], [1.2, 7.2, 5.6], [-3.6, 7.6, -4.4], [2.8, 12.6, 2.4]]) g.add(mesh(sph(1.55, 1), C.orange, x, y, z))
  return g
}
function pig() {
  const g = new THREE.Group()
  g.add(mesh(sph(5, 1), C.pig, 0, 6, 0, 1.55, 0.95, 1))                       // 몸통
  g.add(mesh(sph(3.5, 1), C.pig, 8, 7, 0))                                    // 머리
  g.add(mesh(cyl(1.7, 2.1, 2.4, 6), C.pigSnout, 11.2, 6.4, 0)); g.children[g.children.length - 1].rotation.z = Math.PI / 2   // 코
  for (const z of [-1.8, 1.8]) { const e = mesh(new THREE.ConeGeometry(1.2, 2.4, 4), C.pig, 8.2, 10, z); e.rotation.x = z > 0 ? 0.4 : -0.4; g.add(e) }  // 귀
  for (const [x, z] of [[-4, -2.4], [-4, 2.4], [4, -2.4], [4, 2.4]]) g.add(mesh(cyl(1, 0.9, 4, 5), C.pig, x, 2, z))   // 다리
  g.add(mesh(cyl(0.3, 0.3, 3, 4), C.pig, -8.4, 7.6, 0)); g.children[g.children.length - 1].rotation.z = 0.7           // 꼬리
  return g
}
function hareubang() {
  const g = new THREE.Group()
  g.add(mesh(cyl(5.4, 6.6, 15, 8), C.stone, 0, 7.5, 0))                       // 몸
  g.add(mesh(sph(6.6, 1), C.stone, 0, 20, 0))                                 // 얼굴
  g.add(mesh(cyl(9, 9.4, 2.2, 10), C.stoneDark, 0, 25.4, 0))                  // 모자 챙
  g.add(mesh(cyl(4.4, 6, 5.4, 9), C.stoneDark, 0, 28.6, 0))                   // 모자
  g.add(mesh(sph(1.6, 0), C.stoneDark, 0, 19.4, 6.4, 1, 1.5, 1.1))            // 큰 코
  g.add(mesh(sph(0.95, 0), C.ink, -2.6, 21.4, 5.6)); g.add(mesh(sph(0.95, 0), C.ink, 2.6, 21.4, 5.6))   // 눈
  g.add(mesh(box(5, 1.2, 1), C.ink, 0, 17, 5.6))                              // 입
  g.add(mesh(box(2.4, 5, 2.4), C.stoneDark, -5, 10.4, 4)); g.add(mesh(box(2.4, 5, 2.4), C.stoneDark, 5, 10.4, 4))  // 배 위의 손
  return g
}
function pony() {
  const g = new THREE.Group()
  g.add(mesh(sph(4.6, 1), C.pony, 0, 8, 0, 1.55, 0.95, 0.9))
  const neck = mesh(cyl(1.7, 2.4, 6, 6), C.pony, 6.2, 11.4, 0); neck.rotation.z = -0.55; g.add(neck)
  g.add(mesh(box(4.8, 2.6, 2.4), C.pony, 10, 14, 0))
  g.add(mesh(box(5.2, 1.2, 1.2), C.ponyMane, 5.6, 14, 0)); g.children[g.children.length - 1].rotation.z = -0.55
  for (const [x, z] of [[-4, -1.8], [-4, 1.8], [4.4, -1.8], [4.4, 1.8]]) g.add(mesh(cyl(0.9, 0.7, 7, 5), C.pony, x, 3.5, z))
  g.add(mesh(cyl(0.5, 1.3, 6, 5), C.ponyMane, -8, 8, 0)); g.children[g.children.length - 1].rotation.z = 0.5
  return g
}
function traveler() {
  const g = new THREE.Group()
  g.add(mesh(cyl(2.4, 2.9, 7.4, 7), C.jacket, 0, 10.6, 0))                    // 몸
  g.add(mesh(sph(2.5, 1), C.skin, 0, 16, 0))                                  // 머리
  g.add(mesh(cyl(4.3, 4.3, 0.7, 10), C.white, 0, 17.6, 0)); g.add(mesh(cyl(2.4, 2.4, 1.6, 8), C.white, 0, 18.3, 0))   // 챙 넓은 모자
  g.add(mesh(box(4.4, 5.6, 2.4), C.pack, -2.4, 11, 0))                        // 배낭
  const legs = []
  for (const z of [-1.2, 1.2]) { const l = new THREE.Group(); l.position.set(0, 7, z); l.add(mesh(box(1.8, 7, 1.8), C.ink, 0, -3.5, 0)); g.add(l); legs.push(l) }
  const stick = mesh(cyl(0.25, 0.25, 12, 4), C.wood, 3.6, 7, 3); g.add(stick)
  g.userData.legs = legs
  return g
}
function olleSign() {
  const g = new THREE.Group()
  g.add(mesh(cyl(0.9, 1.1, 15, 6), C.wood, 0, 7.5, 0))
  const a = mesh(box(8.4, 2.6, 0.8), C.blue, 3.6, 13, 0); a.rotation.z = 0.0; g.add(a)
  g.add(mesh(new THREE.ConeGeometry(1.8, 3, 3), C.blue, 8.6, 13, 0)); g.children[g.children.length - 1].rotation.z = -Math.PI / 2
  const b = mesh(box(8.4, 2.6, 0.8), C.orange, -3.6, 9.6, 0); g.add(b)
  g.add(mesh(new THREE.ConeGeometry(1.8, 3, 3), C.orange, -8.6, 9.6, 0)); g.children[g.children.length - 1].rotation.z = Math.PI / 2
  g.add(mesh(box(0.7, 5, 0.3), C.blue, 1.6, 6.4, 1)); g.add(mesh(box(0.7, 5, 0.3), C.orange, -1.6, 6.8, 1))   // 올레 리본
  return g
}
function boat() {
  const g = new THREE.Group()
  g.add(mesh(box(18, 3.2, 6.6), C.hull, 0, 1.8, 0))
  g.add(mesh(new THREE.ConeGeometry(3.4, 6, 4), C.hull, 11.6, 1.8, 0, 1, 1, 1)); g.children[g.children.length - 1].rotation.z = -Math.PI / 2; g.children[g.children.length - 1].rotation.y = Math.PI / 4
  g.add(mesh(box(18.2, 0.9, 6.8), C.blue, 0, 3.4, 0))
  g.add(mesh(box(6, 4.6, 5), C.white, -3, 6, 0))
  g.add(mesh(cyl(0.3, 0.3, 9, 4), C.ink, 3, 8, 0))
  g.add(mesh(sph(1.1, 1), C.orange, 3, 13, 0))                                  // 집어등
  g.userData.bob = true
  return g
}
function dolphin() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(2.6, 9, 3, 7), M(C.dolphin)); body.rotation.z = Math.PI / 2; g.add(body)
  g.add(mesh(new THREE.ConeGeometry(2, 4, 3), C.dolphin, 0.5, 3.4, 0))          // 등지느러미
  g.add(mesh(new THREE.ConeGeometry(1.7, 4.2, 4), C.dolphin, 8.6, 0, 0)); g.children[g.children.length - 1].rotation.z = -Math.PI / 2
  g.add(mesh(box(1, 0.5, 6), C.dolphin, -8, 0, 0))                              // 꼬리
  g.userData.dolphin = true
  return g
}
function gull() {
  const g = new THREE.Group()
  const L = mesh(box(6.4, 0.5, 2.2), C.white, -3.2, 0, 0), R = mesh(box(6.4, 0.5, 2.2), C.white, 3.2, 0, 0)
  g.add(L, R, mesh(sph(1.1, 0), C.white, 0, 0, 0)); g.userData.wings = [L, R]
  return g
}
function cloud(r) {
  const g = new THREE.Group()
  for (const [x, y, z, s] of [[0, 0, 0, 13], [14, -2, 3, 10], [-14, -3, -2, 9], [5, 5, -6, 8]]) g.add(mesh(sph(s * (0.9 + r() * 0.2), 1), C.white, x, y, z, 1.25, 0.65, 1))
  return g
}

// 올레길: 섬 둘레를 따라 해안에서 조금 안쪽(바다에서 13 떨어진 곳)을 도는 길
function olleLoop() {
  const N = 96, raw = []
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a)
    for (let r = 440; r > 0; r -= 2) {
      const x = CENTER.x + dx * r, y = 232 + dy * r * 0.62
      if (groundDistance(x, y) >= 14) { raw.push({ x, y }); break }
    }
  }
  const pts = raw.map((_, i) => {                                                  // 울퉁불퉁한 곳은 이웃과 평균 내서 부드럽게
    let sx = 0, sy = 0
    for (let k = -3; k <= 3; k++) { const p = raw[(i + k + raw.length) % raw.length]; sx += p.x; sy += p.y }
    return { x: sx / 7, y: sy / 7 }
  }).map((p) => ({ ...toWorld(p.x, p.y), my: p.y, mx: p.x }))
  return pts.map((p) => new THREE.Vector3(p.x, Math.max(1, heightAt(p.mx, p.my)) + 0.6, p.z))
}

export function buildProps({ animate = true } = {}) {
  const r = rng('island-props')
  const root = new THREE.Group()
  const interactive = []                                                           // 눌러서 설명을 볼 수 있는 것들
  const live = []
  const add = (obj, pos, { id, scale = 1, rot = 0, tap = false } = {}) => {
    obj.position.set(pos.x, pos.y, pos.z); obj.scale.setScalar(scale * 1.3); obj.rotation.y = rot   // 멀리서도 알아볼 수 있게 장난감처럼 조금 크게
    if (id) { obj.userData.prop = id; if (tap) interactive.push(obj) }
    root.add(obj); return obj
  }

  // 해녀: 서쪽·북동쪽·남쪽 바다에서 물질 중
  for (const [lat, lng, rot] of [[33.43, 126.2, 0.4], [33.56, 126.82, -2.2], [33.2, 126.55, 2.6]]) {
    const p = place(lat, lng, 'sea', 14); const h = add(haenyeo(), p, { id: 'haenyeo', scale: 1.15, rot, tap: true }); live.push({ o: h, ph: r() * 6, baseY: p.y })
  }
  // 한라봉 밭 (남쪽 서귀포 쪽) 두 곳
  for (const [lat, lng] of [[33.29, 126.58], [33.3, 126.72]]) {
    for (let i = 0; i < 6; i++) {
      const p = place(lat + (r() - 0.5) * 0.05, lng + (r() - 0.5) * 0.07, 'land', 22)
      add(hallabongTree(), p, { id: 'tangerine', scale: 0.8 + r() * 0.3, rot: r() * 6, tap: true })
    }
  }
  // 흑돼지 두 마리 (천천히 돌아다님)
  for (const [lat, lng] of [[33.47, 126.42], [33.43, 126.74]]) {
    const p = place(lat, lng, 'land', 26); const o = add(pig(), p, { id: 'pig', scale: 0.95, tap: true }); live.push({ o, pig: true, ax: p.x, az: p.z, ph: r() * 6, baseY: p.y })
  }
  // 돌하르방: 제주시·성산·서쪽 바닷가
  for (const [lat, lng, rot] of [[33.5, 126.6, 0.3], [33.43, 126.9, -0.5], [33.37, 126.27, 0.9]]) {
    const p = place(lat, lng, 'land', 16); add(hareubang(), p, { id: 'hareubang', scale: 0.8, rot, tap: true })
  }
  // 조랑말
  for (const [lat, lng, rot] of [[33.4, 126.38, 0.8], [33.39, 126.66, -1]]) {
    const p = place(lat, lng, 'land', 28); add(pony(), p, { id: 'pony', scale: 0.85, rot, tap: true })
  }
  // 올레길: 파랑·주황 점선처럼 이어진 길 + 표지판 + 걷는 여행자
  const loop = olleLoop()
  const curve = new THREE.CatmullRomCurve3(loop, true, 'centripetal')
  const dots = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.1, 1.1, 0.5, 6), M(C.blue), 150)
  const dotsO = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.1, 1.1, 0.5, 6), M(C.orange), 150)
  let nb = 0, no = 0
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < 300; i++) {
    const v = curve.getPointAt(i / 300); m4.setPosition(v.x, v.y, v.z)
    if (i % 2) dots.setMatrixAt(nb++, m4); else dotsO.setMatrixAt(no++, m4)
  }
  dots.count = nb; dotsO.count = no; root.add(dots, dotsO)
  for (const u of [0.04, 0.29, 0.52, 0.77]) {
    const v = curve.getPointAt(u), t = curve.getTangentAt(u)
    add(olleSign(), { x: v.x + t.z * 9, y: v.y - 0.2, z: v.z - t.x * 9 }, { id: 'olle', scale: 0.85, rot: Math.atan2(-t.z, t.x), tap: true })
  }
  const walker = add(traveler(), { x: 0, y: 0, z: 0 }, { id: 'traveler', scale: 0.95, tap: true })
  live.push({ o: walker, walker: true, u: 0.12 })

  // 바다 위: 고깃배, 돌고래, 갈매기, 그리고 높이 떠가는 구름
  const bp = place(33.64, 126.52, 'sea', 20); const bt = add(boat(), bp, { scale: 1.05, rot: 0.5 }); live.push({ o: bt, bob: true, ph: 1, baseY: 0.25, ax: bp.x, az: bp.z, drift: true })
  const dp = place(33.62, 126.78, 'sea', 22); const dl = add(dolphin(), dp, { scale: 1 }); live.push({ o: dl, dolphin: true, ax: dp.x, az: dp.z, ph: 0 })
  const dp2 = place(33.23, 126.35, 'sea', 24); const dl2 = add(dolphin(), dp2, { scale: 0.85 }); live.push({ o: dl2, dolphin: true, ax: dp2.x, az: dp2.z, ph: 2.6 })
  for (let i = 0; i < 4; i++) { const g = add(gull(), { x: 0, y: 70, z: 0 }, { scale: 1 }); live.push({ o: g, gull: true, cx: -150 + i * 80, cz: -190 + (i % 2) * 40, rad: 70 + i * 14, ph: i * 1.7, sp: 0.35 + i * 0.05 }) }
  for (const [x, y, z] of [[-260, 170, -80], [170, 190, 120], [300, 160, -170]]) { const c = add(cloud(r), { x, y, z }, { scale: 1.1 }); live.push({ o: c, cloud: true, sp: 2.4 + r() * 1.5 }) }

  const step = (t, dt) => {
    for (const s of live) {
      const o = s.o
      if (s.bob) {
        o.position.y = s.baseY + Math.sin(t * 1.3 + s.ph) * 0.7; o.rotation.z = Math.sin(t * 1.1 + s.ph) * 0.035
        if (s.drift) { o.position.x = s.ax + Math.sin(t * 0.08) * 40; o.rotation.y = 0.5 + Math.cos(t * 0.08) * 0.15 }
      }
      if (s.baseY !== undefined && !s.drift && !s.pig && !s.dolphin && !s.walker) o.position.y = s.baseY + Math.sin(t * 1.5 + s.ph) * 0.45          // 해녀가 물결에 흔들림
      if (s.pig) {
        const a = t * 0.16 + s.ph
        o.position.set(s.ax + Math.cos(a) * 15, heightAt(s.ax + 400 + Math.cos(a) * 15, s.az + 200 + Math.sin(a) * 15) + 0.2, s.az + Math.sin(a) * 15)
        o.rotation.y = -a - Math.PI / 2; o.position.y += Math.abs(Math.sin(t * 5 + s.ph)) * 0.5
      }
      if (s.walker) {
        s.u = (s.u + dt * 0.011) % 1
        const v = curve.getPointAt(s.u), tg = curve.getTangentAt(s.u)
        o.position.set(v.x, v.y, v.z); o.rotation.y = Math.atan2(-tg.z, tg.x)
        o.position.y += Math.abs(Math.sin(t * 7)) * 0.5
        const sw = Math.sin(t * 7) * 0.7; o.userData.legs[0].rotation.z = sw; o.userData.legs[1].rotation.z = -sw
      }
      if (s.dolphin) {                                                                  // 5초마다 한 번 물 위로 포물선을 그리며 뛰어오름
        const cyc = ((t + s.ph * 1.7) % 6) / 6, jump = Math.min(1, cyc / 0.38)
        const up = cyc < 0.38 ? Math.sin(jump * Math.PI) : 0
        o.visible = cyc < 0.4
        o.position.set(s.ax + (jump - 0.5) * 44, -3 + up * 26, s.az)
        o.rotation.z = (cyc < 0.38 ? Math.cos(jump * Math.PI) : 0) * -0.8
      }
      if (s.gull) {
        const a = t * s.sp + s.ph
        o.position.set(s.cx + Math.cos(a) * s.rad, 62 + Math.sin(t * 0.6 + s.ph) * 6, s.cz + Math.sin(a) * s.rad * 0.7)
        o.rotation.y = -a - Math.PI / 2
        const f = Math.sin(t * 6 + s.ph) * 0.5; o.userData.wings[0].rotation.z = f; o.userData.wings[1].rotation.z = -f
      }
      if (s.cloud) { o.position.x += s.sp * dt; if (o.position.x > 520) o.position.x = -520 }
    }
  }
  step(0, 0)                                                                         // 처음 자세 (움직임 줄이기 설정이어도 제자리에 서 있게)
  const update = (t, dt) => { if (animate) step(t, dt) }
  return { root, interactive, update }
}

// ── 내 캐릭터 모양 (돼지·귤·말·고양이·남자·여자) — 얼굴이 있어서 카메라를 바라봄(모델의 앞은 +x 방향) ──
const eyes = (g, x, y, gap = 1.6, r = 0.85) => { g.add(mesh(sph(r, 0), C.ink, x, y, -gap)); g.add(mesh(sph(r, 0), C.ink, x, y, gap)) }
function pigChar() { const g = pig(); eyes(g, 10.2, 8.6, 1.7, 0.75); g.add(mesh(sph(0.5, 0), '#d99a96', 12.6, 6.8, -0.7)); g.add(mesh(sph(0.5, 0), '#d99a96', 12.6, 6.8, 0.7)); return g }
function ponyChar() { const g = pony(); eyes(g, 11.6, 14.8, 1.25, 0.55); return g }
function tangerineChar() {
  const g = new THREE.Group()
  g.add(mesh(sph(6.6, 1), C.orange, 0, 7.4, 0, 1, 0.92, 1))                                   // 둥근 귤
  g.add(mesh(sph(1.1, 0), '#c97a3c', 0, 13.2, 0, 1, 0.45, 1))                                  // 꼭지 자리
  g.add(mesh(cyl(0.45, 0.6, 2, 5), C.leaf, 0, 14.2, 0))
  const l1 = mesh(sph(2.6, 0), C.leafLight, 2.4, 14.4, 0.6, 1.6, 0.3, 0.9); l1.rotation.z = 0.3; g.add(l1)
  const l2 = mesh(sph(2.2, 0), C.leaf, -2, 14.2, -0.6, 1.5, 0.3, 0.9); l2.rotation.z = -0.3; g.add(l2)
  eyes(g, 5.9, 8.6, 2.3, 0.85)
  g.add(mesh(sph(0.95, 0), '#f0a58c', 5.7, 6.4, -3.7, 0.6, 0.6, 0.4)); g.add(mesh(sph(0.95, 0), '#f0a58c', 5.7, 6.4, 3.7, 0.6, 0.6, 0.4))   // 볼터치
  g.add(mesh(box(0.6, 0.6, 2.2), C.ink, 6.3, 6.3, 0))                                            // 입
  for (const z of [-2.4, 2.4]) g.add(mesh(cyl(1.1, 1.3, 1.6, 6), '#c97a3c', 0.6, 0.8, z))        // 작은 발
  return g
}
function catChar() {
  const g = new THREE.Group(), fur = '#d3d6cf', dark = '#aeb3aa'
  g.add(mesh(sph(4.7, 1), fur, 0, 6.4, 0, 1.4, 0.9, 0.9))
  g.add(mesh(sph(3.5, 1), fur, 6, 9.4, 0))
  for (const z of [-1.9, 1.9]) g.add(mesh(new THREE.ConeGeometry(1.4, 3, 4), dark, 6.4, 12.8, z))
  eyes(g, 8.9, 10, 1.45, 0.6)
  g.add(mesh(sph(0.55, 0), '#d99a96', 9.5, 8.8, 0))
  for (const [x, z] of [[-3.6, -1.8], [-3.6, 1.8], [3.6, -1.8], [3.6, 1.8]]) g.add(mesh(cyl(0.95, 0.8, 4.2, 5), fur, x, 2.1, z))
  const tail = mesh(cyl(0.6, 0.9, 10, 5), dark, -7.4, 10, 0); tail.rotation.z = 0.45; g.add(tail)
  return g
}
function person(woman) {
  const g = new THREE.Group()
  const top = woman ? '#d98c8c' : C.jacket
  if (woman) { g.add(mesh(new THREE.ConeGeometry(5.4, 10.5, 8), top, 0, 7, 0)); g.add(mesh(cyl(2.1, 2.6, 4.4, 7), top, 0, 14.4, 0)) }
  else { g.add(mesh(cyl(2.7, 3.1, 8.4, 7), top, 0, 12.2, 0)); for (const z of [-1.3, 1.3]) g.add(mesh(box(2, 8, 2), C.ink, 0, 4, z)) }
  if (woman) for (const z of [-1, 1]) g.add(mesh(cyl(0.6, 0.6, 3, 5), C.skin, 0, 1.5, z))
  g.add(mesh(sph(2.9, 1), C.skin, 0, 19, 0))
  g.add(mesh(new THREE.SphereGeometry(3.15, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.52), C.ink, -0.2, 19.3, 0))     // 머리카락
  if (woman) { g.add(mesh(box(2, 8.4, 5.4), C.ink, -2.4, 16, 0)); g.add(mesh(sph(1.5, 0), C.ink, -1.5, 22.4, 0)) }       // 긴 머리 + 묶음
  eyes(g, 2.6, 19.4, 1.1, 0.45)
  const a1 = mesh(cyl(0.8, 0.8, 6.4, 5), woman ? C.skin : top, 0, 12, -3.4); a1.rotation.x = 0.15; g.add(a1)
  const a2 = mesh(cyl(0.8, 0.8, 6.4, 5), woman ? C.skin : top, 0, 12, 3.4); a2.rotation.x = -0.15; g.add(a2)
  return g
}
// 종류별 모양과 키(말풍선 높이용)
export const CHAR_HEIGHT = { pig: 13, tangerine: 16, horse: 20, cat: 15, man: 23, woman: 24 }
export function characterModel(type) {
  const g = { pig: pigChar, tangerine: tangerineChar, horse: ponyChar, cat: catChar, man: () => person(false), woman: () => person(true) }[type]?.() ?? tangerineChar()
  const wrap = new THREE.Group(); wrap.add(g); wrap.scale.setScalar(1.35)
  return wrap
}
