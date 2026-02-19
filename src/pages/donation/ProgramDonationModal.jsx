import { useEffect, useState } from "react";
import api from "./services/axiosInstance";
import "./donation.css";

export default function ProgramDonationModal({ program, onClose }) {

  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);

  /* ================= LOAD DONATIONS ================= */
  const load = async () => {
    if (!program) return;

    try {
      const res = await api.get(
        `/admin/donation/transactions/${program.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      const list = res.data || [];
      setDonations(list);

      const sum = list.reduce((a, b) => a + (b.amount || 0), 0);
      setTotal(sum);

    } catch (err) {
      console.error("Failed to load donations", err.response?.data || err);
    }
  };

  useEffect(() => {
    load();
  }, [program]);

  /* ================= VERIFY ================= */
  const verify = async (id, approved) => {
    try {
      await api.put(
        `/admin/donation/verify/${id}`,
        { approved },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      load();
    } catch {
      alert("Verification failed");
    }
  };

  /* ================= DOWNLOAD CERTIFICATE ================= */
 const downloadCertificate = async (id) => {

  const res = await api.get(
    `/admin/donation/certificate/download/${id}`,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
      }
    }
  );

  const blob = new Blob([res.data], { type: "application/pdf" });

  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `certificate-${id}.pdf`;
  link.click();
};



  /* ================= UPLOAD CERTIFICATE ================= */
  const uploadCertificate = async (txId, file) => {

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(
        `/admin/donation/certificate/upload/${txId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Certificate uploaded successfully");
      load();

    } catch {
      alert("Upload failed");
    }
  };

  if (!program) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">

        <span className="modal-close-x" onClick={onClose}>✕</span>

        <h2>{program.title}</h2>
        <h3>Total Raised: ₹{total}</h3>

        <table className="donation-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Admin Action</th>
            </tr>
          </thead>

          <tbody>
            {donations.length === 0 ? (
              <tr><td colSpan="4">No donations yet</td></tr>
            ) : (
              donations.map(d => (
                <tr key={d.id}>
                  <td>{d.name} ({d.phone})</td>
                  <td>₹{d.amount}</td>
                  <td>{d.status}</td>

                  <td>

                    {d.status === "PENDING" && (
                      <>
                        <button onClick={() => verify(d.id, true)}>Approve</button>
                        <button onClick={() => verify(d.id, false)}>Reject</button>
                      </>
                    )}

                    {d.status === "VERIFIED" && (
                      <>
                        <button onClick={() => downloadCertificate(d.id)}>
                          Download Certificate
                        </button>

                        <input
                          type="file"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) =>
                            uploadCertificate(d.id, e.target.files[0])
                          }
                        />
                      </>
                    )}

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}
