// src/utils/fetchEventMembersData.js

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export const subscribeToEventMembersData = (callback) => {
  try {
    const eventMembersCollection = collection(db, "event_members");

    // Real-time listener for changes in the "members" collection
    const unsubscribe = onSnapshot(eventMembersCollection, (snapshot) => {
      const eventMembersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(eventMembersList); // Call the callback with the updated members list
    });

    // Return the unsubscribe function to stop listening to changes
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching members data:", error);
    return () => {}; // Return a no-op function in case of error
  }
};
