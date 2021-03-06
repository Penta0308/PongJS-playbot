var ldb = undefined;

if (!($("#dscriptarea").length)) {
    $("#executearea").before("<div id=\"dscriptarea\"></div>");
    let script = document.createElement("script");
    script.src = "https://www.gstatic.com/firebasejs/8.5.0/firebase-app.js";
    $("#dscriptarea")[0].appendChild(script);
    script = document.createElement("script");
    script.src = "https://www.gstatic.com/firebasejs/8.5.0/firebase-analytics.js";
    $("#dscriptarea")[0].appendChild(script);
    script = document.createElement("script");
    script.src = "https://www.gstatic.com/firebasejs/8.5.0/firebase-auth.js";
    $("#dscriptarea")[0].appendChild(script);
    script = document.createElement("script");
    script.src = "https://www.gstatic.com/firebasejs/8.5.0/firebase-firestore.js";
    $("#dscriptarea")[0].appendChild(script);
}

function initdb() {
    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
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
    ldb = firebase.firestore().collection("leaderboard");
}

function addleaderboard(score) {
    if (!ldb) initdb();
    ldb.add({
        id: _userid,
        name: _username,
        at: firebase.firestore.Timestamp.now(),
        score: score
    }).then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    }).catch((error) => {
        console.error("Error adding document: ", error);
    });
}

function getleaderboard() {
    if (!ldb) initdb();
    ldb.orderBy("score", "desc").limit(5).get()
        .then((querySnapshot) => {
            let s = "<table><th><td>id(닉네임)</td><td>점수</td></th>";
            querySnapshot.forEach((doc) => {
                const l = doc.data();
                s += "<tr><td>" + l["id"] + "(" + l["name"] + ")" + "</td><td>" + l["score"] + "</td></tr>";
            });
            s += "</table>";
            popup(s);
        })
        .catch((error) => {
            console.log("Error getting documents: " + error);
        });
}
