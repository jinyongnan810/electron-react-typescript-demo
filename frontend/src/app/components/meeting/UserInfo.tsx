import React from "react";

const UserInfo = (props: any) => {
  const { user } = props;
  return (
    <div className="card col-3 m-1 p-3">
      <div className="card-title">{user.email}</div>
      <hr />
      <div className="card-body">
        <button className="btn btn-outline-primary">Join</button>
      </div>
    </div>
  );
};

export default UserInfo;
