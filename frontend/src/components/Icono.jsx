// Los íconos son archivos SVG en src/assets/icons.
// Para usar los de Figma basta con reemplazar el archivo conservando el nombre.
const archivos = import.meta.glob('../assets/icons/*.svg', { eager: true, query: '?url', import: 'default' });

export default function Icono({ nombre, tamano = 18 }) {
  return <img src={archivos[`../assets/icons/${nombre}.svg`]} alt="" width={tamano} height={tamano} />;
}
