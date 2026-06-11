import { cn } from "@/lib/utils";

export function BrandMark({ className, variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-brand shadow-md">
        <span className="font-display text-lg font-extrabold text-primary-foreground">PB</span>
        <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full gradient-gold ring-2 ring-background" />
      </div>
      <div className="leading-tight">
        <div className={cn("font-bangla text-base font-bold", variant === "dark" ? "text-sidebar-foreground" : "text-foreground")}>
          পূবালী ব্যাংক
        </div>
        <div className={cn("text-[10px] font-semibold uppercase tracking-[0.18em]", variant === "dark" ? "text-sidebar-foreground/60" : "text-muted-foreground")}>
          Pubali Bank Ltd.
        </div>
      </div>
    </div>
  );
}