export interface MarkerDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  position: [number, number, number];
  modelPath?: string;
  modelScale?: number;
  modelTint?: string;
}

// All models scaled so their largest bounding-box dimension matches the
// giraffe's (~1.19 units), and positioned so each model's bottom rests on
// the ground plane (y = -0.1).
export const MARKERS: MarkerDef[] = [
  { id: "story", label: "Our Story", icon: "", color: "#6b8f87", position: [-3.5, -0.1, -3], modelPath: "/models/car.glb", modelScale: 0.064 },
  { id: "memories", label: "Memories", icon: "", color: "#8a7592", position: [3.5, 0.311, -3], modelPath: "/models/dumpling-compressed.glb", modelScale: 0.597, modelTint: "#8a7592" },
  { id: "quote", label: "Your Words", icon: "", color: "#b3766b", position: [-4, -0.1, 3], modelPath: "/models/giraffe.glb", modelScale: 0.004, modelTint: "#b3766b" },
  { id: "letter", label: "A Letter", icon: "", color: "#6b8f87", position: [0, 0.27, 5.5], modelPath: "/models/letter.glb", modelScale: 0.864, modelTint: "#d98c4a" },
  { id: "playlist", label: "Playlist", icon: "♪", color: "#8a7592", position: [4, -0.099, 3], modelPath: "/models/cat.glb", modelScale: 1.545, modelTint: "#c17a4a" },
  { id: "reveal", label: "One More Thing", icon: "★", color: "#b3766b", position: [0, -0.1, -6], modelPath: "/models/monster-compressed.glb", modelScale: 1.224, modelTint: "#b3766b" },
];
