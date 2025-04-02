
import clsx from 'clsx'
import { useLayout } from '../../core'
import { DefaultTitle } from '../header/page-title/DefaultTitle'

const Toolbar1 = () => {
  const {classes} = useLayout()

  return (
    <>
      <div className='toolbar p-lg-5' id='kt_toolbar'>
        {/* begin::Container */}
        <div
          id='kt_toolbar_container'
          className={clsx(classes.toolbarContainer.join(' '), 'd-flex flex-stack')}
        >
          <DefaultTitle />

          
          {/* end::Actions */}
        </div>
        {/* end::Container */}
      </div>
    </>
  )
}

export { Toolbar1 }

