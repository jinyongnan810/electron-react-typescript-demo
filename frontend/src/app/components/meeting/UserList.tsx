import { useAppSelector } from "../../hooks";
import React from "react";
import UserInfo from "./UserInfo";

const UserList = () => {
  const users = useAppSelector((state) => state.meeting.users);
  return (
    <div>
      {users.map((u) => (
        <UserInfo user={u} key={u.id} />
      ))}
    </div>
  );
};

export default UserList;
