# Audit de publication du plugin STH

Vérification du 5 octobre 2026. Ce document prépare la soumission publique : il ne constate ni une approbation OpenAI ni une publication. Aucun serveur, compte, contenu d’organisation ou paramètre de production n’a été modifié pendant cet audit.

La demande du créateur est de publier sous le nom « Skills transfer hub », dans tous les pays proposés, avec accès selon les droits STH et paiement éventuel sur le site STH. Ce nom demandé ne constitue pas une identité de développeur vérifiée dans le portail.

## Pages publiques vérifiées

Les destinations ont été téléchargées avec `curl -L`, sans cookie ni authentification, puis leur texte HTML a été inspecté. Les six pages ci-dessous renvoyaient HTTP 200. Aucun formulaire de contact n’a été envoyé : la livraison effective des demandes n’a pas été testée.

| Champ / usage | URL exacte | Contenu constaté et résultat |
| --- | --- | --- |
| `websiteURL` candidat | https://www.skillsth.com/fr | Présente Skills Transfer Hub, le CLI, la bibliothèque d’organisation et le MCP distant. L’accueil est public et identifie STH, mais ne présente pas explicitement le plugin ChatGPT/Codex. Ajouter une présentation publique du plugin avant de considérer ce champ entièrement vérifié pour la soumission. |
| `supportURL` | https://www.skillsth.com/fr/contact | Page « Contactez l’équipe STH » ; formulaire avec nom, e-mail, organisation facultative, objet (dont « Problème rencontré »), message et bouton d’envoi. Accessible sans compte. |
| `privacyPolicyURL` candidat | https://www.skillsth.com/fr/legal/privacy | Politique STH publique, datée du 26 avril 2026. Le contenu est accessible, mais sa couverture des pratiques du plugin est insuffisante et contradictoire avec le stockage de la bibliothèque. À corriger avant soumission. |
| `termsOfServiceURL` candidat | https://www.skillsth.com/fr/legal/terms | CGU STH publiques, datées du 26 avril 2026. Le périmètre annoncé est le CLI et le tableau de bord ; ni le plugin ChatGPT/Codex ni les échanges MCP ne sont explicitement couverts. À mettre à jour avant soumission. |
| Identité / contact complémentaire | https://www.skillsth.com/fr/legal/notices | Identifie l’éditeur comme personne physique non professionnelle et donne `contact@skillsth.com`. Le document utilise encore le domaine `sth.dev`. Ne prouve pas une vérification du nom « Skills transfer hub » par le portail OpenAI. |
| Présentation Cloud complémentaire | https://www.skillsth.com/fr/features/cloud | Présente catalogue hébergé, licences, quotas, télémétrie et configuration d’équipe, avec accès Alpha. Ne constitue pas une page dédiée au plugin. |

`https://www.skillsth.com/` redirige vers `https://www.skillsth.com/fr`. Les URL ci-dessus sont de vraies destinations observées, pas des routes supposées. La page Contact est présente en production mais absente du checkout local inspecté : le code local et le déploiement ne sont pas identiques.

## Écarts de confidentialité et de conditions

Les constats ci-dessous décrivent un écart de contenu ou une absence de preuve technique ; ils ne fixent aucune nouvelle durée de conservation ni aucun engagement juridique.

