import React, { useEffect, useState } from "react";
import { placeCategories } from "./categories";
import ReactSelect from "react-select";
import { ReactSelectStyles2 } from "../../../../app/global/ReactSelectStyles";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Props = {
  className?: string;
  setKeyWord: any;
  keyWord: string;
  setIsSearch: any;
  setType: any;
  isSearch: any;
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

const SearchWidget: React.FC<Props> = ({
  className,
  setKeyWord,
  keyWord,
  isSearch,
  setIsSearch,
  setType,
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
  setReviews
}) => {
  const API_URL = import.meta.env.VITE_APP_NODE_API;
  const [showFilters, setShowFilters] = useState(false);
  const [countries, setCountries] = useState([]);
  const [States, setStates] = useState([]);
  const [Cities, setCities] = useState([]);
  const [Ratings, setRatings] = useState([]);
  const [ReviewsList, setReviewsList] = useState([]);
  const [TextNavigate, setTextNavigate] = useState("");
  const [Categories, setCategories] = useState([]);
  const navigate = useNavigate();
  function checkUrlForDetails() {
    return window.location.pathname.includes('/listings/details');
}

  const flattenedCategories = placeCategories.flatMap((category) =>
    category.types.map((type) => ({
      value: type,
      label: `${category.title}: ${type}`,
    }))
  );
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const GetCountries = () => {
/*     axios
      .get(
        `${API_URL}/countries`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        setCountries(response?.data?.countries)
      })
      .catch((error: any) => {
      })
      .finally(() => {
      }); */
  };
  const GetStates = (code: any) => {
    axios
      .get(
        `${API_URL}/states/${code}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        setStates(response?.data?.states)
      })
      .catch((error: any) => {
      })
      .finally(() => {
      });
  };
  const GetCity = (code: any) => {
    axios
      .get(
        `${API_URL}/cities/${Country}/${code}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        setCities(response?.data?.cities)
      })
      .catch((error: any) => {
      })
      .finally(() => {
      });
  };

  const GetCategories = () => {
/*     axios
      .get(
        `${API_URL}/categories`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response: any) => {
        setCategories(response?.data?.categories)
      })
      .catch((error: any) => {
      })
      .finally(() => {
      }); */
  };
  useEffect(() => {
    GetCountries()
    GetCategories()
  }, [])
  return (
    <>
      <div className={`container ${className}`}>
        <div className="input-group mb-3">
          <input
            type="search"
            className="form-control rounded-pill border-secondary"
            placeholder="Search by business name"
            aria-label="Search by business name"
            value={keyWord}
            onChange={(e) => {
              setIsSearch(false);
              setTextNavigate(e.target.value)
              setKeyWord(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !!keyWord) {
                // Handle the search action here
                console.log("Search triggered with Enter key:", keyWord);
                // Add your search logic here, for example:
                
                setIsSearch(true);  // Assuming this triggers the search result
              }
            }}
          />
          <button
            className="btn Gradient btn-icon rounded-pill ms-2"
            type="button"
            disabled={!!keyWord === false}
            onClick={(e) => {
              console.log(checkUrlForDetails(),keyWord)
              if(checkUrlForDetails() === true){
                navigate(`/listings?search=${TextNavigate}`);
              }else{
                e.preventDefault();
                setIsSearch(!isSearch);
              }
            }}
          >
            <i className="bi bi-search text-white"></i>
          </button>

          {/* <button
            className="btn btn-white rounded-pill shadow-sm border border-secondary ms-4"
            type="button"
            onClick={toggleFilters}
          >
            <i className="ki-duotone ki-filter">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>{" "}
            Filters
          </button> */}
        </div>

        {showFilters && (
          <div className="d-flex flex-wrap justify-content-center my-3">
            <ReactSelect
              placeholder="Countries"
              styles={ReactSelectStyles2}
              className="rounded-pill me-3 col-xl-2 col-lg-3 col-md-4 col-12 mt-5"
              options={countries?.map((s: any) => {
                return {
                  value: s,
                  label: s,
                };
              })}
              value={
                !!Country
                  ? {
                    label: Country,
                    value: Country,
                  }
                  : countries
                    ?.map((s: any) => {
                      return {
                        value: s,
                        label: s,
                      };
                    })
                    ?.find((s) => s.toString() === Country)
              }
              isClearable={true}
              onChange={async (e: any) => {
                setCountry(!!e?.value === true ? e.value : "");
                if (!!e?.value === true) {
                  GetStates(e.value); // Fetch states based on the selected country
                } else {
                  setCountry(""); // Clear country selection
                  setStateRegion(null); // Clear state selection when country is cleared
                  setStates([]); // Clear states dropdown options
                }
              }}
              name="country"
            />
            <ReactSelect
              placeholder="State/Region"
              styles={ReactSelectStyles2}
              className="rounded-pill me-3 col-xl-2 col-lg-3 col-md-4 col-12 mt-5"
              options={States?.map((s: any) => {
                return {
                  value: s?.code,
                  label: s?.name,
                };
              })}
              value={
                StateRegion
                  ? {
                    label: StateRegion?.name,
                    value: StateRegion?.code,
                  }
                  : null
              }
              isClearable={true}
              onChange={async (e: any) => {
                if (e) {
                  console.log(e);
                  setStateRegion({ name: e.label, value: e.value }); // Store state/region selection
                  await GetCity(e.label); // Fetch cities based on selected state/region
                } else {
                  setCityArea(null); // Reset city area when state is cleared
                  setStateRegion(null); // Reset state/region
                  setCities([]); // Clear cities list
                }
              }}
              name="state"
            />

            <ReactSelect
              placeholder="City/Area"
              styles={ReactSelectStyles2}
              className="rounded-pill me-3 col-xl-2 col-lg-3 col-md-4 col-12 mt-5"
              options={Cities?.map((s: any) => {
                return {
                  value: s,
                  label: s,
                };
              })}
              value={
                !!CityArea
                  ? {
                    label: CityArea,
                    value: CityArea,
                  }
                  : null
              }
              isClearable={true}
              onChange={async (e: any) => {
                setCityArea(!!e?.value === true ? e.value : "");
              }}
              name="city"
            />

            {/* <div className="btn-group me-4" role="group">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded-pill"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {!!type ? type : "Category"}
              </button>
              <ul
                className="dropdown-menu scroll-dropdown"
                style={{ zIndex: "9999" }}
              >
                {placeCategories.map((category: any) => (
                  <li key={category.title}>
                    <a className="dropdown-item fw-bold" href="#">
                      {category.title}
                    </a>
                    <ul className="dropdown-submenu">
                      {category.types.map((type: any) => (
                        <li key={type}>
                          <a
                            className="dropdown-item"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setType(type);
                              setIsSearch(true);
                            }}
                          >
                            {type}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div> */}
            <ReactSelect
              placeholder="City/Category"
              styles={ReactSelectStyles2}
              className="rounded-pill me-3 col-xl-2 col-lg-3 col-md-4 col-12 mt-5"
              options={Categories?.map((s: any) => {
                return {
                  value: s,
                  label: s,
                };
              })}
              value={
                !!type
                  ? {
                    label: type,
                    value: type,
                  }
                  : null
              }
              isClearable={true}
              onChange={async (e: any) => {
                setType(!!e?.value === true ? e.value : "");
              }}
              name="categoryType"
            />
            {/* <ReactSelect
              placeholder="Category"
              styles={ReactSelectStyles2}
              className="rounded-pill me-3  col-xl-2 col-lg-3 col-md-4 col-12 mt-5"
              options={flattenedCategories}
              value={
                type
                  ? { label: type, value: type }
                  : null
              }
              isClearable={true}
              onChange={(e: any) => setType(e ? e.value : null)}
              name="categoryType"
            /> */}
            {/* <ReactSelect
              placeholder="Rating"
              styles={ReactSelectStyles2}
              className="rounded-pill me-3 col-xl-2 col-lg-3 col-md-4 col-12 mt-5"
              options={Ratings?.map((s: any) => {
                return {
                  value: s,
                  label: s,
                };
              })}
              value={
                !!Rating
                  ? {
                    label: Rating,
                    value: Rating,
                  }
                  : Ratings
                    ?.map((s: any) => {
                      return {
                        value: s,
                        label: s,
                      };
                    })
                    ?.find(
                      (s) => s.toString() === Rating
                    )
              }
              isClearable={true}
              onChange={async (e: any) => {
                setRating(!!e?.value === true ? e.value : "")
              }}
              name="Ratings"
            /> */}
            {/* <ReactSelect
              placeholder="Reviews"
              styles={ReactSelectStyles2}
              className="rounded-pill me-3"
              options={ReviewsList?.map((s: any) => {
                return {
                  value: s,
                  label: s,
                };
              })}
              value={
                !!Reviews
                  ? {
                    label: Reviews,
                    value: Reviews,
                  }
                  : ReviewsList
                    ?.map((s: any) => {
                      return {
                        value: s,
                        label: s,
                      };
                    })
                    ?.find(
                      (s) => s.toString() === Reviews
                    )
              }
              isClearable={true}
              onChange={async (e: any) => {
                setReviews(!!e?.value === true ? e.value : "")
              }}
              name="Reviews"
            /> */}
          </div>
        )}
      </div>
      <div className="separator mb-8"></div>
    </>
  );
};

export default SearchWidget;
