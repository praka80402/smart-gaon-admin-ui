

// import { useEffect, useState, useCallback } from "react";
// import ForumFilter from "./ForumFilter";
// import ForumTable from "./ForumTable";
// import ReportModal from "./ReportModal";
// import {
//   getAllForumPosts,
//   deleteForumPost,
//   getForumPostReports,
// } from "../services/forumService";
// import "./forum.css";

// const Forum = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [searchPhone, setSearchPhone] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [reports, setReports] = useState([]);
//   const [showReports, setShowReports] = useState(false);

//   /* ================= LOAD POSTS ================= */
//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await getAllForumPosts({
//         phone: searchPhone || undefined,
//         fromDate: fromDate || undefined,
//         toDate: toDate || undefined,
//       });
//       setItems(res.data?.content || []);
//     } catch (e) {
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [searchPhone, fromDate, toDate]);

//   /* ================= DELETE ================= */
//   const handleDelete = async (postId) => {
//     if (!window.confirm("Delete this post?")) return;
//     await deleteForumPost(postId);
//     load();
//   };

//   /* ================= VIEW REPORTS ================= */
//   const handleViewReports = async (postId) => {
//     try {
//       const res = await getForumPostReports(postId);
//       setReports(res.data || []);
//       setShowReports(true);
//     } catch {
//       setReports([]);
//       setShowReports(true);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [load]);

//   return (
//     <div className="gc-form-section">
//       <h2>Forum Posts</h2>

//       <ForumFilter
//         searchPhone={searchPhone}
//         setSearchPhone={setSearchPhone}
//         fromDate={fromDate}
//         setFromDate={setFromDate}
//         toDate={toDate}
//         setToDate={setToDate}
//         onSearch={load}
//       />

//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <ForumTable
//           items={items}
//           onDelete={handleDelete}
//           onViewReports={handleViewReports}
//         />
//       )}

//       {showReports && (
//         <ReportModal
//           reports={reports}
//           onClose={() => setShowReports(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Forum;

import { useEffect, useState, useCallback } from "react";
import ForumFilter from "./ForumFilter";
import ForumTable from "./ForumTable";
import ReportModal from "./ReportModal";
import {
  getAllForumPosts,
  deleteForumPost,
  getForumPostReports,
} from "../services/forumService";
import "./forum.css";

const Forum = () => {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchPhone, setSearchPhone] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ PAGINATION
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 3;

  const [reports, setReports] = useState([]);
  const [showReports, setShowReports] = useState(false);


  /* ================= LOAD POSTS ================= */
  const load = useCallback(
    async (pageNo = page) => {

      setLoading(true);

      try {

        const res = await getAllForumPosts({

          page: pageNo,
          size: pageSize,

          phone: searchPhone || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });

        const data = res.data;

        setItems(data?.content || []);
        setPage(data?.number || 0);
        setTotalPages(data?.totalPages || 0);

      } catch (e) {

        console.error(e);

        setItems([]);
        setPage(0);
        setTotalPages(0);

      } finally {
        setLoading(false);
      }
    },
    [searchPhone, fromDate, toDate, page]
  );


  /* ================= DELETE ================= */
  const handleDelete = async (postId) => {

    if (!window.confirm("Delete this post?")) return;

    await deleteForumPost(postId);

    load(page);
  };


  /* ================= VIEW REPORTS ================= */
  const handleViewReports = async (postId) => {

    try {
      const res = await getForumPostReports(postId);

      setReports(res.data || []);
      setShowReports(true);

    } catch {

      setReports([]);
      setShowReports(true);
    }
  };


  /* ================= ON LOAD ================= */
  useEffect(() => {
    load(0);
  }, []);


  /* ================= PAGINATION ================= */
  const prevPage = () => {
    if (page > 0) {
      load(page - 1);
    }
  };

  const nextPage = () => {
    if (page < totalPages - 1) {
      load(page + 1);
    }
  };


  return (
    <div className="gc-form-section">

      <h2>Forum Posts</h2>

      {/* FILTER */}
      <ForumFilter
        searchPhone={searchPhone}
        setSearchPhone={setSearchPhone}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onSearch={() => load(0)}
      />


      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ForumTable
          items={items}
          onDelete={handleDelete}
          onViewReports={handleViewReports}
        />
      )}


      {/* PAGINATION BAR */}
      <div className="gc-pagination">

        <button
          onClick={prevPage}
          disabled={page === 0}
        >
          Prev
        </button>

        <span>
          Page {page + 1} of {totalPages}
        </span>

        <button
          onClick={nextPage}
          disabled={page === totalPages - 1}
        >
          Next
        </button>

      </div>


      {/* REPORT MODAL */}
      {showReports && (
        <ReportModal
          reports={reports}
          onClose={() => setShowReports(false)}
        />
      )}

    </div>
  );
};

export default Forum;
