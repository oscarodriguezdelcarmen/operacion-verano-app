# OPERACIÓN VERANO

App de entrenamiento y disciplina diaria para el verano. Transforma tu cuerpo y tu mente.

## Características

- **4 objetivos diarios**: 100 flexiones, 5 km, 9 series abdominales, 3 series brazo
- **Sistema de medallas**: Oro (100%), Plata (75-99%), Bronce (50-74%), Fallido (<50%)
- **Rachas diarias**: Contador de días seguidos y récord de racha
- **PWA completa para iOS**: Installable en el iPhone 15, modo oscuro OLED
- **Notificaciones push**: Recordatorios cada 1 hora con silencio inteligente al conseguir el oro
- **Archivo de peso**: Registro semanal de peso corporal
- **Backup/restore**: Exportar/importar datos en JSON

## Despliegue

- **URL**: https://oscarodriguezdelcarmen.github.io/operacion-verano-app/
- **GitHub Pages**: Activado
- **GitHub Actions**: Despliegue automático en push a main

## Tecnicas

- React 18 + Vite + Tailwind CSS
- Lucide Icons
- localStorage para persistencia
- Web Push API con VAPID keys

## Desarrollo local

```bash
npm install
npm run dev
```

## Despliegue

```bash
npm run build
```

## Licencia

MIT
