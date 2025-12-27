import React, { useEffect, useState } from "react";
import ForumFilter from "./ForumFilter";
import PostedItem from "./PostedItem";
import {
  getAllForumPosts,
  deleteForumPost,
} from "../services/forumService";

const Forum = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchPhone, setSearchPhone] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("createdAt,desc");

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        sort,
        phone: searchPhone || undefined,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate: toDate ? new Date(toDate).toISOString() : undefined,
      };

      const res = await getAllForumPosts(params);
      setItems(res.data?.content || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await deleteForumPost(id);
    load();
  };

  useEffect(() => {
    load();
  }, []);

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
        forumSort={sort}
        setForumSort={setSort}
        onSearch={load}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="gc-cart-grid">
          {items.map((it) => (
            <PostedItem
              key={it.postId}
              item={it}
              type="Forum"
              onDelete={() => handleDelete(it.postId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Forum;
