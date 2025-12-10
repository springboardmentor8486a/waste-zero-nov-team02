import React from "react";
export default function EmptyPage({ title }) {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  return (
    <>
      <div style={{ padding: "40px", fontFamily: "Arial" }}>
        <h1>Welcome, {name || "User"}</h1>
        <h2>Your Role: {role || "No role received"}</h2>
      </div>
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "2rem",
          fontWeight: "600"
        }}
      >
        {title}
      </div>
    </>
  );
}
