// src/utils/fetchMembersData.js

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export const fetchMembersData = (callback) => {
  try {
    const membersCollection = collection(db, "members");

    // Real-time listener for changes in the "members" collection
    const unsubscribe = onSnapshot(membersCollection, (snapshot) => {
      const membersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(membersList); // Call the callback with the updated members list
    });

    // Return the unsubscribe function to stop listening to changes
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching members data:", error);
    return () => {}; // Return a no-op function in case of error
  }
};
