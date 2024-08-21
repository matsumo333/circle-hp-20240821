import EventList from "components/EventList";
import MemberCreate from "components/MemberCreate";
import MemberEdit from "components/MemberEdit";
import MemberList from "components/MemberList";
import ResetEmailPassword from "components/ResetEmailPassword";
import Logout from "Contexts/Logout";
import { useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import EmailLogin from "./components/EmailLogin";
import Home from "./components/Home";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import SignUpForm from "./components/SignUpForm";
import { EventProvider } from "./Contexts/EventContext";
import { EventMembersProvider } from "./Contexts/EventMembersContext";
import { MemberProvider } from "./Contexts/MemberContext";

function App() {
  const [isAuth, setIsAuth] = useState(false); // isAuthのステートを定義
  const [accountName, setAccountName] = useState("");
  const [administrator, setAdministrator] = useState(
    JSON.parse(localStorage.getItem("administrator"))
  );
  return (
    <Router>
      <EventMembersProvider>
        <EventProvider>
          <MemberProvider>
            <Navbar
              isAuth={isAuth}
              accountName={accountName}
              administrator={administrator}
            />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={
                  <Login
                    setIsAuth={setIsAuth}
                    setAccountName={setAccountName}
                    setAdministrator={setAdministrator}
                  />
                }
              />
              <Route
                path="/logout"
                element={<Logout setIsAuth={setIsAuth} />}
              />
              <Route
                path="/emaillogin"
                element={
                  <EmailLogin
                    setIsAuth={setIsAuth}
                    setAccountName={setAccountName}
                    setAdministrator={setAdministrator}
                  />
                }
              />{" "}
              {/* 修正ポイント */}
              <Route path="/signupform" element={<SignUpForm />} />
              <Route path="/resetpassword" element={<ResetEmailPassword />} />
              <Route path="/membercreate" element={<MemberCreate />} />
              <Route
                path="/memberlist"
                element={<MemberList isAuth={isAuth} />}
              />
              <Route
                path="/memberedit/:id"
                element={<MemberEdit isAuth={isAuth} />}
              />
              <Route path="/eventlist" element={<EventList />} />
            </Routes>
          </MemberProvider>
        </EventProvider>
      </EventMembersProvider>
    </Router>
  );
}

export default App;
