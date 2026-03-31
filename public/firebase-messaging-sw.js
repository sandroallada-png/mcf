importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBNsdZlGA_TH6x0Yvz4d6mJZkZtnKalCvg",
  authDomain: "my-cook-flex.firebaseapp.com",
  projectId: "my-cook-flex",
  storageBucket: "my-cook-flex.appspot.com",
  messagingSenderId: "769390935626",
  appId: "1:769390935626:web:973b183648d4df837f70b3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/new-logo/logo-favicon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
