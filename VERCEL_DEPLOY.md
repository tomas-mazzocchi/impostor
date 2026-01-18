# Guía de Despliegue en Vercel (Gratis)

## Prerrequisitos

1. **Cuenta en Vercel**: Crea una cuenta gratuita en [vercel.com](https://vercel.com)
2. **Repositorio Git**: Tu código debe estar en GitHub, GitLab o Bitbucket
3. **Proyecto Supabase configurado**: Con las migraciones ejecutadas y datos seed insertados

## Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en un repositorio Git:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio desde GitHub/GitLab/Bitbucket
4. Vercel detectará automáticamente que es un proyecto SvelteKit

### 3. Configurar Variables de Entorno

En la configuración del proyecto en Vercel:

1. Ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

   - `PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `PUBLIC_SUPABASE_ANON_KEY` = tu anon key de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` = tu service role key de Supabase

3. Asegúrate de seleccionar todos los ambientes (Production, Preview, Development)

### 4. Configurar Build Settings

Vercel debería detectar automáticamente:
- **Framework Preset**: SvelteKit
- **Build Command**: `npm run build`
- **Output Directory**: `.svelte-kit` (automático)
- **Install Command**: `npm install`

Si no se detecta automáticamente, verifica que `vercel.json` esté en el repositorio.

### 5. Desplegar

1. Click en **"Deploy"**
2. Espera a que el build termine (2-3 minutos)
3. Una vez completado, tendrás una URL como: `tu-proyecto.vercel.app`

### 6. Verificar el Despliegue

1. Visita la URL de tu proyecto
2. Verifica que la app carga correctamente
3. Prueba que los datos se cargan desde Supabase

## Comandos Útiles

### Instalar dependencias localmente (si cambias package.json)

```bash
npm install
```

### Probar el build localmente

```bash
npm run build
npm run preview
```

## Troubleshooting

### Error: "Environment variable not found"
- Verifica que todas las variables estén configuradas en Vercel
- Asegúrate de que los nombres sean exactos (case-sensitive)
- Reinicia el deployment después de agregar variables

### Error: "Build failed"
- Revisa los logs de build en Vercel
- Verifica que `package.json` tenga todas las dependencias
- Asegúrate de que el comando `npm run build` funcione localmente

### La app carga pero no hay datos
- Verifica que las migraciones estén ejecutadas en Supabase
- Verifica que el seed data esté insertado
- Revisa la consola del navegador para errores de API

## Plan Gratuito de Vercel

El plan gratuito incluye:
- ✅ Despliegues ilimitados
- ✅ 100GB de ancho de banda por mes
- ✅ SSL automático
- ✅ Dominios personalizados
- ✅ Preview deployments para cada PR

## Notas Importantes

1. **Variables de Entorno**: Nunca commitees el archivo `.env` (ya está en `.gitignore`)
2. **Supabase Free Tier**: Asegúrate de que tu proyecto Supabase esté en el plan gratuito
3. **Build Time**: El build puede tardar 2-3 minutos la primera vez

## Siguiente Paso

Una vez desplegado, puedes:
- Agregar un dominio personalizado en Vercel Settings → Domains
- Configurar auto-deploy para cada push a main
- Monitorear el uso en el dashboard de Vercel
