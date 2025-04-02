import { useEffect } from 'react'

const Loading = () => {
    useEffect(() => {
        document.body.classList.add('modal-open')
        return () => {
            document.body.classList.remove('modal-open')
        }
    }, [])

    return (
        <>
            <div
                className='modal fade show d-block h-100 '
                id='kt_modal_add_user'
                role='dialog'
                tabIndex={-1}
                aria-modal='true'
            >
                <div className='modal-dialog modal-dialog-centered mw-350px'>
                    <div className='modal-content'>
                        <div className='modal-body scroll-y mx-5 mx-xl-5 my-7 text-center'>
                            <span className="text-dark-75 font-weight-bold fs-2 pb-3">Please wait...</span>
                            <div className="d-flex justify-content-center pt-3">
                                <div
                                    style={{ width: '3rem', height: '3rem', fontSize: '1.8rem !important' }}
                                    className="spinner-border text-success" role="status">
                                    <span
                                        style={{ fontSize: '1.8rem !important' }}
                                        className="sr-only">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='modal-backdrop fade show'></div>
        </>
    )
}

export { Loading }
