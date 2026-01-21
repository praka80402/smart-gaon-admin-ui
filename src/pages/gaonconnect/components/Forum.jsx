import React, { useEffect, useState } from "react";
import ForumFilter from "./ForumFilter";
import ForumTable from "./ForumTable";
import {
  getAllForumPosts,
  deleteForumPost,
  getPostReports,
} from "../services/forumService";
import "./forum.css";
import ReportModal from "./ReportModal";

const Forum = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchPhone, setSearchPhone] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [reports, setReports] = useState([]);
const [showReports, setShowReports] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllForumPosts({
        phone: searchPhone || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setItems(res.data?.content || []);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReports = async (postId) => {
  const res = await getPostReports(postId);
  setReports(res.data || []);
  setShowReports(true);
};


  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    await deleteForumPost(postId);
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
        onSearch={load}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ForumTable items={items} onDelete={handleDelete} onViewReports={handleViewReports} />
      )}

   {showReports && (
  <ReportModal
    reports={Array.isArray(reports) ? reports : []}
    onClose={() => setShowReports(false)}
  />
)}



    </div>
  );
};

export default Forum;
