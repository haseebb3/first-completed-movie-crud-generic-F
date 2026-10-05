const closeModelBtn = document.querySelectorAll(".close-model");
const model = document.getElementById("model");
const modelButton = document.getElementById("modelButton");
const backDrop = document.getElementById("backDrop");
const movieForm = document.getElementById("movieForm");
const spinner = document.getElementById("spinner");
const updateMovBtn = document.getElementById("updateMovBtn");

const baseUrl = `https://posts-crud-c2796-default-rtdb.firebaseio.com`;
const moviesUrl = `${baseUrl}/movies.json`;


function snackBar(msg, icon) {
  Swal.fire({
    text: msg,
    icon: icon,
    timer: 3000
  })
}

const localState = {
  moviesArray: [],
  editId: null
}

function handleSpinner(flag) {
  if (flag) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
}

function setRating(rating) {
  if (rating > 8) {
    return "badge-success"
  }
  else if (rating >= 6 && rating <= 8) {
    return "badge-warning"
  }
  else {
    return "badge-danger"
  }
}

function nestedObjToArr(nesObj) {
  for (let key in nesObj) {
    nesObj[key].id = key;
    localState.moviesArray.unshift(nesObj[key]);
  }
}


function makeApiRequest(url, method = "GET", body = null) {
  body = body ? JSON.stringify(body) : null;
  return fetch(url, {
    method: method,
    body: body,
    headers: {
      "Content-Type": "Application/json",
      "Security": "JWT Token"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error While making api call : ${response.status}`);
      }
      return response.json();
    })
}


// read
function fetchMovies() {
  handleSpinner(true);
  makeApiRequest(moviesUrl)
    .then(data => {
      nestedObjToArr(data);
      renderMovies(localState.moviesArray);
    })
    .catch(err => {
      snackBar(err, "error");
      console.log(err);
    })
    .finally(() => {
      handleSpinner(false);
    })
}

fetchMovies();

function renderMovies(arr) {
  const allMoviesContainer = document.getElementById("allMoviesContainer");
  let res = "";
  arr.forEach(movie => {
    res += `
            <div class="col-md-3 mb-3" id="${movie.id}">
            <div class="card h-100" id="movieCard">
              <div class="card-header row">
                <div class="col-10">
                  <h3 id="movieTitle" class="m-0">${movie.title}</h3>
                  
                </div>
                <div class="col-2">
                  <h4 class="badge ${setRating(movie.rating)} align-self-center p-2">
                    <span>${movie.rating}</span>
                  </h4>
                </div>
              </div>
              <small class="text-left pl-3 pb-2">${movie.updatedAt ? `Updated at : ${new Date(movie.updatedAt).toLocaleString("en-IN")}` : `Created at : ${new Date(movie.createdAt).toLocaleString("en-IN")}`}  </small>

              <div class="card-body p-2" id="movie-cardBody">
                <figure>
                  <img
                    src="${movie.poster}"
                    alt="${movie.title}"
                  />

                  <figcaption>
                    <h4>${movie.title}</h4>
                    <p><strong>Release Date : </strong>${movie.releaseDate}</p>
                    <h5 class="text-info">Genere : ${movie.genre}</h5>
                    <p>
                      ${movie.description}
                    </p>
                  </figcaption>
                </figure>
              </div>

              <div class="card-footer d-flex justify-content-between">
                <button onclick="onEdit(this)" class="btn btn-sm sec-btn">Edit</button>
                <button onclick="onDelete(this)" class="btn btn-sm pri-btn">Remove</button>
              </div>
            </div >
          </div >
      `;
    allMoviesContainer.innerHTML = res;
  })
}

//create

function onCreate(event) {
  const title = document.getElementById("title");
  const genre = document.getElementById("genre");
  const releaseDate = document.getElementById("releaseDate");
  const poster = document.getElementById("poster");
  const rating = document.getElementById("rating");
  const description = document.getElementById("description");
  const allMoviesContainer = document.getElementById("allMoviesContainer");

  event.preventDefault();
  const newMovie = {
    title: title.value,
    genre: genre.value,
    releaseDate: releaseDate.value || "Unknown",
    poster: poster.value,
    rating: rating.value,
    description: description.value,
    createdAt: Date.now(),
    updatedAt: null
  }
  handleSpinner(true)
  onModelToggle();
  makeApiRequest(moviesUrl, "POST", newMovie)
    .then(res => {
      newMovie.id = res.name;
      localState.moviesArray.unshift(newMovie);
      let newMovieCard = document.createElement("div");
      newMovieCard.className = "col-md-3 mb-3";
      newMovieCard.id = res.name;
      newMovieCard.innerHTML = `
      <div class="card h-100" id="movieCard" >
              <div class="card-header row">
                <div class="col-10">
                  <h3 id="movieTitle" class="m-0">${newMovie.title}</h3>
                  
                </div>
                <div class="col-2">
                  <h4 class="badge ${setRating(newMovie.rating)} align-self-center p-2">
                    <span>${newMovie.rating}</span>
                  </h4>
                </div>
              </div>
              <small class="text-left pl-3">${newMovie.updatedAt ? `Updated at : ${new Date(newMovie.updatedAt).toLocaleString("en-IN")}` : `Created at : ${new Date(newMovie.createdAt).toLocaleString("en-IN")}`}</small>

              <div class="card-body p-2" id="movie-cardBody">
                <figure>
                  <img
                    src="${newMovie.poster}"
                    alt="${newMovie.title}"
                  />

                  <figcaption>
                    <h4>${newMovie.title}</h4>
                    <p><strong>Release Date : </strong>${newMovie.releaseDate}</p>
                    <h5 class="text-info">Genere : ${newMovie.genre}</h5>
                    <p>
                      ${newMovie.description}
                    </p>
                  </figcaption>
                </figure>
              </div>

              <div class="card-footer d-flex justify-content-between">
                <button onclick="onEdit(this)" class="btn btn-sm sec-btn">Edit</button>
                <button onclick="onDelete(this)" class="btn btn-sm pri-btn">Remove</button>
              </div>
            </div >
      `;
      allMoviesContainer.prepend(newMovieCard);
      snackBar(`New movie with id : ${res.name} is added successfully`, "success");
    })
    .catch(err => {
      snackBar(err, "error");
      console.log(err);
    })
    .finally(() => {
      handleSpinner(false);
    })
}

//edit
function onEdit(ele) {
  const title = document.getElementById("title");
  const genre = document.getElementById("genre");
  const releaseDate = document.getElementById("releaseDate");
  const poster = document.getElementById("poster");
  const rating = document.getElementById("rating");
  const description = document.getElementById("description");
  const addMovBtn = document.getElementById("addMovBtn");
  const movieAddOrUpdate = document.getElementById("movieAddOrUpdate");

  const editId = ele.closest(".col-md-3").id;
  console.log(editId);
  const editObj = localState.moviesArray.find(m => m.id === editId);
  console.log(editObj);
  localState.editId = editId;
  //patch values
  onModelToggle();
  movieAddOrUpdate.innerText = "Update Movie Details"
  title.value = editObj.title;
  genre.value = editObj.genre;
  releaseDate.value = editObj.releaseDate;
  poster.value = editObj.poster;
  rating.value = editObj.rating;
  description.value = editObj.description;
  updateMovBtn.classList.remove("d-none");
  addMovBtn.classList.add("d-none");
}


//update
function onMovieUpdate() {
  const title = document.getElementById("title");
  const genre = document.getElementById("genre");
  const releaseDate = document.getElementById("releaseDate");
  const poster = document.getElementById("poster");
  const rating = document.getElementById("rating");
  const description = document.getElementById("description");
  const updateId = localState.editId;
  const existingObject = localState.moviesArray.find(m => m.id === updateId);
  console.log(existingObject);
  const updateUrl = `${baseUrl}/movies/${updateId}.json`;
  const updatedObj = {
    ...existingObject,
    title: title.value,
    genre: genre.value,
    releaseDate: releaseDate.value || "Unknown",
    poster: poster.value,
    rating: rating.value,
    description: description.value,
    updatedAt: Date.now(),
  }
  console.log(updatedObj);
  handleSpinner(true)
  makeApiRequest(updateUrl, "PATCH", updatedObj)
    .then(res => {
      let updateIndex = localState.moviesArray.findIndex(m => m.id === updateId);
      localState.moviesArray[updateIndex] = updatedObj;
      let updateCard = document.getElementById(updateId);
      updateCard.innerHTML = `
      <div class="card h-100" id="movieCard">
              <div class="card-header row">
                <div class="col-10">
                  <h3 id="movieTitle" class="m-0">${updatedObj.title}</h3>
               
                </div>
                <div class="col-2">
                  <h4 class="badge ${setRating(updatedObj.rating)} align-self-center p-2">
                    <span>${updatedObj.rating}</span>
                  </h4>
                </div>
              </div>
              <small class="text-left pl-3 pb-2">${updatedObj.updatedAt ? `Updated at : ${new Date(updatedObj.updatedAt).toLocaleString("en-IN")}` : `Created at : ${new Date(updatedObj.updatedAt).toLocaleString("en-IN")}`}</small>

              <div class="card-body p-2" id="movie-cardBody">
                <figure>
                  <img
                    src="${updatedObj.poster}"
                    alt="${updatedObj.title}"
                  />

                  <figcaption>
                    <h4>${updatedObj.title}</h4>
                    <p><strong>Release Date : </strong>${updatedObj.releaseDate}</p>
                    <h5 class="text-info">Genere : ${updatedObj.genre}</h5>
                    <p>
                      ${updatedObj.description}
                    </p>
                  </figcaption>
                </figure>
              </div>

              <div class="card-footer d-flex justify-content-between">
                <button onclick="onEdit(this)" class="btn btn-sm sec-btn">Edit</button>
                <button onclick="onDelete(this)" class="btn btn-sm pri-btn">Remove</button>
              </div>
      </div >
      `
      onModelToggle();
      snackBar(`Movie with id : ${updateId} is udpated successfully...`, "success");
    })
    .catch(err => {
      snackBar(err, "error");
    })
    .finally(() => {
      handleSpinner(false)
    })

}




//delete
function onDelete(ele) {
  const deleteId = ele.closest(".col-md-3").id;
  Swal.fire({
    title: "Are you sure?",
    text: `You want to delete movie with di : ${deleteId} !`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      handleSpinner(true)
      const deleteUrl = `${baseUrl}/movies/${deleteId}.json`;
      makeApiRequest(deleteUrl, "DELETE")
        .then(res => {
          const deleteIndex = localState.moviesArray.findIndex(m => m.id === deleteId);
          localState.moviesArray.splice(deleteIndex, 1);
          ele.closest('.col-md-3').remove();
          snackBar(`Movie with id : ${deleteId} successfully deleted...`, "success");
        })
        .catch(err => {
          snackBar(err, "error");
          console.log(err);
        })
        .finally(() => {
          handleSpinner(false)
        })
    }
  });
}



function onModelToggle() {
  const movieAddOrUpdate = document.getElementById("movieAddOrUpdate");
  const addMovBtn = document.getElementById("addMovBtn");
  addMovBtn.classList.remove("d-none");
  updateMovBtn.classList.add("d-none");
  model.classList.toggle("d-none");
  backDrop.classList.toggle("d-none");
  movieForm.reset();
  movieAddOrUpdate.innerHTML = "Add Movie Details";
}

closeModelBtn.forEach(btn => {
  btn.addEventListener("click", onModelToggle)
});

modelButton.addEventListener("click", onModelToggle);
movieForm.addEventListener("submit", onCreate);
updateMovBtn.addEventListener("click", onMovieUpdate);
