import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "./index.css";
import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useLocalStorage } from "usehooks-ts";
import { FeatureSchema, HistoryMapSchema, imageFeatures, imageSummarization } from "./services/groq.service";
import { ThemeToggle } from "./components/ThemeToggle";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";
import CategorySidebar from "./components/CategorySidebar"
import { DialogTitle } from "@radix-ui/react-dialog";
import { ImageTable } from "./components/ImageTable";
import { RustData } from "./rust-types";
import { v4 as uuidv4 } from "uuid";
import { Card } from "./components/ui/card";
import { Button } from "@/components/ui/button"
import { CurrentCategory, CurrentCategoryProvider, useCurrentCategory } from "./components/CategoryProvider";
import DynamicFeatureTable from "./components/DynamicFeatureTable";
import { InnerComp } from "./components/InnerComp";

interface Row {
  [key: string]: string
}

function App() {

  return (
    <CurrentCategoryProvider>
      <div className="flex h-full">
        {/* <ThemeToggle className="absolute top-1 right-1 z-10" /> */}
        <CategorySidebar/>
        <div className="flex flex-col h-full min-w-0 grow mx-20 pt-10 pb-10">
          <div className="overflow-y-auto min-h-0 grow">
            <InnerComp></InnerComp>
          </div>
        </div>
      </div>
    </CurrentCategoryProvider>

  );
}

export default App;
