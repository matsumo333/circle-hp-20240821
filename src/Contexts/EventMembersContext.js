// src/Contexts/MemberContext.js

import { createContext, useEffect, useState } from "react";
import { subscribeToEventMembersData } from "../utils/fetchEventMembersData";

const EventMembersContext = createContext();

const EventMembersProvider = ({ children }) => {
  const [eventMembersList, setEventMembersList] = useState([]);

  useEffect(() => {
    // リアルタイムリスナーを設定
    const unsubscribe = subscribeToEventMembersData(setEventMembersList);

    // クリーンアップ関数を返す
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <EventMembersContext.Provider
      value={{ eventMembersList, setEventMembersList }}
    >
      {children}
    </EventMembersContext.Provider>
  );
};

export { EventMembersContext, EventMembersProvider };
