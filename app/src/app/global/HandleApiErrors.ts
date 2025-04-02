import Swal from "sweetalert2";

export const handleApiErrors = (object: any) => {
  if (object?.status === 500) {
    Swal.fire({
      text: object?.data?.message,
      icon: 'error',
      showConfirmButton: true,
      width: '25rem',
    })
  }
  if (object?.status === 411) {
    Swal.fire({
      text: object?.data?.message,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      showCancelButton: true,
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        window.open(object?.data?.link);
      }
    });
  }
  if (object?.status === 400 && object?.data?.message) {
    if(object?.data?.needToPay === true){
      Swal.fire({
        text: object?.data?.message,
        icon: "warning",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        showCancelButton: true,
      }).then(async (result: any) => {
        if (result.isConfirmed) {
          window.open(object?.data?.link);
        }
      });
    }else{
      Swal.fire({
        text: object?.data?.message,
        icon: 'error',
        showConfirmButton: true,
        width: '25rem',
      })
    }
  
  }
  if (object?.status === 403 && object?.data?.message) {
    Swal.fire({
      text: object?.data?.message,
      icon: 'error',
      showConfirmButton: true,
      width: '25rem',
    })
  }
  else if (object?.status === 402) {
    Swal.fire({
      title: "Info!",
      text: "You have to subscribe first!",
      icon: "info",
      confirmButtonText: "Ok",
    }).then((result) => {
      if (result.isConfirmed) {
        document.getElementById("BackToBilling")?.click()
      }
    });
  }
  else if (object?.status === 401) {
    if (object?.data?.message) {
      if (object?.data?.isAnalyticConnected === false) {
        Swal.fire({
          text: object?.data?.message,
          icon: 'info',
          showConfirmButton: true,
          width: '25rem',
        })
        setTimeout(() => {
          document.getElementById("to-analytics")?.click();
        }, 500);
      } else {
        Swal.fire({
          text: object?.data?.message,
          icon: 'error',
          showConfirmButton: true,
          width: '25rem',
        })
        document.getElementById("Log-out")?.click();
      }

    }
  } else if (object?.object?.status) {
    if (object?.data?.message) {
      Swal.fire({
        text: object?.data?.message,
        icon: 'error',
        showConfirmButton: true,
        width: '25rem',
      })
      document.getElementById("Log-out")?.click();
    }
  }
  else if (object?.status === 400) {
    if (!!object?.data?.errors === true) {
      Swal.fire({
        text: object?.data?.errors[0]?.description,
        icon: 'error',
        showConfirmButton: true,
        width: '25rem',
      })
    }
  } else if (object?.status === 404) {
    if (!!object?.data?.message === true) {
      Swal.fire({
        text: object?.data?.message,
        icon: 'error',
        showConfirmButton: true,
        width: '25rem',
      })
    }
  } else {
    if (object?.errors) {
      const errorField = Object.keys(object.errors)[0];
      const errorMessage = object.errors[errorField][0];
      Swal.fire({
        text: errorMessage,
        icon: 'error',
        showConfirmButton: true,
        width: '25rem',
      })
    }
    else if (object?.message) {
      Swal.fire({
        text: object?.message,
        icon: 'error',
        showConfirmButton: true,
        width: '25rem',
      })
    }
    else if (object?.title) {
      Swal.fire({
        text: object?.title,
        icon: 'error',
        showConfirmButton: true,
        width: '25rem',
      })
    }
  }

}