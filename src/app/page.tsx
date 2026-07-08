// ── Toggle login gate variant ────────────────────────────────
// Uncomment exactly ONE of the three imports below:
// import { LoginGate } from "@/components/login-gate";              // original (dark glassmorphism)
import { LoginGateA as LoginGate } from "@/components/login-gate-variant-a"; // A: warm light / paper
// import { LoginGateB as LoginGate } from "@/components/login-gate-variant-b"; // B: warm dark / candlelit
// ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  return <LoginGate />;
}
