import { useAppSelector } from "../../hooks";
import React from "react";
import UserInfo from "./UserInfo";

const UserList = ({ me }: { me: string | undefined }) => {
  const users = useAppSelector((state) => state.meeting.users);
  return (
    <div>
      {users.map((u) => {
        if (u.status !== "guest") {
          return <UserInfo user={u} key={u.id} me={u.id === me} />;
        }
      })}
    </div>
  );
};

export default UserList;
