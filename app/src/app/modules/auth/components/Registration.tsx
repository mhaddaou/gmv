import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { getUserByToken, register } from "../core/_requests";
import { Link, useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_gmbbuilder/helpers";
import { PasswordMeterComponent } from "../../../../_gmbbuilder/assets/ts/components";
import { useAuth } from "../core/Auth";
import {
  ApiAuth,
  registerWithEmailAndPassword,
} from "../../../firebase/functions";
import { Col, Modal, Row } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const initialValues = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  changepassword: "",
  acceptTerms: false,
};

const registrationSchema = Yup.object().shape({
  firstname: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("First name is required"),
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  lastname: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Last name is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
  changepassword: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password confirmation is required")
    .oneOf([Yup.ref("password")], "Password and Confirm Password didn't match"),
  acceptTerms: Yup.bool().required("You must accept the terms and conditions"),
});

export function Registration() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_APP_NODE_API;
  const [emailValue, setEmailValue] = useState("");
  const [uidValue, setUidValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { saveAuth, setCurrentUser } = useAuth();
  const [showTerms, setShowTerms] = useState(false)
  const handleCloseTerms = () => setShowTerms(false)
  const handleShowTerms = () => setShowTerms(true)
  const [isPaymentSent, setIsPaymentSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [TermsContent, setTermsContent] = useState(false)

  const handleImportContacts = () => {
    setIsLoading(true);
    axios
      .get(
        `${API_URL}/terms`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        console.log(response?.data?.value)
        setTermsContent(response?.data?.value?.replace(/\\n/g, "\n"))
      })
      .catch((error: any) => {
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchLinkPayment = (email: string, uid: string) => {
    axios
      .post(
        `${API_URL}/create-subscription-link?email=${email}&uid=${uid}`,
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
  
  const postEmailSuccess = async (data:any) => {
    await axios
      .post(`${API_URL}/send-email`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response: any) => {})
      .catch((error: any) => {})
      .finally(() => {});
  };
  useEffect(()=>{handleImportContacts()},[])
  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        const data: ApiAuth = {
          email: values.email,
          firstName: values.firstname,
          lastName: values.lastname,
          password: values.password,
          profilePicture: "",
        };
        var user = await registerWithEmailAndPassword(data);
        if(!!user.user.uid){
          await postEmailSuccess({
            email: values.email,
            firstName: values.firstname,
            lastName: values.lastname,
          });
          setSubmitting(false);
          setLoading(false);  
          toast.success("Your account has been registered successfully");
          navigate("/auth/login");
        }else {
          toast.error("Error occurred, please try again");
          setSubmitting(false);
          setLoading(false);  
        }
      } catch (error) {
        console.error(error);
        saveAuth(undefined);
        setStatus("The registration details is incorrect");
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    PasswordMeterComponent.bootstrap();
  }, []);

  return (
    <form
      className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
      noValidate
      id="kt_login_signup_form"
      onSubmit={formik.handleSubmit}
    >
      <div className="text-center mb-11">
        <div className="text-gray-500 fw-semibold fs-6">WELCOME BACK</div>
        <h1 className="text-gray-900 fw-bolder mb-3">Sign up</h1>
      </div>

      <div className={step === 1 ? "" : "d-none"}>
        {/* begin::Form group Firstname */}
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 mb-8">
            <input
              placeholder="First name"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps("firstname")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.firstname && formik.errors.firstname,
                },
                {
                  "is-valid":
                    formik.touched.firstname && !formik.errors.firstname,
                }
              )}
            />
            {formik.touched.firstname && formik.errors.firstname && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.firstname}</span>
                </div>
              </div>
            )}
          </div>
          {/* end::Form group */}
          <div className="col-xl-6 col-lg-6 col-md-12 mb-8">
            {/* begin::Form group Lastname */}
            <input
              placeholder="Last name"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps("lastname")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.lastname && formik.errors.lastname,
                },
                {
                  "is-valid":
                    formik.touched.lastname && !formik.errors.lastname,
                }
              )}
            />
            {formik.touched.lastname && formik.errors.lastname && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.lastname}</span>
                </div>
              </div>
            )}
            {/* end::Form group */}
          </div>
        </div>

        {/* begin::Form group Email */}
        <div className="fv-row mb-8">
          <input
            placeholder="Email"
            type="email"
            autoComplete="off"
            {...formik.getFieldProps("email")}
            className={clsx(
              "form-control bg-transparent",
              { "is-invalid": formik.touched.email && formik.errors.email },
              {
                "is-valid": formik.touched.email && !formik.errors.email,
              }
            )}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">
                <span role="alert">{formik.errors.email}</span>
              </div>
            </div>
          )}
        </div>
        {/* end::Form group */}

        {/* begin::Form group Password */}
        <div className="fv-row mb-8" data-kt-password-meter="true">
          <div className="mb-1">
            <div className="position-relative mb-3">
              <input
                type="password"
                placeholder="Password"
                autoComplete="off"
                {...formik.getFieldProps("password")}
                className={clsx(
                  "form-control bg-transparent",
                  {
                    "is-invalid":
                      formik.touched.password && formik.errors.password,
                  },
                  {
                    "is-valid":
                      formik.touched.password && !formik.errors.password,
                  }
                )}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    <span role="alert">{formik.errors.password}</span>
                  </div>
                </div>
              )}
            </div>
            {/* begin::Meter */}
            <div
              className="d-flex align-items-center mb-3"
              data-kt-password-meter-control="highlight"
            >
              <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
              <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
              <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
              <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px"></div>
            </div>
            {/* end::Meter */}
          </div>
          <div className="text-muted">
            Use 8 or more characters with a mix of letters, numbers & symbols.
          </div>
        </div>
        {/* end::Form group */}

        {/* begin::Form group Confirm password */}
        <div className="fv-row mb-5">
          <input
            type="password"
            placeholder="Password confirmation"
            autoComplete="off"
            {...formik.getFieldProps("changepassword")}
            className={clsx(
              "form-control bg-transparent",
              {
                "is-invalid":
                  formik.touched.changepassword && formik.errors.changepassword,
              },
              {
                "is-valid":
                  formik.touched.changepassword &&
                  !formik.errors.changepassword,
              }
            )}
          />
          {formik.touched.changepassword && formik.errors.changepassword && (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">
                <span role="alert">{formik.errors.changepassword}</span>
              </div>
            </div>
          )}
        </div>
        <div className="fv-row mb-5"></div>

        {/* end::Form group */}

        {/* begin::Form group */}
        <div className="fv-row mb-8">
          <label
            className="form-check form-check-inline"
            htmlFor="kt_login_toc_agree"
          >
            <input
              className="form-check-input"
              type="checkbox"
              id="kt_login_toc_agree"
              {...formik.getFieldProps("acceptTerms")}
            />
            <span>
              I Accept the{" "}
              <span
                className="ms-1 link-info cursor-pointer"
                onClick={() => {
                  handleShowTerms();
                }}
              >
                Terms
              </span>
              .
            </span>
          </label>
          {formik.touched.acceptTerms && formik.errors.acceptTerms && (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">
                <span role="alert">{formik.errors.acceptTerms}</span>
              </div>
            </div>
          )}
        </div>
        {/* end::Form group */}
      </div>
      <div className={step === 2 ? "mb-10" : "d-none"}>
        <Row>
          <Col>
            {isPaymentSent ? (
              <p className="fs-5 text-success fw-bold text-center">
                Complete your payment on Stripe website.
              </p>
            ) : (
              <p className="fs-5 text-muted text-center">
                you'll need a one-time payment of{" "}
                <b className="text-primary fs-3">$499</b> for lifetime access to
                places search.
              </p>
            )}
          </Col>
        </Row>
      </div>

      {/* begin::Form group */}
      {!isPaymentSent ? (
        <div className="d-flex justify-content-between">
          <Link to="/auth/login">
            <button
              type="button"
              id="kt_login_signup_form_cancel_button"
              className="btn btn-lg btn-light-info w-100 mb-5"
            >
              Cancel
            </button>
          </Link>
          <button
            type="button"
            id="kt_sign_up_submit"
            className="btn btn-lg btn-info w-100 mb-5 ms-4"
            onClick={async (e) => {
              e.preventDefault();
              if (step === 1) {
                setLoading(true);
                const data: ApiAuth = {
                  email: formik.values.email,
                  firstName: formik.values.firstname,
                  lastName: formik.values.lastname,
                  password: formik.values.password,
                  profilePicture: "",
                };
                var user = await registerWithEmailAndPassword(data);
                if (!!user.user.uid) {
                  await postEmailSuccess({
                    email: formik.values.email,
                    firstName: formik.values.firstname,
                    lastName: formik.values.lastname,
                  });
                  setLoading(false);
                  setEmailValue(formik.values.email);
                  setUidValue(user.user.uid);
                  toast.success(
                    "Your account has been registered successfully"
                  );
                } else {
                  setEmailValue("");
                  setUidValue("");
                  toast.error("Error occurred, please try again");
                  setLoading(false);
                }
                setStep(2);
                setLoading(false);
              } else {
                fetchLinkPayment(emailValue, uidValue);
              }
            }}
            disabled={
              loading ||
              formik.isSubmitting ||
              !formik.isValid ||
              !formik.values.acceptTerms
            }
          >
            {!loading && (
              <span className="indicator-label">
                {step === 1 ? "Next" : "Pay now"}
              </span>
            )}
            {loading && (
              <span className="indicator-progress" style={{ display: "block" }}>
                Please wait...{" "}
                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
              </span>
            )}
          </button>
        </div>
      ) : (
        <Link to="/auth/login">
          <button
            type="button"
            id="kt_login_signup_form_cancel_button"
            className="btn btn-lg btn-info w-100 mb-5"
          >
            Login
          </button>
        </Link>
      )}
      {/* end::Form group */}
      <Modal show={showTerms} onHide={handleCloseTerms} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Terms & Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pb-2">
          <div className="scroll-y me-n5 pe-5 h-lg-650px h-auto">
            {!!TermsContent === true && (
              <div dangerouslySetInnerHTML={{ __html: TermsContent }} />
            )}
          </div>
        </Modal.Body>
      </Modal>
    </form>
  );
}
