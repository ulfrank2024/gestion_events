import { existsSync } from "fs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const IS_NEW = !existsSync(process.env.DB_FILE);

async function createDatabase(connexion) {
    await connexion.exec(
        `CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('participant', 'professeur', 'administrateur')) NOT NULL
        );
 
        -- Table des événements scolaires
        CREATE TABLE events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL, -- Format YYYY-MM-DD HH:MM
            location TEXT,
            image_url TEXT, -- Ajout du champ pour l'image
            organizer_id INTEGER NOT NULL,
            FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
        );
 
        -- Table de participation des étudiants aux événements
        CREATE TABLE participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            status TEXT CHECK(status IN ('inscrit', 'annulé')) DEFAULT 'inscrit',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        );
            CREATE TABLE notifications (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ); `
    );
    return connexion;
}

let connexion = await open({
    filename: process.env.DB_FILE,
    driver: sqlite3.Database,
});

if (IS_NEW) {
    connexion = await createDatabase(connexion);
}

export { connexion };
