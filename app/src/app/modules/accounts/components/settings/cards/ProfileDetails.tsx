import React, { useEffect, useState } from 'react'
import { toAbsoluteUrl } from '../../../../../../_gmbbuilder/helpers'
import { IProfileDetails, IProfileDetailsFirebase, profileDetailsInitValues as initialValues } from '../SettingsModel'
import * as Yup from 'yup'
import { FormikValues, useFormik } from 'formik'
import { useAuth } from '../../../../auth'
import { getUserFirebase, updateUserFirebase, uploadProfilePicture } from '../../../../../firebase/functions'
import Swal from "sweetalert2";
import { toast } from 'react-toastify'

const profileDetailsSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().required('Email is required'),
})
const initialValuesFirebase: any = {
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  profilePicture: "",
};
const ProfileDetails: React.FC = () => {
  const { currentUser, logout, setCurrentUser } = useAuth();
  const [dataProfile, setDataProfile] = useState<any>({
    image: "",
    file: "",
  });
  const [data, setData] = useState<FormikValues>(initialValuesFirebase)
  const updateData = (fieldsToUpdate: Partial<IProfileDetails>): void => {
    const updatedData = Object.assign(data, fieldsToUpdate)
    setData(updatedData)
  }

  const [loading, setLoading] = useState(false)
  const formik = useFormik<any>({
    initialValuesFirebase,
    validationSchema: profileDetailsSchema,
    onSubmit: (values) => {
      setLoading(true)
      setTimeout(async () => {
        // change profile picture
        if(!!dataProfile?.file) await uploadProfilePicture(data?.uid, dataProfile?.file)
        .then(() => console.log("Profile picture uploaded successfully"))
        .catch((error) => console.error("Error uploading profile picture:", error));
        await updateUserFirebase(data?.uid, {
          email:  values.email,
          firstName: values.firstName,
          lastName: values.lastName
        });
        toast.success("Profile info has been updated successfully");
        const authData: any = localStorage.getItem('kt-auth-react-v');
        var uid = !!authData ? JSON.parse(authData)?.uid : "";    
        getData(uid);
        setLoading(false)
      }, 1000)
    },
  })

  async function getData(uid: string) {
    try {
      const res = await getUserFirebase(uid);
      console.log("🚀 ~ getData ~ res:", res)
      setData(res);
      setCurrentUser(res);
    } catch (err) { }
  }
  useEffect(() => {
    const authData: any = localStorage.getItem('kt-auth-react-v');
    var uid = !!authData ? JSON.parse(authData)?.uid : "";
    if (!!uid) {
      getData(uid);
    };
  }, []);

  useEffect(() => {
    if (!!data) {
      setDataProfile({ 
        image: data?.profilePictureURL,
        file: "",})
      formik.setValues(data);
    }
  }, [data]);
  return (
    <div className="card mb-5 mb-xl-10">
      <div
        className="card-header border-0 cursor-pointer"
        role="button"
        data-bs-toggle="collapse"
        data-bs-target="#kt_account_profile_details"
        aria-expanded="true"
        aria-controls="kt_account_profile_details"
      >
        <div className="card-title m-0">
          <h3 className="fw-bolder m-0">Profile Details</h3>
        </div>
      </div>

      <div id="kt_account_profile_details" className="collapse show">
        <form onSubmit={formik.handleSubmit} noValidate className="form">
          <div className="card-body border-top p-9">
            <div className="row mb-6">
              <label className="col-lg-4 col-form-label fw-bold fs-6">
                Avatar
              </label>
              <div className="col-lg-8">
                {/*begin::Image input*/}
                <div
                  className="image-input image-input-outline"
                  data-kt-image-input="true"
                  style={{
                    backgroundImage: `url(${
                      !!data?.profilePictureURL
                        ? data?.profilePictureUR
                        : "/metronic8/demo1/assets/media/svg/avatars/blank.svg"
                    })`,
                  }}
                >
                  {/*begin::Preview existing avatar*/}
                  {!!dataProfile?.image === true ? (
                    <div
                      className="symbol symbol-100px border"
                      data-bs-toggle="tooltip"
                      aria-label="Barry Walter"
                      data-bs-original-title="Barry Walter"
                      data-kt-initialized={1}
                    >
                      <img
                        alt="Pic"
                        style={{ objectFit: "cover" }}
                        className=""
                        src={
                          dataProfile.image
                            ? dataProfile.image
                            : "/media/svg/avatars/blank.svg"
                        }
                      />
                    </div>
                  ) : (
                    <div
                      className="symbol symbol-100px border"
                      data-bs-toggle="tooltip"
                      aria-label="Barry Walter"
                      data-bs-original-title="Barry Walter"
                      data-kt-initialized={1}
                    >
                      <img
                        alt="Pic"
                        style={{ objectFit: "cover" }}
                        className=""
                        src={
                          dataProfile.image
                            ? dataProfile.image
                            : "/media/svg/avatars/blank.svg"
                        }
                      />
                    </div>
                  )}
                  {/*end::Preview existing avatar*/}
                  {/*begin::Label*/}
                  <label
                    className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                    data-kt-image-input-action="change"
                    data-bs-toggle="tooltip"
                    aria-label="Change avatar"
                    data-bs-original-title="Change avatar"
                    data-kt-initialized={1}
                  >
                    <i className="ki-duotone ki-pencil fs-7">
                      <span className="path1" />
                      <span className="path2" />
                    </i>
                    {/*begin::Inputs*/}
                    <input
                      type="file"
                      id="UploadUniversityLogo"
                      name="avatar"
                      accept=".png, .jpg, .jpeg"
                      onChange={(e: any) => {
                        const allowedExtensions = /(\.png|\.jpg|\.jpeg)$/i;
                        if (!allowedExtensions.exec(e.target.value)) {
                          Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Please upload image of type png, jpg, jpeg",
                          });
                          return;
                        }
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDataProfile((prevState: any) => ({
                              ...prevState,
                              image: reader.result,
                              file: e.target.files[0],
                            }));
                          };
                          formik.setFieldValue("logo", e.target.files[0]);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <input type="hidden" name="avatar_remove" />
                    {/*end::Inputs*/}
                  </label>
                  {/*end::Label*/}
                  {/*begin::Cancel*/}
                  <span
                    className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                    data-kt-image-input-action="cancel"
                    data-bs-toggle="tooltip"
                    aria-label="Cancel avatar"
                    data-bs-original-title="Cancel avatar"
                    data-kt-initialized={1}
                  >
                    <i className="ki-duotone ki-cross fs-2">
                      <span className="path1" />
                      <span className="path2" />
                    </i>{" "}
                  </span>
                  {/*end::Cancel*/}
                  {/*begin::Remove*/}
                  {/* <span
                    className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                    data-kt-image-input-action="remove"
                    data-bs-toggle="tooltip"
                    aria-label="Remove avatar"
                    data-bs-original-title="Remove avatar"
                    data-kt-initialized={1}
                  >
                    <i className="ki-duotone ki-cross fs-2">
                      <span className="path1" />
                      <span className="path2" />
                    </i>{" "}
                  </span> */}
                  {/*end::Remove*/}
                </div>
                {/*end::Image input*/}
                {/*begin::Hint*/}
                <div className="form-text">
                  Allowed file types: png, jpg, jpeg.
                </div>
                {/*end::Hint*/}
              </div>
            </div>

            <div className="row mb-6">
              <label className="col-lg-4 col-form-label required fw-bold fs-6">
                Full Name
              </label>

              <div className="col-lg-8">
                <div className="row">
                  <div className="col-lg-6 fv-row">
                    <input
                      type="text"
                      className="form-control form-control-lg form-control-solid mb-3 mb-lg-0"
                      placeholder="First name"
                      {...formik.getFieldProps("firstName")}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {formik.errors.firstName}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-lg-6 fv-row">
                    <input
                      type="text"
                      className="form-control form-control-lg form-control-solid"
                      placeholder="Last name"
                      {...formik.getFieldProps("lastName")}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {formik.errors.lastName.toString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-6">
              <label className="col-lg-4 col-form-label required fw-bold fs-6">
                Email
              </label>

              <div className="col-lg-8">
                <div className="row">
                  <div className="col-lg-12 fv-row">
                    <input
                      type="email"
                      className="form-control form-control-lg form-control-solid mb-3 mb-lg-0"
                      placeholder="Email"
                      {...formik.getFieldProps("email")}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {formik.errors.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end py-6 px-9">
            <button type="submit" className="btn Gradient" disabled={loading}>
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
        </form>
      </div>
    </div>
  );
}

export { ProfileDetails }
