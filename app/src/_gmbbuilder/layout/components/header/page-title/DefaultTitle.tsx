import { FC } from "react";
import { useLayout } from "../../../core/LayoutProvider";
import { usePageData } from "../../../core/PageData";

const DefaultTitle: FC = () => {
  const { pageTitle, pageDescription, pageBreadcrumbs } = usePageData();
  const { config, attributes } = useLayout();
  return (
    <div {...attributes.pageTitle} className="page-title d-flex flex-column">
      {/* begin::Title */}
      {pageTitle && (
        <h1 className="d-flex text-dark fw-bold my-1 fs-3">
          {pageTitle}
          {pageDescription &&
            config.pageTitle &&
            config.pageTitle.description && (
              <>
                <span className="h-20px border-gray-200 border-start ms-3 mx-2"></span>
                <small className="text-muted fs-7 fw-semibold my-1 ms-1">
                  {pageDescription}
                </small>
              </>
            )}
        </h1>
      )}
      {/* end::Title */}
    </div>
  );
};

export { DefaultTitle };

