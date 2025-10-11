# 🛟 Manual de Recuperación Completo | Complete Recovery Manual

> **Acceso rápido / Quick access:** Este manual está disponible tanto en la aplicación como en GitHub para que siempre tengas acceso, incluso si la aplicación no está disponible.

## 🌐 ¿Cómo acceder a este manual externamente? | How to access this manual externally?

### Español 🇪🇸

**¡Este manual YA está disponible públicamente en GitHub!**

Una vez que tu proyecto esté conectado a GitHub, este archivo (`RECOVERY_MANUAL.md`) se sincroniza automáticamente en tu repositorio. Puedes acceder a él de las siguientes formas:

1. **Directamente desde tu repositorio de GitHub:**
   - Ve a: `https://github.com/[tu-usuario-u-organizacion]/[nombre-repositorio]/blob/main/RECOVERY_MANUAL.md`
   - Ejemplo: `https://github.com/wincova/mi-tienda/blob/main/RECOVERY_MANUAL.md`

2. **Copia la URL y guárdala:**
   - Esta URL es pública y funcional 100%
   - Puedes compartirla con tus clientes
   - Funciona incluso si la aplicación está caída
   - No requiere autenticación para verla (es pública)

3. **Marca como favorito:**
   - Guarda la URL en tus favoritos del navegador
   - Compártela con tu equipo
   - Envíala por email a tus clientes

**💡 Consejo:** Copia la URL del manual ahora y guárdala en un lugar seguro (Google Drive, Notion, email, etc.)

### English 🇺🇸

**This manual is ALREADY publicly available on GitHub!**

Once your project is connected to GitHub, this file (`RECOVERY_MANUAL.md`) is automatically synced to your repository. You can access it in the following ways:

1. **Directly from your GitHub repository:**
   - Go to: `https://github.com/[your-username-or-organization]/[repo-name]/blob/main/RECOVERY_MANUAL.md`
   - Example: `https://github.com/wincova/my-store/blob/main/RECOVERY_MANUAL.md`

