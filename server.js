// Aller chercher les configurations de l'application
import "dotenv/config";
import { existsSync, unlinkSync } from "fs";
// Importer les fichiers et librairies
import express, { json } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cspOption from "./csp-options.js";
import expressHandlebars from "express-handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from 'fs';


import { createNotification, deleteNotification, getNotifications } from "./model/notification.js"

import {
    registerForEvent,
    cancelEventRegistration,
    getStudentEventCount,
    getStudentEvents,
} from "./model/inscription.js";
import {

    getUtilisateurById,
    getUtilisateurByCourriel,
    addUtilisateur,
    GetUserProfile,
} from "./model/utilisateur.js";
import { createEvent,GetEventDetailsById, GetAllEvent, DeletEvent, updateEvent,GetEventById,getEventCountForStudent,getTotalStudents,getTotalEvents,checkIfEventExists} from "./model/evement.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
// Middleware pour parser les cookies
// Création du serveur
const app = express();
const router = express.Router();
// Création du moteur Handlebars avec le helper "eq"
const hbs = expressHandlebars.create({
    helpers: {
        eq: (a, b) => a === b,
    },
});
app.use("/uploads", express.static("uploads"));
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");
// Ajout de middlewares
app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());
app.use(cookieParser());
app.use(express.static("public"));
//multer    
// Configuration de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Dossier où les fichiers sont sauvegardés
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nom du fichier
    },
});
const upload = multer({ storage: storage });
// Route avec un seul fichier attendu sous le nom 'image'
app.post("/upload", upload.single("image"), (req, res) => {
    res.send("Fichier reçu avec succès");
});
// Middleware pour gérer l'utilisateur connecté\
app.use((req, res, next) => {
    const token = req.cookies.token; // Récupérer le token depuis le cookie

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Stocker l'utilisateur décodé dans `req.user`
            res.locals.user = req.user; // Rendre `user` disponible dans Handlebars
        } catch (error) {
            console.error("JWT invalide ou expiré:", error.message);
            req.user = null;
            res.locals.user = null;
        }
    } else {
        req.user = null;
        res.locals.user = null;
    }

    next();
});

// Routes principales
app.get("/", async (req, res) => {
    res.render("Acceuil", {
        titre: "Accueil | EvenementScolaire",
        style: ["/css/maquillage_acceuil.css"],
        script: ["/js/navbar.js"],
        user: req.user,
    });
});

app.get("/About", async (req, res) => {
    res.render("About", {
        titre: "About | EvenementScolaire",
        style: ["/css/About.css"],
        script: [],
        user: req.user,
    });
});

app.get("/connexion", async (req, res) => {
    if (req.user) return res.redirect("/");
    res.render("connexion", {
        titre: "Connexion | EvenementScolaire",
        style: ["/css/maquillage_connexion.css"],
        script: ["/js/login.js"],
    });
});

app.get("/creer_compte", async (req, res) => {
    if (req.user) return res.redirect("/");
    res.render("creer_compte", {
        titre: "Créer un compte | EvenementScolaire",
        style: ["/css/maquillage_connexion.css"],
        script: ["/js/signup.js"],
    });
});

app.get("/creer_evenement", async (req, res) => {
    const eventId = req.query.id;
    let eventData = null;

    if (eventId) {
        try {
            const eventResponse = await fetch(
                `http://localhost:5002/api/events/${eventId}`
            );
            if (eventResponse.ok) {
                eventData = await eventResponse.json();

                // ✅ Vérifier si les données sont bien récupérées
                console.log("Données de l'événement récupérées :", eventData);

                // ✅ Conversion du format de la date
                if (eventData.date) {
                    eventData.date = eventData.date
                        .replace(" ", "T")
                        .slice(0, 16);
                }
            } else {
                console.error("Erreur API :", await eventResponse.text());
            }
        } catch (error) {
            console.error(
                "Erreur lors de la récupération de l'événement :",
                error
            );
        }
    }

    console.log("Données envoyées au template :", eventData);

    res.render("Creer_Evenement", {
        titre: "Modifier un Événement | EvenementScolaire",
        style: ["/css/creer_evenement.css"],
        script: ["/js/creerunEvenement.js"],
        event: eventData, // Passer les données de l'événement
    });
});

