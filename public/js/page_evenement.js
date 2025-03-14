document.addEventListener("DOMContentLoaded", async () => {
    const eventId = getEventIdFromURL();

    if (eventId) {
        await loadEventDetails(eventId);
    } else {
        await loadAllEvents();
    }
});

function getEventIdFromURL() {
    return window.location.pathname.split("/").pop();
}

async function loadEventDetails(eventId) {
    const eventDetailsContainer = document.getElementById("event-details");
    if (!eventDetailsContainer) return;

    try {
        const response = await fetch(`/api/evenement/${eventId}`);
        if (!response.ok) throw new Error("Erreur lors du chargement de l'événement");

        const event = await response.json();
        eventDetailsContainer.innerHTML = generateEventDetailsHTML(event);

        document.querySelector(".inscriptionEvenement").addEventListener("click", async () => {
            await inscrireUtilisateur(event.id);
        });
    } catch (error) {
        console.error("Erreur :", error);
        eventDetailsContainer.innerHTML = "<p>Impossible de charger les détails de l'événement.</p>";
    }
}

async function loadAllEvents() {
    const eventsContainer = document.getElementById("events-container");
    if (!eventsContainer) return;

    try {
        const response = await fetch("/events");
        if (!response.ok) throw new Error("Erreur lors du chargement des événements");

        const evenements = await response.json();
        eventsContainer.innerHTML = evenements.map(generateEventCardHTML).join("");
        attachEventListeners();
    } catch (error) {
        console.error("Erreur :", error);
        eventsContainer.innerHTML = "<p>Impossible de charger les événements.</p>";
    }
}

function generateEventDetailsHTML(event) {
    return `
        <div class="blockevenement">
            <img class="imagedescription" src="${event.image_url}" alt="${event.title}" width="400px" height="300px" />
            <div class="blockevenement1">
                <h3>${event.title}</h3>
                <p class="blocdescription">Description : ${event.description || "Aucune description disponible"}</p>
                <p>Date : ${event.date}</p>
                <p>Lieu : ${event.location || "Lieu non précisé"}</p>
                <div class="blockbutton">
                    <button class="inscriptionEvenement" data-id="${event.id}">S'inscrire</button>
                    <p class="messageErreur" style="color: red; display: none;"></p>
                </div>
            </div>
        </div>
    `;
}

function generateEventCardHTML(event) {
    return `
        <div class="blockevenement" data-event-id="${event.id}">
            <img src="${event.image_url}" alt="${event.title}" width="300px" height="300px" />
            <h3>${event.title}</h3>
            <p>Description : ${event.description}</p>
            <p>Date : ${event.date}</p>
            <p>Lieu : ${event.location}</p>
            <div class="blockbutton">
                <button class="inscriptionEvenement" data-id="${event.id}">S'inscrire</button>
                <button class="voirevenement" data-id="${event.id}">Voir</button>
                <p class="messageErreur" style="color: red; display: none;"></p>
            </div>
        </div>
    `;
}

function attachEventListeners() {
    document.querySelectorAll(".voirevenement").forEach(button => {
        button.addEventListener("click", event => {
            const eventId = event.target.getAttribute("data-id");
            window.location.href = `/evenement/${eventId}`;
        });
    });

    document.querySelectorAll(".inscriptionEvenement").forEach(button => {
        button.addEventListener("click", async event => {
            const eventId = event.target.getAttribute("data-id");
            await inscrireUtilisateur(eventId, event.target);
        });
    });
}

async function inscrireUtilisateur(eventId, button = null) {
    const userId = localStorage.getItem("user_id");
    const errorMessage = button ? button.nextElementSibling : document.querySelector(`.inscriptionEvenement[data-id="${eventId}"]`).nextElementSibling;

    if (!userId) {
        window.location.href = "/connexion";
        if (errorMessage) errorMessage.style.display = "block";
        return;
    }

    try {
        const response = await fetch("/inscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, event_id: eventId }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            errorMessage.textContent = responseData.message || "Vous êtes déjà inscrit.";
            errorMessage.style.display = "block";
            return;
        } else {
            window.location.href = "/profil_participant#events-container";
        }

        if (button) {
            button.disabled = true;
            button.textContent = "Déjà inscrit";
        }
        errorMessage.style.display = "none";
    } catch (error) {
        console.error("Erreur :", error);
        if (errorMessage) errorMessage.style.display = "block";
    }
}
