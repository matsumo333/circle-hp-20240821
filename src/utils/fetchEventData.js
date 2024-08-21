// src/utils/fetchEventData.js
import { parseISO } from "date-fns";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Firebaseの設定がされているファイルからdbをインポート
import { convertDurationToMinutes } from "./convertDurationToMinutes";

export const subscribeToEventData = (callback) => {
  try {
    const eventCollection = collection(db, "events");
    const unsubscribe = onSnapshot(eventCollection, (snapshot) => {
      const eventList = snapshot.docs.map((doc) => {
        const eventData = doc.data();
        const starttime = parseISO(eventData.starttime); // 必要に応じて日付形式を変換
        const durationInMinutes = convertDurationToMinutes(eventData.duration); // 必要に応じて変換
        return {
          id: doc.id,
          ...eventData,
          starttime: starttime,
          duration: durationInMinutes,
        };
      });
      callback(eventList);
    });

    return unsubscribe; // クリーンアップ用
  } catch (error) {
    console.error("Error subscribing to event data:", error);
    return () => {}; // 何も行わないクリーンアップ関数を返す
  }
};
