import { useAppSelector } from "../../hooks";
import React from "react";
import UserInfo from "./UserInfo";
import { RTCPeerInfo } from "../Dashboard";

const UserList = ({
  me,
  joinRoom,
  exitRoom,
}: {
  me: string | undefined;
  joinRoom: Function;
  exitRoom: Function;
}) => {
  const users = useAppSelector((state) => state.meeting.users);
  const meInfo = users.filter((u) => u.id === me)[0];
  return (
    <div>
      {users.map((u) => {
        if (u.status !== "guest") {
          return (
            <UserInfo
              user={u}
              key={u.id}
              meInfo={meInfo}
              joinRoom={joinRoom}
              exitRoom={exitRoom}
            />
          );
        }
      })}
    </div>
  );
};

export default UserList;
