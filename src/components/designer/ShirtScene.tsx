import { OrbitControls, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  garmentColor: string;
  frontCanvas: HTMLCanvasElement;
  backCanvas: HTMLCanvasElement;
  /** Bumped whenever the artwork canvases are repainted. */
  revision: number;
};

/** Front silhouette of the garment, centred on the origin. */
function buildShirtShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const pts: [number, number][] = [
    [-0.45, 1.1],
    [-1.0, 1.0],
    [-1.45, 0.45],
    [-1.1, 0.05],
    [-0.8, 0.3],
    [-0.75, -1.2],
    [0.75, -1.2],
    [0.8, 0.3],
    [1.1, 0.05],
    [1.45, 0.45],
    [1.0, 1.0],
    [0.45, 1.1],
  ];
  shape.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) shape.lineTo(x, y);
  shape.quadraticCurveTo(0, 0.78, pts[0][0], pts[0][1]);
  return shape;
}

/** Flat silhouette bent forward, with UVs normalised to the bounding box. */
function buildSkinGeometry(shape: THREE.Shape, depth: number): THREE.BufferGeometry {
  const geo = new THREE.ShapeGeometry(shape, 48);
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = x / (width / 2);
    pos.setZ(i, depth * (1 - t * t));
    uv.setXY(i, (x - box.min.x) / width, (y - box.min.y) / height);
  }
  pos.needsUpdate = true;
  uv.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function Garment({ garmentColor, frontCanvas, backCanvas, revision }: Props) {
  const shape = useMemo(() => buildShirtShape(), []);
  const frontGeo = useMemo(() => buildSkinGeometry(shape, 0.14), [shape]);
  const backGeo = useMemo(() => buildSkinGeometry(shape, 0.14), [shape]);
  const bodyGeo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.26,
        bevelEnabled: true,
        bevelSize: 0.02,
        bevelThickness: 0.02,
        bevelSegments: 2,
        curveSegments: 24,
      }),
    [shape],
  );

  const frontTex = useMemo(() => {
    const t = new THREE.CanvasTexture(frontCanvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [frontCanvas]);
  const backTex = useMemo(() => {
    const t = new THREE.CanvasTexture(backCanvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.x = -1;
    t.offset.x = 1;
    return t;
  }, [backCanvas]);

  useEffect(() => {
    frontTex.needsUpdate = true;
    backTex.needsUpdate = true;
  }, [revision, frontTex, backTex]);

  useEffect(
    () => () => {
      frontTex.dispose();
      backTex.dispose();
      frontGeo.dispose();
      backGeo.dispose();
      bodyGeo.dispose();
    },
    [frontTex, backTex, frontGeo, backGeo, bodyGeo],
  );

  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      <mesh geometry={bodyGeo} position={[0, 0, -0.13]}>
        <meshStandardMaterial color={garmentColor} roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh geometry={frontGeo} position={[0, 0, 0.135]}>
        <meshStandardMaterial map={frontTex} roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh geometry={backGeo} position={[0, 0, -0.135]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial map={backTex} roughness={0.88} metalness={0.02} />
      </mesh>
    </group>
  );
}

export default function ShirtScene(props: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#070b16"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, -5]} intensity={0.7} color="#22d3ee" />
      <Garment {...props} />
      <Environment preset="city" />
      <OrbitControls
        enablePan={false}
        minDistance={2.6}
        maxDistance={7}
        autoRotate={false}
      />
    </Canvas>
  );
}
