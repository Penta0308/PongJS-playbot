if(!($("#dscriptarea").length)) {
  $("#executearea").before("<div id=\"dscriptarea\"></div>")
  $("#dscriptarea").append("<script src=\"https://www.gstatic.com/firebasejs/8.5.0/firebase-app.js\"></" + "script>"
                           + "<script src=\"https://www.gstatic.com/firebasejs/8.5.0/firebase-analytics.js\"></" + "script>"
                           + "<script src=\"https://www.gstatic.com/firebasejs/8.5.0/firebase-auth.js\"></" + "script>"
                           + "<script src=\"https://www.gstatic.com/firebasejs/8.5.0/firebase-firestore.js\"></" + "script>")
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyA57g8zdxp0tbpFiSKdOy17jIrWRoWXc1c",
    authDomain: "pongjs-playbot.firebaseapp.com",
    projectId: "pongjs-playbot",
    storageBucket: "pongjs-playbot.appspot.com",
    messagingSenderId: "40502297964",
    appId: "1:40502297964:web:0cf67089337b1ed15d5f49",
    measurementId: "G-NCNKC7D3T7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  var db = firebase.firestore();
  var ldb = db.collection("leaderboard");
}

function addleaderboard(score) {
  ldb.set({
      id: _userid,
      name: _username,
      at: Timestamp.now(),
      score: score
  }).then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
  }).catch((error) => {
      console.error("Error adding document: ", error);
  });
}

function getleaderboard() {
  ldb.orderBy("score", "desc").limit(5).get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id + " => " + doc.data());
        });
    })
    .catch((error) => {
        console.log("Error getting documents: " + error);
    });
}
