
import React, { useEffect, useState } from 'react'
import { KTIcon, toAbsoluteUrl } from '../../../../../../_gmbbuilder/helpers'
import { connectedAccounts, IConnectedAccounts } from '../SettingsModel'
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useAuth } from '../../../../auth'
import { db } from '../../../../../firebase';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal } from "react-bootstrap";
import Skeleton from 'react-loading-skeleton';
import SVG from "react-inlinesvg";
import Swal from "sweetalert2";
import { toast } from 'react-toastify'

const ConnectedAccounts: React.FC = () => {
  const [data, setData] = useState<IConnectedAccounts>(connectedAccounts)
  const { currentUser } = useAuth();
  const [ShowSales, setShowSales] = useState(false);
  const [isShowPassword, setShowPassword] = useState(false);
  const [isShowSecret, setIsShowSecret] = useState(false);
  const [loading, setLoading] = useState(false)
  const [hubspotKey, setHubspotKey] = useState("");
  const [salesForceKey, setSalesForceKey] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const updateData = (fieldsToUpdate: Partial<IConnectedAccounts>) => {
    const updatedData = { ...data, ...fieldsToUpdate }
    setData(updatedData)
  }
  const isActiveByTitle = (items: any, title: string): boolean => {
    const item = items?.find((item: any) => item.title === title);
    return item ? item.active : false;
  };
  const click = () => {
    setLoading(true);
    saveIntegration("hubspot", hubspotKey);
    saveIntegration("salesforce", salesForceKey);
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleUnlinked = async (name:string) => {
    // apiCall({
    //   method: "PUT",
    //   link: `/api/Integrations/unlinked?name=${name}`,
    // }).then((data) => {
    //   if (data[0] === 200) {
    //     handleGetList();
    //     Swal.fire({
    //       icon: "success",
    //       title: "Success",
    //       text: "Your account has been unlinked successfully",
    //     }).then(() => {
    //       history.push("/settings/integrations");
    //     });
    //   }
    // });
  };
  async function getData(setState: any, title: string) {
    try {
      const userDocRef = doc(
        db,
        "integrations",
        `${currentUser?.uid}-${title}`
      );
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setState(userDoc?.data()?.apiKey);
      }
    } catch (err) { }
  }

  useEffect(() => {
    getData(setHubspotKey, "hubspot");
    getData(setSalesForceKey, "salesforce");
  }, []);
  //function save integration to firebase
  const saveIntegration = async (integration: string, apiKey: string) => {
    try {
      // Save additional user information in the Firestore "users" collection
      await setDoc(
        doc(db, "integrations", `${currentUser?.uid}-${integration}`),
        {
          name: integration,
          userId: currentUser?.uid,
          apiKey: apiKey,
          enabled: true,
          createdAt: new Date(),
        }
      );
    } catch (error) {
      throw error;
    }
  };
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [CheckIntegrationConnect, setCheckIntegrationConnect] = useState<any>([]);
  const [IsLoadingGoHighLevel, setIsLoadingGoHighLevel] = useState<any>(false);
  const [IsLoading, setIsLoading] = useState<any>(false);
  const [IsLoadingSales, setIsLoadingSales] = useState<any>(false);
  const authData: any = localStorage.getItem('kt-auth-react-v');
  const [IsLoadingDataCheck, setIsLoadingDataCheck] = useState<any>(true);
  const navigate = useNavigate();
  const GetCheckConnect = () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    axios.get(
      `${API_URL}/Integration/list?userId=${uid}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response: any) => {
        setIsLoadingDataCheck(false)
        setCheckIntegrationConnect(response?.data)
      })
      .finally(() => {
        setIsLoadingDataCheck(false)
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
  const GetSalesForceLink = () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    setIsLoadingSales(true)
    axios
      .get(
        `${API_URL}/Integration/salesforce/url?userId=${uid}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        window.open(response?.data?.url, "_blank");
        setIsLoadingSales(false)
      })
      .catch((error: any) => {
      })
      .finally(() => {
        setIsLoadingSales(false)
      });
  };
  const disconnectGoHighLevel = () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    setIsLoadingGoHighLevel(true)
    axios
      .put(
        `${API_URL}/Integration/unlinked?name=GoHighLevel&userId=${uid}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        GetCheckConnect();
        setIsLoadingGoHighLevel(false)
      })
      .catch((error: any) => {
      })
      .finally(() => {
        setIsLoadingGoHighLevel(false)
      });
  };

  const authGoHighLevel = () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    setIsLoadingGoHighLevel(true)
    axios
      .post(
        `${API_URL}/Integration/GoHighLevel/auth?userId=${uid}`,
        {
          token: apiKeyValue
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        toast.success("You api key has been submitted successfully");
        GetCheckConnect();

        setIsLoadingGoHighLevel(false)
      })
      .catch((error: any) => {
        console.log("🚀 ~ authGoHighLevel ~ error:", error)
        toast.error(error?.response?.data?.message ?? "Error occurred, please try again");

      })
      .finally(() => {
        setIsLoadingGoHighLevel(false)
      });
  };
  useEffect(() => {
    //  PuttDisconecte()
    GetCheckConnect()
  }, [])
  return (
    <div className="card mb-5 mb-xl-10">
      <div
        className="card-header border-0 cursor-pointer"
        role="button"
        data-bs-toggle="collapse"
        data-bs-target="#kt_account_connected_accounts"
        aria-expanded="true"
        aria-controls="kt_account_connected_accounts"
      >
        <div className="card-title m-0">
          <h3 className="fw-bolder m-0">Integrations</h3>
        </div>
      </div>

      <div id="kt_account_connected_accounts" className="collapse show">
        <div className="card-body border-top p-9">
          <div className="py-2">
            <div className="d-flex justify-content-between  rounded-2 p mt-5">
              <div className="d-flex">
                <img
                  src={toAbsoluteUrl("media/svg/brand-logos/Gohighlevel.svg")}
                  className="w-55px me-6"
                  alt=""
                />

                <div className="d-flex flex-column">
                  <a
                    href="#"
                    className="fs-5 text-gray-900 text-hover-info fw-bolder"
                  >
                    GoHighLevel
                  </a>
                  <div className="fs-6 fw-bold text-gray-500">
                    Cloud-based software designed to help businesses find more
                    prospects, close more deals.
                  </div>
                </div>
              </div>
              {/* {list.length > 0 &&
              list.find((e) => e?.title === "GoHighLevel")?.active ? ( */}
              {isActiveByTitle(CheckIntegrationConnect, "GoHighLevel") ===
              true ? (
                <div>
                  <button
                    type="button"
                    className={"btn btn-danger px-5"}
                    onClick={() => {
                      Swal.fire({
                        title: "Are you sure?",
                        text: "You want to unlink this account!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Yes, unlink it!",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          disconnectGoHighLevel();
                        }
                      });
                    }}
                    disabled={IsLoadingGoHighLevel}
                  >
                    {IsLoadingGoHighLevel ? "Please wait" : "Unlink"}
                  </button>
                </div>
              ) : (
                <div className="d-flex justify-content-between">
                  <div className="input-group me-5">
                    <input
                      type={isShowPassword ? "text" : "password"}
                      value={apiKeyValue}
                      className="form-control input-custom"
                      placeholder="API Key"
                      style={{ paddingRight: "3.2rem" }}
                      onChange={(e) => {
                        var value = e.target.value;
                        setApiKeyValue(value);
                      }}
                    />
                    <span
                      style={{ zIndex: "222" }}
                      className="eyePassword align-self-center cursor-pointer bg-transparent ms-1"
                      onClick={(e) => setShowPassword(!isShowPassword)}
                    >
                      {!isShowPassword ? (
                        <SVG
                          src={toAbsoluteUrl(
                            "media/svg/settings/eye-solid.svg"
                          )}
                        />
                      ) : (
                        <SVG
                          src={toAbsoluteUrl(
                            "media/svg/settings/eye-slash-solid.svg"
                          )}
                        />
                      )}
                    </span>
                  </div>
                  <div
                    className="m-0 d-flex cursor-pointer"
                    style={{ width: "70%" }}
                  >
                    <button
                      className="btn Gradient ml-4 w-100"
                      disabled={!!apiKeyValue === false || IsLoadingGoHighLevel}
                      style={{ height: "fit-content" }}
                      onClick={(e) => {
                        e.preventDefault();
                        authGoHighLevel();
                      }}
                    >
                      {!IsLoadingGoHighLevel ? "Save" : "Please wait"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="separator separator-dashed my-8"></div>

            <div className="d-flex justify-content-between  rounded-2 p mt-5">
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
              {IsLoadingDataCheck === true ? (
                <div className="m-0 d-flex align-items-center cursor-pointer">
                  <Skeleton width={120} height={40} />
                </div>
              ) : (
                <div className="m-0 d-flex align-items-center cursor-pointer">
                  {isActiveByTitle(CheckIntegrationConnect, "SalesForce") ===
                  false ? (
                    <button
                      disabled={IsLoadingSales}
                      className="btn Gradient"
                      onClick={() => {
                        GetSalesForceLink();
                      }}
                    >
                      <KTIcon
                        iconName={"share"}
                        className="fs-2 me-2 text-white"
                      />{" "}
                      {IsLoadingSales === false ? (
                        <span>Connect</span>
                      ) : (
                        <span>Please wait...</span>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-link btn-color-info"
                    >
                      Connected{" "}
                      <i className="ki-outline ki-check-circle fs-1 "></i>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="separator separator-dashed my-8"></div>

            <div className="d-flex justify-content-between  rounded-2 p mt-5">
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

              {IsLoadingDataCheck === true ? (
                <div className="m-0 d-flex align-items-center cursor-pointer">
                  <Skeleton width={120} height={40} />
                </div>
              ) : (
                <div className="m-0 d-flex align-items-center cursor-pointer">
                  {isActiveByTitle(CheckIntegrationConnect, "HubSpot") ===
                  false ? (
                    <button
                      disabled={IsLoading}
                      className="btn Gradient"
                      onClick={() => {
                        if (
                          isActiveByTitle(
                            CheckIntegrationConnect,
                            "HubSpot"
                          ) === false
                        ) {
                          GetHubSpotLink();
                        }
                      }}
                    >
                      <KTIcon
                        iconName={
                          isActiveByTitle(CheckIntegrationConnect, "HubSpot")
                            ? ""
                            : "share"
                        }
                        className="fs-2 me-2 text-white"
                      />{" "}
                      {IsLoading === false ? (
                        <span>
                          {isActiveByTitle(
                            CheckIntegrationConnect,
                            "HubSpot"
                          ) === true
                            ? "Connected"
                            : "Connect"}
                        </span>
                      ) : (
                        <span>Please wait...</span>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-link btn-color-info"
                    >
                      Connected{" "}
                      <i className="ki-outline ki-check-circle fs-1 "></i>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <Modal
          show={ShowSales}
          onHide={() => setShowSales(false)}
          size="lg"
          dialogClassName="modal-dialog modal-fixed-right"
          contentClassName="modal-content"
        >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-lg">
              <img
                src={toAbsoluteUrl("media/svg/brand-logos/Salesforce.svg")}
                className="w-45px me-3"
                alt=""
              />{" "}
              <span className="text-primary mt-2">SalesForce Connection</span>
              {/* <span className="fs-6 text-gray-500">
                        Choose integration platforms to import contact list{" "}
                    </span> */}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <>
              <div className="row">
                <div className="col-xl-6 mb-5">
                  <label className="form-label fw-semibold mb-3">Api Key</label>
                  <div className="input-group">
                    <input
                      type={isShowPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Api Key"
                    />
                    <span
                      className="input-group-text align-self-center cursor-pointer bg-white"
                      onClick={(e) => setShowPassword(!isShowPassword)}
                    >
                      {!isShowPassword ? (
                        <i className="ki-duotone ki-eye-slash fs-1">
                          <span className="path1" />
                          <span className="path2" />
                          <span className="path3" />
                          <span className="path4" />
                        </i>
                      ) : (
                        <i className="ki-duotone ki-eye fs-1">
                          <span className="path1" />
                          <span className="path2" />
                          <span className="path3" />
                        </i>
                      )}
                    </span>
                  </div>
                </div>
                <div className="col-xl-6 mb-5">
                  <label className="form-label fw-semibold mb-3">
                    Secret Key
                  </label>
                  <div className="input-group">
                    <input
                      type={isShowSecret ? "text" : "password"}
                      className="form-control"
                      placeholder="Api Key"
                    />
                    <span
                      className="input-group-text align-self-center cursor-pointer bg-white"
                      onClick={(e) => setIsShowSecret(!isShowSecret)}
                    >
                      {!isShowSecret ? (
                        <i className="ki-duotone ki-eye-slash fs-1">
                          <span className="path1" />
                          <span className="path2" />
                          <span className="path3" />
                          <span className="path4" />
                        </i>
                      ) : (
                        <i className="ki-duotone ki-eye fs-1">
                          <span className="path1" />
                          <span className="path2" />
                          <span className="path3" />
                        </i>
                      )}
                    </span>
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
                  setShowSales(false);
                }}
                className="btn btn-light"
                data-kt-users-modal-action="cancel"
              >
                Close
              </button>
              <button onClick={click} className="btn btn-info ms-5">
                {!loading && "Save Changes"}
                {loading && (
                  <span
                    className="indicator-progress"
                    style={{ display: "block" }}
                  >
                    Please wait...{" "}
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                )}
              </button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export { ConnectedAccounts }
