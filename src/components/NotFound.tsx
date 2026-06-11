import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // floating coins / taka symbols
    type Particle = {
      x: number;
      y: number;
      vy: number;
      vx: number;
      size: number;
      opacity: number;
      rotation: number;
      rotSpeed: number;
      symbol: string;
    };

    const symbols = ["৳", "৳", "৳", "?", "404"];
    const particles: Particle[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: -(0.3 + Math.random() * 0.6),
      vx: (Math.random() - 0.5) * 0.4,
      size: 10 + Math.random() * 18,
      opacity: 0.08 + Math.random() * 0.18,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
    }));

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      for (const p of particles) {
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = "oklch(0.36 0.09 158)";
        ctx!.font = `bold ${p.size}px 'Plus Jakarta Sans', sans-serif`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(p.symbol, 0, 0);
        ctx!.restore();

        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotSpeed;

        if (p.y < -40) {
          p.y = H + 40;
          p.x = Math.random() * W;
        }
      }
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* animated background canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* glowing blobs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />

      {/* card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-2xl">
        {/* animated 404 digits */}
        <div className="flex items-center justify-center gap-3">
          {["4", "0", "4"].map((digit, i) => (
            <span
              key={i}
              className="font-display text-8xl font-extrabold text-foreground"
              style={{
                animation: `bounce404 1.4s ease-in-out ${i * 0.15}s infinite`,
              }}
            >
              {digit}
            </span>
          ))}
        </div>

        {/* broken card icon */}
        <div className="mx-auto mt-6 flex h-16 w-24 items-center justify-center rounded-xl bg-primary/10">
          <svg viewBox="0 0 48 32" className="h-10 w-16" fill="none">
            <rect x="1" y="1" width="46" height="30" rx="4" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="1" y1="10" x2="47" y2="10" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
            {/* crack effect */}
            <polyline
              points="18,10 22,18 20,18 25,28"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="text-destructive"
              style={{ animation: "flicker 1.8s ease-in-out infinite" }}
            />
            <polyline
              points="28,10 26,20 30,20 27,28"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="text-destructive"
              style={{ animation: "flicker 1.8s ease-in-out 0.4s infinite" }}
            />
          </svg>
        </div>

        <h2 className="mt-5 font-display text-xl font-bold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Looks like this page has been transferred to another account. Let's get you back to familiar territory.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="gradient-brand text-primary-foreground shadow-md">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => history.back()}>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />Back home
            </Link>
          </Button>
        </div>

        <p className="mt-6 font-mono text-xs text-muted-foreground/50">ERR_ROUTE_NOT_FOUND · 404</p>
      </div>

      <style>{`
        @keyframes bounce404 {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-12px); }
          60% { transform: translateY(-6px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
