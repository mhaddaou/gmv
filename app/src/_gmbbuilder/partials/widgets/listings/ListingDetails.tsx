import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  NavDropdown,
  Row,
  Spinner,
} from "react-bootstrap";
import { KTIcon, toAbsoluteUrl } from "../../../helpers";
import GoogleMapsComponent from "./GoogleMaps";
import axios from "axios";
import { DynamicModal, isOpenNowReturned } from "../../../../functions";
import Skeleton from "react-loading-skeleton";
import { HeadersDetails } from "./HeadersDetails";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2'
import { useNavigate } from "react-router-dom";
import { Loading } from "./Loading";

const urlApi = import.meta.env.VITE_APP_NODE_API;
const initValues = {
  name: "Service options",
  options: [
    { text: "Cash only" },
    { text: "Serves vegan dishes" },
    { text: "Has kids' menu" },
  ],
  details: [
    {
      icon: "ki-home",
      title: "Address",
      text: "123 Coffee Lane, Toronto, ON M5A 1A1, Canada",
      link: "#",
    },
    {
      icon: "ki-time",
      title: "Hours",
      text: "Closes 2 AM",
      status: "Open",
      link: "#",
    },
    {
      icon: "ki-phone",
      title: "Phone",
      text: "+1564875421",
      link: "#",
    },
    {
      icon: "ki-book-open",
      title: "Menu",
      text: "coffeelane.com/menu",
      link: "#",
    },
  ],
};

