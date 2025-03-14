window.addEventListener("load", async function () {
    console.log("✅ Script navbar.js chargé !");

    const profilLink = document.getElementById("profil-link");
    if (!profilLink) {
        console.warn("⚠️ Élément #profil-link introuvable.");
        return;
    }

    try {
        const response = await fetch("/api/get-user-role");
        console.log("📡 Requête envoyée à /api/get-user-role");

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("🔹 Données reçues :", data);

        profilLink.href =
            data.role === "administrateur" ? "/profil" : "/profil_participant";
        console.log("✅ Lien mis à jour :", profilLink.href);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du rôle :", error);
    }
});
