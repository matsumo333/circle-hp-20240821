import { EventContext } from "Contexts/EventContext";
import { EventMembersContext } from "Contexts/EventMembersContext";
import { MemberContext } from "Contexts/MemberContext";
import { addWeeks, format, isAfter, isBefore } from "date-fns";
import ja from "date-fns/locale/ja";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import "./EventList.scss";
import { ParticipantList } from "./ParticipantList";

const EventList = () => {
  const { eventList } = useContext(EventContext);
  const { eventMembersList } = useContext(EventMembersContext);
  const { membersList, currentUserInfo } = useContext(MemberContext);
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [eventMembers, setEventMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [userEventParticipation, setUserEventParticipation] = useState({});
  const [participantCounts, setParticipantCounts] = useState({});
  const navigate = useNavigate();
  const [showSaturdayEvents, setShowSaturdayEvents] = useState(false);
  const [showSundayEvents, setShowSundayEvents] = useState(false);
  const [showWeekdayEvents, setShowWeekdayEvents] = useState(false);
  const [enableJoin, setEnableJoin] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);
  const userUid = localStorage.getItem("userUid");
  const [hasAlertBeenShown, setHasAlertBeenShown] = useState(false);
  const [skipConfirmation, setSkipConfirmation] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser(user);
    setEvents(eventList || []);
    setEventMembers(eventMembersList || []);
    setMembers(membersList || []);

    if (user) {
      const userId = user.uid;

      // ユーザーが参加しているイベントのリストを取得
      const userEventMembers = eventMembersList.filter(
        (member) => member.memberId === userId
      );

      const userEventIds = userEventMembers.map((member) => member.eventId);
      const userEvents = events.filter((event) =>
        userEventIds.includes(event.id)
      );

      setUserEventParticipation(
        userEvents.reduce((acc, event) => {
          acc[event.id] = true;
          return acc;
        }, {})
      );
    }
  }, [eventList, eventMembersList, membersList]);

  // 半角数字を全角数字に変換する関数
  const toFullWidth = (str) => {
    return str.replace(/[0-9]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
    });
  };

  // 継続時間を分に変換する関数
  const convertDurationToMinutes = (duration) => {
    if (!duration) {
      return 0; // durationが存在しない場合は0分を返す
    }
    const [hours, minutes] = duration.split(":").map(Number);
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const fetchData = async () => {
      // イベント一覧を取得
      // 現在の時間の翌日を取得
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate()); // 翌日を取得
      tomorrow.setHours(0, 0, 0, 0); // 翌日の00:00に設定

      // イベントを現在の日付以降でフィルタリング
      const filteredEventList = eventList.filter(
        (event) => event.starttime >= tomorrow
      );

      // 日付の早い順にソート
      filteredEventList.sort((a, b) => a.starttime - b.starttime);
      setEvents(filteredEventList);

      // ユーザー情報を取得
      const user = auth.currentUser;
      setCurrentUser(user);
      if (user) {
        const userId = user.uid;

        // 現在ログイン中のユーザーの参加イベント情報を取得
        const userEventMembers = eventMembersList.filter(
          (member) => member.memberId === userId
        );

        // ユーザーが参加しているイベントのリストを取得
        const userEventIds = userEventMembers.map((member) => member.eventId);
        const userEvents = filteredEventList.filter((event) =>
          userEventIds.includes(event.id)
        );

        // 最も未来のイベントを取得
        const mostFutureEvent = userEvents.reduce((latest, event) => {
          return !latest || isAfter(event.starttime, latest.starttime)
            ? event
            : latest;
        }, null);

        setLatestEvent(mostFutureEvent);

        //現在ログイン中のユーザーの参加するイベント情報を抽出
        const userParticipation = userEventMembers.reduce((acc, member) => {
          acc[member.eventId] = true;
          return acc;
        }, {});
        setUserEventParticipation(userParticipation);

        // ユーザーがメンバーかどうかをチェック
        const filteredMembers = membersList.filter(
          (member) => member.author.id === userId
        );
        if (filteredMembers.length === 0) {
          alert(
            "あなたはメンバー名が未登録です。メンバー登録でお名前を登録してください。"
          );
          navigate("/membercreate");
        }
      }
    };

    fetchData();
  }, [navigate, eventList, eventMembersList, membersList]);

  useEffect(() => {
    const fetchParticipantCounts = () => {
      const counts = events.reduce((acc, event) => {
        const participants = eventMembers.filter(
          (member) => member.eventId === event.id
        );
        acc[event.id] = participants.length;
        return acc;
      }, {});
      setParticipantCounts(counts);
    };

    fetchParticipantCounts();
  }, [events, eventMembers]);

  const handleJoinEvent = async (eventId) => {
    if (currentUserInfo.admin === false) {
      alert("管理者による認証がまだなされていません。");
      return;
    }

    if (!currentUser) {
      console.log("User is not logged in");
      alert("ログインしてください");
      navigate("/login");
      return;
    }

    if (!enableJoin) {
      alert(
        "参加ボタン有効化か確認アラート不要をチェックしてください（後者をチェックした場合、確認アラートの表示が省略できます）"
      );
      return;
    }

    // イベント情報を取得
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      alert("イベントが見つかりません");
      return;
    }

    // 確認アラートをスキップする条件を追加
    if (!skipConfirmation) {
      // 確認アラートを表示
      const confirmMessage = `${format(event.starttime, "M月d日 (E) H:mm", {
        locale: ja,
      })} のイベントに本当に参加しますか？`;
      if (!window.confirm(confirmMessage)) {
        return; // ユーザーがキャンセルした場合、何もしない
      }
    }

    // 現在の参加者数を取得
    const currentParticipantsCount = participantCounts[eventId] || 0;

    // 定員を超えているか確認
    if (currentParticipantsCount >= event.capacity) {
      alert("定員締め切りのため、参加できません。");
      return;
    }

    // ユーザーのアカウント名を取得
    const user = members.find((member) => member.author.id === currentUser.uid);
    if (!user) {
      alert(
        "あなたはメンバー名が未登録です。メンバー登録でお名前を登録してください。"
      );
      navigate("/member");
      return;
    }

    const accountname = user.accountname;

    // すでにイベントメンバーとして存在するかをチェック
    const existingMember = eventMembers.find(
      (member) =>
        member.eventId === eventId && member.memberId === currentUser.uid
    );

    if (existingMember) {
      alert("すでに参加申込しています。");
      return;
    }

    // イベントメンバーに新しいドキュメントを追加し、そのドキュメントIDを取得
    const docRef = await addDoc(collection(db, "event_members"), {
      eventId: eventId,
      memberId: currentUser.uid,
    });

    // ドキュメントIDを取得
    const docId = docRef.id;

    // ローカルのステートを更新
    setEventMembers((prevEventMembers) => [
      ...prevEventMembers,
      { eventId, memberId: currentUser.uid, id: docId },
    ]);

    // ユーザーの参加状況を更新
    setUserEventParticipation((prevParticipation) => ({
      ...prevParticipation,
      [eventId]: true,
    }));

    // Firestoreから最新のデータをフェッチ
    const eventMembersCollection = collection(db, "event_members");
    const eventMembersSnapshot = await getDocs(eventMembersCollection);
    const eventMembersList = eventMembersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEventMembers(eventMembersList);
  };

  const handleDelete = async (id) => {
    try {
      // Create a query to get eventMembers associated with the eventId
      const eventMembersQuery = query(
        collection(db, "event_members"),
        where("eventId", "==", id)
      );

      // Retrieve the eventMembers associated with the event
      const eventMembersQuerySnapshot = await getDocs(eventMembersQuery);

      // Delete each eventMember document
      const deletePromises = eventMembersQuerySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Delete the event document
      await deleteDoc(doc(db, "events", id));

      // Update the local state
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      setEventMembers((prevEventMembers) =>
        prevEventMembers.filter((member) => member.eventId !== id)
      );

      // Optionally, navigate to the event list page if not already there
      navigate("/eventlist");
    } catch (error) {
      console.error("Error deleting event and its members: ", error);
    }
  };

  const isAdmin = localStorage.getItem("administrator") === "true";
  const handleWeekdayCheckboxChange = () => {
    setShowWeekdayEvents(!showWeekdayEvents);
  };

  const handleSaturdayCheckboxChange = () => {
    setShowSaturdayEvents(!showSaturdayEvents);
  };

  const handleSundayCheckboxChange = () => {
    setShowSundayEvents(!showSundayEvents);
  };

  const filteredEvents = events.filter((event) => {
    const dayOfWeek = event.starttime.getDay();

    if (!showSaturdayEvents && !showSundayEvents && !showWeekdayEvents) {
      // すべてのチェックボックスがオフのとき
      return true;
    }

    // 土曜日だけ表示する
    if (showSaturdayEvents && !showSundayEvents && !showWeekdayEvents) {
      return dayOfWeek === 6; // 土曜日
    }

    // 日曜日だけ表示する
    if (!showSaturdayEvents && showSundayEvents && !showWeekdayEvents) {
      return dayOfWeek === 0; // 日曜日
    }

    // 平日だけ表示する
    if (!showSaturdayEvents && !showSundayEvents && showWeekdayEvents) {
      return dayOfWeek >= 1 && dayOfWeek <= 5; // 平日
    }

    // 土曜日と日曜日を表示する
    if (showSaturdayEvents && showSundayEvents && !showWeekdayEvents) {
      return dayOfWeek === 0 || dayOfWeek === 6; // 日曜日または土曜日
    }

    // 土曜日と平日を表示する
    if (showSaturdayEvents && !showSundayEvents && showWeekdayEvents) {
      return dayOfWeek === 6 || (dayOfWeek >= 1 && dayOfWeek <= 5); // 土曜日または平日
    }

    // 日曜日と平日を表示する
    if (!showSaturdayEvents && showSundayEvents && showWeekdayEvents) {
      return dayOfWeek === 0 || (dayOfWeek >= 1 && dayOfWeek <= 5); // 日曜日または平日
    }

    // 土曜日、日曜日、平日をすべて表示する
    if (showSaturdayEvents && showSundayEvents && showWeekdayEvents) {
      return true;
    }

    return false;
  });
  useEffect(() => {
    const checkAlert = () => {
      if (latestEvent) {
        // 現在の日付
        const now = new Date();
        // 最新イベントの開始日時
        const eventStartTime = latestEvent.starttime;

        // 現在から3週間後の日時
        const threeWeeksFromNow = addWeeks(now, 3);

        // イベントの開始日時が3週間以内かどうかをチェック
        if (isBefore(eventStartTime, threeWeeksFromNow) && !hasAlertBeenShown) {
          alert(
            "テニスオフでの参加募集を二週間前に始めますので、参加申し込みは開催３週間前まででお願いいたします。"
          );
          setHasAlertBeenShown(true); // アラートを一度だけ表示するためのフラグ
        }
      }
    };

    checkAlert();
  }, [latestEvent, hasAlertBeenShown]);

  return (
    <div className="eventListContainer">
      <div className="hyodai">
        {/* {latestEvent && (
          <div className="latest-event">
            <h2>最終のイベント</h2>
            <p>
              {latestEvent &&
                format(latestEvent.starttime, "yyyy年M月d日 H:mm", {
                  locale: ja,
                })}
            </p>
          </div>
        )} */}
        <h1>イベント一覧</h1>
        <h3>表示する曜日を選択</h3>
        <div className="filter">
          <label>
            <input
              type="checkbox"
              checked={showSaturdayEvents}
              onChange={handleSaturdayCheckboxChange}
            />
            土
          </label>
          <label>
            <input
              type="checkbox"
              checked={showSundayEvents}
              onChange={handleSundayCheckboxChange}
            />
            日
          </label>
          <label>
            <input
              type="checkbox"
              checked={showWeekdayEvents}
              onChange={handleWeekdayCheckboxChange}
            />
            平日
          </label>
          <label>
            <input
              type="checkbox"
              checked={enableJoin}
              onChange={() => setEnableJoin(!enableJoin)}
            />
            参加ボタン有効化
          </label>
          <label>
            <input
              type="checkbox"
              checked={skipConfirmation}
              onChange={() => {
                setSkipConfirmation(!skipConfirmation);
                setEnableJoin(!enableJoin);
              }}
            />
            確認アラート不要
          </label>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th className="event_title" style={{ width: "240px" }}>
              開催日
            </th>
            <th
              className="event_title hide-on-narrow"
              style={{ width: "100px" }}
            >
              開催時間
            </th>
            <th className="event_title" style={{ width: "190px" }}>
              {" "}
              タイトル
            </th>
            <th className="event_title hide-on-narrow">開催場所</th>
            <th className="event_title hide-on-narrow">地図</th>
            <th className="event_title hide-on-narrow">面数</th>
            <th className="event_title hide-on-narrow">定員</th>
            {isAdmin && (
              <>
                <th className="event_title hide-on-narrow">申込人数</th>
              </>
            )}
            <th className="event_title hide-on-narrow">表面</th>
            <th className="event_title hide-on-narrow">面番</th>
            <th className="event_title hide-on-narrow">参加者</th>
            <th className="event_title">参加</th>
            {isAdmin && (
              <>
                <th className="event_title">削除</th>
                <th className="event_title">編集</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event, index) => (
            <tr key={index}>
              <td className="event-date">
                {format(event.starttime, "M /d（E）HH:mm ", {
                  locale: ja,
                })}
              </td>
              <td
                className="hide-on-narrow"
                style={{
                  fontSize: "24px",
                }}
              >
                {event.duration_hour > 0 ? `${event.duration_hour} 時間 ` : ""}
                {event.duration_minute > 0 ? `${event.duration_minute} 分` : ""}
              </td>
              <td>
                <button
                  className="button_title"
                  onClick={() => navigate(`/eventdetail/${event.id}`)}
                >
                  {event.title}
                </button>
              </td>
              <td className="hide-on-narrow">{event.site_region}</td>
              <td className="hide-on-narrow">
                {event.map ? (
                  <a href={event.map} target="_blank" rel="noopener noreferrer">
                    地図参照
                  </a>
                ) : (
                  "地図情報がありません"
                )}
              </td>
              <td className="hide-on-narrow">
                {event.court_count
                  ? toFullWidth(event.court_count.toString())
                  : "N/A"}
              </td>

              <td className="hide-on-narrow">
                {event.capacity
                  ? toFullWidth(event.capacity.toString())
                  : "N/A"}
              </td>

              {isAdmin && (
                <>
                  <td className="hide-on-narrow">
                    {participantCounts[event.id]
                      ? toFullWidth(participantCounts[event.id].toString())
                      : "0"}
                  </td>
                </>
              )}
              <td className="hide-on-narrow">{event.court_surface}</td>
              <td className="hide-on-narrow">
                {event.court_num
                  ? toFullWidth(event.court_num.toString())
                  : "N/A"}
              </td>
              <td className="hide-on-narrow">
                <label htmlFor={`participants-${event.id}`}></label>
                <div className="participantList">
                  <ParticipantList
                    id={`participants-${event.id}`}
                    eventId={event.id}
                    eventMembers={eventMembers}
                    members={members}
                    navigate={navigate}
                    administrator={isAdmin}
                  />
                </div>
              </td>
              <td>
                {userEventParticipation[event.id] ? (
                  <button
                    className="button2"
                    onClick={() => handleJoinEvent(event.id)}
                  >
                    参加予定
                  </button>
                ) : participantCounts[event.id] >= event.capacity ? (
                  <button
                    className="button3"
                    disabled
                    style={{
                      cursor: "not-allowed",
                      backgroundColor: "#a99fe9",
                    }}
                  >
                    定員締切
                  </button>
                ) : (
                  <button
                    className="button3"
                    onClick={() => handleJoinEvent(event.id)}
                    style={{
                      backgroundColor: "#ffcc6f",
                    }}
                  >
                    募集中
                  </button>
                )}
              </td>
              {isAdmin && (
                <>
                  <td>
                    <button
                      style={{
                        backgroundColor: "#fd9812",
                        fontSize: "20px",
                      }}
                      className="button3"
                      onClick={() => handleDelete(event.id)}
                    >
                      削除
                    </button>
                  </td>
                  <td>
                    <button
                      style={{
                        backgroundColor: "#1eb300",
                        fontSize: "20px",
                      }}
                      onClick={() => navigate(`/eventedit/${event.id}`)}
                    >
                      編集
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventList;
