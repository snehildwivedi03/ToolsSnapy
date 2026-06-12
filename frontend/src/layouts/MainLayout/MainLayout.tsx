import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./MainLayout.module.css";

/* ── Background shape data ───────────────────────────────── */
interface GeoShape {
  id: number;
  type: "circle" | "tri" | "tridown" | "diamond" | "square" | "hex";
  size: number;
  top: number;
  left: number;
  color: string;
  opacity: number;
  depth: number;
  blur: number;
}

const GEO_SHAPES: GeoShape[] = [
  // Large blurred ambient circle   top right
  { id: 1, type: "circle",  size: 520, top: -14, left: 62,  color: "#7c3aed", opacity: 0.09,  depth: 1.2, blur: 60  },
  // Crisp upward triangle   lower left
  { id: 2, type: "tri",     size: 280, top: 62,  left: -5,  color: "#ec4899", opacity: 0.10,  depth: 2.0, blur: 0   },
  // Crisp diamond   upper left
  { id: 3, type: "diamond", size: 360, top: 4,   left: -7,  color: "#4338ca", opacity: 0.07,  depth: 1.5, blur: 0   },
  // Small blurred circle   lower right
  { id: 4, type: "circle",  size: 220, top: 72,  left: 80,  color: "#f472b6", opacity: 0.09,  depth: 2.5, blur: 40  },
  // Rotated square   mid left
  { id: 5, type: "square",  size: 155, top: 40,  left: 3,   color: "#7c3aed", opacity: 0.07,  depth: 3.0, blur: 0   },
  // Hexagon   mid right
  { id: 6, type: "hex",     size: 255, top: 36,  left: 76,  color: "#6d28d9", opacity: 0.08,  depth: 1.8, blur: 0   },
  // Small triangle   bottom centre
  { id: 7, type: "tri",     size: 140, top: 82,  left: 47,  color: "#a78bfa", opacity: 0.09,  depth: 2.2, blur: 0   },
  // Tiny blurred circle   upper centre
  { id: 8, type: "circle",  size: 105, top: 8,   left: 38,  color: "#ec4899", opacity: 0.08,  depth: 2.8, blur: 20  },
  // Downward triangle   right edge
  { id: 9, type: "tridown", size: 190, top: 18,  left: 87,  color: "#7c3aed", opacity: 0.07,  depth: 1.6, blur: 0   },
];

const CLIP: Record<GeoShape["type"], string | undefined> = {
  circle:  undefined,
  tri:     "polygon(50% 0%, 0% 100%, 100% 100%)",
  tridown: "polygon(0% 0%, 100% 0%, 50% 100%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  square:  undefined,
  hex:     "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
};

/* ── Parallax background component ──────────────────────── */
// Shapes animate with cursor on hover-capable devices only.
// On touch-only devices (mobile) shapes render static.
const GeoBg = () => {
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    if (!canHover) return;

    let rafId: number;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2; // -1 to 1
      ty = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
    };

    const tick = () => {
      // Lerp for smooth, lagging follow
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;

      wrapRefs.current.forEach((el, i) => {
        if (!el) return;
        const mag = GEO_SHAPES[i].depth * 15;
        el.style.transform = `translate(${cx * mag}px, ${cy * mag}px)`;
      });

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={styles.geoBg} aria-hidden="true">
      {GEO_SHAPES.map((shape, i) => (
        <div
          key={shape.id}
          ref={(el) => { wrapRefs.current[i] = el; }}
          className={styles.geoWrap}
          style={{ top: `${shape.top}%`, left: `${shape.left}%` }}
        >
          <div
            className={styles.geoShape}
            style={{
              width:           shape.size,
              height:          shape.size,
              backgroundColor: shape.color,
              opacity:         shape.opacity,
              borderRadius:    shape.type === "circle" ? "50%" : undefined,
              clipPath:        CLIP[shape.type],
              filter:          shape.blur > 0 ? `blur(${shape.blur}px)` : undefined,
              transform:       shape.type === "square" ? "rotate(14deg)" : undefined,
            }}
          />
        </div>
      ))}
    </div>
  );
};

/* ── Layout shell ────────────────────────────────────────── */
const MainLayout = () => {
  return (
    <div className={styles.shell}>
      <GeoBg />
      <Navbar />
      <main className={styles.content}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;