app.get("/listeEvenements", async (req, res) => {
    res.render("listeEvenements", {
        titre: "ClisteEvenements | EvenementScolaire",
        style: ["/css/liste_evenement.css", "/css/profil.css"],
        script: ["/js/lisedesEvenement.js"],
    });
});


app.get("/profil", async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null; // Vérifie que `req.user` existe

        if (!userId) {
            return res.status(401).send("Utilisateur non connecté");
        }

        // Récupération des données
        const eventCount = await getTotalEvents();
        const studentCount = await getTotalStudents();
        const satisfactionLevel = 85; // Valeur statique
        const events = await GetAllEvent(); // Récupérer les événements
        const notifications = await getNotifications(userId); // 🔥 Récupération des notifications


        // Passer les données à la vue
        res.render("profil", {
            titre: "Profil | EvenementScolaire",
            style: ["/css/profil.css"],
            script: ["/js/page_profil.js", "/js/notification.js"],
            user: req.user,
            eventCount,
            studentCount,
            satisfactionLevel,
            evenements: events,
            notifications: notifications, // 🔥 Ajout des notifications ici
        });
    } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
        res.status(500).send("Erreur serveur");
    }
});
app.get("/profil_participant", async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) return res.status(401).send("Utilisateur non connecté");

        const eventCount = await getStudentEventCount(userId);
        const events = await getStudentEvents(userId);
        const notifications = await getNotifications(userId);

        res.render("profil_participant", {
            titre: "profil_participant | EvenementScolaire",
            style: ["/css/profil.css"],
            script: ["/js/page_profil_participant.js", "/js/notification.js"],
            user: req.user,
            eventCount,
            evenements: events,
            notifications,
        });
    } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
        res.status(500).send("Erreur serveur");
    }
});



app.get("/api/get-user-role", (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non connecté" });
    }
    res.json({ role: req.user.role });
});

// Middleware pour rendre la page d'événement
router.get("/evenement/:id", async (req, res) => {
    try {
        const event = await GetEventDetailsById(req.params.id);
        if (!event) return res.status(404).send("Événement introuvable");

        res.render("VoirEvement", {
            titre: `${event.title} | ÉvénementScolaire`,
            event,
            style: ["/css/page_evenement.css"],
            script: ["/js/page_evenement.js"],
        });
    } catch (error) {
        res.status(500).send("Erreur serveur");
    }
});

//****************************************************************************************** */
//**********************// Routes API pour la gestion des utilisateurs********************** */
//****************************************************************************************** */


router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await getUtilisateurByCourriel(email);
        if (existingUser) return res.status(400).json({ message: "Utilisateur déjà existant" });
        const userId = await addUtilisateur(name, email, password, role || "participant");
        if (!userId) return res.status(500).json({ message: "Erreur lors de l'inscription" });
        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Chercher l'utilisateur
        const user = await getUtilisateurByCourriel(email);
        if (!user) {
            return res.status(400).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Expiration du token
        );

        // Envoyer le token dans un cookie HTTP sécurisé
        res.cookie("token", token, {
            httpOnly: true, // Empêche l'accès au cookie via JavaScript
            secure: process.env.NODE_ENV === "production", // Utiliser uniquement en HTTPS en production
            sameSite: "strict", // Protection contre les attaques CSRF
            maxAge: 3600000, // Expiration en 1 heure
        });

        res.json({
            message: "Connexion réussie",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message,
        });
    }
});


app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/connexion");
});



//****************************************************************************************** */
//**********************// Routes API pour la gestion des evenements********************** */
//****************************************************************************************** */


