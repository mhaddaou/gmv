import { Modal } from "react-bootstrap";
import moment from "moment";

export function getFromatdate() {
  return "MM/DD/YYYY";
}

export function isOpenNowReturned(list: any) {
  // Get the current day index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDayIndex = new Date().getDay();

  // Get the current day's opening hours
  const currentDayOpeningHours = list[currentDayIndex];
  return !currentDayOpeningHours?.includes("Closed") ? "Open" : "Close";
}

export function ConvertToDateCurrentTimeZone(params: any) {
  if (params === null || params === "" || params === undefined) {
    return "";
  } else {
    //params = params.replace("GMT", "");

    let newDate = moment(params).format("YYYY/MM/DD HH:mm:ss [GMT]");
    let dateConverted = new Date(newDate).toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    return moment(dateConverted).format(`${getFromatdate()}, h:mm A`);
  }
}

export function ConvertToDateCurrentTimeZoneDate(params: any) {
  if (params === null || params === "" || params === undefined) {
    return "";
  } else {
    //params = params.replace("GMT", "");

    let newDate = moment(params).format("YYYY/MM/DD HH:mm:ss [GMT]");
    let dateConverted = new Date(newDate).toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    return moment(dateConverted).format(`${getFromatdate()}`);
  }
}

export function DynamicModal(props: any) {
  return (
    <Modal
      size={props?.size}
      show={props?.show}
      enforceFocus={false}
      className={props?.className ?? ""}
      onHide={() => {
        props.setShow(false);
      }}
    >
      {props?.child}
    </Modal>
  );
}
