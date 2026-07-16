import { api } from "./config";

export const getStates = () => api.get("/api/location/states");

export const getDistricts = (stateId) =>
  api.get("/api/location/districts", { params: { stateId } });

export const getPincodes = (districtId) =>
  api.get("/api/location/pincodes", { params: { districtId } });