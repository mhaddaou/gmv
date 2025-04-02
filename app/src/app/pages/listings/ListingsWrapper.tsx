import { PageTitle } from "../../../_gmbbuilder/layout/core";

import { useState } from "react";
import { Content } from "../../../_gmbbuilder/layout/components/Content";
import { ListingsWidget } from "../../../_gmbbuilder/partials/widgets";
import SearchWidget from "../../../_gmbbuilder/partials/widgets/listings/SearchWidget";

interface Props {
  setKeyWord: any;
  setIsSearch: any;
  setType: any;
  keyWord: string;
  isSearch: any;
  type: any;
  Country:any;
  setCountry:any;
  StateRegion:any;
  setStateRegion:any;
  CityArea:any;
  setCityArea:any;
  Rating:any;
  setRating:any;
  Reviews:any;
  setReviews:any;
}

const ListingsPage: React.FC<Props> = ({
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
}) => (
  <>
    <SearchWidget
      className="mb-5 mb-xl-0"
      setKeyWord={setKeyWord}
      setIsSearch={setIsSearch}
      keyWord={keyWord}
      isSearch={isSearch}
      type={type}
      setType={setType}
      Country={Country}
      setCountry={setCountry}
      StateRegion={StateRegion}
      setStateRegion={setStateRegion}
      CityArea={CityArea}
      setCityArea={setCityArea}
      Rating={Rating}
      setRating={setRating}
      Reviews={Reviews}
      setReviews={setReviews}
    />
    <Content>
     
        <ListingsWidget
          className="card-xl-stretch mb-5 mb-xl-8"
          keyWord={keyWord}
          isSearch={isSearch}
          type={type}
          Country={Country}
          setCountry={setCountry}
          StateRegion={StateRegion}
          setStateRegion={setStateRegion}
          CityArea={CityArea}
          setCityArea={setCityArea}
          Rating={Rating}
          setRating={setRating}
          Reviews={Reviews}
          setReviews={setReviews}
        />
    </Content>
  </>
);

const ListingsWrapper = () => {
  const [keyWord, setKeyWord] = useState("");
  const [type, setType] = useState("");
  const [Country, setCountry] = useState("");
  const [StateRegion, setStateRegion] = useState("");
  const [CityArea, setCityArea] = useState("");
  const [Rating, setRating] = useState("");
  const [Reviews, setReviews] = useState("");

  const [isSearch, setIsSearch] = useState(false);
  return (
    <>
      <PageTitle breadcrumbs={[]}>
        {"Business"}
      </PageTitle>
      <ListingsPage
        setKeyWord={setKeyWord}
        keyWord={keyWord}
        setIsSearch={setIsSearch}
        setType={setType}
        isSearch={isSearch}
        type={type}
        Country={Country}
        setCountry={setCountry}
        StateRegion={StateRegion}
        setStateRegion={setStateRegion}
        CityArea={CityArea}
        setCityArea={setCityArea}
        Rating={Rating}
        setRating={setRating}
        Reviews={Reviews}
        setReviews={setReviews}
      />
    </>
  );
};

export { ListingsWrapper };
