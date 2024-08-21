import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./Logout.scss";

const Logout = ({ setIsAuth, setUsername }) => {
  const navigate = useNavigate();
  const logout = () => {
    //ログアウト
    signOut(auth).then(() => {
      localStorage.clear();
      localStorage.removeItem("accountName");
      localStorage.removeItem("isAuth");
      localStorage.removeItem("currentUserInfo");
      localStorage.removeItem("administrator");

      setIsAuth(false);
      // setUsername(false);
      navigate("/login");
    });
  };

  return (
    <>
      <div className="container-logout">
        <div className="content">
          <p>ログアウト</p>
          <button className="logout-button" onClick={logout}>
            ログアウト
          </button>
        </div>
      </div>
    </>
  );
};

export default Logout;
