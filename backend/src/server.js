import { app } from './app.js';

const PUERTO = process.env.PORT || 3001;

app.listen(PUERTO, () => {
  console.log(`API de Inkaterra lista en http://localhost:${PUERTO}/api`);
});
