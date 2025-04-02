import { Card, Col, Row } from "react-bootstrap";
// import { toAbsoluteUrl } from "../../../../_linkrocket/helpers";
import SVG from "react-inlinesvg";
import { useNavigate } from "react-router-dom";
// import { confirmEmail } from "../core/_requests";
import { useEffect, useState } from "react";
// import { toAbsoluteUrl } from "../../../PostNow/helpers";
// import { toAbsoluteUrl } from "../../../../PostNow/helpers";
import axios from "axios";
import Swal from "sweetalert2";
// import Payment2 from "../../../PostNow/global/stripe/Payment2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toAbsoluteUrl } from "../../../helpers";
// import { handleApiErrors } from "../../../PostNow/global/HandleApiErrors";

interface Message {
    title: string;
    message: string;
}
const BillingSchema = Yup.object().shape({
    cardName: Yup.string().required("Name On Card is required"),
});
export function ConnectSalesForce() {
    const navigate = useNavigate();
    const code: string | null = new URLSearchParams(window.location.search).get(
        "code"
    );
    const [message, setMessage] = useState<Message>({
        title: "LinkedIn Account Connected!",
        message: "You've successfully connected your LinkedIn account. Click the (View Published Posts) button below to access your published posts."
    });
    const [loading, setLoading] = useState<any>(null);
    const BASE_URL = import.meta.env.VITE_APP_API_URL;
    const [loadingAnalytics, setloadingAnalytics] = useState<any>(false);
    const [CheckError, setCheckError] = useState<any>(false);
    const authData: any = localStorage.getItem('kt-auth-react-v');
    const postData = async () => {
        const parsedData = JSON.parse(authData); // Convert JSON string to object
        const uid = parsedData?.uid; // Access the 'uid' property
        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/Integration/salesforce/auth?userId=${uid}`, {
                code: code,
            });
            if (response.status === 200) {
                setLoading(false);
                setCheckError(true)
                setMessage({
                    title: "Connection Successful",
                    message: "You have successfully connected with SalesForce. Click the button below to go to the listings and push your data to the CRM."
                });
            }
        } catch (error: any) {
            setCheckError(false)
            setMessage({
                title: "Connection Failed",
                message: "There was an error connecting to SalesForce. Please check your credentials and try again."
            });
        } finally {
            setLoading(false); // Hide loader
        }
    };
    useEffect(() => {
        if (code) {
            postData();
        }else{
            setCheckError(false)
            setLoading(false);
            setMessage({
                title: "Connection Failed",
                message: "There was an error connecting to SalesForce. Please check your credentials and try again."
            });
        }
    }, [code]);

    return (
        <div className="mb-20">
            <div className="d-flex justify-content-center p-5">
                <div className=''>
                    <img
                        alt='Logo'
                        src={toAbsoluteUrl('media/svg/brand-logos/Salesforce.svg')}
                        className='h-95px app-sidebar-logo-default'
                    />
                </div>
            </div>
            <div className="d-flex justify-content-center">
                <div className="cardCenter col-5">
                    <Row>
                        <Col>
                            <Card className="p-10 cardRadius">
                                {loading === false ? <>
                                    {CheckError === true ?
                                        <div className="d-flex justify-content-center mb-5">
                                            {CheckError === true ?
                                                <i className="ki-solid ki-check-square text-success fs-4x  pe-0"></i>
                                                :
                                                <i className="ki-solid ki-abstract-11  text-danger fs-4x mb-2 pe-0"></i>
                                            }
                                        </div> : <div className="d-flex justify-content-center mb-10">
                                            <i className="ki-solid ki-abstract-11 text-danger  fs-5x mb-2 pe-0"></i>

                                        </div>}
                                    <h1 className="text-center">{message.title}</h1>
                                    <span
                                        className="text-muted mb-5 text-center font-size-lg mt-5"
                                        style={{ fontSize: "1.2rem" }}
                                    >
                                        {message.message}
                                    </span>
                                    {CheckError === true && (
                                        <div className="w-100 d-flex justify-content-center">
                                            <div
                                                className="btn btn-outline btn-outline btn-outline-info btn-active-light-info mt-5 custom-width"
                                                onClick={() => {
                                                    navigate("/listings", { replace: true })
                                                }}
                                            >
                                                {loadingAnalytics === true ? (
                                                    <>
                                                        Please wait...
                                                        <div className="spinner-border spinner-border-sm align-middle fs-1"></div>
                                                    </>
                                                ) : (
                                                    <>


                                                        <span className="fs-4">Go to Listings</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}


                                </> : <div
                                    className="indicator text-gray-500 fs-1 w-100 text-center"
                                    style={{ display: "block" }}
                                >
                                    Please wait...
                                    <div className="spinner-border spinner-border-sm align-middle fs-1"></div>
                                </div>}

                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
}
