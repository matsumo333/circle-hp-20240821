import { EventMembersContext } from "Contexts/EventMembersContext";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import "./MemberInfo.scss";
const MemberEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventMembersList = useContext(EventMembersContext); // ContextからeventMembersListを取得
  const [member, setMember] = useState({
    accountname: "",
    email: "",
    tel_num: "",
    rank: "",
    profile: "",
    photo: "",
    video: "",
    admin: false,
    administrator: false,
    author: {
      username: "",
      id: "",
    },
  });
  const [docId, setDocId] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const isAdmin = localStorage.getItem("administrator") === "true";

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const q = query(
          collection(db, "members"),
          where("author.id", "==", id)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            setMember(doc.data());
            setDocId(doc.id);
          });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    if (id) {
      fetchMember();
    }
  }, [id]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setMember((prevMember) => ({
          ...prevMember,
          author: {
            username: currentUser.displayName || "Anonymous",
            id: currentUser.uid,
          },
        }));
      } else {
        setError("ユーザーが認証されていません。ログインしてください。");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMember((prevMember) => ({
      ...prevMember,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing) {
      handleEditToggle();
      return;
    }

    if (!auth.currentUser) {
      setError("ユーザーが認証されていません。ログインしてください。");
      return;
    }

    try {
      if (docId) {
        const memberRef = doc(db, "members", docId);
        await updateDoc(memberRef, member);
        console.log("Member updated successfully");
        setError("");
        setIsEditing(false);
        navigate("/eventlist");
      } else {
        setError("更新するドキュメントが存在しません。");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
      setError(`データの更新中にエラーが発生しました。詳細: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `本当にこのユーザー「${member.accountname}」を削除しますか？`
      )
    ) {
      try {
        if (docId) {
          // membersコレクションからユーザーを削除
          await deleteDoc(doc(db, "members", docId));

          // event_membersコレクションの関連データを削除
          const eventMembersToDelete = eventMembersList.filter(
            (eventMember) => eventMember.memberID === member.author.id
          );

          for (const eventMember of eventMembersToDelete) {
            await deleteDoc(doc(db, "event_members", eventMember.id));
          }

          console.log("Member and related event_members deleted successfully");
          navigate("/eventlist");
        } else {
          setError("削除するドキュメントが存在しません。");
        }
      } catch (error) {
        console.error("Error deleting document: ", error);
        setError(
          `データの削除中にエラーが発生しました。詳細: ${error.message}`
        );
      }
    }
  };

  return (
    <div className="Container-member">
      <h2>会員情報</h2>
      <div className="close-button" onClick={() => navigate("/eventlist")}>
        X
      </div>
      {error && <p className="error">{error}</p>}
      <form className="memberForm" onSubmit={handleSubmit}>
        <div className="formField">
          <label>アカウントネーム:</label>
          <input
            type="text"
            name="accountname"
            value={member.accountname}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="formField">
          <label>連絡用メールアドレス:</label>
          <input
            type="email"
            name="email"
            value={member.email}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="formField">
          <label>連絡用携帯電話番号:</label>
          <input
            type="tel"
            name="tel_num"
            value={member.tel_num}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="formField">
          <label>写真:</label>
          <input
            type="text"
            name="photo"
            value={member.photo}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="formField">
          <div className="checkbox-container">
            {isAdmin && (
              <div className="formField">
                <div className="kengen">
                  <label>管理者による会員としての認定:</label>
                  <input
                    className="checkbox-mc"
                    type="checkbox"
                    name="admin"
                    checked={member.admin}
                    onChange={handleChange}
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={`member-edit-button ${isEditing ? "editing" : ""}`}
        >
          {isEditing ? "変更内容を保存" : "変更を可とする"}
        </button>
        {isAdmin && (
          <button
            type="button"
            className="member-delete-button"
            onClick={handleDelete}
          >
            ユーザーを削除
          </button>
        )}
      </form>
    </div>
  );
};

export default MemberEdit;
