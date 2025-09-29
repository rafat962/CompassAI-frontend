/* eslint-disable no-unused-vars */
import { Outlet } from "react-router-dom";

const ProtectedRoutes = () => {
    // const navigate = useNavigate();
    // const { verefytoken, isPending, data, error } = useVerfyToken();
    // const [status, setStatus] = useState(null);
    // useEffect(() => {
    //     verefytoken(); // Call once on mount
    // }, []);

    // useEffect(() => {
    //     if (data) {
    //         setStatus(data.status);
    //     }
    // }, [data]);
    // // Loading UI
    // if (isPending || status === null) {
    //     return (
    //         <Backdrop
    //             open
    //             sx={{
    //                 color: "#fff",
    //                 zIndex: (theme) => theme.zIndex.drawer + 1,
    //             }}
    //         >
    //             <CircularProgress color="inherit" />
    //         </Backdrop>
    //     );
    // }
    // Failed verification
    // if (status !== 200) {
    //     navigate("/");
    //     return null;
    // }

    // Success
    return <Outlet />;
};

export default ProtectedRoutes;
