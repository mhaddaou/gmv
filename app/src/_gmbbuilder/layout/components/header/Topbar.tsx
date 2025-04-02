
import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'
import { getUserFirebase } from '../../../../app/firebase/functions'
import { useAuth } from '../../../../app/modules/auth'
import { toAbsoluteUrl } from '../../../helpers'
import { HeaderUserMenu } from '../../../partials/layout/header-menus/HeaderUserMenu'


const toolbarButtonMarginClass = 'ms-1 ms-lg-3',
  toolbarUserAvatarHeightClass = 'symbol-30px symbol-md-40px'

const Topbar: FC = () => {

  const {currentUser, logout} = useAuth()
  const [dataUser, setdataUser] = useState<any>(null)
  async function getData(uid: string) {
    try {
      const res = await getUserFirebase(uid);
      setdataUser(res);
    } catch (err) { }
  }
  useEffect(() => {
    if (!!currentUser?.uid) {
      getData(currentUser?.uid);
    };
  }, [currentUser]);
  return (
    <div className="d-flex align-items-stretch flex-shrink-0">
      <div className="topbar d-flex align-items-stretch flex-shrink-0">

        {/* begin::User */}
        <div
          className={clsx(
            "d-flex align-items-center",
            toolbarButtonMarginClass
          )}
          id="kt_header_user_menu_toggle"
        >
          {/* begin::Toggle */}
          <span className="me-4 fw-bold fs-4">
            {dataUser?.firstName} {dataUser?.lastName}
          </span>
          <div
            className={clsx(
              "cursor-pointer symbol",
              toolbarUserAvatarHeightClass
            )}
            data-kt-menu-trigger="click"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom-end"
            data-kt-menu-flip="bottom"
          >
            <img
              className="h-30px w-30px rounded custom-object-fit-cover"
              src={
                !!dataUser?.profilePictureURL
                  ? dataUser?.profilePictureURL
                  : toAbsoluteUrl("media/avatars/blank.png")
              }
              alt="GMB Builder"
            />
          </div>
          <HeaderUserMenu />
          {/* end::Toggle */}
        </div>
        {/* end::User */}
      </div>
    </div>
  );
}

export { Topbar }