router.post("/create", upload.single("image"), async (req, res) => {
    try {
        const { title, description, date, location, organizer_id } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Récupération du chemin de l'image

        // Vérification si un événement existe déjà à cette date et cet endroit
        const existingEvent = await checkIfEventExists(date, location);
        if (existingEvent) {
            return res.status(409).json({
                message: "La salle est déjà réservée à cette date.",
            });
        }

        // Création de l'événement
        await createEvent(
            title,
            description,
            date,
            location,
            organizer_id,
            image_url
        );

        res.status(201).json({ message: "Événement créé avec succès !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});



// Route pour récupérer tous les événements
app.get("/events", async (req, res) => {
    try {
        const events = await GetAllEvent();
        res.status(200).json(events);
    } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

//  Route pour gérer l'upload
app.post("/upload", upload.single("photo"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    console.log("Données reçues :", req.body);
    console.log("Fichier reçu :", req.file);

    res.json({
        message: "Événement créé avec succès !",
        file: req.file.filename,
    });
});
// Route pour supprimer un événement par ID

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.delete("/events/:id", async (req, res) => {
    const eventId = req.params.id;

    try {
        // Vérifier si l'événement existe
        const event = await GetEventById(eventId); // Fonction pour récupérer l'événement par ID
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }

        // Supprimer l'image associée si elle existe
        if (event.image_url) {
            // Construction du chemin complet vers l'image dans le dossier 'uploads' (à la racine du projet)
            const imagePath = path.join(__dirname, "uploads", event.image_url);
            console.log("Chemin de l'image:", imagePath); // Vérifier que le chemin est correct dans la console

            // Vérification si l'image existe avant de la supprimer
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Utilisation de fs.unlinkSync pour supprimer l'image
                console.log("Image supprimée avec succès");
            } else {
                console.log("Image non trouvée:", imagePath);
            }
        }

        // Supprimer l'événement avec SQLite
        await DeletEvent(eventId);

        res.status(200).json({ message: "Événement supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'événement :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Route pour obtenir le nombre d'événements auxquels un étudiant est inscrit
router.get("/participant/:id/events-count", async (req, res) => {
    try {
        const { id } = req.params;
        const eventCount = await getEventCountForStudent(id);
        res.json({ events_inscrits: eventCount });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération du nombre d'événements." });
    }
});

// Route pour obtenir le nombre total d'étudiants
router.get("/admin/students-count", async (req, res) => {
    try {
        const studentCount = await getTotalStudents();
        res.json({ total_participants: studentCount });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération du nombre d'étudiants." });
    }
});

// Route pour obtenir le nombre total d'événements enregistrés
router.get("/admin/events-count", async (req, res) => {
    try {
        const eventCount = await getTotalEvents();
        res.json({ total_evenements: eventCount });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération du nombre d'événements." });
    }
});
// récupération des détails d’un événement spécifique
router.get("/api/evenement/:id", async (req, res) => {
    try {
        const event = await GetEventDetailsById(req.params.id);
        if (!event)
            return res.status(404).json({ message: "Événement introuvable" });

        res.json(event); // Retourne l'événement sous forme de JSON
    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message,
        });
    }
});
router.put("/update/:id", upload.single("image"), async (req, res) => {
    try {
        console.log("Données reçues :", req.body); // 🔍 Debugging

        const eventId = req.params.id; // ✅ Correction de l'ID
        let { title, description, date, location, organizer_id } = req.body;
        let image_url = req.body.image_url;

        if (!eventId) {
            return res
                .status(400)
                .json({ message: "L'ID de l'événement est requis." });
        }

        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        // 🔹 Vérifier si `date` est bien définie
        if (!date || date.trim() === "") {
            return res
                .status(400)
                .json({ message: "La date est obligatoire." });
        }

        // 🔄 Correction du format de `date` pour SQLite
        const dateObj = new Date(date);
        const formattedDate = dateObj
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

        console.log("Date formatée pour SQLite :", formattedDate);
        console.log("📢 Données envoyées à updateEvent :", {
            eventId, // ✅ Utilisation correcte de l'ID
            title,
            description,
            date: formattedDate,
            location,
            image_url,
        });

        // 🔄 Mise à jour de l'événement
        const updatedEvent = await updateEvent(
            eventId,
            title,
            description,
            formattedDate,
            location,
            image_url
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }

        res.json({ message: "Événement mis à jour avec succès", updatedEvent });
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message,
        });
    }
});


app.get("/api/profil", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const user = req.user; // Récupération de l'utilisateur connecté
        const events = await GetAllEvent(); // Récupérer tous les événements

        res.json({ user, events }); // Renvoi des données en JSON
    } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get("/events/:id", async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await GetEventById(eventId); // Fonction qui récupère l'événement en BDD

        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }

        res.json(event); // Retourne l'événement en JSON
    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message,
        });
    }
});

// ✅ Route pour récupérer les notifications d'un utilisateur
router.get("/", async (req, res) => {
    try {
        const userId = req.session?.userId; // ou récupérer depuis le token JWT

        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non connecté" });
        }

        const notifications = await getNotifications(userId);
        res.json(notifications);
    } catch (error) {
        console.error(
            "❌ Erreur lors de la récupération des notifications:",
            error
        );
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

// Route pour créer une notification
router.post("/", async (req, res) => {
    try {
        const { userId, message } = req.body;
        if (!userId || !message)
            return res.status(400).json({ error: "Données manquantes" });

        await createNotification(userId, message);
        res.status(201).json({ message: "Notification créée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la création de la notification:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

// Route pour supprimer une notification
// Route pour supprimer une notification
router.delete("/api/notifications/:notificationId", async (req, res) => {
    try {
        const { notificationId } = req.params;
        console.log("Suppression de la notification ID :", notificationId);
        await deleteNotification(notificationId); // Supprime la notification ici
        res.json({ message: "Notification supprimée avec succès" });
    } catch (error) {
        console.error(
            "Erreur lors de la suppression de la notification:",
            error
        );
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});


// Route pour récupérer les notifications d'un utilisateur spécifique
app.get("/profil/:userId/notifications", async (req, res) => {
    const userId = req.params.userId;
    try {
        const notifications = await getNotifications(userId);

        console.log(`Notifications pour l'utilisateur ${userId}: `, notifications);

        if (notifications.error) {
            return res.status(500).json({ error: notifications.error });
        }

        if (notifications.message) {
            return res.status(200).json({ message: notifications.message });
        }

        return res.status(200).json(notifications);
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});
// Route pour inscrire un étudiant à un événement
router.post("/inscription", async (req, res) => {
    try {
        console.log(req.body); // Vérifier les données reçues
        const { user_id, event_id } = req.body;

        if (!user_id || !event_id) {
            return res.status(400).json({ error: "Données manquantes" });
        }

        await registerForEvent(user_id, event_id);
        res.status(200).json({ message: "Inscription réussie" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
});


// Route pour annuler l'inscription d'un étudiant à un événement
router.post("/api/annulation", async (req, res) => {
    try {
        const { user_id, event_id } = req.body;
        if (!user_id || !event_id) return res.status(400).json({ error: "Données manquantes" });

        await cancelEventRegistration(user_id, event_id);
        res.status(200).json({ message: "Annulation réussie" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'annulation" });
    }
});
app.get("/api/mes-evenements/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log(
        `🔍 Récupération des événements pour l'utilisateur ID: ${userId}`
    );

    try {
        const events = await getStudentEvents(userId);
        const eventCount = await getStudentEventCount(userId);

        console.log("📊 Événements trouvés :", eventCount, events);
        res.json({ eventCount, events });
    } catch (error) {
        console.error(
            "❌ Erreur lors de la récupération des événements :",
            error
        );
        res.status(500).json({ error: "Erreur serveur" });
    }
});
app.get("/api/events/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
        const events = await getStudentEvents(user_id);
        console.log(
            `📡 Envoi des événements à l'utilisateur ${user_id} :`,
            events
        );
        res.json(events);
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi des événements :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});



// Attacher `router` à l'application
app.use(router);


// Gérer les routes non définies (404)
app.use((req, res) => {
    res.status(404).send(req.originalUrl + " not found.");
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.info(`Serveur démarré sur http://localhost:${PORT}`);
});
