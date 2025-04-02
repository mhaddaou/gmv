import axios from "axios";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_gmbbuilder/helpers";

export function PaymentSuccess() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_APP_NODE_API;
  const [loading, setLoading] = useState(true);
  const [messageError, setMessageError] = useState("");

  const fetchLinkPayment = (email: string, sessionId: string) => {
    axios
      .post(
        `${API_URL}/store-payment`,
        {
          sessionId: sessionId,
          uid: email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        console.log("🚀 ~ .then ~ response:", response);
        setLoading(false);
      })
      .catch((error: any) => {
        setMessageError(error?.response?.data?.message);
        console.log("Error fetching payment link:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const searchValue = window.location.search.split("&session_id=");
    if (!!searchValue && searchValue.length > 1) {
      setTimeout(() => {
        fetchLinkPayment(searchValue[0]?.replace("?uid=", ""), searchValue[1]);
      }, 1500);
    } else {
      setMessageError("Invalid credentials for payment, Please try again ...");
      setLoading(false);
    }
  }, []);
  return (
    <div className="d-flex flex-column flex-lg-row flex-column-fluid h-100">
      {/* begin::Body */}
      <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
        {/* begin::Form */}
        <div className="d-flex flex-center flex-column flex-lg-row-fluid">
          {/* begin::Wrapper */}
          <div className="w-lg-500px p-7">
            <form
              className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
              noValidate
              id="kt_login_signup_form"
            >
              <div className="text-center mb-11">
                <div className="text-gray-500 fw-semibold fs-6">
                  WELCOME BACK
                </div>
                <h1 className="text-gray-900 fw-bolder mb-3">
                  Payment verification
                </h1>
              </div>

              <Row className="mb-10 mt-10">
                <Col>
                  {!loading ? (
                    !!messageError ? (
                      <p className="fs-5 text-danger fw-bold text-center">
                        {messageError}
                      </p>
                    ) : (
                      <p className="fs-5 text-success fw-bold text-center">
                        You payment has been submitted successfully.
                      </p>
                    )
                  ) : (
                    <p className="fs-2 text-muted text-center">
                      Please wait...
                    </p>
                  )}
                </Col>
              </Row>

              {/* begin::Form group */}
              <Link to="/auth/login">
                <button
                  disabled={loading}
                  type="button"
                  id="kt_login_signup_form_cancel_button"
                  className="btn btn-lg btn-info w-100 mb-5"
                >
                  Login
                </button>
              </Link>
            </form>
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Form */}

        {/* begin::Footer */}

        {/* end::Footer */}
      </div>
      {/* end::Body */}

      {/* begin::Aside */}
      <div
        className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
        style={{
          backgroundImage: `url(${toAbsoluteUrl("media/misc/auth-bg.png")})`,
        }}
      >
        {/* begin::Content */}
        <div className="d-flex flex-column flex-center py-15 px-5 px-md-15 w-100">
          {/* begin::Image */}
          <img
            className="mx-auto w-275px w-md-50 w-xl-200px mb-10 mb-lg-20"
            src={toAbsoluteUrl("media/logos/LogoWhite.svg")}
            alt=""
          />
          {/* end::Image */}

          {/* begin::Title */}
          <h1 className="text-white fs-2qx fw-bolder text-center mb-7">
            Streamline Listings & CRM
          </h1>
          {/* end::Title */}

          {/* begin::Text */}
          <div className="text-white fs-base text-center">
            Effortlessly manage your business listings and enhance CRM
            integration for seamless operations and improved connectivity.
          </div>
          {/* end::Text */}
        </div>
        {/* end::Content */}
      </div>
      {/* end::Aside */}
    </div>
  );
}
