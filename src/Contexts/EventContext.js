// EventContext.js
import { createContext, useEffect, useState } from "react";
import { subscribeToEventData } from "../utils/fetchEventData";

const EventContext = createContext();

const EventProvider = ({ children }) => {
  const [eventList, setEventList] = useState([]);

  useEffect(() => {
    // リアルタイムリスナーを設定
    const unsubscribe = subscribeToEventData(setEventList);

    // クリーンアップ関数を返す
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <EventContext.Provider value={{ eventList, setEventList }}>
      {children}
    </EventContext.Provider>
  );
};

export { EventContext, EventProvider };
