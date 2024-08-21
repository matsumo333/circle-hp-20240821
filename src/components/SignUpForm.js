import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUpForm.scss";

const SignUpForm = ({ setIsAuth }) => {
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    const target = e.target;
    const email = target.email.value;
    const password = target.password.value;

    // パスワードと再確認パスワードが一致するかを確認
    if (password !== passwordConfirmation) {
      alert("パスワードが一致しません。");
      return;
    }

    const auth = getAuth();
    try {
      if (
        password.length < 6 || // 最低6文字
        password.length > 15 || // 最大15文字
        // !/[A-Z]/.test(password) || // 大文字が含まれているか
        !/[a-z]/.test(password) || // 小文字が含まれているか
        !/\d/.test(password) // 数字が含まれているか
      ) {
        throw new Error(
          "パスワードは少なくとも6文字で英語の小文字、数字を含む必要があり、最大15文字です。"
        );
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // displayNameを設定
      await updateProfile(user, {
        displayName: displayName,
      });

      setSignupSuccess(true); // 登録成功時にsignupSuccessをtrueに設定
      setTimeout(() => {
        navigate("/emaillogin");
      }, 3000); // 3秒後にホームに移動
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        alert("このメールアドレスはすでに使用されています。");
      } else if (e.code === "auth/invalid-email") {
        alert("無効なメールアドレスです。");
      } else if (e.code === "auth/weak-password") {
        alert("パスワードが弱すぎます。");
      } else {
        alert("登録中にエラーが発生しました。");
      }
    }
  };

  const handlePasswordConfirmationChange = (e) => {
    setPasswordConfirmation(e.target.value);
  };

  const handleDisplayNameChange = (e) => {
    setDisplayName(e.target.value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleHomeRedirect = () => {
    localStorage.setItem("isAuth", true);
    setIsAuth(true);
    navigate("/home");
  };

  const adjustInputWidth = () => {
    if (emailInputRef.current) {
      const minWidth = 265;
      const maxWidth = 500;
      emailInputRef.current.style.width = `${minWidth}px`;
      const scrollWidth = emailInputRef.current.scrollWidth;
      if (scrollWidth > minWidth && scrollWidth < maxWidth) {
        emailInputRef.current.style.width = `${scrollWidth}px`;
      } else if (scrollWidth >= maxWidth) {
        emailInputRef.current.style.width = `${maxWidth}px`;
      }
    }
  };

  useEffect(() => {
    adjustInputWidth(); // 初期ロード時に幅を調整
  }, []);

  return (
    <div className="container_su">
      <div className="content_su">
        <div className="content2_su">
          <h1>新規登録</h1>
          <button
            className="close-button3_su"
            onClick={() => {
              navigate("/login");
            }}
          >
            ｘ
          </button>
        </div>
      </div>
      <div className="content_su">
        {!signupSuccess ? (
          <div>
            <form className="" onSubmit={handleSignUp}>
              {/* <div className="signup-form">
                <p>ユーザー名</p>
                <input
                  className="login-input_sue"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={handleDisplayNameChange}
                ></input>
              </div> */}
              <div className="signup-form">
                <p>email</p>
                <input
                  className="login-input_sue"
                  name="email"
                  type="email"
                  ref={emailInputRef}
                ></input>
              </div>
              <div className="signup-form">
                <p>パスワード</p>
                <label className="lubi_su">
                  6〜15文字で英語の小文字、数字を含むもの
                </label>
                <div className="signup-form-password">
                  <input
                    className="login-input_su"
                    name="password"
                    type={showPassword ? "text" : "password"}
                  ></input>
                  <div className="signup-password-show-button-wrapper">
                    <button
                      className="signup-password-show-button"
                      type="button"
                      onMouseDown={() => setShowPassword(true)}
                      onMouseUp={() => setShowPassword(false)}
                      onMouseLeave={() => setShowPassword(false)}
                      onTouchStart={() => setShowPassword(true)}
                      onTouchEnd={() => setShowPassword(false)}
                      onClick={handleTogglePasswordVisibility}
                    >
                      Show
                    </button>
                  </div>
                </div>
              </div>
              <div className="signup-form">
                <p>パスワード再確認</p>
                <input
                  className="login-input_su"
                  type="password"
                  value={passwordConfirmation}
                  onChange={handlePasswordConfirmationChange}
                ></input>
              </div>
              <button className="login-button_su" type="submit">
                新規登録
              </button>
            </form>
          </div>
        ) : (
          <div className="signup-success-message" onClick={handleHomeRedirect}>
            登録が成功しました！
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpForm;
