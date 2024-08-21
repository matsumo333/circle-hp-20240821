// src/components/MemberCreate.js
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import "./MemberCreate.scss";

const MemberCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [member, setMember] = useState({
    accountname: "",
    email: "",
    tel_num: "",
    rank: "",
    profile: "",
    photo: "",
    video: "",
    administrator: false,
    author: {
      username: "",
      id: "",
    },
  });

  const [error, setError] = useState("");
  const [isEmpty, setIsEmpty] = useState(false); // コレクションが存在するかどうかを示すステート
  const [loading, setLoading] = useState(true); // ロード状態を管理するステート
  const isAdmin = localStorage.getItem("administrator") === "true";

  // コレクションの存在を確認する関数
  const checkIfCollectionExists = async () => {
    try {
      const membersCollection = collection(db, "members");
      const querySnapshot = await getDocs(membersCollection);

      if (querySnapshot.empty) {
        setIsEmpty(true); // コレクションが空または存在しない
      } else {
        setIsEmpty(false); // コレクションが存在する
      }
    } catch (error) {
      console.error("Error checking if collection exists: ", error);
      setError(`エラーが発生しました。詳細: ${error.message}`);
      setIsEmpty(true); // エラーが発生した場合も存在しないと見なす
    }
  };

  useEffect(() => {
    const checkUserRegistration = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("ユーザーが認証されていません。ログインしてください。");
        setLoading(false);
        return;
      }

      try {
        const userId = user.uid;
        alert("参加申し込み等にはメンバー登録情報登録が必要です。");
        // Check if the user is already registered
        const membersCollection = collection(db, "members");
        const q = query(membersCollection, where("author.id", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          alert("このユーザーは既に登録されています。");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking user registration: ", error);
        setError(`エラーが発生しました。詳細: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const authListener = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await checkUserRegistration();
        await checkIfCollectionExists();
      } else {
        setError("ユーザーが認証されていません。ログインしてください。");
        setLoading(false);
      }
    });

    // クリーンアップ関数でリスナーを解除
    return () => authListener();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMember((prevMember) => ({
      ...prevMember,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      setError("ユーザーが認証されていません。ログインしてください。");
      return;
    }

    try {
      const userId = user.uid;
      const username = user.displayName || "名無し";

      // Update the member object with the author details
      const updatedMember = {
        ...member,
        author: {
          id: userId,
          username: username,
        },
      };

      // Check if the user is already registered
      const membersCollection = collection(db, "members");
      const q = query(membersCollection, where("author.id", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("このユーザーは既に登録されています。");
        navigate("/");
        return;
      }

      // Add the new member
      await addDoc(membersCollection, updatedMember);
      console.log("Member added successfully");
      alert(
        "メンバー登録ができました。管理者認定の後、参加申し込み可となります。"
      );
      setError(""); // Clear the error
      navigate("/eventlist"); // Navigate to event list
    } catch (error) {
      console.error("Error adding document: ", error);
      setError(`データの登録中にエラーが発生しました。詳細: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="MemberCreate-Container">
      <h2>会員情報登録</h2>
      {error && <p className="error">{error}</p>}
      {isEmpty && (
        <p className="alert">
          管理者として必ず下部にある認定と管理権限をチェックしてください。
        </p>
      )}
      {location.state?.noMember && (
        <p className="alert">メンバー登録をお願いします</p>
      )}

      <form className="content" onSubmit={handleSubmit}>
        <div className="formField">
          <label>メンバー名:</label>
          <input
            type="text"
            name="accountname"
            value={member.accountname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formField">
          <label>連絡用メールアドレス:</label>
          <input
            type="email"
            name="email"
            value={member.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formField">
          <label>連絡用携帯電話番号:</label>
          <input
            type="tel"
            name="tel_num"
            value={member.tel_num}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formField">
          <label>プロフ:</label>
          <input
            type="text"
            name="profile"
            value={member.profile}
            onChange={handleChange}
          />
        </div>
        <div className="formField">
          <label>写真:</label>
          <input
            type="text"
            name="photo"
            value={member.photo}
            onChange={handleChange}
          />
        </div>
        {(isAdmin || isEmpty) && (
          <div className="formField">
            <div className="kengen">
              <label>管理者による会員としての認定:</label>
              <input
                className="checkbox-mc"
                type="checkbox"
                name="admin"
                checked={member.admin}
                onChange={handleChange}
              />
            </div>
            <div className="kengen">
              <label>管理権限:</label>
              <input
                className="checkbox-mc"
                type="checkbox"
                name="administrator"
                checked={member.administrator}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
        <button type="submit">送信</button>
      </form>
    </div>
  );
};

export default MemberCreate;
