import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const fetchCharts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/charts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching charts:", error);
    throw error;
  }
};

interface ChartData {
  title: string;
  description: string;
  data: any[]; // Replace 'any[]' with a more specific type if possible
}

export const createChart = async (chartData: ChartData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/charts`, chartData);
    return response.data;
  } catch (error) {
    console.error("Error creating chart:", error);
    throw error;
  }
};
