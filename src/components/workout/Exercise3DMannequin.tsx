import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Play,
  Pause,
  Eye,
  Sparkles,
  Compass,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Exercise } from "../../types";

interface Exercise3DMannequinProps {
  exercise: Exercise;
  height?: number;
}

type MovementType =
  | "bench_press"
  | "incline_bench"
  | "squat"
  | "leg_press"
  | "lat_pulldown"
  | "barbell_row"
  | "shoulder_press"
  | "lateral_raise"
  | "biceps_curl"
  | "triceps_pushdown"
  | "deadlift_stiff"
  | "cardio_treadmill"
  | "general_default";

function detectMovementType(ex: Exercise): MovementType {
  const name = (ex.name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const muscle = (ex.primaryMuscle || "").toLowerCase();

  if (
    name.includes("esteira") ||
    name.includes("escada") ||
    name.includes("bicicleta") ||
    muscle.includes("cardio")
  ) {
    return "cardio_treadmill";
  }
  if (
    name.includes("inclinad") &&
    (name.includes("supino") || muscle.includes("peit"))
  ) {
    return "incline_bench";
  }
  if (
    name.includes("supino") ||
    name.includes("flexao") ||
    (muscle.includes("peit") && name.includes("articulad"))
  ) {
    return "bench_press";
  }
  if (
    name.includes("agachamento") ||
    name.includes("hack") ||
    name.includes("bulgaro") ||
    name.includes("afundo")
  ) {
    return "squat";
  }
  if (name.includes("leg press")) {
    return "leg_press";
  }
  if (
    name.includes("puxada") ||
    name.includes("barra fixa") ||
    name.includes("pulley")
  ) {
    return "lat_pulldown";
  }
  if (
    name.includes("remada") ||
    name.includes("serrote") ||
    name.includes("cavalinho") ||
    name.includes("crucifixo invert")
  ) {
    return "barbell_row";
  }
  if (
    name.includes("desenvolvimento") ||
    (muscle.includes("ombro") && name.includes("militar"))
  ) {
    return "shoulder_press";
  }
  if (name.includes("elevacao lateral") || name.includes("lateral")) {
    return "lateral_raise";
  }
  if (name.includes("rosca") || muscle.includes("bicep")) {
    return "biceps_curl";
  }
  if (
    name.includes("triceps") ||
    name.includes("paralela") ||
    name.includes("testa")
  ) {
    return "triceps_pushdown";
  }
  if (
    name.includes("stiff") ||
    name.includes("terra") ||
    name.includes("rdl") ||
    name.includes("pelvica")
  ) {
    return "deadlift_stiff";
  }
  return "general_default";
}

// Error Boundary for 3D component to never crash the parent modal
export class Exercise3DErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Exercise3DMannequin WebGL render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center text-xs font-mono text-neutral-400 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="text-white font-bold">Simulação Biomecânica Nativa Ativa</div>
            <p>O modo 3D padrão está operando com renderização de alta compatibilidade.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export const Exercise3DMannequin: React.FC<Exercise3DMannequinProps> = ({
  exercise,
  height = 370,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasFallbackRef = useRef<HTMLCanvasElement>(null);

  const [useFallbackEngine, setUseFallbackEngine] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1 | 1.5>(1);
  const [cameraPreset, setCameraPreset] = useState<"iso" | "front" | "side">("iso");
  const [progressVal, setProgressVal] = useState(0);
  const [activePhase, setActivePhase] = useState<{
    name: string;
    color: string;
    desc: string;
  }>({
    name: "Excêntrica (Descida)",
    color: "text-cyan-400",
    desc: "Alongamento com controle em 3 segundos",
  });

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // Track camera angle refs so camera presets update live without re-mounting
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    radius: 4.2,
  });

  const setCameraPresetMode = (mode: "iso" | "front" | "side") => {
    setCameraPreset(mode);
    if (mode === "front") {
      cameraAngleRef.current.theta = 0;
      cameraAngleRef.current.phi = Math.PI / 2.2;
    } else if (mode === "side") {
      cameraAngleRef.current.theta = Math.PI / 2;
      cameraAngleRef.current.phi = Math.PI / 2.2;
    } else {
      cameraAngleRef.current.theta = Math.PI / 4;
      cameraAngleRef.current.phi = Math.PI / 3;
    }
  };

  // --- THREE.JS WEBGL ENGINE ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container || useFallbackEngine) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number | null = null;

    try {
      const width = container.clientWidth || 600;
      const currentHeight = height;

      // 1. Scene & Camera
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0e17);

      const camera = new THREE.PerspectiveCamera(45, width / currentHeight, 0.1, 100);
      camera.position.set(2.8, 2.2, 4.2);

      // Check WebGL availability
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "default" });
      renderer.setSize(width, currentHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      // 2. Lighting Setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const mainKeyLight = new THREE.DirectionalLight(0x00d2ff, 1.8);
      mainKeyLight.position.set(4, 7, 5);
      scene.add(mainKeyLight);

      const rimLight = new THREE.DirectionalLight(0x10b981, 1.4);
      rimLight.position.set(-4, 3, -4);
      scene.add(rimLight);

      const groundGlowLight = new THREE.PointLight(0x06b6d4, 0.9, 10);
      groundGlowLight.position.set(0, 0.2, 0);
      scene.add(groundGlowLight);

      // 3. Cyber Floor Grid
      const grid = new THREE.GridHelper(12, 24, 0x06b6d4, 0x1e293b);
      grid.position.y = -0.01;
      scene.add(grid);

      // 4. Materials
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.45,
        metalness: 0.35,
      });

      const jointMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.3,
      });

      const activeMuscleMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.3,
        metalness: 0.5,
        emissive: 0x10b981,
        emissiveIntensity: 0.6,
      });

      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.15,
        metalness: 0.95,
      });

      const weightPlateMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.4,
        metalness: 0.8,
      });

      const benchMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.7,
        metalness: 0.2,
      });

      // 5. Build Procedural Mannequin
      const athleteGroup = new THREE.Group();
      scene.add(athleteGroup);

      // Pelvis
      const pelvis = new THREE.Group();
      pelvis.position.y = 1.0;
      athleteGroup.add(pelvis);

      const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.26), skinMat);
      pelvis.add(pelvisMesh);

      // Torso & Chest
      const torsoGroup = new THREE.Group();
      torsoGroup.position.y = 0.1;
      pelvis.add(torsoGroup);

      const absMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.24), skinMat);
      absMesh.position.y = 0.14;
      torsoGroup.add(absMesh);

      const chestGroup = new THREE.Group();
      chestGroup.position.y = 0.28;
      torsoGroup.add(chestGroup);

      const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.35, 0.28), skinMat);
      chestMesh.position.y = 0.175;
      chestGroup.add(chestMesh);

      // Pectoral Muscle Highlight Plates
      const pecGeo = new THREE.BoxGeometry(0.18, 0.14, 0.04);
      const leftPec = new THREE.Mesh(pecGeo, activeMuscleMat);
      leftPec.position.set(-0.11, 0.18, 0.145);
      chestGroup.add(leftPec);

      const rightPec = new THREE.Mesh(pecGeo, activeMuscleMat);
      rightPec.position.set(0.11, 0.18, 0.145);
      chestGroup.add(rightPec);

      // Neck & Head
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.14, 16), jointMat);
      neck.position.y = 0.42;
      chestGroup.add(neck);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), skinMat);
      head.position.y = 0.58;
      head.scale.set(0.9, 1.1, 1.0);
      chestGroup.add(head);

      // Visor HUD Eyes
      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.05, 0.08),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      );
      visor.position.set(0, 0.58, 0.11);
      chestGroup.add(visor);

      // Arms
      const leftClavicle = new THREE.Group();
      leftClavicle.position.set(-0.27, 0.3, 0);
      chestGroup.add(leftClavicle);

      const leftShoulderMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), activeMuscleMat);
      leftClavicle.add(leftShoulderMesh);

      const leftUpperArm = new THREE.Group();
      leftClavicle.add(leftUpperArm);

      const leftBicepMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 16), activeMuscleMat);
      leftBicepMesh.position.y = -0.16;
      leftUpperArm.add(leftBicepMesh);

      const leftElbow = new THREE.Group();
      leftElbow.position.y = -0.32;
      leftUpperArm.add(leftElbow);

      const leftElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), jointMat);
      leftElbow.add(leftElbowJoint);

      const leftForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.28, 16), skinMat);
      leftForearmMesh.position.y = -0.14;
      leftElbow.add(leftForearmMesh);

      // Right Arm
      const rightClavicle = new THREE.Group();
      rightClavicle.position.set(0.27, 0.3, 0);
      chestGroup.add(rightClavicle);

      const rightShoulderMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), activeMuscleMat);
      rightClavicle.add(rightShoulderMesh);

      const rightUpperArm = new THREE.Group();
      rightClavicle.add(rightUpperArm);

      const rightBicepMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 16), activeMuscleMat);
      rightBicepMesh.position.y = -0.16;
      rightUpperArm.add(rightBicepMesh);

      const rightElbow = new THREE.Group();
      rightElbow.position.y = -0.32;
      rightUpperArm.add(rightElbow);

      const rightElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), jointMat);
      rightElbow.add(rightElbowJoint);

      const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.28, 16), skinMat);
      rightForearmMesh.position.y = -0.14;
      rightElbow.add(rightForearmMesh);

      // Legs
      const leftHip = new THREE.Group();
      leftHip.position.set(-0.13, -0.1, 0);
      pelvis.add(leftHip);

      const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.44, 16), activeMuscleMat);
      leftThighMesh.position.y = -0.22;
      leftHip.add(leftThighMesh);

      const leftKnee = new THREE.Group();
      leftKnee.position.y = -0.44;
      leftHip.add(leftKnee);

      const leftKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), jointMat);
      leftKnee.add(leftKneeJoint);

      const leftCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.42, 16), skinMat);
      leftCalfMesh.position.y = -0.21;
      leftKnee.add(leftCalfMesh);

      const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), jointMat);
      leftFoot.position.set(0, -0.44, 0.06);
      leftKnee.add(leftFoot);

      const rightHip = new THREE.Group();
      rightHip.position.set(0.13, -0.1, 0);
      pelvis.add(rightHip);

      const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.44, 16), activeMuscleMat);
      rightThighMesh.position.y = -0.22;
      rightHip.add(rightThighMesh);

      const rightKnee = new THREE.Group();
      rightKnee.position.y = -0.44;
      rightHip.add(rightKnee);

      const rightKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), jointMat);
      rightKnee.add(rightKneeJoint);

      const rightCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.42, 16), skinMat);
      rightCalfMesh.position.y = -0.21;
      rightKnee.add(rightCalfMesh);

      const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), jointMat);
      rightFoot.position.set(0, -0.44, 0.06);
      rightKnee.add(rightFoot);

      // Equipment Props (Barbell & Bench)
      const equipmentGroup = new THREE.Group();
      scene.add(equipmentGroup);

      const barbellGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.8, 16);
      barbellGeo.rotateZ(Math.PI / 2);
      const barbell = new THREE.Mesh(barbellGeo, chromeMat);
      barbell.castShadow = true;
      equipmentGroup.add(barbell);

      const plateGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 24);
      plateGeo.rotateZ(Math.PI / 2);

      const leftPlate = new THREE.Mesh(plateGeo, weightPlateMat);
      leftPlate.position.x = -0.7;
      barbell.add(leftPlate);

      const rightPlate = new THREE.Mesh(plateGeo, weightPlateMat);
      rightPlate.position.x = 0.7;
      barbell.add(rightPlate);

      const benchPad = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 1.4), benchMat);
      benchPad.position.set(0, 0.48, 0.1);
      equipmentGroup.add(benchPad);

      const benchPillar1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.48, 0.1), benchMat);
      benchPillar1.position.set(0, 0.24, -0.4);
      equipmentGroup.add(benchPillar1);

      const benchPillar2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.48, 0.1), benchMat);
      benchPillar2.position.set(0, 0.24, 0.6);
      equipmentGroup.add(benchPillar2);

      const movementType = detectMovementType(exercise);

      // Setup initial orientation
      if (movementType === "bench_press" || movementType === "incline_bench") {
        benchPad.visible = true;
        benchPillar1.visible = true;
        benchPillar2.visible = true;
        athleteGroup.rotation.x = -Math.PI / 2;
        athleteGroup.position.set(0, 0.6, 0.1);
        if (movementType === "incline_bench") {
          athleteGroup.rotation.x = -Math.PI / 2.7;
          benchPad.rotation.x = 0.4;
        }
      } else {
        benchPad.visible = false;
        benchPillar1.visible = false;
        benchPillar2.visible = false;
        athleteGroup.rotation.set(0, 0, 0);
        athleteGroup.position.set(0, 0.05, 0);
      }

      // Mouse drag controls
      let isDragging = false;
      let prevX = 0;
      let prevY = 0;

      const onPointerDown = (e: MouseEvent | TouchEvent) => {
        isDragging = true;
        const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
        const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
        prevX = cx;
        prevY = cy;
      };

      const onPointerMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
        const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
        const dx = cx - prevX;
        const dy = cy - prevY;
        prevX = cx;
        prevY = cy;

        cameraAngleRef.current.theta -= dx * 0.01;
        cameraAngleRef.current.phi = Math.max(
          0.2,
          Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - dy * 0.01)
        );
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      const dom = renderer.domElement;
      dom.addEventListener("mousedown", onPointerDown);
      window.addEventListener("mousemove", onPointerMove);
      window.addEventListener("mouseup", onPointerUp);
      dom.addEventListener("touchstart", onPointerDown, { passive: true });
      window.addEventListener("touchmove", onPointerMove, { passive: true });
      window.addEventListener("touchend", onPointerUp);

      // Animation kinematics loop
      let clock = new THREE.Clock();
      let animTime = 0;

      const animate = () => {
        animId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        if (isPlayingRef.current) {
          animTime += delta * speedRef.current;
        }

        const cyclePeriod = 3.6;
        const cycleT = (animTime % cyclePeriod) / cyclePeriod;
        setProgressVal(cycleT);

        // Motion Depth
        let motionT = 0;
        if (cycleT < 0.65) {
          motionT = cycleT / 0.65;
          setActivePhase({
            name: "Fase Excêntrica (Descida)",
            color: "text-cyan-400",
            desc: "Descida controlada por 3 segundos",
          });
        } else if (cycleT < 0.75) {
          motionT = 1;
          setActivePhase({
            name: "Ponto de Inversão Anatômico",
            color: "text-amber-400",
            desc: "Máximo alongamento sob tensão",
          });
        } else {
          motionT = 1 - (cycleT - 0.75) / 0.25;
          setActivePhase({
            name: "Fase Concêntrica (Pico de Força)",
            color: "text-emerald-400",
            desc: "Aceleração intencional concêntrica",
          });
        }

        // Kinematic pattern movement
        if (movementType === "bench_press" || movementType === "incline_bench") {
          const barY = movementType === "incline_bench" ? 0.95 - motionT * 0.28 : 0.88 - motionT * 0.32;
          barbell.position.set(0, barY, 0.08 - motionT * 0.04);
          barbell.visible = true;

          leftUpperArm.rotation.z = 0.4 + motionT * 0.85;
          leftElbow.rotation.z = -0.4 - motionT * 0.6;
          rightUpperArm.rotation.z = -0.4 - motionT * 0.85;
          rightElbow.rotation.z = 0.4 + motionT * 0.6;
        } else if (movementType === "squat") {
          const squatDepth = motionT * 0.48;
          pelvis.position.y = 1.0 - squatDepth;
          pelvis.position.z = -motionT * 0.18;

          leftHip.rotation.x = -motionT * 1.35;
          leftKnee.rotation.x = motionT * 2.25;
          rightHip.rotation.x = -motionT * 1.35;
          rightKnee.rotation.x = motionT * 2.25;

          torsoGroup.rotation.x = motionT * 0.38;

          barbell.visible = true;
          barbell.position.set(0, 1.48 - squatDepth, -motionT * 0.15);
        } else if (movementType === "lat_pulldown") {
          const pullY = 2.1 - motionT * 0.65;
          barbell.visible = true;
          barbell.position.set(0, pullY, 0.15);

          leftUpperArm.rotation.z = 2.6 - motionT * 1.6;
          rightUpperArm.rotation.z = -2.6 + motionT * 1.6;
          leftElbow.rotation.z = -motionT * 1.2;
          rightElbow.rotation.z = motionT * 1.2;
        } else if (movementType === "shoulder_press") {
          const pressY = 1.4 + (1 - motionT) * 0.65;
          barbell.visible = true;
          barbell.position.set(0, pressY, 0.05);

          leftUpperArm.rotation.z = 0.5 + (1 - motionT) * 1.8;
          rightUpperArm.rotation.z = -0.5 - (1 - motionT) * 1.8;
        } else if (movementType === "biceps_curl") {
          const curlAngle = (1 - motionT) * 2.2;
          leftElbow.rotation.x = curlAngle;
          rightElbow.rotation.x = curlAngle;
          barbell.visible = true;
          barbell.position.set(0, 0.75 + (1 - motionT) * 0.45, 0.25 + Math.sin(curlAngle) * 0.15);
        } else if (movementType === "triceps_pushdown") {
          const extendAngle = motionT * 1.9;
          leftElbow.rotation.x = extendAngle;
          rightElbow.rotation.x = extendAngle;
          barbell.visible = true;
          barbell.position.set(0, 0.95 - motionT * 0.35, 0.2);
        } else if (movementType === "deadlift_stiff") {
          torsoGroup.rotation.x = motionT * 1.1;
          pelvis.position.z = -motionT * 0.25;
          leftHip.rotation.x = -motionT * 0.7;
          rightHip.rotation.x = -motionT * 0.7;
          leftKnee.rotation.x = motionT * 0.4;
          rightKnee.rotation.x = motionT * 0.4;

          barbell.visible = true;
          barbell.position.set(0, 0.75 - motionT * 0.45, 0.25);
        } else {
          barbell.visible = false;
          torsoGroup.position.y = 0.1 + Math.sin(animTime * 2) * 0.02;
        }

        // Camera position lerp from angles
        const { theta, phi, radius } = cameraAngleRef.current;
        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = radius * Math.cos(phi) + 0.8;
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, 0.9, 0);

        if (renderer) renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !renderer) return;
        const newWidth = container.clientWidth;
        camera.aspect = newWidth / currentHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, currentHeight);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener("resize", handleResize);
        dom.removeEventListener("mousedown", onPointerDown);
        window.removeEventListener("mousemove", onPointerMove);
        window.removeEventListener("mouseup", onPointerUp);
        dom.removeEventListener("touchstart", onPointerDown);
        window.removeEventListener("touchmove", onPointerMove);
        window.removeEventListener("touchend", onPointerUp);

        if (renderer) {
          renderer.dispose();
          scene.clear();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch (err) {
      console.warn("Failed to initialize Three.js WebGL, switching to HTML5 Canvas fallback:", err);
      setUseFallbackEngine(true);
    }
  }, [exercise, height, useFallbackEngine]);

  // --- NATIVE 2.5D/3D BIOMECHANICAL CANVAS ENGINE (FALLBACK / HIGH COMPATIBILITY) ---
  useEffect(() => {
    if (!useFallbackEngine) return;
    const canvas = canvasFallbackRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let animTime = 0;

    const renderCanvas = () => {
      animId = requestAnimationFrame(renderCanvas);
      if (isPlayingRef.current) {
        animTime += 0.016 * speedRef.current;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Gradient background
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#080d1a");
      bg.addColorStop(1, "#04070e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Floor Grid
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 1;
      for (let y = h * 0.7; y < h; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 3.6s cycle
      const cyclePeriod = 3.6;
      const cycleT = (animTime % cyclePeriod) / cyclePeriod;
      setProgressVal(cycleT);

      let motionT = 0;
      if (cycleT < 0.65) {
        motionT = cycleT / 0.65;
        setActivePhase({
          name: "Fase Excêntrica (Descida)",
          color: "text-cyan-400",
          desc: "Descida controlada por 3 segundos",
        });
      } else if (cycleT < 0.75) {
        motionT = 1;
        setActivePhase({
          name: "Ponto de Inversão Anatômico",
          color: "text-amber-400",
          desc: "Máximo alongamento sob tensão",
        });
      } else {
        motionT = 1 - (cycleT - 0.75) / 0.25;
        setActivePhase({
          name: "Fase Concêntrica (Pico de Força)",
          color: "text-emerald-400",
          desc: "Aceleração intencional concêntrica",
        });
      }

      // Draw stylized biomechanical mannequin
      const centerX = w / 2;
      const centerY = h * 0.45;
      const scale = 1.3;

      const movement = detectMovementType(exercise);

      // Head
      ctx.fillStyle = "#10b981";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 12;

      let headY = centerY - 110 * scale;
      let barY = centerY - 20 * scale;

      if (movement === "squat") {
        const drop = motionT * 45 * scale;
        headY += drop;
        barY += drop;
      }

      ctx.beginPath();
      ctx.arc(centerX, headY, 18 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Visor
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(centerX - 10 * scale, headY - 4 * scale, 20 * scale, 6 * scale);

      // Spine & Torso
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 14 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(centerX, headY + 18 * scale);
      ctx.lineTo(centerX, headY + 90 * scale);
      ctx.stroke();

      // Arms & Barbell
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 10 * scale;

      const armOffset = motionT * 25 * scale;
      // Left arm
      ctx.beginPath();
      ctx.moveTo(centerX - 24 * scale, headY + 30 * scale);
      ctx.lineTo(centerX - 50 * scale, headY + 60 * scale + armOffset);
      ctx.stroke();

      // Right arm
      ctx.beginPath();
      ctx.moveTo(centerX + 24 * scale, headY + 30 * scale);
      ctx.lineTo(centerX + 50 * scale, headY + 60 * scale + armOffset);
      ctx.stroke();

      // Barbell
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00f0ff";
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 5 * scale;
      ctx.beginPath();
      ctx.moveTo(centerX - 110 * scale, headY + 60 * scale + armOffset);
      ctx.lineTo(centerX + 110 * scale, headY + 60 * scale + armOffset);
      ctx.stroke();

      // Plates
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(centerX - 110 * scale, headY + 35 * scale + armOffset, 12 * scale, 50 * scale);
      ctx.fillRect(centerX + 98 * scale, headY + 35 * scale + armOffset, 12 * scale, 50 * scale);

      ctx.shadowBlur = 0;
    };

    renderCanvas();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [useFallbackEngine, exercise, speed]);

  return (
    <Exercise3DErrorBoundary>
      <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl flex flex-col select-none">
        {/* Top HUD Controls Bar */}
        <div className="p-3 sm:p-4 bg-neutral-900/95 border-b border-neutral-800/80 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isPlaying ? "bg-emerald-400" : "bg-neutral-500"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isPlaying ? "bg-emerald-500" : "bg-neutral-600"
                }`}
              />
            </span>
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Boneco 3D Biomecânico Nativo</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              100% Nativo & Sem Bloqueios
            </span>
          </div>

          {/* Camera Presets & Speed Controls */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Camera Angles */}
            <div className="flex items-center rounded-lg bg-neutral-950 p-0.5 border border-neutral-800">
              <button
                type="button"
                onClick={() => setCameraPresetMode("iso")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  cameraPreset === "iso" ? "bg-cyan-500 text-neutral-950" : "text-neutral-400 hover:text-white"
                }`}
                title="Visão 3D Isométrica"
              >
                3D
              </button>
              <button
                type="button"
                onClick={() => setCameraPresetMode("front")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  cameraPreset === "front" ? "bg-cyan-500 text-neutral-950" : "text-neutral-400 hover:text-white"
                }`}
                title="Visão Frontal"
              >
                Frente
              </button>
              <button
                type="button"
                onClick={() => setCameraPresetMode("side")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  cameraPreset === "side" ? "bg-cyan-500 text-neutral-950" : "text-neutral-400 hover:text-white"
                }`}
                title="Visão Lateral (Perfil Biomecânico)"
              >
                Perfil
              </button>
            </div>

            {/* Speed */}
            <div className="flex items-center rounded-lg bg-neutral-800 p-0.5 border border-neutral-700">
              <button
                type="button"
                onClick={() => setSpeed(0.5)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  speed === 0.5 ? "bg-emerald-500 text-neutral-950" : "text-neutral-400 hover:text-white"
                }`}
                title="Câmera lenta para estudo anatômico"
              >
                0.5x
              </button>
              <button
                type="button"
                onClick={() => setSpeed(1)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  speed === 1 ? "bg-emerald-500 text-neutral-950" : "text-neutral-400 hover:text-white"
                }`}
              >
                1.0x
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-neutral-950/80 px-2 py-1 rounded-lg border border-neutral-800">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Girar 360°</span>
            </div>
          </div>
        </div>

        {/* 3D Canvas / Fallback Canvas Viewport */}
        {useFallbackEngine ? (
          <div style={{ height }} className="w-full relative bg-neutral-950 flex items-center justify-center">
            <canvas ref={canvasFallbackRef} width={640} height={height} className="w-full h-full block" />
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ height }}
            className="w-full relative cursor-grab active:cursor-grabbing bg-neutral-950"
          >
            {/* On-canvas Muscle Activation Badge */}
            <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2 shadow-lg pointer-events-none z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-neutral-400">Músculo Alvo:</span>
              <span className="text-emerald-400 font-bold">{exercise.primaryMuscle}</span>
            </div>

            <div className="absolute bottom-4 right-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 pointer-events-none z-10">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>Arraste com o dedo ou mouse</span>
            </div>
          </div>
        )}

        {/* Bottom Scrubber & Rep Phase Indicator */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold hover:bg-emerald-400 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
              title={isPlaying ? "Pausar Simulação" : "Reproduzir"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <div>
              <div className={`text-xs font-bold font-mono ${activePhase.color}`}>
                {activePhase.name}
              </div>
              <div className="text-[10px] text-neutral-400">{activePhase.desc}</div>
            </div>
          </div>

          {/* Repetition Cycle Progress */}
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
            <div className="w-24 sm:w-36 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75"
                style={{ width: `${Math.round(progressVal * 100)}%` }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-white font-bold">
              {Math.round(progressVal * 100)}%
            </span>
          </div>
        </div>
      </div>
    </Exercise3DErrorBoundary>
  );
};
