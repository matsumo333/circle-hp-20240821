import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MemberContext } from "../Contexts/MemberContext";
import "./Navbar.scss";

const Navbar = ({ isAuth }) => {
  const [menuActive, setMenuActive] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [accountName, setAccountName] = useState(null); // ローカルストレージからのアカウント名
  const { currentUserInfo } = useContext(MemberContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    console.log("Toggle Menu Clicked"); // デバッグ用ログ
    setMenuActive(!menuActive);
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

  useEffect(() => {
    // ローカルストレージからのアカウント名取得
    const storedAccountName = localStorage.getItem("accountName");
    if (storedAccountName) {
      setAccountName(storedAccountName);
    }

    // 「ログインしてください」の表示を遅らせる
    if (!currentUserInfo && !isAuth) {
      const timer = setTimeout(() => {
        setShowLoginPrompt(true);
      }, 1500); // 1500ms遅らせる

      return () => clearTimeout(timer); // クリーンアップ
    } else {
      setShowLoginPrompt(false); // ログインしている場合はすぐに非表示
    }
  }, [currentUserInfo, isAuth]);

  return (
    <nav className="navbar">
      <div className="circleName">ライジング</div>
      <div
        className={`account-name1 ${!isAuth ? "logged-out" : ""}`}
        onClick={closeMenu}
      >
        {isAuth ? (
          <span
            onClick={() =>
              navigate(`/memberedit/${currentUserInfo?.author.id}`)
            }
          >
            {currentUserInfo ? currentUserInfo.accountname : accountName}
          </span>
        ) : (
          <span>ログインしてください</span>
        )}
      </div>
      <div className="menu-icon" onClick={toggleMenu}>
        &#9776; {/* ハンバーガーアイコン */}
      </div>
      <ul className={`nav-links ${menuActive ? "active" : ""}`}>
        <li onClick={closeMenu}>
          <Link to="/">ホーム</Link>
        </li>
        <li onClick={closeMenu}>
          <Link to="/eventlist">日程</Link>
        </li>

        {currentUserInfo?.administrator && (
          <>
            <li onClick={closeMenu}>
              <Link to="/eventselect">日程入力</Link>
            </li>
            <li onClick={closeMenu}>
              <Link to="/evenmembermanagement">参加管理</Link>
            </li>
            <li onClick={closeMenu}>
              <Link to="/memberlist">メンバー一覧</Link>
            </li>
            <li onClick={closeMenu}>
              <Link to="/emailForm">メール送信</Link>
            </li>
          </>
        )}
        <li onClick={closeMenu}>
          <Link to="/link">リンク</Link>
        </li>
        {!isAuth ? (
          <li onClick={closeMenu}>
            <Link to="/login">ログイン</Link>
          </li>
        ) : (
          <>
            <li onClick={closeMenu}>
              <Link to="/logout">ログアウト</Link>
            </li>
          </>
        )}
      </ul>
      <div
        className={`account-name ${!isAuth ? "logged-out" : ""}`}
        onClick={closeMenu}
      >
        {showLoginPrompt ? (
          <span>ログインしてください</span>
        ) : isAuth ? (
          <span
            onClick={() =>
              navigate(`/memberedit/${currentUserInfo?.author.id}`)
            }
          >
            会員名：
            {currentUserInfo ? currentUserInfo.accountname : accountName}
          </span>
        ) : (
          <span>ログインしてください</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
