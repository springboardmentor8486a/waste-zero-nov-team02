import { useEffect, useState } from "react";
import { getMyActivity } from "../utils/api";

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyActivity()
      .then((data) => {
        if (data.success) {
          setActivities(data.activities);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="muted">Loading activity...</p>;
  }

  if (activities.length === 0) {
    return (
      <p className="muted">
        No activity yet. Start by creating or joining an opportunity.
      </p>
    );
  }

  return (
    <ul style={{ lineHeight: "1.8" }}>
      {activities.map((a) => (
        <li key={a._id}>
          • {a.action}
          {a.meta ? ` – ${a.meta}` : ""}
        </li>
      ))}
    </ul>
  );
}
