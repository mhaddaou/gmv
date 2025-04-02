
import {FC, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {useAuth} from '../../../../app/modules/auth'
import {toAbsoluteUrl} from '../../../helpers'
import { getUserFirebase } from '../../../../app/firebase/functions'

const HeaderUserMenu: FC = () => {
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
    <div
      className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-info fw-semibold py-4 fs-6 w-300px"
      data-kt-menu="true"
    >
      <div className="menu-item px-3">
        <div className="menu-content d-flex align-items-center px-3">
          <div className="symbol symbol-50px me-5 ">
            <img
              alt="Logo"
              className='custom-object-fit-cover'
              src={
                !!dataUser?.profilePictureURL
                  ? dataUser?.profilePictureURL
                  : toAbsoluteUrl("media/avatars/blank.png")
              }
            />
          </div>

          <div className="d-flex flex-column">
            <div className="fw-bold d-flex align-items-center fs-5 text-break">
              {dataUser?.firstName} {dataUser?.lastName}
            </div>
            <a href="#" className="fw-semibold text-muted text-hover-info fs-7 text-break">
              {dataUser?.email}
            </a>
          </div>
        </div>
      </div>

      <div className="separator my-2"></div>

      <div className="menu-item px-5 my-1">
        <Link to="/account/settings" className="menu-link px-5">
          Account Settings
        </Link>
      </div>

      <div className="menu-item px-5">
        <a onClick={logout} className="menu-link px-5">
          Sign Out
        </a>
      </div>
    </div>
  );
}

export {HeaderUserMenu}
