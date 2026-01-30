
# Portfolio académique — Candidatures 2026

Site minimaliste pour candidatures L2 Informatique, L3 MIAGE, Prépa ATS (Île-de-France).

Exécution locale
1. Installer un petit serveur statique (ex. `serve`) :  
   - Avec npm : `npx serve` (depuis la racine du projet)  
   - Ou Python 3 : `python -m http.server 8000`  
   - Ou utiliser "Live Server" dans VS Code.

2. Ouvrir : `http://localhost:5000` (ou le port indiqué par l'outil choisi).

Remarques
- Le site charge tout le contenu depuis `/data/content.json`.  
- Placer les fichiers PDF finaux dans `/public/cv.pdf` et `/public/dossier.pdf`.
- Pas de dépendances externes, pas de suivi, interface légère et accessible.
