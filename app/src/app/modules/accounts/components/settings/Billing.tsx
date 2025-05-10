import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import { Content } from "../../../../../_gmbbuilder/layout/components/Content";
import { Col, Row } from "react-bootstrap";
import { ConvertToDateCurrentTimeZoneDate } from "../../../../../functions";
import { KTIcon } from "../../../../../_gmbbuilder/helpers";
const API_URL = import.meta.env.VITE_APP_NODE_API;

export function Billing() {
  const [loading, setLoading] = useState<any>(true);
  const [loadingBtn, setLoadingBtn] = useState<any>(false);
  const [isSubscribed, setIsSubscribed] = useState<any>(false);
  const [dataBilling, setDataBilling] = useState<any>(null);
  const fetchLinkPayment = (uid: string) => {
    axios
      .post(
        `${API_URL}/payment/check-payment`,
        {
          uid: uid,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        setDataBilling(response?.data);
        setLoading(false);
        setIsSubscribed(true);
      })
      .catch((error: any) => {
        if (error.response.status === 404) {
          setIsSubscribed(false);
        }
        console.error("Error fetching billing:", error);
        setLoading(false);
      });
  };
  const authData: any = localStorage.getItem("kt-auth-react-v");

  useEffect(() => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object

    fetchLinkPayment(parsedData?.uid);
  }, []);

  const fetchUpdateCard = (subsId: string) => {
    setLoadingBtn(true);
    axios
      .post(
        `${API_URL}/create-portal-session`,
        {
          subsId: subsId,
          returnUrl: "https://gmb-api.adelphalabs.com/account/billing",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        window.open(response?.data?.url, "_blank"); // Open the URL in a new window/tab
        setLoadingBtn(false);

        console.log("🚀 ~ .then ~ response:", response);
      })
      .catch((error: any) => {
        setLoadingBtn(false);
        console.error("Error fetching billing:", error);
      });
  };

  const [isPaymentSent, setIsPaymentSent] = useState(false);

  const fetchLinkPaymentPayNow = async () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    await axios
      .post(
        `${API_URL}/create-subscription-link?email=${parsedData?.email}&uid=${parsedData?.uid}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        const paymentUrl = response?.data?.url; // Assuming the URL field is called 'url'
        if (paymentUrl) {
          setIsPaymentSent(true);
          window.open(paymentUrl, "_blank"); // Open the URL in a new window/tab
        } else {
          setIsPaymentSent(true);
          console.error("Payment URL not found.");
        }
      })
      .catch((error: any) => {
        console.error("Error fetching payment link:", error);
      });
  };
  return (
    <Content>
      <div className="card mb-5 mb-xl-10">
        <div className="card-header border-0 cursor-pointer" role="button">
          <div className="card-title m-0 d-flex justify-content-between w-100">
            <h3 className="fw-bolder m-0">Billing</h3>
            <div>
              {!isSubscribed && (
                <button
                  className="btn btn-sm btn-info"
                  disabled={loadingBtn}
                  onClick={async (e) => {
                    e.preventDefault();
                    await fetchLinkPaymentPayNow();
                  }}
                  style={{ height: "fit-content" }}
                >
                  {loadingBtn ? "Please wait..." : "Pay now"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div id="kt_account_connected_accounts" className="collapse show">
          <div className="card-body border-top p-9">
            <div
              className={`py-2 d-flex justify-content-${
                loading ? "center" : "between"
              }`}
            >
              {dataBilling?.status != "active" && !loading && (
                <div className="d-flex justify-content-center">
                  <span className="fs-1 text-muted fw-bold">
                    <p className="fs-5 text-muted text-center">
                      You'll need a one-time payment of{" "}
                      <b className="text-primary fs-3">$499</b> for lifetime
                      access to places search.
                    </p>
                  </span>
                </div>
              )}
              {loading ? (
                <div className="d-flex justify-content-center">
                  <span className="fs-1 text-muted fw-bold">Loading...</span>
                </div>
              ) : !isSubscribed ? (
                "..."
              ) : (
                <Fragment>
                  <div>
                    <Row className="mb-4">
                      <Col className="d-flex flex-column">
                        <span className="fs-2 fw-bold">
                          {dataBilling.status == "active" &&
                            dataBilling.type == "lifetime" && (
                              <span className="text-default fw-bold mb-4 me-3 fs-2x">
                                Lifetime Access
                              </span>
                            )}
                          <span
                            style={{ borderRadius: "12px" }}
                            className={
                              (dataBilling?.status === "active" &&
                                !!dataBilling?.cancellationDate === false) ||
                              dataBilling?.status === "trialing"
                                ? "text-success border-dashed px-2 py-1 me-4"
                                : "text-danger border-dashed px-2 py-1 me-4"
                            }
                          >
                            {dataBilling?.status === "active" &&
                            !!dataBilling?.cancellationDate === false
                              ? "Active"
                              : "Canceled"}{" "}
                          </span>
                        </span>
                        {!!dataBilling?.purchaseDate && (
                          <span className="text-muted fs-5 mt-3">
                            <span className="text-default fw-bold me-2 align-items-center">
                              <KTIcon
                                iconName="calendar"
                                className="me-2 fs-4 mt-1"
                              />
                              Purchased on:
                            </span>
                            (
                            {ConvertToDateCurrentTimeZoneDate(
                              dataBilling?.purchaseDate
                            )}
                            )
                          </span>
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        {!!dataBilling?.nextPaymentDate && (
                          <span className="fs-2 fw-bold">
                            $67{" "}
                            <span className="text-muted fs-4">peer month</span>
                          </span>
                        )}
                      </Col>
                    </Row>
                  </div>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      </div>
    </Content>
  );
}
