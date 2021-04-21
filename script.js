//Main meals html container reference in DOM
const meals = document.getElementById("meals");
//Main favorite meals html container reference in DOM
const favMeals = document.getElementById("fav-meals");
//Search button reference in DOM
const search = document.getElementById("search");
//Search input reference in DOM
const searchTerm = document.getElementById("search-term");
//Meal Info popup container reference
const mealPopup = document.getElementById("meal-popup");
//Meal Info popup container close button reference
const popupCloseBtn = document.getElementById("close-popup");
//Meal Info target reference
const mealInfoEl = document.getElementById("meal-info");

//Get a Random Meal to populate
getRandomMeal();

//Get all user favorite meals from local storage
fetchFavMeals();

async function getRandomMeal() {
  const response = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const responseData = await response.json();
  const randomMeal = responseData.meals[0];
  console.log("Random Meal Got: ", randomMeal);
  currentRandomMealID = randomMeal.idMeal;

  //Add meal to meals html container
  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const response = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await response.json();
  const mealData = respData.meals[0];

  return mealData;
}

async function getMealsBySearch(search) {
  const meals = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + search
  );
}

function addMealToFavs(favMeal) {
  const meal = document.createElement("li");
  meal.innerHTML = `
  <img src="${favMeal.strMealThumb}" alt="${favMeal.strMeal}"><span>${favMeal.strMeal}</span>
  <i class="fas fa-window-close clear" id="remove-fav"></i>
    `;

  //Remove button which when clicked removed the meal id from local storage
  const removeButton = meal.querySelector("#remove-fav");
  removeButton.addEventListener("click", () => {
    removeMealFromLocalStorage(favMeal.idMeal);
  });

  //Add the new favorite meal to favorite meals html container
  favMeals.appendChild(meal);
}

function addMeal(mealData, random = false) {
  currentRandomMealID = mealData.mealId;
  const meal = document.createElement("div");

  //Generate meal card
  meal.innerHTML = `
              <div class="meal">
                          <div class="meal-header">
                              ${
                                random
                                  ? `
                              <span class="random">Random Recipe</span>`
                                  : ""
                              }
                              <img src="${mealData.strMealThumb}" alt="${
    mealData.strMeal
  }">
                </div>
                <div class="meal-body">
                    <h4>${mealData.strMeal}</h4>
                    <button class="fav-btn">
                        <i class="fas fa-heart fav-btn" id="fav-button"></i>
                    </button>
                </div>
            </div>
    `;

  //Favorite button which on clicked will add the meal to main favorite meals html container
  const favButton = meal.querySelector("#fav-button");
  favButton.addEventListener("click", () => {
    if (favButton.classList.contains("active")) {
      removeMealFromLocalStorage(mealData.idMeal);
      favButton.classList.remove("active");
      refreshFavoriteList();
    } else {
      addMealToLocalStorage(mealData.idMeal);
      favButton.classList.add("active");
      refreshFavoriteList();
    }
  });

  //Append meal card to main meals html container
  meals.appendChild(meal);
  meal.addEventListener("click", (event) => {
    if (event.srcElement.tagName == "IMG") {
      showMealInfo(mealData);
    } else {
    }
  });
}

function refreshFavoriteList() {
  //Remove all favorite meals in favorite meals html container and repopulate it
  favMeals.innerHTML = "";
  fetchFavMeals();
}

function addMealToLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
  showMealDataInLocalStorage();
}

function showMealDataInLocalStorage() {
  //TODO: List all meals in Console
}

function getMealsFromLocalStorage() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

function removeMealFromLocalStorage(mealId) {
  //Get all meals from local storage and remove the mealId and store object back
  const mealsInStorage = getMealsFromLocalStorage();
  if (mealsInStorage) {
    localStorage.setItem(
      "mealIds",
      JSON.stringify(mealsInStorage.filter((id) => id !== mealId))
    );
  }
  refreshFavoriteList();
  showMealDataInLocalStorage();
  setHeartInRandom(mealId);
}

function setHeartInRandom(mealId) {
  //TODO: When user removed meals from favorite meals container, Make sure to remove heart in meal card below if it is the same one as removed
}

async function fetchFavMeals() {
  const mealIds = getMealsFromLocalStorage();

  const meals = [];

  //For each favorite meal present in local storage object, Populate them in main favorite meal container
  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    let meal = await getMealById(mealId);
    addMealToFavs(meal);
  }
}

async function getMealsBySearch(term) {
  const response = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await response.json();
  const meals = respData.meals;

  return meals;
}

search.addEventListener("click", async () => {
  const search = searchTerm.value;
  const mealsGot = await getMealsBySearch(search);
  //Remove all element from main meals html container before repopulating based on search result
  meals.innerHTML = "";

  if (mealsGot) {
    mealsGot.forEach((meal) => {
      addMeal(meal);
    });
  } else {
    //TODO: Show something to use when the search nets no result
  }
});

popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});

//Show meal information in popup based on user clicking on meal cards
function showMealInfo(mealData) {
  const mealEl = document.createElement("div");
  mealInfoEl.innerHTML = "";

  const ingredients = [];
  for (let i = 1; i < 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} / ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
                <div>
                    <h1>${mealData.strMeal}</h1>
                    <img src="${mealData.strMealThumb}" alt="">
                </div>
                <div>
                    <h3>Ingredients:</h3>
                    <ul>
                    ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
                    </ul>
                    <p>${mealData.strInstructions}</p>
                </div>
  `;

  mealInfoEl.appendChild(mealEl);
  mealPopup.classList.remove("hidden");
}
