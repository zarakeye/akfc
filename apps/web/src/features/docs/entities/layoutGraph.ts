/**
 * Placement des atomes de la carte : une petite simulation de forces, comme une molécule posée à
 * plat. Les atomes se repoussent, les liaisons agissent comme des ressorts, et une légère gravité
 * garde l'ensemble au centre. Peu d'atomes (une trentaine au plus) : un calcul direct suffit, sans
 * bibliothèque.
 *
 * Déterministe : départ en cercle dans un ordre fixe, nombre d'itérations fixe. La même carte se
 * dessine donc toujours de la même façon (pas de saut d'un affichage à l'autre).
 */

export type LayoutNode = { id: string; radius: number; /** Atome plus lourd : bouge moins. */ mass?: number };
export type LayoutEdge = { source: string; target: string; /** Longueur de repos du ressort. */ length: number };
export type Point = { x: number; y: number };

export function layoutGraph(nodes: LayoutNode[], edges: LayoutEdge[], iterations = 400): Map<string, Point> {
  const n = nodes.length;
  const pos = new Map<string, Point>();
  const vel = new Map<string, Point>();
  const start = 60 + n * 18;
  nodes.forEach((node, i) => {
    const a = (2 * Math.PI * i) / Math.max(1, n);
    pos.set(node.id, { x: start * Math.cos(a), y: start * Math.sin(a) });
    vel.set(node.id, { x: 0, y: 0 });
  });
  const byId = new Map(nodes.map((nd) => [nd.id, nd]));

  for (let it = 0; it < iterations; it++) {
    const cooling = 1 - it / iterations;
    const force = new Map<string, Point>(nodes.map((nd) => [nd.id, { x: 0, y: 0 }]));

    // Répulsion entre tous les atomes (et non-chevauchement).
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const pa = pos.get(a.id)!;
        const pb = pos.get(b.id)!;
        let dx = pa.x - pb.x;
        let dy = pa.y - pb.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) {
          dx = 0.1 * (i - j);
          dy = 0.1;
          d2 = dx * dx + dy * dy;
        }
        const d = Math.sqrt(d2);
        const minGap = a.radius + b.radius + 34;
        const strength = 9000 / d2 + (d < minGap ? (minGap - d) * 0.6 : 0);
        const fx = (dx / d) * strength;
        const fy = (dy / d) * strength;
        force.get(a.id)!.x += fx;
        force.get(a.id)!.y += fy;
        force.get(b.id)!.x -= fx;
        force.get(b.id)!.y -= fy;
      }
    }

    // Ressorts des liaisons.
    for (const e of edges) {
      const pa = pos.get(e.source);
      const pb = pos.get(e.target);
      if (!pa || !pb || e.source === e.target) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const d = Math.max(0.1, Math.hypot(dx, dy));
      const k = 0.06 * (d - e.length);
      const fx = (dx / d) * k;
      const fy = (dy / d) * k;
      force.get(e.source)!.x += fx;
      force.get(e.source)!.y += fy;
      force.get(e.target)!.x -= fx;
      force.get(e.target)!.y -= fy;
    }

    // Gravité vers le centre, puis déplacement amorti.
    for (const nd of nodes) {
      const p = pos.get(nd.id)!;
      const f = force.get(nd.id)!;
      f.x -= p.x * 0.012;
      f.y -= p.y * 0.012;
      const v = vel.get(nd.id)!;
      const mass = byId.get(nd.id)?.mass ?? 1;
      v.x = (v.x + f.x / mass) * 0.6;
      v.y = (v.y + f.y / mass) * 0.6;
      const step = 30 * cooling + 2;
      const speed = Math.hypot(v.x, v.y);
      if (speed > step) {
        v.x = (v.x / speed) * step;
        v.y = (v.y / speed) * step;
      }
      p.x += v.x;
      p.y += v.y;
    }
  }
  return pos;
}
