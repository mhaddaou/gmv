
import {FC} from 'react'
import {useLayout} from '../core'

const Footer: FC = () => {
  const {classes} = useLayout()
  return (
    <>
    <div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
      <div
        className={`${classes.footerContainer} d-flex flex-column flex-md-row align-items-center justify-content-between`}
      >
        <div className="d-flex text-gray-900 order-2 order-md-1">
          <span className="text-muted fw-semibold me-2">
            {new Date().getFullYear()} &copy;
          </span>
          <p className="text-gray-800 ms-2">
            <b>GMB Builder</b>
            (Build Version <strong>{import.meta.env.VITE_APP_VERSION}</strong> /
            Build Date: <strong>{process.env.BUILD_DATE}</strong>)
          </p>
        </div>
        {/* <ul className="menu menu-gray-600 menu-hover-primary fw-semibold order-1">
          <li className="menu-item">
            <a
              href="#"
              target="_blank"
              className="menu-link ps-0 pe-2"
            >
              Terms & Condition
            </a>
          </li>
          <li className="menu-item">
            <a
              href="#"
              target="_blank"
              className="menu-link pe-0 pe-2"
            >
              Privacy Policy
            </a>
          </li>
        </ul> */}
      </div>
    </div>
  </>
  )
}

export {Footer}