1. **Stockage bibliothèque absent du discours public.** La politique publique affirme que seuls le tableau de bord et la télémétrie optionnelle traitent des données, et que STH ne stocke jamais les skills ou le contenu Git. Le connecteur transmet pourtant à STH le titre, le corps, le type, l’outil et le modèle source d’un contenu sauvegardé, avec l’organisation et l’auteur. Preuves : [texte français local correspondant](/Users/hugo/Developer/sth/sth-dashboard/src/i18n/messages/fr.json:1454), [sauvegarde MCP](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/library-mcp.service.ts:453), [colonnes bibliothèque](/Users/hugo/Developer/sth/sth-dashboard/supabase/migrations/0035_library_core.sql:36).
2. **Partage d’organisation non expliqué pour le plugin.** Les recherches et lectures sont limitées à l’organisation active du compte, après vérification d’appartenance, d’accès produit et de scopes. Le résultat complet est renvoyé au client MCP demandeur. La future politique doit distinguer les données envoyées au service STH, les contenus partagés avec les membres autorisés et les contenus renvoyés dans ChatGPT/Codex. Preuves : [contrôles d’accès](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/library-mcp.service.ts:162), [recherche](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/library-mcp.service.ts:378), [lecture et réponse](/Users/hugo/Developer/sth/sth-dashboard/src/app/api/[transport]/route.ts:109).
3. **Journalisation MCP et réutilisation absentes des catégories publiques.** Les appels réussis journalisent organisation, utilisateur, nom d’outil, identifiants de contenu, nom du client, cible et user-agent. Lire un item via `library_get`, ou un asset de bibliothèque via `asset_get`, ajoute aussi un événement de réutilisation. Le journal sert au tableau de bord d’activité et au contrôle de fréquence. Preuves : [journal MCP](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/library-mcp.service.ts:306), [événement de réutilisation](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/library-mcp.service.ts:331), [contrôle de fréquence](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/library-mcp.service.ts:234), [visibilité propriétaire/admin](/Users/hugo/Developer/sth/sth-dashboard/supabase/migrations/0040_mcp_tool_events.sql:35).
4. **Contradiction publique sur les cookies.** La section Cookies de la politique nie les cookies tiers de mesure d’audience. La bannière des pages publiques explique l’utilisation de Microsoft Clarity pour heatmaps et replays de session. Cette observation ne prouve pas quand un script se déclenche : le chargement avant/après consentement n’a pas été testé. Il faut aligner le texte avec le fonctionnement réellement retenu.
5. **CGU à étendre au comportement réel.** Leur objet est le CLI et le dashboard ; la section Données décrit la synchronisation entièrement locale et aucune conservation de contenu de dépôt. Ajouter les fonctions effectivement proposées par le plugin et la bibliothèque partagée sans promettre une gratuité, un SLA ou un effacement non confirmé. Preuves : [objet](/Users/hugo/Developer/sth/sth-dashboard/src/app/[locale]/(public)/legal/terms/page.tsx:22), [description](/Users/hugo/Developer/sth/sth-dashboard/src/app/[locale]/(public)/legal/terms/page.tsx:46), [données](/Users/hugo/Developer/sth/sth-dashboard/src/app/[locale]/(public)/legal/terms/page.tsx:145).

## Effacement et rétention : ce que le code permet d’établir

