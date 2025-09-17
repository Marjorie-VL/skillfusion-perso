--Création de données pour notre BDD
BEGIN;


INSERT INTO "role"  (description) VALUES
('Administrateur'),
('Instructeur'),
('Utilisateur');

INSERT INTO "users" (pseudo, password, mail, role_id) VALUES
('admin', 'motdepasse_admin', 'admin@exemple.com', 1),
('user1', 'motdepasse_user1', 'user1@exemple.com', 2),
('user2', 'motdepasse_user2', 'user2@exemple.com', 2),
('user3', 'motdepasse_user3', 'instruct1@exemple.com', 3),
('user4', 'motdepasse_user4', 'user3@exemple.com', 2);

INSERT INTO "category" (name) VALUES
('Maçonnerie'),
('Peinture'),
('Électricité');


INSERT INTO "lesson" (name, text, category_id, users_id) VALUES

('Réparer une fissure dans un mur extérieur', 'Contenu de la leçon sur la réparation de fissure...', 1, 1),
('Monter un petit muret en parpaings', 'Contenu de la leçon sur le montage de muret...', 1, 2),
('Poser un seuil de porte en béton', 'Contenu de la leçon sur la pose de seuil...', 1, 1),
('Peindre des pots de fleurs ou bocaux en verre', 'Contenu de la leçon sur la peinture de pots...', 2, 2),
('Repeindre un cadre, miroir ou objet déco', 'Contenu de la leçon sur la repeinte de cadre...', 2, 1),
('Créer des formes géométriques au mur avec du scotch', 'Contenu de la leçon sur les formes géométriques...', 2, 2),
('Changer un interrupteur ou une prise murale', 'Contenu de la leçon sur le changement d''interrupteur...', 3, 1),
('Installer un éclairage LED sous une étagère ou un meuble', 'Contenu de la leçon sur l''installation de LED...', 3, 2),
('Créer une lampe DIY avec un bocal, une ampoule et du câble tissu', 'Contenu de la leçon sur la création de lampe DIY...', 3, 1);

INSERT INTO "step" (step_order, title, description, lesson_id) VALUES
(1, 'Préparation de la fissure', 1),
(2, 'Application de l’enduit', 1),
(3, 'Finition', 1),
(1, 'Préparer le sol', 2),
(2, 'Préparer le mortier', 2),
(3, 'Poser la première rangée', 2),
(4, 'Monter les rangées suivantes', 2),
(5, 'Finitions', 2),
(1, 'Préparer l emplacement', 3),
(2, 'Installer le coffrage', 3),
(5, 'Finitions', 3),
(1, 'Préparation le support', 4),
(2, 'Protéger et planifier', 4),
(3, 'Peindre les surfaces', 4), 
(4, 'Décorer et personnaliser', 4), 
(5, 'Protéger la peinture', 4);


-- Insertion dans la table Material

INSERT INTO "material" ( name, lesson_id) VALUES

('Brosse métallique', 1),
('Enduit de rebouchage', 2),
('Peinture façade', 3);

-- Insertion dans la table Users_has_favorites

INSERT INTO "users_has_favorites" (users_id, lesson_id) VALUES
(1, 1),
(2, 2);


-- Insertion dans la table Question

INSERT INTO "question" (text, users_id) VALUES

('Comment bien préparer la surface avant de réparer une fissure ?', 1),
('Quel type de mortier utiliser pour monter un muret ?', 2);

-- Insertion dans la table Response

INSERT INTO "response" (text, question_id, users_id) VALUES

('Il faut brosser la fissure et l''humidifer.', 1, 2),
('Utiliser un mortier de type N.', 2, 1);

SELECT setval('role_id', (SELECT COALESCE(MAX(id), 1) FROM "role"),true);
SELECT setval('users_id', (SELECT COALESCE(MAX(id), 1) FROM "users"),true);
SELECT setval('category_id', (SELECT COALESCE(MAX(id), 1) FROM "category"),true);
SELECT setval('lesson_id', (SELECT COALESCE(MAX(id), 1) FROM "lesson"),true);
SELECT setval('step_id', (SELECT COALESCE(MAX(id), 1) FROM "step"),true);
SELECT setval('material_id', (SELECT COALESCE(MAX(id), 1) FROM "material"),true);
SELECT setval('users_has_favorites_id', (SELECT COALESCE(MAX(id), 1) FROM "users_has_favorites"),true);
SELECT setval('question_id', (SELECT COALESCE(MAX(id), 1) FROM "question"),true);
SELECT setval('response_id', (SELECT COALESCE(MAX(id), 1) FROM "response"),true);

COMMIT;

