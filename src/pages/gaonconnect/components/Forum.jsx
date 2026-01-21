import { useEffect, useState, useCallback } from "react";
import ForumFilter from "./ForumFilter";
import ForumTable from "./ForumTable";
import {
  getAllForumPosts,
  deleteForumPost,
} from "../services/forumService";
import "./forum.css";

const Forum = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchPhone, setSearchPhone] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ================= LOAD POSTS ================= */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllForumPosts({
        phone: searchPhone || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setItems(res.data?.content || []);
    } catch (e) {
      console.error("Forum load failed", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchPhone, fromDate, toDate]);

  /* ================= DELETE ================= */
  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await deleteForumPost(postId);
      load(); // refresh list
    } catch (e) {
      alert("Failed to delete post");
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="gc-form-section">
      <h2>Forum Posts</h2>

      <ForumFilter
        searchPhone={searchPhone}
        setSearchPhone={setSearchPhone}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onSearch={load}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ForumTable items={items} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Forum;