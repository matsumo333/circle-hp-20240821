import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { fetchMembersData } from "../utils/fetchMembersData";

const MemberContext = createContext();

const MemberProvider = ({ children }) => {
  const [membersList, setMembersList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const getCurrentUserInfoFromLocalStorage = () => {
    const currentUserInfo = localStorage.getItem("currentUserInfo");
    try {
      return currentUserInfo ? JSON.parse(currentUserInfo) : null;
    } catch (error) {
      console.error("Error parsing currentUserInfo from localStorage", error);
      return null;
    }
  };

  const [currentUserInfo, setCurrentUserInfo] = useState(
    getCurrentUserInfoFromLocalStorage
  );

  useEffect(() => {
    const unsubscribeFromMembersData = fetchMembersData((membersData) => {
      setMembersList(membersData);
    });

    const unsubscribeFromAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribeFromMembersData();
      unsubscribeFromAuth();
    };
  }, []);

  useEffect(() => {
    if (currentUser && membersList.length > 0) {
      const userInfo = membersList.find(
        (member) => member.author.id === currentUser.uid
      );
      setCurrentUserInfo(userInfo);
      localStorage.setItem("currentUserInfo", JSON.stringify(userInfo));
    }
  }, [currentUser, membersList]);

  return (
    <MemberContext.Provider
      value={{
        membersList,
        currentUser,
        currentUserInfo,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

export { MemberContext, MemberProvider };
