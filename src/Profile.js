import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "/login";

    fetch("http://localhost:8000/", {
      headers: {"Authorization": `Bearer ${token}`}
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setUser(data.user))
      .catch(() => window.location.href = "/login");
  }, []);

  if (!user) return <p>Loading...</p>;
  return <div>Welcome, {user.username}</div>;
}

export default Profile;
