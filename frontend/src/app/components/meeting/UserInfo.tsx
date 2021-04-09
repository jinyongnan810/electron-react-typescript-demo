import { UserInfoType } from "../../../app/reducers/meeting";
import React from "react";

const UserInfo = ({ user, me }: { user: UserInfoType; me: boolean }) => {
  const guests = user.with.length > 0 && (
    <ul>
      {user.with.map((u) => {
        <li key={u.id}>{u.email}</li>;
      })}
    </ul>
  );
  return (
    <div className="card col-3 m-1 p-3">
      <div className="card-title">{user.email}</div>
      <hr />
      <div className="card-body">
        {guests}
        {!me ? <button className="btn btn-outline-primary">Join</button> : ""}
      </div>
    </div>
  );
};

export default UserInfo;
