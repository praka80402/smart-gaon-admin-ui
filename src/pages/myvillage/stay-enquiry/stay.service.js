import axios from "axios";

const BASE_URL = "https://smartgaon.duckdns.org";

export const getStayEnquiries = async () => {
  const res = await axios.get(`${BASE_URL}/api/enquiries`);
  return res.data;
};