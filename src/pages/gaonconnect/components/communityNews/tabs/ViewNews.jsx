import React, { useEffect, useState } from "react";
import {
  getAllNews,
  deleteNews,
  updateNews,
  updateNewsWithMedia,
} from "../../../services/newsService";
import EditModal from "../EditModal";

export default function ViewNews() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // PAGINATION
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const load = async () => {
    const res = await getAllNews(0, 5);
    setItems(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="cn-list">
      <h2>News List</h2>

      <table className="cn-table">
        <thead>
          <tr>
            <th>Headline</th>
            <th>Body</th>
            <th>View</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedItems.map((it) => (
            <tr key={it.id}>
              <td>{it.title}</td>
              <td>{(it.summary || it.description || "").slice(0, 80)}...</td>

              <td className="cn-center">
                <button className="view-btn" onClick={() => setViewItem(it)}>
                  View
                </button>
              </td>

              <td>
                <div className="cn-action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditing(it);
                      setEditVisible(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={async () => {
                      await deleteNews(it.id);
                      load();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {paginatedItems.length === 0 && (
            <tr>
              <td colSpan="4" className="empty-row">
                No news found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span className="current-page">{page}</span>

          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      <EditModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        initial={editing}
        type="News"
        onSave={async (payload, media) => {
          if (
            media?.newImages?.length ||
            media?.newVideo ||
            media?.removedImageUrls?.length
          ) {
            await updateNewsWithMedia(
              payload.id,
              payload,
              media.newImages,
              media.newVideo,
              media.removedImageUrls
            );
          } else {
            await updateNews(payload.id, payload);
          }
          setEditVisible(false);
          load();
        }}
      />

      {/* VIEW MODAL */}
      {viewItem && (
        <div className="cn-modal-backdrop" onClick={() => setViewItem(null)}>
          <div className="cn-view-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{viewItem.title}</h3>
            <p>{viewItem.content || viewItem.description}</p>

            {viewItem.imageUrls?.length > 0 && (
              <div className="cn-view-images">
                {viewItem.imageUrls.map((img, i) => (
                  <img key={i} src={img} alt="" />
                ))}
              </div>
            )}

            {viewItem.videoUrl && (
              <video controls className="cn-video" src={viewItem.videoUrl} />
            )}

            <button className="close-btn" onClick={() => setViewItem(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
