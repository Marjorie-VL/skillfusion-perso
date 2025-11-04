# Guide : Basculer entre base locale et Render

## 🎯 Solution simple : deux URLs dans le .env

Vous pouvez garder **les deux URLs** dans votre `.env`, mais **une seule active** (l'autre commentée).

## 📝 Configuration recommandée

Dans votre fichier `SkillFusion/Back/.env` :

```env
# ============================================
# BASE DE DONNÉES
# ============================================

# 🔵 BASE LOCALE (rapide, pour développement)
# Décommentez cette ligne pour utiliser la base locale
PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion

# 🌐 BASE RENDER (lent, pour production)
# Décommentez cette ligne pour utiliser Render
# PG_URL=postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx

# ============================================
# AUTRES CONFIGURATIONS
# ============================================
ACCESS_TOKEN_SECRET=your-secret-key
ACCESS_TOKEN_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

## 🔄 Comment basculer

### Option 1 : Manuellement (rapide)

**Pour utiliser la base LOCALE :**
```env
# Active (sans #)
PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion

# Commentée (avec #)
# PG_URL=postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx
```

**Pour utiliser la base RENDER :**
```env
# Commentée (avec #)
# PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion

# Active (sans #)
PG_URL=postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx
```

### Option 2 : Via script (automatique)

J'ai créé un script pour basculer automatiquement :

```bash
# Basculer vers la base locale
npm run db:switch:local

# Basculer vers Render
npm run db:switch:render
```

Le script commente/décommente automatiquement les bonnes lignes.

## ✅ Exemple complet

**Votre `.env` pour développement local :**
```env
# Base de données LOCALE (active)
PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion

# Base de données RENDER (en réserve, commentée)
# PG_URL=postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx

ACCESS_TOKEN_SECRET=my-secret-key
ACCESS_TOKEN_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

**Si Render ne fonctionne pas** → Votre serveur utilisera automatiquement `localhost:5432` !

## 🚀 Workflow recommandé

1. **Développement quotidien** → Base locale (rapide)
   ```env
   PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion
   # PG_URL=postgres://...render... (commentée)
   ```

2. **Test avec données Render** → Basculer vers Render
   ```bash
   npm run db:switch:render
   # ou commentez/décommentez manuellement
   ```

3. **Retour au développement** → Basculer vers local
   ```bash
   npm run db:switch:local
   ```

## 💡 Astuce : Variables séparées

Si vous préférez, vous pouvez aussi définir les deux URLs séparément :

```env
# URLs de référence (toujours définies)
LOCAL_PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion
RENDER_PG_URL=postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx

# URL active (changez celle-ci)
PG_URL=${LOCAL_PG_URL}
# ou
# PG_URL=${RENDER_PG_URL}
```

Mais cette méthode nécessite que Node.js interprète les variables (ce qui peut ne pas fonctionner avec dotenv par défaut).

## 🎯 Recommandation finale

**La méthode la plus simple :**
- Gardez les deux URLs dans votre `.env`
- Une active (sans `#`)
- Une commentée (avec `#`)
- Basculez manuellement ou avec `npm run db:switch:local/render`

C'est le plus simple et le plus fiable ! 🚀