const ListingDetailsWidget: React.FC = () => {
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [exportLoader, setExportLoader] = useState(false);
  const [modalImage, setModalImage] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [serviceData, setServiceData] = useState(initValues);
  const [photoUrls, setPhotoUrls] = useState<any>([]);
  const [IsLoading, setIsLoading] = useState<any>(false);
  const [CheckIntegrationConnect, setCheckIntegrationConnect] = useState<any>([]);
  const authData: any = localStorage.getItem('kt-auth-react-v');
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
        console.log(response);
        setCheckIntegrationConnect(response?.data)
      })
      .finally(() => {
      });
  };
  const PostHuBspotCRM = () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    setIsLoading(true)
    axios
      .post(
        `${API_URL}/Integration/hubspot/companies?name=hubspot&userId=${uid}`,
        [{
          name: data?.name,
          domain: data?.domain,
          phone: data?.phone,
          website: data?.website,
          email: !!data?.email === true ? data?.email : "",
          address: !!data?.address === true ? data?.address : "",
          numberOfEmployees: data?.numberOfEmployees,
          revenue: data?.revenue,
          facebook: data?.facebook,
          linkedin: data?.linkedin,
        }]
        , {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        Swal.fire({
          text: "The place have been successfully pushed to CRM using HubSpot",
          icon: "success",
          showConfirmButton: true,
          timer: 2000,
          width: "25rem",
        });
        setIsLoading(false)
      })
      .catch((error: any) => {
      })
      .finally(() => {
        setIsLoading(false)
      });
  };
  const [data, setData] = useState<any>({
    status: "",
    result: {
      types: [],
      reviews: [],
      photos: [],
      geometry: {
        location: {
          lat: "",
          lng: "",
        },
      },
      rating: 0,
      formatted_address: "",
    },
    html_attributions: [],
  });
  function getCurrentDay(list: any) {
    try {
      const currentDayIndex = new Date().getDay();

      // Get the current day's opening hours
      const currentDayOpeningHours = list[currentDayIndex - 1];
      return currentDayOpeningHours;
    } catch (err) {
      console.log("🚀 ~ getCurrentDay ~ err:", err);
    }
  }
  const getDataApi = async (pageToken: string | null = null) => {
    try {
      setLoading(true);
      const placeId = window.location.pathname?.replace(
        "/listings/details/",
        ""
      );
      // Build the API URL based on whether we have a pageToken or not
      const apiUrl = `${urlApi}/getDetails?placeId=${placeId}`;

      const response = await axios.get(apiUrl);

      if (response?.data?.data) {
        const resultData = response?.data?.data;
        setServiceData({
          name: "Service options",
          options: [
            { text: "Cash only" },
            { text: "Serves vegan dishes" },
            { text: "Has kids' menu" },
          ],
          details: [
            {
              icon: "ki-home",
              title: "Address",
              text: resultData?.result?.formatted_address,
              link: "#",
            },
            {
              icon: "ki-time",
              title: "Hours",
              text: getCurrentDay(
                resultData?.result?.opening_hours?.weekday_text ?? []
              ),
              status: isOpenNowReturned(
                resultData?.result?.opening_hours?.weekday_text ?? []
              ),
              link: "#",
            },
            {
              icon: "ki-phone",
              title: "Phone",
              text: resultData?.result?.international_phone_number ?? "-",
              link:
                !!resultData?.result?.international_phone_number === false
                  ? "#"
                  : `tel:${resultData?.result?.international_phone_number}`,
            },
            {
              icon: "ki-book-open",
              title: resultData?.result?.types?.some(
                (s: string) => s === "restaurant" || s === "cafe"
              )
                ? "Menu"
                : "Website",
              text: resultData?.result?.website ?? "-",
              link: resultData?.result?.website,
            },
          ],
        });
        setData(response?.data?.data);
      }
      // setLoading(false);
    } catch (error) {
      console.error("🚀 ~ getDataApi ~ error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(async () => {
      await getDataApi();
      setLoading(false);
    }, 250);
  }, []);

  const getPhotoUrl = async (photoReference: string, maxWidth: string) => {
    try {
      const response = await axios.get(
        `${urlApi}/getPhotoUrl?photo_reference=${photoReference}&maxwidth=${maxWidth}`
      );

      return response?.data?.photoUrl;
    } catch (error) {
      console.error("🚀 ~ pushDataToClay ~ error:", error);
    }
  };

  useEffect(() => {
    const fetchPhotoUrls = async () => {
      if (data?.photos) {
        const urls: any = await Promise.all(
          data?.photos.map(async (photo: any) => {
            const url = await getPhotoUrl(photo?.photo_reference, "800"); // Adjust max width as needed
            console.log("🚀 ~ data?.result?.photos.map ~ url:", url);
            return url;
          })
        );
        console.log("🚀 ~ fetchPhotoUrls ~ urls:", urls);
        setPhotoUrls(urls); // Filter out any null values
      }
    };

    fetchPhotoUrls();
  }, [data.result]);

  function SkeletonLoader(className: string, element: any) {
    return loading ? <Skeleton className={className} width={120} /> : element;
  }


  //Export data
  const getDataApiExport = async (dataResult: any) => {
    try {
      if (!!dataResult) {
        return dataResult;
      } else {
        return data.result;
      }
    } catch (error) {
      console.error("🚀 ~ getDataApi ~ error:", error);
    }
  };
  useEffect(() => {
    data?.result
    GetCheckConnect()
  }, [])
  return (
    <>
     <div className='row g-5 g-xl-8'>
      <Container className="my-5">
        <div className="d-flex flex-wrap flex-stack">
          <div className="d-flex flex-column">
            {/*begin::Name*/}
            <div className="d-flex align-items-center mb-2">
              {SkeletonLoader(
                "text-gray-900 fs-2 fw-bold me-1",
                <a href="#" className="text-gray-900 fs-2 fw-bold me-1">
                  {data?.name}
                </a>
              )}
              <a href="#">
                <i className="ki-duotone ki-verify fs-1 text-primary">
                  <span className="path1" />
                  <span className="path2" />
                </i>
              </a>
            </div>
            {/*end::Name*/}
            {/*begin::Info*/}
            <div className="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2 align-items-center">
              {SkeletonLoader(
                "d-flex align-items-center text-gray-500 mb-2",
                <a
                  href="#"
                  className="d-flex align-items-center text-gray-500 mb-2"
                >
                  <i className="ki-duotone ki-star text-info ms-2 me-1 fs-5"></i>
                  {data?.rating ?? 0}{" "}
                  <span className="bullet bullet-dot mx-2"></span>{" "}
                  {data?.reviews?.length ?? 0} reviews
                </a>
              )}
              <span className="bullet bullet-dot mx-3 mb-2"></span>
              {SkeletonLoader(
                "d-flex align-items-center text-gray-500  mb-2",
                <a
                  href="#"
                  className="d-flex align-items-center text-gray-500  mb-2"
                >
                  <i className="ki-duotone ki-book-open fs-4 me-1">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                  </i>
                  {data?.types?.length > 0
                    ? data?.types[0]
                    : ""}
                </a>
              )}
              <span className="bullet bullet-dot mx-3 mb-2"></span>
              {SkeletonLoader(
                "d-flex align-items-center text-gray-500 mb-2",
                <a
                  href="#"
                  className="d-flex align-items-center text-gray-500 mb-2"
                >
                  <i className="ki-duotone ki-geolocation fs-4 me-1">
                    <span className="path1" />
                    <span className="path2" />
                  </i>
                  {data.formatted_address}
                </a>
              )}
            </div>
            {/*end::Info*/}
          </div>
          {/*end::Heading*/}
          {/*begin::Actions*/}
          <div className="d-flex flex-wrap my-2">
            <a
              onClick={async () => {
                setExportLoader(true);
                var dataResult = await getDataApiExport(data);

                const handleNull = (value: any) =>
                  value === null ? "" : value; // Function to replace null with empty string
                var list: any = [];
                list.push(dataResult);
                const exportData = (list ?? []).map((item: any) => {
                  const exportItem: any = {};
                  HeadersDetails?.forEach((header: any) => {
                    let value; // Declare a variable to hold the value
                    if (header.key === "isOpenNow") {
                      value = handleNull(item?.opening_hours?.open_now);
                    } else if (header.key === "latitude") {
                      value = handleNull(item?.geometry?.location?.lat);
                    } else if (header.key === "longitude") {
                      value = handleNull(item?.geometry?.location?.lng);
                    } else if (header.key === "reviews") {
                      value = handleNull(item?.reviews?.length);
                    } else {
                      value = item[header.key];
                    }
                    exportItem[header.label] = value; // Assign the handled value to the export item
                  });
                  return exportItem;
                });

                const csvData = [
                  HeadersDetails.map((h: any) => h.label).join(","), // Create the header row from labels
                  ...exportData?.map(
                    (item: any) =>
                      HeadersDetails?.map(
                        (h: any) => `"${item[h.label]}"`
                      ).join(",") // Map each item to CSV format, considering possible commas in data
                  ),
                ].join("\n"); // Join all rows with newline characters for proper CSV formatting
                const currentDate = new Date().toISOString().split("T")[0]; // Get the current date in YYYY-MM-DD format
                const fileName = `Locations_${currentDate}.csv`; // Set the filename for the CSV file
                saveAs(
                  new Blob([csvData], { type: "text/csv;charset=utf-8;" }),
                  fileName
                ); // Trigger the download of the CSV file
                setExportLoader(false);
              }}
              href="#"
              className="d-flex align-items-center text-gray-900 text-hover-info me-5"
            >
              {!exportLoader && (
                <i className="ki-duotone ki-exit-up fs-4 me-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              )}
              {exportLoader ? (
                <div className="d-flex">
                  <span className="text-primary fw-bold">Please wait</span>
                  <Spinner
                    animation="border"
                    variant="primary"
                    size="sm"
                    className="ms-2 mt-1"
                  />
                </div>
              ) : (
                "Export to CSV"
              )}
            </a>
            {/* <NavDropdown
              id="nav-dropdown-white-example"
              className="dropdown-toggleV2 ms-3 me-3"
              title={
                <a
                  href="#"
                  className="d-flex align-items-center text-gray-900 text-hover-info me-5"
                >
                  {!exportLoader && (
                    <i className="ki-duotone ki-exit-up fs-4 me-1">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  )}
                  {exportLoader ? (
                    <div className="d-flex">
                      <span className="text-primary fw-bold">Please wait</span>
                      <Spinner
                        animation="border"
                        variant="primary"
                        size="sm"
                        className="ms-2 mt-1"
                      />
                    </div>
                  ) : (
                    "Export to CSV"
                  )}
                </a>
              }
              menuVariant="white"
            >
              <NavDropdown.Item
                eventKey="1"
                onClick={async () => {
                  setExportLoader(true);
                  // Extract the headers from the HeadersDetails array
                  var dataResult = await getDataApiExport(data.result);
                  var list = [];
                  list.push(dataResult);
                  const worksheetData = [
                    HeadersDetails.map((h) => h.label),
                    ...(list ?? []).map((item: any) =>
                      HeadersDetails.map((h) => {
                        if (h.key === "isOpenNow") {
                          // Check if the key is for fullName
                          return item?.opening_hours?.open_now;
                        } else if (h.key === "longitude") {
                          return item?.geometry?.location?.lng; // Combine firstName and lastName
                        } else if (h.key === "latitude") {
                          return item?.geometry?.location?.lat; // Combine firstName and lastName
                        } else if (h.key === "reviews") {
                          return item?.reviews?.length; // Combine firstName and lastName
                        }
                        return item[h.key];
                      })
                    ),
                  ];
                  // Convert the array of arrays to a worksheet
                  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
                  // Create a new workbook and append the worksheet to it
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
                  // Write the workbook to a buffer
                  const excelBuffer = XLSX.write(workbook, {
                    bookType: "xlsx",
                    type: "array",
                  });
                  // Get the current date in YYYY-MM-DD format
                  const currentDate = new Date().toISOString().split("T")[0];
                  // Set the filename for the Excel file
                  const placeId = window.location.pathname?.replace(
                    "/listings/details/",
                    ""
                  );
                  const fileName = `Location_${placeId}_${currentDate}.xlsx`;
                  // Trigger the download of the Excel file
                  saveAs(
                    new Blob([excelBuffer], {
                      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    }),
                    fileName
                  );
                  setExportLoader(false);
                }}
              >
                EXCEL
              </NavDropdown.Item>
              <NavDropdown.Item
                eventKey="1"
                onClick={async () => {
                  setExportLoader(true);
                  var dataResult = await getDataApiExport(data.result);

                  const handleNull = (value: any) =>
                    value === null ? "" : value; // Function to replace null with empty string

                  const exportData = (dataResult ?? []).map((item: any) => {
                    const exportItem: any = {};
                    HeadersDetails?.forEach((header: any) => {
                      let value; // Declare a variable to hold the value
                      if (header.key === "isOpenNow") {
                        value = handleNull(item?.opening_hours?.open_now);
                      } else if (header.key === "latitude") {
                        value = handleNull(item?.geometry?.location?.lat);
                      } else if (header.key === "longitude") {
                        value = handleNull(item?.geometry?.location?.lng);
                      } else {
                        value = item[header.key];
                      }
                      exportItem[header.label] = value; // Assign the handled value to the export item
                    });
                    return exportItem;
                  });

                  const csvData = [
                    HeadersDetails.map((h: any) => h.label).join(","), // Create the header row from labels
                    ...exportData?.map(
                      (item: any) =>
                        HeadersDetails?.map((h: any) => `"${item[h.label]}"`).join(",") // Map each item to CSV format, considering possible commas in data
                    ),
                  ].join("\n"); // Join all rows with newline characters for proper CSV formatting
                  const currentDate = new Date().toISOString().split("T")[0]; // Get the current date in YYYY-MM-DD format
                  const fileName = `Locations_${currentDate}.csv`; // Set the filename for the CSV file
                  saveAs(
                    new Blob([csvData], { type: "text/csv;charset=utf-8;" }),
                    fileName
                  ); // Trigger the download of the CSV file
                  setExportLoader(false);
                }}
              >
                CSV
              </NavDropdown.Item>
              <NavDropdown.Item
                eventKey="1"
                onClick={async () => {
                  setExportLoader(true);
                  var dataResult = await getDataApiExport(data.results);

                  const handleNull = (value: any) =>
                    value === null ? "" : value;
                  const exportData = (dataResult ?? [])?.map((item: any) => {
                    const exportItem: any = {};
                    HeadersDetails.forEach((header: any) => {
                      if (header.key === "isOpenNow") {
                        exportItem[header.label] = handleNull(
                          item?.opening_hours?.open_now
                        );
                      } else if (header.key === "latitude") {
                        exportItem[header.label] = handleNull(
                          item?.geometry?.location?.lat
                        );
                      } else if (header.key === "longitude") {
                        exportItem[header.label] = handleNull(
                          item?.geometry?.location?.lng
                        );
                      } else {
                        exportItem[header.label] = handleNull(item[header.key]);
                      }
                    });
                    return exportItem;
                  });
                  const jsonData = JSON.stringify(exportData, null, 2);
                  const currentDate = new Date().toISOString().split("T")[0];
                  const fileName = `Locations_${currentDate}.json`;
                  saveAs(
                    new Blob([jsonData], {
                      type: "application/json;charset=utf-8;",
                    }),
                    fileName
                  );
                  setExportLoader(false);
                }}
              >
                JSON
              </NavDropdown.Item>
            </NavDropdown> */}
            {CheckIntegrationConnect[0]?.active === false ?
              <span
                className="d-flex align-items-center text-gray-900 text-hover-info me-5 cursor-pointer"
                onClick={() => {
                  Swal.fire({
                    title: 'Integration Required',
                    text: 'You need to connect at least one integration to push data to CRM.',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Go to Connect',
                    cancelButtonText: 'Cancel'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      navigate('/account/integrations');
                    }
                  });
                }}
              >
                <i className="ki-duotone ki-exit-down fs-4 me-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Push to CRM
              </span>
              :
              <NavDropdown
                id="nav-dropdown-white-example"
                className="dropdown-toggleV2 ms-3 me-3"
                title={
                  <span
                    className="d-flex align-items-center text-gray-900 text-hover-info me-5"

                  >
                    <i className="ki-duotone ki-exit-down fs-4 me-1">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Push to CRM
                  </span>
                }
                menuVariant="white"
              >
                <NavDropdown.Item
                  eventKey="1"
                  onClick={() => {
                    PostHuBspotCRM()
                  }}
                >
                  <img
                    src={toAbsoluteUrl("media/svg/brand-logos/hubspot.svg")}
                    className="w-20px me-2"
                    alt=""
                  /> HubSpot
                </NavDropdown.Item>
                {/* <NavDropdown.Item
                eventKey="1"
                onClick={() => {
                  if (SelectedPlaces.length === 0) {
                    Swal.fire({
                      title: 'No Places Selected',
                      text: 'You must select at least one place to push to CRM.',
                      icon: 'warning',
                      confirmButtonText: 'OK'
                    });
                  } else {
                    PostHuBspotCRM()
                  }
                }}
              >
                <img
                  src={toAbsoluteUrl("media/svg/brand-logos/Salesforce.svg")}
                  className="w-25px "
                  alt=""
                /> SalesForce
              </NavDropdown.Item> */}
              </NavDropdown>
            }
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open(data.url, "_blank");
              }}
              className="d-flex align-items-center text-gray-900 text-hover-info me-5"
            >
              <i className="fa-brands fa-google fs-4 me-2" />
              Open in Google Maps
            </a>
          </div>
          {/*end::Actions*/}
        </div>
        <Col xs="12" md="12" lg="12" xl="12" className="p-0">
          <div className="d-flex d-md-none justify-content-start w-100">
            {/* Mobile View: Carousel */}
            <div
              id="carouselExampleIndicators"
              className="carousel slide w-100"
              data-bs-ride="false"
            >
              <div className="carousel-indicators">
                {photoUrls?.map((s: any, i: number) => (
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to={i}
                    className="active"
                    aria-current="true"
                    aria-label={`Slide ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="carousel-inner">
                {photoUrls.map((url: any, i: number) => (
                  <div
                    className={`carousel-item ${i === 0 ? "active" : ""}`}
                    key={i}
                  >
                    <img
                      src={url}
                      className="d-block w-100"
                      alt={`Cafe ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>

          <div className="d-none d-md-flex justify-content-start w-100">
            {/* Desktop View: Original Layout */}
            <div className="me-2 w-100">
              {SkeletonLoader(
                "rounded w-xl-550px w-100 h-550px object-fit-cover",
                <img
                  src={photoUrls.length > 0 ? photoUrls[0] : ""}
                  alt="cafe 1"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImage(photoUrls.length > 0 ? photoUrls[0] : "");
                    setModalImage(true);
                  }}
                  className="rounded w-xl-550px w-100 h-550px object-fit-cover cursor-pointer"
                />
              )}
            </div>
            <div className="d-flex flex-column me-2 w-100">
              {SkeletonLoader(
                "rounded mb-2 w-100 h-240px object-fit-cover",
                !loading && photoUrls.length > 1 ? (
                  <img
                    src={photoUrls.length > 1 ? photoUrls[1] : ""}
                    alt="cafe 2"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImage(photoUrls.length > 1 ? photoUrls[1] : "");
                      setModalImage(true);
                    }}
                    className="rounded mb-2 w-100 h-240px object-fit-cover cursor-pointer"
                  />
                ) : (
                  ""
                )
              )}
              {SkeletonLoader(
                "rounded w-100 h-240px object-fit-cover",
                !loading && photoUrls.length > 2 && (
                  <img
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImage(photoUrls.length > 2 ? photoUrls[2] : "");
                      setModalImage(true);
                    }}
                    src={photoUrls[2]}
                    alt="cafe 3"
                    className="rounded w-100 h-240px object-fit-cover cursor-pointer"
                  />
                )
              )}
            </div>
            <div className="d-flex flex-column w-100">
              {SkeletonLoader(
                "rounded mb-2 w-100 h-240px object-fit-cover",
                !loading && photoUrls.length > 3 && (
                  <img
                    src={photoUrls.length > 3 ? photoUrls[3] : ""}
                    alt="cafe 4"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImage(photoUrls.length > 3 ? photoUrls[3] : "");
                      setModalImage(true);
                    }}
                    className="rounded mb-2 w-100 h-240px object-fit-cover cursor-pointer"
                  />
                )
              )}
              {SkeletonLoader(
                "rounded w-100 h-240px object-fit-cover",
                !loading && photoUrls.length > 4 && (
                  <img
                    src={photoUrls.length > 4 ? photoUrls[4] : ""}
                    alt="cafe 5"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImage(photoUrls.length > 4 ? photoUrls[4] : "");
                      setModalImage(true);
                    }}
                    className="rounded w-100 h-240px object-fit-cover cursor-pointer"
                  />
                )
              )}
            </div>
          </div>
        </Col>

        <Row className="my-5">
          <Col xl="6" lg="6" md="12">
            <div className="d-flex flex-wrap flex-stack">
              <div className="d-flex flex-column">
                {/* Name */}
                {/* <div className="d-flex align-items-center mb-2">
                  {SkeletonLoader(
                    "text-gray-900 fs-2 fw-bold me-1",
                    <a href="#" className="text-gray-900 fs-2 fw-bold me-1">
                      {serviceData.name}
                    </a>
                  )}
                </div>
                <div className="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2 align-items-center">
                  {serviceData.options.map((option, index) => (
                    <React.Fragment key={index}>
                      <a
                        href="#"
                        className="d-flex align-items-center text-gray-700 mb-2"
                      >
                        {option.text}
                      </a>
                      {index < serviceData.options.length - 1 && (
                        <span className="bullet bullet-dot mx-2 mb-2"></span>
                      )}
                    </React.Fragment>
                  ))}
                </div>*/}
              </div>
            </div>
            <div className="separator mb-5"></div>
            {serviceData.details.map((detail, index) => (
              <div
                className="d-flex align-items-center me-5 me-xl-13 mb-6"
                key={index}
              >
                {/* Symbol */}
                {SkeletonLoader(
                  "symbol symbol-30px w-65px h-65px me-5",
                  <div className="symbol symbol-30px symbol-circle me-4">
                    <i
                      className={`ki-outline ${detail.icon} fs-2x text-dark`}
                    ></i>
                  </div>
                )}
                {/* Info */}
                <div className="m-0">
                  {SkeletonLoader(
                    "fw-semibold text-gray-800 d-block fs-4",
                    <span className="fw-semibold text-gray-800 d-block fs-4">
                      {detail.title}
                    </span>
                  )}
                  {SkeletonLoader(
                    "text-gray-500 fs-6",
                    <a href={detail.link} className="text-gray-500 fs-6">
                      {detail.status && (
                        <span className="text-success">{detail.status}</span>
                      )}{" "}
                      {detail.text}
                    </a>
                  )}
                </div>
              </div>
            ))}
            <div className="separator mb-5"></div>
          </Col>
          <Col xl="6" lg="6" md="12">
            <div className="d-flex flex-wrap flex-stack">
              <div className="d-flex flex-column">
                {/* Name */}
                <div className="d-flex align-items-center mb-2">
                  <span className="text-gray-900 fs-2 fw-bold">
                    Where you’ll be
                  </span>
                </div>
              </div>
            </div>
            {data?.geometry?.location?.lat && (
              <GoogleMapsComponent
                latitude={data?.geometry?.location?.lat}
                longitude={data?.geometry?.location?.lng}
              />
            )}
            <div className="d-flex flex-wrap flex-stack mt-2">
              <div className="d-flex flex-column">
                {/* Name */}
                <div className="d-flex align-items-center mb-2">
                  {SkeletonLoader(
                    "text-gray-900 fs-3 fw-bold me-1",
                    <a href="#" className="text-gray-900 fs-3 fw-bold me-1">
                      {data.formatted_address}
                    </a>
                  )}
                </div>
                {/* Options */}
                {/* <div className="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2 align-items-center">
                    <a
                      href="#"
                      className="d-flex align-items-center text-gray-700 mb-2"
                    >
                      Cozy, upscale coffee shop located in the heart of Toronto,
                      ON.
                    </a>
                  </div> */}
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xl="12" lg="12">
            <div className="d-flex flex-wrap flex-stack mb-6">
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center mb-2">
                  {SkeletonLoader(
                    "text-gray-900 fs-2 fw-bold me-1",
                    <a href="#" className="text-gray-900 fs-2 fw-bold me-1">
                      <i className="ki-duotone ki-star text-info ms-2 me-2 fs-2"></i>
                      {data?.rating} ⋅ {data?.reviews?.length}{" "}
                      reviews
                    </a>
                  )}
                </div>
              </div>
            </div>
            <Row>
              {loading
                ? [1, 2, 3, 4].map((review: any, index: number) => (
                  <Col xl="6" lg="6" md="12" key={index}>
                    <div className="d-flex flex-column h-100">
                      {/* Header */}
                      <div className="mb-7">
                        {/* Items */}
                        <div className="d-flex align-items-center flex-wrap d-grid gap-2">
                          {/* Item */}
                          <div className="d-flex align-items-center me-5 me-xl-13">
                            {/* Symbol */}
                            {SkeletonLoader(
                              "symbol symbol-45px symbol-circle me-5 h-80px w-80px",
                              <div className="symbol symbol-45px symbol-circle me-3">
                                <img
                                  src={review?.profile_photo_url}
                                  className=""
                                  alt={`${review.name}'s avatar`}
                                />
                              </div>
                            )}
                            {/* Info */}
                            <div className="m-0">
                              {SkeletonLoader(
                                "fw-semibold text-gray-800 d-block fs-6",
                                <span className="fw-semibold text-gray-800 d-block fs-6">
                                  {review?.author_name}
                                </span>
                              )}
                              {SkeletonLoader(
                                "text-gray-500 text-hover-primary fs-7",
                                <span className="text-gray-500 text-hover-primary fs-7">
                                  {review?.relative_time_description}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Body */}
                      <div className="mb-6">
                        {/* Text */}
                        <span className="fw-semibold text-gray-600 fs-6 mb-8 d-block">
                          {review?.text}
                        </span>
                      </div>
                    </div>
                  </Col>
                ))
                : (data?.reviews ?? []).map(
                  (review: any, index: number) => (
                    <Col xl="6" lg="6" md="12" key={index}>
                      <div className="d-flex flex-column h-100">
                        {/* Header */}
                        <div className="mb-7">
                          {/* Items */}
                          <div className="d-flex align-items-center flex-wrap d-grid gap-2">
                            {/* Item */}
                            <div className="d-flex align-items-center me-5 me-xl-13">
                              {/* Symbol */}
                              <div className="symbol symbol-45px symbol-circle me-3">
                                <img
                                  src={
                                    review?.profile_photo_url ??
                                    toAbsoluteUrl(
                                      "media/gm-images/banner.png"
                                    )
                                  }
                                  className=""
                                  onError={() => setImgError(true)} // Switch to fallback image on error
                                  alt={`${review.author_name}'s avatar`}
                                />
                              </div>
                              {/* Info */}
                              <div className="m-0">
                                <span className="fw-semibold text-gray-800 d-block fs-6">
                                  {review?.author_name}
                                </span>
                                <span className="text-gray-500 text-hover-primary fs-7">
                                  {review?.relative_time_description}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Body */}
                        <div className="mb-6">
                          {/* Text */}
                          <span className="fw-semibold text-gray-600 fs-6 mb-8 d-block">
                            {review?.text}
                          </span>
                        </div>
                      </div>
                    </Col>
                  )
                )}
            </Row>
          </Col>
        </Row>
      </Container>
      {/* Modal Image */}
      {modalImage && (
        <DynamicModal
          size="lg"
          show={modalImage}
          setShow={setModalImage}
          child={
            <Card>
              <div className="modal-header">
                {/* begin::Modal title */}
                <h2 className="fw-bolder text-primary">Show Image</h2>
                {/* end::Modal title */}

                {/* begin::Close */}
                <div
                  className="btn btn-icon btn-sm btn-active-icon-primary"
                  data-kt-users-modal-action="close"
                  onClick={() => setModalImage(false)}
                  style={{ cursor: "pointer" }}
                >
                  <KTIcon iconName="cross" className="fs-1" />
                </div>
                {/* end::Close */}
              </div>
              <CardBody>
                <Row>
                  <Col>
                    <div className="d-flex fv-row mb-6 justify-content-center">
                      <img
                        alt="img-modal"
                        src={currentImage}
                        className="w-650px"
                      />
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setModalImage(false);
                  }}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Card>
          }
        />
      )}
      </div>
      {IsLoading && <Loading />}
    </>
  );
};

export default ListingDetailsWidget;
