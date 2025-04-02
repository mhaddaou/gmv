import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { KTIcon, toAbsoluteUrl } from "../../../helpers";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Props = {
    setShowCRM: any;
    ShowCRM: any;
    PlacesIds: any;
}
const PushToCRM: React.FC<Props> = ({
    setShowCRM,
    ShowCRM,
    PlacesIds,
}) => {
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const [CheckIntegrationConnect, setCheckIntegrationConnect] = useState<any>([]);
    const [IsLoading, setIsLoading] = useState<any>(false);
    const authData: any = localStorage.getItem('kt-auth-react-v');
    const navigate = useNavigate();

    const GetCheckConnect = () => {
        const parsedData = JSON.parse(authData); // Convert JSON string to object
        const uid = parsedData?.uid; // Access the 'uid' property
        console.log(uid)
        axios.get(
                `${API_URL}/Integration/list?userId=${uid}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response: any) => {
                console.log(response);
                setCheckIntegrationConnect(response?.data)
            })
            .finally(() => {
            });
    };
    const GetHubSpotLink = () => {
        setIsLoading(true)
        axios
            .get(
                `${API_URL}/Integration/hubspot/url`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response: any) => {
                window.open(response?.data, "_blank");
                setIsLoading(false)
            })
            .catch((error: any) => {
            })
            .finally(() => {
                setIsLoading(false)
            });
    };
    const PuttDisconecte = () => {
        const parsedData = JSON.parse(authData); // Convert JSON string to object
        const uid = parsedData?.uid; // Access the 'uid' property
        setIsLoading(true)
        axios
            .put(
                `${API_URL}/Integration/unlinked?name=hubspot&userId=${uid}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response: any) => {
                window.open(response?.data, "_blank");
                setIsLoading(false)
            })
            .catch((error: any) => {
            })
            .finally(() => {
                setIsLoading(false)
            });
    };
    useEffect(() => {
    //  PuttDisconecte()
        GetCheckConnect()
    }, [])
    return (
        <Modal
            show={ShowCRM}
            onHide={() => setShowCRM(false)}
            size="xl"
            dialogClassName="modal-dialog modal-fixed-right"
            contentClassName="modal-content"
        >
            <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-lg">
                    <span className="text-primary mt-2">SalesForce Connection</span>
                    {/* <span className="fs-6 text-gray-500">
                        Choose integration platforms to import contact list{" "}
                    </span> */}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <>
                    {/* <div className="col-12 mb-5">
                        <div className="d-flex justify-content-between align-items-center  bg-gray-100 bg-opacity-70 rounded-2 px-6 py-5">
                            <div className="fs-1 fw-bolder">CSV</div>
                            <div className="m-0">
                                <span
                                    onClick={() => {
                                        //   handleCloseConnect();
                                        //   handleShow();
                                    }}
                                    className="btn btn-outline  btn-primary btn-active-light-primary"
                                >
                                    <KTIcon iconName="exit-up" className="fs-2 me-2" /> Import
                                </span>
                            </div>
                        </div>
                    </div> */}

                    <div className="col-12 mb-5" >
                        <div className="d-flex justify-content-between  bg-gray-100 bg-opacity-70 rounded-2 px-6 py-5 mb-5">
                            <div className="d-flex">
                                <img
                                    src={toAbsoluteUrl("media/svg/brand-logos/hubspot.svg")}
                                    className="w-40px me-6"
                                    alt=""
                                />

                                <div className="d-flex flex-column">
                                    <a
                                        href="#"
                                        className="fs-5 text-gray-900 text-hover-info fw-bolder"
                                    >
                                        Hubspot
                                    </a>
                                    <div className="fs-6 fw-bold text-gray-500">
                                        Marketing, sales, and service platform that helps companies
                                        to convert leads and mote.{" "}
                                    </div>
                                </div>
                            </div>
                            <div className="m-0 d-flex align-items-center cursor-pointer">
                                <button 
                                disabled={IsLoading}
                                className="btn btn-primary"
                                onClick={()=>{
                                    if(CheckIntegrationConnect[0]?.active  === false){
                                        GetHubSpotLink()
                                    }
                                }}
                                >
                                    <KTIcon
                                         iconName={CheckIntegrationConnect[0]?.active ? "exit-up" : "share"}
                                        className="fs-2 me-2"
                                    />{" "}
                                    {IsLoading === false ?
                                    <span>
                                    {CheckIntegrationConnect[0]?.active === true ?"Push To CRM":"Connect"}
                               </span> :
                               <span>Please wait...</span>
                                }
                                    
                                </button>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between  bg-gray-100 bg-opacity-70 rounded-2 px-6 py-5">
                            <div className="d-flex">
                                <img
                                    src={toAbsoluteUrl("media/svg/brand-logos/Salesforce.svg")}
                                    className="w-55px me-6"
                                    alt=""
                                />

                                <div className="d-flex flex-column">
                                    <a
                                        href="#"
                                        className="fs-5 text-gray-900 text-hover-info fw-bolder"
                                    >
                                        Salesforce
                                    </a>
                                    <div className="fs-6 fw-bold text-gray-500">
                                        Cloud-based software designed to help businesses find more
                                        prospects, close more deals.
                                    </div>
                                </div>
                            </div>
                            <div className="m-0 d-flex align-items-center cursor-pointer">
                                <button className="btn btn-primary">
                                    <KTIcon
                                        // iconName={s?.active ? "exit-up" : "share"}
                                        iconName={"share"}
                                        className="fs-2 me-2"
                                    />{" "}
                                    <span>
                                        Connect
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            </Modal.Body>
            <Modal.Footer>
                <div className="text-centre">
                    <button
                        type="reset"
                        onClick={() => {
                            setShowCRM(false);
                        }}
                        className="btn btn-light"
                        data-kt-users-modal-action="cancel"
                    >
                        Close
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default PushToCRM;