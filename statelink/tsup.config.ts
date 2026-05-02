import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/adapters/web/index.ts'
  ],
  format: ['cjs', 'esm'], // Exporta a CommonJS (Node) y ES Modules (Vite/React)
  dts: true,              // Genera declaraciones TypeScript (.d.ts) para autocompletado IDE
  splitting: true,        // Comparte código entre entrypoints para ahorrar peso
  sourcemap: true,
  clean: true,            // Limpia la carpeta dist/ antes de compilar
  minify: true,           // Optimización máxima para peso de producción
  treeshake: true,        // Elimina funciones no utilizadas (código muerto)
});
