import axiosInstance from "../inceptron/axiosInstance";
// -------------------- Send Message --------------------

const sendMessageApi = async (data) => {
    try {
        const response = await axiosInstance.post(
            "/compass-v2/SendQuery",
            data
        );
        return response.data;
    } catch (err) {
        // Optionally handle errors here
        if (err.response) {
            return err.response.data; // if backend sends structured err
        }
        throw err; // otherwise rethrow
    }
};
const getLayerFieldsApi = async (data) => {
    try {
        console.log("getLayerFieldsApi called with data:", data);
        const response = await axiosInstance.post(
            "/compass-v2/GetLayerFields",
            data
        );
        console.log("response from getLayerFieldsApi", response);
        return response.data;
    } catch (err) {
        console.log("error in getLayerFieldsApi", err);
        // Optionally handle errors here
        if (err.response) {
            return err.response.data; // if backend sends structured err
        }
        throw err; // otherwise rethrow
    }
};

export { sendMessageApi, getLayerFieldsApi };
