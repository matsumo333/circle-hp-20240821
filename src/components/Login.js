import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import "./Login.scss";

const Login = ({ setIsAuth, setAccountName, setAdministrator }) => {
  const navigate = useNavigate();

  const loginInWithGoogle = () => {
    signInWithPopup(auth, new GoogleAuthProvider())
      .then(async (result) => {
        localStorage.setItem("isAuth", "true");
        setIsAuth(true);

        const user = result.user;
        const allMembersSnapshot = await getDocs(collection(db, "members"));

        if (allMembersSnapshot.empty) {
          console.log("membersコレクションが空です");
          navigate("/membercreate", { state: { emptyCollection: true } });
          return;
        }

        const userMembersSnapshot = allMembersSnapshot.docs.filter(
          (doc) => doc.data().author.id === user.uid
        );

        if (userMembersSnapshot.length > 0) {
          const userDoc = userMembersSnapshot[0];
          const userData = userDoc.data();
          const accountName = userData.accountname;
          const adminStatus = userData.admin;
          setAccountName(accountName);
          localStorage.setItem("accountName", accountName);
          localStorage.setItem("admin", JSON.stringify(adminStatus));
          console.log("Account name set in localStorage:", accountName); // Debugging line

          if (userData.hasOwnProperty("administrator")) {
            const administrator = userData.administrator;
            console.log("Administrator value:", administrator);
            setAdministrator(administrator);
            localStorage.setItem(
              "administrator",
              JSON.stringify(administrator)
            );
            console.log(
              "Administrator status saved to localStorage:",
              administrator
            );
          } else {
            console.log("Administrator field not found in userData");
          }

          navigate("/eventlist");
        } else {
          console.log("member登録がされていません");
          navigate("/membercreate", { state: { noMember: true } });
        }
      })
      .catch((error) => {
        console.error("Error logging in with Google: ", error);
      });
  };

  const handleEmailLogin = () => {
    navigate("/emaillogin");
  };

  const redirectToSignupForm = () => {
    navigate("/signupform");
  };

  return (
    <div className="container-login">
      <div className="content">
        <p>Googleアカウントでログイン</p>
        <button className="login-button" onClick={loginInWithGoogle}>
          Googleでログイン
        </button>
      </div>
      <div className="content">
        <p>メールアドレスでログイン</p>
        <button className="login-button" onClick={handleEmailLogin}>
          メールアドレスでログイン
        </button>
      </div>
      <div className="content">
        <p>新たに登録を実施</p>
        <button className="login-button" onClick={redirectToSignupForm}>
          新規登録
        </button>
      </div>
    </div>
  );
};

export default Login;
