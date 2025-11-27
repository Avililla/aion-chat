# Configuración de GitHub para AION Chat

## Opción 1: Usando GitHub CLI (Recomendado)

### Instalar GitHub CLI

```bash
# macOS
brew install gh

# o descarga desde https://cli.github.com
```

### Autenticar

```bash
gh auth login
```

### Crear repositorio y hacer push

```bash
cd /Users/alejandroavila/AgenciaIA/aion/aion-chat

# Crear repositorio público
gh repo create aion-chat --public --source=. --remote=origin --push

# O crear repositorio privado
gh repo create aion-chat --private --source=. --remote=origin --push
```

## Opción 2: Manualmente desde GitHub Web

### 1. Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. **Repository name**: `aion-chat`
3. **Description**: "Modern chat interface for AION AI - Next.js + AI SDK"
4. **Visibility**: Público (para Vercel gratuito) o Privado
5. **NO** inicialices con README, .gitignore o license (ya los tienes)
6. Click **"Create repository"**

### 2. Conectar y Hacer Push

GitHub te mostrará instrucciones. Usa estas (reemplaza `TU-USUARIO`):

```bash
cd /Users/alejandroavila/AgenciaIA/aion/aion-chat

# Añadir remote
git remote add origin https://github.com/TU-USUARIO/aion-chat.git

# Hacer push
git push -u origin main
```

## Opción 3: Usando SSH (si ya tienes SSH configurado)

```bash
cd /Users/alejandroavila/AgenciaIA/aion/aion-chat

# Añadir remote con SSH
git remote add origin git@github.com:TU-USUARIO/aion-chat.git

# Hacer push
git push -u origin main
```

## Verificar

Después del push, verifica:

```bash
# Ver el remote configurado
git remote -v

# Ver el último commit
git log --oneline -1
```

## Siguiente Paso: Desplegar en Vercel

Una vez que el código esté en GitHub:

1. Ve a https://vercel.com/new
2. Importa el repositorio `aion-chat`
3. Configura la variable `AION_BACKEND_URL`
4. Deploy!

Ver instrucciones completas en `VERCEL_DEPLOY.md`

## Comandos Útiles

```bash
# Ver status
git status

# Ver log
git log --oneline

# Ver remote
git remote -v

# Cambiar URL del remote
git remote set-url origin https://github.com/NUEVO-USUARIO/aion-chat.git
```
