
import { useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../_gmbbuilder/helpers'

const AuthLayout = () => {
  useEffect(() => {
    document.body.style.backgroundImage = `none`
    const root = document.getElementById('root')
    if (root) {
      root.style.height = '100%'
    }
    return () => {
      document.body.style.backgroundColor = `#fffff`
      if (root) {
        root.style.height = 'auto'
      }
    }
  }, [])

  return (
    <div className='d-flex flex-column flex-lg-row flex-column-fluid h-100'>
      {/* begin::Body */}
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1'>
        {/* begin::Form */}
        <div className='d-flex flex-center flex-column flex-lg-row-fluid'>
          {/* begin::Wrapper */}
          <div className='w-lg-500px p-7'>
            <Outlet />
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Form */}

        {/* begin::Footer */}
       
        {/* end::Footer */}
      </div>
      {/* end::Body */}

      {/* begin::Aside */}
      <div
        className='d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2'
        style={{ backgroundImage: `url(${toAbsoluteUrl('media/misc/auth-bg.png')})` }}
      >
        {/* begin::Content */}
        <div className='d-flex flex-column flex-center py-15 px-5 px-md-15 w-100'>
          {/* begin::Image */}
          <img
            className='mx-auto w-275px w-md-50 w-xl-200px mb-10 mb-lg-20'
            src={toAbsoluteUrl('media/logos/LogoWhite.svg')}
            alt=''
          />
          {/* end::Image */}

          {/* begin::Title */}
          <h1 className='text-white fs-2qx fw-bolder text-center mb-7'>
            Streamline Listings & CRM
          </h1>
          {/* end::Title */}

          {/* begin::Text */}
          <div className='text-white fs-base text-center'>
            Effortlessly manage your business listings and enhance CRM integration for seamless operations and improved connectivity.
          </div>
          {/* end::Text */}
        </div>
        {/* end::Content */}
      </div>
      {/* end::Aside */}
    </div>
  )
}

export { AuthLayout }
