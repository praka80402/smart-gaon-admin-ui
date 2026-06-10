import axios from "axios";

const BASE_URL =
  "https://smartgaonadmin.duckdns.org/api/admin/sg-events";

// ======================
// GET ALL EVENTS
// ======================
export const getEvents = async () => {
  try {

    const token =
      localStorage.getItem("adminToken");

    const res = await axios.get(
      BASE_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return (
      res.data?.data ||
      res.data ||
      []
    );

  } catch (error) {

    console.error(
      "Get Events Error:",
      error
    );

    return [];

  }
};

// ======================
// GET EVENTS BY SECTION
// ======================
export const getEventsBySection =
  async (sectionType) => {

    try {

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const res =
        await axios.get(
          `${BASE_URL}/section?sectionType=${sectionType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      return (
        res.data?.data ||
        res.data ||
        []
      );

    } catch (error) {

      console.error(
        "Section Filter Error:",
        error
      );

      return [];

    }

  };

// ======================
// CREATE EVENT
// ======================
export const createEvent =
  async (formData) => {

    try {

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const res =
        await axios.post(
          BASE_URL,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      return res.data;

    } catch (error) {

      console.error(
        "Create Event Error:",
        error
      );

      throw error;

    }

  };

// ======================
// UPDATE EVENT
// ======================
export const updateEvent =
  async (id, formData) => {

    try {

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const res =
        await axios.put(
          `${BASE_URL}/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      return res.data;

    } catch (error) {

      console.error(
        "Update Event Error:",
        error
      );

      throw error;

    }

  };

// ======================
// DELETE EVENT
// ======================
export const deleteEvent =
  async (id) => {

    try {

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const res =
        await axios.delete(
          `${BASE_URL}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      return res.data;

    } catch (error) {

      console.error(
        "Delete Event Error:",
        error
      );

      throw error;

    }

  };

// ======================
// GET SINGLE EVENT
// ======================
export const getEventById =
  async (id) => {

    try {

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const res =
        await axios.get(
          `${BASE_URL}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      return (
        res.data?.data ||
        res.data
      );

    } catch (error) {

      console.error(
        "Get Event By Id Error:",
        error
      );

      return null;

    }

  };