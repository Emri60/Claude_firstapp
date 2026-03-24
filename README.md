# Sourcing Vintage Pologne

Application web full-stack de sourcing d'objets vintage pour des voyages à Varsovie.
Utilisée par 2 personnes max — synchronisation par simple rechargement de page.

## Stack technique

- **Frontend** : React + Vite + Tailwind CSS
- **Backend** : Node.js + Express
- **Base de données** : PostgreSQL + Prisma ORM
- **Stockage photos** : Cloudflare R2
- **IA** : API Anthropic (claude-haiku-4-5)
- **Infra** : PM2 + Nginx + Certbot

---

## Variables d'environnement

Copier `.env.example` en `.env` dans le dossier `server/` :

```bash
cp .env.example server/.env
```

Remplir les valeurs :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vintage_pologne
JWT_SECRET=votre_secret_long_et_aleatoire
ANTHROPIC_API_KEY=sk-ant-...
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=vintage-photos
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
PORT=3001
```

---

## Installation sur VPS Linux vierge

### 1. Prérequis système

```bash
# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PM2
sudo npm install -g pm2

# Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Base de données

```bash
sudo -u postgres psql
```

```sql
CREATE USER vintage WITH PASSWORD 'votre_mot_de_passe';
CREATE DATABASE vintage_pologne OWNER vintage;
\q
```

### 3. Cloner et installer

```bash
git clone git@github.com:Emri60/Claude_firstapp.git /var/www/vintage
cd /var/www/vintage
npm run install:all
```

### 4. Configuration

```bash
cp .env.example server/.env
nano server/.env   # remplir toutes les variables
```

### 5. Base de données — migration et seed

```bash
cd server
npx prisma migrate deploy
npx prisma db seed
```

Le seed crée :
- 2 utilisateurs : `user1` / `user2` (mot de passe : `sourcing2024`)
- 18 objets vintage pré-remplis (lampes, affiches, fauteuils)
- 11 items checklist de départ

### 6. Build du client

```bash
cd /var/www/vintage
npm run build:client
```

### 7. Lancer avec PM2

```bash
cd /var/www/vintage
pm2 start server/src/index.js --name "vintage-server"
pm2 save
pm2 startup   # suivre les instructions affichées
```

---

## Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/vintage
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend (fichiers statiques)
    location / {
        root /var/www/vintage/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vintage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### HTTPS avec Certbot

```bash
sudo certbot --nginx -d votre-domaine.com
```

---

## Configuration Cloudflare R2

1. Dans le dashboard Cloudflare → R2 → Créer un bucket (`vintage-photos`)
2. Paramétrer le bucket comme **public** (ou créer un domaine personnalisé)
3. Créer des **API tokens** (Access Key ID + Secret Access Key) avec permission `Object:Write`
4. Récupérer l'**Account ID** (visible dans le dashboard R2)
5. Copier l'URL publique du bucket (`CLOUDFLARE_R2_PUBLIC_URL`)

---

## Configuration API Anthropic

1. Se connecter sur [console.anthropic.com](https://console.anthropic.com)
2. API Keys → Create Key
3. Copier la clé dans `ANTHROPIC_API_KEY`

L'assistant IA utilise le modèle `claude-haiku-4-5-20251001` avec le contexte de votre base d'objets injecté automatiquement.

---

## Comptes utilisateurs

Les comptes sont créés automatiquement par le seed :

| Utilisateur | Mot de passe  |
|-------------|---------------|
| user1       | sourcing2024  |
| user2       | sourcing2024  |

Pour changer les mots de passe, modifier `server/prisma/seed.js` et relancer le seed.

---

## Commandes utiles

```bash
# Logs du serveur
pm2 logs vintage-server

# Redémarrer après mise à jour
git pull
npm run build:client
pm2 restart vintage-server

# Studio Prisma (interface DB)
cd server && npx prisma studio

# Migrer après modification du schéma
cd server && npx prisma migrate deploy
```

---

## Développement local

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Le client Vite proxy automatiquement `/api` vers `http://localhost:3001`.
