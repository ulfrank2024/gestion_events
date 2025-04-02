document.addEventListener("DOMContentLoaded", async () => {
    const eventId = getEventIdFromURL();
    eventId ? await loadEventDetails(eventId) : await loadAllEvents();

    let userRole = localStorage.getItem("user_role"); // Si déjà présent dans le localStorage
    if (!userRole) {
        // Si le rôle n'est pas dans le localStorage, effectuer la requête pour le récupérer
        console.log("Récupération du rôle via l'API...");
        try {
            const response = await fetch("/api/get-user-role");
            if (response.ok) {
                const data = await response.json();
                userRole = data.role; // Mettre à jour le rôle
                // Sauvegarder dans le localStorage pour une utilisation future
                localStorage.setItem("user_role", userRole);
                console.log("Rôle mis à jour dans le localStorage :", userRole);
            } else {
                console.error("Erreur lors de la récupération du rôle");
            }
        } catch (error) {
            console.error(
                "Erreur lors de la récupération du rôle de l'utilisateur :",
                error
            );
        }
    }
});

const getEventIdFromURL = () => {
    const eventId = window.location.pathname.split("/").pop();
    return isNaN(eventId) ? null : eventId;
};

const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur lors du chargement");
        return await response.json();
    } catch (error) {
        console.error("Erreur :", error);
        return null;
    }
};

const loadEventDetails = async (eventId) => {
    const container = document.getElementById("event-details");
    if (!container) return;

    const event = await fetchData(`/api/evenement/${eventId}`);
    container.innerHTML = event
        ? generateEventDetailsHTML(event)
        : "<p>Impossible de charger les détails.</p>";
    document
        .querySelector(".inscriptionEvenement")
        ?.addEventListener("click", () => inscrireUtilisateur(eventId));
};

const loadAllEvents = async () => {
    const container = document.getElementById("events-container");
    if (!container) return;

    const events = await fetchData("/events");
    container.innerHTML = events
        ? events.map(generateEventCardHTML).join("")
        : "<p>Impossible de charger les événements.</p>";
    attachEventListeners();
};

const generateEventDetailsHTML = (event) => `
    <div class="blockevenement">
        <img class="imagedescription" src="${event.image_url}" alt="${
    event.title
}" width="400px" height="300px" />
        <div class="blockevenement1">
            <h3>${event.title}</h3>
            <p class="blocdescription">Description : ${
                event.description ?? "Aucune description disponible"
            }</p>
            <p>Date : ${event.date}</p>
            <p>Lieu : ${event.location ?? "Lieu non précisé"}</p>
         
        </div>
    </div>
       <div class="blockbutton">${generateInscriptionButton(event.id)}</div>`;

const generateEventCardHTML = (event) => `
    <div class="blockevenement" data-event-id="${event.id}">
        <img src="${event.image_url}" alt="${
    event.title
}" width="300px" height="300px" />
        <h3>${event.title}</h3>
        <p>Description : ${
            event.description ?? "Aucune description disponible"
        }</p>
        <p>Date : ${event.date}</p>
        <p>Lieu : ${event.location ?? "Lieu non précisé"}</p>
       
    </div>
     <div class="blockbutton">
            ${generateInscriptionButton(event.id)}
            <button class="voirevenement" data-id="${event.id}">Voir</button>
        </div>`;

const generateInscriptionButton = (eventId) => {
    const userId = localStorage.getItem("user_id");
    const userRole = localStorage.getItem("user_role"); // Récupère le rôle de l'utilisateur
    console.log(userRole);

    if (!userId)
        return `<a href="/connexion" class="inscriptionEvenement">Connectez-vous pour vous inscrire</a>`;

    // Rôle de l'utilisateur : s'il est administrateur, pas de bouton d'inscription
    return userRole && userRole !== "administrateur"
        ? `<button class="inscriptionEvenement" data-id="${eventId}">S'inscrire</button>`
        : "";
};

const attachEventListeners = () => {
    document.querySelectorAll(".voirevenement").forEach((btn) => {
        btn.addEventListener(
            "click",
            () => (window.location.href = `/evenement/${btn.dataset.id}`)
        );
    });
    document
        .querySelectorAll(".inscriptionEvenement:not([disabled])")
        .forEach((btn) => {
            btn.addEventListener(
                "click",
                async () => await inscrireUtilisateur(btn.dataset.id, btn)
            );
        });
};

const inscrireUtilisateur = async (eventId, button = null) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return (window.location.href = "/connexion");

    const response = await fetch("/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, event_id: eventId }),
    });

    const result = await response.json();
    if (!response.ok) {
        const errorMessage = button?.nextElementSibling;
        if (errorMessage) {
            errorMessage.textContent =
                result.message || "Erreur lors de l'inscription.";
            errorMessage.style.display = "block";
        }
        return;
    }

    window.location.href = "/profil_participant#events-container";
    if (button) {
        button.disabled = true;
        button.textContent = "Déjà inscrit";
    }
};