2. **Copy and save the URL:**
   - This URL is public and 100% functional
   - You can share it with your clients
   - It works even if the application is down
   - No authentication required to view it (it's public)

3. **Bookmark it:**
   - Save the URL in your browser bookmarks
   - Share it with your team
   - Email it to your clients

**💡 Tip:** Copy the manual URL now and save it in a safe place (Google Drive, Notion, email, etc.)

---

## 📋 Índice / Table of Contents

### Español 🇪🇸
1. [Estado de Conexión GitHub](#-estado-de-conexión-github)
2. [Escenario 1: Recuperar Código desde GitHub](#-escenario-1-recuperar-código-desde-github)
3. [Escenario 2: Moví el Repositorio a una Organización](#-escenario-2-moví-el-repositorio-a-una-organización)
4. [Escenario 3: Recuperar Datos](#-escenario-3-recuperar-datos-productos-órdenes)
5. [Lista de Prevención](#-lista-de-prevención)

### English 🇺🇸
1. [GitHub Connection Status](#-github-connection-status)
2. [Scenario 1: Recover Code from GitHub](#-scenario-1-recover-code-from-github)
3. [Scenario 2: Moved Repository to Organization](#-scenario-2-moved-repository-to-organization)
4. [Scenario 3: Recover Data](#-scenario-3-recover-data-products-orders)
5. [Prevention Checklist](#-prevention-checklist)

---

# 🇪🇸 VERSIÓN EN ESPAÑOL

## 🔗 Estado de Conexión GitHub

### ¿Cómo verificar tu conexión?

1. Ve al editor de Lovable
2. Haz clic en el botón **GitHub** en la parte superior derecha
3. Si dice "Connected to [nombre-repo]" → ✅ **Estás conectado correctamente**
4. Si dice "Connect to GitHub" → ⚠️ **Necesitas conectarte**

**Enlaces útiles:**
- [Abrir GitHub](https://github.com)
- [Abrir Lovable](https://lovable.dev)

---

## 📦 Escenario 1: Recuperar Código desde GitHub

**Situación:** Perdiste acceso a Lovable o el proyecto desapareció

### Paso 1: Ve a GitHub

1. Abre tu navegador
2. Ve a **github.com**
3. Inicia sesión con tu cuenta

### Paso 2: Busca tu repositorio

En la página principal de GitHub, busca el repositorio de tu proyecto:

**Si el repositorio estaba en tu cuenta personal:**
- Busca en "Your repositories" (tus repositorios)

**Si el repositorio está en una organización:**
1. Haz clic en tu foto de perfil (arriba derecha)
2. Selecciona "Your organizations"
3. Entra a la organización
4. Busca el repositorio ahí

### Paso 3: Descarga el código

Dentro del repositorio, haz clic en el botón verde **`<> Code`**

**Tienes 2 opciones:**

#### Opción A: Download ZIP (Más Fácil) ⭐
- Descarga un archivo .zip con todo el código
- Descomprímelo en tu computadora

#### Opción B: Clonar con Git
```bash
git clone <URL-del-repositorio>
```
*(Requiere conocimientos técnicos)*

### Paso 4: Despliega el código

Ahora que tienes el código, puedes desplegarlo:

#### Opción 1: Vercel (Recomendado - Gratis) 🚀

1. Ve a **vercel.com**
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio
4. Haz clic en "Deploy"
5. ✅ ¡Tu sitio estará en línea en 2 minutos!

#### Opción 2: Netlify (También Gratis)

1. Ve a **netlify.com**
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio
4. Haz clic en "Deploy site"
5. ✅ ¡Tu sitio estará en línea!

#### Opción 3: Volver a Lovable

1. Crea un nuevo proyecto en Lovable
2. Conecta el mismo repositorio de GitHub
3. Lovable sincronizará todo el código
4. Podrás continuar editando desde donde quedaste

---

## 🏢 Escenario 2: Moví el Repositorio a una Organización

**Situación:** El proyecto desapareció de Lovable después de mover el repositorio

### ¿Qué pasó?

Cuando mueves un repositorio de tu cuenta personal a una organización en GitHub, Lovable pierde la conexión porque la URL del repositorio cambió.

### ✅ No entres en pánico

- ✅ Tu código está 100% seguro en GitHub
- ✅ No perdiste nada
- ✅ Solo necesitas reconectar Lovable

### Paso 1: Verifica que el repo está en la organización

En GitHub:
1. Haz clic en tu foto de perfil → "Your organizations"
2. Selecciona tu organización
3. Busca el repositorio → Debería estar ahí

### Paso 2: Reconecta en Lovable

**Opción A: Actualizar la conexión (Más Rápido)** ⚡

1. En Lovable, haz clic en **GitHub → Disconnect**
2. Luego haz clic en **GitHub → Connect to GitHub**
3. Selecciona la organización
4. Selecciona el repositorio
5. ✅ ¡Reconectado! Todo volverá a aparecer

**Opción B: Crear nuevo proyecto y conectar**

1. Crea un nuevo proyecto en Lovable
2. Conecta GitHub
3. Selecciona la organización
4. Selecciona el repositorio existente
5. Lovable sincronizará todo el código automáticamente

---

## 💾 Escenario 3: Recuperar Datos (Productos, Órdenes)

**Situación:** Perdiste datos de la base de datos

### Paso 1: Ve a Sistema de Backups

En el panel de administración, ve a **Sistema de Backups**

### Paso 2: Busca el backup que deseas restaurar

Los backups están ordenados por fecha. Elige el más reciente.

### Paso 3: Haz clic en "Restaurar"

Confirma la restauración y espera a que termine el proceso.

### ⚠️ Importante:

La restauración solo recupera los **datos** (productos, órdenes, usuarios). NO recupera el código de la aplicación.

---

## 🛡️ Lista de Prevención

Sigue estos pasos para estar siempre protegido:

- ✅ Conecta tu proyecto a GitHub (5 minutos)
- ✅ Activa los backups automáticos diarios
- ✅ Mantén seguras tus credenciales de GitHub
- ✅ Crea un backup manual antes de cambios importantes
- ✅ Guarda la URL de este manual en un lugar seguro
- ✅ Anota la URL de tu repositorio: `github.com/[organizacion]/[repositorio]`

---

## 🔧 Problemas Comunes y Soluciones

### "No veo mi repositorio en GitHub"

**Solución:**
1. Verifica que estás conectado con la cuenta correcta
2. Si está en una organización, asegúrate de tener acceso a ella
3. Revisa la sección "Your organizations" en tu perfil

### "Lovable dice que no puede conectar a GitHub"

**Solución:**
1. Revoca el acceso de Lovable en: github.com/settings/applications
2. Vuelve a conectar desde Lovable
3. Asegúrate de dar todos los permisos necesarios

### "Mi código está en GitHub pero la aplicación no funciona"

**Solución:**
- GitHub solo guarda el código, no la base de datos
- Necesitas restaurar los datos desde un backup
- Sigue el Escenario 3 de este manual

### "Perdí el acceso a mi cuenta de GitHub"

**Solución:**
1. Usa la recuperación de contraseña de GitHub
2. Si usas 2FA, usa tus códigos de respaldo
3. Contacta al soporte de GitHub si es necesario

---

## ❓ Preguntas Frecuentes (FAQ)

**P: ¿Con qué frecuencia se sincroniza el código a GitHub?**  
R: Cada vez que Lovable guarda cambios, se sincroniza automáticamente en tiempo real.

**P: ¿Puedo tener múltiples backups?**  
R: Sí, puedes configurar backups automáticos diarios, semanales y crear backups manuales cuando quieras.

**P: ¿Qué pasa si borro algo por error?**  
R: Puedes restaurar desde un backup o usar el historial de versiones de GitHub.

**P: ¿Los backups incluyen imágenes y archivos?**  
R: Sí, los backups incluyen toda la base de datos, incluyendo referencias a archivos almacenados.

**P: ¿Puedo descargar el código sin GitHub?**  
R: No, necesitas tener GitHub conectado para poder descargar tu código.

---

# 🇺🇸 ENGLISH VERSION

## 🔗 GitHub Connection Status

### How to verify your connection?

1. Go to the Lovable editor
2. Click the **GitHub** button in the top right
3. If it says "Connected to [repo-name]" → ✅ **You're connected correctly**
4. If it says "Connect to GitHub" → ⚠️ **You need to connect**

**Useful links:**
- [Open GitHub](https://github.com)
- [Open Lovable](https://lovable.dev)

---

## 📦 Scenario 1: Recover Code from GitHub

**Situation:** You lost access to Lovable or the project disappeared

### Step 1: Go to GitHub

1. Open your browser
2. Go to **github.com**
3. Sign in with your account

### Step 2: Find your repository

On the GitHub homepage, search for your project repository:

**If the repository was in your personal account:**
- Search in "Your repositories"

**If the repository is in an organization:**
1. Click on your profile picture (top right)
2. Select "Your organizations"
3. Enter the organization
4. Find the repository there

### Step 3: Download the code

Inside the repository, click the green **`<> Code`** button

**You have 2 options:**

#### Option A: Download ZIP (Easiest) ⭐
- Download a .zip file with all the code
- Extract it on your computer

#### Option B: Clone with Git
```bash
git clone <repository-URL>
```
*(Requires technical knowledge)*

### Step 4: Deploy the code

Now that you have the code, you can deploy it:

#### Option 1: Vercel (Recommended - Free) 🚀

1. Go to **vercel.com**
2. Connect your GitHub account
3. Select the repository
4. Click "Deploy"
5. ✅ Your site will be online in 2 minutes!

#### Option 2: Netlify (Also Free)

1. Go to **netlify.com**
2. Connect your GitHub account
3. Select the repository
4. Click "Deploy site"
5. ✅ Your site will be online!

#### Option 3: Return to Lovable

1. Create a new project in Lovable
2. Connect the same GitHub repository
3. Lovable will sync all the code
4. You can continue editing from where you left off

---

## 🏢 Scenario 2: Moved Repository to Organization

**Situation:** The project disappeared from Lovable after moving the repository

### What happened?

When you move a repository from your personal account to an organization on GitHub, Lovable loses the connection because the repository URL changed.

### ✅ Don't panic

- ✅ Your code is 100% safe on GitHub
- ✅ You didn't lose anything
- ✅ You just need to reconnect Lovable

### Step 1: Verify the repo is in the organization

On GitHub:
1. Click on your profile picture → "Your organizations"
2. Select your organization
3. Find the repository → It should be there

### Step 2: Reconnect in Lovable

**Option A: Update the connection (Faster)** ⚡

1. In Lovable, click **GitHub → Disconnect**
2. Then click **GitHub → Connect to GitHub**
3. Select the organization
4. Select the repository
5. ✅ Reconnected! Everything will reappear

**Option B: Create new project and connect**

1. Create a new project in Lovable
2. Connect GitHub
3. Select the organization
4. Select the existing repository
5. Lovable will sync all the code automatically

---

## 💾 Scenario 3: Recover Data (Products, Orders)

**Situation:** You lost database data

### Step 1: Go to System Backups

In the admin panel, go to **System Backups**

### Step 2: Find the backup you want to restore

Backups are ordered by date. Choose the most recent one.

### Step 3: Click "Restore"

Confirm the restoration and wait for the process to complete.

### ⚠️ Important:

Restoration only recovers **data** (products, orders, users). It does NOT recover the application code.

---

## 🛡️ Prevention Checklist

Follow these steps to always be protected:

- ✅ Connect your project to GitHub (5 minutes)
- ✅ Enable automatic daily backups
- ✅ Keep your GitHub credentials secure
- ✅ Create a manual backup before major changes
- ✅ Save this manual's URL in a safe place
- ✅ Note your repository URL: `github.com/[organization]/[repository]`

---

## 🔧 Common Problems and Solutions

### "I don't see my repository on GitHub"

**Solution:**
1. Verify you're logged in with the correct account
2. If it's in an organization, make sure you have access to it
3. Check the "Your organizations" section in your profile

### "Lovable says it can't connect to GitHub"

**Solution:**
1. Revoke Lovable's access at: github.com/settings/applications
2. Reconnect from Lovable
3. Make sure to grant all necessary permissions

### "My code is on GitHub but the application doesn't work"

**Solution:**
- GitHub only stores the code, not the database
- You need to restore data from a backup
- Follow Scenario 3 in this manual

### "I lost access to my GitHub account"

**Solution:**
1. Use GitHub's password recovery
2. If you use 2FA, use your backup codes
3. Contact GitHub support if necessary

---

## ❓ Frequently Asked Questions (FAQ)

**Q: How often is code synced to GitHub?**  
A: Every time Lovable saves changes, it syncs automatically in real-time.

**Q: Can I have multiple backups?**  
A: Yes, you can configure automatic daily, weekly backups and create manual backups whenever you want.

**Q: What happens if I delete something by mistake?**  
A: You can restore from a backup or use GitHub's version history.

**Q: Do backups include images and files?**  
A: Yes, backups include the entire database, including references to stored files.

**Q: Can I download the code without GitHub?**  
A: No, you need to have GitHub connected to be able to download your code.

---

## 📞 Necesitas ayuda? / Need help?

**Español:** Nuestro equipo de soporte está disponible 24/7  
**English:** Our support team is available 24/7

📧 Email: support@wincova.com  
💬 WhatsApp: +1 (555) 123-4567

---

> **Nota:** Este manual se mantiene actualizado automáticamente. Última actualización: 2025