| Donnée / action | Comportement trouvé | Limite de preuve |
| --- | --- | --- |
| Archivage d’un item | L’auteur ou un administrateur peut faire passer `status` à `archived`. Les recherches MCP excluent les éléments archivés. | L’archivage ne supprime ni le corps ni l’enregistrement. Aucun outil MCP de suppression n’est enregistré. [Service](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/library.service.ts:327), [action UI](/Users/hugo/Developer/sth/sth-dashboard/src/app/[locale]/(dashboard)/dashboard/library/actions.ts:76). |
| Demande de suppression du compte | Après les garde-fous sur les organisations possédées, `account_status` devient `pending_deletion`. | Cette fonction ne supprime pas l’utilisateur et ne programme pas elle-même un traitement différé. La route redirige ensuite vers la connexion. [Service](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/account.service.ts:44), [route](/Users/hugo/Developer/sth/sth-dashboard/src/app/api/account/delete/route.ts:8). |
| Demande de suppression d’organisation | Le propriétaire passe l’organisation en `scheduled_for_deletion` et remplit `deletion_scheduled_at`. Annulation autorisée avant 30 jours. | Une fenêtre de récupération est implémentée ; aucune preuve de l’exécution d’une suppression définitive n’a été trouvée dans les sources inspectées. [Planification](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/organization.service.ts:417), [annulation](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/organization.service.ts:429). |
| Suppression physique d’organisation | Les clés étrangères des items, événements bibliothèque et événements MCP utilisent `ON DELETE CASCADE`. | Ces contraintes agissent seulement si une suppression physique se produit ; elles ne constituent pas un job de suppression. [Items](/Users/hugo/Developer/sth/sth-dashboard/supabase/migrations/0035_library_core.sql:36), [réutilisation](/Users/hugo/Developer/sth/sth-dashboard/supabase/migrations/0036_library_events.sql:15), [MCP](/Users/hugo/Developer/sth/sth-dashboard/supabase/migrations/0040_mcp_tool_events.sql:20). |
| Suppression physique d’utilisateur | Les champs d’auteur des items et les références utilisateur des événements passent à `NULL`. | Le contenu partagé d’organisation ne serait donc pas effacé par cette seule cascade. Les mêmes migrations ci-dessus en sont la source. |
| Événements bibliothèque | La migration indique explicitement qu’aucune purge de rétention n’est prévue pour ces KPI. | Aucune durée maximale implémentée n’est prouvée. [Migration 0036](/Users/hugo/Developer/sth/sth-dashboard/supabase/migrations/0036_library_events.sql:10). |
| Événements MCP | Table append-only d’activité, sans purge temporelle trouvée dans les migrations ou services inspectés. | Ne pas leur attribuer par analogie les 30 jours de télémétrie CLI. [Migration 0040](/Users/hugo/Developer/sth/sth-dashboard/supabase/migrations/0040_mcp_tool_events.sql:1). |
| Télémétrie CLI | Cron quotidien supprimant les lignes âgées de plus de 30 jours ; équivalent pour télémétrie anonyme. | La présence de la migration n’est pas une vérification du job réellement actif en production. [Cron connecté](/Users/hugo/Developer/sth/sth-dashboard/supabase/migrations/0013_cli_usage_retention_cron.sql:29), [cron anonyme](/Users/hugo/Developer/sth/sth-dashboard/supabase/migrations/0024_cli_usage_anon.sql:60). |

La recherche ciblée dans `sth-dashboard/src`, ses migrations et `sth-back` n’a trouvé aucun worker consommant `pending_deletion` ou `scheduled_for_deletion` pour effectuer une purge finale. Un traitement externe peut exister : il reste à identifier et à vérifier. La politique publique annonce 30 jours après suppression du compte ou fin de contrat pour les données d’organisation ; il ne faut pas transformer cette annonce en preuve d’exécution.

Le créateur doit confirmer la durée souhaitée pour les contenus partagés et les journaux MCP/réutilisation, ainsi que le responsable et le moyen effectif d’exécuter les demandes d’effacement. La revue technique permet déjà de décrire le stockage, les destinataires et l’archivage ; inutile de lui redemander ces faits établis. Les autres garanties publiques (région, sauvegardes, contrats avec sous-traitants) n’ont pas été vérifiées dans l’infrastructure pendant cet audit.

## Schémas et annotations MCP

Source inspectée : checkout `sth-dashboard`, HEAD `e35b8d2`, avec modifications locales préexistantes.

Les six outils déclarent `inputSchema` et `outputSchema`, mais aucune propriété `annotations` dans le fichier de route. Le nombre d’outils exposés dépend aussi des scopes et droits du compte. Dans cette session, cinq outils STH sont effectivement proposés au modèle ; `capabilities_get` n’y figure pas. Cela ne prouve pas son absence pour tous les comptes ni la concordance complète du déploiement avec ce checkout.

| Outil | Entrées source | Sortie structurée | Effets persistants observés dans le code |
| --- | --- | --- | --- |
| `library_search` | `query?`, `kind?` (`prompt`, `artifact`) | `{ items }` | Ajout d’un événement MCP après la recherche. |
| `library_get` | `id` | `{ item }` | Ajout d’une réutilisation et d’un événement MCP pour un item trouvé. |
| `library_save` | `kind` par défaut `prompt`, `title`, `body`, `source_tool?`, `source_model?` | `{ id }` | Création d’un item dans l’organisation active puis événement MCP. |
| `asset_search` | `query?`, `family?`, `kind?` | `{ assets }` | Recherche du catalogue public STH et/ou des données autorisées de l’organisation, puis événement MCP. |
| `asset_get` | `id` | `{ asset }` | Lecture d’un package ou item autorisé ; journal MCP et réutilisation pour la branche bibliothèque. |
| `capabilities_get` | `target?`, `kind?` | `{ cliVersion, cells }` | Lecture du manifeste embarqué, avec autorisation et événement MCP. |

