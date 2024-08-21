import React, { useState } from "react";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./ResetEmailPassword.scss";
const ResetEmailPassword = () => {
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const cancel = () => {
    navigate("/login");
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const firebaseAuth = getAuth();
    try {
      await sendPasswordResetEmail(firebaseAuth, resetEmail);
      alert("パスワードの再設定のメールを送付しました");
    } catch (error) {
      console.error(error);
      alert("パスワードの再設定のメールの送信に失敗しました");
    }
  };

  return (
    <>
      <div className="container-reset">
        <div className="content">
          <div className="content2">
            <div>
              <p>再設定を行うメールアドレス</p>
            </div>
            <div className="close-button2" onClick={() => cancel()}>
              ｘ
            </div>
          </div>
          <form onSubmit={handlePasswordReset}>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="login-input"
              required
            />
            <button type="submit" className="login-button">
              再設定のメールを送付
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetEmailPassword;
