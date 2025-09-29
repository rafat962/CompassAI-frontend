import axiosInstance from "../inceptron/axiosInstance";
// -------------------- Send Message --------------------

const sendMessageApi = async (data) => {
    try {
        const response = await axiosInstance.post(
            "/compass-v1/SendQuery",
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

export { sendMessageApi };
