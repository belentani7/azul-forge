'use client';

export function GitHubInstructions({ slug }: { slug: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card-forge p-7">
        <h3 className="text-lg">Publicar en GitHub</h3>
        <p className="mt-2 text-sm text-[var(--gris-neblina)]">
          Tras descargar el .zip y descomprimirlo, ejecuta estos comandos en la carpeta del
          proyecto:
        </p>
        <pre className="thin-scroll mono mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[#02101c] p-4 text-xs leading-6 text-[var(--blanco-hielo)]">
{`cd ${slug}
git init
git add .
git commit -m "feat: proyecto inicial generado con AZUL FORGE"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/${slug}.git
git push -u origin main`}
        </pre>
      </section>

      <section className="card-forge p-7">
        <h3 className="text-lg">Desplegar en Vercel</h3>
        <ol className="mt-3 grid list-decimal gap-2.5 pl-5 text-sm text-[var(--gris-neblina)]">
          <li>
            Sube el proyecto a GitHub con los comandos de la izquierda (o importa el .zip en{' '}
            <span className="mono text-[var(--cian-suave)]">vercel.com/new</span>).
          </li>
          <li>
            En Vercel, pulsa <strong className="text-[var(--blanco-hielo)]">Add New → Project</strong> y
            selecciona el repositorio.
          </li>
          <li>
            Framework: <strong className="text-[var(--blanco-hielo)]">Next.js</strong> (se detecta solo).
            Build y output por defecto.
          </li>
          <li>
            Pulsa <strong className="text-[var(--blanco-hielo)]">Deploy</strong>. El CI de GitHub Actions
            verificará lint, tipos, tests y build en cada push.
          </li>
        </ol>
        <p className="mt-4 rounded-xl border border-[var(--border)] px-4 py-3 text-xs text-[var(--gris-neblina)]">
          El proyecto incluye <span className="mono text-[var(--cian-suave)]">.github/workflows/ci.yml</span>,{' '}
          <span className="mono text-[var(--cian-suave)]">.env.example</span> y docs/DESPLIEGUE.md con los
          pasos ampliados.
        </p>
      </section>
    </div>
  );
}
