import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import map from "lodash/map";
import React from "react";
import { Link } from "react-router";
import type { Breadcrumb as BreadcrumbType } from "../app.types";

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: BreadcrumbType[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {map(breadcrumbs, (breadcrumb, index) => {
          let element = (
            <BreadcrumbPage className="text-xl font-extrabold tracking-tight text-balance">
              {breadcrumb.text}
            </BreadcrumbPage>
          );

          if (breadcrumb.link) {
            element = (
              <BreadcrumbLink asChild>
                <Link
                  to={breadcrumb.link}
                  className="text-xl font-extrabold tracking-tight text-balance"
                >
                  {breadcrumb.text}
                </Link>
              </BreadcrumbLink>
            );
          }

          return (
            <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className="hidden md:block">
                {element}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
