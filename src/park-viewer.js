 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
 import { getDatabase, ref, set, push, onValue } from  "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
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

const parks = {
    "p79"   : "Letchworth State Park",
    "p20"   : "Hamlin Beach State Park",
    "p180"  : "Brookhaven State Park",
    "p35"   : "Allan H. Treman State Marine Park",
    "p118"  : "Stony Brook State Park",
    "p142"  : "Watkins Glen State Park",
    "p62"   : "Taughannock Falls State Park",
    "p84"   : "Selkirk Shores State Park",
    "p43"   : "Chimney Bluffs State Park",
    "p200"  : "Shirley Chisholm State Park",
    "p112"  : "Saratoga Spa State Park"
  };
  
  const favoritesChanged = (snapshot) => {
    // TODO: clear #favoritesList
    document.querySelector("#park-popularity").innerHTML = "";
    snapshot.forEach(fav => {
      const childKey = fav.key;
      const childData = fav.val();
      console.log(childKey,childData);
      // TODO: update #favoritesList
      if(childData.likes >= 1){
        document.querySelector("ol").innerHTML += `<li class="has-text-white"> <strong class="has-text-white">${parks[childData.id]} (${childData.id})</strong> - Likes: ${childData.likes}</li>`;
      }
    });
  };
  
  const init = () => {
    const db = getDatabase();
    const favoritesRef = ref(db, 'favorites/');
    onValue(favoritesRef,favoritesChanged);
  };
  
  document.addEventListener("DOMContentLoaded", () => {
    init();
});
