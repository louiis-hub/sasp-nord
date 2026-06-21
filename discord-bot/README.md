# Bot Discord SASP Nord

Bot de tickets de recrutement hébergé gratuitement sur Cloudflare Workers.

## Fonctions

- commande `/ticket-recrutement`
- création d'un salon privé dans la catégorie recrutement
- ajout du rôle candidat
- accès au candidat et au rôle staff
- bouton vers le test
- bouton de fermeture
- retrait automatique du rôle candidat

## Secrets à ne jamais publier

Configurer avec Wrangler :

```powershell
npx wrangler secret put DISCORD_BOT_TOKEN
```

Le token ne doit jamais être écrit dans un fichier ou envoyé sur GitHub.

## Déploiement

```powershell
npm install
npx wrangler login
npm run deploy
```

Après déploiement, mettre cette URL dans Discord Developer Portal, rubrique General Information :

```text
https://sasp-nord-discord-bot.<compte>.workers.dev/interactions
```

Puis enregistrer la commande avec les variables d'environnement locales requises.
