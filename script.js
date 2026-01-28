const buttonSearch = document.getElementById("search-button");

buttonSearch.addEventListener("click", () => {
  // Récupère la valeur des inputs
  const departure = document.querySelector(".input-haut").value.trim();
  const arrival = document.querySelector(".input").value.trim();
  const date = document.querySelector(".calendar-input").value;

  if (!departure || !arrival || !date) {
    alert("Veuillez remplir tous les champs, y compris la date");
    return;
  }

  fetch("http://localhost:3000/trip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    //On récupère la valeur des inputs de l'utilisateur
    body: JSON.stringify({
      departure: departure,
      arrival: arrival,
      date: date,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      //Si il y a match entre les inputs de l'utilisateur et les infos en db => executer la fonction displayTrips (voir plus bas)
      //Sinon => fonction displayNoTrips (voir plus bas)

      if (data.result) {
        console.log("Trajets trouvés:", data.trips);
        displayTrips(data.trips);
      } else {
        console.log(data.message);
        displayNoTrips();
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
    });
});

//Fonction pour afficher les différents trajets disponibles

function displayTrips(trips) {
  const displayContainer = document.getElementById("display-trips");

  displayContainer.innerHTML = trips
    .map(
      (trip) => ` 
    <div class="trip-items">
      <p>
        <strong>${trip.departure}</strong> →
        <strong>${trip.arrival}</strong>
      </p>
      <p>${new Date(trip.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
      <p>Prix: ${trip.price} €</p>

      <button class="book-button"
        data-departure="${trip.departure}" 
        data-arrival="${trip.arrival}" 
        data-date="${trip.date}" 
        data-price="${trip.price}">
        Book
      </button>
    </div>
  `,
    )
    .join("");

  addBookButtonListeners();
}

//Il n'y a aucun match entre l'input de l'utilisateur et les trajets disponibles  =>

function displayNoTrips() {
  const displayContainer = document.getElementById("display-trips");
  displayContainer.innerHTML = `
    <img src="./images/notfound.png" alt="No trips" />
    <div id="border"></div>
    <h3>Aucun trajet trouvé pour cette recherche.</h3>
  `;
}

function addBookButtonListeners() {
  const bookButtons = document.querySelectorAll(".book-button");

  //Pour chaque button => eventListener

  bookButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Récupére les données du trajet via l'attribut data-, que l'on a récupérer dans la fonction displayTrips()
      const tripData = {
        departure: button.getAttribute("data-departure"),
        arrival: button.getAttribute("data-arrival"),
        date: button.getAttribute("data-date"),
        price: button.getAttribute("data-price"),
      };

      // On appelle tripData function pour ajouter à notre panier
      addToCart(tripData);
    });
  });
}

// Pour ajouter au panier, fetch cartTrip pour ajouter le trajet dans la db
function addToCart(tripData) {
  fetch("http://localhost:3000/cartTrip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tripData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.result) {
        window.location.href = "./cart.html";
      } else {
        alert("Erreur lors de l'ajout au panier");
      }
    })
    //On catch les errors (à l'image de ce que font dans notre connection.js)
    .catch((error) => {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
    });
}

//
