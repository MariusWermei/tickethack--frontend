// Permet d'afficher notre panier à chaque chargement de la page (voir doc pour le paramètre "DOMContentLoaded" si besoin)
window.addEventListener("DOMContentLoaded", () => {
  loadCart();
  addPurchaseButtonListener();
});

// On appelle ton cher backend et on affiche que l'on a save() dans notre backend (buttonListener de notre script.js)
// J'ai encapsulé les différentes actions que je veux faire dans ma contion => Clean code
function loadCart() {
  fetch("http://localhost:3000/cartTrip")
    .then((response) => response.json())
    .then((data) => {
      console.log("Données du panier:", data);

      if (data.result && data.carts.length > 0) {
        displayCart(data.carts);
        calculateTotal(data.carts);
      } else {
        displayEmptyCart();
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
    });
}

// On affiche les trajets du panier (c'est une des 2 fonction que l'on appelle dans notre condition au dessus)

function displayCart(carts) {
  const container = document.getElementById("cart-trips-container");

  // Exatement la même strucure que pour afficher les trajets sur notre page d'acceuil

  container.innerHTML = carts
    .map(
      (cart) => `
    <div class="cart-trips-elements">
      <p>
        <strong>${cart.departure}</strong> →
        <strong>${cart.arrival}</strong>
      </p>
      <p>${new Date(cart.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
      <p>${cart.price} €</p>
      <button class="delete-button" data-id="${cart._id}">X</button>
    </div>
  `,
    )
    .join("");

  // On ajouter le buttonListener une fois après avoir chargé notre donnée

  addDeleteButtonListeners();
}

// Ici c'est la fonction pour calculer le TOTAL de notre panier puis l'affiche dans l'HTML via le DOM
// C'est lautre fonction que l'on execute lorsque notre condition est "vrai"
function calculateTotal(carts) {
  const total = carts.reduce((sum, cart) => sum + Number(cart.price), 0);
  document.getElementById("cart-price").textContent = total;
}

// Fonction pour afficher un panier vide
// J'me suis permis d'afficher un petit message griser quand le panier est vide (on l'appelle dans le else de notre fonction loadCart())
function displayEmptyCart() {
  const container = document.getElementById("cart-trips-container");
  container.innerHTML = `
    <p class="empty-cart">Votre panier est vide</p>
  `;
  document.getElementById("cart-price").textContent = "0";
}

// On supprime dans le DOM + de la db (en appelant la fonction du dessous)
function addDeleteButtonListeners() {
  const deleteButtons = document.querySelectorAll(".delete-button");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      //On récupère la data de l'id (voir la fonction displayCarts())
      const cartId = button.getAttribute("data-id");
      deleteFromCart(cartId);
    });
  });
}

// Fonction qui supprime de la db en appelant ta route carré dans l'axe
function deleteFromCart(cartId) {
  fetch("http://localhost:3000/cartTrip", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: cartId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.result) {
        console.log("Trajet supprimé");
        // On réappelle notre fonction qui affiche les paniers (very important, à pas oublié) sinon pu rien d'afficher
        loadCart();
      } else {
        alert("Erreur lors de la suppression");
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
    });
}

// A partir d'ici c'est notre script pour la redirection avec notre bouton purchase, vers notre booking.html
// C'est exactement la même même logique qu'on à fait pour enrengistré puis afficher nos différents trajets (script.js)
// Ici on va aller pioché dans la db cart/trip pour aller la post dans notre db booking/trip (pour la suite voir Booking.js)

function addPurchaseButtonListener() {
  const purchaseButton = document.getElementById("purchase-button");

  purchaseButton.addEventListener("click", () => {
    purchaseCart();
  });
}

// On achète tout le panier (on retourne toute la data cartTrips)
function purchaseCart() {
  fetch("http://localhost:3000/cartTrip")
    .then((response) => response.json())
    .then((data) => {
      console.log("Panier récupéré pour achat:", data);

      if (!data.result || data.carts.length === 0) {
        alert("Votre panier est vide !");
        return;
      }

      let completedActions = 0;
      const totalTrips = data.carts.length;

      data.carts.forEach((cart) => {
        fetch("http://localhost:3000/bookingTrip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            departure: cart.departure,
            arrival: cart.arrival,
            date: cart.date,
            price: cart.price,
          }),
        })
          .then((response) => response.json())
          .then((bookingData) => {
            console.log("Trajet réservé:", bookingData);
            fetch("http://localhost:3000/cartTrip", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: cart._id }),
            })
              .then((response) => response.json())
              .then((deleteData) => {
                console.log("Trajet supprimé du panier:", deleteData);

                completedActions++;

                if (completedActions === totalTrips) {
                  alert("Achat confirmé ! Votre panier a été vidé.");
                  window.location.href = "./booking.html";
                }
              })
              .catch((error) => {
                console.error("Erreur lors de la suppression:", error);
              });
          })
          .catch((error) => {
            console.error("Erreur lors de la réservation:", error);
          });
      });
    })
    .catch((error) => {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    });
}
