window.onload = async function () {
    try {
        // Récupérer les statistiques des événements depuis l'API
        const responseEvents = await fetch("/count-by-category");
        const eventCounts = await responseEvents.json();

        // Extraire les catégories et les nombres d'événements
        const labelsEvents = eventCounts.map((event) => event.category);
        const dataEvents = eventCounts.map((event) => event.count);

        // Sélectionner le canvas pour le graphique des événements
        var ctxEvent = document.getElementById("event_chart").getContext("2d");

        // Créer le graphique des événements (barres)
        var eventChart = new Chart(ctxEvent, {
            type: "bar",
            data: {
                labels: labelsEvents, // Catégories sur l'axe X
                datasets: [
                    {
                        label: "Nombre d'événements",
                        data: dataEvents, // Nombre d'événements sur l'axe Y
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        ticks: {
                            stepSize: 1, // Échelle en unités (0, 1, 2, 3, etc.)
                        },
                    },
                },
            },
        });

       const responseInscriptions = await fetch("/api/inscriptions");
       const inscriptionsData = await responseInscriptions.json();

       // Vérifie les données reçues
       console.log("Inscriptions data:", inscriptionsData);

       const labelsInscriptions = inscriptionsData.map(
           (inscription) => inscription.month
       );
       const dataInscriptions = inscriptionsData.map(
           (inscription) => inscription.count
       );

       // Log les données pour vérifier
       console.log("Labels:", labelsInscriptions);
       console.log("Data:", dataInscriptions);

       // Code du graphique
       var ctxInscriptions = document
           .getElementById("student_chart")
           .getContext("2d");
       var inscriptionChart = new Chart(ctxInscriptions, {
           type: "line",
           data: {
               labels: labelsInscriptions,
               datasets: [
                   {
                       label: "Inscriptions",
                       data: dataInscriptions,
                       borderColor: "rgba(75, 192, 192, 1)",
                       tension: 0.1,
                       fill: false,
                   },
               ],
           },
           options: {
               scales: {
                   y: {
                       beginAtZero: true,
                       stepSize: 1,
                       suggestedMax: Math.max(...dataInscriptions), // Fixe le max au plus grand nombre d'inscriptions
                       ticks: {
                           stepSize: 1, // Incrémentation de 1 (1, 2, 3, ...)
                           precision: 0, // Afficher uniquement des nombres entiers
                           callback: function (value) {
                               return value; // Affiche directement les nombres sans parenthèses ni décimales
                           },
                       },
                   },
               },
           },
       });
const responseSatisfaction = await fetch("/site-satisfaction");
const satisfactionData = await responseSatisfaction.json();
console.log("Données reçues depuis l'API : ", satisfactionData);

if (Array.isArray(satisfactionData) && satisfactionData.length > 0) {
    const categoryLabels = {
        1: "Très satisfait 😊",
        2: "Satisfait 🙂",
        3: "Neutre 😐",
        4: "Insatisfait 🙁",
        5: "Très insatisfait 😡",
    };

    // Extraire les labels et données
    const labelsSatisfaction = satisfactionData.map(
        (satisfaction) =>
            categoryLabels[satisfaction.category] ||
            `Note ${satisfaction.category}`
    );
    const dataSatisfaction = satisfactionData.map(
        (satisfaction) => satisfaction.count
    );

    // Vérifier que les labels et données sont corrects
    console.log("Labels :", labelsSatisfaction);
    console.log("Données :", dataSatisfaction);

    // Sélectionner le canvas pour le graphique
    var ctxSatisfaction = document
        .getElementById("satisfaction_chart")
        .getContext("2d");

    // Créer le graphique
    new Chart(ctxSatisfaction, {
        type: "pie",
        data: {
            labels: labelsSatisfaction, // Catégories de satisfaction
            datasets: [
                {
                    data: dataSatisfaction, // Nombre de votes pour chaque catégorie
                    backgroundColor: [
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                },
            },
        },
    });
} else {
    console.error(
        "🚨 Données inattendues : l'API ne renvoie pas un tableau valide !"
    );
}



    } catch (error) {
        console.error(
            "🚨 Erreur lors de la récupération des données pour les graphiques :",
            error
        );
    }
};
