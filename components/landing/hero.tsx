'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <header className="relative overflow-hidden pb-16 pt-24 sm:pb-24 sm:pt-32">
      <div className="container-forge">
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--cian-suave)]"
        >
          Generador de proyectos · nivel producción
        </motion.p>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
          className="mt-5 max-w-[16ch] text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[1.02]"
        >
          Proyectos web con alma de estudio digital
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.16, ease: 'easeOut' }}
          className="mt-6 max-w-[58ch] text-lg text-[var(--gris-neblina)]"
        >
          AZUL FORGE transforma tu descripción en una aplicación Next.js real: código
          TypeScript, tests, CI, documentación, calidad verificada y un .zip listo para GitHub
          y Vercel. Sin plantillas vacías. Sin promesas vacías.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.24, ease: 'easeOut' }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Link href="/studio" className="btn-forge px-7 py-3 text-base">
            Crear mi proyecto
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="#como-funciona" className="btn-ghost px-7 py-3 text-base">
            Ver cómo funciona
          </Link>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.32, ease: 'easeOut' }}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            ['3', 'plantillas reales'],
            ['0–100', 'puntuación de calidad'],
            ['1 clic', 'exportación .zip'],
            ['CI', 'GitHub Actions incluido'],
          ].map(([value, label]) => (
            <div key={label} className="card-forge px-5 py-5">
              <p className="mono text-2xl font-semibold text-[var(--cian-suave)]">{value}</p>
              <p className="mt-1 text-sm text-[var(--gris-neblina)]">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </header>
  );
}
