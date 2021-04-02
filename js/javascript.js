// API Key
const apiKey = "795e9401b71b42dc9daa1773710d2aec";

// UI Variables
const body = document.querySelector("body");
const form = document.querySelector(".header__form");
const gameSection = document.querySelector(".game");
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal-close");
const modalImage = document.querySelector(".modal-img");

// error function
const error = (message) => {
  if (message === "NetworkError when attempting to fetch resource.") {
    message = "There has been a network error.";
  }
  gameSection.innerHTML = `<p class="error">${message}</p>`;
};

// getGame function
const getGame = async (game) => {
  const baseURL = "https://api.rawg.io/api/games";
  const query = `?key=${apiKey}&search=${game}`;
  const response = await fetch(baseURL + query);
  if (response.status !== 200) {
    throw new Error("Oops...something went wrong.");
  }
  const data = await response.json();
  return data.results[0];
};

// getGameDetails function
const getGameDetails = async (id) => {
  const baseURL = `https://api.rawg.io/api/games/`;
  const query = `${id}?key=${apiKey}`;
  const response = await fetch(baseURL + query);
  if (response.status !== 200) {
    throw new Error("Oops...something went wrong.");
  }
  const data = await response.json();
  return data;
};

// getGameTrailer function
const getGameTrailer = async (id) => {
  const baseURL = `https://api.rawg.io/api/games/`;
  const query = `${id}/movies?key=${apiKey}`;
  const response = await fetch(baseURL + query);
  if (response.status !== 200) {
    throw new Error("Oops...something went wrong.");
  }
  const data = await response.json();
  return data.results[0];
};

// updateGame function
const updateGame = async (game) => {
  gameSection.innerHTML = `<div class="spinner">
  <div class="spinner__circle"></></div>
  <div class="spinner__circle"></></div>
  <div class="spinner__circle"></></div>
  `;
  const theGame = await getGame(game);

  if (typeof theGame === "undefined") {
    throw new Error("Please enter a valid game.");
  }

  const gameDetails = await getGameDetails(theGame.id);
  const gameTrailer = await getGameTrailer(theGame.id);
  return { theGame, gameDetails, gameTrailer };
};

// formatDate function
const formatDate = (releaseDate) => {
  let date = releaseDate.split("-");
  date = date.join(" ");
  date = new Date(date).toString();
  date = date.split(" ");
  date = `${date[2]} ${date[1]} ${date[3]}`;
  return date;
};

// getImg function
const getImg = (e) => {
  let imgSrc = "";
  if (e.target.className === "gallery__item-overlay-img") {
    imgSrc = e.target.offsetParent.offsetParent.firstElementChild.currentSrc;
    displayModal(imgSrc);
  } else if (e.target.className === "gallery__item-overlay") {
    imgSrc = e.target.previousElementSibling.currentSrc;
    displayModal(imgSrc);
  }
};

// displayModal function
const displayModal = (imgsrc) => {
  modalImage.setAttribute("src", imgsrc);
  modalImage.setAttribute(
    "title",
    document.querySelector(".game__heading").innerText
  );
  modalImage.setAttribute(
    "alt",
    document.querySelector(".game__heading").innerText
  );
  modal.classList.remove("d-none");
  modal.classList.add("d-block-modal");
};

// updateUI function
const updateUI = (data) => {
  const { theGame, gameDetails, gameTrailer } = data;

  const metascore = theGame.metacritic ? theGame.metacritic : "N/A";

  let date = formatDate(theGame.released);

  let developers = [];
  gameDetails.developers.forEach((developer) => {
    developers.push(developer.name);
  });
  developers = developers.join(", ");

  let publishers = [];
  gameDetails.publishers.forEach((publisher) => {
    publishers.push(publisher.name);
  });
  publishers = publishers.join(", ");

  let platforms = [];
  gameDetails.platforms.forEach((platform) => {
    platforms.push(platform.platform.name);
  });
  platforms = platforms.join(", ");

  let genres = [];
  gameDetails.genres.forEach((genre) => {
    genres.push(genre.name);
  });
  genres = genres.join(", ");

  const ListData = [
    ["Release Date", date],
    ["Developers", developers],
    ["Publishers", publishers],
    ["Platforms", platforms],
    ["Genres", genres],
  ];

  let gameDetailsHTML = "";

  for (let i = 0; i < ListData.length; i++) {
    if (ListData[i][1].length) {
      gameDetailsHTML += `<li class="game__list-item"><span>${ListData[i][0]}</span> : ${ListData[i][1]}</li>`;
    }
  }

  let gameGalleryHTML = "";
  let galleryClass = null;

  if (theGame.short_screenshots) {
    galleryClass = "gallery";
    for (let i = 0; i < theGame.short_screenshots.length; i++) {
      gameGalleryHTML += `
        <div class="gallery__item">
        <img class="gallery__item-img" src="${theGame.short_screenshots[i].image}" alt="${theGame.name}" title="${theGame.name}" />
        <div class="gallery__item-overlay">
          <img class="gallery__item-overlay-img" src="img/eye.png" alt="" />
        </div>
      </div>`;
    }
  } else {
    galleryClass = "d-none";
  }

  let gameTrailerHTML = "";
  let trailerClass = null;

  if (gameTrailer) {
    trailerClass = "trailer";
    gameTrailerHTML += `
        <video class="trailer__video" src="${gameTrailer.data[480]}" controls></video>
        `;
  } else {
    trailerClass = "d-none";
  }

  const htmlTemplate = `
  <div class="game__title-container">
    <h1 class="game__heading">${theGame.name}</h1>
    <div class="game__score">${metascore}</div>
  </div>
  <ul class="game__list">${gameDetailsHTML}</ul>
  <div class="game__description">${gameDetails.description}</div>
  <section class="${galleryClass}">${gameGalleryHTML}</section>
  <section class="${trailerClass}">${gameTrailerHTML}</section>
  `;

  gameSection.innerHTML = htmlTemplate;

  document.querySelectorAll(".gallery__item").forEach((item) => {
    item.addEventListener("click", (e) => {
      getImg(e);
    });
  });
};

// Click events for form and modal close
body.addEventListener("click", (e) => {
  if (e.target.classList.contains("header__form-submit")) {
    e.preventDefault();

    if (form.game.value.trim()) {
      updateGame(form.game.value.toLowerCase().trim())
        .then((data) => {
          updateUI(data);
        })
        .catch((err) => error(err.message));
      form.reset();
    } else {
      form.game.value = "";
    }
  } else if (
    e.target.classList.contains("modal") ||
    e.target.classList.contains("modal-close")
  ) {
    modal.classList.remove("d-block-modal");
    modal.classList.add("d-none");
  }
});

updateGame("bayonetta 1")
  .then((data) => {
    updateUI(data);
  })
  .catch((err) => error(err.message));

/* 
----------------------------------------------------------------------------
                      WHAT I WANT TO ADD IN THE FUTURE
----------------------------------------------------------------------------

1. REAL TIME SEARCH WHERE RESULTS ARE DISPLAYED WHICH USERS CAN SELECT 
FROM A DROPDOWN LIST/

*/
