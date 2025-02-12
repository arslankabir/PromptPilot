import axios from "axios";

export const instance = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}`
});

export const instance1 = axios.create({
  baseURL: `${process.env.REACT_APP_OPENAI_API_URL}`,
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
  }
});

export const keapinstance = axios.create({
  baseURL: `${process.env.REACT_APP_KEAP_API_URL}`,
  headers: {
    "X-Keap-API-Key": process.env.REACT_APP_KEAP_API_KEY,
    "Content-Type": "application/json"
  }
});
