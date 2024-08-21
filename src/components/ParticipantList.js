export const ParticipantList = ({
  eventId,
  eventMembers,
  members = [],
  navigate,
  administrator,
}) => {
  // イベントメンバーをフィルタリング
  const filteredMembers = eventMembers.filter(
    (member) => member.eventId === eventId
  );

  // メンバーIDに基づいてメンバーのアカウント名を取得
  const getAccountName = (memberId) => {
    // メンバーが undefined でないことを確認
    if (!members) {
      console.error("Members data is not available.");
      return "不明";
    }
    const member = members.find((m) => m.author.id === memberId);
    return member ? member.accountname : "不明"; // メンバーが見つからない場合は"不明"と表示
  };

  // ボタンのリストを作成
  const participantButtons = filteredMembers.map((participanteventmember) => (
    <button
      key={participanteventmember.memberId}
      onClick={() => {
        if (administrator) {
          navigate(`/eventcancel/${eventId}/${participanteventmember.id}`);
        }
      }}
      disabled={!administrator} // 管理者でない場合はボタンを無効にする
      style={{ cursor: administrator ? "pointer" : " default" }} // 管理者でない場合はカーソルをnot-allowedにする
    >
      {getAccountName(participanteventmember.memberId)}{" "}
      {/* メンバーのアカウント名を表示 */}
    </button>
  ));

  return <div className="participant-list">{participantButtons}</div>;
};
