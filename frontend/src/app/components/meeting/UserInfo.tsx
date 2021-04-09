import { UserInfoType } from "../../../app/reducers/meeting";
import React from "react";

const UserInfo = ({
  user,
  meInfo,
  joinRoom,
  exitRoom,
}: {
  user: UserInfoType;
  meInfo: UserInfoType;
  joinRoom: Function;
  exitRoom: Function;
}) => {
  const guests =
    user.with.length > 0 ? (
      <ul>
        {user.with.map((u) => {
          return (
            <li key={u.id}>
              {u.id === meInfo.id ? `${meInfo.email}(Myself)` : u.email}
            </li>
          );
        })}
      </ul>
    ) : (
      ""
    );
  const joinBtn = meInfo.id !== user.id && meInfo.status === "idle" && (
    <button
      className="btn btn-outline-primary"
      onClick={(e) => {
        joinRoom(user.id);
      }}
    >
      Join
    </button>
  );
  const exitBtn = meInfo.status !== "idle" &&
    ((meInfo.status === "host" && meInfo.id === user.id) ||
      meInfo.with[0].id === user.id) && (
      <button
        className="btn btn-outline-danger"
        onClick={(e) => {
          exitRoom();
        }}
      >
        Leave
      </button>
    );
  return (
    <div className="card col-3 m-1 p-3">
      <div className="card-title">
        {user.id === meInfo.id ? `${meInfo.email}(Myself)` : user.email}
      </div>

      <div className="card-body">
        {guests}
        {joinBtn}
        {exitBtn}
      </div>
    </div>
  );
};

export default UserInfo;
