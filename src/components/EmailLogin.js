import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmailLogin.scss";

const EmailLogin = ({ setIsAuth, setAccountName, setAdministrator }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleMouseDown = () => {
    setShowPassword(true);
  };

  const handleMouseUp = () => {
    setShowPassword(false);
  };

  const handleMouseLeave = () => {
    setShowPassword(false);
  };

  const handleEmailLogin = () => {
    navigate("/resetpassword");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      console.log("ログイン成功:");
      localStorage.setItem("isAuth", "true"); // 修正: true を文字列として保存
      setIsAuth(true);
      console.log("localStorage isAuth:", localStorage.getItem("isAuth")); // デバッグ

      const user = auth.currentUser;

      // Firestoreからユーザー情報を取得
      const db = getFirestore();
      const membersCollection = collection(db, "members");
      const membersSnapshot = await getDocs(membersCollection);
      const membersList = membersSnapshot.docs.map((doc) => doc.data());

      // ユーザー情報が存在するか確認
      const userData = membersList.find(
        (member) => member.author.id === user.uid
      );

      if (userData) {
        const accountName = userData.accountname;
        const adminStatus = userData.admin;
        setAccountName(accountName);
        localStorage.setItem("accountName", accountName);
        localStorage.setItem("admin", JSON.stringify(adminStatus));
        console.log("Account name set in localStorage:", accountName); // デバッグ

        if (userData.hasOwnProperty("administrator")) {
          const administrator = userData.administrator;
          setAdministrator(administrator);
          localStorage.setItem("administrator", JSON.stringify(administrator));
          console.log(
            "Administrator status saved to localStorage:",
            administrator
          );
        } else {
          console.log("Administrator field not found in userData");
        }

        navigate("/eventlist");
      } else {
        alert(
          "あなたはメンバー名が未登録です。メンバー登録でお名前を登録してください。"
        );
        navigate("/membercreate");
      }
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          setError(
            "無効なメールアドレスです。正しいメールアドレスを入力してください。"
          );
          break;
        case "auth/user-disabled":
          setError("アカウントが無効です。管理者にお問い合わせください。");
          break;
        case "auth/user-not-found":
          setError("メールアドレスまたはパスワードが間違っています。");
          break;
        case "auth/wrong-password":
          setError(
            "パスワードが間違っています。正しいパスワードを入力してください。"
          );
          break;
        default:
          setError("メールアドレスまたはパスワードが間違っています。");
          break;
      }
      console.error("ログイン失敗:", error);
      console.error("ログイン失敗:", error.code, error.message);
    }
  };

  return (
    <div className="email-login-container">
      <div className="content">
        <div className="close-button" onClick={() => navigate("/login")}>
          X
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="title">
            <p>メールアドレス</p>
          </div>
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          <p>パスワード</p>
          <div className="password-container">
            <div>
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <button
              type="button"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className="toggle-password-button"
            >
              {showPassword ? "非表示" : "表　示"}
            </button>
          </div>
          <button className="login-button" type="submit">
            ログイン
          </button>
        </form>
        {error && (
          <div className="content">
            <p>{error}</p>
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={handleEmailLogin}
            className="forget-button"
          >
            パスワードを忘れた
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailLogin;