Preuves : [route et schémas](/Users/hugo/Developer/sth/sth-dashboard/src/app/api/[transport]/route.ts:82), [autorisation du tool de métadonnées](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/library-mcp.service.ts:268), [capabilities](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/capabilities-mcp.service.ts:26).

Le fichier [`mcp-annotations.patch`](/Users/hugo/Developer/sth/sth-plugin/docs/mcp-annotations.patch) est une proposition **non appliquée** au serveur. Il ajoute aux six outils :

- `readOnlyHint: false` : proposition conservatrice car tous peuvent créer une ligne persistante dans l’activité produit ; les lectures d’items créent aussi des événements de réutilisation. La FAQ de revue OpenAI cite explicitement « write logs » parmi les actions justifiant `false`. Il reste une ambiguïté de frontière : les logs opérationnels d’infrastructure ne sont pas nécessairement une mutation produit, et le guide recommande par ailleurs une journalisation opérationnelle. Ici, les lignes d’activité alimentent une interface utilisateur, des KPI par membre et le contrôle de fréquence. Cette proposition ne constitue pas une classification validée par OpenAI. Une variante `true` pour les recherches et métadonnées demanderait une justification de cette frontière, voire une séparation des effets produit ; elle ne doit pas découler du seul nom de l’outil.
- `destructiveHint: false` : les six handlers ne suppriment ni n’écrasent de contenu existant ; la sauvegarde est additive.
- `openWorldHint: false` : ils restent limités au catalogue STH et aux données autorisées du compte/organisation ; aucun n’accepte une URL arbitraire, ne parcourt le web ou n’envoie un message à une destination arbitraire.

Références OpenAI consultées : [sémantique des annotations](https://developers.openai.com/plugins/build/mcp-server#tool-annotations-and-elicitation), [champs d’annotations](https://developers.openai.com/plugins/reference#annotations), [FAQ de revue MCP](https://developers.openai.com/plugins/deploy/app-review#review-and-approval-faqs). Le patch traite seulement les métadonnées, pas les lacunes de confidentialité ou de rétention. La justification saisie dans le portail n’altère pas l’annotation effectivement annoncée par le serveur : toute modification doit être déployée puis rescannée.

Validation effectuée : `git apply --check /Users/hugo/Developer/sth/sth-plugin/docs/mcp-annotations.patch` depuis le checkout `sth-dashboard` réussit. Aucun patch n’a été appliqué, aucun build serveur lancé et aucun endpoint déployé. Après intégration et déploiement autorisés, il faudra vérifier le vrai `tools/list` et ses annotations avant la soumission.

## Décisions nécessaires avant la soumission

1. Corriger et publier les pages de confidentialité et CGU pour le plugin et la bibliothèque, à partir du comportement établi et des décisions de rétention/effacement confirmées ; résoudre le texte contradictoire sur Clarity.
2. Présenter explicitement le plugin ChatGPT/Codex sur une page publique STH et vérifier la prise en charge réelle des demandes de support.
3. Intégrer, tester puis déployer les annotations MCP retenues ; scanner le serveur avec le compte destiné à la revue et comparer le nombre d’outils attendu.
4. Vérifier l’identité de développeur affichée et les conditions d’accès du compte de revue dans le portail. La gratuité de l’installation ne garantit pas les droits MCP d’une organisation STH.

Ce dossier ne remplace pas les autres pièces de soumission : compte de revue et instructions sécurisées, scénarios de test, enregistrement de démonstration et validation finale du paquet.
