import axios from "axios";
import { saveAs } from "file-saver";
import React, { Fragment, useEffect, useState } from "react";
import { Col, NavDropdown, Row, Spinner } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { handleApiErrors } from "../../../../app/global/HandleApiErrors";
import { toAbsoluteUrl } from "../../../helpers";
import { Loading } from "./Loading";
import PushToCRM from "./Push-CRM";

type Props = {
  className: string;
  keyWord: string;
  isSearch: boolean;
  type: any;
  Country: any;
  setCountry: any;
  StateRegion: any;
  setStateRegion: any;
  CityArea: any;
  setCityArea: any;
  Rating: any;
  setRating: any;
  Reviews: any;
  setReviews: any;
};
const urlApi = import.meta.env.VITE_APP_NODE_API;

const ListingsWidget: React.FC<Props> = ({
  className,
  keyWord,
  isSearch,
  type,
  Country,
  setCountry,
  StateRegion,
  setStateRegion,
  CityArea,
  setCityArea,
  Rating,
  setRating,
  Reviews,
  setReviews,
}) => {
  //geolocator access
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exportLoader, setExportLoader] = useState(false);
  const [ShowCRM, setShowCRM] = useState(false);
  const navigate = useNavigate();
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string | null }>(
    {}
  );
  const [data, setData] = useState({
    html_attributions: [],
    next_page_token: "",
    results: [],
    message: "",
  });
  const [allSelected, setAllSelected] = useState<boolean>(false);
  const [PlacesIds, setPlacesIds] = useState<number[]>([]);
  const [SelectedPlaces, setSelectedPlaces] = useState<any>([]);
  const [SelectedExportPlaces, setSelectedExportPlaces] = useState<any>([]);
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const authData: any = localStorage.getItem("kt-auth-react-v");
  const [IsLoading, setIsLoading] = useState<any>(false);
  const [CheckIntegrationConnect, setCheckIntegrationConnect] = useState<any>(
    []
  );
  const removePlaceId = (array: any): any => {
    return array?.map(({ place_id, ...rest }) => rest);
  };
  const GetCheckConnect = () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    axios
      .get(`${API_URL}/Integration/list?userId=${uid}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response: any) => {
        setCheckIntegrationConnect(response?.data);
      })
      .finally(() => {});
  };
  const PostHuSpotCRM = () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    setIsLoading(true);
    axios
      .post(
        `${API_URL}/Integration/hubspot/companies?name=hubspot&userId=${uid}`,
        removePlaceId(SelectedPlaces),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        Swal.fire({
          text: "The selected companies have been successfully pushed to CRM using HubSpot",
          icon: "success",
          showConfirmButton: true,
          timer: 2000,
          width: "25rem",
        });
        setSelectedExportPlaces([]);
        setSelectedPlaces([]);
        setPlacesIds([]);
        setIsLoading(false);
      })
      .catch((error: any) => {
        handleApiErrors(error?.response);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const PostSalesForceCRM = () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    setIsLoading(true);
    axios
      .post(
        `${API_URL}/Integration/salesforce/companies?userId=${uid}`,
        removePlaceId(SelectedPlaces),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        Swal.fire({
          text: "The selected companies have been successfully pushed to CRM using SalesForce",
          icon: "success",
          showConfirmButton: true,
          timer: 2000,
          width: "25rem",
        });
        setSelectedExportPlaces([]);
        setSelectedPlaces([]);
        setPlacesIds([]);
        setIsLoading(false);
      })
      .catch((error: any) => {
        handleApiErrors(error?.response);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const PostGoHighLevelCRM = () => {
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    setIsLoading(true);
    axios
      .post(
        `${API_URL}/Integration/GoHighLevel/addContacts?userId=${uid}`,
        removePlaceId(
          SelectedPlaces?.map((s: any) => {
            return {
              firstName: s?.name,
              lastName: "",
              email: s?.email,
              phone: s?.phone,
              companyName: s?.name,
              postalCode: s?.address?.zipCode,
              country: s?.address?.country,
              city: s?.address?.city,
              state: s?.address?.state,
              address1: s?.address?.address1,
              address2: s?.address?.address2,
              website: s?.site,
              facebook: "",
              linkedin: "",
              tags: s?.types,
            };
          })
        ),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        Swal.fire({
          text: "The selected companies have been successfully pushed to CRM using GoHighLevel",
          icon: "success",
          showConfirmButton: true,
          timer: 2000,
          width: "25rem",
        });
        setSelectedExportPlaces([]);
        setSelectedPlaces([]);
        setPlacesIds([]);
        setIsLoading(false);
      })
      .catch((error: any) => {
        handleApiErrors(error?.response);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const togglePlaced = (id: number, Place: any) => {
    setPlacesIds((prevPlacesIds: any) => {
      if (prevPlacesIds.includes(id)) {
        // Remove id if it exists
        return prevPlacesIds.filter((toolId: any) => toolId !== id);
      } else {
        // Add id if it doesn't exist
        return [...prevPlacesIds, id];
      }
    });
    setSelectedPlaces((prevSelectedPlaces: any) => {
      // Check if the place_id exists in the previous state (SelectedPlaces array)
      const placeExists = prevSelectedPlaces.some(
        (selectedPlace: any) => selectedPlace.place_id === Place.place_id
      );
      if (placeExists) {
        // Remove the place if its place_id exists
        return prevSelectedPlaces.filter(
          (selectedPlace: any) => selectedPlace.place_id !== Place.place_id
        );
      } else {
        // Add the place if its place_id does not exist
        return [
          ...prevSelectedPlaces,
          {
            name: Place?.name,
            domain: Place?.domain,
            phone: Place?.phone,
            website: Place?.website,
            email: !!Place?.email === true ? Place?.email : "",
            address: Place?.address,
            numberOfEmployees: Place?.numberOfEmployees,
            revenue: Place?.revenue,
            place_id: Place?.place_id,
            facebook: Place?.facebook,
            linkedin: Place?.linkedin,
            ...Place,
          },
        ];
      }
    });
    setSelectedExportPlaces((prevSelectedPlaces: any) => {
      // Check if the place_id exists in the previous state (SelectedPlaces array)
      const placeExists = prevSelectedPlaces.some(
        (selectedPlace: any) => selectedPlace.place_id === Place.place_id
      );
      if (placeExists) {
        // Remove the place if its place_id exists
        return prevSelectedPlaces.filter(
          (selectedPlace: any) => selectedPlace.place_id !== Place.place_id
        );
      } else {
        // Add the place if its place_id does not exist
        return [...prevSelectedPlaces, Place];
      }
    });
  };
  const selectAllTools = () => {
    const allPlacesIds = data.results?.map((tool: any) => tool?.place_id);
    setPlacesIds((prevPlacesIds: any) => {
      // Combine previous IDs and new IDs, ensuring no duplicates
      const newPlacesIds = Array?.from(
        new Set([...prevPlacesIds, ...allPlacesIds])
      );
      return newPlacesIds;
    });
    const allPlaces = data.results?.map((tool: any) => ({
      name: tool?.name,
      domain: tool?.domain,
      phone: tool?.phone,
      website: tool?.website,
      address: tool?.address,
      email: !!tool?.email === true ? tool?.email : "",
      numberOfEmployees: tool?.numberOfEmployees,
      revenue: tool?.revenue,
      place_id: tool?.place_id,
      facebook: tool?.facebook,
      linkedin: tool?.linkedin,
    }));
    setSelectedPlaces((prevPlacesIds: any) => {
      // Combine previous IDs and new IDs, ensuring no duplicates
      const newPlacesIds = Array?.from(
        new Set([...prevPlacesIds, ...allPlaces])
      );
      return newPlacesIds;
    });
    const allPlacesExport = data.results?.map((tool: any) => tool);
    setSelectedExportPlaces((prevPlacesIds: any) => {
      // Combine previous IDs and new IDs, ensuring no duplicates
      const newPlacesIds = Array?.from(
        new Set([...prevPlacesIds, ...allPlacesExport])
      );
      return newPlacesIds;
    });
  };
  const areAllInactive = (items: any): boolean => {
    return items?.every((item: any) => !item.active);
  };
  const isActiveByTitle = (items: any, title: string): boolean => {
    const item = items?.find((item: any) => item.title === title);
    return item ? item.active : false;
  };
  const isPlaceIDSelected = (id: number): boolean => {
    return PlacesIds.includes(id);
  };
  useEffect(() => {
    const allIdsSelected =
      data?.results.length > 0 &&
      data?.results?.every((tool: any) => PlacesIds.includes(tool?.place_id));
    setAllSelected(allIdsSelected);
  }, [data, PlacesIds]);
  useEffect(() => {
    GetCheckConnect();
  }, []);
  useEffect(() => {
    // Check if we already have location data to avoid unnecessary prompts
    if (location?.lat && location?.lng) {
      return; // Skip geolocation request if we already have coordinates
    }

    if ("geolocation" in navigator) {
      // Request permission explicitly for macOS
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (
            permissionStatus.state === "granted" ||
            permissionStatus.state === "prompt"
          ) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
              },
              (error) => {
                console.error("Geolocation error:", error);
                setError(
                  `Location error: ${error.message}. Please check your browser settings and ensure location services are enabled for this site.`
                );
                
                // Use default location without showing the Swal dialog
                setLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco as default
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
              }
            );
          } else {
            setError(
              "Location permission denied. Using default location instead."
            );
            // Set default location when permission is denied
            setLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco as default
          }
        });
    } else {
      setError("Geolocation is not supported by this browser. Using default location.");
      // Set default location when geolocation is not supported
      setLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco as default
    }
  }, []);

  const getDetails = async (placeId: string) => {
    try {
      // Build the API URL based on whether we have a pageToken or not
      const apiUrl = `${urlApi}/places/getDetails?placeId=${placeId}`;

      const response = await axios.get(apiUrl);

      if (response?.data?.data) {
        const resultData = response?.data?.data;
        return resultData;
      }
    } catch (error) {
      console.error("🚀 ~ getDataApi ~ error:", error);
    }
  };
  // fetch api data
  const getDataApi = async (isViewMore: boolean | null = null) => {
    setLoading(true);
    const parsedData = JSON.parse(authData); // Convert JSON string to object
    const uid = parsedData?.uid; // Access the 'uid' property
    try {
      // Build the API URL based on whether we have a pageToken or not
      const apiUrl =
        `${urlApi}/places/getPlaces` +
        (!!data?.next_page_token && !!isViewMore
          ? `?pagetoken=${data?.next_page_token}`
          : `?uid=${uid}&latitude=${location?.lat}&longitude=${
              location?.lng
            }&search=${keyWord}&type=${type?.toLowerCase()}&country=${Country}&state=${StateRegion}&city=${CityArea}`);

      const response = await axios.get(apiUrl);
      console.log("response", response);
      if (
        response?.data?.data?.length === 0 ||
        !!response?.data?.data?.length === false
      ) {
        setLoading(false);
        if (response?.data?.status === "not-paid") {
          Swal.fire({
            title: "Subscription Required",
            text: "Please subscribe to continue using this feature",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Go to Billing",
            cancelButtonText: "Cancel",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/account/billing");
            }
          });
        } else {
          Swal.fire({
            title: "No results found",
            text: "Please try again with different search criteria",
            icon: "warning",
          });
        }
      } else if (response?.data?.data) {
        setData((prevData: any) => {
          // If it's a new request (no pageToken), replace the old data
          // If it's a paginated request (with pageToken), merge the new data with the old
          const newData =
            !!keyWord || (!!type && !isViewMore)
              ? response?.data?.data
              : response?.data?.data?.length === 0
              ? []
              : [...prevData?.results, ...response?.data?.data];
          return {
            next_page_token: response?.data?.data?.next_page_token,
            results: newData,
            html_attributions: "",
            message: response?.data?.data?.message ?? "",
          };
        });
      } else {
        return {
          next_page_token: response?.data?.data?.next_page_token,
          results: [],
          html_attributions: "",
          message: response?.data?.data?.message ?? "",
        };
      }
      setLoading(false);
    } catch (error) {
      console.error("🚀 ~ getDataApi ~ error:", error);
      setLoading(false);
    }
  };

  //Export data
  const getDataApiExport = async (list: any) => {
    try {
      if (list?.length > 0) {
        // Use Promise.all to resolve all promises returned by map
        const result = await Promise.all(
          list.map(async (s: any) => {
            const details = await getDetails(s?.place_id);
            s.formatted_phone_number = details?.result?.formatted_phone_number;
            s.url = details?.result?.url;
            return s;
          })
        );
        return result;
      } else {
        return [];
      }
    } catch (error) {
      console.error("🚀 ~ getDataApi ~ error:", error);
    }
  };
  const getPhotoUrl = async (photoReference: string, maxWidth: string) => {
    try {
      const response = await axios.get(
        `${urlApi}/places/getPhotoUrl?photo_reference=${photoReference}&maxwidth=${maxWidth}`
      );

      return response?.data?.photoUrl;
    } catch (error) {
      console.error("🚀 ~ pushDataToClay ~ error:", error);
    }
  };

  // useEffect(() => {
  //   setLoading(true);
  //   setTimeout(async () => {
  //     if (!!location?.lat && !!location?.lng) {
  //       await getDataApi(false);
  //     }
  //   }, 250);
  // }, [location]);
  useEffect(() => {
    if (isSearch) {
      console.log("location", location);
      setSelectedExportPlaces([]);
      setSelectedPlaces([]);
      setPlacesIds([]);
      setLoading(true);
      setTimeout(async () => {
        if (!!location?.lat && !!location?.lng) {
          await getDataApi(false);
        }
      }, 250);
    }
  }, [
    isSearch,
    keyWord,
    type,
    Country,
    StateRegion,
    CityArea,
    Rating,
    Reviews,
  ]);
  // Fetch photo URLs for all cafes in parallel
  useEffect(() => {
    const fetchPhotos = async () => {
      const photoFetches = data.results.map(async (cafe: any) => {
        const photoReference =
          cafe?.photos?.length > 0 ? cafe.photos[0].photo_reference : "";
        const photoUrl = await getPhotoUrl(photoReference, "400");
        return {
          [cafe.isNotUndefined]: !!photoUrl === true,
          [cafe.place_id]: !!photoUrl
            ? photoUrl
            : toAbsoluteUrl("media/gm-images/bannerV2.png"),
        }; // Return an object with the place_id as the key
      });

      // Wait for all the photo fetches to complete
      const photoData = await Promise.all(photoFetches);

      // Merge the fetched photo URLs into the state
      const photoMap = photoData.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );
      setPhotoUrls(photoMap);
    };

    fetchPhotos();
  }, [data.results]); // Runs whenever the cafe data changes

  function SkeletonLoader(className: string, element: any) {
    return loading ? <Skeleton className={className} width={120} /> : element;
  }
  return (
    <>
      <div className="row g-5 g-xl-8">
        <div className="d-flex flex-wrap flex-stack">
          <h3 className="fw-bold my-2">{data.results.length} business</h3>
          <div className="d-flex flex-wrap my-2">
            {SelectedPlaces?.length > 0 && (
              <button
                className="btn btn-sm btn-info me-5"
                onClick={(e) => {
                  e.preventDefault();

                  (SelectedPlaces ?? []).forEach((item: any) => {
                    if (item?.googleMapsUrl) {
                      // Create a hidden anchor element
                      const link = document.createElement("a");
                      link.href = item.googleMapsUrl;
                      link.target = "_blank";
                      link.rel = "noopener noreferrer";

                      // Append the anchor to the body (required for it to function in some browsers)
                      document.body.appendChild(link);

                      // Programmatically trigger a click on the anchor element
                      link.click();

                      // Remove the anchor element after the click to clean up
                      document.body.removeChild(link);
                    }
                  });
                }}
              >
                Open in new tab
              </button>
            )}
            <div className="form-check form-check-custom me-5">
              <input
                className="form-check-input cursor-pointer"
                type="checkbox"
                defaultValue={1}
                id="flexCheckDefault"
                onChange={(e) => {
                  if (e.target.checked === true) {
                    selectAllTools();
                  } else {
                    setPlacesIds([]);
                    setSelectedPlaces([]);
                  }
                }}
                checked={allSelected}
              />
              <label
                className="form-check-label text-gray-900 cursor-pointer"
                htmlFor="flexCheckDefault"
              >
                Select All/None
              </label>
            </div>
            <a
              href="#"
              className="d-flex align-items-center text-gray-900 text-hover-info me-5"
              onClick={async () => {
                if (SelectedPlaces.length === 0) {
                  // Show SweetAlert if no places are selected
                  Swal.fire({
                    title: "No Places Selected",
                    text: "You must select at least one place to export.",
                    icon: "warning",
                    confirmButtonText: "OK",
                  });
                } else {
                  setExportLoader(true);
                  var dataResult = SelectedExportPlaces.map((place: any) => ({
                    ...place,
                    address:
                      typeof place.address === "object"
                        ? JSON.stringify(place.address)
                        : place.address,
                    geometry:
                      typeof place.geometry === "object"
                        ? JSON.stringify(place.geometry)
                        : place.geometry,
                    opening_hours:
                      typeof place.opening_hours === "object"
                        ? JSON.stringify(place.opening_hours)
                        : place.opening_hours,
                    photos:
                      typeof place.photos === "object"
                        ? JSON.stringify(place.photos)
                        : place.photos,
                    plus_code:
                      typeof place.plus_code === "object"
                        ? JSON.stringify(place.plus_code)
                        : place.plus_code,
                  }));

                  // Convert dataResult to CSV format
                  const headers = Object.keys(dataResult[0] || {}).join(",");
                  const rows = dataResult.map((item: any) =>
                    Object.values(item)
                      .map((value) =>
                        value === null || value === undefined
                          ? ""
                          : String(value)
                      )
                      .join(",")
                  );
                  const csvContent = [headers, ...rows].join("\n");

                  // Get current date for the filename
                  const currentDate = new Date().toISOString().split("T")[0];
                  const fileName = `Locations_${currentDate}.csv`;

                  // Trigger CSV download
                  saveAs(
                    new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
                    fileName
                  );

                  setExportLoader(false);
                }
              }}
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
                // Extract the headers from the Headers array
                var dataResult = await getDataApiExport(data.results);

                const worksheetData = [
                  Headers.map((h) => h.label),
                  ...(dataResult ?? []).map((item: any) =>
                    Headers.map((h) => {
                      if (h.key === "isOpenNow") {
                        // Check if the key is for fullName
                        return item?.opening_hours?.open_now;
                      } else if (h.key === "longitude") {
                        return item?.geometry?.location?.lng; // Combine firstName and lastName
                      } else if (h.key === "latitude") {
                        return item?.geometry?.location?.lat; // Combine firstName and lastName
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
                const fileName = `Locations_${currentDate}.xlsx`;
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
                var dataResult = await getDataApiExport(data.results);

                const handleNull = (value: any) =>
                  value === null ? "" : value; // Function to replace null with empty string

                const exportData = (dataResult ?? []).map((item: any) => {
                  const exportItem: any = {};
                  Headers?.forEach((header: any) => {
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
                  Headers.map((h: any) => h.label).join(","), // Create the header row from labels
                  ...exportData?.map(
                    (item: any) =>
                      Headers?.map((h: any) => `"${item[h.label]}"`).join(",") // Map each item to CSV format, considering possible commas in data
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
                  Headers.forEach((header: any) => {
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
            {areAllInactive(CheckIntegrationConnect) === true ? (
              <span
                className="d-flex align-items-center text-gray-900 text-hover-info me-5 cursor-pointer"
                onClick={() => {
                  Swal.fire({
                    title: "Integration Required",
                    text: "You need to connect at least one integration to push data to CRM.",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Go to Connect",
                    cancelButtonText: "Cancel",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      navigate("/account/integrations");
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
            ) : (
              <NavDropdown
                id="nav-dropdown-white-example"
                className="dropdown-toggleV2 ms-3 me-3"
                title={
                  <span className="d-flex align-items-center text-gray-900 text-hover-info me-5">
                    <i className="ki-duotone ki-exit-down fs-4 me-1">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Push to CRM
                  </span>
                }
                menuVariant="white"
              >
                {isActiveByTitle(CheckIntegrationConnect, "HubSpot") ===
                  true && (
                  <NavDropdown.Item
                    eventKey="1"
                    onClick={() => {
                      if (SelectedPlaces?.length === 0) {
                        Swal.fire({
                          title: "No Places Selected",
                          text: "You must select at least one place to push to CRM.",
                          icon: "warning",
                          confirmButtonText: "OK",
                        });
                      } else {
                        PostHuSpotCRM();
                      }
                    }}
                  >
                    <img
                      src={toAbsoluteUrl("media/svg/brand-logos/hubspot.svg")}
                      className="w-20px me-2"
                      alt=""
                    />{" "}
                    HubSpot
                  </NavDropdown.Item>
                )}
                {isActiveByTitle(CheckIntegrationConnect, "SalesForce") ===
                  true && (
                  <NavDropdown.Item
                    eventKey="1"
                    onClick={() => {
                      if (SelectedPlaces.length === 0) {
                        Swal.fire({
                          title: "No Places Selected",
                          text: "You must select at least one place to push to CRM.",
                          icon: "warning",
                          confirmButtonText: "OK",
                        });
                      } else {
                        PostSalesForceCRM();
                      }
                    }}
                  >
                    <img
                      src={toAbsoluteUrl(
                        "media/svg/brand-logos/Salesforce.svg"
                      )}
                      className="w-25px "
                      alt=""
                    />{" "}
                    SalesForce
                  </NavDropdown.Item>
                )}

                {isActiveByTitle(CheckIntegrationConnect, "GoHighLevel") ===
                  true && (
                  <NavDropdown.Item
                    eventKey="1"
                    onClick={() => {
                      if (SelectedPlaces.length === 0) {
                        Swal.fire({
                          title: "No Places Selected",
                          text: "You must select at least one place to push to CRM.",
                          icon: "warning",
                          confirmButtonText: "OK",
                        });
                      } else {
                        PostGoHighLevelCRM();
                      }
                    }}
                  >
                    <img
                      src={toAbsoluteUrl(
                        "media/svg/brand-logos/Gohighlevel.svg"
                      )}
                      className="w-25px "
                      alt=""
                    />{" "}
                    GoHighLevel
                  </NavDropdown.Item>
                )}
              </NavDropdown>
            )}
          </div>
        </div>
        <div className="separator my-8"></div>
        <div className="row">
          {loading ? (
            [1, 2, 3, 4].map((cafe: any, index) => (
              <React.Fragment key={cafe?.place_id}>
                <div className="col-xl-6 col-lg-6 col-md-12 mb-xl-0 mb-lg-0 mb-md-10 mb-10">
                  <Link to={`#`} className="text-decoration-none">
                    <div className="row gx-9 h-100">
                      <div className="col-sm-6 mb-10 mb-sm-0">
                        {SkeletonLoader(
                          "w-300px bgi-no-repeat bgi-position-center bgi-size-cover card-rounded min-h-250px min-h-sm-140",
                          <div
                            className="bgi-no-repeat bgi-position-center bgi-size-cover card-rounded min-h-400px min-h-sm-100 h-100"
                            style={{
                              backgroundSize: "cover",
                              backgroundImage: `url('${
                                photoUrls[cafe.place_id] ||
                                "/path_to_placeholder_image.jpg"
                              }')`,
                            }}
                          ></div>
                        )}
                      </div>
                      <div className="col-sm-6">
                        <div className="d-flex flex-column h-100">
                          <div className="mb-7">
                            <div className="d-flex flex-stack">
                              <div className="flex-shrink-0 me-5">
                                {/* <span className="text-gray-500 fs-7 fw-bold me-2 d-block lh-1 pb-1">
                                                                Entire Business in Canada
                                                            </span> */}
                                {/* <img src={cafe?.icon} alt="logo"/> */}
                                {SkeletonLoader(
                                  "text-gray-800 fs-1 fw-bold",
                                  <span className="text-gray-800 fs-1 fw-bold">
                                    {cafe?.name}
                                  </span>
                                )}
                              </div>
                              <div className="form-check form-check-custom form-check-info cursor-pointer">
                                <input
                                  className="form-check-input "
                                  type="checkbox"
                                  id={`flexCheckDefault${index}`}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mb-6">
                            {SkeletonLoader(
                              "fw-semibold text-gray-600 fs-6 mb-8 d-block",
                              <span className="fw-semibold text-gray-600 fs-6 mb-8 d-block">
                                {cafe?.vicinity}
                              </span>
                            )}
                          </div>
                          <div className="d-flex flex-stack mt-auto bd-highlight">
                            {SkeletonLoader(
                              "text-gray-700 fw-semibold fs-6 me-1",
                              <div className="text-gray-700 fw-semibold fs-6 me-1">
                                {cafe?.rating ?? 0}
                                <i className="ki-duotone ki-star text-info ms-1 me-4"></i>
                                ({cafe?.user_ratings_total ?? 0} reviews)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                {(index + 1) % 2 === 0 && (
                  <div className="separator my-8"></div>
                )}
              </React.Fragment>
            ))
          ) : data.results.length > 0 ? (
            data.results.map((cafe: any, index) => (
              <React.Fragment key={cafe?.place_id}>
                <div className="col-xl-6 col-lg-6 col-md-12 mb-xl-0 mb-lg-0 mb-md-10 mb-10">
                  <div className="text-decoration-none">
                    <div className="row gx-9 h-100">
                      <div className="col-sm-6 mb-10 mb-sm-0">
                        <div
                          onClick={() => {
                            //  navigate(`/listings/details/${cafe.place_id}`, {
                            //    replace: true,
                            //  });
                            window.open(cafe?.googleMapsUrl, "_blank");
                          }}
                          className="bgi-no-repeat bgi-position-center bgi-size-cover card-rounded min-h-400px min-h-sm-100 h-100 cursor-pointer"
                          style={{
                            backgroundSize: "cover",
                            backgroundImage: `url('${
                              photoUrls[cafe.place_id] ||
                              "/path_to_placeholder_image.jpg"
                            }')`,
                          }}
                        ></div>
                      </div>
                      <div className="col-sm-6">
                        <div className="d-flex flex-column h-100">
                          <div className="mb-7">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                              <div className=" me-5">
                                {/* <span className="text-gray-500 fs-7 fw-bold me-2 d-block lh-1 pb-1">
                                                                Entire Business in Canada
                                                            </span> */}
                                {/* <img src={cafe?.icon} alt="logo"/> */}
                                {/* <Link
                                  to={`/listings/details/${cafe.place_id}`}
                                  className="text-gray-800 fs-1 fw-bold text-break"
                                >
                                  {cafe?.name}
                                </Link> */}
                                <span
                                  onClick={() => {
                                    window.open(cafe?.googleMapsUrl, "_blank");
                                  }}
                                  className="text-gray-800 fs-1 fw-bold text-break cursor-pointer"
                                >
                                  {cafe?.name}
                                </span>
                              </div>
                              <div className="form-check form-check-custom form-check-info mt-2 cursor-pointer">
                                <input
                                  className="form-check-input cursor-pointer"
                                  type="checkbox"
                                  checked={isPlaceIDSelected(cafe?.place_id)}
                                  onChange={() => {
                                    togglePlaced(cafe?.place_id, cafe);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mb-6">
                            <span className="fw-semibold text-gray-600 fs-6 mb-8 d-block">
                              {cafe?.vicinity}
                            </span>
                          </div>
                          <div className="d-flex flex-stack mt-auto bd-highlight">
                            <div className="text-gray-700 fw-semibold fs-6 me-1">
                              {cafe?.rating ?? 0}
                              <i className="ki-duotone ki-star text-info ms-1 me-4"></i>
                              ({cafe?.user_ratings_total ?? 0} reviews)
                            </div>
                            <a
                              href={`tel:${cafe?.phone}`}
                              className="d-flex align-items-center text-gray-900 opacity-75-hover fs-6 fw-semibold"
                            >
                              {cafe?.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {(index + 1) % 2 === 0 && (
                  <div className="separator my-8"></div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="justify-content-center  align-items-center center-content">
              <Row>
                <Col>
                  <img
                    alt="Logo"
                    src={toAbsoluteUrl("media/icons/Not-Found-Icon.svg")}
                    className="h-300px app-sidebar-logo-default"
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  {" "}
                  <h1 className=" mb-2">No Results Available</h1>
                </Col>
              </Row>
              <Row>
                <Col>
                  {data?.message ? (
                    <div className="text-danger fw-bold">{data?.message}</div>
                  ) : (
                    <Fragment>
                      <div className="text-muted">
                        It seems there are no businesses available in this
                        category or location
                      </div>
                      <div className="text-muted">
                        right now. Try exploring other categories or locations.
                      </div>
                    </Fragment>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </div>
        <Row>
          <div className="d-flex justify-content-center">
            {data.results.length > 0 &&
              (!loadingMore ? (
                <button
                  className="btn btn-sm btn-info"
                  disabled={!!data?.next_page_token === false}
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!!data?.next_page_token) {
                      setLoadingMore(true);
                      await getDataApi(true);
                      setLoadingMore(false);
                    }
                  }}
                >
                  View more
                </button>
              ) : (
                <Spinner animation="border" variant="primary" size="md" />
              ))}
          </div>
        </Row>
        <PushToCRM
          setShowCRM={setShowCRM}
          ShowCRM={ShowCRM}
          PlacesIds={PlacesIds}
        />
      </div>
      {IsLoading && <Loading />}
    </>
  );
};

export { ListingsWidget };
const SkeletonLoading = () => (
  <>
    {[1, 2, 3, 4, 5, 6].map((_, index) => (
      <React.Fragment key={index}>
        <div className="col-xl-6 col-lg-6 col-md-12">
          <div className="row gx-9 h-100">
            <div className="col-sm-6 mb-10 mb-sm-0">
              <div className="bgi-no-repeat bgi-position-center bgi-size-cover card-rounded min-h-400px min-h-sm-100 h-100 bg-light">
                <div className="skeleton-image"></div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="d-flex flex-column h-100">
                <div className="mb-7">
                  <div className="d-flex flex-stack">
                    <div className="flex-shrink-0 me-5">
                      <div className="skeleton-line skeleton-title"></div>
                      <div className="skeleton-line skeleton-subtitle"></div>
                    </div>
                    <div className="skeleton-checkbox"></div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="skeleton-line skeleton-address"></div>
                  <div className="skeleton-line skeleton-address"></div>
                </div>
                <div className="d-flex flex-stack mt-auto bd-highlight">
                  <div className="skeleton-line skeleton-rating"></div>
                  <div className="skeleton-line skeleton-phone"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {(index + 1) % 2 === 0 && <div className="separator my-8"></div>}
      </React.Fragment>
    ))}
  </>
);
