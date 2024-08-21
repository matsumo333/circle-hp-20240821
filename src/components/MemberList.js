import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase"; // Firebaseの初期化設定が含まれているモジュールをインポート
import "./MemberList.scss";

const MemberList = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const memberCollection = collection(db, "members");
      const memberSnapshot = await getDocs(memberCollection);
      const memberList = memberSnapshot.docs.map((doc) => doc.data());
      setMembers(memberList);
    };

    fetchMembers();
  }, []);

  return (
    <div className="memberListContainer">
      <h1>会員情報一覧</h1>
      <table>
        <thead>
          <tr>
            <th>会員名</th>
            <th>連絡用メールアドレス</th>
            <th className="hide-on-narrow">連絡用携帯電話番号</th>
            <th className="hide-on-narrow">会員種別</th>
            <th className="hide-on-narrow">プロフィール</th>
            <th className="hide-on-narrow">写真</th>
            <th className="hide-on-narrow">ビデオ</th>
            <th>管理者認証</th>
            <th className="hide-on-narrow">管理権限</th>
            <th>会員詳細</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={index}>
              <td>{member.accountname}</td>
              <td>{member.email}</td>
              <td className="hide-on-narrow">{member.tel_num}</td>
              <td className="hide-on-narrow">{member.rank}</td>
              <td className="hide-on-narrow">{member.profile}</td>
              <td className="hide-on-narrow">{member.photo}</td>
              <td className="hide-on-narrow">{member.video}</td>
              <td>{member.admin ? "■" : "□"}</td>
              <td className="hide-on-narrow">
                {member.administrator ? "■" : "□"}
              </td>

              <td>
                <Link to={`/memberedit/${member.author.id}`}>表示</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberList;
