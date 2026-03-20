"use client";
import { useSession } from "next-auth/react";

export default function TestSession() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Checking session...</p>;

  if (session) {
    return (
      <div className="p-4 bg-green-100 border border-green-400 rounded">
        <p>Logged in as: <strong>{session.user.name}</strong></p>
        <p>Email: {session.user.email}</p>
        <p>User ID in DB: {session.user.id}</p>
      </div>
    );
  }

  return <p className="p-4 bg-red-100">Not logged in.</p>;
}