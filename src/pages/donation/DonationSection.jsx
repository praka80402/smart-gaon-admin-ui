import { useEffect, useState } from "react";
import api from "./services/axiosInstance";
// import "../../styles/donation.css";

export default function DonationSection({ type }) {

  const [donations, setDonations] = useState([]);

  useEffect(() => {
    loadDonations();
  }, [type]);

  const loadDonations = async () => {
    try {
      const res = await api.get("/transactions/" + type);
      setDonations(res.data);
    } catch (err) {
      console.error("Failed to load donations", err);
    }
  };

  const verifyDonation = async (id, approved) => {
    try {
      await api.put("/verify/" + id, { approved });
      loadDonations();
    } catch {
      alert("Verification failed");
    }
  };

  const assignBadge = async (id) => {
    const badge = prompt("Enter badge name");
    if (!badge) return;

    try {
      await api.post("/reward/" + id, { badgeName: badge });
      alert("Badge Assigned Successfully");
      loadDonations();
    } catch {
      alert("Failed to assign badge");
    }
  };

  return (
    <div className="donation-card">
      <h3>{type === "PROJECT" ? "Project Donations" : "Program Donations"}</h3>

      <table className="donation-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Campaign</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {donations.length === 0 && (
            <tr>
              <td colSpan="5">No donations yet</td>
            </tr>
          )}

          {donations.map((d) => (
            <tr key={d.id}>
              <td>
                {d.user?.firstName} {d.user?.lastName}
              </td>
              <td>{d.campaign?.title}</td>
              <td>₹{d.amount}</td>

              <td className={
                d.status === "VERIFIED"
                  ? "green"
                  : d.status === "REJECTED"
                  ? "red"
                  : ""
              }>
                {d.status}
              </td>

              <td>
                {d.status === "PENDING" && (
                  <>
                    <button
                      className="approve"
                      onClick={() => verifyDonation(d.id, true)}
                    >
                      Approve
                    </button>

                    <button
                      className="reject"
                      onClick={() => verifyDonation(d.id, false)}
                    >
                      Reject
                    </button>
                  </>
                )}

                {d.status === "VERIFIED" && (
                  <button
                    className="badge"
                    onClick={() => assignBadge(d.id)}
                  >
                    Assign Badge
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
