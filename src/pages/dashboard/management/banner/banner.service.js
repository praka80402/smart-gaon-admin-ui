import axios from "axios";

const BASE_URL =
  "https://smartgaonadmin.duckdns.org/api/admin/event-banners";

// ======================
// GET ALL BANNERS
// ======================
export const getBanners = async () => {

  try {

    const token =
      localStorage.getItem(
        "adminToken"
      );

    const res = await axios.get(
      BASE_URL,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
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
      "Get Banners Error:",
      error
    );

    return [];

  }

};

// ======================
// GET BANNERS BY SECTION
// ======================
export const getBannersBySection =
  async (sectionType) => {

    try {

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const res = await axios.get(
        `${BASE_URL}/section?sectionType=${sectionType}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
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
        "Get Banner By Section Error:",
        error
      );

      return [];

    }

  };

// ======================
// CREATE BANNER
// ======================
export const createBanner =
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
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      return res.data;

    } catch (error) {

      console.error(
        "Create Banner Error:",
        error
      );

      throw error;

    }

  };

// ======================
// UPDATE BANNER
// ======================
export const updateBanner =
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
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      return res.data;

    } catch (error) {

      console.error(
        "Update Banner Error:",
        error
      );

      throw error;

    }

  };

// ======================
// DELETE BANNER
// ======================
export const deleteBanner =
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
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      return res.data;

    } catch (error) {

      console.error(
        "Delete Banner Error:",
        error
      );

      throw error;

    }

  };

// ======================
// GET SINGLE BANNER
// ======================
export const getBannerById =
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
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      return (
        res.data?.data ||
        res.data ||
        null
      );

    } catch (error) {

      console.error(
        "Get Banner By Id Error:",
        error
      );

      return null;

    }

  };