import * as firebase from 'firebase';
require('@firebase/firestore');

var firebaseConfig = {
    apiKey: "AIzaSyC4pLxNVkmfo5pbqz6etgh-VZGeVDXM22k",
    authDomain: "wily-app-b197e.firebaseapp.com",
    projectId: "wily-app-b197e",
    storageBucket: "wily-app-b197e.appspot.com",
    messagingSenderId: "615088539196",
    appId: "1:615088539196:web:cc88629f1f26bf6ca1e539",
    measurementId: "G-S9PGFEJKZX"
  };

  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

export default firebase.firestore()