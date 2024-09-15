"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";

export interface Row {
  id: string;
  imageUrl: string;
  restaurant: null | Restaurant;
}

export interface Restaurant {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  stars?: number;
  reviews?: number;
  cuisine?: string;
  priceRange?: "$" | "$$" | "$$$" | "$$$$";
}

// to be used in the Restaurant Table
export interface RestaurantRow {
  id: string;
  imageUrl: string;
  restaurant: Restaurant;
}

export const restaurantColumnDef: ColumnDef<RestaurantRow>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: (props) => {
      return (
        <Dialog>
          <DialogTrigger className=" w-32 focus-visible:outline-none">
            <img
              src={props.getValue() as string}
              className="max-h-10 mx-auto rounded shadow-lg select-none"
              alt="Screenshot"
            />
          </DialogTrigger>
          <DialogContent className="2xl:max-w-7xl xl:max-w-5xl lg:max-w-3xl sm:max-w-[80vw] sm:max-h-[75vh] max-w-none w-full h-full flex flex-col">
            <DialogTitle>Image Preview</DialogTitle>
            <div className="flex flex-row w-full gap-4 min-h-0">
              <div className="grow bg-muted p-4 rounded-lg select-none flex items-center justify-center overflow-hidden">
                <img
                  src={props.getValue() as string}
                  className="rounded-lg shadow-lg max-h-full"
                  alt="Screenshot"
                />
              </div>
              <div className="flex flex-col w-96 overflow-y-auto overflow-x-hidden">
                <div>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum. Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit, sed do eiusmod tempor incididunt
                  ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                  quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                  ea commodo consequat. Duis aute irure dolor in reprehenderit
                  in voluptate velit esse cillum dolore eu fugiat nulla
                  pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                  in culpa qui officia deserunt mollit anim id est laborum.
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "restaurant.name",
    header: "Name",
  },
  {
    accessorKey: "restaurant.address",
    header: "Address",
  },
  {
    accessorKey: "restaurant.phone",
    header: "Phone",
  },
  {
    accessorKey: "restaurant.website",
    header: "Website",
  },
  {
    accessorKey: "restaurant.email",
    header: "Email",
  },
  {
    accessorKey: "restaurant.stars",
    header: "Stars",
  },
  {
    accessorKey: "restaurant.reviews",
    header: "Reviews",
  },
  {
    accessorKey: "restaurant.cuisine",
    header: "Cuisine",
  },
  {
    accessorKey: "restaurant.priceRange",
    header: "Price Range",
  },
];
