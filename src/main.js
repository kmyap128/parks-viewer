import * as map from "./map.js";
import * as ajax from "./ajax.js";
import * as storage from "./storage.js"

// I. Variables & constants
// NB - it's easy to get [longitude,latitude] coordinates with this tool: http://geojson.io/
const lnglatNYS = [-75.71615970715911, 43.025810763917775];
const lnglatUSA = [-98.5696, 39.8282];
let favoriteIds = [];
let geojson;


// II. Functions
const setupUI = () => {
	// NYS Zoom 5.2
	document.querySelector("#btn1").onclick = () => {
		map.setZoomLevel(5.2);
		map.setPitchAndBearing(0,0);
		map.flyTo(lnglatNYS);
	};

	// NYS isometric view
	document.querySelector("#btn2").onclick = () => {
		map.setZoomLevel(5.5);
		map.setPitchAndBearing(45,0);
		map.flyTo(lnglatNYS);
	};
	
	// World zoom 0
	document.querySelector("#btn3").onclick = () => {
		map.setZoomLevel(3);
		map.setPitchAndBearing(0,0);
		map.flyTo(lnglatUSA);
	};
	refreshFavorites();
};

const refreshFavorites = () => {
	const favoritesContainer = document.querySelector("#favorites-list");
	favoritesContainer.innerHTML = "";
	favoriteIds.forEach(id => {
		favoritesContainer.appendChild(createFavoriteElement(id));
	}); 
};

const createFavoriteElement = (id) => {
	console.log(id);
	const feature = getFeatureById(id);
	const a = document.createElement("a");
	a.className = "panel-block";
	a.id = id;
	a.onclick = () => {
		showFeatureDetails(a.id);
		map.setZoomLevel(6);
		map.flyTo(feature.geometry.coordinates);
	};
	a.innerHTML = `
		<span class="panel-icon">
			<i class="fas fa-map-pin"></i>
		</span>
		${feature.properties.title}
	`;
	return a;
}

const showFeatureDetails = (id) => {
	console.log(`showFeatureDetails - id=${id}`);
	const feature = getFeatureById(id);
	document.querySelector("#details-1").innerHTML = `Info for ${feature.properties.title}`;
	document.querySelector("#details-2").innerHTML = `
	<p><b>Address:</b> ${feature.properties.address}</p>
	<p><b>Phone:</b> <a href="tel:${feature.properties.phone}">${feature.properties.phone}</a></p>
	<p><b>Website:</b> <a href="${feature.properties.url}">${feature.properties.url}</a></p>
	`;
	// create favorite button
	let favoriteButton = document.createElement("button");
	favoriteButton.className = "button is-success";
	favoriteButton.innerHTML = `
		<span>
			<i class="fa-solid fa-check"></i>
		</span>
		Favorite
	`;
	if(favoriteIds.find(x => x === id)){
		favoriteButton.disabled = true;
	}
	favoriteButton.onclick = () => {
		addToFavorites(id);
		refreshFavorites();
	}
	// create delete button
	let deleteButton = document.createElement("button");
	deleteButton.className = "button is-warning";
	deleteButton.innerHTML = `
		Delete
		<span>
			<i class="fa-solid fa-x"></i>
		</span>
	`;
	if(!favoriteIds.find(x => x === id)){
		deleteButton.disabled = true;
	}
	deleteButton.onclick = () => {
		deleteFavorites(id);
		refreshFavorites();
	}
	// add buttons to details-2
	document.querySelector("#details-2").appendChild(favoriteButton);
	document.querySelector("#details-2").appendChild(deleteButton);
	document.querySelector("#details-3").innerHTML = `${feature.properties.description}`
};


const getFeatureById = (id) => {
	return geojson.features.find(element => element.id == id);
};


const addToFavorites = (id) => {
	favoriteIds.push(id);
	showFeatureDetails(id);
	storage.writeToLocalStorage("favorites", favoriteIds);
	writeFavNameData(id, 1);
};

const deleteFavorites = (id) => {
	favoriteIds = favoriteIds.filter(x => x !== id);
	showFeatureDetails(id);
	storage.writeToLocalStorage("favorites", favoriteIds);
	writeFavNameData(id, -1);
};

const loadItemsFromStorage = () => {
	const storedItems = storage.readFromLocalStorage("favorites");
	
	// Check if storedItems is an array, otherwise set it to an empty array
	if (Array.isArray(storedItems)) {
		favoriteIds = storedItems;
	  } else {
		favoriteIds = [];
	  }
};


// Firebase database setup and functions
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, push, onValue, increment, get, update} from  "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsfiYZathJOwt4tDj78Zf8rONPqcaCBGI",
  authDomain: "ny-favorite-parks-viewer.firebaseapp.com",
  projectId: "ny-favorite-parks-viewer",
  storageBucket: "ny-favorite-parks-viewer.firebasestorage.app",
  messagingSenderId: "85990278375",
  appId: "1:85990278375:web:5c56d35bec8e1237b10e42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app);

const writeFavNameData = (id, inc) => {
    const db = getDatabase();
    const favRef = ref(db, 'favorites/' + id);
	// check if entry exists
	get(favRef).then(snapshot => {
		let favorite;
		if(snapshot.exists()) {
			// if exists, update number of likes
			favorite = snapshot.val();
			const likes = favorite.likes + inc;
			if(likes < 0){
				likes = 0;
			}
			const newData = {
				id,
				likes
			};
			const updates = {};
			updates['favorites/' + id] = newData;
			update(ref(db), updates);
		}
		else{
			set(favRef, {
				id,
				likes: 1
			});
		}
	}).catch((error) => {
		console.error(error);
	});
  };



// Run the loadItemsFromStorage function when the page loads
window.addEventListener('DOMContentLoaded', loadItemsFromStorage);

const init = () => {
	map.initMap(lnglatNYS);
	ajax.downloadFile("data/parks.geojson", (str) => {
		geojson = JSON.parse(str);
		console.log(geojson);
		map.addMarkersToMap(geojson, showFeatureDetails);
		setupUI();
	});
};

init();